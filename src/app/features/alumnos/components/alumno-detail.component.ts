import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MODAL_DATA, MODAL_REF } from '@app/shared/components/modal-host/modal-host.service';
import { AlumnosService } from '../service/alumnos.service';
import { AlumnoReadDetailDto } from '../../../core/models';

@Component({
  standalone: true,
  selector: 'app-alumno-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './alumno-detail.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.98)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('120ms ease-in', style({ opacity: 0, transform: 'scale(0.98)' })),
      ]),
    ]),
  ],
})
export class AlumnoDetailComponent implements OnInit {
  @Input() alumnoId: number | null = null;
  @Input() open = true;
  @Output() closed = new EventEmitter<void>();

  alumno: AlumnoReadDetailDto | null = null;
  loading = false;

  // whether this component was rendered via route (has id param)
  // true when navigated directly to /alumnos/:id (no parent alumnos route outlet)
  get isRouted() {
    const parent = this.route.parent;
    // If we have a parent route whose path is 'alumnos', we're nested (modal)
    if (parent && parent.routeConfig && parent.routeConfig.path === 'alumnos') {
      return false;
    }
    return !!this.route.snapshot.paramMap.get('id');
  }

  constructor(
    private svc: AlumnosService,
    private route: ActivatedRoute,
    private router: Router,
    @Optional() @Inject(MODAL_DATA) private modalData?: any,
    @Optional() @Inject(MODAL_REF) private modalRef?: any
  ) {}

  ngOnInit(): void {
    // Prefer injected MODAL_DATA when available (hosted in modal); fallback to @Input or route param
    if (
      this.modalData &&
      this.modalData.alumnoId !== undefined &&
      this.modalData.alumnoId !== null
    ) {
      this.alumnoId = Number(this.modalData.alumnoId);
    }

    if (!this.alumnoId) {
      const id = Number(this.route.snapshot.paramMap.get('id')) || null;
      this.alumnoId = id;
    }

    if (this.alumnoId) this.load(this.alumnoId);
  }

  load(id: number) {
    this.loading = true;
    this.svc
      .getById(id)
      .subscribe({ next: (a) => (this.alumno = a), complete: () => (this.loading = false) });
  }

  close() {
    // if this component is a full page (top-level), navigate back; if nested under Alumnos, navigate to parent
    if (this.isRouted) {
      this.router.navigate(['../'], { relativeTo: this.route }).catch(() => {});
      return;
    }

    // otherwise emit closed for modal usage
    if (
      this.route.parent &&
      this.route.parent.routeConfig &&
      this.route.parent.routeConfig.path === 'alumnos'
    ) {
      // if nested, navigate up to clear the modal
      this.router.navigate(['./'], { relativeTo: this.route.parent }).catch(() => {});
      return;
    } else {
      if (this.modalRef) {
        this.modalRef.close({ closed: true });
      } else {
        this.closed.emit();
      }
    }
  }
}

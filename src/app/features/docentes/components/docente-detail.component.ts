import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  Inject,
  Optional,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MODAL_DATA, MODAL_REF } from '@app/shared/components/modal-host/modal-host.service';
import { ModalHostService } from '@app/shared/components/modal-host/modal-host.service';
import { DocentesService } from '../service/docentes.service';

@Component({
  standalone: true,
  selector: 'app-docente-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './docente-detail.component.html',
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
export class DocenteDetailComponent implements OnInit {
  @Input() docente?: any | null;
  @Input() docenteId: number | null = null;
  @Input() open = true;
  @Output() closed = new EventEmitter<void>();

  loading = false;

  private svc = inject(DocentesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private modalData = inject(MODAL_DATA, { optional: true });
  private modalRef = inject(MODAL_REF, { optional: true });
  private host = inject(ModalHostService);
  forwardedToHost = false;

  // used by template to detect rendering inside ModalHost
  get isHosted(): boolean {
    return !!this.modalRef;
  }

  // determine if this component is rendered as a top-level route (direct navigation)
  get isRouted() {
    const parent = this.route.parent;
    if (parent && parent.routeConfig && parent.routeConfig.path === 'docentes') {
      return false;
    }
    return !!this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    // prefer modal data if present
    if (
      this.modalData &&
      this.modalData.docenteId !== undefined &&
      this.modalData.docenteId !== null
    ) {
      this.docenteId = Number(this.modalData.docenteId);
    }

    // If this component is rendered as a nested route under '/docentes/:id'
    // and it is not already hosted via ModalHost, forward to the modal host
    // and navigate back to prevent inline rendering inside the router-outlet.
    if (
      !this.isHosted &&
      this.route.parent &&
      this.route.parent.routeConfig &&
      this.route.parent.routeConfig.path === 'docentes'
    ) {
      const idFromRoute = Number(this.route.snapshot.paramMap.get('id')) || null;
      const id = this.docenteId ?? idFromRoute;
      const ref = this.host.open({
        component: DocenteDetailComponent,
        data: { docenteId: id },
        title: 'Docente',
      });
      ref.afterClosed
        ?.then(() => {
          this.router.navigate(['../'], { relativeTo: this.route }).catch(() => {});
        })
        .catch(() => {});
      this.forwardedToHost = true;
      return;
    }

    if (!this.docente) {
      const idFromRoute = Number(this.route.snapshot.paramMap.get('id')) || null;
      const id = this.docenteId ?? idFromRoute;
      if (id && !this.forwardedToHost) this.load(Number(id));
    }
  }

  load(id: number) {
    this.loading = true;
    this.svc.getById(id).subscribe({
      next: (d) => (this.docente = d as any),
      error: (err) => {
        console.error('Failed to load docente', err);
      },
      complete: () => (this.loading = false),
    });
  }

  close() {
    if (this.isRouted) {
      this.router.navigate(['../'], { relativeTo: this.route }).catch(() => {});
      return;
    }

    // if nested under docentes route, navigate up to clear the modal
    if (
      this.route.parent &&
      this.route.parent.routeConfig &&
      this.route.parent.routeConfig.path === 'docentes'
    ) {
      this.router.navigate(['./'], { relativeTo: this.route.parent }).catch(() => {});
      return;
    }

    if (this.modalRef) {
      this.modalRef.close({ closed: true });
    } else {
      this.closed.emit();
    }
  }
}

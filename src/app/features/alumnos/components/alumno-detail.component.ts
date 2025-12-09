import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
  inject,
} from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MODAL_DATA, MODAL_REF } from '@app/shared/components/modal-host/modal-host.service';
import { ModalHostService } from '@app/shared/components/modal-host/modal-host.service';
import {
  FieldDef,
  GenericModalComponent,
} from '@app/shared/components/generic-modal/generic-modal.component';
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
  forwardedToHost = false;

  private host = inject(ModalHostService);

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

  // used by templates to detect whether this component is rendered inside ModalHost
  get isHosted(): boolean {
    return !!this.modalRef;
  }

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

    // If this component was activated as a nested route under '/alumnos/:id'
    // and it is not already hosted via ModalHost, forward the request to the
    // ModalHostService to open the modal version and immediately navigate back
    // so the router-outlet does not render the component inline.
    if (
      !this.isHosted &&
      this.route.parent &&
      this.route.parent.routeConfig &&
      this.route.parent.routeConfig.path === 'alumnos'
    ) {
      // load alumno data first, then open the generic modal with a schema
      if (!this.alumnoId) return;
      this.loading = true;
      this.svc.getById(this.alumnoId).subscribe({
        next: (a) => {
          this.alumno = a;
          // const schema: FieldDef[] = [
          //   { key: 'persona.nombres', label: 'Nombres', type: 'string' },
          //   { key: 'persona.apellidos', label: 'Apellidos', type: 'string' },
          //   { key: 'persona.documentoIdentidad', label: 'Documento', type: 'string' },
          //   { key: 'persona.fechaNacimiento', label: 'Fecha de Nacimiento', type: 'date' },
          //   { key: 'persona.sexo', label: 'Sexo', type: 'string' },
          //   { key: 'persona.ciudad', label: 'Ciudad', type: 'string' },
          //   { key: 'persona.direccion', label: 'Dirección', type: 'string' },
          //   { key: 'persona.email', label: 'Email', type: 'string' },
          //   { key: 'persona.numeroTelefono', label: 'Teléfono', type: 'string' },
          //   { key: 'activo', label: 'Activo', type: 'boolean' },
          //   // agrupamos matrícula y tutor como grupos colapsables
          //   {
          //     key: 'matriculaActual',
          //     label: 'Matricula',
          //     collapsible: true,
          //     collapsedByDefault: true,
          //     noDataText: 'No hay información de matrícula',
          //     children: [
          //       { key: 'nivel.nivelDescripcion', label: 'Nivel', type: 'string' },
          //       { key: 'nivel.gradoDescripcion', label: 'Grado', type: 'string' },
          //       { key: 'nivel.seccionDescripcion', label: 'Sección', type: 'string' },
          //     ],
          //   },
          //   {
          //     key: 'tutor',
          //     label: 'Apoderado / Tutor',
          //     collapsible: true,
          //     collapsedByDefault: false,
          //     noDataText: 'No hay información del tutor',
          //     children: [
          //       { key: 'nombres', label: 'Nombres', type: 'string' },
          //       { key: 'apellidos', label: 'Apellidos', type: 'string' },
          //       { key: 'email', label: 'Email', type: 'string' },
          //     ],
          //   },
          // ];

          const schema: FieldDef[] = [
            { key: 'persona.nombres', label: 'Nombres', type: 'string' },
            { key: 'persona.apellidos', label: 'Apellidos', type: 'string' },
            { key: 'persona.documentoIdentidad', label: 'Documento', type: 'string' },
            { key: 'persona.fechaNacimiento', label: 'Fecha de Nacimiento', type: 'date' },
            { key: 'persona.sexo', label: 'Sexo', type: 'string' },
            { key: 'persona.ciudad', label: 'Ciudad', type: 'string' },
            { key: 'persona.direccion', label: 'Dirección', type: 'string' },
            { key: 'persona.email', label: 'Email', type: 'string' },
            { key: 'persona.numeroTelefono', label: 'Teléfono', type: 'string' },
            { key: 'activo', label: 'Activo', type: 'boolean' },
            {
              key: 'matriculaActual',
              label: 'Matricula',
              collapsible: true,
              collapsedByDefault: true,
              noDataText: 'No hay información de matrícula',
              children: [
                { key: 'nivel.nivelDescripcion', label: 'Nivel', type: 'string' },
                { key: 'nivel.gradoDescripcion', label: 'Grado', type: 'string' },
                { key: 'nivel.seccionDescripcion', label: 'Sección', type: 'string' },
              ],
            },
            {
              key: 'tutor',
              label: 'Apoderado / Tutor',
              collapsible: true,
              collapsedByDefault: false,
              noDataText: 'No hay información del tutor',
              children: [
                { key: 'nombres', label: 'Nombres', type: 'string' },
                { key: 'apellidos', label: 'Apellidos', type: 'string' },
                { key: 'email', label: 'Email', type: 'string' },
              ],
            },
          ];

          const ref = this.host.open({
            component: GenericModalComponent,
            data: {
              schema,
              data: this.alumno,
              title: `Alumno-${this.alumnoId}: ${this.alumno?.persona.nombres} ${this.alumno?.persona.apellidos}`,
            },
          });

          ref.afterClosed
            ?.then(() => {
              this.router.navigate(['../'], { relativeTo: this.route }).catch(() => {});
            })
            .catch(() => {});

          this.forwardedToHost = true;
        },
        error: () => {},
        complete: () => (this.loading = false),
      });
      return;
    }

    if (this.alumnoId && !this.forwardedToHost) this.load(this.alumnoId);
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

import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { MatriculasService } from '../service/matriculas.service';
import { MatriculaCreateDto } from '../../../core/models/persona.model';
import { AlumnosService } from '../../alumnos/service/alumnos.service';
import { NivelesService } from '../../catalogos/niveles/service/niveles.service';
import { PeriodosService } from '../../catalogos/periodos/service/periodos.service';

@Component({
  standalone: true,
  selector: 'app-matricula-dialog',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './matricula-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatriculaDialogComponent implements OnInit {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<boolean>();
  @Input() alumnoId: number | null = null;

  loading = false;
  error = '';

  form: FormGroup;

  alumnos: any[] = [];
  niveles: any[] = [];
  periodos: any[] = [];
  // simple client-side filter terms for typeahead
  alumnoFilter = '';
  apoderadoFilter = '';

  @ViewChild('alumnoFilterInput') alumnoFilterInput?: ElementRef<HTMLInputElement>;
  @ViewChild('host') host?: ElementRef<HTMLElement>;

  get filteredAlumnos() {
    const q = (this.alumnoFilter || '').toString().trim().toLowerCase();
    if (!q) return this.alumnos;
    return this.alumnos.filter(
      (a) => `${a.nombres} ${a.apellidos}`.toLowerCase().includes(q) || `${a.id}` === q
    );
  }

  get filteredApoderados() {
    const q = (this.apoderadoFilter || '').toString().trim().toLowerCase();
    if (!q) return this.alumnos;
    return this.alumnos.filter(
      (a) => `${a.nombres} ${a.apellidos}`.toLowerCase().includes(q) || `${a.id}` === q
    );
  }

  constructor(
    private fb: FormBuilder,
    private svc: MatriculasService,
    private alumnosSvc: AlumnosService,
    private nivelesSvc: NivelesService,
    private periodosSvc: PeriodosService
  ) {
    this.form = this.fb.group({
      alumnoId: [null, Validators.required],
      nivelDetalleId: [null, Validators.required],
      periodoId: [null, Validators.required],
      apoderadoId: [null],
      situacion: [''],
      institucionProcedencia: [''],
      esRepetente: [false],
    });
  }

  ngOnInit(): void {
    // load lists for selects
    this.alumnosSvc.list(1, 200).subscribe((r) => (this.alumnos = r.items || []));
    this.nivelesSvc.list().subscribe((r) => (this.niveles = r || []));
    this.periodosSvc.list().subscribe((r) => (this.periodos = r || []));

    if (this.alumnoId != null) {
      this.form.patchValue({ alumnoId: this.alumnoId });
    }
  }

  ngAfterViewInit(): void {
    // autofocus the alumno filter input when the dialog mounts
    setTimeout(() => {
      try {
        this.alumnoFilterInput?.nativeElement.focus();
      } catch (e) {
        // ignore focus errors
      }
    });
  }

  close(ok: boolean) {
    this.openChange.emit(false);
    this.closed.emit(ok);
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      // focus the first invalid control for accessibility / UX
      this.focusFirstInvalid();
      return;
    }
    this.loading = true;
    this.error = '';
    const v = this.form.value as any;
    // normalize payload to match MatriculaCreateDto (required numeric ids must be numbers)
    const payload = {
      alumnoId: Number(v.alumnoId),
      nivelDetalleId: Number(v.nivelDetalleId),
      periodoId: Number(v.periodoId),
      apoderadoId: v.apoderadoId != null ? Number(v.apoderadoId) : undefined,
      situacion: v.situacion || null,
      institucionProcedencia: v.institucionProcedencia || null,
      esRepetente: !!v.esRepetente,
    } as MatriculaCreateDto;

    // client-side duplicate check: ask existing matriculas for this alumno
    this.svc.byAlumno(payload.alumnoId).subscribe((existing) => {
      const duplicate = (existing || []).some(
        (m) => m.nivelDetalleId === payload.nivelDetalleId && m.periodoId === payload.periodoId
      );
      if (duplicate) {
        this.loading = false;
        this.error = 'El alumno ya está matriculado en ese nivel y período.';
        return;
      }

      this.svc.create(payload).subscribe({
        next: () => {
          this.loading = false;
          this.close(true);
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || err?.message || 'Error al matricular';
        },
      });
    });
  }

  private focusFirstInvalid() {
    setTimeout(() => {
      try {
        const hostEl = this.host?.nativeElement || document;
        const invalid = hostEl.querySelector(
          '[formcontrolname].ng-invalid, .ng-invalid[formcontrolname]'
        ) as HTMLElement | null;
        if (invalid) {
          // try to focus the control itself or the first focusable child
          if (typeof (invalid as any).focus === 'function') {
            (invalid as any).focus();
            return;
          }
          const focusable = invalid.querySelector(
            'input,select,textarea,button'
          ) as HTMLElement | null;
          focusable?.focus();
        }
      } catch (e) {
        // ignore
      }
    });
  }
}

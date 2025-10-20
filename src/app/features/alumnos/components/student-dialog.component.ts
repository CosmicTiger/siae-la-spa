import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { AlumnosService } from '../service/alumnos.service';
import { AlumnoCreateWithAccountsDto, Sexo } from '../../../core/models';

@Component({
  standalone: true,
  selector: 'app-student-dialog',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDialogComponent implements OnDestroy {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<boolean>();

  loading = false;
  error = '';

  private fechaSub: Subscription | null = null;

  private fb = inject(FormBuilder);

  form = this.fb.group({
    // alumno persona
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    documentoIdentidad: [''],
    fechaNacimiento: ['', Validators.required],
    sexo: ['M' as Sexo, Validators.required],
    ciudad: [''],
    direccion: [''],
    numeroTelefono: [''],

    alumnoEmail: ['', [Validators.required, Validators.email]],
    alumnoPassword: ['', Validators.required],

    tutor: this.fb.group({
      nombres: [''],
      apellidos: [''],
      documentoIdentidad: [''],
      fechaNacimiento: [''],
      sexo: ['M' as Sexo],
      ciudad: [''],
      direccion: [''],
      numeroTelefono: [''],
      email: [''],
      password: [''],
      tipoParentesco: ['Tutor'],
    }),
  });

  constructor(private svc: AlumnosService) {
    // cross-field validator: tutor email should not be the same as alumnoEmail
    this.form.setValidators(this.tutorEmailDifferentValidator.bind(this));

    this.fechaSub = this.form.get('fechaNacimiento')!.valueChanges.subscribe((v) => {
      const edad = this.calcEdad(v);
      const menor = edad < 18;
      this.esMenor.set(menor);
      // validadores dinámicos del tutor
      const tg = this.form.get('tutor') as FormGroup;
      const reqs = menor ? [Validators.required] : [];
      [
        'nombres',
        'apellidos',
        'documentoIdentidad',
        'fechaNacimiento',
        'sexo',
        'email',
        'password',
      ].forEach((c) => {
        const ctrl = tg.get(c)!;
        ctrl.setValidators(reqs.concat(c === 'email' ? [Validators.email] : []));
        ctrl.updateValueAndValidity({ emitEvent: false });
      });
      // after adjusting child validators, update the tutor group and the whole form validity
      tg.updateValueAndValidity({ emitEvent: false });
      this.form.updateValueAndValidity();
    });
  }

  // validator ensures tutor email != alumnoEmail when tutor is present/required
  tutorEmailDifferentValidator(control: AbstractControl): ValidationErrors | null {
    const group = control as FormGroup;
    const alumnoEmail = group.get('alumnoEmail')?.value;
    const tutorEmail = group.get('tutor')?.get('email')?.value;
    if (tutorEmail && alumnoEmail && tutorEmail === alumnoEmail) {
      return { tutorSameAsAlumno: true };
    }
    return null;
  }

  // typed accessor for the tutor FormGroup so templates have a concrete FormGroup type
  get tutorForm(): FormGroup {
    return this.form.get('tutor') as FormGroup;
  }

  esMenor = signal(false);

  ngOnDestroy(): void {
    if (this.fechaSub) {
      this.fechaSub.unsubscribe();
      this.fechaSub = null;
    }
  }

  private calcEdad(dateStr?: string | null) {
    if (!dateStr) return 0;
    const d = new Date(dateStr),
      t = new Date();
    let y = t.getFullYear() - d.getFullYear();
    const m = t.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) y--;
    return y;
  }

  close(ok: boolean) {
    this.openChange.emit(false);
    this.closed.emit(ok);
  }

  submit() {
    // mark all as touched to show validation errors
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      // focus the first invalid control so the user can fix it quickly
      this.focusFirstInvalidControl();
      return;
    }
    this.loading = true;
    this.error = '';
    const v = this.form.value;

    const payload: AlumnoCreateWithAccountsDto = {
      alumnoPersona: {
        nombres: v.nombres!,
        apellidos: v.apellidos!,
        documentoIdentidad: v.documentoIdentidad || null,
        fechaNacimiento: new Date(v.fechaNacimiento!).toISOString(),
        sexo: v.sexo!,
        ciudad: v.ciudad || null,
        direccion: v.direccion || null,
        numeroTelefono: v.numeroTelefono || null,
      },
      alumnoEmail: v.alumnoEmail!,
      alumnoPassword: v.alumnoPassword!,
      tutor: this.esMenor()
        ? {
            nombres: v.tutor!.nombres!,
            apellidos: v.tutor!.apellidos!,
            documentoIdentidad: v.tutor!.documentoIdentidad || null,
            fechaNacimiento: v.tutor!.fechaNacimiento
              ? new Date(v.tutor!.fechaNacimiento!).toISOString()
              : '',
            sexo: v.tutor!.sexo!,
            ciudad: v.tutor!.ciudad || null,
            direccion: v.tutor!.direccion || null,
            numeroTelefono: v.tutor!.numeroTelefono || null,
            email: v.tutor!.email!,
            password: v.tutor!.password!,
            tipoParentesco: v.tutor!.tipoParentesco || 'Tutor',
          }
        : undefined,
    };

    this.svc.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.close(true);
      },
      error: (err) => {
        this.loading = false;
        console.error('Create alumno error', err);
        this.error = err?.error?.message || err?.message || 'Error al crear alumno';
      },
    });
  }

  // Find the first invalid form control inside this dialog and focus it.
  // Uses a container id that exists in the template to scope the query.
  private focusFirstInvalidControl() {
    // wait for the DOM to update classes after markAllAsTouched()
    setTimeout(() => {
      try {
        const container = document.getElementById('student-dialog-root');
        if (!container) return;
        // selectors: form controls with formControlName (input/select/textarea) that have the ng-invalid class
        const selector =
          'input.ng-invalid, select.ng-invalid, textarea.ng-invalid, [formControlName].ng-invalid';
        const first = container.querySelector(selector) as HTMLElement | null;
        if (first) {
          // if element is not focusable, give it a temporary tabindex
          const focusable =
            first.tabIndex >= 0 ||
            ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(first.tagName);
          if (!focusable) {
            first.setAttribute('tabindex', '-1');
            first.focus();
            // remove the temporary tabindex after focusing
            first.removeAttribute('tabindex');
          } else {
            (first as HTMLElement).focus();
          }
        }
      } catch (e) {
        // noop — focusing is best-effort
        console.warn('focusFirstInvalidControl failed', e);
      }
    }, 0);
  }
}

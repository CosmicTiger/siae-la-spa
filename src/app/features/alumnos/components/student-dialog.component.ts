import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
  OnDestroy,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
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
  // when provided, dialog acts in edit mode and will send an update instead of create
  @Input() initial: any | null = null;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<boolean>();

  loading = false;
  error = '';
  // flag indicating the dialog is in edit mode
  isEdit = false;

  private fechaSub: Subscription | null = null;
  private loadSub: Subscription | null = null;

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
      // When editing, we should not require the tutor password (leave it optional)
      // so compute validators per-control below.
      [
        'nombres',
        'apellidos',
        'documentoIdentidad',
        'fechaNacimiento',
        'sexo',
        'email',
        // 'password',
      ].forEach((c) => {
        const ctrl = tg.get(c)!;
        // For 'password' control, don't add required when editing
        const addReq = c !== 'password' || !this.isEdit;
        const validators = [] as any[];
        if (menor && addReq) validators.push(Validators.required);
        if (c === 'email') validators.push(Validators.email);
        ctrl.setValidators(validators);
        ctrl.updateValueAndValidity({ emitEvent: false });
      });
      // after adjusting child validators, update the tutor group and the whole form validity
      tg.updateValueAndValidity({ emitEvent: false });
      this.form.updateValueAndValidity();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open'] && this.open) {
      // when opened, if initial data provided, populate the form and adjust validators
      // set edit flag based on presence of initial
      this.isEdit = !!this.initial;

      // adjust validators according to mode (create vs edit)
      this.applyModeValidators();

      if (this.initial) {
        const id = (this.initial.alumnoId || (this.initial as any).id) as number | undefined;
        if (id) {
          this.loadForEdit(id);
        } else {
          // fallback to using whatever was provided
          this.patchFormForEdit(this.initial);
        }
      } else {
        // reset form for creation
        this.form.reset({ sexo: 'M', alumnoEmail: '', alumnoPassword: '' });
        this.esMenor.set(false);
        // ensure password required for create
        this.form.get('alumnoPassword')!.setValidators(Validators.required);
        this.form.get('alumnoPassword')!.updateValueAndValidity({ emitEvent: false });
        // re-apply mode validators to ensure defaults are correct for create
        this.applyModeValidators();
      }
    }
  }

  private loadForEdit(id: number) {
    // cancel existing load
    if (this.loadSub) {
      this.loadSub.unsubscribe();
      this.loadSub = null;
    }
    this.loading = true;
    this.loadSub = this.svc.getById(id).subscribe({
      next: (data) => {
        this.loading = false;
        if (!data) return;
        // patch main persona fields
        const p = data.persona || {};
        this.form.patchValue({
          nombres: p.nombres || '',
          apellidos: p.apellidos || '',
          documentoIdentidad: p.documentoIdentidad || '',
          fechaNacimiento: p.fechaNacimiento
            ? new Date(p.fechaNacimiento).toISOString().slice(0, 10)
            : '',
          sexo: (p.sexo as any) || 'M',
          ciudad: p.ciudad || '',
          direccion: p.direccion || '',
          numeroTelefono: p.numeroTelefono || '',
          alumnoEmail: p.email || '',
          alumnoPassword: '',
        });

        // patch tutor subgroup if present (populate all available fields)
        if (data.tutor) {
          const tg = this.form.get('tutor') as FormGroup;
          tg.patchValue({
            nombres: data.tutor.nombres || '',
            apellidos: data.tutor.apellidos || '',
            documentoIdentidad: data.tutor.documentoIdentidad || '',
            fechaNacimiento: (data.tutor as any).fechaNacimiento
              ? new Date((data.tutor as any).fechaNacimiento).toISOString().slice(0, 10)
              : '',
            sexo: (data.tutor as any).sexo || 'M',
            ciudad: (data.tutor as any).ciudad || '',
            direccion: (data.tutor as any).direccion || '',
            numeroTelefono: data.tutor.numeroTelefono || '',
            email: data.tutor.email || '',
            password: '',
            tipoParentesco: (data.tutor as any).tipoParentesco || 'Tutor',
          });
          // If editing, make tutor.password optional
          if (this.isEdit) {
            const pw = tg.get('password');
            if (pw) {
              pw.clearValidators();
              pw.updateValueAndValidity({ emitEvent: false });
            }
          }
          tg.updateValueAndValidity({ emitEvent: false });
        }

        // set esMenor based on fechaNacimiento
        const edad = this.calcEdad(this.form.get('fechaNacimiento')!.value);
        const menor = edad < 18;
        this.esMenor.set(menor);

        // when editing, password is optional
        this.form.get('alumnoPassword')!.clearValidators();
        this.form.get('alumnoPassword')!.updateValueAndValidity({ emitEvent: false });
        // ensure validators reflect edit mode (documento, ciudad required etc.)
        this.applyModeValidators();
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to load alumno detail for edit', err);
      },
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
    if (this.loadSub) {
      this.loadSub.unsubscribe();
      this.loadSub = null;
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
    // reset edit flag when closing
    this.isEdit = false;
    this.openChange.emit(false);
    this.closed.emit(ok);
  }

  get title(): string {
    if (this.isEdit) {
      const n = this.form.get('nombres')?.value || '';
      const a = this.form.get('apellidos')?.value || '';
      const name = `${n} ${a}`.trim();
      return name ? `Actualizar Alumno: ${name}` : 'Actualizar Alumno';
    }
    return 'Nuevo Alumno';
  }

  get submitLabel(): string {
    return this.isEdit ? 'Aceptar' : 'Crear';
  }

  /**
   * Apply validators depending on mode.
   * For edit mode, only these main fields are required:
   * nombres, apellidos, documentoIdentidad, fechaNacimiento, sexo, ciudad, alumnoEmail
   */
  private applyModeValidators() {
    if (this.isEdit) {
      this.form.get('nombres')!.setValidators(Validators.required);
      this.form.get('apellidos')!.setValidators(Validators.required);
      this.form.get('documentoIdentidad')!.setValidators(Validators.required);
      this.form.get('fechaNacimiento')!.setValidators(Validators.required);
      this.form.get('sexo')!.setValidators(Validators.required);
      this.form.get('ciudad')!.setValidators(Validators.required);
      this.form.get('alumnoEmail')!.setValidators([Validators.required, Validators.email]);
      // password optional in edit
      this.form.get('alumnoPassword')!.clearValidators();
    } else {
      // create mode: enforce original rules (documento and ciudad optional)
      this.form.get('nombres')!.setValidators(Validators.required);
      this.form.get('apellidos')!.setValidators(Validators.required);
      this.form.get('documentoIdentidad')!.clearValidators();
      this.form.get('fechaNacimiento')!.setValidators(Validators.required);
      this.form.get('sexo')!.setValidators(Validators.required);
      this.form.get('ciudad')!.clearValidators();
      this.form.get('alumnoEmail')!.setValidators([Validators.required, Validators.email]);
      this.form.get('alumnoPassword')!.setValidators(Validators.required);
    }

    // update validity for affected controls
    [
      'nombres',
      'apellidos',
      'documentoIdentidad',
      'fechaNacimiento',
      'sexo',
      'ciudad',
      'alumnoEmail',
      'alumnoPassword',
    ].forEach((k) => {
      const ctrl = this.form.get(k);
      if (ctrl) ctrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  submit() {
    // For create mode mark all controls as touched so user sees validation errors.
    // For edit mode, only mark controls that the user changed (dirty) to avoid
    // showing errors for untouched fields loaded from the server.
    if (this.isEdit) {
      const markDirtyTouched = (group: FormGroup) => {
        Object.keys(group.controls).forEach((key) => {
          const ctrl = group.get(key)!;
          if (ctrl instanceof FormGroup) {
            markDirtyTouched(ctrl as FormGroup);
          } else {
            if (ctrl.dirty) ctrl.markAsTouched();
          }
        });
      };
      markDirtyTouched(this.form);
    } else {
      this.form.markAllAsTouched();
    }

    if (this.form.invalid) {
      // focus the first invalid control so the user can fix it quickly
      this.focusFirstInvalidControl();
      return;
    }
    this.loading = true;
    this.error = '';

    // build payload for create/update
    const v = this.form.value;

    const payload: AlumnoCreateWithAccountsDto | any = {
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

    // If we have initial with alumnoId, perform update instead of create
    if (this.initial && (this.initial.alumnoId || this.initial.id)) {
      const id = this.initial.alumnoId || this.initial.id;
      // for update, don't send empty password
      if (!payload.alumnoPassword) delete payload.alumnoPassword;
      this.svc.update(id, payload).subscribe({
        next: () => {
          this.loading = false;
          this.close(true);
        },
        error: (err) => {
          this.loading = false;
          console.error('Update alumno error', err);
          this.error = err?.error?.message || err?.message || 'Error al actualizar alumno';
        },
      });
      return;
    }

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

  private patchFormForEdit(initial: any) {
    try {
      const p = initial.persona || initial;
      this.form.patchValue({
        nombres: p.nombres || '',
        apellidos: p.apellidos || '',
        documentoIdentidad: p.documentoIdentidad || '',
        fechaNacimiento: p.fechaNacimiento
          ? new Date(p.fechaNacimiento).toISOString().slice(0, 10)
          : '',
        sexo: (p.sexo as any) || 'M',
        ciudad: p.ciudad || '',
        direccion: p.direccion || '',
        numeroTelefono: p.numeroTelefono || '',
        alumnoEmail: initial.email || initial.alumnoEmail || '',
        alumnoPassword: '',
      });

      // not requiring password on edit
      this.form.get('alumnoPassword')!.clearValidators();
      this.form.get('alumnoPassword')!.updateValueAndValidity({ emitEvent: false });
      // TODO: patch tutor fields if present
    } catch (e) {
      console.warn('patchFormForEdit failed', e);
    }
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

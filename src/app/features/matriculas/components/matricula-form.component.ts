import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatriculaService } from '../service/matricula.service';

@Component({
  standalone: true,
  selector: 'app-matricula-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-4">
      <div class="mb-2">
        <label class="block font-semibold">Documento / DNI</label>
        <input formControlName="documento" class="input input-bordered w-full" />
        <div
          *ngIf="form.controls.documento.invalid && form.controls.documento.touched"
          class="text-sm text-red-500"
        >
          Requerido
        </div>
      </div>

      <div class="mb-2">
        <label class="block font-semibold">Nombres</label>
        <input formControlName="nombres" class="input input-bordered w-full" />
        <div
          *ngIf="form.controls.nombres.invalid && form.controls.nombres.touched"
          class="text-sm text-red-500"
        >
          Requerido
        </div>
      </div>

      <div class="mb-2">
        <label class="block font-semibold">Curso</label>
        <input formControlName="cursoId" type="number" class="input input-bordered w-full" />
      </div>

      <div class="mb-4">
        <label class="block font-semibold">Periodo</label>
        <input formControlName="periodoId" type="number" class="input input-bordered w-full" />
      </div>

      <div class="flex items-center gap-2">
        <button class="btn btn-primary" type="submit" [disabled]="loading">Registrar</button>
        <button class="btn" type="button" (click)="reset()">Limpiar</button>
      </div>

      <div *ngIf="error" class="mt-3 text-sm text-red-500">{{ error }}</div>
      <div *ngIf="success" class="mt-3 text-sm text-green-500">{{ success }}</div>
    </form>
  `,
})
export class MatriculaFormComponent {
  private fb = inject(FormBuilder);
  private svc = inject(MatriculaService);

  form = this.fb.group({
    documento: ['', Validators.required],
    nombres: ['', Validators.required],
    cursoId: [null, Validators.required],
    periodoId: [null, Validators.required],
  });

  loading = false;
  error: string | null = null;
  success: string | null = null;

  reset() {
    this.form.reset();
    this.error = this.success = null;
  }

  onSubmit() {
    this.error = this.success = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const cursoId = Number(val.cursoId);
    const periodoId = Number(val.periodoId);
    this.loading = true;

    // First, check vacantes
    this.svc.obtenerCantidadVacantes(cursoId, periodoId).subscribe({
      next: (vacantes) => {
        if (vacantes == null || vacantes <= 0) {
          this.error = 'No hay vacantes disponibles para el curso/periodo seleccionado.';
          this.loading = false;
          return;
        }

        // Check duplicates (simple check by listing same documento/curso/periodo)
        this.svc.listar(1, 1, { documento: val.documento, cursoId, periodoId }).subscribe({
          next: (res) => {
            const exists = (res && res.items && res.items.length > 0) || false;
            if (exists) {
              this.error = 'El alumno ya está matriculado en ese curso/periodo.';
              this.loading = false;
              return;
            }

            // proceed to register
            this.svc.registrar(val).subscribe({
              next: () => {
                this.success = 'Matrícula registrada correctamente.';
                this.loading = false;
                this.form.reset();
              },
              error: (err) => {
                this.error = 'Error registrando matrícula.';
                console.error(err);
                this.loading = false;
              },
            });
          },
          error: (err) => {
            this.error = 'Error verificando matrícula existente.';
            console.error(err);
            this.loading = false;
          },
        });
      },
      error: (err) => {
        this.error = 'No se pudo comprobar vacantes.';
        console.error(err);
        this.loading = false;
      },
    });
  }
}

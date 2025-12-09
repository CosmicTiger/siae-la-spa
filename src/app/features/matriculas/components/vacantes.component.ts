import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatriculaService } from '../service/matricula.service';

@Component({
  standalone: true,
  selector: 'app-vacantes',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 max-w-sm">
      <h3 class="text-lg font-semibold mb-3">Consulta de Vacantes</h3>
      <div class="mb-2">
        <label class="block">Curso Id</label>
        <input [(ngModel)]="cursoId" class="input input-bordered w-full" />
      </div>
      <div class="mb-2">
        <label class="block">Periodo Id</label>
        <input [(ngModel)]="periodoId" class="input input-bordered w-full" />
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary" (click)="check()" [disabled]="loading">Consultar</button>
        <button class="btn" (click)="clear()">Limpiar</button>
      </div>

      <div *ngIf="loading" class="mt-2">Consultando...</div>
      <div *ngIf="vacantes !== null && !loading" class="mt-2">
        Vacantes disponibles: <strong>{{ vacantes }}</strong>
      </div>
      <div *ngIf="error" class="mt-2 text-red-500">{{ error }}</div>
    </div>
  `,
})
export class VacantesComponent {
  private svc = inject(MatriculaService);
  cursoId: number | null = null;
  periodoId: number | null = null;
  vacantes: number | null = null;
  loading = false;
  error: string | null = null;

  check() {
    this.error = null;
    this.vacantes = null;
    if (!this.cursoId || !this.periodoId) {
      this.error = 'Indica curso y periodo.';
      return;
    }
    this.loading = true;
    this.svc.obtenerCantidadVacantes(this.cursoId, this.periodoId).subscribe({
      next: (v) => (this.vacantes = v),
      error: (e) => {
        console.error(e);
        this.error = 'Error consultando vacantes.';
      },
      complete: () => (this.loading = false),
    });
  }

  clear() {
    this.cursoId = null;
    this.periodoId = null;
    this.vacantes = null;
    this.error = null;
  }
}

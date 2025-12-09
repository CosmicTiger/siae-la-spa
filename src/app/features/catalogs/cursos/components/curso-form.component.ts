import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CursoService } from '../service/curso.service';

@Component({
  standalone: true,
  selector: 'app-curso-form',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 max-w-md">
      <h3 class="text-lg font-semibold mb-3">Curso</h3>
      <label class="block">Nombre</label>
      <input [(ngModel)]="model.nombre" class="input input-bordered w-full mb-2" />
      <label class="block">Descripción</label>
      <input [(ngModel)]="model.descripcion" class="input input-bordered w-full mb-2" />
      <div class="flex gap-2">
        <button class="btn btn-primary" (click)="save()">Guardar</button>
        <button class="btn" (click)="reset()">Limpiar</button>
      </div>
      <div *ngIf="error" class="mt-2 text-red-500">{{ error }}</div>
    </div>
  `,
})
export class CursoFormComponent {
  private svc = inject(CursoService);
  @Input() model: any = {};
  error: string | null = null;

  save() {
    this.error = null;
    if (this.model.id)
      this.svc
        .update(this.model.id, this.model)
        .subscribe({ next: () => {}, error: (e) => (this.error = 'Error') });
    else
      this.svc
        .create(this.model)
        .subscribe({ next: () => (this.model = {}), error: (e) => (this.error = 'Error') });
  }

  reset() {
    this.model = {};
  }
}

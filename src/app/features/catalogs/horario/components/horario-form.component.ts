import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HorarioService } from '../service/horario.service';

@Component({
  standalone: true,
  selector: 'app-horario-form',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 max-w-md">
      <h3 class="text-lg font-semibold mb-3">Horario</h3>
      <label class="block">Día</label>
      <input [(ngModel)]="model.dia" class="input input-bordered w-full mb-2" />
      <label class="block">Hora</label>
      <input [(ngModel)]="model.hora" class="input input-bordered w-full mb-2" />
      <div class="flex gap-2">
        <button class="btn btn-primary" (click)="save()">Guardar</button>
        <button class="btn" (click)="reset()">Limpiar</button>
      </div>
      <div *ngIf="error" class="mt-2 text-red-500">{{ error }}</div>
    </div>
  `,
})
export class HorarioFormComponent {
  private svc = inject(HorarioService);
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

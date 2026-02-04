import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HorarioService } from '../service/horario.service';

@Component({
  standalone: true,
  selector: 'app-horario-form',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 max-w-xl">
      <h3 class="text-lg font-semibold mb-3">Horario</h3>
      <label class="block text-sm">Curso / Grado / Nivel</label>
      <select class="select select-bordered w-full mb-2" [(ngModel)]="model.nivelDetalleCursoId">
        <option [ngValue]="null">Selecciona una asignación</option>
        <option *ngFor="let opt of cursoOptions" [ngValue]="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <label class="block text-sm">Día de semana</label>
      <select class="select select-bordered w-full mb-2" [(ngModel)]="model.diaSemana">
        <option [ngValue]="null">Selecciona un día</option>
        <option *ngFor="let d of dias" [ngValue]="d.value">{{ d.label }}</option>
      </select>
      <label class="block text-sm">Hora inicio</label>
      <input
        type="time"
        [(ngModel)]="model.horaInicio"
        min="07:00"
        max="18:00"
        class="input input-bordered w-full mb-2"
      />
      <label class="block text-sm">Hora fin</label>
      <input
        type="time"
        [(ngModel)]="model.horaFin"
        min="07:00"
        max="18:00"
        class="input input-bordered w-full mb-2"
      />
      <div class="flex gap-2">
        <button class="btn btn-primary" (click)="save()">Guardar</button>
        <button class="btn" (click)="reset()">Limpiar</button>
        <button class="btn btn-ghost" (click)="cancel()" *ngIf="model?.id">Cancelar</button>
      </div>
      <div *ngIf="error" class="mt-2 text-red-500">{{ error }}</div>
    </div>
  `,
})
export class HorarioFormComponent {
  private svc = inject(HorarioService);
  @Input() model: any = {};
  @Input() cursoOptions: { value: number; label: string }[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cleared = new EventEmitter<void>();
  error: string | null = null;
  dias = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
  ];

  save() {
    this.error = null;
    if (!this.model.nivelDetalleCursoId) {
      this.error = 'Selecciona un curso.';
      return;
    }
    if (!this.model.diaSemana) {
      this.error = 'Selecciona un día.';
      return;
    }
    if (!this.model.horaInicio || !this.model.horaFin) {
      this.error = 'Indica hora inicio y hora fin.';
      return;
    }
    if (!this.isHoraFinAfterInicio(this.model.horaInicio, this.model.horaFin)) {
      this.error = 'La hora fin debe ser mayor a la hora inicio.';
      return;
    }
    const payload = {
      nivelDetalleCursoId: Number(this.model.nivelDetalleCursoId),
      diaSemana: this.model.diaSemana ?? null,
      horaInicio: this.formatHora(this.model.horaInicio),
      horaFin: this.formatHora(this.model.horaFin),
    };

    if (this.model.id)
      this.svc.update(this.model.id, payload).subscribe({
        next: () => this.saved.emit(),
        error: () => (this.error = 'Error'),
      });
    else
      this.svc.create(payload).subscribe({
        next: () => {
          this.reset();
          this.saved.emit();
        },
        error: () => (this.error = 'Error'),
      });
  }

  reset() {
    this.model = {};
    this.cleared.emit();
  }

  cancel() {
    this.reset();
  }

  private formatHora(value: any) {
    if (!value) return null;
    const str = String(value);
    if (str.length === 5) return `${str}:00`;
    return str;
  }

  private isHoraFinAfterInicio(inicio: string, fin: string) {
    const start = this.toMinutes(inicio);
    const end = this.toMinutes(fin);
    if (start == null || end == null) return false;
    return end > start;
  }

  private toMinutes(value: string) {
    const parts = value.split(':').map((p) => Number(p));
    if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return null;
    const [h, m] = parts;
    return h * 60 + m;
  }
}

import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalificacionService } from '../service/calificacion.service';

@Component({
  standalone: true,
  selector: 'app-calificacion-editor',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-3">Editor de Calificaciones</h3>

      <div class="mb-3">
        <label class="block">Docente Id</label>
        <input [(ngModel)]="docenteId" class="input input-bordered w-36" />
        <label class="block mt-2">Curso Id</label>
        <input [(ngModel)]="cursoId" class="input input-bordered w-36" />
        <button class="btn btn-sm btn-primary mt-2" (click)="load()">Cargar</button>
      </div>

      <div *ngIf="loading">Cargando...</div>

      <div *ngIf="!loading && alumnos.length && subjects.length">
        <div class="overflow-auto">
          <table class="table table-compact w-full">
            <thead>
              <tr>
                <th>Alumno</th>
                <th *ngFor="let s of subjects">{{ s.nombre || s.descripcion }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of alumnos">
                <td>{{ a.nombres }} {{ a.apellidos }}</td>
                <td *ngFor="let s of subjects">
                  <input
                    type="number"
                    class="input input-sm input-bordered w-20"
                    [min]="0"
                    [max]="20"
                    [ngModel]="gridValue(a.id, s.id)"
                    (ngModelChange)="onNoteChange(a.id, s.id, $event)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-3 flex gap-2">
          <button class="btn btn-primary" (click)="save()" [disabled]="saving">
            Guardar notas
          </button>
          <button class="btn" (click)="exportCsv()">Exportar CSV</button>
          <input type="file" (change)="importCsv($event)" accept="text/csv" />
        </div>
      </div>

      <div *ngIf="!loading && (!alumnos.length || !subjects.length)" class="text-sm text-gray-600">
        No hay datos cargados.
      </div>
      <div *ngIf="error" class="mt-2 text-red-500">{{ error }}</div>
      <div *ngIf="success" class="mt-2 text-green-600">{{ success }}</div>
    </div>
  `,
})
export class CalificacionEditorComponent {
  private svc = inject(CalificacionService);

  @Input() docenteId: number | null = null;
  @Input() cursoId: number | null = null;

  loading = false;
  saving = false;
  error: string | null = null;
  success: string | null = null;

  // data
  alumnos: any[] = [];
  subjects: any[] = [];

  // grid: { [alumnoId]: { [subjectId]: number } }
  grid: Record<string, Record<string, number | null>> = {};

  load() {
    this.error = this.success = null;
    if (!this.docenteId || !this.cursoId) {
      this.error = 'Indica docenteId y cursoId.';
      return;
    }
    this.loading = true;
    this.svc.obtenerNotas(this.docenteId, this.cursoId).subscribe({
      next: (r) => {
        // Expecting structure: { alumnos: [...], subjects: [...], notas: [{ alumnoId, subjectId, nota }] }
        this.alumnos = r.alumnos || r.students || [];
        this.subjects = r.subjects || r.asignaturas || r.curricula || [];
        this.grid = {};
        const notas = r.notas || r.notes || [];
        for (const a of this.alumnos) {
          this.grid[a.id] = {};
          for (const s of this.subjects) this.grid[a.id][s.id] = null;
        }
        for (const n of notas) {
          if (this.grid[n.alumnoId])
            this.grid[n.alumnoId][n.subjectId || n.asignaturaId || n.curriculaId] = n.nota;
        }
      },
      error: (e) => {
        console.error(e);
        this.error = 'Error cargando notas.';
      },
      complete: () => (this.loading = false),
    });
  }

  onNoteChange(alumnoId: any, subjectId: any, value: any) {
    if (!this.grid[alumnoId]) this.grid[alumnoId] = {};
    const n = Number(value);
    if (isNaN(n)) this.grid[alumnoId][subjectId] = null;
    else this.grid[alumnoId][subjectId] = Math.max(0, Math.min(20, n));
  }

  gridValue(alumnoId: any, subjectId: any) {
    return this.grid?.[alumnoId]?.[subjectId] ?? null;
  }

  save() {
    this.error = this.success = null;
    const payload: any[] = [];
    for (const a of this.alumnos) {
      for (const s of this.subjects) {
        const val = this.grid[a.id]?.[s.id];
        if (val !== null && val !== undefined) {
          payload.push({ alumnoId: a.id, asignaturaId: s.id, nota: val });
        }
      }
    }

    if (payload.length === 0) {
      this.error = 'No hay notas para guardar.';
      return;
    }

    this.saving = true;
    this.svc.guardarNotas(payload).subscribe({
      next: () => {
        this.success = 'Notas guardadas correctamente.';
      },
      error: (e) => {
        console.error(e);
        this.error = 'Error guardando notas.';
      },
      complete: () => (this.saving = false),
    });
  }

  exportCsv() {
    const rows: string[] = [];
    const header = ['alumnoId', 'alumnoNombre', 'asignaturaId', 'asignaturaNombre', 'nota'];
    rows.push(header.join(','));
    for (const a of this.alumnos) {
      for (const s of this.subjects) {
        const nota = this.grid[a.id]?.[s.id];
        rows.push(
          [
            a.id,
            `"${(a.nombres || '') + ' ' + (a.apellidos || '')}"`,
            s.id,
            `"${s.nombre || s.descripcion || ''}"`,
            nota ?? '',
          ].join(',')
        );
      }
    }
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notas_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  importCsv(ev: any) {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || '');
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l);
      if (lines.length <= 1) return;
      const header = lines
        .shift()!
        .split(',')
        .map((h) => h.trim().toLowerCase());
      for (const ln of lines) {
        const cols = ln.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        const map: any = {};
        header.forEach((h, i) => (map[h] = cols[i]));
        const alumnoId = map['alumnoid'] || map['alumno_id'];
        const asignaturaId = map['asignaturaid'] || map['asignatura_id'];
        const nota = map['nota'];
        if (alumnoId && asignaturaId) {
          if (!this.grid[alumnoId]) this.grid[alumnoId] = {};
          this.grid[alumnoId][asignaturaId] = nota === '' ? null : Number(nota);
        }
      }
      this.success = 'CSV importado (no guardado). Revisa y presiona Guardar.';
    };
    reader.readAsText(f);
  }
}

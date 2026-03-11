import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { HorarioService } from '../service/horario.service';
import { CurriculaService } from '@app/features/docentes/service/curricula.service';
import { HorarioFormComponent } from '../components/horario-form.component';

@Component({
  standalone: true,
  selector: 'app-horario-list',
  imports: [CommonModule, HorarioFormComponent],
  template: `
    <div class="p-4 space-y-4">
      <h3 class="text-lg font-semibold">Horarios</h3>

      <app-horario-form
        [model]="formModel"
        [cursoOptions]="cursoOptions"
        (saved)="onSaved()"
        (cleared)="onCleared()"
      />

      <div *ngIf="loading">Cargando...</div>
      <div *ngIf="!loading" class="overflow-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>Id</th>
              <th>Curso / Grado / Nivel</th>
              <th>Día</th>
              <th>Hora inicio</th>
              <th>Hora fin</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let h of items()">
              <td>{{ h.id }}</td>
              <td>{{ cursoLabel(h.nivelDetalleCursoId) }}</td>
              <td>{{ h.diaSemana }}</td>
              <td>{{ h.horaInicio }}</td>
              <td>{{ h.horaFin }}</td>
              <td>{{ h.activo ? 'Sí' : 'No' }}</td>
              <td class="flex gap-2">
                <button class="btn btn-sm" (click)="edit(h)">Editar</button>
                <button class="btn btn-sm btn-error" (click)="remove(h.id)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class HorarioListComponent implements OnInit {
  private svc = inject(HorarioService);
  private curriculasSvc = inject(CurriculaService);
  loading = false;
  items = signal<any[]>([]);
  formModel: any = {};
  cursoOptions: { value: number; label: string }[] = [];
  private cursoLabelMap = new Map<number, string>();

  ngOnInit(): void {
    this.load();
    this.loadCursos();
  }

  load() {
    this.loading = true;
    this.svc.listar().subscribe({
      next: (r) => this.items.set(r.items || r || []),
      complete: () => (this.loading = false),
    });
  }

  loadCursos() {
    this.curriculasSvc.getAsignados({ page: 1, pageSize: 500, list: 'ACTIVE' }).subscribe({
      next: (r) => {
        const items = r?.items || [];
        this.cursoOptions = items.map((a: any) => {
          const label = `${a.nivelDescripcion} ${a.gradoDescripcion} · ${a.cursoDescripcion}`;
          this.cursoLabelMap.set(Number(a.nivelDetalleCursoId), label);
          return { value: Number(a.nivelDetalleCursoId), label };
        });
      },
      error: (e) => console.error(e),
    });
  }

  cursoLabel(nivelDetalleCursoId: number) {
    return this.cursoLabelMap.get(Number(nivelDetalleCursoId)) || nivelDetalleCursoId;
  }

  edit(item: any) {
    this.formModel = { ...item };
  }

  remove(id: any) {
    if (!confirm('Eliminar horario?')) return;
    this.svc.delete(id).subscribe({
      next: () => this.load(),
      error: () =>
        this.svc
          .eliminar(id)
          .subscribe({ next: () => this.load(), error: (e) => console.error(e) }),
    });
  }

  onSaved() {
    this.formModel = {};
    this.load();
  }

  onCleared() {
    this.formModel = {};
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { MatriculaService } from '../service/matricula.service';

@Component({
  standalone: true,
  selector: 'app-matricula-list',
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-3">Listado de Matrículas</h3>
      <div *ngIf="loading" class="mb-2">Cargando...</div>
      <table *ngIf="!loading" class="table w-full">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Curso</th>
            <th>Periodo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let m of items()">
            <td>{{ m.alumno?.nombres }} {{ m.alumno?.apellidos }}</td>
            <td>{{ m.curso?.nombre || m.cursoId }}</td>
            <td>{{ m.periodoId }}</td>
            <td><!-- acciones futuras --></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class MatriculaListComponent implements OnInit {
  private svc = inject(MatriculaService);
  loading = false;
  items = signal<any[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(page = 1, pageSize = 20) {
    this.loading = true;
    this.svc
      .listar(page, pageSize)
      .subscribe({
        next: (r) => this.items.set(r.items || []),
        complete: () => (this.loading = false),
      });
  }
}

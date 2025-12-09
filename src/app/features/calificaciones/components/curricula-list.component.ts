import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CalificacionService } from '../service/calificacion.service';

@Component({
  standalone: true,
  selector: 'app-curricula-list',
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-3">Currícula</h3>
      <div *ngIf="loading">Cargando...</div>
      <ul *ngIf="!loading" class="space-y-2">
        <li *ngFor="let s of items()" class="p-2 border rounded">
          <strong>{{ s.nombre || s.descripcion }}</strong>
          <div class="text-sm text-gray-600">Id: {{ s.id }}</div>
        </li>
      </ul>
    </div>
  `,
})
export class CurriculaListComponent implements OnInit {
  private svc = inject(CalificacionService);
  loading = false;
  items = signal<any[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(docenteId?: number, cursoId?: number) {
    this.loading = true;
    this.svc
      .getCurricula(docenteId, cursoId)
      .subscribe({ next: (r) => this.items.set(r || []), complete: () => (this.loading = false) });
  }
}

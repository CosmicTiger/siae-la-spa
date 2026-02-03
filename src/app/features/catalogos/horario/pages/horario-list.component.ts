import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { HorarioService } from '../service/horario.service';

@Component({
  standalone: true,
  selector: 'app-horario-list',
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-3">Horarios</h3>
      <div *ngIf="loading">Cargando...</div>
      <ul *ngIf="!loading" class="space-y-2">
        <li *ngFor="let p of items()" class="p-2 border rounded flex justify-between">
          <div>
            <strong>{{ p.descripcion || p.dia + ' ' + p.hora }}</strong>
            <div class="text-sm text-gray-600">Id: {{ p.id }}</div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-sm" (click)="edit(p)">Editar</button>
            <button class="btn btn-sm btn-error" (click)="remove(p.id)">Eliminar</button>
          </div>
        </li>
      </ul>
    </div>
  `,
})
export class HorarioListComponent implements OnInit {
  private svc = inject(HorarioService);
  loading = false;
  items = signal<any[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.svc.listar().subscribe({
      next: (r) => this.items.set(r.items || r || []),
      complete: () => (this.loading = false),
    });
  }

  edit(item: any) {
    console.log('edit horario', item);
  }

  remove(id: any) {
    if (!confirm('Eliminar horario?')) return;
    this.svc.delete(id).subscribe({ next: () => this.load(), error: (e) => console.error(e) });
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnioLectivoService } from '../anio-lectivo.service';
import { AnioLectivoReadDto } from '@app/core/models/anio-lectivo.model';
import { AnioLectivoFormComponent } from '../form/anio-lectivo-form.component';
import { DataTableComponent } from '@app/shared/components/data-table/data-table.component';

@Component({
  standalone: true,
  selector: 'app-anio-lectivo-list',
  imports: [CommonModule, AnioLectivoFormComponent, DataTableComponent],
  templateUrl: './anio-lectivo-list.component.html',
  styleUrls: ['./anio-lectivo-list.component.css'],
})
export class AnioLectivoListComponent implements OnInit {
  private svc = inject(AnioLectivoService);

  items = signal<AnioLectivoReadDto[]>([]);
  columns = [
    { key: 'anio', label: 'Año' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'fechaInicio', label: 'Fecha inicio' },
    { key: 'fechaFin', label: 'Fecha fin' },
    { key: 'activo', label: 'Activo' },
  ];
  loading = false;
  modalOpen = signal(false);
  editing = signal<AnioLectivoReadDto | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.svc.list().subscribe({
      next: (r) => this.items.set(r || []),
      error: (e) => console.error(e),
      complete: () => (this.loading = false),
    });
  }

  openNew() {
    this.editing.set(null);
    this.modalOpen.set(true);
  }

  openEdit(item: AnioLectivoReadDto) {
    this.editing.set(item);
    this.modalOpen.set(true);
  }

  onSaved() {
    this.modalOpen.set(false);
    this.load();
  }

  toggleActive(item: AnioLectivoReadDto) {
    const payload = { ...item, activo: !item.activo } as any;
    delete payload.fechaRegistro;
    delete payload.audit;
    this.svc
      .update(item.id, payload)
      .subscribe({ next: () => this.load(), error: (e) => console.error(e) });
  }

  openPeriodos(item: AnioLectivoReadDto) {
    this.openEdit(item);
  }

  formatDate(iso?: string | null) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
}

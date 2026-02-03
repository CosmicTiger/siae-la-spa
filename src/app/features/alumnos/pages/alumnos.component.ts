import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AlumnosService } from '../service/alumnos.service';
import { AlumnoReadDto } from '../../../core/models/persona.model';
import { StudentDialogComponent } from '../components/student-dialog.component';
import { DataTableComponent } from '@app/shared/components/data-table/data-table.component';

@Component({
  standalone: true,
  selector: 'app-alumnos',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    StudentDialogComponent,
    DataTableComponent,
  ],
  templateUrl: './alumnos.component.html',
})
export class AlumnosComponent {
  svc = inject(AlumnosService);
  private router = inject(Router);

  search = new FormControl('', { nonNullable: true });
  page = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  items = signal<AlumnoReadDto[]>([]);
  creating = signal(false);
  // when editing, reuse the dialog but provide initial data
  editing = signal<AlumnoReadDto | null>(null);

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

  columns = [
    { key: 'fullName', label: 'Nombre' },
    { key: 'documentoIdentidad', label: 'Documento' },
    { key: 'ciudad', label: 'Ciudad' },
    { key: 'direccion', label: 'Dirección' },
  ];

  constructor() {
    this.search.valueChanges.subscribe(() => {
      this.page.set(1);
      this.load();
    });
    this.load();
  }

  load() {
    this.svc.list(this.page(), this.pageSize(), this.search.value).subscribe((pr) => {
      this.items.set(pr.items);
      this.totalItems.set(pr.totalItems);
    });
  }
  prev() {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.load();
    }
  }
  next() {
    if (this.page() < this.totalPages()) {
      this.page.update((p) => p + 1);
      this.load();
    }
  }

  openCreate() {
    this.editing.set(null);
    this.creating.set(true);
  }
  onCreated(ok: boolean) {
    this.creating.set(false);
    if (ok) this.load();
  }

  edit(item: AlumnoReadDto) {
    this.editing.set(item);
    this.creating.set(true);
  }

  toggleActive(item: AlumnoReadDto) {
    const id = item.id || (item as any).alumnoId;
    if (!id) return;
    this.svc.setActive(id, !item.activo).subscribe({
      next: () => this.load(),
      error: (err) => console.error('Error toggling active', err),
    });
  }

  openView(item: AlumnoReadDto | number | any) {
    const id = (item && (item.id ?? (item as any).alumnoId)) ?? item;
    if (!id) return;
    this.router.navigate(['/alumnos', id]).catch(() => {});
  }
}

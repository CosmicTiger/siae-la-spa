import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { DocentesService } from '../service/docentes.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DocenteReadDto } from '@app/core/models';
import { DocenteDialogComponent } from '../components/docente-dialog.component';
import { DataTableComponent } from '@app/shared/components/data-table/data-table.component';

@Component({
  standalone: true,
  selector: 'app-docentes',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DocenteDialogComponent,
    DataTableComponent,
  ],
  templateUrl: './docentes.component.html',
})
export class DocentesComponent {
  svc = inject(DocentesService);
  private router = inject(Router);

  search = new FormControl('', { nonNullable: true });
  page = signal(1);
  pageSize = signal(10);

  totalItems = signal(0);
  items = signal<DocenteReadDto[]>([]);

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

  // dialog state for create/edit
  dialogOpen = signal(false);
  dialogInitial = signal<DocenteReadDto | number | null>(null);

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

  openCreate() {
    this.dialogInitial.set(null);
    this.dialogOpen.set(true);
  }

  openEdit(item: DocenteReadDto) {
    // pass the id (or the object) — dialog accepts both
    this.dialogInitial.set(item);
    this.dialogOpen.set(true);
  }

  onDialogClosed(ok: boolean) {
    this.dialogOpen.set(false);
    this.dialogInitial.set(null);
    if (ok) this.load();
  }

  openView(item: DocenteReadDto | number | any) {
    const id = (item && (item.id ?? (item as any).docenteId)) ?? item;
    if (!id) return;
    this.router.navigate(['/docentes', id]).catch(() => {});
  }

  toggleActive(item: DocenteReadDto) {
    const id = item.id || (item as any).docenteId;
    if (!id) return;
    this.svc.setActive(id, !item.activo).subscribe({
      next: () => this.load(),
      error: (err) => console.error('Error toggling active', err),
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
}

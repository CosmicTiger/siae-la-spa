import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DataTableComponent } from '@app/shared/components/data-table/data-table.component';
import { CursoFormComponent } from '../components/curso-form.component';
import { Router, RouterModule } from '@angular/router';
import { CursoService } from '../service/curso.service';
import { CursoReadDto, CursoUpsertDto } from '@app/core/models/cursos.model';

@Component({
  standalone: true,
  selector: 'app-cursos',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DataTableComponent,
    CursoFormComponent,
  ],
  templateUrl: './cursos.component.html',
})
export class CursosComponent implements OnInit {
  private svc = inject(CursoService);
  private router = inject(Router);

  search = new FormControl('', { nonNullable: true });
  page = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  items = signal<CursoReadDto[]>([]);
  // dialog state for create/edit
  dialogOpen = signal(false);
  dialogInitial = signal<CursoReadDto | number | null>(null);

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

  columns = [
    { key: 'codigo', label: 'Código' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'activo', label: 'Activo' },
    { key: 'fechaRegistro', label: 'Fecha de Registro' },
  ];

  ngOnInit(): void {
    this.search.valueChanges
      .subscribe(() => {
        this.page.set(1);
        this.load();
      })
      .unsubscribe();

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

  openEdit(item: CursoReadDto) {
    // pass the id (or the object) — dialog accepts both
    this.dialogInitial.set(item);
    this.dialogOpen.set(true);
  }

  onDialogClosed(ok: boolean) {
    this.dialogOpen.set(false);
    this.dialogInitial.set(null);
    if (ok) this.load();
  }

  openView(item: CursoReadDto | number | any) {
    const id = (item && (item.id ?? (item as any).cursoId)) ?? item;
    if (!id) return;
    this.router.navigate(['/cursos', id]).catch(() => {});
  }

  toggleActive(item: CursoUpsertDto & { id: number }) {
    const id = item.id || (item as any).id;
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

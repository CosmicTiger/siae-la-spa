import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AlumnosService } from '../service/alumnos.service';
import { AlumnoReadDto } from '../../../core/models';
import { StudentDialogComponent } from '../components/student-dialog.component';

@Component({
  standalone: true,
  selector: 'app-alumnos',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, StudentDialogComponent],
  templateUrl: './alumnos.component.html',
})
export class AlumnosComponent {
  svc = inject(AlumnosService);

  search = new FormControl('', { nonNullable: true });
  page = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  items = signal<AlumnoReadDto[]>([]);
  creating = signal(false);

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

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
    this.creating.set(true);
  }
  onCreated(ok: boolean) {
    this.creating.set(false);
    if (ok) this.load();
  }
}

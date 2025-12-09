import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DocentesService } from '../service/docentes.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DocenteReadDto } from '@app/core/models';

@Component({
  standalone: true,
  selector: 'app-docentes',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './docentes.component.html',
})
export class DocentesComponent {
  svc = inject(DocentesService);

  search = new FormControl('', { nonNullable: true });
  page = signal(1);
  pageSize = signal(10);

  totalItems = signal(0);
  items = signal<DocenteReadDto[]>([]);

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
}

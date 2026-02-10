import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject, Input } from '@angular/core';
import { PeriodoService } from '../service/periodo.service';
import { PeriodoFormComponent } from '../components/periodo-form.component';

@Component({
  standalone: true,
  selector: 'app-periodo-list',
  imports: [CommonModule, PeriodoFormComponent],
  templateUrl: './periodos-list.component.html',
  styleUrls: ['./periodos-list.component.css'],
})
export class PeriodosListComponent implements OnInit {
  private svc = inject(PeriodoService);
  @Input() anioId?: number | null;
  loading = false;
  items = signal<any[]>([]);
  // dialog state for create/edit
  dialogOpen = false;
  dialogInitial: any | number | null = null;

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    if (this.anioId) {
      this.svc.listar(1, 100, { anioId: this.anioId }).subscribe({
        next: (r) => this.items.set(r.items || r || []),
        complete: () => (this.loading = false),
      });
    } else {
      this.svc.listar().subscribe({
        next: (r) => this.items.set(r.items || r || []),
        complete: () => (this.loading = false),
      });
    }
  }

  openNew() {
    this.dialogInitial = null;
    this.dialogOpen = true;
  }

  edit(item: any) {
    this.dialogInitial = item;
    this.dialogOpen = true;
  }

  onDialogClosed(ok: boolean) {
    this.dialogOpen = false;
    this.dialogInitial = null;
    if (ok) this.load();
  }

  remove(id: any) {
    if (!confirm('Eliminar periodo?')) return;
    this.svc.delete(id).subscribe({ next: () => this.load(), error: (e) => console.error(e) });
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../service/report.service';
import { DataTableComponent } from '@app/shared/components/data-table/data-table.component';

@Component({
  standalone: true,
  selector: 'app-reportes-docente',
  imports: [CommonModule, FormsModule, DataTableComponent],
  template: `
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-3">Reportes - Docentes</h3>
      <div class="mb-3 flex gap-2">
        <input [(ngModel)]="filters.periodoId" placeholder="PeriodoId" class="input input-sm" />
        <button class="btn btn-sm btn-primary" (click)="search()">Buscar</button>
        <button class="btn btn-sm" (click)="export()">Exportar CSV</button>
      </div>

      <app-data-table [items]="rows" [searchPlaceholder]="'Buscar docentes...'"></app-data-table>
    </div>
  `,
})
export class ReportesDocenteComponent {
  private svc = inject(ReportService);
  filters: any = {};
  rows: any[] = [];

  search() {
    this.svc
      .reporteDocentes(this.filters)
      .subscribe({ next: (r) => (this.rows = r || []), error: (e) => console.error(e) });
  }

  export() {
    this.svc.exportCsv('/api/reportes/docentes/csv', this.filters).subscribe({
      next: (blob) => this.download(blob, 'reporte_docentes.csv'),
      error: (e) => console.error(e),
    });
  }

  private download(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

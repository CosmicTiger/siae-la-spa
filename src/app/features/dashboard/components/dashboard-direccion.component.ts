import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DireccionDashboardDto } from '../dashboard.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  standalone: true,
  selector: 'app-dashboard-direccion',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard-direccion.component.html',
})
export class DashboardDireccionComponent implements OnInit {
  private svc = inject(DashboardService);
  data = signal<DireccionDashboardDto | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  // charts
  matriculasByNivelChart = signal<any | null>(null);
  vacanciasChart = signal<any | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.svc.getDireccionSummary().subscribe({
      next: (d) => {
        this.data.set(d);
        const niveles = d.matriculasByNivel ?? [];
        this.matriculasByNivelChart.set({
          series: niveles.map((x) => x.count),
          chart: { type: 'donut', height: 240, toolbar: { show: false } },
          labels: niveles.map((x) => x.nivel),
          legend: { position: 'bottom' },
        });

        const vac = d.nivelDetalleVacancias ?? [];
        this.vacanciasChart.set({
          series: [
            { name: 'Vacantes', data: vac.map((v: any) => v.vacantes || 0) },
            { name: 'Ocupadas', data: vac.map((v: any) => v.ocupadas || 0) },
          ],
          chart: { type: 'bar', height: 240, toolbar: { show: false } },
          xaxis: { categories: vac.map((v: any) => v.nivel || v.name) },
        });
      },
      error: (err: any) => this.error.set(err?.message || 'No se pudo cargar las métricas'),
      complete: () => this.loading.set(false),
    });
  }
}

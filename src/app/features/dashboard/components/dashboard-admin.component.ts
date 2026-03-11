import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, AdminDashboardDto, ActivitySummaryDto } from '../dashboard.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  standalone: true,
  selector: 'app-dashboard-admin',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard-admin.component.html',
})
export class DashboardAdminComponent implements OnInit {
  private svc = inject(DashboardService);
  data = signal<AdminDashboardDto | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  activity = signal<ActivitySummaryDto | null>(null);

  // chart option holders
  matriculasChart = signal<any | null>(null);
  usersByRoleChart = signal<any | null>(null);
  loginsChart = signal<any | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.svc.getAdminSummary().subscribe({
      next: (d) => {
        this.data.set(d);
        // build matriculas by nivel donut
        const niveles = d.matriculasByNivel ?? [];
        this.matriculasChart.set({
          series: niveles.map((x) => x.count),
          chart: { type: 'donut', height: 260, toolbar: { show: false } },
          labels: niveles.map((x) => x.nivel),
          legend: { position: 'bottom' },
        });

        // build users by role bar
        const roles = d.usersByRole ?? [];
        this.usersByRoleChart.set({
          series: [{ name: 'Usuarios', data: roles.map((r) => r.count) }],
          chart: { type: 'bar', height: 260, toolbar: { show: false } },
          xaxis: { categories: roles.map((r) => r.role) },
        });
      },
      error: (err: any) => this.error.set(err?.message || 'No se pudo cargar las métricas'),
      complete: () => this.loading.set(false),
    });

    // load activity for logins chart
    this.svc.getAdminActivity().subscribe({
      next: (a) => {
        this.activity.set(a);
        const pts = a.loginsByDay ?? [];
        // normalize categories and values supporting multiple field names
        const categories = pts.map(
          (p: any) => p.date ?? p.fecha ?? p.day ?? p.x ?? p.anio ?? p.label ?? '',
        );
        const values = pts.map((p: any) => p.count ?? p.value ?? p.y ?? p.valor ?? 0);
        this.loginsChart.set({
          series: [{ name: 'Logins', data: values }],
          chart: { type: 'line', height: 300, toolbar: { show: false } },
          xaxis: { categories },
          stroke: { curve: 'smooth' },
          markers: { size: 4 },
        });
      },
      error: () => {
        // ignore activity errors but keep logging
      },
    });
  }
}

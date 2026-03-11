import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/service/auth.service';
import { DashboardAdminComponent } from '../../dashboard/components/dashboard-admin.component';
import { DashboardDireccionComponent } from '../../dashboard/components/dashboard-direccion.component';
import { DashboardService } from '../../dashboard/dashboard.service';
import { NgApexchartsModule } from 'ng-apexcharts';

type Tile = { title: string; icon: string; to: string; cta?: string };

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, DashboardAdminComponent, DashboardDireccionComponent, NgApexchartsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  auth = inject(AuthService);
  private svc = inject(DashboardService);

  // charts
  sexTrendChart = signal<any | null>(null);
  enrollmentChart = signal<any | null>(null);

  ngOnInit(): void {
    this.loadKpis();
  }

  loadKpis() {
    // sex trend
    this.svc.getKpiSexTrend().subscribe({
      next: (d) => {
        // Normalize several possible shapes. Backend may return an array of objects: [{ anio:2026, male:1, female:0, other:0 }, ...]
        if (
          Array.isArray(d) &&
          d.length > 0 &&
          (d[0].male !== undefined || d[0].female !== undefined)
        ) {
          const cats = d.map((p: any) => p.date ?? p.anio ?? p.label ?? '');
          const male = d.map((p: any) => p.male ?? 0);
          const female = d.map((p: any) => p.female ?? 0);
          const other = d.map((p: any) => p.other ?? 0);
          const series = [
            { name: 'Masculino', data: male },
            { name: 'Femenino', data: female },
          ];
          if (other.some((v: any) => v > 0)) series.push({ name: 'Otro', data: other });
          this.sexTrendChart.set({
            series,
            chart: { type: 'area', height: 240 },
            xaxis: { categories: cats },
          });
          return;
        }

        if (d?.series && d?.categories) {
          this.sexTrendChart.set({
            series: d.series,
            chart: { type: 'area', height: 240 },
            xaxis: { categories: d.categories },
          });
          return;
        }

        if (d?.male && d?.female && d?.dates) {
          this.sexTrendChart.set({
            series: [
              { name: 'Masculino', data: d.male },
              { name: 'Femenino', data: d.female },
            ],
            chart: { type: 'area', height: 240 },
            xaxis: { categories: d.dates },
          });
          return;
        }
      },
      error: () => {},
    });

    // enrollment by section (current year)
    this.svc.getKpiEnrollmentBySection(new Date().getFullYear()).subscribe({
      next: (d) => {
        // expect { sections: ['A','B'], counts: [10,12] } or array of { section, count }
        if (d?.sections && d?.counts) {
          this.enrollmentChart.set({
            series: [{ name: 'Matriculas', data: d.counts }],
            chart: { type: 'bar', height: 220 },
            xaxis: { categories: d.sections },
          });
        } else if (Array.isArray(d)) {
          // backend returns items like { gradoSeccionId, grado, seccion, count }
          const cats = d.map((x: any) => {
            if (x.grado !== undefined || x.seccion !== undefined)
              return `${x.grado ?? ''}${x.seccion ? '-' + x.seccion : ''}`.trim();
            return x.section || x.name || '';
          });
          const vals = d.map((x: any) => x.count ?? x.value ?? 0);
          this.enrollmentChart.set({
            series: [{ name: 'Matriculas', data: vals }],
            chart: { type: 'bar', height: 220 },
            xaxis: { categories: cats },
          });
        }
      },
      error: () => {},
    });
  }
}

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DireccionDashboardDto } from '../dashboard.service';

@Component({
  standalone: true,
  selector: 'app-dashboard-direccion',
  imports: [CommonModule],
  templateUrl: './dashboard-direccion.component.html',
})
export class DashboardDireccionComponent implements OnInit {
  private svc = inject(DashboardService);
  data = signal<DireccionDashboardDto | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc
      .getDireccionSummary()
      .subscribe({
        next: (d) => this.data.set(d),
        error: () => {},
        complete: () => this.loading.set(false),
      });
  }
}

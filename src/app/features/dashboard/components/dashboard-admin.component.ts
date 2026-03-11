import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, AdminDashboardDto } from '../dashboard.service';

@Component({
  standalone: true,
  selector: 'app-dashboard-admin',
  imports: [CommonModule],
  templateUrl: './dashboard-admin.component.html',
})
export class DashboardAdminComponent implements OnInit {
  private svc = inject(DashboardService);
  data = signal<AdminDashboardDto | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc
      .getAdminSummary()
      .subscribe({
        next: (d) => this.data.set(d),
        error: () => {},
        complete: () => this.loading.set(false),
      });
  }
}

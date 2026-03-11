import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/service/auth.service';
import { DashboardAdminComponent } from '../../dashboard/components/dashboard-admin.component';
import { DashboardDireccionComponent } from '../../dashboard/components/dashboard-direccion.component';

type Tile = { title: string; icon: string; to: string; cta?: string };

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, DashboardAdminComponent, DashboardDireccionComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  auth = inject(AuthService);
}

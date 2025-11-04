import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@app/features/auth/service/auth.service';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { ModalHostComponent } from '@app/shared/components/modal-host/modal-host.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ModalHostComponent],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  authService = inject(AuthService);
  // bind directly to the service signal so shell updates when user changes
  currentUser = this.authService.user;
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { BehaviorSubject } from 'rxjs';
import { LoginDto } from '@app/core/models/auth.model';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  fb = inject(FormBuilder);
  hasError = signal(false);
  authService = inject(AuthService);
  router = inject(Router);
  loading = false;
  error = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loginOnSubmit() {
    if (this.loginForm.invalid) return;

    if (this.loginForm.invalid) {
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }, 2000);
      return;
    }

    this.loading = true;
    this.error = '';
    const loginInput: LoginDto = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!,
    };

    this.authService.login(loginInput).subscribe((result) => {
      let isAuthenticated = false;
      if (typeof result === 'boolean') {
        isAuthenticated = result;
      } else {
        // fallback for unexpected shapes
        isAuthenticated = !!(result as any);
      }

      if (isAuthenticated) {
        this.router.navigateByUrl('/home');
        return;
      }

      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }, 2000);
    });
  }
}

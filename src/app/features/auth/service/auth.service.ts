import { Injectable, computed, inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponse, AuthResponse, LoginDto } from '../../../core/models';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, catchError, map, of } from 'rxjs';
import { ApiService } from '../../../core/api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = 'siae_token';
  // keep BehaviorSubject for backward compatibility with places using it
  private userData = new BehaviorSubject<AuthResponse | null>(this.readStoredUser());
  userData$ = this.userData.asObservable();

  // Provide a WritableSignal so standalone components can react to changes immediately
  user = signal<AuthResponse | null>(this.readStoredUser());
  private authUrl = environment.apiBase + '/api/auth';
  private api = inject(ApiService);
  private router = inject(Router);
  // keep computed for compatibility, but prefer `user` signal directly in components
  currentUser = computed((): AuthResponse | null => this.user());

  readStoredUser(): AuthResponse | null {
    const raw = localStorage.getItem(this.key);
    if (!raw) return null;

    try {
      const obj = JSON.parse(raw);

      // Si por error guardaste un BehaviorSubject, corrígelo:
      if (obj && obj._value) return obj._value as AuthResponse;

      return obj as AuthResponse;
    } catch {
      return null;
    }
  }

  login(dto: LoginDto) {
    return this.api.post<AuthResponse>(`/api/auth/login`, dto).pipe(
      map((res) => {
        this.setUser(res as AuthResponse);
        return true;
      }),
      catchError((err) => this.handleAuthError(err))
    );
  }

  setUser(user: AuthResponse) {
    localStorage.setItem(this.key, JSON.stringify(user));
    this.userData.next(user);
    this.user.set(user);
    return this.user;
  }

  get token() {
    // token stored under the same key contains the full user object; derive token if present
    const raw = localStorage.getItem(this.key);
    if (!raw) return '';
    try {
      const obj = JSON.parse(raw) as any;
      // backend returns `accessToken` according to AuthResponse shape
      return obj?.accessToken || obj?.token || '';
    } catch {
      return '';
    }
  }

  logout() {
    localStorage.removeItem(this.key);
    this.user.set(null);
    this.userData.next(null);
    this.router.navigate(['/login']);
  }
  isAuthenticated() {
    return !!this.token;
  }

  roles(): string[] {
    try {
      const user = this.readStoredUser();
      return user?.roles || [];
    } catch {
      return [];
    }
  }

  currentUsername(): string {
    try {
      const user = this.readStoredUser();
      return user?.fullName || '';
    } catch {
      return '';
    }
  }

  checkIfAuthenticated() {
    const stored = localStorage.getItem(this.key);

    if (!stored) {
      this.logout();
      return of(false);
    }

    try {
      const parsed = JSON.parse(stored) as AuthResponse;
      this.userData.next(parsed);
      this.user.set(parsed);
      return of(true);
    } catch (e) {
      this.logout();
      return of(false);
    }
  }

  private handleAuthError(error: Error) {
    console.error('Auth error:', error);
    this.logout();
    return of(false);
  }
}

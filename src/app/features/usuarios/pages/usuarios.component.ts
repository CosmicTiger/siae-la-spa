import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { UsuariosService } from '../service/usuarios.service';
import { UsuarioFormComponent } from '../components/usuario-form.component';
import { PasswordResetComponent } from '../components/password-reset.component';

@Component({
  standalone: true,
  selector: 'app-usuarios',
  imports: [CommonModule, UsuarioFormComponent, PasswordResetComponent],
  template: `
    <div class="p-4">
      <div class="d-flex justify-content-between items-center mb-3">
        <h3>Usuarios</h3>
        <div>
          <input placeholder="Buscar" (input)="onSearch($event)" class="input input-sm" />
        </div>
      </div>

      <div *ngIf="loading">Cargando...</div>

      <table *ngIf="!loading" class="table w-full">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of items()">
            <td>{{ u.fullName }}</td>
            <td>{{ u.email }}</td>
            <td>{{ (u.roles || []).join(', ') }}</td>
            <td>
              <button class="btn btn-sm" (click)="edit(u)">Editar</button>
              <button class="btn btn-sm" (click)="openPassword(u)">Cambiar clave</button>
              <button class="btn btn-sm btn-error" (click)="deactivate(u)">Desactivar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <app-usuario-dialog
        [(open)]="dialogOpen"
        [initial]="dialogInitial"
        (closed)="onDialogClosed($event)"
      ></app-usuario-dialog>
      <app-password-reset
        [(open)]="pwdOpen"
        [initial]="dialogInitial"
        (closed)="onPwdClosed($event)"
      ></app-password-reset>
    </div>
  `,
})
export class UsuariosComponent implements OnInit {
  private svc = inject(UsuariosService);
  loading = false;
  items = signal<any[]>([]);
  dialogOpen = false;
  dialogInitial: any | null = null;
  pwdOpen = false;

  ngOnInit(): void {
    this.load();
  }

  load(q?: string) {
    this.loading = true;
    this.svc.list(1, 50, q).subscribe({
      next: (r) => this.items.set(r.items || r || []),
      complete: () => (this.loading = false),
    });
  }

  onSearch(e: Event) {
    const q = (e.target as HTMLInputElement).value;
    this.load(q);
  }

  edit(u: any) {
    this.dialogInitial = u;
    this.dialogOpen = true;
  }

  openPassword(u: any) {
    this.dialogInitial = u;
    this.pwdOpen = true;
  }

  deactivate(u: any) {
    if (!confirm('Desactivar usuario?')) return;
    this.svc
      .delete(u.id)
      .subscribe({ next: () => this.load(), error: (e) => alert(e?.message || 'Error') });
  }

  onDialogClosed(ok: boolean) {
    this.dialogOpen = false;
    this.dialogInitial = null;
    if (ok) this.load();
  }

  onPwdClosed(ok: boolean) {
    this.pwdOpen = false;
    this.dialogInitial = null;
    if (ok) alert('Contraseña cambiada');
  }
}

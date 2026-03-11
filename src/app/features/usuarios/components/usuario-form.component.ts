import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {
  EntityDialogComponent,
  FieldDef,
} from '@app/shared/components/entity-dialog/entity-dialog.component';
import { UsuariosService } from '../service/usuarios.service';

@Component({
  standalone: true,
  selector: 'app-usuario-dialog',
  imports: [CommonModule, EntityDialogComponent],
  template: `
    <app-entity-dialog
      [(open)]="open"
      [title]="initial ? 'Editar usuario' : 'Nuevo usuario'"
      [schema]="schema"
      [initial]="initial"
      [submitFn]="submitFn"
      (closed)="onClosed($event)"
    ></app-entity-dialog>
  `,
})
export class UsuarioFormComponent {
  @Input() open = false;
  @Input() initial: any | null = null;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<boolean>();

  private svc = inject(UsuariosService);

  schema: FieldDef[] = [
    { key: 'fullName', label: 'Nombre completo', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'isApproved', label: 'Aprobado', type: 'checkbox' },
    { key: 'roles', label: 'Roles', type: 'text' },
  ];

  onClosed(ok: boolean) {
    this.open = false;
    this.openChange.emit(false);
    this.closed.emit(!!ok);
  }

  submitFn = (initial: any, value: any) => {
    const v = value as any;
    const id = initial?.id || v.id;
    // ensure roles is array if provided as comma list
    const roles = Array.isArray(v.roles)
      ? v.roles
      : v.roles
        ? String(v.roles)
            .split(',')
            .map((s: any) => s.trim())
        : undefined;
    const payload: any = {
      fullName: v.fullName,
      email: v.email,
      isApproved: v.isApproved,
    };
    if (roles) payload.roles = roles;

    if (id) return this.svc.update(id, payload);
    // creation not implemented in this minimal deliverable — use admin backend
    return this.svc.update(0, payload);
  };
}

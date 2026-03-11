import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {
  EntityDialogComponent,
  FieldDef,
} from '@app/shared/components/entity-dialog/entity-dialog.component';
import { UsuariosService } from '../service/usuarios.service';

@Component({
  standalone: true,
  selector: 'app-password-reset',
  imports: [CommonModule, EntityDialogComponent],
  template: `
    <app-entity-dialog
      [(open)]="open"
      [title]="'Cambiar contraseña'"
      [schema]="schema"
      [initial]="initial"
      [submitFn]="submitFn"
      (closed)="onClosed($event)"
    ></app-entity-dialog>
  `,
})
export class PasswordResetComponent {
  @Input() open = false;
  @Input() initial: any | null = null; // should include id
  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<boolean>();

  private svc = inject(UsuariosService);

  schema: FieldDef[] = [{ key: 'newPassword', label: 'Nueva contraseña', type: 'password' }];

  onClosed(ok: boolean) {
    this.open = false;
    this.openChange.emit(false);
    this.closed.emit(!!ok);
  }

  submitFn = (initial: any, value: any) => {
    const v = value as any;
    const id = initial?.id || (initial as any)?.userId;
    if (!id) throw new Error('Id de usuario requerido');
    return this.svc.changePassword(id, v.newPassword);
  };
}

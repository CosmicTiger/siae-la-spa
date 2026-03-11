import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {
  EntityDialogComponent,
  FieldDef,
} from '@app/shared/components/entity-dialog/entity-dialog.component';
import { PeriodoService } from '../service/periodo.service';

@Component({
  standalone: true,
  selector: 'app-periodo-dialog',
  imports: [CommonModule, EntityDialogComponent],
  template: `
    <app-entity-dialog
      [(open)]="open"
      [title]="initial ? 'Editar Periodo' : 'Nuevo Periodo'"
      [schema]="schema"
      [initial]="initial"
      [submitFn]="submitFn"
      (closed)="onClosed($event)"
    ></app-entity-dialog>
  `,
})
export class PeriodoFormComponent {
  @Input() open = false;
  @Input() initial: any | number | null = null;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<boolean>();

  private svc = inject(PeriodoService);

  schema: FieldDef[] = [
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'orden', label: 'Orden', type: 'number' },
    { key: 'activo', label: 'Activo', type: 'checkbox' },
  ];

  onClosed(ok: boolean) {
    this.open = false;
    this.openChange.emit(false);
    this.closed.emit(!!ok);
  }

  submitFn = (initial: any, value: any) => {
    const v = value as any;
    const id = v.id || (typeof initial === 'number' ? initial : initial?.id);

    if (id) {
      const updateDto = { descripcion: v.descripcion, orden: v.orden, activo: v.activo ?? true };
      return this.svc.update(id, updateDto);
    } else {
      const createDto = { descripcion: v.descripcion, orden: v.orden, activo: v.activo ?? true };
      return this.svc.create(createDto);
    }
  };
}

import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CursoService } from '../service/curso.service';
import {
  EntityDialogComponent,
  FieldDef,
} from '@app/shared/components/entity-dialog/entity-dialog.component';

@Component({
  standalone: true,
  selector: 'app-curso-dialog',
  imports: [CommonModule, ReactiveFormsModule, EntityDialogComponent],
  template: `
    <app-entity-dialog
      [(open)]="open"
      [title]="initial ? 'Editar Curso' : 'Nuevo Curso'"
      [schema]="schema"
      [initial]="initial"
      [submitFn]="submitFn"
      (closed)="onClosed($event)"
    ></app-entity-dialog>
  `,
})
export class CursoFormComponent implements OnChanges {
  @Input() open = false;
  @Input() initial: any | number | null = null;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<boolean>();
  private svc = inject(CursoService);

  schema: FieldDef[] = [
    { key: 'codigo', label: 'Nombre', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'activo', label: 'Activo', type: 'checkbox' },
  ];

  ngOnChanges(_: SimpleChanges) {
    // nothing specific here — EntityDialog will handle patching initial
  }

  onClosed(ok: boolean) {
    this.open = false;
    this.openChange.emit(false);
    this.closed.emit(!!ok);
  }

  submitFn = (initial: any, value: any) => {
    const v = value as any;
    const id = v.id || (typeof initial === 'number' ? initial : initial?.id);

    if (id) {
      const updateDto = {
        nombre: v.nombre,
        descripcion: v.descripcion,
        activo: v.activo,
        codigo: v.codigo,
      };
      return this.svc.update(id, updateDto);
    } else {
      const createDto = {
        nombre: v.nombre,
        descripcion: v.descripcion,
        activo: v.activo,
        codigo: v.codigo,
      };
      return this.svc.create(createDto);
    }
  };
}

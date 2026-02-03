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
import {
  EntityDialogComponent,
  FieldDef,
} from '@app/shared/components/entity-dialog/entity-dialog.component';
import { GradoSeccionService } from '../service/grado-seccion.service';

@Component({
  standalone: true,
  selector: 'app-grado-dialog',
  imports: [CommonModule, ReactiveFormsModule, EntityDialogComponent],
  template: `
    <app-entity-dialog
      [(open)]="open"
      [title]="initial ? 'Editar Grado' : 'Nuevo Grado'"
      [schema]="schema"
      [initial]="initial"
      [submitFn]="submitFn"
      (closed)="onClosed($event)"
    ></app-entity-dialog>
  `,
})
export class GradoFormComponent implements OnChanges {
  @Input() open = false;
  @Input() initial: any | number | null = null;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<boolean>();
  private svc = inject(GradoSeccionService);

  schema: FieldDef[] = [
    { key: 'descripcionGrado', label: 'Nombre de Grado', type: 'text' },
    { key: 'descripcionSeccion', label: 'Descripción de Sección', type: 'text' },
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
        descripcionGrado: v.descripcionGrado,
        descripcionSeccion: v.descripcionSeccion,
        activo: v.activo ?? true,
      };
      return this.svc.update(id, updateDto);
    } else {
      const createDto = {
        descripcionGrado: v.descripcionGrado,
        descripcionSeccion: v.descripcionSeccion,
        activo: v.activo ?? true,
      };
      return this.svc.create(createDto);
    }
  };
}

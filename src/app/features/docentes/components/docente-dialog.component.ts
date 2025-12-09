import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { DocentesService } from '../service/docentes.service';
import {
  EntityDialogComponent,
  FieldDef,
} from '@app/shared/components/entity-dialog/entity-dialog.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  standalone: true,
  selector: 'app-docente-dialog',
  imports: [CommonModule, ReactiveFormsModule, EntityDialogComponent],
  template: `
    <app-entity-dialog
      [(open)]="open"
      [title]="initial ? 'Editar Docente' : 'Nuevo Docente'"
      [schema]="schema"
      [initial]="initial"
      [submitFn]="submitFn"
      (closed)="onClosed($event)"
    ></app-entity-dialog>
  `,
})
export class DocenteDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() initial: any | number | null = null;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<boolean>();

  schema: FieldDef[] = [
    { key: 'nombres', label: 'Nombres', type: 'text', validators: [Validators.required] },
    { key: 'apellidos', label: 'Apellidos', type: 'text', validators: [Validators.required] },
    { key: 'documentoIdentidad', label: 'Documento', type: 'text' },
    { key: 'fechaNacimiento', label: 'Fecha nacimiento', type: 'date' },
    {
      key: 'sexo',
      label: 'Sexo',
      type: 'select',
      options: [
        { value: 'M', label: 'M' },
        { value: 'F', label: 'F' },
        { value: 'O', label: 'O' },
      ],
    },
    { key: 'ciudad', label: 'Ciudad', type: 'text' },
    { key: 'direccion', label: 'Dirección', type: 'text' },
    { key: 'numeroTelefono', label: 'Teléfono', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'password', label: 'Contraseña', type: 'password' },
    { key: 'activo', label: 'Activo', type: 'checkbox' },
  ];

  constructor(private svc: DocentesService) {}

  ngOnChanges(_: SimpleChanges) {
    // nothing specific here — EntityDialog will handle patching initial
  }

  onClosed(ok: boolean) {
    this.open = false;
    this.openChange.emit(false);
    this.closed.emit(!!ok);
  }

  submitFn = (initial: any, value: any) => {
    // prepare payload similar to previous implementation
    const v = value as any;
    const id = v.id || (typeof initial === 'number' ? initial : initial?.id);
    if (id) {
      const payload = {
        nombres: v.nombres,
        apellidos: v.apellidos,
        documentoIdentidad: v.documentoIdentidad || null,
        fechaNacimiento: v.fechaNacimiento ? new Date(v.fechaNacimiento).toISOString() : undefined,
        sexo: v.sexo,
        ciudad: v.ciudad || null,
        direccion: v.direccion || null,
        numeroTelefono: v.numeroTelefono || null,
        email: v.email || null,
        activo: v.activo,
      };
      if (v.password) (payload as any).password = v.password;
      return this.svc.update(Number(id), payload);
    } else {
      const createPayload = {
        docentePersona: {
          nombres: v.nombres,
          apellidos: v.apellidos,
          documentoIdentidad: v.documentoIdentidad || null,
          fechaNacimiento: v.fechaNacimiento
            ? new Date(v.fechaNacimiento).toISOString()
            : undefined,
          sexo: v.sexo,
          ciudad: v.ciudad || null,
          direccion: v.direccion || null,
          numeroTelefono: v.numeroTelefono || null,
        },
        docenteEmail: v.email,
        docentePassword: v.password || undefined,
      };
      return this.svc.create(createPayload);
    }
  };
}

import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnioLectivoService } from '../anio-lectivo.service';
import { AnioLectivoReadDto, AnioLectivoUpsertDto } from '@app/core/models/anio-lectivo.model';
import { toUtcIsoFromDateInput } from '@app/utils/date.util';
import {
  EntityDialogComponent,
  FieldDef,
} from '@app/shared/components/entity-dialog/entity-dialog.component';
import { PeriodosListComponent } from '../../periodos/pages/periodos-list.component';

@Component({
  standalone: true,
  selector: 'app-anio-lectivo-form',
  imports: [CommonModule, EntityDialogComponent, PeriodosListComponent],
  templateUrl: './anio-lectivo-form.component.html',
  styleUrls: ['./anio-lectivo-form.component.css'],
})
export class AnioLectivoFormComponent {
  private svc = inject(AnioLectivoService);

  // backward-compatible input name `anio` used across templates
  @Input() initial: AnioLectivoReadDto | null = null;
  @Input()
  set anio(v: AnioLectivoReadDto | null) {
    this.initial = v;
  }
  get anio() {
    return this.initial;
  }
  @Input() open = true;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<boolean>();
  // legacy saved emitter used by existing templates
  @Output() saved = new EventEmitter<void>();

  // schema for EntityDialog
  schema: FieldDef[] = [
    { key: 'anio', label: 'Año', type: 'number' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'fechaInicio', label: 'Fecha inicio', type: 'date' },
    { key: 'fechaFin', label: 'Fecha fin', type: 'date' },
    { key: 'activo', label: 'Activo', type: 'checkbox' },
  ];

  submitFn = (initial: any, value: any) => {
    const v = value as any;
    const payload: AnioLectivoUpsertDto = {
      anio: Number(v.anio),
      descripcion: v.descripcion || null,
      fechaInicio: toUtcIsoFromDateInput(v.fechaInicio),
      fechaFin: toUtcIsoFromDateInput(v.fechaFin),
      activo: !!v.activo,
    };

    if (initial && initial.id) {
      return this.svc.update(initial.id, payload);
    }
    return this.svc.create(payload);
  };

  onClosed(ok: boolean) {
    this.open = false;
    this.openChange.emit(false);
    this.closed.emit(!!ok);
    if (ok) this.saved.emit();
  }

  showPeriodos = false;

  togglePeriodos() {
    this.showPeriodos = !this.showPeriodos;
  }
}

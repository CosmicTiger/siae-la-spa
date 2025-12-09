import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatriculasService } from '../service/matriculas.service';
import { AlumnosService } from '../../alumnos/service/alumnos.service';
import { MatriculaModalService } from '../service/matricula-modal.service';
import {
  DataTableComponent,
  DataColumn,
} from '@app/shared/components/data-table/data-table.component';
import {
  EntityDialogComponent,
  FieldDef,
} from '@app/shared/components/entity-dialog/entity-dialog.component';
import { NivelesService } from '../../catalogos/niveles/service/niveles.service';
import { PeriodosService } from '../../catalogos/periodos/service/periodos.service';
import { Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-matriculas',
  imports: [CommonModule, DataTableComponent, EntityDialogComponent],
  templateUrl: './matriculas.component.html',
})
export class MatriculasComponent implements OnInit {
  alumnos: any[] = [];
  selectedAlumnoId = signal<number | null>(null);
  matriculas: any[] = [];
  showDialog = signal(false);

  // data-table columns
  columns: DataColumn[] = [
    { key: 'fullName', label: 'Alumno' },
    { key: 'nivel', label: 'Nivel' },
    { key: 'turno', label: 'Turno' },
    { key: 'gradoSeccion', label: 'Grado/Sección' },
    { key: 'periodoId', label: 'Periodo' },
    { key: 'fechaRegistro', label: 'Fecha' },
    { key: 'apoderadoId', label: 'Apoderado' },
  ];

  // schema for EntityDialog
  schema: FieldDef[] = [];
  submitFn: any = null;
  onInitFn: any = null;

  private nivelesSvc!: NivelesService;
  private periodosSvc!: PeriodosService;

  constructor(
    private svc: MatriculasService,
    private alumnosSvc: AlumnosService,
    private modalSvc: MatriculaModalService,
    private nivelesSvcInject: NivelesService,
    private periodosSvcInject: PeriodosService
  ) {
    this.nivelesSvc = this.nivelesSvcInject;
    this.periodosSvc = this.periodosSvcInject;
  }

  onAlumnoChange(e: Event) {
    const sel = e.target as HTMLSelectElement | null;
    const raw = sel?.value ?? '';
    const id = raw ? Number(raw) : null;
    this.selectedAlumnoId.set(id);
    this.loadByAlumno(id);
  }

  ngOnInit(): void {
    this.alumnosSvc.list(1, 200).subscribe((r) => (this.alumnos = r.items || []));
    // listen for global modal open requests (e.g. from navbar)
    this.modalSvc.open$.subscribe((alumnoId: number | null) => {
      this.selectedAlumnoId.set(alumnoId);
      if (alumnoId != null) this.loadByAlumno(alumnoId);
      this.showDialog.set(true);
    });
    // prepare catalog lists and dialog schema/options
    this.prepareListsAndSchema();
  }

  private prepareListsAndSchema() {
    const pNiveles = this.nivelesSvc ? this.nivelesSvc.list().toPromise() : Promise.resolve([]);
    const pPeriodos = this.periodosSvc ? this.periodosSvc.list().toPromise() : Promise.resolve([]);

    Promise.all([pNiveles, pPeriodos]).then(([niveles, periodos]: any) => {
      const alumnoOptions = (this.alumnos || []).map((a) => ({
        value: a.id,
        label: `${a.nombres} ${a.apellidos}`,
      }));
      const nivelOptions = (niveles || []).map((n: any) => ({
        value: n.nivelDetalleId ?? n.id ?? n.nivelId,
        label: n.nivelDescripcion || n.nombre || n.descripcionNivel || `${n.id}`,
      }));
      const periodoOptions = (periodos || []).map((p: any) => ({
        value: p.id ?? p.periodoId,
        label: p.nombre || p.descripcion || `${p.id}`,
      }));

      this.schema = [
        {
          key: 'alumnoId',
          label: 'Alumno',
          type: 'select',
          options: alumnoOptions,
          validators: [Validators.required],
        },
        {
          key: 'nivelDetalleId',
          label: 'Nivel detalle',
          type: 'select',
          options: nivelOptions,
          validators: [Validators.required],
        },
        {
          key: 'periodoId',
          label: 'Periodo',
          type: 'select',
          options: periodoOptions,
          validators: [Validators.required],
        },
        { key: 'apoderadoId', label: 'Apoderado', type: 'select', options: alumnoOptions },
        { key: 'situacion', label: 'Situación', type: 'text' },
        { key: 'institucionProcedencia', label: 'Institución procedencia', type: 'text' },
        { key: 'esRepetente', label: 'Es repetente', type: 'checkbox' },
      ];

      this.submitFn = (initial: any, value: any) => {
        const v = value as any;
        const payload = {
          alumnoId: Number(v.alumnoId),
          nivelDetalleId: Number(v.nivelDetalleId),
          periodoId: Number(v.periodoId),
          apoderadoId: v.apoderadoId ? Number(v.apoderadoId) : undefined,
          situacion: v.situacion || null,
          institucionProcedencia: v.institucionProcedencia || null,
          esRepetente: !!v.esRepetente,
        };
        return this.svc.create(payload as any);
      };

      this.onInitFn = (form: any, initial: any) => {
        const sid = this.selectedAlumnoId();
        if (!initial && sid) form.patchValue({ alumnoId: sid });
      };
    });
  }

  loadByAlumno(alumnoId: number | null) {
    if (alumnoId == null) {
      this.matriculas = [];
      return;
    }
    this.svc.byAlumno(alumnoId).subscribe((r) => {
      const raw = r || [];
      this.matriculas = raw.map((m: any) => ({
        ...m,
        fullName: m.alumno ? `${m.alumno.nombres} ${m.alumno.apellidos}` : '—',
        nivel: m.nivelDetalle?.nivel?.descripcionNivel || m.nivelDetalle?.nivelDescripcion || '—',
        turno: m.nivelDetalle?.nivel?.descripcionTurno || m.nivelDetalle?.nivelTurno || '—',
        gradoSeccion:
          (
            (m.nivelDetalle?.gradoSeccion?.descripcionGrado || '') +
            ' ' +
            (m.nivelDetalle?.gradoSeccion?.descripcionSeccion || '')
          ).trim() || '—',
        fechaRegistro: m.fechaRegistro,
        apoderadoId: m.apoderadoId || '—',
      }));
    });
  }

  openNew() {
    this.showDialog.set(true);
  }

  onDialogClosed(created: boolean) {
    this.showDialog.set(false);
    if (created && this.selectedAlumnoId()) this.loadByAlumno(this.selectedAlumnoId()!);
  }
}

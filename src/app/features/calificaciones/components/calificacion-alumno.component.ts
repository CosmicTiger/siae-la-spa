import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CalificacionService } from '../service/calificacion.service';
import { AlumnosService } from '../../alumnos/service/alumnos.service';
import { MatriculasService } from '../../matriculas/service/matriculas.service';
import { CurriculaService } from '../../docentes/service/curricula.service';

interface CursoItem {
  docenteNivelDetalleCursoId?: number;
  nivelDetalleCursoId?: number;
  nivelDetalleId?: number;
  cursoId: number;
  cursoDescripcion: string;
}

@Component({
  standalone: true,
  selector: 'app-calificacion-alumno',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 space-y-4">
      <div>
        <h3 class="text-lg font-semibold">Agregar calificaciones por alumno</h3>
        <p class="text-sm text-gray-600">
          Selecciona un alumno, su curso activo y registra las notas por currícula.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm font-medium">Alumno</label>
          <select
            class="select select-bordered w-full"
            [ngModel]="selectedAlumnoId"
            (ngModelChange)="onAlumnoChange($event)"
          >
            <option [ngValue]="null">Selecciona un alumno</option>
            <option *ngFor="let a of alumnos" [ngValue]="a.id">
              {{ a.nombres }} {{ a.apellidos }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium">Grado / Sección</label>
          <div class="input input-bordered w-full flex items-center">
            <span class="text-sm">{{ gradoSeccionLabel || '—' }}</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium">Curso</label>
          <select
            class="select select-bordered w-full"
            [ngModel]="selectedCursoId"
            (ngModelChange)="onCursoChange($event)"
            [disabled]="!cursos.length"
          >
            <option [ngValue]="null">Selecciona un curso</option>
            <option *ngFor="let c of cursos" [ngValue]="c.cursoId">
              {{ c.cursoDescripcion }}
            </option>
          </select>
        </div>
      </div>

      <div *ngIf="loading" class="text-sm">Cargando...</div>

      <div *ngIf="!loading && selectedAlumnoId && !nivelDetalleId" class="text-sm text-gray-600">
        El alumno no tiene matrícula activa.
      </div>

      <div *ngIf="!loading && curriculas.length" class="space-y-3">
        <div class="overflow-auto">
          <table class="table table-compact w-full">
            <thead>
              <tr>
                <th>Currícula</th>
                <th class="w-32">Nota</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of curriculas">
                <td>
                  <div class="font-medium">{{ c.titulo || c.nombre || c.descripcion }}</div>
                  <div class="text-xs text-gray-500">Id: {{ c.id }}</div>
                </td>
                <td>
                  <input
                    type="number"
                    class="input input-sm input-bordered w-24"
                    [min]="0"
                    [max]="20"
                    [ngModel]="notaValue(c.id)"
                    (ngModelChange)="onNotaChange(c.id, $event)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex gap-2">
          <button class="btn btn-primary" (click)="save()" [disabled]="saving">Guardar</button>
          <button class="btn" (click)="resetNotas()" [disabled]="saving">Limpiar</button>
        </div>
      </div>

      <div *ngIf="!loading && selectedCursoId && !curriculas.length" class="text-sm text-gray-600">
        No hay currículas para el curso seleccionado.
      </div>

      <div *ngIf="error" class="text-sm text-red-500">{{ error }}</div>
      <div *ngIf="success" class="text-sm text-green-600">{{ success }}</div>
    </div>
  `,
})
export class CalificacionAlumnoComponent implements OnInit {
  private calificacionesSvc = inject(CalificacionService);
  private alumnosSvc = inject(AlumnosService);
  private matriculasSvc = inject(MatriculasService);
  private curriculasSvc = inject(CurriculaService);

  alumnos: any[] = [];
  selectedAlumnoId: number | null = null;
  selectedCursoId: number | null = null;

  nivelDetalleId: number | null = null;
  nivelId: number | null = null;
  gradoSeccionId: number | null = null;
  gradoSeccionLabel: string | null = null;

  cursos: CursoItem[] = [];
  curriculas: any[] = [];
  notas: Record<string, number | null> = {};

  loading = false;
  saving = false;
  error: string | null = null;
  success: string | null = null;

  ngOnInit(): void {
    this.loadAlumnos();
  }

  loadAlumnos() {
    this.alumnosSvc.list(1, 300).subscribe({
      next: (r) => (this.alumnos = r.items || []),
      error: () => (this.error = 'Error cargando alumnos.'),
    });
  }

  onAlumnoChange(alumnoId: number | null) {
    this.selectedAlumnoId = alumnoId ? Number(alumnoId) : null;
    this.resetSelection();
    if (!this.selectedAlumnoId) return;

    this.loading = true;
    this.error = this.success = null;

    forkJoin({
      alumno: this.alumnosSvc.getById(this.selectedAlumnoId),
      matriculas: this.matriculasSvc.byAlumno(this.selectedAlumnoId),
    }).subscribe({
      next: ({ alumno, matriculas }) => {
        const matriculaActual = this.pickMatriculaActual(matriculas || [], alumno);
        this.nivelDetalleId = this.resolveNivelDetalleId(matriculaActual, alumno);
        this.nivelId = this.resolveNivelId(matriculaActual, alumno);
        this.gradoSeccionId = this.resolveGradoSeccionId(matriculaActual, alumno);
        this.gradoSeccionLabel = this.resolveGradoSeccionLabel(matriculaActual, alumno);
        this.loadCursos();
      },
      error: () => {
        this.error = 'Error cargando matrícula del alumno.';
      },
      complete: () => (this.loading = false),
    });
  }

  loadCursos() {
    this.cursos = [];
    this.selectedCursoId = null;
    this.curriculas = [];
    if (!this.nivelId || !this.gradoSeccionId) return;

    this.loading = true;
    this.curriculasSvc
      .getAsignados({
        page: 1,
        pageSize: 200,
        nivelId: this.nivelId,
        gradoSeccionId: this.gradoSeccionId,
        list: 'ACTIVE',
      })
      .subscribe({
        next: (r) => {
          const items = r?.items || [];
          const filtered = items.filter(
            (a: any) =>
              a.activo === true &&
              Number(a.nivelId) === Number(this.nivelId) &&
              Number(a.gradoSeccionId) === Number(this.gradoSeccionId),
          );
          this.cursos = filtered.map((a: any) => {
            const cursoId = a.cursoId;
            const cursoDescripcion = a.cursoDescripcion || `Curso ${cursoId}`;
            return {
              docenteNivelDetalleCursoId: a.id,
              nivelDetalleCursoId: a.nivelDetalleCursoId,
              nivelDetalleId: a.nivelDetalleId,
              cursoId,
              cursoDescripcion,
            } as CursoItem;
          });
        },
        error: () => (this.error = 'Error cargando cursos.'),
        complete: () => (this.loading = false),
      });
  }

  onCursoChange(cursoId: number | null) {
    this.selectedCursoId = cursoId ? Number(cursoId) : null;
    this.curriculas = [];
    this.notas = {};
    if (!this.selectedCursoId) return;

    const selected = this.cursos.find((c) => Number(c.cursoId) === Number(this.selectedCursoId));
    const docenteNivelDetalleCursoId = selected?.docenteNivelDetalleCursoId;
    if (!docenteNivelDetalleCursoId) {
      this.error = 'No se encontró la asignación docente del curso.';
      return;
    }

    this.loading = true;
    this.curriculasSvc.getCurriculas(docenteNivelDetalleCursoId).subscribe({
      next: (r) => {
        this.curriculas = r || [];
        this.notas = {};
        this.curriculas.forEach((c) => (this.notas[c.id] = null));
      },
      error: () => (this.error = 'Error cargando currículas.'),
      complete: () => (this.loading = false),
    });
  }

  onNotaChange(curriculaId: number, value: any) {
    const n = Number(value);
    if (isNaN(n)) this.notas[curriculaId] = null;
    else this.notas[curriculaId] = Math.max(0, Math.min(20, n));
  }

  notaValue(curriculaId: number) {
    return this.notas?.[curriculaId] ?? null;
  }

  resetNotas() {
    this.notas = {};
    this.curriculas.forEach((c) => (this.notas[c.id] = null));
    this.success = null;
    this.error = null;
  }

  save() {
    if (!this.selectedAlumnoId) {
      this.error = 'Selecciona un alumno.';
      return;
    }

    const payloads = this.curriculas
      .map((c) => ({ curricula: c, nota: this.notas[c.id] }))
      .filter((p) => p.nota !== null && p.nota !== undefined);

    console.log('Payloads a guardar =>', payloads);

    if (!payloads.length) {
      this.error = 'No hay notas para guardar.';
      return;
    }

    this.saving = true;
    this.error = this.success = null;

    this.calificacionesSvc.obtenerNotasByAlumno(this.selectedAlumnoId!).subscribe({
      next: (existing) => {
        const existingList = existing || [];
        const requests = payloads.map((p) => {
          const current = existingList.find(
            (n: any) => Number(n.curriculaId) === Number(p.curricula.id)
          );
          const body = {
            CurriculaId: p.curricula.id,
            AlumnoId: this.selectedAlumnoId!,
            Nota: Number(p.nota),
          };

          if (current?.id) {
            return this.calificacionesSvc.actualizar(current.id, body);
          }

          return this.calificacionesSvc.crearByAlumno(body);
        });

        forkJoin(requests).subscribe({
          next: () => {
            this.success = 'Calificaciones registradas correctamente.';
          },
          error: () => {
            this.error = 'Error guardando calificaciones.';
          },
          complete: () => (this.saving = false),
        });
      },
      error: () => {
        this.error = 'Error consultando calificaciones existentes.';
        this.saving = false;
      },
    });
  }

  private pickMatriculaActual(matriculas: any[], alumno: any) {
    if (matriculas && matriculas.length) {
      const active = matriculas.find((m) => m.activo === true) || null;
      if (active) return active;
      const sorted = [...matriculas].sort((a, b) => {
        const da = new Date(a.fechaRegistro || 0).getTime();
        const db = new Date(b.fechaRegistro || 0).getTime();
        return db - da;
      });
      return sorted[0] || null;
    }
    return alumno?.matriculaActual || null;
  }

  private resolveNivelDetalleId(matricula: any, alumno: any): number | null {
    if (!matricula && !alumno) return null;
    const nivel = matricula?.nivelDetalle || matricula?.nivel || alumno?.matriculaActual?.nivel;
    return (
      matricula?.nivelDetalleId ||
      nivel?.nivelDetalleId ||
      alumno?.matriculaActual?.nivel?.nivelDetalleId ||
      null
    );
  }

  private resolveGradoSeccionLabel(matricula: any, alumno: any): string | null {
    const nivel = matricula?.nivelDetalle || matricula?.nivel || alumno?.matriculaActual?.nivel;
    if (!nivel) return null;
    const grado =
      nivel?.gradoDescripcion ||
      nivel?.gradoSeccion?.descripcionGrado ||
      nivel?.gradoSeccion?.descripcionGradoSeccion ||
      '';
    const seccion =
      nivel?.seccionDescripcion ||
      nivel?.gradoSeccion?.descripcionSeccion ||
      nivel?.gradoSeccion?.descripcionSeccionGrado ||
      '';
    const label = `${grado} ${seccion}`.trim();
    return label || null;
  }

  private resolveNivelId(matricula: any, alumno: any): number | null {
    if (!matricula && !alumno) return null;
    const nivel = matricula?.nivelDetalle || matricula?.nivel || alumno?.matriculaActual?.nivel;
    return nivel?.nivelId ?? matricula?.nivelId ?? alumno?.matriculaActual?.nivel?.nivelId ?? null;
  }

  private resolveGradoSeccionId(matricula: any, alumno: any): number | null {
    if (!matricula && !alumno) return null;
    const nivel = matricula?.nivelDetalle || matricula?.nivel || alumno?.matriculaActual?.nivel;
    return (
      nivel?.gradoSeccionId ??
      nivel?.gradoSeccion?.gradoSeccionId ??
      matricula?.gradoSeccionId ??
      alumno?.matriculaActual?.nivel?.gradoSeccionId ??
      null
    );
  }

  private resetSelection() {
    this.nivelDetalleId = null;
    this.nivelId = null;
    this.gradoSeccionId = null;
    this.gradoSeccionLabel = null;
    this.cursos = [];
    this.selectedCursoId = null;
    this.curriculas = [];
    this.notas = {};
  }
}

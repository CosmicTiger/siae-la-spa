import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CurriculaService } from '../../docentes/service/curricula.service';
import { AlumnosService } from '../../alumnos/service/alumnos.service';
import { DocentesService } from '../../docentes/service/docentes.service';
import { MatriculasService } from '../../matriculas/service/matriculas.service';
import { NivelService } from '../../catalogos/niveles/service/nivel.service';
import { CalificacionService } from '../service/calificacion.service';

interface AlumnoItem {
  alumnoId: number;
  nombre: string;
}

interface CursoGroup {
  docenteNivelDetalleCursoId: number;
  docenteId: number;
  docenteNombre: string;
  cursoId: number;
  cursoDescripcion: string;
  curriculas: any[];
  notas: Record<string, number | null>;
}

interface NivelDetalleGroup {
  nivelDetalleId: number;
  nivelId: number;
  gradoSeccionId: number;
  nivelDescripcion: string;
  turno?: string | null;
  gradoDescripcion: string;
  seccionDescripcion: string;
  alumnos: AlumnoItem[];
  cursos: CursoGroup[];
}

@Component({
  standalone: true,
  selector: 'app-calificaciones-agrupadas',
  imports: [CommonModule],
  templateUrl: './calificaciones-agrupadas.component.html',
})
export class CalificacionesAgrupadasComponent implements OnInit {
  private nivelesSvc = inject(NivelService);
  private curriculasSvc = inject(CurriculaService);
  private matriculasSvc = inject(MatriculasService);
  private calificacionesSvc = inject(CalificacionService);
  private alumnosSvc = inject(AlumnosService);
  private docentesSvc = inject(DocentesService);

  loading = false;
  error: string | null = null;
  grupos: NivelDetalleGroup[] = [];

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;

    forkJoin({
      nivelesDetalle: this.nivelesSvc.getNivelesDetalle(),
      asignados: this.curriculasSvc.getAsignados({ page: 1, pageSize: 500, list: 'ACTIVE' }),
      alumnos: this.alumnosSvc.list(1, 40),
      docentes: this.docentesSvc.list(1, 200),
    }).subscribe({
      next: ({ nivelesDetalle, asignados, alumnos, docentes }) => {
        const niveles = (nivelesDetalle || []).filter((nd: any) => nd?.activo !== false);
        const asignaciones = asignados?.items || [];
        const alumnosItems = alumnos?.items || [];
        const docentesItems = docentes?.items || [];

        const alumnosMap = new Map<number, string>();
        alumnosItems.forEach((a: any) => {
          const nombre = `${a.nombres || ''} ${a.apellidos || ''}`.trim();
          if (a.id) alumnosMap.set(a.id, nombre || `Alumno ${a.id}`);
        });

        const docentesMap = new Map<number, string>();
        docentesItems.forEach((d: any) => {
          const nombre = `${d.nombres || ''} ${d.apellidos || ''}`.trim();
          if (d.id) docentesMap.set(d.id, nombre || `Docente ${d.id}`);
        });

        const groupRequests = niveles.map((nd: any) =>
          this.buildGroup(nd, asignaciones, alumnosMap, docentesMap).pipe(map((g) => g)),
        );

        if (!groupRequests.length) {
          this.grupos = [];
          return;
        }

        forkJoin(groupRequests).subscribe({
          next: (groups) => {
            this.grupos = groups || [];
          },
          error: () => {
            this.error = 'Error cargando datos agrupados.';
          },
          complete: () => (this.loading = false),
        });
      },
      error: () => {
        this.error = 'Error cargando niveles o asignaciones.';
        this.loading = false;
      },
    });
  }

  notaValue(curso: CursoGroup, alumnoId: number, curriculaId: number) {
    return curso.notas[`${alumnoId}-${curriculaId}`] ?? null;
  }

  private buildGroup(
    nivelDetalle: any,
    asignaciones: any[],
    alumnosMap: Map<number, string>,
    docentesMap: Map<number, string>,
  ) {
    const cursosAsignados = (asignaciones || []).filter(
      (a: any) =>
        a.activo === true &&
        Number(a.nivelId) === Number(nivelDetalle.nivelId) &&
        Number(a.gradoSeccionId) === Number(nivelDetalle.gradoSeccionId),
    );

    const alumnos$ = this.matriculasSvc
      .byNivelDetalle(nivelDetalle.nivelDetalleId)
      .pipe(map((matriculas: any[]) => this.mapAlumnos(matriculas, alumnosMap)));

    return alumnos$.pipe(
      switchMap((alumnos) => {
        const cursos$ = cursosAsignados.length
          ? forkJoin(cursosAsignados.map((a: any) => this.loadCursoGroup(a, alumnos, docentesMap)))
          : of([] as CursoGroup[]);

        return cursos$.pipe(
          map((cursos) => ({
            nivelDetalleId: nivelDetalle.nivelDetalleId,
            nivelId: nivelDetalle.nivelId,
            gradoSeccionId: nivelDetalle.gradoSeccionId,
            nivelDescripcion: nivelDetalle.nivelDescripcion,
            turno: nivelDetalle.turno,
            gradoDescripcion: nivelDetalle.gradoDescripcion,
            seccionDescripcion: nivelDetalle.seccionDescripcion,
            alumnos,
            cursos,
          })),
        );
      }),
    );
  }

  private loadCursoGroup(asignacion: any, alumnos: AlumnoItem[], docentesMap: Map<number, string>) {
    const notasRequests = alumnos.length
      ? forkJoin(alumnos.map((a) => this.calificacionesSvc.obtenerNotasByAlumno(a.alumnoId)))
      : of([]);

    return forkJoin({
      curriculas: this.curriculasSvc.getCurriculas(asignacion.id),
      notas: notasRequests,
    }).pipe(
      map(({ curriculas, notas }) => {
        const curriculasList = (curriculas || []).filter((c: any) => c.activo !== false);
        const notasMap: Record<string, number | null> = {};
        const notasArray = Array.isArray(notas) ? notas : [];

        notasArray.forEach((list: any, idx: number) => {
          const alumno = alumnos[idx];
          const notasList = list || [];
          (notasList || []).forEach((n: any) => {
            const alumnoId = n.alumnoId ?? alumno?.alumnoId;
            const curriculaId = n.curriculaId ?? n.asignaturaId ?? n.subjectId ?? n.curricula?.id;
            if (alumnoId && curriculaId) {
              notasMap[`${alumnoId}-${curriculaId}`] = n.nota ?? null;
            }
          });
        });

        return {
          docenteNivelDetalleCursoId: asignacion.id,
          docenteId: asignacion.docenteId,
          docenteNombre: docentesMap.get(asignacion.docenteId) || `Docente ${asignacion.docenteId}`,
          cursoId: asignacion.cursoId,
          cursoDescripcion: asignacion.cursoDescripcion,
          curriculas: curriculasList,
          notas: notasMap,
        } as CursoGroup;
      }),
    );
  }

  private mapAlumnos(matriculas: any[], alumnosMap: Map<number, string>) {
    const activos = (matriculas || []).filter((m) => m.activo !== false);
    return activos
      .map((m) => {
        const alumnoId = m.alumnoId ?? m.alumno?.id ?? m.alumno?.alumnoId ?? m.id;
        const nombre = alumnosMap.get(alumnoId) || `Alumno ${alumnoId}`;
        return { alumnoId, nombre } as AlumnoItem;
      })
      .filter((a) => !!a.alumnoId);
  }
}

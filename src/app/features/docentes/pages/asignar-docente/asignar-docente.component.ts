import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Component, inject, signal, OnInit } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DocentesService } from '@app/features/docentes/service/docentes.service';
import { DocenteAsignacionDto, DocenteReadDto } from '@app/core/models/persona.model';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NivelService } from '@app/features/catalogos/niveles/service/nivel.service';
import { CursoService } from '@app/features/catalogos/cursos/service/curso.service';
import { NivelDetalleResumenDto } from '../../../catalogos/niveles/service/nivel.service';

interface CursoAsignableDto {
  Id: number;
  nivelDetalleId: number;
  cursoId: number;

  nivelDescripcion?: string;
  turno?: string;
  gradoDescripcion?: string;
  seccionDescripcion?: string;
  cursoDescripcion?: string;
}

@Component({
  selector: 'app-asignar-docente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './asignar-docente.component.html',
  styleUrl: './asignar-docente.component.css',
})
export class AsignarDocenteComponent implements OnInit {
  private docentesSvc = inject(DocentesService);
  private nivelesSvc = inject(NivelService);
  private cursosSvc = inject(CursoService);
  private messageService = inject(MessageService);

  search = new FormControl('', { nonNullable: true });

  page = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);

  items = signal<DocenteReadDto[]>([]);

  cursos = signal<CursoAsignableDto[]>([]);

  docenteSeleccionadoId: number | null = null;

  ngOnInit(): void {
    this.loadDocentes();
    this.loadCursos();
  }

  loadDocentes() {
    this.docentesSvc.list(this.page(), this.pageSize(), this.search.value).subscribe({
      next: (pr) => {
        this.items.set(pr.items || []);
        this.totalItems.set(pr.totalItems || 0);
      },
      error: (err) => console.error('Error cargando docentes', err),
    });
  }

  onSearchChange() {
    this.page.set(1);
    this.loadDocentes();
  }

  loadCursos() {
    console.log('Cargando cursos + niveles + grados...');

    forkJoin({
      asignaciones: this.nivelesSvc.getCursosPorNivelDetalle(),

      nivelesDetalle: this.nivelesSvc.getNivelesDetalle(),

      cursos: this.cursosSvc.list(1, 500),
    }).subscribe({
      next: ({ asignaciones, nivelesDetalle, cursos }) => {
        const mapNivel = new Map<number, NivelDetalleResumenDto>();
        (nivelesDetalle || []).forEach((nd) => mapNivel.set(nd.nivelDetalleId, nd));

        const cursosItems = cursos.items || cursos || [];
        const mapCurso = new Map<number, any>();
        cursosItems.forEach((c: any) => mapCurso.set(c.id, c));

        const enriched = (asignaciones || []).map((a: any) => {
          const nd = mapNivel.get(a.nivelDetalleId);
          const c = mapCurso.get(a.cursoId);

          const item: CursoAsignableDto = {
            Id: a.nivelDetalleCursoId ?? a.id,
            nivelDetalleId: a.nivelDetalleId,
            cursoId: a.cursoId,

            nivelDescripcion: nd?.nivelDescripcion,
            turno: nd?.turno,
            gradoDescripcion: nd?.gradoDescripcion,
            seccionDescripcion: nd?.seccionDescripcion,

            cursoDescripcion: c?.descripcion ?? a.cursoDescripcion,
          };

          return item;
        });

        console.log('Cursos enriquecidos =>', enriched);
        this.cursos.set(enriched);
      },
      error: (err) => console.error('Error cargando info de cursos', err),
    });
  }

  asignarDocente(curso: CursoAsignableDto) {
    if (!this.docenteSeleccionadoId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Selecciona un docente primero.',
      });
      return;
    }
    const dto: DocenteAsignacionDto = {
      docenteId: this.docenteSeleccionadoId,
      nivelDetalleCursoId: curso.nivelDetalleId,
      activo: true,
    };

    this.docentesSvc.asignarDocenteACurso([dto]).subscribe({
      next: () => {
        const docente = this.items().find((d) => d.id === this.docenteSeleccionadoId);
        const nombreDocente = docente
          ? `${docente.nombres} ${docente.apellidos}`
          : `Docente ${this.docenteSeleccionadoId}`;

        const detalleCurso = `${curso.nivelDescripcion} (${curso.turno}) - ${curso.gradoDescripcion} ${curso.seccionDescripcion} · ${curso.cursoDescripcion}`;

        this.messageService.add({
          severity: 'success',
          summary: 'Asignación realizada',
          detail: `${nombreDocente} asignado a ${detalleCurso}`,
        });
      },
      error: (err) => {
        console.error('Error asignando docente', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo asignar el docente al curso.',
        });
      },
    });
  }
}

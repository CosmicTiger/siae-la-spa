import { CommonModule } from '@angular/common';
import { Component, signal, computed, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  DocenteReadDto,
  DocenteCursoDto,
  CurriculaDto,
  CurriculaCreateDto,
} from '@app/core/models/persona.model';
import { CurriculaService } from '@app/features/docentes/service/curricula.service';
import { DocentesService } from '@app/features/docentes/service/docentes.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-curricula',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './curricula.component.html',
  styleUrls: ['./curricula.component.css'],
})
export class CurriculaComponent {
  private docentesSvc = inject(DocentesService);
  private curriculaSvc = inject(CurriculaService);

  // filtros
  docenteControl = new FormControl<DocenteReadDto | null>(null);
  searchDocente = new FormControl('', { nonNullable: true });

  // resultados
  docentes = signal<DocenteReadDto[]>([]);
  asignaciones = signal<DocenteCursoDto[]>([]);
  curriculasPorAsignacion = signal<Record<number, CurriculaDto[]>>({});

  page = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

  loadingAsignaciones = signal(false);
  loadingCurriculas = signal(false);
  saving = signal(false);

  constructor() {
    // búsqueda docentes
    this.searchDocente.valueChanges.subscribe((value) => {
      this.buscarDocentes(value);
    });
    this.buscarDocentes('');
  }

  buscarDocentes(search?: string) {
    this.docentesSvc.list(1, 20, search).subscribe((r) => {
      this.docentes.set(r.items ?? []);
    });
  }

  onDocenteChange() {
    this.page.set(1);
    this.loadAsignaciones();
  }

  loadAsignaciones() {
    const docente = this.docenteControl.value;
    if (!docente) return;

    this.loadingAsignaciones.set(true);
    this.asignaciones.set([]);
    this.curriculasPorAsignacion.set({});

    this.curriculaSvc
      .getAsignados({
        page: this.page(),
        pageSize: this.pageSize(),
        docenteId: docente.id,
        list: 'ALL',
      })
      .pipe(
        finalize(() => {
          this.loadingAsignaciones.set(false);
        })
      )
      .subscribe({
        next: (r) => {
          console.log('Asignados =>', r);
          const items = r.items ?? [];
          this.asignaciones.set(items);
          this.totalItems.set(r.totalItems ?? items.length);

          // cargar currículas de cada asig
          items.forEach((a) => this.loadCurriculasAsignacion(a.id));
        },
        error: (err) => {
          console.error('Error cargando asignaciones', err);
        },
      });
  }

  loadCurriculasAsignacion(docenteNivelDetalleCursoId: number) {
    this.loadingCurriculas.set(true);
    this.curriculaSvc
      .getCurriculas(docenteNivelDetalleCursoId)
      .pipe(finalize(() => this.loadingCurriculas.set(false)))
      .subscribe({
        next: (list) => {
          const current = { ...this.curriculasPorAsignacion() };
          current[docenteNivelDetalleCursoId] = list ?? [];
          this.curriculasPorAsignacion.set(current);
        },
        error: (err) => {
          console.error('Error cargando currículas', err);
        },
      });
  }

  crearCurricula(asignacion: DocenteCursoDto) {
    const descripcion = prompt(
      `Descripción de la currícula para ${asignacion.cursoDescripcion} (${asignacion.gradoDescripcion})`
    );
    if (!descripcion) return;

    const dto: CurriculaCreateDto = {
      docenteNivelDetalleCursoId: asignacion.id,
      descripcion,
    };

    this.saving.set(true);
    this.curriculaSvc
      .createCurricula(dto)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.loadCurriculasAsignacion(asignacion.id);
        },
        error: (err) => {
          console.error('Error creando currícula', err);
        },
      });
  }

  eliminarCurricula(c: CurriculaDto) {
    if (!confirm('¿Eliminar currícula?')) return;
    this.curriculaSvc.deleteCurricula(c.id).subscribe(() => {
      const map = { ...this.curriculasPorAsignacion() };
      const list = map[c.docenteNivelDetalleCursoId] || [];
      map[c.docenteNivelDetalleCursoId] = list.filter((x) => x.id !== c.id);
      this.curriculasPorAsignacion.set(map);
    });
  }

  prev() {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.loadAsignaciones();
    }
  }

  next() {
    if (this.page() < this.totalPages()) {
      this.page.update((p) => p + 1);
      this.loadAsignaciones();
    }
  }
}

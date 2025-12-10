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

  modalAbierto = signal(false);
  asignacionSeleccionada = signal<DocenteCursoDto | null>(null);
  descripcionCurricula = new FormControl('', { nonNullable: true });

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
          const items = r?.items ?? [];
          this.asignaciones.set(items);
          this.totalItems.set(r?.totalItems ?? items.length);

          items.forEach((a) => this.loadCurriculasAsignacion(a.id));
        },
        error: (err) => {
          console.error('Error cargando asignaciones', err);
        },
      });
  }

  loadCurriculasAsignacion(id: number) {
    this.loadingCurriculas.set(true);
    this.curriculaSvc
      .getCurriculas(id)
      .pipe(finalize(() => this.loadingCurriculas.set(false)))
      .subscribe({
        next: (list) => {
          const activos = (list ?? []).filter((c) => c.activo); // 👈
          const current = { ...this.curriculasPorAsignacion() };
          current[id] = activos;
          this.curriculasPorAsignacion.set(current);
        },
        error: (err) => {
          console.error('Error cargando currículas', err);
        },
      });
  }

  abrirModalCurricula(asignacion: DocenteCursoDto) {
    console.log('Click agregar currícula', asignacion);

    this.asignacionSeleccionada.set(asignacion);

    this.descripcionCurricula.setValue('');

    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.asignacionSeleccionada.set(null);
  }

  guardarCurriculaDesdeModal() {
    const asignacion = this.asignacionSeleccionada();
    if (!asignacion) return;

    const descripcion = this.descripcionCurricula.value.trim();
    if (!descripcion) {
      // podrías poner un pequeño mensaje si quieres
      return;
    }

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
          // recarga currículas para esa asignación
          this.loadCurriculasAsignacion(asignacion.id);
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error creando currícula', err);
        },
      });
  }
  eliminarCurricula(asignacionId: number, c: CurriculaDto) {
    this.saving.set(true);
    this.curriculaSvc
      .deleteCurricula(c.id)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.loadCurriculasAsignacion(asignacionId);
        },
        error: (err) => {
          console.error('Error eliminando currícula', err);
        },
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

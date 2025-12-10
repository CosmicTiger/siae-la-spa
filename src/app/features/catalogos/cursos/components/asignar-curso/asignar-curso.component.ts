import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CursoService, AsignarCursoPayload } from '../../service/curso.service';
import { finalize } from 'rxjs/operators';
import { NivelDetalleDto } from '@app/core/models/persona.model';
import { CursoReadDto } from '@app/core/models/cursos.model';
import {
  NivelDetalleResumenDto,
  NivelService,
} from '@app/features/catalogos/niveles/service/nivel.service';

@Component({
  selector: 'app-asignar-curso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './asignar-curso.component.html',
})
export class AsignarCursoComponent implements OnInit {
  private cursoSvc = inject(CursoService);
  private nivelesSvc = inject(NivelService);
  page = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  items = signal<CursoReadDto[]>([]);
  search = new FormControl('', { nonNullable: true });

  nivelesDetalle = signal<NivelDetalleDto[]>([]);
  cursos = signal<CursoReadDto[]>([]);

  loading = signal(false);

  form = new FormGroup({
    nivelDetalleId: new FormControl<number | null>(null),
    cursoId: new FormControl<number | null>(null),
    activo: new FormControl<boolean>(true),
  });

  // para saber rápidamente el nivelId a partir del nivelDetalleId
  nivelIdSeleccionado = computed(() => {
    const id = this.form.value.nivelDetalleId;
    if (id == null) return null;
    const nd = this.nivelesDetalle().find((x) => x.nivelDetalleId === id);
    return nd ? nd.nivelId : null;
  });

  ngOnInit() {
    this.cargarNivelesDetalle();
    this.loadCursos();
  }

  cargarNivelesDetalle() {
    const nivelId = this.nivelSeleccionado();

    this.nivelesSvc.getNivelesDetalle(nivelId).subscribe((res) => {
      this.nivelesDetalle.set(res ?? []);
    });
  }

  loadCursos() {
    this.cursoSvc.list(this.page(), this.pageSize(), this.search.value).subscribe((pr) => {
      this.items.set(pr.items);
      this.totalItems.set(pr.totalItems);
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const nivelDetalleId = this.form.value.nivelDetalleId!;
    const cursoId = this.form.value.cursoId!;
    const activo = this.form.value.activo ?? true;

    const nivelId = this.nivelIdSeleccionado();
    if (nivelId == null) {
      console.error('No se pudo determinar nivelId a partir de nivelDetalleId');
      return;
    }

    const payload: AsignarCursoPayload = {
      nivelDetalleId,
      cursoId,
      activo,
    };

    this.loading.set(true);
    this.cursoSvc
      .asignarCursoANivel(nivelId, payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (r) => {
          console.log('Asignación guardada', r);
          // aquí puedes mostrar toast y/o limpiar formulario
        },
        error: (err) => {
          console.error('Error asignando curso', err);
        },
      });
  }

  nivelSeleccionado = signal<number | null>(null);
  nivelDetalleSeleccionado = signal<NivelDetalleResumenDto | null>(null);
  cursoSeleccionado = signal<{ id: number; descripcion: string } | null>(null);

  asignarCurso() {
    const nivelId = this.nivelSeleccionado();
    const nd = this.nivelDetalleSeleccionado();
    const curso = this.cursoSeleccionado();

    if (!nivelId || !nd || !curso) return;

    const payload = {
      nivelDetalleId: nd.nivelDetalleId,
      cursoId: curso.id,
      activo: true,
    };

    this.nivelesSvc.asignarCursoANivel(nivelId, payload).subscribe({
      next: (r) => {
        console.log('Curso asignado', r);
      },
      error: (err) => console.error('Error asignando curso', err),
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { GradoFormComponent } from '../components/grado-form.component';
import { GradoSeccionService } from '../service/grado-seccion.service';
import { NivelService } from '../../niveles/service/nivel.service';
import {
  NivelDetalleCreateDto,
  NivelDetalleResumenDto,
} from '@app/core/models/nivel-detalle.model';
import { GradoSeccionDto } from '@app/core/models/grado.model';

@Component({
  standalone: true,
  selector: 'app-grado-seccion-list',
  imports: [CommonModule, ReactiveFormsModule, GradoFormComponent],
  templateUrl: 'grado-seccion-list.component.html',
})
export class GradoSeccionListComponent implements OnInit {
  private svc = inject(GradoSeccionService);
  private nivelSvc = inject(NivelService);

  loading = false;
  saving = false;

  items = signal<NivelDetalleResumenDto[]>([]);
  niveles = signal<any[]>([]);
  grados = signal<any[]>([]);

  // modal
  modalAbierto = signal(false);
  modalGradoAbierto = signal(false);
  dialogOpen = signal(false);
  dialogInitial = signal<GradoSeccionDto | number | null>(null);
  // edit modal
  modalEditarAbierto = signal(false);
  editarId = signal<number | null>(null);

  formEditar = new FormGroup({
    activo: new FormControl<boolean>(true),
    totalVacantes: new FormControl<number | null>(null),
    vacantesOcupadas: new FormControl<number | null>(null),
  });

  formNuevo = new FormGroup({
    nivelId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    gradoSeccionId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    totalVacantes: new FormControl<number | null>(null),
  });

  ngOnInit(): void {
    this.load();
    this.cargarNiveles();
    this.cargarGrados();
  }

  load() {
    this.loading = true;
    this.svc.listar().subscribe({
      next: (r) => this.items.set(r || []),
      complete: () => (this.loading = false),
      error: (e) => {
        console.error(e);
        this.loading = false;
      },
    });
  }

  cargarNiveles() {
    console.log('Cargando niveles...');
    this.nivelSvc.listar(1, 200).subscribe({
      next: (res) => {
        this.niveles.set(res || []);
      },
      error: (e) => console.error('Error cargando niveles', e),
    });
  }

  cargarGrados() {
    console.log('Cargando grados base...');
    this.svc.listarGradosBase().subscribe({
      next: (res) => {
        console.log('Grados base =>', res);
        this.grados.set(res || []);
      },
      error: (e) => console.error('Error cargando grados', e),
    });
  }

  abrirModalNuevo() {
    this.formNuevo.reset({
      nivelId: null,
      gradoSeccionId: null,
      totalVacantes: null,
    });
    this.modalAbierto.set(true);
  }

  abrirModalGradoBase() {
    // open the standalone grade dialog for creating a grado/sección base
    this.modalGradoAbierto.set(true);
    // ensure form reset handled by the dialog component
  }

  onGradoDialogClosed(ok: boolean) {
    this.modalGradoAbierto.set(false);
    if (ok) {
      // refresh the list of grados base and nivel detalle list
      this.cargarGrados();
      this.load();
    }
  }

  cerrarModalNuevo() {
    this.modalAbierto.set(false);
  }

  guardarNuevo() {
    if (this.formNuevo.invalid) {
      this.formNuevo.markAllAsTouched();
      return;
    }

    const value = this.formNuevo.value;
    const dto: NivelDetalleCreateDto = {
      nivelId: value.nivelId!,
      gradoSeccionId: value.gradoSeccionId!,
      totalVacantes: value.totalVacantes ?? null,
    };

    this.saving = true;
    this.nivelSvc.createNivelDetalle(dto).subscribe({
      next: () => {
        this.saving = false;
        this.cerrarModalNuevo();
        this.load();
      },
      error: (e) => {
        console.error(e);
        this.saving = false;
      },
    });
  }

  edit(item: any) {
    // open edit modal for the selected nivelDetalle
    this.editarId.set(item?.nivelDetalleId ?? item?.nivelDetalle?.nivelDetalleId ?? null);
    // populate form
    this.formEditar.setValue({
      activo: item.activo ?? true,
      totalVacantes: item.totalVacantes ?? null,
      vacantesOcupadas: item.vacantesOcupadas ?? null,
    });
    this.modalEditarAbierto.set(true);
  }

  validarVacantes(): boolean {
    const total = Number(this.formEditar.controls.totalVacantes.value ?? 0);
    const ocupadas = Number(this.formEditar.controls.vacantesOcupadas.value ?? 0);
    if (this.formEditar.controls.totalVacantes.value == null) return true; // no total -> ok
    return total >= ocupadas;
  }

  guardarEditar() {
    if (!this.editarId()) return;

    // check basic validation
    if (!this.validarVacantes()) {
      alert('El total de vacantes no puede ser menor a las vacantes ocupadas.');
      return;
    }

    const payload: any = {
      activo: this.formEditar.controls.activo.value,
      totalVacantes: this.formEditar.controls.totalVacantes.value ?? null,
      vacantesOcupadas: this.formEditar.controls.vacantesOcupadas.value ?? null,
    };

    this.saving = true;
    this.nivelSvc.updateNivelDetalle(this.editarId()!, payload).subscribe({
      next: () => {
        this.saving = false;
        this.modalEditarAbierto.set(false);
        this.editarId.set(null);
        this.load();
      },
      error: (e) => {
        console.error('Error actualizando nivel detalle', e);
        this.saving = false;
      },
    });
  }

  remove(id: any) {
    if (!confirm('Eliminar grado/sección?')) return;
    this.svc.delete(id).subscribe({
      next: () => this.load(),
      error: (e) => console.error(e),
    });
  }
}

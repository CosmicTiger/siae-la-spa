import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { GradoSeccionService } from '../service/grado-seccion.service';
import {
  NivelService,
  NivelDetalleCreateDto,
  NivelDetalleResumenDto,
} from '../../niveles/service/nivel.service';

@Component({
  standalone: true,
  selector: 'app-grado-seccion-list',
  imports: [CommonModule, ReactiveFormsModule],
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
    console.log('edit gradoSeccion / nivelDetalle', item);
  }

  remove(id: any) {
    if (!confirm('Eliminar grado/sección?')) return;
    this.svc.delete(id).subscribe({
      next: () => this.load(),
      error: (e) => console.error(e),
    });
  }
}

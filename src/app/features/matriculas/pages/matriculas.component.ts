import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatriculasService } from '../service/matriculas.service';
import { AlumnosService } from '../../alumnos/service/alumnos.service';
import { MatriculaModalService } from '../service/matricula-modal.service';
import { MatriculaDialogComponent } from '../components/matricula-dialog.component';

@Component({
  standalone: true,
  selector: 'app-matriculas',
  imports: [CommonModule, MatriculaDialogComponent],
  templateUrl: './matriculas.component.html',
})
export class MatriculasComponent implements OnInit {
  alumnos: any[] = [];
  selectedAlumnoId = signal<number | null>(null);
  matriculas: any[] = [];
  showDialog = signal(false);

  constructor(
    private svc: MatriculasService,
    private alumnosSvc: AlumnosService,
    private modalSvc: MatriculaModalService
  ) {}

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
  }

  loadByAlumno(alumnoId: number | null) {
    if (alumnoId == null) {
      this.matriculas = [];
      return;
    }
    this.svc.byAlumno(alumnoId).subscribe((r) => (this.matriculas = r || []));
  }

  openNew() {
    this.showDialog.set(true);
  }

  onDialogClosed(created: boolean) {
    this.showDialog.set(false);
    if (created && this.selectedAlumnoId()) this.loadByAlumno(this.selectedAlumnoId()!);
  }
}

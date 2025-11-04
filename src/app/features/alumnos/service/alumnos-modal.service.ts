import { Injectable, inject } from '@angular/core';
import { ModalHostService } from '@shared/components/modal-host/modal-host.service';
import { AlumnoDetailComponent } from '../components/alumno-detail.component';

@Injectable({ providedIn: 'root' })
export class AlumnosModalService {
  private host = inject(ModalHostService);

  open(id: number | null = null) {
    // open the detail component in the host, providing alumnoId as MODAL_DATA
    return this.host.open({ component: AlumnoDetailComponent, data: { alumnoId: id } });
  }
}

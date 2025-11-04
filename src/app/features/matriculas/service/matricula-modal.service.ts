import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { ModalHostService } from '@shared/components/modal-host/modal-host.service';
import { MatriculaDialogComponent } from '../components/matricula-dialog.component';

@Injectable({ providedIn: 'root' })
export class MatriculaModalService {
  private host = inject(ModalHostService);
  private openSubject = new Subject<number | null>();
  open$ = this.openSubject.asObservable();

  open(alumnoId: number | null = null) {
    // emit for legacy listeners (components listening for open$)
    this.openSubject.next(alumnoId);
    return this.host.open({ component: MatriculaDialogComponent, data: { alumnoId } });
  }
}

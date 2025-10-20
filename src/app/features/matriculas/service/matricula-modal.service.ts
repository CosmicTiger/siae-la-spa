import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MatriculaModalService {
  private openSubject = new Subject<number | null>();
  open$ = this.openSubject.asObservable();

  open(alumnoId: number | null = null) {
    this.openSubject.next(alumnoId);
  }
}

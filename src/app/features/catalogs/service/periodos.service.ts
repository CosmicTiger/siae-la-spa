import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PeriodosService {
  http = inject(HttpClient);
  base = `${environment.apiBase}/api/periodos`;

  list() {
    return this.http.get<any[]>(this.base).pipe(map((r) => r || []));
  }
}

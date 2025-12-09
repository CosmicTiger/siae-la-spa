import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PeriodosService {
  api = inject(ApiService);
  base = '/api/periodos';

  list() {
    return this.api.get<any[]>(this.base).pipe(map((r) => r || []));
  }
}

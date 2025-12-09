import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NivelesService {
  api = inject(ApiService);
  base = '/api/niveles';

  list() {
    return this.api.get<any[]>(this.base).pipe(map((r) => r || []));
  }
}

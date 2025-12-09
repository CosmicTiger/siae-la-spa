import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CursosService {
  api = inject(ApiService);
  base = '/api/cursos';

  list(page = 1, pageSize = 50, search = '') {
    const params: Record<string, any> = { page, pageSize };
    if (search) params['search'] = search;
    return this.api.get<any[]>(this.base, params).pipe(map((r) => r || []));
  }

  getById(id: number) {
    return this.api.get<any>(`${this.base}/${id}`);
  }

  create(payload: any) {
    return this.api.post<any>(this.base, payload);
  }

  update(id: number, payload: any) {
    return this.api.put<any>(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.api.delete<any>(`${this.base}/${id}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GradoSeccionService {
  private api = inject(ApiService);
  private base = '/api/grado-secciones';

  listar(page = 1, pageSize = 50, filter?: any) {
    const params: Record<string, any> = { page, pageSize };
    if (filter) Object.keys(filter).forEach((k) => (params[k] = filter[k]));
    return this.api.get<any>(this.base, params).pipe(map((r) => r));
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

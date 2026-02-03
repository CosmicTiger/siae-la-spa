import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { map } from 'rxjs/operators';

export interface AsignarCursoPayload {
  nivelDetalleId: number;
  cursoId: number;
  activo: boolean;
}
@Injectable({ providedIn: 'root' })
export class CursoService {
  private api = inject(ApiService);
  private base = '/api/cursos';
  private baseNiveles = '/api/niveles';

  list(page = 1, pageSize = 50, filter?: any) {
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

  setActive(id: number, active: boolean, curso: any) {
    const payload: any = {
      ...curso,
      activo: active,
    };

    return this.update(id, payload);
  }

  asignarCursoANivel(nivelId: number, payload: AsignarCursoPayload) {
    return this.api.post<any>(`${this.baseNiveles}/${nivelId}/cursos`, payload).pipe(map((r) => r));
  }
}

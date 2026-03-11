import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { map } from 'rxjs/operators';
import { getCreatedAtIso } from '@app/core/utils/date.util';

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
    // Example mapping: attach createdAtIso computed from audit.fechaIngreso or fechaRegistro
    return this.api.get<any>(this.base, params).pipe(
      map((r) => {
        if (Array.isArray(r)) return r.map((it) => ({ ...it, createdAtIso: getCreatedAtIso(it) }));
        if (r?.data && Array.isArray(r.data))
          return {
            ...r,
            data: r.data.map((it: any) => ({ ...it, createdAtIso: getCreatedAtIso(it) })),
          };
        return r;
      }),
    );
  }

  getById(id: number) {
    return this.api
      .get<any>(`${this.base}/${id}`)
      .pipe(map((r) => ({ ...r, createdAtIso: getCreatedAtIso(r) })));
  }

  create(payload: any) {
    // Ensure server-managed fields are not sent
    const body = { ...payload };
    delete (body as any).fechaRegistro;
    delete (body as any).audit;
    return this.api.post<any>(this.base, body);
  }

  update(id: number, payload: any) {
    const body = { ...payload };
    delete (body as any).fechaRegistro;
    delete (body as any).audit;
    return this.api.put<any>(`${this.base}/${id}`, body);
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

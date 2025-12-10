import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { map } from 'rxjs/operators';

export interface NivelDetalleResumenDto {
  nivelDetalleId: number;
  nivelId: number;
  nivelDescripcion: string;
  turno: string;
  gradoSeccionId: number;
  gradoDescripcion: string;
  seccionDescripcion: string;
}

export interface NivelDetalleCreateDto {
  nivelId: number;
  gradoSeccionId: number;
  totalVacantes?: number | null;
}
@Injectable({ providedIn: 'root' })
export class NivelService {
  private api = inject(ApiService);
  private base = '/api/niveles';

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

  getNivelesDetalle(nivelId: number | null = null) {
    const params: any = {};
    if (nivelId) params.nivelId = nivelId;

    return this.api
      .get<NivelDetalleResumenDto[]>(`${this.base}/detalle`, params)
      .pipe(map((r) => r));
  }

  getCursosPorNivelDetalle() {
    return this.api.get<any[]>(`/api/niveles/cursos`);
  }

  createNivelDetalle(payload: NivelDetalleCreateDto) {
    return this.api.post<any>(`${this.base}/detalle`, payload);
  }
  asignarCursoANivel(
    nivelId: number,
    payload: { nivelDetalleId: number; cursoId: number; activo: boolean }
  ) {
    return this.api.post<any>(`${this.base}/${nivelId}/cursos`, payload);
  }
}

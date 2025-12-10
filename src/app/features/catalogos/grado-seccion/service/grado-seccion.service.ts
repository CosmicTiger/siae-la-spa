import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { map } from 'rxjs/operators';
import { NivelDetalleResumenDto } from '../../niveles/service/nivel.service';

export interface GradoSeccionDto {
  id: number;
  descripcionGrado: string;
  descripcionSeccion: string;
}

@Injectable({ providedIn: 'root' })
export class GradoSeccionService {
  private api = inject(ApiService);
  private base = '/api/grados';
  private baseNiveles = '/api/niveles';

  listar(nivelId: number | null = null) {
    const params: any = {};
    if (nivelId) params.nivelId = nivelId;

    return this.api
      .get<NivelDetalleResumenDto[]>(`${this.baseNiveles}/detalle`, params)
      .pipe(map((r) => r));
  }

  listarGradosBase() {
    return this.api.get<any>(this.base).pipe(
      map((r) => {
        if (Array.isArray(r)) return r as GradoSeccionDto[];
        if (Array.isArray(r?.data)) return r.data as GradoSeccionDto[];
        return [];
      })
    );
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

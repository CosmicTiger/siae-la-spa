import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { map } from 'rxjs';
import { MatriculaCreateDto, MatriculaReadDto } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class MatriculasService {
  api = inject(ApiService);
  base = '/api/matriculas';

  // POST /api/matriculas
  create(payload: MatriculaCreateDto) {
    return this.api.post<MatriculaReadDto>(this.base, payload);
  }

  // GET /api/matriculas/by-alumno/{alumnoId}
  byAlumno(alumnoId: number, periodoId?: number) {
    const url = `${this.base}/by-alumno/${alumnoId}`;
    const params: Record<string, any> = {};
    if (periodoId != null) params['periodoId'] = periodoId;
    return this.api.get<MatriculaReadDto[]>(url, params).pipe(map((r) => r!));
  }

  // GET /api/matriculas/by-nivel-detalle/{nivelDetalleId}
  byNivelDetalle(nivelDetalleId: number, periodoId?: number) {
    const url = `${this.base}/by-nivel-detalle/${nivelDetalleId}`;
    const params: Record<string, any> = {};
    if (periodoId != null) params['periodoId'] = periodoId;
    return this.api.get<MatriculaReadDto[]>(url, params).pipe(map((r) => r!));
  }
}

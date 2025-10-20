import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';
import { ApiResponse, MatriculaCreateDto, MatriculaReadDto } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class MatriculasService {
  http = inject(HttpClient);
  base = `${environment.apiBase}/api/matriculas`;

  // POST /api/matriculas
  create(payload: MatriculaCreateDto) {
    return this.http.post<ApiResponse<MatriculaReadDto>>(this.base, payload);
  }

  // GET /api/matriculas/by-alumno/{alumnoId}
  byAlumno(alumnoId: number, periodoId?: number) {
    let url = `${this.base}/by-alumno/${alumnoId}`;
    let params = new HttpParams();
    if (periodoId != null) params = params.set('periodoId', periodoId);
    return this.http
      .get<ApiResponse<MatriculaReadDto[]>>(url, { params })
      .pipe(map((r) => r.data!));
  }

  // GET /api/matriculas/by-nivel-detalle/{nivelDetalleId}
  byNivelDetalle(nivelDetalleId: number, periodoId?: number) {
    let url = `${this.base}/by-nivel-detalle/${nivelDetalleId}`;
    let params = new HttpParams();
    if (periodoId != null) params = params.set('periodoId', periodoId);
    return this.http
      .get<ApiResponse<MatriculaReadDto[]>>(url, { params })
      .pipe(map((r) => r.data!));
  }
}

import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CalificacionService {
  private api = inject(ApiService);
  private baseCurricula = '/api/curricula';
  private base = '/api/calificaciones';

  getCurricula(docenteId?: number, cursoId?: number) {
    const params: Record<string, any> = {};
    if (docenteId != null) params['docenteId'] = docenteId;
    if (cursoId != null) params['cursoId'] = cursoId;
    return this.api.get<any>(this.baseCurricula, params).pipe(map((r) => r));
  }

  obtenerNotas(docenteId?: number, cursoId?: number, periodoId?: number) {
    const params: Record<string, any> = {};
    if (docenteId != null) params['docenteId'] = docenteId;
    if (cursoId != null) params['cursoId'] = cursoId;
    if (periodoId != null) params['periodoId'] = periodoId;
    return this.api.get<any>(this.base, params).pipe(map((r) => r));
  }

  guardarNotas(payload: any[]) {
    return this.api.post<any>(`${this.base}/bulk`, payload);
  }

  consultaReporte(paramsObj: any) {
    const params: Record<string, any> = {};
    if (paramsObj) Object.keys(paramsObj).forEach((k) => (params[k] = paramsObj[k]));
    return this.api.get<any>(`${this.base}/reporte`, params).pipe(map((r) => r));
  }
}

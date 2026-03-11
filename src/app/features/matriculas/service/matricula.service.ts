import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MatriculaService {
  private api = inject(ApiService);
  private base = '/api/matriculas';

  registrar(payload: any) {
    const body: any = { ...payload };

    // Map frontend field names to backend expected names
    if (body['periodoId'] != null && body['anioLectivoId'] == null) {
      body['anioLectivoId'] = body['periodoId'];
      delete body['periodoId'];
    }
    if (body['cursoId'] != null && body['nivelDetalleId'] == null) {
      body['nivelDetalleId'] = body['cursoId'];
      delete body['cursoId'];
    }
    // rename boolean repetente field if present (typo differences)
    if (body['esRepetente'] != null && body['esRepitente'] == null) {
      body['esRepitente'] = body['esRepetente'];
      delete body['esRepetente'];
    }

    // Ensure explicit nulls for optional fields the backend expects
    if (!('apoderadoId' in body)) body['apoderadoId'] = null;
    if (!('situacion' in body)) body['situacion'] = null;
    if (!('institucionProcedencia' in body)) body['institucionProcedencia'] = null;

    return this.api.post<any>(this.base, body);
  }

  listar(page = 1, pageSize = 10, filter?: any) {
    const params: Record<string, any> = { page, pageSize };
    if (filter) Object.keys(filter).forEach((k) => (params[k] = (filter as any)[k]));
    return this.api.get<any>(this.base, params).pipe(map((r) => r));
  }

  obtenerCantidadVacantes(cursoId: number, periodoId: number) {
    const params: Record<string, any> = { cursoId, periodoId };
    return this.api.get<number>(`${this.base}/vacantes`, params).pipe(map((r) => r));
  }

  vacantes(cursoId: number, periodoId: number) {
    return this.obtenerCantidadVacantes(cursoId, periodoId);
  }

  consultaReporte(paramsObj: any) {
    const params: Record<string, any> = {};
    if (paramsObj) Object.keys(paramsObj).forEach((k) => (params[k] = paramsObj[k]));
    return this.api.get<any>(`${this.base}/reporte`, params).pipe(map((r) => r));
  }
}

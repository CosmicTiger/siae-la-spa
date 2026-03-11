import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { map } from 'rxjs';
import { MatriculaCreateDto, MatriculaReadDto } from '../../../core/models/persona.model';

@Injectable({ providedIn: 'root' })
export class MatriculasService {
  api = inject(ApiService);
  base = '/api/matriculas';

  // POST /api/matriculas
  create(payload: MatriculaCreateDto) {
    const body: any = { ...payload } as any;

    // backend now expects 'anioLectivoId' instead of 'periodoId'
    if ((body as any).periodoId != null && (body as any).anioLectivoId == null) {
      body.anioLectivoId = (body as any).periodoId;
      delete (body as any).periodoId;
    }
    // handle name mismatch for repetente flag
    if ((body as any).esRepetente != null && (body as any).esRepitente == null) {
      body.esRepitente = (body as any).esRepetente;
      delete (body as any).esRepetente;
    }

    // ensure optional fields exist
    if (!('apoderadoId' in body)) body.apoderadoId = null;
    if (!('situacion' in body)) body.situacion = null;
    if (!('institucionProcedencia' in body)) body.institucionProcedencia = null;

    return this.api.post<MatriculaReadDto>(this.base, body);
  }

  // GET /api/matriculas/by-alumno/{alumnoId}
  byAlumno(alumnoId: number, anioLectivoId?: number) {
    const url = `${this.base}/by-alumno/${alumnoId}`;
    const params: Record<string, any> = {};
    if (anioLectivoId != null) params['anioLectivoId'] = anioLectivoId;
    return this.api.get<MatriculaReadDto[]>(url, params).pipe(map((r) => r!));
  }

  // GET /api/matriculas/by-nivel-detalle/{nivelDetalleId}
  byNivelDetalle(nivelDetalleId: number, anioLectivoId?: number) {
    const url = `${this.base}/by-nivel-detalle/${nivelDetalleId}`;
    const params: Record<string, any> = {};
    if (anioLectivoId != null) params['anioLectivoId'] = anioLectivoId;
    return this.api.get<MatriculaReadDto[]>(url, params).pipe(map((r) => r!));
  }
}

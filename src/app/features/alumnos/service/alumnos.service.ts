import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { map } from 'rxjs';
import {
  ApiResponse,
  PaginationResult,
  AlumnoReadDto,
  AlumnoReadDetailDto,
  AlumnoCreateWithAccountsDto,
  AlumnoCreateResultDto,
} from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class AlumnosService {
  http = inject(HttpClient);
  base = `${environment.apiBase}/api/alumnos`;

  list(page = 1, pageSize = 10, search = '') {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.http
      .get<ApiResponse<PaginationResult<AlumnoReadDto>>>(this.base, { params })
      .pipe(map((r) => r.data!));
  }

  getById(id: number) {
    return this.http.get<ApiResponse<AlumnoReadDetailDto>>(`${this.base}/${id}`).pipe(
      map((r) => {
        const d = r.data as any;
        if (!d) return null;

        // If the backend already returned the detailed shape, trust it
        if (d.alumnoId && d.persona) return d as AlumnoReadDetailDto;

        // Otherwise try to normalize the flat shape into the detailed form
        const persona = d.persona ||
          d.Persona ||
          d.alumnoPersona || {
            nombres: d.nombres,
            apellidos: d.apellidos,
            documentoIdentidad: d.documentoIdentidad ?? d.dni ?? null,
            fechaNacimiento: d.fechaNacimiento ?? null,
            sexo: d.sexo ?? d.genero ?? null,
            ciudad: d.ciudad ?? null,
            direccion: d.direccion ?? null,
            email: d.email ?? null,
            numeroTelefono: d.numeroTelefono ?? d.telefono ?? null,
          };

        const matriculaActual = d.matriculaActual || d.matricula || null;

        const tutor = d.tutor || d.apoderado || null;

        const normalized: AlumnoReadDetailDto = {
          alumnoId: d.alumnoId ?? d.id,
          persona,
          matriculaActual,
          tutor,
          activo: d.activo ?? true,
        };

        return normalized;
      })
    );
  }

  create(payload: AlumnoCreateWithAccountsDto) {
    return this.http.post<ApiResponse<AlumnoCreateResultDto>>(this.base, payload);
  }

  update(id: number, payload: any) {
    return this.http.put<ApiResponse<any>>(`${this.base}/${id}`, payload);
  }

  setActive(id: number, activo: boolean) {
    // PATCH with partial update for active flag
    return this.http.patch<ApiResponse<any>>(`${this.base}/${id}`, { activo });
  }
}

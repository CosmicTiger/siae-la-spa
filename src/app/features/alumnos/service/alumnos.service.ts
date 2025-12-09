import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { map } from 'rxjs';
import {
  PaginationResult,
  AlumnoReadDto,
  AlumnoReadDetailDto,
  AlumnoCreateWithAccountsDto,
  AlumnoCreateResultDto,
} from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class AlumnosService {
  api = inject(ApiService);
  base = '/api/alumnos';

  list(page = 1, pageSize = 10, search = '') {
    const params: Record<string, any> = { page, pageSize };
    if (search) params['search'] = search;
    return this.api.get<PaginationResult<AlumnoReadDto>>(this.base, params).pipe(map((r) => r!));
  }

  getById(id: number) {
    return this.api.get<AlumnoReadDetailDto>(`${this.base}/${id}`).pipe(
      map((d) => {
        const r = d as any;
        if (!r) return null;

        // If the backend already returned the detailed shape, trust it
        if (r.alumnoId && r.persona) return r as AlumnoReadDetailDto;

        // Otherwise try to normalize the flat shape into the detailed form
        const persona = r.persona ||
          r.Persona ||
          r.alumnoPersona || {
            nombres: r.nombres,
            apellidos: r.apellidos,
            documentoIdentidad: r.documentoIdentidad ?? r.dni ?? null,
            fechaNacimiento: r.fechaNacimiento ?? null,
            sexo: r.sexo ?? r.genero ?? null,
            ciudad: r.ciudad ?? null,
            direccion: r.direccion ?? null,
            email: r.email ?? null,
            numeroTelefono: r.numeroTelefono ?? r.telefono ?? null,
          };

        const matriculaActual = r.matriculaActual || r.matricula || null;

        const tutor = r.tutor || r.apoderado || null;

        const normalized: AlumnoReadDetailDto = {
          alumnoId: r.alumnoId ?? r.id,
          persona,
          matriculaActual,
          tutor,
          activo: r.activo ?? true,
        };

        return normalized;
      })
    );
  }

  create(payload: AlumnoCreateWithAccountsDto) {
    return this.api.post<AlumnoCreateResultDto>(this.base, payload);
  }

  update(id: number, payload: any) {
    return this.api.put<any>(`${this.base}/${id}`, payload);
  }

  setActive(id: number, activo: boolean) {
    // PATCH with partial update for active flag
    return this.api.patch<any>(`${this.base}/${id}`, { activo });
  }
}

import { Injectable, inject } from '@angular/core';
import { ApiService } from '@app/core/api.service';
import {
  DocenteAsignacionDto,
  DocenteCursoDto,
  CurriculaCreateDto,
  CurriculaDto,
} from '@app/core/models/persona.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CurriculaService {
  private api = inject(ApiService);
  private base = '/api/docentes';

  // POST api/docentes/asignacion
  guardarAsignaciones(payload: DocenteAsignacionDto[]) {
    return this.api
      .post<any>(`${this.base}/asignacion`, payload)
      .pipe(map((r) => r.data as DocenteCursoDto[]));
  }

  // GET api/docentes/asignados
  // src/app/features/docentes/service/curricula.service.ts
  getAsignados(params: {
    page?: number;
    pageSize?: number;
    docenteId?: number;
    nivelId?: number;
    gradoSeccionId?: number;
    cursoId?: number;
    search?: string;
    list?: 'ACTIVE' | 'ALL';
  }) {
    return this.api.get<any>(`${this.base}/asignados`, params).pipe(
      // ApiService YA devuelve el `.data`, así que aquí ya es el PaginationResult<DocenteCursoDto>
      map(
        (r) =>
          r as {
            page: number;
            pageSize: number;
            totalItems: number;
            items: DocenteCursoDto[];
          }
      )
    );
  }

  // GET api/docentes/curriculas?docenteNivelDetalleCursoId=123
  getCurriculas(docenteNivelDetalleCursoId: number) {
    return this.api
      .get<any>(`${this.base}/curriculas`, { docenteNivelDetalleCursoId })
      .pipe(map((r) => r.data as CurriculaDto[]));
  }

  // POST api/docentes/curricula
  createCurricula(dto: CurriculaCreateDto) {
    return this.api
      .post<any>(`${this.base}/curricula`, dto)
      .pipe(map((r) => r.data as CurriculaDto));
  }

  // DELETE api/docentes/curricula/{id}
  deleteCurricula(id: number) {
    return this.api.delete<any>(`${this.base}/curricula/${id}`).pipe(map((r) => r.data as string));
  }
}

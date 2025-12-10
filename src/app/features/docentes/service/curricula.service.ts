import { Injectable, inject } from '@angular/core';
import { ApiService } from '@app/core/api.service';
import {
  DocenteAsignacionDto,
  DocenteCursoDto,
  CurriculaCreateDto,
  CurriculaDto,
} from '@app/core/models/persona.model';

@Injectable({ providedIn: 'root' })
export class CurriculaService {
  private api = inject(ApiService);
  private base = '/api/docentes';

  // POST api/docentes/asignacion
  guardarAsignaciones(payload: DocenteAsignacionDto[]) {
    // ApiService ya regresa el .data tipado
    return this.api.post<DocenteCursoDto[]>(`${this.base}/asignacion`, payload);
  }

  // GET api/docentes/asignados
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
    // Aquí data YA es el PaginationResult<DocenteCursoDto>
    return this.api.get<{
      page: number;
      pageSize: number;
      totalItems: number;
      items: DocenteCursoDto[];
    }>(`${this.base}/asignados`, params);
  }

  // GET api/docentes/curriculas?docenteNivelDetalleCursoId=123
  getCurriculas(docenteNivelDetalleCursoId: number) {
    // ApiService te entrega directamente CurriculaDto[]
    return this.api.get<CurriculaDto[]>(`${this.base}/curriculas`, {
      docenteNivelDetalleCursoId,
    });
  }

  // POST api/docentes/curricula
  createCurricula(dto: CurriculaCreateDto) {
    return this.api.post<CurriculaDto>(`${this.base}/curricula`, dto);
  }

  // DELETE api/docentes/curricula/{id}
  deleteCurricula(id: number) {
    return this.api.delete<string>(`${this.base}/curricula/${id}`);
  }
}

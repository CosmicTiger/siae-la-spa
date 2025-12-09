import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/api.service';
import {
  PersonaResumenDto,
  PersonaReadDto,
  DocenteReadDto,
  DocenteCreateWithAccountsDto,
  DocenteCreateResultDto,
} from '../../../core/models/persona.model';
import { PaginationResult } from '@app/core/interface/pagination.interface';

@Injectable({ providedIn: 'root' })
export class DocentesService {
  private api = inject(ApiService);
  private base = '/api/docentes';

  /**
   * List docentes with pagination. Backwards-compatible positional args: (page, pageSize, search)
   */
  list(page = 1, pageSize = 10, search = ''): Observable<PaginationResult<DocenteReadDto>> {
    const params: Record<string, any> = { page, pageSize };
    if (search) params['search'] = search;
    return this.api.get<PaginationResult<DocenteReadDto>>(this.base, params).pipe(map((r) => r!));
  }

  getById(id: number): Observable<DocenteReadDto | null> {
    return this.api.get<DocenteReadDto>(`${this.base}/${id}`);
  }

  create(payload: DocenteCreateWithAccountsDto): Observable<DocenteCreateResultDto | null> {
    return this.api.post<DocenteCreateResultDto>(this.base, payload);
  }

  update(id: number, payload: Partial<DocenteReadDto>): Observable<DocenteReadDto | null> {
    return this.api.put<DocenteReadDto>(`${this.base}/${id}`, payload);
  }

  setActive(id: number, activo: boolean, docente: any): Observable<DocenteReadDto |null> {
     const payload: any = {
      ...docente,
      activo: activo,
    };
    return this.update(id, payload);
  }
}

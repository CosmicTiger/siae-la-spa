import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { map } from 'rxjs';
import {
  ApiResponse,
  PaginationResult,
  AlumnoReadDto,
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

  create(payload: AlumnoCreateWithAccountsDto) {
    return this.http.post<ApiResponse<AlumnoCreateResultDto>>(this.base, payload);
  }
}

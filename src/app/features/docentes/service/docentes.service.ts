import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, DocenteReadDto, PaginationResult } from '@app/core/models';
import { environment } from '@environments/environment';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocentesService {
  http = inject(HttpClient);
  base = `${environment.apiBase}/api/docentes`;

  list(page = 1, pageSize = 10, search = '') {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.http
      .get<ApiResponse<PaginationResult<DocenteReadDto>>>(`${this.base}`, {
        params,
      })
      .pipe(map((r) => r.data!));
  }
}

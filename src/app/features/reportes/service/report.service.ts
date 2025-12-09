import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private api = inject(ApiService);

  reporteAlumnos(paramsObj: any) {
    const params: Record<string, any> = {};
    if (paramsObj) Object.keys(paramsObj).forEach((k) => (params[k] = paramsObj[k]));
    return this.api.get<any>('/api/reportes/alumnos', params).pipe(map((r) => r));
  }

  reporteDocentes(paramsObj: any) {
    const params: Record<string, any> = {};
    if (paramsObj) Object.keys(paramsObj).forEach((k) => (params[k] = paramsObj[k]));
    return this.api.get<any>('/api/reportes/docentes', params).pipe(map((r) => r));
  }

  exportCsv(endpoint: string, paramsObj?: any) {
    const params: Record<string, any> = {};
    if (paramsObj) Object.keys(paramsObj).forEach((k) => (params[k] = paramsObj[k]));
    return this.api.getBlob(endpoint, params);
  }
}

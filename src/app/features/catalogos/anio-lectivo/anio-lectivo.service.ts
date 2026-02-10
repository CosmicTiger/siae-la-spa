import { Injectable, inject } from '@angular/core';
import { ApiService } from '@app/core/api.service';
import { Observable } from 'rxjs';
import { AnioLectivoReadDto, AnioLectivoUpsertDto } from '@app/core/models/anio-lectivo.model';
import { PeriodoReadDto, PeriodoUpsertDto } from '@app/core/models/periodo.model';

@Injectable({ providedIn: 'root' })
export class AnioLectivoService {
  private api = inject(ApiService);
  private base = '/api/AnioLectivo';

  list(): Observable<AnioLectivoReadDto[] | null> {
    return this.api.get<AnioLectivoReadDto[]>(this.base);
  }

  get(id: number) {
    return this.api.get<AnioLectivoReadDto>(`${this.base}/${id}`);
  }

  create(payload: AnioLectivoUpsertDto) {
    const body = { ...payload } as any;
    delete body.fechaRegistro;
    delete body.audit;
    return this.api.post<AnioLectivoReadDto>(this.base, body);
  }

  update(id: number, payload: AnioLectivoUpsertDto) {
    const body = { ...payload } as any;
    delete body.fechaRegistro;
    delete body.audit;
    return this.api.put<AnioLectivoReadDto>(`${this.base}/${id}`, body);
  }

  delete(id: number) {
    return this.api.delete(`${this.base}/${id}`);
  }

  // periodos
  getPeriodos(id: number) {
    return this.api.get<PeriodoReadDto[]>(`${this.base}/${id}/periodos`);
  }

  createPeriodo(id: number, payload: PeriodoUpsertDto) {
    const body = { ...payload } as any;
    delete body.fechaRegistro;
    delete body.audit;
    return this.api.post<PeriodoReadDto>(`${this.base}/${id}/periodos`, body);
  }

  updatePeriodo(id: number, periodoId: number, payload: PeriodoUpsertDto) {
    const body = { ...payload } as any;
    delete body.fechaRegistro;
    delete body.audit;
    return this.api.put<PeriodoReadDto>(`${this.base}/${id}/periodos/${periodoId}`, body);
  }

  reorderPeriodos(id: number, periodoIds: number[]) {
    return this.api.post<any>(`${this.base}/${id}/periodos/reorder`, { periodoIds });
  }
}

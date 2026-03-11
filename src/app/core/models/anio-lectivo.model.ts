import { BaseEntity } from './audit.model';

export interface AnioLectivoReadDto extends BaseEntity {
  id: number;
  anio: number;
  descripcion?: string | null;
  activo: boolean;
  fechaInicio?: string | null;
  fechaFin?: string | null;
}

export interface AnioLectivoUpsertDto {
  anio: number;
  descripcion?: string | null;
  fechaInicio?: string | null; // ISO UTC
  fechaFin?: string | null; // ISO UTC or null
  activo: boolean;
}

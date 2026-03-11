import { AuditInfo } from './audit.model';

export interface CursoReadDto {
  id: number;
  codigo: string;
  descripcion: string;
  activo: boolean;
  fechaRegistro: string;
  audit?: AuditInfo;
}

// Upsert DTO should not include server-managed fields
export interface CursoUpsertDto extends Omit<CursoReadDto, 'id' | 'fechaRegistro' | 'audit'> {}

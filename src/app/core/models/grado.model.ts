import { AuditInfo } from './audit.model';

export interface GradoSeccionDto {
  id: number;
  descripcionGrado: string;
  descripcionSeccion: string;
  activo: boolean;
  fechaRegistro?: string;
  audit?: AuditInfo;
}

export interface AuditInfo {
  creadoPor?: string;
  modificadoPor?: string;
  fechaModificacion?: string | null;
  fechaIngreso: string;
}

export interface BaseEntity {
  fechaRegistro: string;
  audit?: AuditInfo;
}

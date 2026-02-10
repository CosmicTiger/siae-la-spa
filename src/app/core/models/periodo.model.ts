export interface PeriodoReadDto {
  id: number;
  descripcion: string;
  orden: number;
  activo: boolean;
}

export interface PeriodoUpsertDto {
  descripcion: string;
  orden?: number;
  activo?: boolean;
}

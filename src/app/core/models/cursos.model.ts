export interface CursoReadDto {
  id: number;
  codigo: string;
  descripcion: string;
  activo: boolean;
  fechaRegistro: string;
}

export interface CursoUpsertDto extends Omit<CursoReadDto, 'id' | 'fechaRegistro'> {}

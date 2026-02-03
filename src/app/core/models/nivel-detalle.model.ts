export interface NivelDetalleResumenDto {
  nivelDetalleId: number;
  nivelId: number;
  nivelDescripcion: string;
  turno: string;
  gradoSeccionId: number;
  gradoDescripcion: string;
  seccionDescripcion: string;
  totalVacantes: number;
  vacantesOcupadas: number;
  fechaRegistro: Date;
}

export interface NivelDetalleCreateDto {
  nivelId: number;
  gradoSeccionId: number;
  totalVacantes?: number | null;
}

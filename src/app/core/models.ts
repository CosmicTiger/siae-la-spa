export interface ApiResponse<T> {
  message?: string;
  data?: T;
}

export interface AuthResponse {
  accessToken: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface LoginDto {
  email: string;
  password: string;
}

// Backend: PaginationResult<T>
export interface PaginationResult<T> {
  page: number;
  pageSize: number;
  totalItems: number;
  items: T[];
}

export interface AlumnoReadDto {
  id: number;
  nombres: string;
  apellidos: string;
  codigo: string | null;
  documentoIdentidad: string | null;
  ciudad: string | null;
  direccion: string | null;
  activo: boolean;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

// Creación avanzada (coincide con tu backend)
export type Sexo = 'M' | 'F' | 'O';

export interface PersonaDto {
  nombres: string;
  apellidos: string;
  documentoIdentidad?: string | null;
  fechaNacimiento: string; // ISO string
  sexo: Sexo;
  ciudad?: string | null;
  direccion?: string | null;
  numeroTelefono?: string | null;
}

export interface TutorDto extends PersonaDto {
  email: string;
  password: string;
  tipoParentesco?: string | null;
}

export interface AlumnoCreateWithAccountsDto {
  alumnoPersona: PersonaDto;
  alumnoEmail: string;
  alumnoPassword: string;
  tutor?: TutorDto | null;
}

export interface AlumnoCreateResultDto {
  alumnoId: number;
  alumnoPersonaId: number;
  alumnoEmail: string;
  esMenorDeEdad: boolean;
  tutorPersonaId?: number | null;
  apoderadoId?: number | null;
  tutorEmail?: string | null;
}

// Matriculas
export interface MatriculaCreateDto {
  alumnoId: number;
  nivelDetalleId: number;
  periodoId: number;
  apoderadoId?: number | null;
  situacion?: string | null;
  institucionProcedencia?: string | null;
  esRepetente?: boolean;
}

export interface MatriculaReadDto {
  id: number;
  alumnoId: number;
  nivelDetalleId: number;
  periodoId: number;
  apoderadoId?: number | null;
  situacion?: string | null;
  institucionProcedencia?: string | null;
  esRepetente?: boolean;
  fechaRegistro: string;
}

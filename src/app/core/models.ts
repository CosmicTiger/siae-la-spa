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

// --- Detailed / resumen DTOs used in Alumno detail responses ---
export interface PersonaResumenDto {
  nombres: string;
  apellidos: string;
  documentoIdentidad?: string | null;
  fechaNacimiento?: string | null;
  sexo?: Sexo | string | null;
  ciudad?: string | null;
  direccion?: string | null;
  email?: string | null;
  numeroTelefono?: string | null;
}

export interface NivelDetalleDto {
  nivelDetalleId: number;
  nivelId: number;
  nivelDescripcion: string;
  nivelTurno?: string | null;
  gradoSeccionId?: number | null;
  gradoDescripcion?: string | null;
  seccionDescripcion?: string | null;
}

export interface MatriculaActualDto {
  matriculaId: number;
  nivel: NivelDetalleDto;
  periodoId: number;
  situacion?: string | null;
  esRepetente?: boolean | null;
  apoderadoId?: number | null;
  fechaRegistro?: string | null;
}

export interface TutorResumenDto {
  apoderadoId: number;
  personaId?: number | null;
  nombres: string;
  apellidos: string;
  documentoIdentidad?: string | null;
  email?: string | null;
  numeroTelefono?: string | null;
}

// Full detail DTO for an Alumno read by id (matches the sample response)
export interface AlumnoReadDetailDto {
  alumnoId: number;
  persona: PersonaResumenDto;
  matriculaActual?: MatriculaActualDto | null;
  tutor?: TutorResumenDto | null;
  activo: boolean;
}

export interface PersonaReadDto {
  id: number;
  nombres: string;
  apellidos: string;
  codigo: string | null;
  documentoIdentidad: string | null;
  email?: string | null;
  numeroTelefono: string | null;
  ciudad: string | null;
  direccion: string | null;
  activo: boolean;
}

export interface AlumnoReadDto extends PersonaReadDto {}

export interface DocenteReadDto extends PersonaReadDto {}

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

// Docentes specific DTOs
export interface DocenteAsignacionDto {
  docenteId: number;
  nivelDetalleCursoId: number;
  activo: boolean;
}

export interface DocenteCursoDto {
  id: number;
  docenteId: number;
  nivelDetalleCursoId: number;
  nivelId: number;
  nivelDescripcion: string;
  gradoSeccionId: number;
  gradoDescripcion: string;
  cursoId: number;
  cursoDescripcion: string;
  activo: boolean;
  fechaRegistro: string;
}

export interface CurriculaCreateDto {
  docenteNivelDetalleCursoId: number;
  descripcion?: string;
}

export interface CurriculaDto {
  id: number;
  docenteNivelDetalleCursoId: number;
  titulo: string;
  descripcion: string;
  activo: boolean;
  fechaRegistro: string;
}

export interface CalificacionCreateDto {
  curriculaId: number;
  alumnoId: number;
  nota: number; // 0..100
}

export interface CalificacionReadDto {
  id: number;
  curriculaId: number;
  alumnoId: number;
  nota: number;
  fechaRegistro: string;
  activo: boolean;
}

export interface PersonaInputDto {
  nombres: string;
  apellidos: string;
  documentoIdentidad?: string;
  fechaNacimiento?: string;
  sexo: string;
  ciudad?: string;
  direccion?: string;
  numeroTelefono?: string;
}

export interface DocenteCreateWithAccountsDto {
  docentePersona: PersonaInputDto;
  docenteEmail: string;
  docentePassword: string;
}

export interface DocenteCreateResultDto {
  docenteId: number;
  docentePersonaId: number;
  docenteEmail: string;
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

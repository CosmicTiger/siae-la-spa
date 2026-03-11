import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface ApiResponse<T> {
  ok: boolean;
  message?: string;
  data?: T;
}

export interface RoleCountDto {
  role: string;
  count: number;
}
export interface MatriculaByNivelDto {
  nivel: string;
  count: number;
}

export interface AdminDashboardDto {
  view: string;
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  newRegistrationsLast30Days: number;
  totalDocentes: number;
  totalAlumnos: number;
  totalApoderados: number;
  totalMatriculas: number;
  usersByRole: RoleCountDto[];
  matriculasByNivel: MatriculaByNivelDto[];
}

export interface TimePointDto {
  date: string;
  count: number;
}
export interface ActivitySummaryDto {
  view: string;
  dau: number;
  wau: number;
  mau: number;
  loginsByDay: TimePointDto[];
}
export interface DataQualityDto {
  view: string;
  personasSinUsuario: number;
  usuariosSinPersona: number;
  docentesSinFicha: number;
  usuariosSinEmail: number;
  usuariosSinTelefono: number;
  pendingAgingBuckets: { [k: string]: number };
}
export interface ApprovalAgingDto {
  view: string;
  averageDaysToApprove: number;
  buckets: { [k: string]: number };
}
export interface CourseAcademicDto {
  cursoId: number;
  cursoDescripcion: string;
  notaMedia?: number;
  percentApproved: number;
}
export interface AcademicSummaryDto {
  view: string;
  byCourse: CourseAcademicDto[];
}
export interface DireccionDashboardDto {
  view: string;
  totalMatriculas: number;
  matriculasByNivel: MatriculaByNivelDto[];
  nivelDetalleVacancias: any[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private base = environment.apiBase + '/api/dashboard';
  private adminSummary$ = new BehaviorSubject<AdminDashboardDto | null>(null);
  private adminSummaryFetchedAt = 0;

  // default TTL 2 minutes
  private defaultTtl = 1000 * 60 * 2;

  constructor(private http: HttpClient) {}

  getAdminSummary(force = false, ttlMs?: number): Observable<AdminDashboardDto> {
    const ttl = ttlMs ?? this.defaultTtl;
    const cached = this.adminSummary$.value;
    if (!force && cached && Date.now() - this.adminSummaryFetchedAt < ttl) {
      return of(cached as AdminDashboardDto);
    }
    return this.http.get<ApiResponse<any>>(`${this.base}/admin`).pipe(
      map((r) => {
        if (!r.ok) throw new Error(r.message || 'Error');
        const payload = r.data as any;
        // API returns { data: { summary: {...}, activity: {...}, ... } }
        return (payload?.summary ?? payload) as AdminDashboardDto;
      }),
      tap((s) => {
        this.adminSummary$.next(s);
        this.adminSummaryFetchedAt = Date.now();
      }),
      catchError((err) => this.handleError(err, 'getAdminSummary')),
    );
  }

  getAdminActivity(): Observable<ActivitySummaryDto> {
    return this.http.get<ApiResponse<any>>(`${this.base}/admin/activity`).pipe(
      map((r) => {
        if (!r.ok) throw new Error(r.message || 'Error');
        const payload = r.data as any;
        return (payload?.activity ?? payload) as ActivitySummaryDto;
      }),
      catchError((err) => this.handleError(err, 'getAdminActivity')),
    );
  }

  getAdminDataQuality(): Observable<DataQualityDto> {
    return this.http.get<ApiResponse<any>>(`${this.base}/admin/data-quality`).pipe(
      map((r) => {
        if (!r.ok) throw new Error(r.message || 'Error');
        const payload = r.data as any;
        return (payload?.dataQuality ?? payload) as DataQualityDto;
      }),
      catchError((err) => this.handleError(err, 'getAdminDataQuality')),
    );
  }

  getAdminApprovalAging(): Observable<ApprovalAgingDto> {
    return this.http.get<ApiResponse<any>>(`${this.base}/admin/approval-aging`).pipe(
      map((r) => {
        if (!r.ok) throw new Error(r.message || 'Error');
        const payload = r.data as any;
        return (payload?.approvalAging ?? payload) as ApprovalAgingDto;
      }),
      catchError((err) => this.handleError(err, 'getAdminApprovalAging')),
    );
  }

  getAdminAcademic(): Observable<AcademicSummaryDto> {
    return this.http.get<ApiResponse<any>>(`${this.base}/admin/academic`).pipe(
      map((r) => {
        if (!r.ok) throw new Error(r.message || 'Error');
        const payload = r.data as any;
        return (payload?.academicSummary ?? payload) as AcademicSummaryDto;
      }),
      catchError((err) => this.handleError(err, 'getAdminAcademic')),
    );
  }

  getDireccionSummary(): Observable<DireccionDashboardDto> {
    return this.http.get<ApiResponse<any>>(`${this.base}/direccion`).pipe(
      map((r) => {
        if (!r.ok) throw new Error(r.message || 'Error');
        const payload = r.data as any;
        return (payload?.summary ?? payload) as DireccionDashboardDto;
      }),
      catchError((err) => this.handleError(err, 'getDireccionSummary')),
    );
  }

  // KPI endpoints
  getKpiSexTrend(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.base}/kpi/sex-trend`).pipe(
      map((r) => {
        if (!r.ok) throw new Error(r.message || 'Error');
        return r.data;
      }),
      catchError((err) => this.handleError(err, 'getKpiSexTrend')),
    );
  }

  getKpiEnrollmentBySection(anio?: number): Observable<any> {
    const qs = anio ? `?anio=${anio}` : '';
    return this.http.get<ApiResponse<any>>(`${this.base}/kpi/enrollment-by-section${qs}`).pipe(
      map((r) => {
        if (!r.ok) throw new Error(r.message || 'Error');
        return r.data;
      }),
      catchError((err) => this.handleError(err, 'getKpiEnrollmentBySection')),
    );
  }

  private handleError(err: any, where = '') {
    console.error('[DashboardService] error', where, err);
    const message = err?.error?.message || err?.message || 'Dashboard request failed';
    return throwError(() => new Error(message));
  }
}

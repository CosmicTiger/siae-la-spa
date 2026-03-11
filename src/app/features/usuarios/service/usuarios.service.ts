import { Injectable, inject } from '@angular/core';
import { ApiService } from '@app/core/api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private api = inject(ApiService);
  private base = '/api/admin/users';

  pending(): Observable<any> {
    return this.api.get<any>(`${this.base}/pending`);
  }

  list(page = 1, pageSize = 20, search?: string, role?: string): Observable<any> {
    const params: Record<string, any> = { page, pageSize };
    if (search) params['search'] = search;
    if (role) params['role'] = role;
    return this.api.get<any>(this.base, params);
  }

  get(id: number): Observable<any> {
    return this.api.get<any>(`${this.base}/${id}`);
  }

  update(id: number, payload: any): Observable<any> {
    const body = { ...payload } as any;
    delete body.registeredAt;
    delete body.audit;
    return this.api.put<any>(`${this.base}/${id}`, body);
  }

  delete(id: number) {
    return this.api.delete<any>(`${this.base}/${id}`);
  }

  approve(userId: number) {
    return this.api.post<any>(`${this.base}/${userId}/approve`, {});
  }

  promoteJefeArea(docenteId: number, promote = true) {
    // API expects promote as query param: POST docente/{docenteId}/jefearea?promote=true|false
    const q = promote ? 'true' : 'false';
    return this.api.post<any>(`${this.base}/docente/${docenteId}/jefearea?promote=${q}`, {});
  }

  changePassword(id: number, newPassword: string) {
    return this.api.post<any>(`${this.base}/${id}/password`, { newPassword });
  }

  changeEmail(id: number, newEmail: string) {
    return this.api.post<any>(`${this.base}/${id}/email`, { newEmail });
  }

  roles() {
    return this.api.get<string[]>(`${this.base}/roles`);
  }

  jefeareaTools() {
    return this.api.get<any>(`${this.base}/jefearea/tools`);
  }

  docenteTools() {
    return this.api.get<any>(`${this.base}/docente/tools`);
  }
}

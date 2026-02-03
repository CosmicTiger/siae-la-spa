import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpResponseWithData } from './interface/http-responses.interface';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  private url(path: string) {
    if (!path) return this.base;
    // allow passing full URLs
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    // ensure leading slash
    if (!path.startsWith('/')) path = '/' + path;
    return this.base + path;
  }

  get<T = any>(path: string, params?: Record<string, any>): Observable<T | null> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((k) => {
        const v = params[k];
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http
      .get<HttpResponseWithData<T>>(this.url(path), { params: httpParams })
      .pipe(map((r) => r.data ?? null));
  }

  post<T = any>(path: string, body: any) {
    return this.http
      .post<HttpResponseWithData<T>>(this.url(path), body)
      .pipe(map((r) => r.data ?? null));
  }

  put<T = any>(path: string, body: any) {
    return this.http
      .put<HttpResponseWithData<T>>(this.url(path), body)
      .pipe(map((r) => r.data ?? null));
  }

  patch<T = any>(path: string, body: any) {
    return this.http
      .patch<HttpResponseWithData<T>>(this.url(path), body)
      .pipe(map((r) => r.data ?? null));
  }

  delete<T = any>(path: string) {
    return this.http
      .delete<HttpResponseWithData<T>>(this.url(path))
      .pipe(map((r) => r.data ?? null));
  }

  /**
   * GET that returns a Blob (for CSV / binary downloads).
   * `params` is a simple object of key->value (ApiService will convert to HttpParams).
   */
  getBlob(path: string, params?: Record<string, any>) {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((k) => {
        const v = params[k];
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http.get(this.url(path), { params: httpParams, responseType: 'blob' });
  }
}

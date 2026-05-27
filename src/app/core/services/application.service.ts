import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobApplication } from '../models/application.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/applications`;

  getAll(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(this.apiUrl);
  }

  getMy(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${this.apiUrl}/my`);
  }

  apply(jobId: number): Observable<JobApplication> {
    return this.http.post<JobApplication>(this.apiUrl, { jobId });
  }

  cancelMy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/my/${id}`);
  }

  updateStatus(id: number, status: string): Observable<JobApplication> {
    return this.http.patch<JobApplication>(`${this.apiUrl}/${id}/status`, { status });
  }
}

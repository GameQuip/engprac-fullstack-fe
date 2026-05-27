import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job, JobCreateRequest, JobUpdateRequest } from '../models/job.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JobService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/jobs`;

  getAll(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl);
  }

  getById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  create(body: JobCreateRequest): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, body);
  }

  update(id: number, body: JobUpdateRequest): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

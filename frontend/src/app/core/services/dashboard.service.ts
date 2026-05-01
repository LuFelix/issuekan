
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardColumnData {
  id: string;
  type: 'trello' | 'github';
  title: string;
  description?: string;
  url: string;
  status?: string;
  labels?: string[];
}

export interface DashboardData {
  Backlog: DashboardColumnData[];
  Definition: DashboardColumnData[];
  Development: DashboardColumnData[];
  QA: DashboardColumnData[];
  Done: DashboardColumnData[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl + '/relay/dashboard';

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.apiUrl);
  }
}

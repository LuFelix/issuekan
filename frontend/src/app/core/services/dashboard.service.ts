
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DashboardColumnData {
  id: string;
  type: 'trello' | 'github';
  title: string;
  description?: string;
  url: string;
  status?: string;
  labels?: string[];
  hasActiveBranch?: boolean;
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
    return this.http.get<DashboardData>(this.apiUrl).pipe(
      tap(data => {
        console.log("📦 [Relay] Dados recebidos do Backend:", { data });
        console.log("🐙 [Relay] Issues do GitHub carregadas:", data.Development);
      })
    );
  }
}

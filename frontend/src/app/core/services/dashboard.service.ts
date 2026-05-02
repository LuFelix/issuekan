
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
  private relayApiUrl = environment.apiUrl + '/relay';

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.apiUrl).pipe(
      tap(data => {
        console.log("📦 [Relay] Dados recebidos do Backend:", { data });
        console.log("🐙 [Relay] Issues do GitHub carregadas:", data.Development);
      })
    );
  }

  /**
   * Cria um novo card no Backlog refinando o texto em linguagem natural
   * @param text - Descrição da tarefa em linguagem natural
   * @returns Observable com os dados refinados da história
   */
  createBacklogCard(text: string): Observable<any> {
    return this.http.post(`${this.relayApiUrl}/refine-story`, { text }).pipe(
      tap(response => {
        console.log('✅ [Relay] Card refinado com sucesso:', response);
      })
    );
  }
}

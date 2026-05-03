
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

  /**
   * Confirma um card refinado e o envia para o Trello
   * @param refinedStory - Dados da história refinada (title, userStory, acceptanceCriteria)
   * @returns Observable com resposta do servidor
   */
  confirmBacklogCard(refinedStory: any): Observable<any> {
    return this.http.post(`${this.relayApiUrl}/confirm-card`, refinedStory).pipe(
      tap(response => {
        console.log('✅ [Relay] Card confirmado e enviado para Trello:', response);
      })
    );
  }

  /**
   * Obtém refinamento técnico de um card do Trello
   * @param technicalData - Dados do card (trelloCardId, title, description)
   * @returns Observable com refinamento técnico (techTitle, techDescription, tasks)
   */
  getTechnicalRefinement(technicalData: any): Observable<any> {
    return this.http.post(`${this.relayApiUrl}/technical-refinement`, technicalData).pipe(
      tap(response => {
        console.log('✅ [Relay] Refinamento técnico recebido:', response);
      })
    );
  }

  /**
   * Cria uma Issue no GitHub a partir dos dados da especificação técnica
   * @param title - Título da issue
   * @param body - Corpo da issue em Markdown
   * @param trelloCardId - ID do card no Trello para rastreabilidade
   * @returns Observable com dados da issue criada (issueNumber, url)
   */
  createGithubIssue(title: string, body: string, trelloCardId: string): Observable<any> {
    return this.http.post(`${this.relayApiUrl}/create-github-issue`, {
      title,
      body,
      trelloCardId
    }).pipe(
      tap(response => {
        console.log('✅ [Relay] Issue no GitHub criada:', response);
      })
    );
  }
}


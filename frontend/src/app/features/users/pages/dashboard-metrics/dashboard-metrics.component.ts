import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DashboardService, DashboardData, DashboardColumnData } from '../../../../core/services/dashboard.service';
import { RelayCardComponent } from '../../../../features/shared/components/relay-card/relay-card.component';
import { NaturalInputModalComponent } from '../../../../features/shared/components/natural-input-modal/natural-input-modal.component';
import { DevReviewModalComponent } from '../../../../features/shared/components/dev-review-modal/dev-review-modal.component';

@Component({
  selector: 'app-dashboard-metrics',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDialogModule, HttpClientModule, RelayCardComponent, NaturalInputModalComponent, DevReviewModalComponent],
  templateUrl: './dashboard-metrics.component.html',
  styleUrl: './dashboard-metrics.component.scss'
})
export class DashboardMetricsComponent implements OnInit {
  private dialog = inject(MatDialog);
  dashboardData: DashboardData | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        console.log('Dashboard Data:', this.dashboardData);
      },
      error: (err) => {
        console.error('Error fetching dashboard data:', err);
      }
    });
  }

  /**
   * Validador único de QA para garantir exclusão mútua perfeita
   */
  private isQaIssue(card: DashboardColumnData): boolean {
    if (!card || card.type !== 'github') return false;
    
    const statusIsQa = card.status?.toUpperCase() === 'QA';
    const hasQaLabel = card.labels?.some(l => {
      if (typeof l === 'string') return l.toUpperCase() === 'QA';
      if (l && typeof l === 'object' && 'name' in l) return (l as any).name.toUpperCase() === 'QA';
      return false;
    });

    return statusIsQa || !!hasQaLabel;
  }

  // ==========================================
  // MÉTODOS DO TRELLO
  // ==========================================
  getBacklogTrelloCards(): DashboardColumnData[] {
    return this.dashboardData?.Backlog.filter(card => card.type === 'trello') || [];
  }

  // ==========================================
  // MÉTODOS DO GITHUB
  // ==========================================
  getBacklogGithubIssues(): DashboardColumnData[] {
    if (!this.dashboardData) return [];
    return this.dashboardData.Backlog.filter(card => 
      card.type === 'github' && 
      card.status !== 'closed' &&
      !this.isQaIssue(card)
    );
  }

  getDoingGithubIssues(): DashboardColumnData[] {
    if (!this.dashboardData) return [];

    const definition = this.dashboardData.Definition?.filter(card => 
      card.type === 'github' &&
      card.status !== 'closed' &&
      !this.isQaIssue(card)
    ) || [];

    const development = this.dashboardData.Development?.filter(card => 
      card.type === 'github' &&
      card.status !== 'closed' &&
      !this.isQaIssue(card)
    ) || [];

    return [...definition, ...development];
  }

  getDevelopmentGithubIssues(): DashboardColumnData[] {
    if (!this.dashboardData) return [];
    return this.dashboardData.Development.filter(card => 
      card.type === 'github' && 
      card.status !== 'closed' &&
      !this.isQaIssue(card)
    );
  }

  getQaGithubIssues(): DashboardColumnData[] {
    if (!this.dashboardData) return [];

    //const explicitlyInQa = this.dashboardData.QA?.filter(card => card.type === 'github') || [];

    const movedToQa = [
      ...(this.dashboardData.Backlog || []),
      ...(this.dashboardData.Definition || []),
      ...(this.dashboardData.Development || []),
      ...(this.dashboardData.Done || [])
    ].filter(card => this.isQaIssue(card));

    const explicitlyInQa = this.dashboardData.QA?.filter(card => card.type === 'github') || [];

    const allQa = [...explicitlyInQa, ...movedToQa];
    return allQa.filter((card, index, self) => 
      index === self.findIndex(c => c.id === card.id)
    );
  }

  getDoneGithubIssues(): DashboardColumnData[] {
    return this.dashboardData?.Done.filter(card => card.type === 'github' && card.status === 'closed') || [];
  }

  onTransformToIssue(cardId: string) {
    console.log('Transformar card:', cardId);
  }

  /**
   * Abre a modal para inserção de novo card em linguagem natural
   */
  openNaturalInputModal(): void {
    this.dialog.open(NaturalInputModalComponent, {
      width: '500px',
      panelClass: 'custom-dialog-container',
      disableClose: true
    }).afterClosed().subscribe((result) => {
      // Se a modal retornar sucesso, recarregar o dashboard
      if (result && result.success) {
        console.log('✅ [Dashboard] Card aprovado e enviado. Recarregando dashboard...');
        this.loadDashboardData();
      } else {
        console.log('❌ [Dashboard] Modal fechada sem enviar card');
      }
    });
  }

  /**
   * Processa o clique no botão RELAY de um card
   * @param cardData - Dados do card que foi clicado
   */
  onRelayClick(cardData: DashboardColumnData): void {
    console.log('🔧 [RELAY] Iniciando refinamento técnico para:', cardData);

    // Abrir modal de revisão técnica
    this.dialog.open(DevReviewModalComponent, {
      width: '700px',
      panelClass: 'custom-dialog-container',
      disableClose: true,
      data: {
        trelloCardId: cardData.id,
        title: cardData.title,
        description: cardData.description || ''
      }
    }).afterClosed().subscribe((result) => {
      if (result === 'success') {
        console.log('✅ Especificação Aprovada pelo Dev - Atualizando Dashboard');
        // Recarregar os dados do dashboard para refletir as mudanças
        this.loadDashboardData();
      } else {
        console.log('❌ [RELAY] Modal fechada sem aprovação');
      }
    });
  }
}
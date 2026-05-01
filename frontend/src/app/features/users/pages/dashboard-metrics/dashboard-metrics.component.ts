import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DashboardService, DashboardData, DashboardColumnData } from '../../../../core/services/dashboard.service';
import { RelayCardComponent } from '../../../../features/shared/components/relay-card/relay-card.component';

@Component({
  selector: 'app-dashboard-metrics',
  standalone: true,
  imports: [CommonModule, MatCardModule, HttpClientModule, RelayCardComponent],
  templateUrl: './dashboard-metrics.component.html',
  styleUrl: './dashboard-metrics.component.scss'
})
export class DashboardMetricsComponent implements OnInit {
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

  getBacklogTrelloCards(): DashboardColumnData[] {
    return this.dashboardData?.Backlog.filter(card => card.type === 'trello') || [];
  }

  getDoingGithubIssues(): DashboardColumnData[] {
    // Possui dados do GitHub, state === 'open', e NÃO possui a label 'QA'.
    return (
      this.dashboardData?.Definition.filter(
        (card) =>
          card.type === 'github' &&
          card.status === 'open' &&
          (!card.labels || !card.labels.includes('QA'))
      ) ||
      this.dashboardData?.Development.filter(
        (card) =>
          card.type === 'github' &&
          card.status === 'open' &&
          (!card.labels || !card.labels.includes('QA'))
      ) ||
      []
    );
  }

  getQaGithubIssues(): DashboardColumnData[] {
    // Possui dados do GitHub, state === 'open', e POSSUI a label 'QA'.
    return (
      this.dashboardData?.Definition.filter(
        (card) => card.type === 'github' && card.status === 'open' && card.labels?.includes('QA')
      ) ||
      this.dashboardData?.Development.filter(
        (card) => card.type === 'github' && card.status === 'open' && card.labels?.includes('QA')
      ) ||
      []
    );
  }

  getDoneGithubIssues(): DashboardColumnData[] {
    // Possui dados do GitHub e state === 'closed'.
    return (
      this.dashboardData?.Done.filter((card) => card.type === 'github' && card.status === 'closed') ||
      []
    );
  }

  onTransformToIssue(cardId: string) {
    console.log('Transformar card:', cardId);
  }
}

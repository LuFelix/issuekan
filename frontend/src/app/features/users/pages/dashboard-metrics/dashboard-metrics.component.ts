import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DashboardService, DashboardData, DashboardColumnData } from '../../../../core/services/dashboard.service';
import { RelayCardComponent } from '../../../../features/shared/components/relay-card/relay-card.component';
import { FilterByTypePipe } from '../../../../features/shared/pipes/filter-by-type.pipe';

@Component({
  selector: 'app-dashboard-metrics',
  standalone: true,
  imports: [CommonModule, MatCardModule, HttpClientModule, RelayCardComponent, FilterByTypePipe],
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
}

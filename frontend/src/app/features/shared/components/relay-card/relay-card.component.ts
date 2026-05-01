
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DashboardColumnData } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-relay-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './relay-card.component.html',
  styleUrl: './relay-card.component.scss'
})
export class RelayCardComponent {
  @Input() cardData!: DashboardColumnData;

  getIcon(): string {
    return this.cardData.type === 'trello' ? 'list_alt' : 'bug_report'; // Trello: list_alt, GitHub: bug_report
  }

  getPlatformClass(): string {
    return this.cardData.type === 'trello' ? 'tw-border-l-blue-500' : 'tw-border-l-purple-500';
  }
}

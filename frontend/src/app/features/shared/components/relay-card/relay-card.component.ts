
import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Output() transformToIssue = new EventEmitter<string>();

  getIcon(): string {
    return this.cardData.type === 'trello' ? 'list_alt' : 'bug_report';
  }

  getPlatformBorderClass(): string {
    return this.cardData.type === 'trello' ? 'tw-border-l-blue-500/50' : 'tw-border-l-purple-500/50';
  }

  getBadgeClass(): string {
    return this.cardData.type === 'trello' 
      ? 'tw-bg-blue-500/10 tw-text-blue-400 tw-border tw-border-blue-500/20' 
      : 'tw-bg-purple-500/10 tw-text-purple-400 tw-border tw-border-purple-500/20';
  }

  shouldShowTransformButton(): boolean {
    return this.cardData.type === 'trello';
  }

  emitTransformToIssue(): void {
    this.transformToIssue.emit(this.cardData.id);
  }
}

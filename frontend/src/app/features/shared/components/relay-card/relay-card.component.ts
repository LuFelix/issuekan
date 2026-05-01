import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DashboardColumnData } from '../../../../core/services/dashboard.service';
import { RelayCardDetailsComponent } from '../relay-card-details/relay-card-details.component';

@Component({
  selector: 'app-relay-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule],
  templateUrl: './relay-card.component.html',
  styleUrl: './relay-card.component.scss'
})
export class RelayCardComponent {
  private dialog = inject(MatDialog);

  @Input() cardData!: DashboardColumnData;
  @Output() transformToIssue = new EventEmitter<string>();

  openDetails(): void {
    this.dialog.open(RelayCardDetailsComponent, {
      data: this.cardData,
      width: '600px',
      panelClass: 'custom-dialog-container'
    });
  }

  getIcon(): string {
    return this.cardData.type === 'trello' ? 'list_alt' : 'bug_report';
  }

  getPlatformBorderClass(): string {
    return this.cardData.type === 'trello' ? 'tw-border-l-blue-500/50' : 'tw-border-l-purple-500/50';
  }

  getBadgeClass(): string {
    return this.cardData.type === 'trello' 
      ? 'tw-bg-blue-500/25 tw-text-blue-200 tw-border tw-border-blue-500/20' 
      : 'tw-bg-purple-500/25 tw-text-purple-200 tw-border tw-border-purple-500/20';
  }

  shouldShowTransformButton(): boolean {
    return this.cardData.type === 'trello';
  }

  emitTransformToIssue(): void {
    this.transformToIssue.emit(this.cardData.id);
  }
}

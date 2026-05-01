import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DashboardColumnData } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-relay-card-details',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="tw-bg-slate-900 tw-text-slate-100 tw-p-6 tw-rounded-lg tw-max-w-2xl">
      <div class="tw-flex tw-justify-between tw-items-start tw-mb-4">
        <h2 class="tw-text-2xl tw-font-bold tw-text-blue-400">{{ data.title }}</h2>
        <button (click)="close()" class="tw-text-slate-400 hover:tw-text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-6 tw-w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="tw-mb-6">
        <span class="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-blue-900/50 tw-text-blue-300 tw-border tw-border-blue-800">
          {{ data.type | titlecase }}
        </span>
        @if (data.status) {
          <span class="tw-ml-2 tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-slate-800 tw-text-slate-300 tw-border tw-border-slate-700">
            {{ data.status }}
          </span>
        }
      </div>

      <div class="tw-prose tw-prose-invert tw-max-w-none">
        <div class="description-content" [innerHTML]="data.description || 'Sem descrição disponível.'"></div>
      </div>

      <div class="tw-mt-8 tw-flex tw-justify-end">
        <a [href]="data.url" target="_blank" class="tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-font-bold tw-py-2 tw-px-4 tw-rounded tw-transition-colors">
          Abrir no {{ data.type === 'trello' ? 'Trello' : 'GitHub' }}
        </a>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .description-content {
      font-size: 0.95rem;
      line-height: 1.6;
      color: #cbd5e1;
    }
    .description-content ::ng-deep ul {
      list-style-type: disc;
      padding-left: 1.5rem;
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
    .description-content ::ng-deep li {
      margin-bottom: 0.5rem;
    }
  `]
})
export class RelayCardDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<RelayCardDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DashboardColumnData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}

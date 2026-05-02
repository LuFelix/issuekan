import { Component, OnInit, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../../../core/services/dashboard.service';

interface TechnicalRefinement {
  techTitle: string;
  techDescription: string;
  tasks: string[];
}

interface ReviewData {
  trelloCardId: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-dev-review-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dev-review-modal.component.html',
  styleUrl: './dev-review-modal.component.scss'
})
export class DevReviewModalComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<DevReviewModalComponent>);
  private dashboardService = inject(DashboardService);
  
  public data = inject<ReviewData>(MAT_DIALOG_DATA);

  isLoading: boolean = true;
  error: string | null = null;
  refinement: TechnicalRefinement | null = null;
  reviewData: TechnicalRefinement | null = null;

  ngOnInit(): void {
    this.fetchTechnicalRefinement();
  }

  /**
   * Busca o refinamento técnico do backend
   */
  private fetchTechnicalRefinement(): void {
    this.isLoading = true;
    this.error = null;

    this.dashboardService.getTechnicalRefinement({
      trelloCardId: this.data.trelloCardId,
      title: this.data.title,
      description: this.data.description
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success' && response.data) {
          this.refinement = response.data;
          // Copiar para dados de revisão (para permitir edição)
          this.reviewData = {
            techTitle: response.data.techTitle,
            techDescription: response.data.techDescription,
            tasks: [...response.data.tasks]
          };
          console.log('✅ [DevReview] Refinamento técnico carregado:', this.refinement);
        } else {
          this.error = response.error || 'Erro ao processar refinamento técnico';
          console.error('❌ [DevReview] Erro na resposta:', response);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error?.error?.error || error?.message || 'Erro ao obter refinamento técnico';
        console.error('❌ [DevReview] Erro ao buscar refinamento:', error);
      }
    });
  }

  /**
   * Aprova a especificação técnica
   */
  onApproveSpecification(): void {
    if (!this.reviewData) {
      return;
    }

    console.log('✅ [DevReview] Especificação aprovada:', this.reviewData);
    this.dialogRef.close(this.reviewData);
  }

  /**
   * Cancela a modal
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Adiciona uma nova task
   */
  addTask(): void {
    if (this.reviewData) {
      this.reviewData.tasks.push('Nova tarefa');
    }
  }

  /**
   * Remove uma task
   */
  removeTask(index: number): void {
    if (this.reviewData) {
      this.reviewData.tasks.splice(index, 1);
    }
  }
}

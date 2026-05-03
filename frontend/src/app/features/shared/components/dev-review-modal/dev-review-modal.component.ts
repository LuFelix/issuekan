import { Component, OnInit, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../../../core/services/dashboard.service';

interface TechnicalRefinement {
  techTitle: string;
  branchSlug: string;
  techDescription: string;
  tasks: string[];
}

interface ReviewData {
  trelloCardId: string;
  title: string;
  description: string;
  branchSlug: string;
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
  isSuccessView: boolean = false;
  createdIssueData: any = null;
  isSubmitting: boolean = false;

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
            branchSlug: response.data.branchSlug,
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
   * Aprova a especificação técnica e cria a Issue no GitHub
   */
  onApproveSpecification(): void {
    if (!this.reviewData) {
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    // Formatar body em Markdown no padrão ISSUEDevLang
    const markdownBody = `**Descrição Técnica:**\n${this.reviewData.techDescription}\n\n**Tarefas:**\n${this.reviewData.tasks.map(t => '- [ ] ' + t).join('\n')}`;

    console.log('📝 [DevReview] Criando Issue no GitHub com dados:', {
      title: this.reviewData.techTitle,
      body: markdownBody,
      trelloCardId: this.data.trelloCardId
    });

    // Chamar serviço para criar a Issue
    this.dashboardService.createGithubIssue(
      this.reviewData.techTitle,
      markdownBody,
      this.data.trelloCardId
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.status === 'success') {
          console.log('✅ [DevReview] Issue criada com sucesso:', response);
          this.createdIssueData = {
            number: response.issueNumber,
            title: this.reviewData!.techTitle,
            url: response.url
          };
          this.isSuccessView = true;
        } else {
          this.error = response.error || 'Erro ao criar Issue no GitHub';
          console.error('❌ [DevReview] Erro na resposta:', response);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.error = error?.error?.error || error?.message || 'Erro ao criar Issue no GitHub';
        console.error('❌ [DevReview] Erro ao criar Issue:', error);
      }
    });
  }

  /**
   * Fecha a modal após sucesso
   */
  closeAndStartWork(): void {
    console.log('✅ [DevReview] Usuário iniciando trabalho');
    this.dialogRef.close('success');
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


import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../../../core/services/dashboard.service';

interface RefinedStory {
  title: string;
  userStory: string;
  acceptanceCriteria: string[];
}

@Component({
  selector: 'app-natural-input-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './natural-input-modal.component.html',
  styleUrl: './natural-input-modal.component.scss'
})
export class NaturalInputModalComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<NaturalInputModalComponent>);
  private dashboardService = inject(DashboardService);

  // Estados
  inputText: string = '';
  loading: boolean = false;
  refinedData: RefinedStory | null = null;
  submitting: boolean = false;
  error: string | null = null;

  ngOnInit(): void {}

  /**
   * Chama o serviço para refinar a história
   */
  onGenerateCard(): void {
    if (!this.inputText.trim()) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.dashboardService.createBacklogCard(this.inputText.trim()).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.status === 'success' && response.data) {
          this.refinedData = response.data;
          console.log('✅ [Modal] Dados refinados recebidos:', this.refinedData);
        } else {
          this.error = response.error || 'Erro ao refinar a história';
          console.error('❌ [Modal] Erro na resposta:', response);
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error?.error?.error || error?.message || 'Erro ao refinar a história';
        console.error('❌ [Modal] Erro ao chamar serviço:', error);
      }
    });
  }

  /**
   * Aprova e envia o card para o Trello
   */
  onApproveAndSend(): void {
    if (!this.refinedData) {
      return;
    }

    this.submitting = true;
    this.error = null;

    this.dashboardService.confirmBacklogCard(this.refinedData).subscribe({
      next: (response) => {
        this.submitting = false;
        console.log('✅ [Modal] Card confirmado e enviado:', response);
        // Fechar a modal com sucesso
        this.dialogRef.close({ success: true, data: response });
      },
      error: (error) => {
        this.submitting = false;
        this.error = error?.error?.error || error?.message || 'Erro ao confirmar o card';
        console.error('❌ [Modal] Erro ao confirmar:', error);
      }
    });
  }

  /**
   * Volta para a tela de entrada
   */
  onBackToInput(): void {
    this.refinedData = null;
    this.error = null;
  }

  /**
   * Fecha a modal sem emitir nada
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Verifica se o botão de gerar card pode ser ativado
   */
  isGenerateButtonEnabled(): boolean {
    return this.inputText.trim().length > 0 && !this.loading;
  }

  /**
   * Adiciona um novo critério de aceitação
   */
  addAcceptanceCriteria(): void {
    if (this.refinedData) {
      this.refinedData.acceptanceCriteria.push('');
    }
  }

  /**
   * Remove um critério de aceitação
   */
  removeAcceptanceCriteria(index: number): void {
    if (this.refinedData) {
      this.refinedData.acceptanceCriteria.splice(index, 1);
    }
  }
}

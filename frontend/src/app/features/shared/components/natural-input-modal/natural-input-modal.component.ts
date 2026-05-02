import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-natural-input-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './natural-input-modal.component.html',
  styleUrl: './natural-input-modal.component.scss'
})
export class NaturalInputModalComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<NaturalInputModalComponent>);
  
  inputText: string = '';

  ngOnInit(): void {}

  /**
   * Fecha a modal emitindo o texto capturado
   */
  onGenerateCard(): void {
    if (this.inputText.trim()) {
      this.dialogRef.close(this.inputText.trim());
    }
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
    return this.inputText.trim().length > 0;
  }
}

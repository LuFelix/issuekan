import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

// Imports do Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card'; // MUDANÇA: Importe o Módulo
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Outros Imports
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login-form',
  imports: [
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss'
})
export class LoginForm {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

 readonly form = this.fb.group({
    identifier: ['', [Validators.required]], 
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
    ]]
  });

  readonly hidePassword = signal(true);
  readonly isSubmitting = signal(false);

  togglePasswordVisibility(event: MouseEvent): void {
    this.hidePassword.update(value => !value);
    event.stopPropagation();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    const raw = this.form.getRawValue();
    const credentials = {
      identifier: raw.identifier ?? '',
      password: raw.password ?? ''
    };

    this.authService.login(credentials)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['app/dashboard']);
          this.snackBar.open('Login realizado com sucesso!', 'Fechar', { duration: 3000 });
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open(
            err.error?.message || 'CPF ou senha inválidos.',
            'Fechar',
            { duration: 5000 }
          );
          this.form.reset();
        }
      });
  }
}
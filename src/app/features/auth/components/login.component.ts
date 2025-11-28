import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'kmgp-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]],
  });

  onSubmit(): void {
    this.isLoading.set(true);
    setTimeout(() => {
      const { email, password } = this.loginForm.getRawValue();
      const success = this.authService.login({ email, password });

      if (success) {
        this.openSnackBar();
        this.router.navigate(['/orders']).then();
      }
      this.isLoading.set(false);
    }, 1000);
  }

  get emailControl(): FormControl<string> {
    return this.loginForm.controls.email;
  }

  get passwordControl(): FormControl<string> {
    return this.loginForm.controls.password;
  }
  openSnackBar(): void {
    this._snackBar.open('Добро пожаловать!', '', {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration: 1000,
    });
  }
}

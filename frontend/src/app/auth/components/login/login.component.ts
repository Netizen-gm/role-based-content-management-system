import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="card-header">
          <h2 class="card-title">Login</h2>
        </div>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.error]="isFieldInvalid('email')"
            />
            <div *ngIf="isFieldInvalid('email')" class="error-message">
              <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
              <span *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              [class.error]="isFieldInvalid('password')"
            />
            <div *ngIf="isFieldInvalid('password')" class="error-message">
              Password is required
            </div>
          </div>

          <div *ngIf="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid || loading">
            <span *ngIf="loading">Logging in...</span>
            <span *ngIf="!loading">Login</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Register here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      padding: 20px;
    }

    .auth-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .auth-footer {
      margin-top: 20px;
      text-align: center;
      color: #666;
    }

    .auth-footer a {
      color: #007bff;
      text-decoration: none;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }

    .btn {
      width: 100%;
      margin-top: 10px;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage = '';
  loading = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.router.navigate(['/articles']);
          } else {
            this.errorMessage = response.message || 'Login failed. Please check your credentials.';
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Login error:', error);
          // Handle different error types
          if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
          } else if (error.status === 401) {
            this.errorMessage = error.error?.message || 'Invalid email or password.';
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.error?.errors) {
            this.errorMessage = error.error.errors.map((e: any) => e.msg).join(', ');
          } else {
            this.errorMessage = 'Login failed. Please check your credentials.';
          }
        }
      });
    }
  }
}

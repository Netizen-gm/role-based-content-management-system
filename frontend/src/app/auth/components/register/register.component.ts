import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="card-header">
          <h2 class="card-title">Register</h2>
        </div>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" enctype="multipart/form-data">
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              formControlName="fullName"
              class="form-control"
              [class.error]="isFieldInvalid('fullName')"
            />
            <div *ngIf="isFieldInvalid('fullName')" class="error-message">
              Full name is required (minimum 2 characters)
            </div>
          </div>

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
              <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
              <span *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</span>
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
              Password is required (minimum 6 characters)
            </div>
          </div>

          <div class="form-group">
            <label for="role">Requested Role</label>
            <select id="role" formControlName="role" class="form-control">
              <option value="">Default (VIEWER) - No approval needed</option>
              <option value="CONTRIBUTOR">Contributor - Requires approval</option>
              <option value="MANAGER">Manager - Requires approval</option>
              <option value="SUPERADMIN">SuperAdmin - Requires approval</option>
            </select>
            <div class="info-box">
              <p><strong>Note:</strong> If you select a role other than VIEWER, your request will be pending SuperAdmin approval. You will start with VIEWER role until approved.</p>
            </div>
          </div>

          <div class="form-group">
            <label for="profilePhoto">Profile Photo (Optional)</label>
            <input
              type="file"
              id="profilePhoto"
              (change)="onFileSelected($event)"
              accept="image/*"
              class="form-control"
            />
          </div>

          <div *ngIf="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="registerForm.invalid || loading">
            <span *ngIf="loading">Registering...</span>
            <span *ngIf="!loading">Register</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Login here</a></p>
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
      max-width: 450px;
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

    input[type="file"] {
      padding: 8px;
    }

    .info-box {
      background-color: #e3f2fd;
      border: 1px solid #90caf9;
      border-radius: 4px;
      padding: 12px;
      margin-top: 10px;
      font-size: 13px;
      color: #1565c0;
    }

    .info-box p {
      margin: 0;
      line-height: 1.5;
    }

    .info-box strong {
      color: #0d47a1;
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  selectedFile: File | null = null;
  errorMessage = '';
  loading = false;

  constructor() {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['']
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const formValue = this.registerForm.value;

      this.authService.register({
        fullName: formValue.fullName,
        email: formValue.email,
        password: formValue.password,
        role: formValue.role || undefined,
        profilePhoto: this.selectedFile || undefined
      }).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.router.navigate(['/articles']);
          } else {
            this.errorMessage = response.message || 'Registration failed. Please try again.';
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Registration error:', error);
          // Handle different error types
          if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
          } else if (error.status === 400) {
            if (error.error?.errors) {
              this.errorMessage = error.error.errors.map((e: any) => e.msg).join(', ');
            } else {
              this.errorMessage = error.error?.message || 'Invalid registration data.';
            }
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
          }
        }
      });
    }
  }
}

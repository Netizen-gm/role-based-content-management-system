import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoleService } from '../../../core/services/role.service';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="role-form-container">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">{{ isEditMode ? 'Edit Role' : 'Create New Role' }}</h2>
        </div>
        <form [formGroup]="roleForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Role Name *</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              class="form-control"
              [class.error]="isFieldInvalid('name')"
              [readonly]="isEditMode"
              placeholder="e.g., EDITOR, MODERATOR"
            />
            <div *ngIf="isFieldInvalid('name')" class="error-message">
              Role name is required (minimum 2 characters)
            </div>
            <small *ngIf="isEditMode" class="form-hint">Role name cannot be changed after creation</small>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              formControlName="description"
              class="form-control"
              rows="3"
              placeholder="Describe the role's purpose and responsibilities"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Permissions *</label>
            <p class="form-hint">Select the permissions this role should have:</p>
            <div class="permissions-checkboxes">
              <label *ngFor="let perm of availablePermissions" class="checkbox-label">
                <input
                  type="checkbox"
                  [value]="perm"
                  (change)="onPermissionChange(perm, $event)"
                  [checked]="selectedPermissions.includes(perm)"
                />
                <span class="permission-name">{{ perm | titlecase }}</span>
                <span class="permission-description">{{ getPermissionDescription(perm) }}</span>
              </label>
            </div>
            <div *ngIf="selectedPermissions.length === 0 && roleForm.get('permissions')?.touched" class="error-message">
              At least one permission must be selected
            </div>
          </div>

          <div *ngIf="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="roleForm.invalid || selectedPermissions.length === 0 || loading">
              <span *ngIf="loading">{{ isEditMode ? 'Updating...' : 'Creating...' }}</span>
              <span *ngIf="!loading">{{ isEditMode ? 'Update Role' : 'Create Role' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .role-form-container {
      max-width: 700px;
      margin: 0 auto;
      padding: 20px 0;
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .form-hint {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    .permissions-checkboxes {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 10px;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .checkbox-label:hover {
      background-color: #f8f9fa;
    }

    .checkbox-label input[type="checkbox"] {
      margin-right: 12px;
      margin-top: 2px;
      cursor: pointer;
    }

    .permission-name {
      font-weight: 500;
      color: #333;
      min-width: 100px;
    }

    .permission-description {
      color: #666;
      font-size: 13px;
      margin-left: auto;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 30px;
    }

    .form-actions .btn {
      min-width: 120px;
    }
  `]
})
export class RoleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  roleForm: FormGroup;
  selectedPermissions: string[] = [];
  availablePermissions = ['create', 'edit', 'delete', 'publish', 'view'];
  isEditMode = false;
  roleId: string | null = null;
  errorMessage = '';
  loading = false;

  permissionDescriptions: { [key: string]: string } = {
    create: 'Create new articles',
    edit: 'Edit existing articles',
    delete: 'Delete articles',
    publish: 'Publish and unpublish articles',
    view: 'View articles'
  };

  constructor() {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      permissions: [[], [Validators.required, this.minLengthArray(1)]]
    });
  }

  minLengthArray(min: number) {
    return (control: any) => {
      if (!control.value || control.value.length < min) {
        return { minLengthArray: { requiredLength: min, actualLength: control.value?.length || 0 } };
      }
      return null;
    };
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.roleId = id;
      this.loadRole(id);
    } else {
      // Initialize permissions form control for new role
      this.roleForm.patchValue({ permissions: [] });
    }
  }

  loadRole(id: string): void {
    this.loading = true;
    this.roleService.getRoleById(id).subscribe({
      next: (response) => {
        if (response.success && response.data.role) {
          const role = response.data.role;
          this.roleForm.patchValue({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions
          });
          this.selectedPermissions = [...role.permissions];
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load role';
        this.loading = false;
      }
    });
  }

  onPermissionChange(permission: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedPermissions.includes(permission)) {
        this.selectedPermissions.push(permission);
      }
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(p => p !== permission);
    }
    this.roleForm.patchValue({ permissions: this.selectedPermissions });
    this.roleForm.get('permissions')?.markAsTouched();
  }

  getPermissionDescription(permission: string): string {
    return this.permissionDescriptions[permission] || '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.roleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.roleForm.valid && this.selectedPermissions.length > 0) {
      this.loading = true;
      this.errorMessage = '';

      const roleData = {
        name: this.roleForm.value.name.toUpperCase().trim(),
        description: this.roleForm.value.description?.trim() || '',
        permissions: this.selectedPermissions
      };

      if (this.isEditMode && this.roleId) {
        this.roleService.updateRole(this.roleId, roleData).subscribe({
          next: () => {
            this.router.navigate(['/roles']);
          },
          error: (error) => {
            this.loading = false;
            if (error.error?.errors) {
              this.errorMessage = error.error.errors.map((e: any) => e.msg).join(', ');
            } else {
              this.errorMessage = error.error?.message || 'Failed to update role';
            }
          }
        });
      } else {
        this.roleService.createRole(roleData).subscribe({
          next: () => {
            this.router.navigate(['/roles']);
          },
          error: (error) => {
            this.loading = false;
            if (error.error?.errors) {
              this.errorMessage = error.error.errors.map((e: any) => e.msg).join(', ');
            } else {
              this.errorMessage = error.error?.message || 'Failed to create role';
            }
          }
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/roles']);
  }
}

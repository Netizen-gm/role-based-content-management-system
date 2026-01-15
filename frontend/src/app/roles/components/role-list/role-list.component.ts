import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RoleService, Role } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="roles-container">
      <div class="roles-header">
        <h1>Role Management</h1>
        <button 
          *ngIf="isSuperAdmin()" 
          class="btn btn-primary" 
          routerLink="/roles/create"
        >
          Create New Role
        </button>
      </div>

      <div *ngIf="loading" class="text-center">
        <div class="spinner"></div>
        <p>Loading roles...</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>

      <div *ngIf="!loading && !errorMessage" class="roles-grid">
        <div *ngFor="let role of roles" class="role-card">
          <div class="role-header">
            <h3>{{ role.name }}</h3>
            <span *ngIf="role.isDefault" class="badge badge-default">Default</span>
          </div>
          <p class="role-description">{{ role.description || 'No description' }}</p>
          
          <div class="permissions-section">
            <h4>Permissions:</h4>
            <div class="permissions-list">
              <span 
                *ngFor="let perm of ['create', 'edit', 'delete', 'publish', 'view']"
                class="permission-badge"
                [class.has-permission]="role.permissions.includes(perm)"
                [class.no-permission]="!role.permissions.includes(perm)"
              >
                {{ perm }}
              </span>
            </div>
          </div>

          <div class="role-actions" *ngIf="isSuperAdmin()">
            <button 
              [routerLink]="['/roles', role._id, 'edit']"
              class="btn btn-primary"
            >
              Edit
            </button>
            <button 
              *ngIf="!role.isDefault"
              (click)="deleteRole(role._id, role.name)"
              class="btn btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && roles.length === 0" class="text-center">
        <p>No roles found.</p>
      </div>
    </div>
  `,
  styles: [`
    .roles-container {
      padding: 20px 0;
    }

    .roles-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .roles-header h1 {
      margin: 0;
      color: #333;
    }

    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .role-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 20px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .role-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .role-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .role-header h3 {
      margin: 0;
      color: #333;
      font-size: 20px;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .badge-default {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .role-description {
      color: #666;
      margin-bottom: 15px;
      line-height: 1.5;
    }

    .permissions-section {
      margin-bottom: 20px;
    }

    .permissions-section h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #333;
    }

    .permissions-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .permission-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }

    .permission-badge.has-permission {
      background-color: #d4edda;
      color: #155724;
    }

    .permission-badge.no-permission {
      background-color: #f8d7da;
      color: #721c24;
      opacity: 0.5;
    }

    .role-actions {
      display: flex;
      gap: 10px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .role-actions .btn {
      flex: 1;
      padding: 8px 16px;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .roles-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }

      .roles-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RoleListComponent implements OnInit {
  private roleService = inject(RoleService);
  private authService = inject(AuthService);
  private router = inject(Router);

  roles: Role[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.errorMessage = '';

    this.roleService.getAllRoles().subscribe({
      next: (response) => {
        if (response.success && response.data.roles) {
          this.roles = response.data.roles;
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load roles';
        this.loading = false;
      }
    });
  }

  deleteRole(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete the role "${name}"? This action cannot be undone.`)) {
      this.roleService.deleteRole(id).subscribe({
        next: () => {
          this.loadRoles();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete role';
        }
      });
    }
  }

  isSuperAdmin(): boolean {
    return this.authService.hasRole('SUPERADMIN');
  }
}

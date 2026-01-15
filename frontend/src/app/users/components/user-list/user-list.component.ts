import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService, User } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="users-container">
      <div class="users-header">
        <h1>User Management</h1>
      </div>

      <div *ngIf="loading" class="text-center">
        <div class="spinner"></div>
        <p>Loading users...</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>

      <div *ngIf="!loading && !errorMessage" class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>
                <div class="user-info">
                  <img 
                    *ngIf="user.profilePhoto" 
                    [src]="getImageUrl(user.profilePhoto)" 
                    [alt]="user.fullName"
                    class="user-avatar"
                  />
                  <span *ngIf="!user.profilePhoto" class="user-avatar-placeholder">
                    {{ user.fullName.charAt(0).toUpperCase() }}
                  </span>
                  <span>{{ user.fullName }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <div class="role-info">
                  <span class="role-badge" [class]="'role-' + user.role.name.toLowerCase()">
                    {{ user.role.name }}
                  </span>
                  <span *ngIf="user.roleRequestStatus === 'pending' && user.requestedRole" class="pending-badge">
                    Pending: {{ user.requestedRole.name }}
                  </span>
                </div>
              </td>
              <td>
                <span [class]="user.isActive ? 'status-active' : 'status-inactive'">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="btn btn-sm btn-primary"
                    (click)="openEditModal(user)"
                  >
                    Edit
                  </button>
                  <button 
                    *ngIf="user._id !== currentUserId"
                    class="btn btn-sm btn-danger"
                    (click)="deleteUser(user._id, user.fullName)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && users.length === 0" class="text-center">
        <p>No users found.</p>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div *ngIf="showEditModal && selectedUser" class="modal-overlay" (click)="closeEditModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Edit User: {{ selectedUser.fullName }}</h3>
          <button class="modal-close" (click)="closeEditModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form [formGroup]="editForm" (ngSubmit)="onUpdateUser()">
            <div class="form-group">
              <label for="editFullName">Full Name</label>
              <input
                type="text"
                id="editFullName"
                formControlName="fullName"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="editEmail">Email</label>
              <input
                type="email"
                id="editEmail"
                formControlName="email"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="editRole">Role</label>
              <select id="editRole" formControlName="role" class="form-control">
                <option *ngFor="let role of roles" [value]="role.name">
                  {{ role.name }} - {{ role.description }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="isActive" />
                <span>Active</span>
              </label>
            </div>

            <div *ngIf="updateErrorMessage" class="alert alert-error">
              {{ updateErrorMessage }}
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeEditModal()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="editForm.invalid || updating">
                <span *ngIf="updating">Updating...</span>
                <span *ngIf="!updating">Update User</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .users-container {
      padding: 20px 0;
    }

    .users-header {
      margin-bottom: 30px;
    }

    .users-header h1 {
      margin: 0;
      color: #333;
    }

    .users-table-container {
      overflow-x: auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
    }

    .users-table thead {
      background-color: #f8f9fa;
    }

    .users-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #dee2e6;
    }

    .users-table td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }

    .users-table tbody tr:hover {
      background-color: #f8f9fa;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-avatar-placeholder {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #007bff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .role-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .role-badge.role-superadmin {
      background-color: #dc3545;
      color: white;
    }

    .role-badge.role-manager {
      background-color: #007bff;
      color: white;
    }

    .role-badge.role-contributor {
      background-color: #28a745;
      color: white;
    }

    .role-badge.role-viewer {
      background-color: #6c757d;
      color: white;
    }

    .role-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .pending-badge {
      font-size: 11px;
      color: #ffc107;
      font-weight: 500;
      font-style: italic;
    }

    .status-active {
      color: #28a745;
      font-weight: 500;
    }

    .status-inactive {
      color: #dc3545;
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .btn-sm {
      padding: 4px 12px;
      font-size: 12px;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #dee2e6;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-close:hover {
      color: #333;
    }

    .modal-body {
      padding: 20px;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .users-table-container {
        font-size: 14px;
      }

      .users-table th,
      .users-table td {
        padding: 8px;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  users: User[] = [];
  roles: any[] = [];
  loading = false;
  errorMessage = '';
  showEditModal = false;
  selectedUser: User | null = null;
  editForm!: FormGroup;
  updating = false;
  updateErrorMessage = '';
  currentUserId = '';

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserId = currentUser.id;
    }
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success && response.data.users) {
          this.users = response.data.users;
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load users';
        this.loading = false;
      }
    });
  }

  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (response) => {
        if (response.success && response.data.roles) {
          this.roles = response.data.roles;
        }
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
      }
    });
  }

  openEditModal(user: User): void {
    this.selectedUser = user;
    this.showEditModal = true;
    this.updateErrorMessage = '';
    
    // Initialize form with user data
    this.editForm = this.fb.group({
      fullName: [user.fullName, [Validators.required, Validators.minLength(2)]],
      email: [user.email, [Validators.required, Validators.email]],
      role: [user.role.name, [Validators.required]],
      isActive: [user.isActive]
    });
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
    this.updateErrorMessage = '';
  }

  onUpdateUser(): void {
    if (!this.selectedUser || !this.editForm.valid) return;

    this.updating = true;
    this.updateErrorMessage = '';

    const formValue = this.editForm.value;
    this.userService.updateUser(this.selectedUser._id, {
      fullName: formValue.fullName,
      email: formValue.email,
      role: formValue.role,
      isActive: formValue.isActive
    }).subscribe({
      next: () => {
        this.updating = false;
        this.closeEditModal();
        this.loadUsers(); // Reload users list
      },
      error: (error) => {
        this.updating = false;
        if (error.error?.errors) {
          this.updateErrorMessage = error.error.errors.map((e: any) => e.msg).join(', ');
        } else {
          this.updateErrorMessage = error.error?.message || 'Failed to update user';
        }
      }
    });
  }

  deleteUser(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete user';
        }
      });
    }
  }

  getImageUrl(imagePath: string): string {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    const apiUrl = 'http://localhost:8080';
    return `${apiUrl}${imagePath}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}

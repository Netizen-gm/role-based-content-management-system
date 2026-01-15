import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../../core/services/user.service';

@Component({
  selector: 'app-pending-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pending-requests-container">
      <div class="header">
        <h1>Pending Role Requests</h1>
        <p>Review and approve or reject role requests from new users</p>
      </div>

      <div *ngIf="loading" class="text-center">
        <div class="spinner"></div>
        <p>Loading pending requests...</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>

      <div *ngIf="!loading && !errorMessage && users.length === 0" class="empty-state">
        <p>No pending role requests at this time.</p>
      </div>

      <div *ngIf="!loading && !errorMessage && users.length > 0" class="requests-list">
        <div *ngFor="let user of users" class="request-card">
          <div class="request-header">
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
              <div>
                <h3>{{ user.fullName }}</h3>
                <p class="user-email">{{ user.email }}</p>
              </div>
            </div>
          </div>

          <div class="request-details">
            <div class="detail-row">
              <span class="label">Current Role:</span>
              <span class="role-badge current-role">{{ user.role.name }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Requested Role:</span>
              <span class="role-badge requested-role">{{ user.requestedRole?.name }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Requested On:</span>
              <span>{{ formatDate(user.createdAt) }}</span>
            </div>
          </div>

          <div class="request-actions">
            <button 
              class="btn btn-success"
              (click)="approveRequest(user._id, user.fullName, user.requestedRole?.name)"
              [disabled]="processing"
            >
              Approve
            </button>
            <button 
              class="btn btn-danger"
              (click)="rejectRequest(user._id, user.fullName)"
              [disabled]="processing"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pending-requests-container {
      padding: 20px 0;
    }

    .header {
      margin-bottom: 30px;
    }

    .header h1 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .header p {
      color: #666;
      margin: 0;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      color: #666;
    }

    .requests-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .request-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 20px;
      transition: box-shadow 0.2s;
    }

    .request-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .request-header {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .user-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-avatar-placeholder {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: #007bff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 20px;
    }

    .user-info h3 {
      margin: 0 0 5px 0;
      color: #333;
      font-size: 18px;
    }

    .user-email {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .request-details {
      margin-bottom: 20px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    .role-badge {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .role-badge.current-role {
      background-color: #6c757d;
      color: white;
    }

    .role-badge.requested-role {
      background-color: #ffc107;
      color: #000;
    }

    .request-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .btn-success {
      background-color: #28a745;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background-color: #218838;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background-color: #c82333;
    }

    @media (max-width: 768px) {
      .request-actions {
        flex-direction: column;
      }

      .request-actions .btn {
        width: 100%;
      }

      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
      }
    }
  `]
})
export class PendingRequestsComponent implements OnInit {
  private userService = inject(UserService);

  users: User[] = [];
  loading = false;
  errorMessage = '';
  processing = false;

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  loadPendingRequests(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getPendingRoleRequests().subscribe({
      next: (response) => {
        if (response.success && response.data.users) {
          this.users = response.data.users;
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load pending requests';
        this.loading = false;
      }
    });
  }

  approveRequest(userId: string, userName: string, requestedRole?: string): void {
    if (confirm(`Approve role request for ${userName}? They will be assigned the ${requestedRole} role.`)) {
      this.processing = true;
      this.userService.approveRoleRequest(userId).subscribe({
        next: () => {
          this.processing = false;
          this.loadPendingRequests(); // Reload list
        },
        error: (error) => {
          this.processing = false;
          this.errorMessage = error.error?.message || 'Failed to approve request';
        }
      });
    }
  }

  rejectRequest(userId: string, userName: string): void {
    if (confirm(`Reject role request for ${userName}? They will remain as VIEWER.`)) {
      this.processing = true;
      this.userService.rejectRoleRequest(userId).subscribe({
        next: () => {
          this.processing = false;
          this.loadPendingRequests(); // Reload list
        },
        error: (error) => {
          this.processing = false;
          this.errorMessage = error.error?.message || 'Failed to reject request';
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
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

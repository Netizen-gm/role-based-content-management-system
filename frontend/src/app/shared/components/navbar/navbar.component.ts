import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <a routerLink="/articles">Role-Based CMS</a>
        </div>
        <div class="navbar-menu">
          <ng-container *ngIf="isAuthenticated(); else notAuthenticated">
            <!-- Common Navigation -->
            <a routerLink="/articles" routerLinkActive="active">Articles</a>
            
            <!-- SuperAdmin Navigation -->
            <ng-container *ngIf="hasRole('SUPERADMIN')">
              <div class="nav-divider"></div>
              <a routerLink="/admin" routerLinkActive="active" class="nav-admin">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                </svg>
                Dashboard
              </a>
              <a routerLink="/roles" routerLinkActive="active">Manage Roles</a>
              <a routerLink="/users" routerLinkActive="active">Manage Users</a>
              <a routerLink="/users/pending-requests" routerLinkActive="active">
                Pending Requests
                <span *ngIf="pendingRequestsCount > 0" class="badge">{{ pendingRequestsCount }}</span>
              </a>
            </ng-container>

            <!-- Manager Navigation -->
            <ng-container *ngIf="hasRole('MANAGER') && !hasRole('SUPERADMIN')">
              <div class="nav-divider"></div>
              <span class="nav-label">Management</span>
            </ng-container>

            <!-- Contributor Navigation -->
            <ng-container *ngIf="hasRole('CONTRIBUTOR') && !hasRole('SUPERADMIN') && !hasRole('MANAGER')">
              <div class="nav-divider"></div>
              <span class="nav-label">Content</span>
            </ng-container>

            <!-- Content Creation (for Contributors, Managers, and SuperAdmin) -->
            <a *ngIf="hasPermission('create')" routerLink="/articles/create" routerLinkActive="active" class="nav-create">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Article
            </a>

            <!-- User Info -->
            <div class="navbar-user">
              <div class="user-info">
                <span class="user-name">{{ getCurrentUser()?.fullName }}</span>
                <span class="user-role" [class.role-superadmin]="hasRole('SUPERADMIN')" 
                      [class.role-manager]="hasRole('MANAGER')" 
                      [class.role-contributor]="hasRole('CONTRIBUTOR')" 
                      [class.role-viewer]="hasRole('VIEWER')">
                  {{ getCurrentUser()?.role }}
                </span>
              </div>
              <button class="btn btn-secondary" (click)="logout()">Logout</button>
            </div>
          </ng-container>
          <ng-template #notAuthenticated>
            <a routerLink="/login" routerLinkActive="active">Login</a>
            <a routerLink="/register" routerLinkActive="active">Register</a>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background-color: #2c3e50;
      color: white;
      padding: 0;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 70px;
    }

    .navbar-brand a {
      color: white;
      text-decoration: none;
      font-size: 20px;
      font-weight: 600;
    }

    .navbar-brand a:hover {
      opacity: 0.8;
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .navbar-menu a {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 4px;
      transition: background-color 0.3s;
    }

    .navbar-menu a:hover,
    .navbar-menu a.active {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: 20px;
      padding-left: 20px;
      border-left: 1px solid rgba(255, 255, 255, 0.2);
    }

    .nav-divider {
      width: 1px;
      height: 24px;
      background-color: rgba(255, 255, 255, 0.2);
      margin: 0 10px;
    }

    .nav-label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      padding: 0 8px;
    }

    .nav-admin,
    .nav-create {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    .user-name {
      font-size: 14px;
      font-weight: 500;
    }

    .user-role {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 3px;
      letter-spacing: 0.5px;
    }

    .user-role.role-superadmin {
      background-color: #dc3545;
      color: white;
    }

    .user-role.role-manager {
      background-color: #007bff;
      color: white;
    }

    .user-role.role-contributor {
      background-color: #28a745;
      color: white;
    }

    .user-role.role-viewer {
      background-color: #6c757d;
      color: white;
    }

    .navbar-user .btn {
      padding: 6px 12px;
      font-size: 12px;
    }

    .badge {
      display: inline-block;
      background-color: #dc3545;
      color: white;
      border-radius: 10px;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: 600;
      margin-left: 5px;
    }

    @media (max-width: 768px) {
      .navbar-container {
        flex-direction: column;
        height: auto;
        padding: 10px;
      }

      .navbar-menu {
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 10px;
      }

      .navbar-user {
        border-left: none;
        padding-left: 0;
        margin-left: 0;
        margin-top: 10px;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private userService = inject(UserService);

  pendingRequestsCount = 0;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.getProfile().subscribe();
      if (this.hasRole('SUPERADMIN')) {
        this.loadPendingRequestsCount();
      }
    }
  }

  loadPendingRequestsCount(): void {
    this.userService.getPendingRoleRequests().subscribe({
      next: (response) => {
        if (response.success && response.data.users) {
          this.pendingRequestsCount = response.data.users.length;
        }
      },
      error: () => {
        // Silently fail - don't show error in navbar
      }
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  logout(): void {
    this.authService.logout();
  }
}

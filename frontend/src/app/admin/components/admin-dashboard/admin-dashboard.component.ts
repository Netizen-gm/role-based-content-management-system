import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { ArticleService } from '../../../core/services/article.service';

interface DashboardStats {
  totalUsers: number;
  totalRoles: number;
  totalArticles: number;
  pendingRequests: number;
  activeUsers: number;
  publishedArticles: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>SuperAdmin Dashboard</h1>
        <p>Manage your CMS system from one central location</p>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading dashboard...</p>
      </div>

      <div *ngIf="!loading" class="dashboard-content">
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon users">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ stats.totalUsers }}</h3>
              <p>Total Users</p>
              <span class="stat-subtitle">{{ stats.activeUsers }} active</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon roles">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ stats.totalRoles }}</h3>
              <p>Total Roles</p>
              <span class="stat-subtitle">Role types</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon articles">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ stats.totalArticles }}</h3>
              <p>Total Articles</p>
              <span class="stat-subtitle">{{ stats.publishedArticles }} published</span>
            </div>
          </div>

          <div class="stat-card urgent" *ngIf="stats.pendingRequests > 0">
            <div class="stat-icon pending">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ stats.pendingRequests }}</h3>
              <p>Pending Requests</p>
              <span class="stat-subtitle">Requires attention</span>
            </div>
            <a routerLink="/users/pending-requests" class="stat-action">Review →</a>
          </div>

          <div class="stat-card" *ngIf="stats.pendingRequests === 0">
            <div class="stat-icon success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <h3>0</h3>
              <p>Pending Requests</p>
              <span class="stat-subtitle">All clear!</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="section">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <a routerLink="/users" class="action-card">
              <div class="action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3>Manage Users</h3>
              <p>View, edit, and manage all users</p>
            </a>

            <a routerLink="/users/pending-requests" class="action-card" *ngIf="stats.pendingRequests > 0">
              <div class="action-icon urgent-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3>Review Requests</h3>
              <p>{{ stats.pendingRequests }} role requests pending</p>
              <span class="badge">{{ stats.pendingRequests }}</span>
            </a>

            <a routerLink="/roles" class="action-card">
              <div class="action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3>Manage Roles</h3>
              <p>Create and edit roles & permissions</p>
            </a>

            <a routerLink="/articles" class="action-card">
              <div class="action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <h3>View Articles</h3>
              <p>Browse and manage all articles</p>
            </a>

            <a routerLink="/articles/create" class="action-card">
              <div class="action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <h3>Create Article</h3>
              <p>Add new content to the CMS</p>
            </a>
          </div>
        </div>

        <!-- System Overview -->
        <div class="section">
          <h2>System Overview</h2>
          <div class="overview-grid">
            <div class="overview-card">
              <h3>User Distribution</h3>
              <div class="overview-content">
                <div class="overview-item">
                  <span class="label">Active Users:</span>
                  <span class="value">{{ stats.activeUsers }}</span>
                </div>
                <div class="overview-item">
                  <span class="label">Total Users:</span>
                  <span class="value">{{ stats.totalUsers }}</span>
                </div>
                <div class="overview-item">
                  <span class="label">Pending Requests:</span>
                  <span class="value" [class.urgent-value]="stats.pendingRequests > 0">{{ stats.pendingRequests }}</span>
                </div>
              </div>
            </div>

            <div class="overview-card">
              <h3>Content Statistics</h3>
              <div class="overview-content">
                <div class="overview-item">
                  <span class="label">Published Articles:</span>
                  <span class="value">{{ stats.publishedArticles }}</span>
                </div>
                <div class="overview-item">
                  <span class="label">Total Articles:</span>
                  <span class="value">{{ stats.totalArticles }}</span>
                </div>
                <div class="overview-item">
                  <span class="label">Roles Available:</span>
                  <span class="value">{{ stats.totalRoles }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px 0;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 40px;
    }

    .dashboard-header h1 {
      margin: 0 0 10px 0;
      color: #2c3e50;
      font-size: 32px;
      font-weight: 700;
    }

    .dashboard-header p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .loading-state {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Statistics Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 20px;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stat-card.urgent {
      border: 2px solid #ffc107;
      background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon.users {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-icon.roles {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .stat-icon.articles {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .stat-icon.pending {
      background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
      color: white;
    }

    .stat-icon.success {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: white;
    }

    .stat-content {
      flex: 1;
    }

    .stat-content h3 {
      margin: 0 0 5px 0;
      font-size: 32px;
      font-weight: 700;
      color: #2c3e50;
    }

    .stat-content p {
      margin: 0 0 5px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .stat-subtitle {
      font-size: 12px;
      color: #666;
    }

    .stat-action {
      position: absolute;
      top: 20px;
      right: 20px;
      color: #007bff;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: color 0.2s;
    }

    .stat-action:hover {
      color: #0056b3;
    }

    /* Sections */
    .section {
      margin-bottom: 40px;
    }

    .section h2 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      font-size: 24px;
      font-weight: 600;
    }

    /* Quick Actions */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }

    .action-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-decoration: none;
      color: inherit;
      display: block;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
      text-decoration: none;
      color: inherit;
    }

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .action-icon.urgent-icon {
      background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
    }

    .action-card h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
    }

    .action-card p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .action-card .badge {
      position: absolute;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      border-radius: 12px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
    }

    /* System Overview */
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .overview-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .overview-card h3 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      font-size: 18px;
      font-weight: 600;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0f0f0;
    }

    .overview-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .overview-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;
    }

    .overview-item:last-child {
      border-bottom: none;
    }

    .overview-item .label {
      color: #666;
      font-size: 14px;
    }

    .overview-item .value {
      color: #2c3e50;
      font-size: 16px;
      font-weight: 600;
    }

    .overview-item .value.urgent-value {
      color: #ff9800;
    }

    @media (max-width: 768px) {
      .stats-grid,
      .actions-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-header h1 {
        font-size: 24px;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private articleService = inject(ArticleService);

  stats: DashboardStats = {
    totalUsers: 0,
    totalRoles: 0,
    totalArticles: 0,
    pendingRequests: 0,
    activeUsers: 0,
    publishedArticles: 0
  };

  loading = true;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    this.loading = true;

    try {
      // Load all data in parallel
      const [usersResponse, pendingResponse, rolesResponse, articlesResponse] = await Promise.all([
        firstValueFrom(this.userService.getAllUsers()),
        firstValueFrom(this.userService.getPendingRoleRequests()),
        firstValueFrom(this.roleService.getAllRoles()),
        firstValueFrom(this.articleService.getAllArticles())
      ]);
      // Users
      if (usersResponse?.success && usersResponse.data.users) {
        this.stats.totalUsers = usersResponse.data.users.length;
        this.stats.activeUsers = usersResponse.data.users.filter((u: any) => u.isActive).length;
      }

      // Pending Requests
      if (pendingResponse?.success && pendingResponse.data.users) {
        this.stats.pendingRequests = pendingResponse.data.users.length;
      }

      // Roles
      if (rolesResponse?.success && rolesResponse.data.roles) {
        this.stats.totalRoles = rolesResponse.data.roles.length;
      }

      // Articles
      if (articlesResponse?.success && articlesResponse.data.articles) {
        this.stats.totalArticles = articlesResponse.data.articles.length;
        this.stats.publishedArticles = articlesResponse.data.articles.filter((a: any) => a.status === 'published').length;
      }

      this.loading = false;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.loading = false;
    }
  }
}

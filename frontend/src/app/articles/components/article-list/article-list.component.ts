import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ArticleService, Article } from '../../../core/services/article.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="articles-container">
      <!-- Role-based Welcome Message -->
      <div class="welcome-banner" *ngIf="isAuthenticated()">
        <div class="welcome-content">
          <h2>Welcome, {{ getCurrentUser()?.fullName }}!</h2>
          <p class="welcome-role">
            <span class="role-badge" [class.role-superadmin]="hasRole('SUPERADMIN')" 
                  [class.role-manager]="hasRole('MANAGER')" 
                  [class.role-contributor]="hasRole('CONTRIBUTOR')" 
                  [class.role-viewer]="hasRole('VIEWER')">
              {{ getCurrentUser()?.role }}
            </span>
            <span class="welcome-message">
              <span *ngIf="hasRole('SUPERADMIN')">You have full system access and can manage everything.</span>
              <span *ngIf="hasRole('MANAGER') && !hasRole('SUPERADMIN')">You can manage articles and publish content.</span>
              <span *ngIf="hasRole('CONTRIBUTOR') && !hasRole('SUPERADMIN') && !hasRole('MANAGER')">You can create and edit articles.</span>
              <span *ngIf="hasRole('VIEWER')">You can view published articles only.</span>
            </span>
          </p>
        </div>
      </div>

      <div class="articles-header">
        <h1>Articles</h1>
        <button 
          *ngIf="hasPermission('create')" 
          class="btn btn-primary" 
          routerLink="/articles/create"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Article
        </button>
      </div>

      <!-- Viewer-specific message -->
      <div *ngIf="hasRole('VIEWER')" class="info-message">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>You are viewing published articles only. Contact an administrator for more access.</span>
      </div>

      <div *ngIf="loading" class="text-center">
        <div class="spinner"></div>
        <p>Loading articles...</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>

      <div *ngIf="!loading && !errorMessage" class="articles-grid">
        <div *ngFor="let article of articles" class="article-card">
          <div class="article-image" *ngIf="article.image">
            <img [src]="getImageUrl(article.image)" [alt]="article.title" />
          </div>
          <div class="article-content">
            <div class="article-header">
              <h3 class="article-title">
                <a [routerLink]="['/articles', article._id]">{{ article.title }}</a>
              </h3>
              <div class="article-status-group">
                <span class="article-status" [class.published]="article.status === 'published'" [class.unpublished]="article.status === 'unpublished'">
                  {{ article.status }}
                </span>
                <!-- Show author badge for non-viewers -->
                <span *ngIf="!hasRole('VIEWER') && isAuthor(article)" class="author-badge">Your Article</span>
              </div>
            </div>
            <p class="article-excerpt">{{ getExcerpt(article.body) }}</p>
            <div class="article-meta">
              <span>By {{ article.author.fullName }}</span>
              <span>•</span>
              <span>{{ formatDate(article.createdAt) }}</span>
            </div>
            <div class="article-actions">
              <a [routerLink]="['/articles', article._id]" class="btn btn-secondary">View</a>
              <!-- Show actions only if user has permissions -->
              <ng-container *ngIf="!hasRole('VIEWER')">
                <button 
                  *ngIf="canEdit(article)"
                  [routerLink]="['/articles', article._id, 'edit']"
                  class="btn btn-primary"
                >
                  Edit
                </button>
                <button 
                  *ngIf="canDelete(article)"
                  (click)="deleteArticle(article._id)"
                  class="btn btn-danger"
                >
                  Delete
                </button>
                <button 
                  *ngIf="hasPermission('publish') && article.status === 'unpublished'"
                  (click)="publishArticle(article._id)"
                  class="btn btn-success"
                >
                  Publish
                </button>
                <button 
                  *ngIf="hasPermission('publish') && article.status === 'published'"
                  (click)="unpublishArticle(article._id)"
                  class="btn btn-secondary"
                >
                  Unpublish
                </button>
              </ng-container>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && articles.length === 0" class="text-center">
        <p>No articles found.</p>
        <button *ngIf="hasPermission('create')" class="btn btn-primary mt-2" routerLink="/articles/create">
          Create Your First Article
        </button>
      </div>
    </div>
  `,
  styles: [`
    .articles-container {
      padding: 20px 0;
    }

    .welcome-banner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .welcome-content h2 {
      margin: 0 0 10px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .welcome-role {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .welcome-message {
      font-size: 14px;
      opacity: 0.95;
    }

    .role-badge {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .role-badge.role-superadmin {
      background-color: rgba(220, 53, 69, 0.3);
      border: 1px solid rgba(220, 53, 69, 0.5);
    }

    .role-badge.role-manager {
      background-color: rgba(0, 123, 255, 0.3);
      border: 1px solid rgba(0, 123, 255, 0.5);
    }

    .role-badge.role-contributor {
      background-color: rgba(40, 167, 69, 0.3);
      border: 1px solid rgba(40, 167, 69, 0.5);
    }

    .role-badge.role-viewer {
      background-color: rgba(108, 117, 125, 0.3);
      border: 1px solid rgba(108, 117, 125, 0.5);
    }

    .info-message {
      background-color: #e7f3ff;
      border-left: 4px solid #007bff;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #004085;
    }

    .info-message svg {
      flex-shrink: 0;
      color: #007bff;
    }

    .article-status-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .author-badge {
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      background-color: #e3f2fd;
      color: #1976d2;
      border: 1px solid #90caf9;
    }

    .articles-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .articles-header h1 {
      margin: 0;
      color: #333;
    }

    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .article-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .article-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .article-image {
      width: 100%;
      height: 200px;
      overflow: hidden;
      background-color: #f0f0f0;
    }

    .article-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .article-content {
      padding: 20px;
    }

    .article-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      gap: 10px;
    }

    .article-title {
      margin: 0;
      flex: 1;
    }

    .article-title a {
      color: #333;
      text-decoration: none;
      font-size: 18px;
      font-weight: 600;
    }

    .article-title a:hover {
      color: #007bff;
    }

    .article-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .article-status.published {
      background-color: #d4edda;
      color: #155724;
    }

    .article-status.unpublished {
      background-color: #fff3cd;
      color: #856404;
    }

    .article-excerpt {
      color: #666;
      margin: 10px 0;
      line-height: 1.6;
    }

    .article-meta {
      display: flex;
      gap: 8px;
      font-size: 12px;
      color: #999;
      margin-bottom: 15px;
    }

    .article-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .article-actions .btn {
      padding: 6px 12px;
      font-size: 12px;
    }

    @media (max-width: 768px) {
      .articles-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }

      .articles-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ArticleListComponent implements OnInit {
  private articleService = inject(ArticleService);
  private authService = inject(AuthService);
  private router = inject(Router);

  articles: Article[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.loading = true;
    this.errorMessage = '';

    // Viewers only see published articles
    const status = this.hasRole('VIEWER') ? 'published' : undefined;

    this.articleService.getAllArticles(status).subscribe({
      next: (response) => {
        if (response.success && response.data.articles) {
          this.articles = response.data.articles;
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load articles';
        this.loading = false;
      }
    });
  }

  deleteArticle(id: string): void {
    if (confirm('Are you sure you want to delete this article?')) {
      this.articleService.deleteArticle(id).subscribe({
        next: () => {
          this.loadArticles();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete article';
        }
      });
    }
  }

  publishArticle(id: string): void {
    this.articleService.publishArticle(id).subscribe({
      next: () => {
        this.loadArticles();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to publish article';
      }
    });
  }

  unpublishArticle(id: string): void {
    this.articleService.unpublishArticle(id).subscribe({
      next: () => {
        this.loadArticles();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to unpublish article';
      }
    });
  }

  getImageUrl(imagePath: string): string {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Use environment API URL but remove /api suffix for static files
    const apiUrl = 'http://localhost:8080';
    return `${apiUrl}${imagePath}`;
  }

  getExcerpt(body: string): string {
    return body.length > 150 ? body.substring(0, 150) + '...' : body;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  canEdit(article: Article): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    
    const isAuthor = article.author._id === user.id;
    const hasEditPermission = this.hasPermission('edit');
    const isManagerOrAdmin = this.hasRole('MANAGER') || this.hasRole('SUPERADMIN');
    
    return isAuthor || (hasEditPermission && (isManagerOrAdmin || isAuthor));
  }

  canDelete(article: Article): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    
    const isAuthor = article.author._id === user.id;
    const hasDeletePermission = this.hasPermission('delete');
    const isManagerOrAdmin = this.hasRole('MANAGER') || this.hasRole('SUPERADMIN');
    
    return isAuthor || (hasDeletePermission && (isManagerOrAdmin || isAuthor));
  }

  isAuthor(article: Article): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    return article.author._id === user.id;
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }
}

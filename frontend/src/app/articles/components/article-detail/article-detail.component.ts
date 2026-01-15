import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArticleService, Article } from '../../../core/services/article.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="article-detail-container">
      <div *ngIf="loading" class="text-center">
        <div class="spinner"></div>
        <p>Loading article...</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>

      <div *ngIf="article && !loading" class="article-detail">
        <!-- Role-based access message for Viewers -->
        <div *ngIf="hasRole('VIEWER') && article.status !== 'published'" class="access-restricted">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <div>
            <h3>Access Restricted</h3>
            <p>This article is unpublished and only available to users with appropriate permissions.</p>
          </div>
        </div>

        <div class="article-actions-header">
          <button class="btn btn-secondary" (click)="goBack()">← Back to Articles</button>
          <div class="article-actions" *ngIf="(canEdit(article) || canDelete(article) || hasPermission('publish')) && !hasRole('VIEWER')">
            <button 
              *ngIf="canEdit(article)"
              [routerLink]="['/articles', article._id, 'edit']"
              class="btn btn-primary"
            >
              Edit
            </button>
            <button 
              *ngIf="canDelete(article)"
              (click)="deleteArticle()"
              class="btn btn-danger"
            >
              Delete
            </button>
            <button 
              *ngIf="hasPermission('publish') && article.status === 'unpublished'"
              (click)="publishArticle()"
              class="btn btn-success"
            >
              Publish
            </button>
            <button 
              *ngIf="hasPermission('publish') && article.status === 'published'"
              (click)="unpublishArticle()"
              class="btn btn-secondary"
            >
              Unpublish
            </button>
          </div>
        </div>

        <div class="card">
          <div class="article-status-badge" [class.published]="article.status === 'published'" [class.unpublished]="article.status === 'unpublished'">
            {{ article.status }}
          </div>

          <h1 class="article-detail-title">{{ article.title }}</h1>

          <div class="article-meta">
            <span>By {{ article.author.fullName }}</span>
            <span *ngIf="isAuthor(article)" class="author-indicator">(Your Article)</span>
            <span>•</span>
            <span>{{ formatDate(article.createdAt) }}</span>
            <span *ngIf="article.publishedAt">•</span>
            <span *ngIf="article.publishedAt">Published: {{ formatDate(article.publishedAt) }}</span>
            <!-- Show edit/update info for non-viewers -->
            <span *ngIf="!hasRole('VIEWER') && article.updatedAt !== article.createdAt">•</span>
            <span *ngIf="!hasRole('VIEWER') && article.updatedAt !== article.createdAt">Updated: {{ formatDate(article.updatedAt) }}</span>
          </div>

          <div *ngIf="article.image" class="article-image">
            <img [src]="getImageUrl(article.image)" [alt]="article.title" />
          </div>

          <div class="article-body">
            <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">{{ article.body }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .article-detail-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px 0;
    }

    .article-actions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .article-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .article-detail {
      margin-top: 20px;
    }

    .card {
      position: relative;
    }

    .article-status-badge {
      position: absolute;
      top: 20px;
      right: 20px;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .article-status-badge.published {
      background-color: #d4edda;
      color: #155724;
    }

    .article-status-badge.unpublished {
      background-color: #fff3cd;
      color: #856404;
    }

    .article-detail-title {
      font-size: 32px;
      font-weight: 700;
      color: #333;
      margin: 20px 0 15px 0;
      line-height: 1.3;
    }

    .article-meta {
      display: flex;
      gap: 10px;
      color: #666;
      font-size: 14px;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }

    .article-image {
      width: 100%;
      margin-bottom: 30px;
      border-radius: 8px;
      overflow: hidden;
    }

    .article-image img {
      width: 100%;
      height: auto;
      display: block;
    }

    .article-body {
      font-size: 16px;
      line-height: 1.8;
      color: #333;
      padding: 20px 0;
    }

    .access-restricted {
      background-color: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 20px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .access-restricted svg {
      color: #ff9800;
      flex-shrink: 0;
      margin-top: 4px;
    }

    .access-restricted h3 {
      margin: 0 0 8px 0;
      color: #856404;
      font-size: 18px;
    }

    .access-restricted p {
      margin: 0;
      color: #856404;
      line-height: 1.6;
    }

    .author-indicator {
      color: #1976d2;
      font-weight: 600;
      font-size: 13px;
    }

    @media (max-width: 768px) {
      .article-actions-header {
        flex-direction: column;
        align-items: stretch;
      }

      .article-actions {
        justify-content: stretch;
      }

      .article-actions .btn {
        flex: 1;
      }

      .article-detail-title {
        font-size: 24px;
      }

      .article-status-badge {
        position: static;
        display: inline-block;
        margin-bottom: 10px;
      }
    }
  `]
})
export class ArticleDetailComponent implements OnInit {
  private articleService = inject(ArticleService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  article: Article | null = null;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadArticle(id);
    }
  }

  loadArticle(id: string): void {
    this.loading = true;
    this.articleService.getArticleById(id).subscribe({
      next: (response) => {
        if (response.success && response.data.article) {
          const article = response.data.article;
          // Viewers can only see published articles
          if (this.hasRole('VIEWER') && article.status !== 'published') {
            this.errorMessage = 'Access denied. This article is not published.';
            this.article = null;
          } else {
            this.article = article;
          }
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load article';
        this.loading = false;
      }
    });
  }

  deleteArticle(): void {
    if (this.article && confirm('Are you sure you want to delete this article?')) {
      this.articleService.deleteArticle(this.article._id).subscribe({
        next: () => {
          this.router.navigate(['/articles']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete article';
        }
      });
    }
  }

  publishArticle(): void {
    if (this.article) {
      this.articleService.publishArticle(this.article._id).subscribe({
        next: () => {
          this.loadArticle(this.article!._id);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to publish article';
        }
      });
    }
  }

  unpublishArticle(): void {
    if (this.article) {
      this.articleService.unpublishArticle(this.article._id).subscribe({
        next: () => {
          this.loadArticle(this.article!._id);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to unpublish article';
        }
      });
    }
  }

  getImageUrl(imagePath: string): string {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Use environment API URL but remove /api suffix for static files
    const apiUrl = 'http://localhost:8080';
    return `${apiUrl}${imagePath}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  canEdit(article: Article): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    
    const isAuthor = article.author._id === user.id;
    const hasEditPermission = this.hasPermission('edit');
    const isManagerOrAdmin = this.authService.hasRole('MANAGER') || this.authService.hasRole('SUPERADMIN');
    
    return isAuthor || (hasEditPermission && (isManagerOrAdmin || isAuthor));
  }

  canDelete(article: Article): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    
    const isAuthor = article.author._id === user.id;
    const hasDeletePermission = this.hasPermission('delete');
    const isManagerOrAdmin = this.authService.hasRole('MANAGER') || this.authService.hasRole('SUPERADMIN');
    
    return isAuthor || (hasDeletePermission && (isManagerOrAdmin || isAuthor));
  }

  isAuthor(article: Article): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    return article.author._id === user.id;
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  goBack(): void {
    this.router.navigate(['/articles']);
  }
}

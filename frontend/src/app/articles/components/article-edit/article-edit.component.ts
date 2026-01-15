import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService, Article } from '../../../core/services/article.service';

@Component({
  selector: 'app-article-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="article-form-container">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Edit Article</h2>
        </div>
        <div *ngIf="loading && !article" class="text-center">
          <div class="spinner"></div>
          <p>Loading article...</p>
        </div>
        <form *ngIf="article" [formGroup]="articleForm" (ngSubmit)="onSubmit()" enctype="multipart/form-data">
          <div class="form-group">
            <label for="title">Title *</label>
            <input
              type="text"
              id="title"
              formControlName="title"
              class="form-control"
              [class.error]="isFieldInvalid('title')"
            />
            <div *ngIf="isFieldInvalid('title')" class="error-message">
              Title is required (minimum 3 characters)
            </div>
          </div>

          <div class="form-group">
            <label for="body">Body *</label>
            <textarea
              id="body"
              formControlName="body"
              class="form-control"
              rows="10"
              [class.error]="isFieldInvalid('body')"
            ></textarea>
            <div *ngIf="isFieldInvalid('body')" class="error-message">
              Body is required (minimum 10 characters)
            </div>
          </div>

          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" formControlName="status" class="form-control">
              <option value="unpublished">Unpublished</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div class="form-group">
            <label for="image">Article Image</label>
            <div *ngIf="article.image" class="mb-2">
              <img [src]="getImageUrl(article.image)" [alt]="article.title" style="max-width: 200px; border-radius: 4px;" />
              <p><small>Current image</small></p>
            </div>
            <input
              type="file"
              id="image"
              (change)="onFileSelected($event)"
              accept="image/*"
              class="form-control"
            />
            <div *ngIf="selectedFile" class="mt-1">
              <small>New image selected: {{ selectedFile.name }}</small>
            </div>
          </div>

          <div *ngIf="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="articleForm.invalid || saving">
              <span *ngIf="saving">Saving...</span>
              <span *ngIf="!saving">Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .article-form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px 0;
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    input[type="file"] {
      padding: 8px;
    }
  `]
})
export class ArticleEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private articleService = inject(ArticleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  articleForm: FormGroup;
  article: Article | null = null;
  selectedFile: File | null = null;
  errorMessage = '';
  loading = false;
  saving = false;

  constructor() {
    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      body: ['', [Validators.required, Validators.minLength(10)]],
      status: ['unpublished']
    });
  }

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
          this.article = response.data.article;
          this.articleForm.patchValue({
            title: this.article.title,
            body: this.article.body,
            status: this.article.status
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load article';
        this.loading = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.articleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  getImageUrl(imagePath: string): string {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
  }

  onSubmit(): void {
    if (this.articleForm.valid && this.article) {
      this.saving = true;
      this.errorMessage = '';

      const formValue = this.articleForm.value;

      this.articleService.updateArticle(this.article._id, {
        title: formValue.title,
        body: formValue.body,
        status: formValue.status,
        image: this.selectedFile || undefined
      }).subscribe({
        next: (response) => {
          if (response.success && response.data.article) {
            this.router.navigate(['/articles', response.data.article._id]);
          }
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage = error.error?.message || 'Failed to update article';
        },
        complete: () => {
          this.saving = false;
        }
      });
    }
  }

  cancel(): void {
    if (this.article) {
      this.router.navigate(['/articles', this.article._id]);
    } else {
      this.router.navigate(['/articles']);
    }
  }
}

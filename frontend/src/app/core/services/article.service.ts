import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Article {
  _id: string;
  title: string;
  body: string;
  image: string | null;
  status: 'published' | 'unpublished';
  author: {
    _id: string;
    fullName: string;
    email: string;
    profilePhoto: string | null;
  };
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleResponse {
  success: boolean;
  message?: string;
  data: {
    article?: Article;
    articles?: Article[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllArticles(status?: string): Observable<ArticleResponse> {
    const params: any = {};
    if (status) {
      params.status = status;
    }
    return this.http.get<ArticleResponse>(`${this.apiUrl}/articles`, { params });
  }

  getArticleById(id: string): Observable<ArticleResponse> {
    return this.http.get<ArticleResponse>(`${this.apiUrl}/articles/${id}`);
  }

  createArticle(articleData: {
    title: string;
    body: string;
    status?: string;
    image?: File;
  }): Observable<ArticleResponse> {
    const formData = new FormData();
    formData.append('title', articleData.title);
    formData.append('body', articleData.body);
    if (articleData.status) {
      formData.append('status', articleData.status);
    }
    if (articleData.image) {
      formData.append('image', articleData.image);
    }

    return this.http.post<ArticleResponse>(`${this.apiUrl}/articles`, formData);
  }

  updateArticle(id: string, articleData: {
    title?: string;
    body?: string;
    status?: string;
    image?: File;
  }): Observable<ArticleResponse> {
    const formData = new FormData();
    if (articleData.title) {
      formData.append('title', articleData.title);
    }
    if (articleData.body) {
      formData.append('body', articleData.body);
    }
    if (articleData.status) {
      formData.append('status', articleData.status);
    }
    if (articleData.image) {
      formData.append('image', articleData.image);
    }

    return this.http.put<ArticleResponse>(`${this.apiUrl}/articles/${id}`, formData);
  }

  deleteArticle(id: string): Observable<ArticleResponse> {
    return this.http.delete<ArticleResponse>(`${this.apiUrl}/articles/${id}`);
  }

  publishArticle(id: string): Observable<ArticleResponse> {
    return this.http.patch<ArticleResponse>(`${this.apiUrl}/articles/${id}/publish`, {});
  }

  unpublishArticle(id: string): Observable<ArticleResponse> {
    return this.http.patch<ArticleResponse>(`${this.apiUrl}/articles/${id}/unpublish`, {});
  }
}

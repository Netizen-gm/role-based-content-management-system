import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profilePhoto: string | null;
  permissions?: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  register(userData: {
    fullName: string;
    email: string;
    password: string;
    role?: string;
    profilePhoto?: File;
  }): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('fullName', userData.fullName);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    if (userData.role) {
      formData.append('role', userData.role);
    }
    if (userData.profilePhoto) {
      formData.append('profilePhoto', userData.profilePhoto);
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, formData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setTokens(response.data.accessToken, response.data.refreshToken);
            this.setUser(response.data.user);
          }
        })
      );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.success) {
            this.setTokens(response.data.accessToken, response.data.refreshToken);
            this.setUser(response.data.user);
          }
        })
      );
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/auth/logout`, { refreshToken }).subscribe();
    }
    
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  getProfile(): Observable<{ success: boolean; data: { user: User } }> {
    return this.http.get<{ success: boolean; data: { user: User } }>(`${this.apiUrl}/auth/profile`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setUser(response.data.user);
          }
        })
      );
  }

  refreshToken(): Observable<{ success: boolean; data: { accessToken: string; refreshToken: string } }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
      `${this.apiUrl}/auth/refresh`,
      { refreshToken }
    ).pipe(
      tap(response => {
        if (response.success) {
          this.setTokens(response.data.accessToken, response.data.refreshToken);
        }
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.permissions?.includes(permission) ?? false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.role.toUpperCase() === role.toUpperCase();
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private setUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error loading user from storage', e);
      }
    }
  }

  private clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}

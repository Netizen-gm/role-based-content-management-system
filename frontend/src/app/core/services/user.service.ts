import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: {
    _id: string;
    name: string;
    description: string;
    permissions: string[];
  };
  requestedRole?: {
    _id: string;
    name: string;
    description: string;
  } | null;
  roleRequestStatus?: 'pending' | 'approved' | 'rejected' | null;
  profilePhoto: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  data: {
    users?: User[];
    user?: User;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllUsers(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/users`);
  }

  getUserById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/users/${id}`);
  }

  assignRole(userId: string, role: string): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/users/${userId}/assign-role`, { role });
  }

  updateUser(userId: string, userData: {
    fullName?: string;
    email?: string;
    isActive?: boolean;
    role?: string;
  }): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/users/${userId}`, userData);
  }

  deleteUser(userId: string): Observable<UserResponse> {
    return this.http.delete<UserResponse>(`${this.apiUrl}/users/${userId}`);
  }

  getPendingRoleRequests(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/users/pending-requests`);
  }

  approveRoleRequest(userId: string): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/users/${userId}/approve-role`, {});
  }

  rejectRoleRequest(userId: string): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/users/${userId}/reject-role`, {});
  }
}

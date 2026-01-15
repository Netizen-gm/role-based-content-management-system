import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleResponse {
  success: boolean;
  message?: string;
  data: {
    roles?: Role[];
    role?: Role;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllRoles(): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`${this.apiUrl}/roles`);
  }

  getRoleById(id: string): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`${this.apiUrl}/roles/${id}`);
  }

  createRole(roleData: {
    name: string;
    description?: string;
    permissions: string[];
  }): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(`${this.apiUrl}/roles`, roleData);
  }

  updateRole(id: string, roleData: {
    name?: string;
    description?: string;
    permissions?: string[];
  }): Observable<RoleResponse> {
    return this.http.put<RoleResponse>(`${this.apiUrl}/roles/${id}`, roleData);
  }

  deleteRole(id: string): Observable<RoleResponse> {
    return this.http.delete<RoleResponse>(`${this.apiUrl}/roles/${id}`);
  }
}

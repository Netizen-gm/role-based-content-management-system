import { Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { ArticleListComponent } from './articles/components/article-list/article-list.component';
import { ArticleCreateComponent } from './articles/components/article-create/article-create.component';
import { ArticleEditComponent } from './articles/components/article-edit/article-edit.component';
import { ArticleDetailComponent } from './articles/components/article-detail/article-detail.component';
import { RoleListComponent } from './roles/components/role-list/role-list.component';
import { RoleFormComponent } from './roles/components/role-form/role-form.component';
import { UserListComponent } from './users/components/user-list/user-list.component';
import { PendingRequestsComponent } from './users/components/pending-requests/pending-requests.component';
import { AdminDashboardComponent } from './admin/components/admin-dashboard/admin-dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/articles', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'articles',
    canActivate: [authGuard],
    children: [
      { path: '', component: ArticleListComponent },
      { path: 'create', component: ArticleCreateComponent, canActivate: [roleGuard], data: { permission: 'create' } },
      { path: ':id', component: ArticleDetailComponent },
      { path: ':id/edit', component: ArticleEditComponent, canActivate: [roleGuard], data: { permission: 'edit' } }
    ]
  },
  {
    path: 'roles',
    canActivate: [authGuard],
    children: [
      { path: '', component: RoleListComponent },
      { path: 'create', component: RoleFormComponent, canActivate: [roleGuard], data: { role: 'SUPERADMIN' } },
      { path: ':id/edit', component: RoleFormComponent, canActivate: [roleGuard], data: { role: 'SUPERADMIN' } }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'SUPERADMIN' },
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'dashboard', component: AdminDashboardComponent }
    ]
  },
  {
    path: 'users',
    canActivate: [authGuard, roleGuard],
    data: { role: 'SUPERADMIN' },
    children: [
      { path: '', component: UserListComponent },
      { path: 'pending-requests', component: PendingRequestsComponent }
    ]
  },
  { path: '**', redirectTo: '/articles' }
];

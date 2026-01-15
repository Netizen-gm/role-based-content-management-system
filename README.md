# Dynamic Role-Based Content Management System (CMS)

A comprehensive MEAN stack application featuring dynamic role-based access control, user authentication, and content management capabilities.

## Table of Contents

- [Installation/Setup Instructions](#installationsetup-instructions)
- [API Endpoints Overview](#api-endpoints-overview)
- [Pre-created Test Users](#pre-created-test-users)

---

## Installation/Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB Atlas** account (free tier available)
- **Angular CLI** (will be installed with dependencies)

### Backend Setup

1. **Navigate to Backend directory**:
   ```bash
   cd Backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy `env.example` to `.env`:
     ```bash
     cp env.example .env
     ```
   - Edit `.env` and update the following:
     ```env
     NODE_ENV=development
     PORT=8080
     
     # MongoDB Atlas Connection String
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
     
     # JWT Secrets (generate strong secrets, at least 32 characters)
     JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this
     JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this
     JWT_ACCESS_EXPIRY=15m
     JWT_REFRESH_EXPIRY=7d
     
     # CORS Origin (for local development)
     CORS_ORIGIN=http://localhost:4200
     ```

4. **Create uploads directory**:
   ```bash
   mkdir uploads
   ```

5. **Seed default roles**:
   ```bash
   npm run seed
   ```
   This creates four default roles: SUPERADMIN, MANAGER, CONTRIBUTOR, and VIEWER.

6. **Seed test users** (optional):
   ```bash
   npm run seed:users
   ```
   This creates pre-configured test users for each role (see [Pre-created Test Users](#pre-created-test-users)).

7. **Start the backend server**:
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```
   The server will run on `http://localhost:8080` (or the PORT specified in `.env`).

### Frontend Setup

1. **Navigate to Frontend directory**:
   ```bash
   cd Frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   - Edit `src/environments/environment.ts`:
     ```typescript
     export const environment = {
       production: false,
       apiUrl: 'http://localhost:8080/api'
     };
     ```

4. **Start the development server**:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200`.

### MongoDB Atlas Setup

1. **Create a MongoDB Atlas account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a new cluster** (free tier M0)

3. **Create a database user**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these!)

4. **Whitelist IP addresses**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development, add `0.0.0.0/0` (allows all IPs)
   - For production, use specific IPs

5. **Get connection string**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `role-based-cms`)

---

## API Endpoints Overview

Base URL: `http://localhost:8080/api`

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Request Body |
|--------|----------|-------------|---------------|--------------|
| POST | `/register` | Register new user | No | `fullName`, `email`, `password`, `role?` (optional), `profilePhoto?` (file) |
| POST | `/login` | Login user | No | `email`, `password` |
| POST | `/refresh` | Refresh access token | Refresh Token | `refreshToken` |
| POST | `/logout` | Logout user | Yes | - |
| GET | `/profile` | Get current user profile | Yes | - |

**Note**: Registration always assigns VIEWER role by default. Role requests require SuperAdmin approval.

### Role Endpoints (`/api/roles`)

| Method | Endpoint | Description | Auth Required | Permission Required |
|--------|----------|-------------|---------------|---------------------|
| GET | `/` | Get all roles | Yes | - |
| GET | `/:id` | Get role by ID | Yes | - |
| POST | `/` | Create new role | Yes | SuperAdmin |
| PUT | `/:id` | Update role | Yes | SuperAdmin |
| DELETE | `/:id` | Delete role | Yes | SuperAdmin |

**Request Body (Create/Update Role)**:
```json
{
  "name": "ROLE_NAME",
  "description": "Role description",
  "permissions": ["create", "edit", "delete", "publish", "view"]
}
```

### User Management Endpoints (`/api/users`) - SuperAdmin Only

| Method | Endpoint | Description | Auth Required | Permission Required |
|--------|----------|-------------|---------------|---------------------|
| GET | `/` | Get all users | Yes | SuperAdmin |
| GET | `/pending-requests` | Get pending role requests | Yes | SuperAdmin |
| GET | `/:id` | Get user by ID | Yes | SuperAdmin |
| PATCH | `/:id/assign-role` | Assign role to user | Yes | SuperAdmin |
| PATCH | `/:id/approve-role` | Approve role request | Yes | SuperAdmin |
| PATCH | `/:id/reject-role` | Reject role request | Yes | SuperAdmin |
| PUT | `/:id` | Update user | Yes | SuperAdmin |
| DELETE | `/:id` | Delete user | Yes | SuperAdmin |

**Request Body (Assign Role)**:
```json
{
  "role": "ROLE_NAME"
}
```

**Request Body (Update User)**:
```json
{
  "fullName": "Updated Name",
  "email": "updated@example.com",
  "isActive": true
}
```

### Article Endpoints (`/api/articles`)

| Method | Endpoint | Description | Auth Required | Access Required |
|--------|----------|-------------|---------------|-----------------|
| GET | `/` | Get all articles | Yes | SuperAdmin, Manager, or view permission |
| GET | `/:id` | Get article by ID | Yes | SuperAdmin, Manager, or view permission |
| POST | `/` | Create new article | Yes | SuperAdmin, Manager, or create permission |
| PUT | `/:id` | Update article | Yes | SuperAdmin, Manager, or edit permission |
| DELETE | `/:id` | Delete article | Yes | SuperAdmin, Manager, or delete permission |
| PATCH | `/:id/publish` | Publish article | Yes | SuperAdmin, Manager, or publish permission |
| PATCH | `/:id/unpublish` | Unpublish article | Yes | SuperAdmin, Manager, or publish permission |

**Note**: Viewers can only see published articles.

**Request Body (Create/Update Article)**:
```json
{
  "title": "Article Title",
  "body": "Article content...",
  "status": "unpublished",
  "image": "<file>" // Optional, multipart/form-data
}
```

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health check | No |

---

## Pre-created Test Users

After running `npm run seed:users` in the Backend directory, the following test users are created:

### SuperAdmin
- **Email**: `superadmin@test.com`
- **Password**: `password123`
- **Role**: SUPERADMIN
- **Permissions**: create, edit, delete, publish, view
- **Access**: Full system access, can manage users, roles, and all articles

### Manager
- **Email**: `manager@test.com`
- **Password**: `password123`
- **Role**: MANAGER
- **Permissions**: create, edit, delete, publish, view
- **Access**: Can manage articles (CRUD), publish/unpublish articles

### Contributor
- **Email**: `contributor@test.com`
- **Password**: `password123`
- **Role**: CONTRIBUTOR
- **Permissions**: create, edit, view
- **Access**: Can create and edit articles (own and others), cannot delete or publish

### Viewer
- **Email**: `viewer@test.com`
- **Password**: `password123`
- **Role**: VIEWER
- **Permissions**: view
- **Access**: Read-only access to published articles only

---

## Default Roles and Permissions

| Role | Create | Edit | Delete | Publish | View |
|------|--------|------|--------|---------|------|
| **SUPERADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MANAGER** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **CONTRIBUTOR** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **VIEWER** | ❌ | ❌ | ❌ | ❌ | ✅ |

**Note**: These roles are created automatically when you run `npm run seed` in the Backend directory.

---

## Project Structure

```
Role Based CMS/
├── Backend/
│   ├── src/
│   │   ├── config/          # Database and JWT configuration
│   │   ├── models/          # Mongoose models (User, Role, Article)
│   │   ├── middleware/      # Auth and permission middleware
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   └── scripts/        # Seeding scripts
│   ├── uploads/            # Uploaded files directory
│   ├── server.js           # Main server file
│   ├── package.json
│   └── render.yaml         # Render deployment config
│
└── Frontend/
    ├── src/
    │   ├── app/
    │   │   ├── admin/      # SuperAdmin dashboard
    │   │   ├── articles/    # Article components
    │   │   ├── auth/       # Authentication components
    │   │   ├── core/       # Services, guards, interceptors
    │   │   ├── roles/      # Role management
    │   │   ├── shared/     # Shared components
    │   │   └── users/      # User management
    │   └── environments/   # Environment configuration
    ├── package.json
    └── vercel.json         # Vercel deployment config
```

---

## Features

- 🔐 **JWT Authentication** - Secure login/logout with access and refresh tokens
- 👥 **Dynamic Role Management** - Roles stored in MongoDB, not hardcoded
- 🔑 **Permission-Based Access Control** - Fine-grained permissions (create, edit, delete, publish, view)
- 📝 **Article Management** - Full CRUD operations with image upload support
- 🛡️ **Token Blacklisting** - Secure token revocation on logout
- 📸 **Image Upload** - Profile photos and article images
- 🎨 **Role-Based UI** - Different navigation and content based on user role
- ✅ **Role Request System** - Users can request roles during registration (requires SuperAdmin approval)

---

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **express-validator** - Input validation

### Frontend
- **Angular 17** - Frontend framework
- **RxJS** - Reactive programming
- **TypeScript** - Type-safe development
- **CSS** - Styling

---

## Quick Start Commands

### Backend
```bash
cd Backend
npm install
npm run seed          # Seed default roles
npm run seed:users    # Seed test users (optional)
npm run dev           # Start development server
```

### Frontend
```bash
cd Frontend
npm install
npm start             # Start development server
```

---

## License

ISC
#   - r o l e - b a s e d - C o n t e n t - M a n a g e m e n t - S y s t e m  
 
# Dynamic Role-Based Content Management System (CMS)

A comprehensive MEAN stack application featuring dynamic role-based access control, user authentication, and content management capabilities.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Installation & Setup](#installation--setup)
- [Test Users](#test-users)
- [API Endpoints](#api-endpoints)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)

---

## Quick Start

### Backend Setup

```bash
cd Backend
npm install
cp env.example .env        # Configure your .env file
npm run seed               # Seed default roles
npm run seed:users         # Seed test users (optional)
npm run dev                # Start server (port 8080)
```

### Frontend Setup

```bash
cd Frontend
npm install
npm start                  # Start development server (port 4200)
```

**Default Test User:**
- Email: `superadmin@test.com`
- Password: `password123`

---

## Installation & Setup

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB Atlas** account ([Sign up free](https://www.mongodb.com/cloud/atlas))

### Backend Setup

#### 1. Navigate to Backend Directory
```bash
cd Backend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment Variables

Copy the example file and create your `.env`:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=8080

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT Secrets (use strong secrets, at least 32 characters)
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS Origin (for local development)
CORS_ORIGIN=http://localhost:4200
```

#### 4. Create Uploads Directory
```bash
mkdir uploads
```

#### 5. Seed Default Roles
```bash
npm run seed
```
This creates four default roles: **SUPERADMIN**, **MANAGER**, **CONTRIBUTOR**, and **VIEWER**.

#### 6. Seed Test Users (Optional)
```bash
npm run seed:users
```
Creates pre-configured test users for each role (see [Test Users](#-test-users) below).

#### 7. Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:8080`

### Frontend Setup

#### 1. Navigate to Frontend Directory
```bash
cd Frontend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment

Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

#### 4. Start Development Server
```bash
npm start
```

Application will be available at `http://localhost:4200`

### MongoDB Atlas Setup

1. **Create Account**: Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create Cluster**: Choose free tier (M0)

3. **Create Database User**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these!)

4. **Whitelist IP Addresses**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: add `0.0.0.0/0` (allows all IPs)
   - For production: use specific IPs

5. **Get Connection String**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `role-based-cms`)

---

## Test Users

After running `npm run seed:users` in the Backend directory, these test users are available:

| Role | Email | Password | Permissions | Access |
|------|-------|----------|-------------|--------|
| **SUPERADMIN** | `superadmin@test.com` | `password123` | All | Full system access, manage users, roles, and articles |
| **MANAGER** | `manager@test.com` | `password123` | All | Manage articles (CRUD), publish/unpublish |
| **CONTRIBUTOR** | `contributor@test.com` | `password123` | Create, Edit, View | Create and edit articles, cannot delete or publish |
| **VIEWER** | `viewer@test.com` | `password123` | View only | Read-only access to published articles |

### Default Roles & Permissions

| Role | Create | Edit | Delete | Publish | View |
|------|:------:|:----:|:------:|:-------:|:----:|
| **SUPERADMIN** | Yes | Yes | Yes | Yes | Yes |
| **MANAGER** | Yes | Yes | Yes | Yes | Yes |
| **CONTRIBUTOR** | Yes | Yes | No | No | Yes |
| **VIEWER** | No | No | No | No | Yes |

> **Note**: These roles are created automatically when you run `npm run seed` in the Backend directory.

---

## API Endpoints

**Base URL:** `http://localhost:8080/api`

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/register` | Register new user (defaults to VIEWER role) | No |
| `POST` | `/login` | Login user | No |
| `POST` | `/refresh` | Refresh access token | Refresh Token |
| `POST` | `/logout` | Logout user | Yes |
| `GET` | `/profile` | Get current user profile | Yes |

**Register Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "MANAGER"  // Optional - defaults to VIEWER
}
```

> **Note**: Registration assigns VIEWER role by default. Role requests require SuperAdmin approval.

### Roles (`/api/roles`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/` | Get all roles | Yes |
| `GET` | `/:id` | Get role by ID | Yes |
| `POST` | `/` | Create new role | SuperAdmin |
| `PUT` | `/:id` | Update role | SuperAdmin |
| `DELETE` | `/:id` | Delete role | SuperAdmin |

**Create/Update Role Request Body:**
```json
{
  "name": "ROLE_NAME",
  "description": "Role description",
  "permissions": ["create", "edit", "delete", "publish", "view"]
}
```

### User Management (`/api/users`) - SuperAdmin Only

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/` | Get all users | SuperAdmin |
| `GET` | `/pending-requests` | Get pending role requests | SuperAdmin |
| `GET` | `/:id` | Get user by ID | SuperAdmin |
| `PATCH` | `/:id/assign-role` | Assign role to user | SuperAdmin |
| `PATCH` | `/:id/approve-role` | Approve role request | SuperAdmin |
| `PATCH` | `/:id/reject-role` | Reject role request | SuperAdmin |
| `PUT` | `/:id` | Update user | SuperAdmin |
| `DELETE` | `/:id` | Delete user | SuperAdmin |

### Articles (`/api/articles`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/` | Get all articles | Yes |
| `GET` | `/:id` | Get article by ID | Yes |
| `POST` | `/` | Create new article | Yes (Create permission) |
| `PUT` | `/:id` | Update article | Yes (Edit permission) |
| `DELETE` | `/:id` | Delete article | Yes (Delete permission) |
| `PATCH` | `/:id/publish` | Publish article | Yes (Publish permission) |
| `PATCH` | `/:id/unpublish` | Unpublish article | Yes (Publish permission) |

**Create/Update Article Request Body:**
```json
{
  "title": "Article Title",
  "body": "Article content...",
  "status": "unpublished",
  "image": "<file>"  // Optional, multipart/form-data
}
```

> **Note**: Viewers can only see published articles. SuperAdmin and Manager can see all articles.

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |

For detailed API documentation, see [Backend README](Backend/README.md).

---

## Features

- **JWT Authentication** - Secure login/logout with access and refresh tokens
- **Dynamic Role Management** - Roles stored in MongoDB, not hardcoded
- **Permission-Based Access Control** - Fine-grained permissions (create, edit, delete, publish, view)
- **Article Management** - Full CRUD operations with image upload support
- **Token Blacklisting** - Secure token revocation on logout
- **Image Upload** - Profile photos and article images
- **Role-Based UI** - Different navigation and content based on user role
- **Role Request System** - Users can request roles during registration (requires SuperAdmin approval)

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
│   │   └── scripts/         # Seeding scripts
│   ├── uploads/             # Uploaded files directory
│   ├── server.js            # Main server file
│   ├── package.json
│   └── render.yaml          # Render deployment config
│
└── Frontend/
    ├── src/
    │   ├── app/
    │   │   ├── admin/       # SuperAdmin dashboard
    │   │   ├── articles/    # Article components
    │   │   ├── auth/        # Authentication components
    │   │   ├── core/        # Services, guards, interceptors
    │   │   ├── roles/       # Role management
    │   │   ├── shared/      # Shared components
    │   │   └── users/       # User management
    │   └── environments/    # Environment configuration
    ├── package.json
    └── vercel.json          # Vercel deployment config
```

---

## License

ISC

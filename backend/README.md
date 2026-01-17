# Backend API - Role-Based CMS

Node.js backend API for a dynamic role-based content management system with JWT authentication, permission-based access control, and article management.

---

## Quick Start

```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp env.example .env

# Seed default roles
npm run seed

# Start development server
npm run dev
```

Server runs on `http://localhost:8080` (or PORT from `.env`)

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB Atlas** account ([Sign up free](https://www.mongodb.com/cloud/atlas))

---

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=8080

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT Configuration (use strong secrets, at least 32 characters)
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS Origin
CORS_ORIGIN=http://localhost:4200
```

### 2. MongoDB Atlas Setup

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier M0)
3. Create database user (Database Access → Add New Database User)
4. Whitelist IP: Network Access → Add IP Address → `0.0.0.0/0` (for development)
5. Get connection string: Database → Connect → Connect your application
6. Update `MONGODB_URI` in `.env` with your connection string

### 3. Seed Default Roles

```bash
npm run seed
```

This creates four default roles:
- **SUPERADMIN** - Full access (all permissions)
- **MANAGER** - Manage content and publish (all permissions)
- **CONTRIBUTOR** - Create and edit articles (create, edit, view)
- **VIEWER** - Read-only access (view only)

### 4. Create Uploads Directory

```bash
mkdir uploads
```

### 5. Start Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

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

**Register Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Roles (`/api/roles`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/` | Get all roles | Yes |
| `GET` | `/:id` | Get role by ID | Yes |
| `POST` | `/` | Create new role | SuperAdmin |
| `PUT` | `/:id` | Update role | SuperAdmin |
| `DELETE` | `/:id` | Delete role | SuperAdmin |

**Create Role Request:**
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

**Note:** Viewers can only see published articles. SuperAdmin and Manager can see all articles.

**Create Article Request (multipart/form-data):**
```json
{
  "title": "Article Title",
  "body": "Article content...",
  "status": "unpublished",
  "image": "<file>"  // Optional
}
```

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |

---

## Test Users

After running `npm run seed:users`, use these test accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **SUPERADMIN** | `superadmin@test.com` | `password123` | All permissions |
| **MANAGER** | `manager@test.com` | `password123` | All permissions |
| **CONTRIBUTOR** | `contributor@test.com` | `password123` | Create, Edit, View |
| **VIEWER** | `viewer@test.com` | `password123` | View only |

### Default Permissions Matrix

| Role | Create | Edit | Delete | Publish | View |
|------|:------:|:----:|:------:|:-------:|:----:|
| **SUPERADMIN** | Yes | Yes | Yes | Yes | Yes |
| **MANAGER** | Yes | Yes | Yes | Yes | Yes |
| **CONTRIBUTOR** | Yes | Yes | No | No | Yes |
| **VIEWER** | No | No | No | No | Yes |

---

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **express-validator** - Input validation

---

## Project Structure

```
Backend/
├── src/
│   ├── config/          # Database and JWT configuration
│   ├── models/          # Mongoose models (User, Role, Article)
│   ├── middleware/      # Auth and permission middleware
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   └── scripts/         # Seeding scripts
├── uploads/             # Uploaded files directory
├── server.js            # Main server file
├── package.json
├── env.example          # Environment variables template
└── render.yaml          # Render deployment config
```

---

## Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Tokens** - Access tokens (15min) and refresh tokens (7 days)
- **Token Rotation** - New tokens generated on refresh
- **Token Blacklisting** - Revoked tokens stored in database
- **Permission Middleware** - Route-level permission checking
- **Input Validation** - Express-validator for request validation
- **File Upload Limits** - 5MB for profile photos, 10MB for article images

---

## File Uploads

- Files stored in `uploads/` directory
- Served statically at `/uploads/<filename>`
- Supported formats: JPEG, JPG, PNG, GIF, WEBP
- Profile photo limit: 5MB
- Article image limit: 10MB

---

## Deployment on Render

### 1. Create Render Account
Sign up at [render.com](https://render.com)

### 2. Create Web Service
- Connect your GitHub repository
- Environment: Node
- Build Command: `npm install`
- Start Command: `npm start`

### 3. Set Environment Variables
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_ACCESS_SECRET` - Strong random secret
- `JWT_REFRESH_SECRET` - Strong random secret
- `NODE_ENV` - `production`
- `PORT` - Automatically set by Render
- `CORS_ORIGIN` - Your frontend URL

### 4. Deploy
Render will automatically deploy your service

### 5. Seed Roles
After deployment, SSH into the service and run:
```bash
npm run seed
```

---

## API Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

---

## License

ISC

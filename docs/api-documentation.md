# Backend API Documentation

Complete REST API for multi-tenant SaaS application with 19 endpoints across 5 modules.

## API Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require JWT token in `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens expire in 24 hours.

---

## Module 1: Authentication (4 Endpoints)

### 1. Register Tenant
- **Endpoint**: `POST /auth/register-tenant`
- **Auth**: None (Public)
- **Request Body**:
  ```json
  {
    "tenantName": "My Company",
    "subdomain": "mycompany",
    "adminEmail": "admin@mycompany.com",
    "adminPassword": "SecurePass@123",
    "adminFullName": "John Doe"
  }
  ```
- **Response** (201):
  ```json
  {
    "status": "success",
    "data": {
      "tenantId": "uuid",
      "tenant": {
        "id": "uuid",
        "name": "My Company",
        "subdomain": "mycompany",
        "subscriptionPlan": "free",
        "maxUsers": 10,
        "maxProjects": 5
      },
      "user": {
        "id": "uuid",
        "email": "admin@mycompany.com",
        "fullName": "John Doe",
        "role": "tenant_admin"
      },
      "token": "jwt_token"
    }
  }
  ```
- **Validation**: 
  - Subdomain must be unique
  - Email must be unique
  - Password must be 8+ chars with uppercase, lowercase, and number

### 2. Login
- **Endpoint**: `POST /auth/login`
- **Auth**: None (Public)
- **Request Body**:
  ```json
  {
    "email": "admin@mycompany.com",
    "password": "SecurePass@123"
  }
  ```
- **Response** (200):
  ```json
  {
    "status": "success",
    "data": {
      "token": "jwt_token",
      "user": {
        "id": "uuid",
        "email": "admin@mycompany.com",
        "fullName": "John Doe",
        "role": "tenant_admin",
        "tenantId": "uuid"
      }
    }
  }
  ```

### 3. Get Current User
- **Endpoint**: `GET /auth/me`
- **Auth**: Required (any authenticated user)
- **Response** (200):
  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid",
      "email": "admin@mycompany.com",
      "fullName": "John Doe",
      "role": "tenant_admin",
      "tenantId": "uuid",
      "isActive": true
    }
  }
  ```

### 4. Logout
- **Endpoint**: `POST /auth/logout`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "status": "success",
    "data": { "success": true }
  }
  ```

---

## Module 2: Tenant Management (3 Endpoints)

### 5. Get Tenant Details
- **Endpoint**: `GET /tenants/:tenantId`
- **Auth**: Required (authenticated user)
- **Response** (200):
  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid",
      "name": "My Company",
      "subdomain": "mycompany",
      "status": "active",
      "subscriptionPlan": "pro",
      "maxUsers": 50,
      "maxProjects": 20,
      "stats": {
        "totalUsers": 5,
        "totalProjects": 3,
        "totalTasks": 12
      }
    }
  }
  ```

### 6. Update Tenant
- **Endpoint**: `PUT /tenants/:tenantId`
- **Auth**: Required (tenant_admin or super_admin)
- **Request Body** (all optional):
  ```json
  {
    "name": "Updated Company Name",
    "subdomain": "updated-subdomain",
    "status": "suspended",
    "subscriptionPlan": "enterprise",
    "maxUsers": 100,
    "maxProjects": 50
  }
  ```
- **Response** (200): Updated tenant object

### 7. List All Tenants
- **Endpoint**: `GET /tenants?page=1&limit=50&status=active&subscriptionPlan=pro`
- **Auth**: Required (super_admin only)
- **Query Params**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50)
  - `status`: Filter by status (active, suspended, trial)
  - `subscriptionPlan`: Filter by plan (free, pro, enterprise)
- **Response** (200):
  ```json
  {
    "status": "success",
    "data": {
      "tenants": [...],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "limit": 50
      },
      "total": 5
    }
  }
  ```

---

## Module 3: User Management (4 Endpoints)

### 8. Add User
- **Endpoint**: `POST /tenants/:tenantId/users`
- **Auth**: Required (tenant_admin)
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "fullName": "Jane Smith",
    "password": "SecurePass@123",
    "role": "user"
  }
  ```
- **Response** (201): Created user object
- **Validation**: Email must be unique within tenant, password must meet strength requirements

### 9. List Users
- **Endpoint**: `GET /tenants/:tenantId/users?page=1&limit=50&role=user&isActive=true&search=Jane`
- **Auth**: Required (tenant member)
- **Query Params**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50)
  - `role`: Filter by role (super_admin, tenant_admin, user)
  - `isActive`: Filter by active status
  - `search`: Search by name/email
- **Response** (200): Paginated users list

### 10. Update User
- **Endpoint**: `PUT /tenants/:tenantId/users/:userId`
- **Auth**: Required (tenant_admin)
- **Request Body** (all optional):
  ```json
  {
    "fullName": "Jane Smith Updated",
    "role": "user",
    "isActive": false,
    "password": "NewSecurePass@123"
  }
  ```
- **Response** (200): Updated user object

### 11. Delete User
- **Endpoint**: `DELETE /tenants/:tenantId/users/:userId`
- **Auth**: Required (tenant_admin)
- **Response** (200):
  ```json
  {
    "status": "success",
    "data": { "success": true }
  }
  ```
- **Validation**: Cannot delete last tenant admin

---

## Module 4: Project Management (4 Endpoints)

### 12. Create Project
- **Endpoint**: `POST /tenants/:tenantId/projects`
- **Auth**: Required (tenant member)
- **Request Body**:
  ```json
  {
    "name": "Website Redesign",
    "description": "Complete redesign of company website"
  }
  ```
- **Response** (201): Created project object
- **Validation**: Tenant cannot exceed maxProjects limit

### 13. List Projects
- **Endpoint**: `GET /tenants/:tenantId/projects?page=1&limit=50&status=active&search=redesign`
- **Auth**: Required (tenant member)
- **Query Params**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50)
  - `status`: Filter by status (active, archived, completed)
  - `search`: Search by name
- **Response** (200): Paginated projects with task counts

### 14. Update Project
- **Endpoint**: `PUT /tenants/:tenantId/projects/:projectId`
- **Auth**: Required (tenant member)
- **Request Body** (all optional):
  ```json
  {
    "name": "Updated Project Name",
    "description": "Updated description",
    "status": "archived"
  }
  ```
- **Response** (200): Updated project object

### 15. Delete Project
- **Endpoint**: `DELETE /tenants/:tenantId/projects/:projectId`
- **Auth**: Required (tenant member)
- **Response** (200): Success message
- **Cascading**: Deletes all associated tasks

---

## Module 5: Task Management (4 Endpoints)

### 16. Create Task
- **Endpoint**: `POST /tenants/:tenantId/projects/:projectId/tasks`
- **Auth**: Required (tenant member)
- **Request Body**:
  ```json
  {
    "projectId": "uuid",
    "title": "Design homepage",
    "description": "Create mockups and wireframes",
    "priority": "high",
    "dueDate": "2024-12-31",
    "assignedTo": "user-uuid"
  }
  ```
- **Response** (201): Created task object
- **Priority**: low, medium, high

### 17. List Tasks
- **Endpoint**: `GET /tenants/:tenantId/projects/:projectId/tasks?page=1&limit=50&status=todo&priority=high&search=design`
- **Auth**: Required (tenant member)
- **Query Params**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50)
  - `status`: Filter by status (todo, in_progress, completed)
  - `priority`: Filter by priority (low, medium, high)
  - `assignedTo`: Filter by assignee UUID
  - `search`: Search by title
- **Response** (200): Paginated tasks with assignee details

### 18. Update Task Status
- **Endpoint**: `PATCH /tenants/:tenantId/tasks/:taskId/status`
- **Auth**: Required (tenant member)
- **Request Body**:
  ```json
  {
    "status": "in_progress"
  }
  ```
- **Response** (200): Updated task with new status

### 19. Update Task
- **Endpoint**: `PUT /tenants/:tenantId/tasks/:taskId`
- **Auth**: Required (tenant member)
- **Request Body** (all optional):
  ```json
  {
    "title": "Updated title",
    "description": "Updated description",
    "status": "completed",
    "priority": "medium",
    "dueDate": "2024-12-31",
    "assignedTo": "user-uuid"
  }
  ```
- **Response** (200): Updated task object

---

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "status": "error",
  "message": "Tenant user limit exceeded"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "An unexpected error occurred"
}
```

---

## Authentication & Authorization

### User Roles
1. **super_admin**: Full system access, can manage all tenants
2. **tenant_admin**: Can manage tenant settings and users
3. **user**: Can view/edit projects and tasks within tenant

### Tenant Isolation
All data is automatically scoped to tenant. Users can only access:
- Their own tenant's data
- Resources they have permission for
- All queries enforced with `tenantId` filtering

### Subscription Limits
- **Free Plan**: max 10 users, 5 projects
- **Pro Plan**: max 50 users, 20 projects
- **Enterprise**: Unlimited

---

## Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run db:seed
```

Server runs on `http://localhost:5000` by default. Set `PORT` environment variable to change.

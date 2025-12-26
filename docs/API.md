# Partnr SaaS API Documentation

Complete REST API reference for the Partnr SaaS platform.

**Base URL**: `http://localhost:5000/api`

**Version**: 1.0.0

## Table of Contents

1. [Authentication](#authentication)
2. [Error Handling](#error-handling)
3. [API Endpoints](#api-endpoints)
   - [Health Check](#health-check)
   - [Authentication Endpoints](#authentication-endpoints)
   - [Tenant Endpoints](#tenant-endpoints)
   - [User Endpoints](#user-endpoints)
   - [Project Endpoints](#project-endpoints)
   - [Task Endpoints](#task-endpoints)

---

## Authentication

All endpoints except `/auth/register`, `/auth/login`, and `/health` require a valid JWT token in the `Authorization` header.

```
Authorization: Bearer <your_jwt_token>
```

### JWT Token Structure

**Payload**:
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "SUPER_ADMIN|TENANT_ADMIN|USER",
  "tenantId": "uuid|null",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Token Expiration**: 24 hours

---

## Error Handling

### Error Response Format

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "status": 400
}
```

### Common Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `204 No Content` - Successful request with no content
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## API Endpoints

### Health Check

#### GET /health

Check system health and database connectivity.

**Authentication**: Not required

**Response**:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-12-26T23:00:00.000Z"
}
```

**Example**:
```bash
curl http://localhost:5000/api/health
```

---

### Authentication Endpoints

#### POST /auth/register

Register a new user account.

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "tenantName": "My Company",
  "tenantSlug": "my-company"
}
```

**Validation Rules**:
- Email: Valid email format required
- Password: Minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
- firstName: Non-empty string
- lastName: Non-empty string
- tenantName: Non-empty string
- tenantSlug: Unique, lowercase alphanumeric with hyphens

**Response** (201 Created):
```json
{
  "message": "Registration successful",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "TENANT_ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors**:
- `400 Bad Request` - Invalid email format or weak password
- `409 Conflict` - Email or tenant slug already exists

**Example**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "tenantName": "Example Inc",
    "tenantSlug": "example-inc"
  }'
```

---

#### POST /auth/login

Authenticate user and receive JWT token.

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response** (200 OK):
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "TENANT_ADMIN",
    "tenantId": "tenant-uuid"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors**:
- `401 Unauthorized` - Invalid email or password
- `400 Bad Request` - Missing required fields

**Example**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

---

#### POST /auth/logout

Logout current user (client-side implementation recommended).

**Authentication**: Required

**Response** (200 OK):
```json
{
  "message": "Logout successful"
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

---

#### GET /auth/me

Get current authenticated user information.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "TENANT_ADMIN",
    "tenantId": "tenant-uuid",
    "createdAt": "2025-12-20T10:00:00.000Z"
  }
}
```

**Example**:
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

---

### Tenant Endpoints

#### GET /tenants

List all tenants (SUPER_ADMIN only).

**Authentication**: Required (SUPER_ADMIN role)

**Query Parameters**:
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "tenant-uuid",
      "name": "Example Inc",
      "slug": "example-inc",
      "description": "Example company",
      "subscriptionPlan": "professional",
      "maxUsers": 100,
      "maxProjects": 50,
      "createdAt": "2025-12-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5
  }
}
```

**Example**:
```bash
curl "http://localhost:5000/api/tenants?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

---

#### GET /tenants/:id

Get tenant details.

**Authentication**: Required (SUPER_ADMIN or TENANT_ADMIN of the tenant)

**Response** (200 OK):
```json
{
  "id": "tenant-uuid",
  "name": "Example Inc",
  "slug": "example-inc",
  "description": "Example company",
  "subscriptionPlan": "professional",
  "maxUsers": 100,
  "maxProjects": 50,
  "userCount": 5,
  "projectCount": 3,
  "createdAt": "2025-12-20T10:00:00.000Z",
  "updatedAt": "2025-12-25T15:30:00.000Z"
}
```

**Example**:
```bash
curl http://localhost:5000/api/tenants/tenant-uuid \
  -H "Authorization: Bearer <token>"
```

---

#### PATCH /tenants/:id

Update tenant information.

**Authentication**: Required (SUPER_ADMIN or TENANT_ADMIN of the tenant)

**Request Body** (all fields optional):
```json
{
  "name": "New Tenant Name",
  "description": "Updated description",
  "subscriptionPlan": "professional",
  "maxUsers": 150,
  "maxProjects": 75
}
```

**Response** (200 OK):
```json
{
  "message": "Tenant updated successfully",
  "tenant": {
    "id": "tenant-uuid",
    "name": "New Tenant Name",
    "slug": "example-inc",
    "description": "Updated description",
    "subscriptionPlan": "professional",
    "maxUsers": 150,
    "maxProjects": 75,
    "updatedAt": "2025-12-26T10:00:00.000Z"
  }
}
```

**Example**:
```bash
curl -X PATCH http://localhost:5000/api/tenants/tenant-uuid \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Company Name",
    "maxUsers": 150
  }'
```

---

#### DELETE /tenants/:id

Delete a tenant (SUPER_ADMIN only).

**Authentication**: Required (SUPER_ADMIN role)

**Response** (204 No Content)

**Example**:
```bash
curl -X DELETE http://localhost:5000/api/tenants/tenant-uuid \
  -H "Authorization: Bearer <token>"
```

---

### User Endpoints

#### GET /users

List users in current tenant.

**Authentication**: Required

**Query Parameters**:
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10)
- `role` (string): Filter by role (SUPER_ADMIN, TENANT_ADMIN, USER)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "TENANT_ADMIN",
      "tenantId": "tenant-uuid",
      "createdAt": "2025-12-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5
  }
}
```

**Example**:
```bash
curl "http://localhost:5000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

---

#### POST /users

Create a new user (TENANT_ADMIN only).

**Authentication**: Required (TENANT_ADMIN role)

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "USER"
}
```

**Response** (201 Created):
```json
{
  "message": "User created successfully",
  "user": {
    "id": "new-user-uuid",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "USER",
    "tenantId": "tenant-uuid",
    "createdAt": "2025-12-26T10:00:00.000Z"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "SecurePassword123",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "USER"
  }'
```

---

#### GET /users/:id

Get user details.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "TENANT_ADMIN",
  "tenantId": "tenant-uuid",
  "createdAt": "2025-12-20T10:00:00.000Z",
  "updatedAt": "2025-12-25T15:30:00.000Z"
}
```

**Example**:
```bash
curl http://localhost:5000/api/users/user-uuid \
  -H "Authorization: Bearer <token>"
```

---

#### PATCH /users/:id

Update user information (TENANT_ADMIN or self).

**Authentication**: Required

**Request Body** (all fields optional):
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "role": "USER"
}
```

**Response** (200 OK):
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "role": "USER",
    "updatedAt": "2025-12-26T10:00:00.000Z"
  }
}
```

**Example**:
```bash
curl -X PATCH http://localhost:5000/api/users/user-uuid \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Johnny",
    "lastName": "Smith"
  }'
```

---

#### DELETE /users/:id

Delete a user (TENANT_ADMIN only).

**Authentication**: Required (TENANT_ADMIN role)

**Response** (204 No Content)

**Example**:
```bash
curl -X DELETE http://localhost:5000/api/users/user-uuid \
  -H "Authorization: Bearer <token>"
```

---

### Project Endpoints

#### GET /projects

List projects in current tenant.

**Authentication**: Required

**Query Parameters**:
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10)
- `status` (string): Filter by status

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "project-uuid",
      "name": "Project Alpha",
      "description": "Main project",
      "status": "ACTIVE",
      "tenantId": "tenant-uuid",
      "taskCount": 5,
      "createdAt": "2025-12-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3
  }
}
```

**Example**:
```bash
curl "http://localhost:5000/api/projects?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

---

#### POST /projects

Create a new project (TENANT_ADMIN only).

**Authentication**: Required (TENANT_ADMIN role)

**Request Body**:
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "ACTIVE"
}
```

**Response** (201 Created):
```json
{
  "message": "Project created successfully",
  "project": {
    "id": "new-project-uuid",
    "name": "New Project",
    "description": "Project description",
    "status": "ACTIVE",
    "tenantId": "tenant-uuid",
    "createdAt": "2025-12-26T10:00:00.000Z"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign",
    "description": "Redesign company website",
    "status": "ACTIVE"
  }'
```

---

#### GET /projects/:id

Get project details.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "id": "project-uuid",
  "name": "Project Alpha",
  "description": "Main project",
  "status": "ACTIVE",
  "tenantId": "tenant-uuid",
  "taskCount": 5,
  "createdAt": "2025-12-20T10:00:00.000Z",
  "updatedAt": "2025-12-25T15:30:00.000Z"
}
```

**Example**:
```bash
curl http://localhost:5000/api/projects/project-uuid \
  -H "Authorization: Bearer <token>"
```

---

#### PATCH /projects/:id

Update project information (TENANT_ADMIN only).

**Authentication**: Required (TENANT_ADMIN role)

**Request Body** (all fields optional):
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "ON_HOLD"
}
```

**Response** (200 OK):
```json
{
  "message": "Project updated successfully",
  "project": {
    "id": "project-uuid",
    "name": "Updated Project Name",
    "description": "Updated description",
    "status": "ON_HOLD",
    "updatedAt": "2025-12-26T10:00:00.000Z"
  }
}
```

**Example**:
```bash
curl -X PATCH http://localhost:5000/api/projects/project-uuid \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign Phase 2",
    "status": "ON_HOLD"
  }'
```

---

#### DELETE /projects/:id

Delete a project (TENANT_ADMIN only).

**Authentication**: Required (TENANT_ADMIN role)

**Response** (204 No Content)

**Example**:
```bash
curl -X DELETE http://localhost:5000/api/projects/project-uuid \
  -H "Authorization: Bearer <token>"
```

---

### Task Endpoints

#### GET /tasks

List tasks in current tenant.

**Authentication**: Required

**Query Parameters**:
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10)
- `projectId` (string): Filter by project
- `status` (string): Filter by status
- `priority` (string): Filter by priority

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "task-uuid",
      "title": "Task Title",
      "description": "Task description",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "projectId": "project-uuid",
      "assignedToId": "user-uuid",
      "createdAt": "2025-12-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12
  }
}
```

**Example**:
```bash
curl "http://localhost:5000/api/tasks?status=IN_PROGRESS&priority=HIGH" \
  -H "Authorization: Bearer <token>"
```

---

#### POST /tasks

Create a new task.

**Authentication**: Required

**Request Body**:
```json
{
  "title": "Implement feature X",
  "description": "Detailed task description",
  "status": "TODO",
  "priority": "HIGH",
  "projectId": "project-uuid",
  "assignedToId": "user-uuid"
}
```

**Response** (201 Created):
```json
{
  "message": "Task created successfully",
  "task": {
    "id": "new-task-uuid",
    "title": "Implement feature X",
    "description": "Detailed task description",
    "status": "TODO",
    "priority": "HIGH",
    "projectId": "project-uuid",
    "assignedToId": "user-uuid",
    "createdAt": "2025-12-26T10:00:00.000Z"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design database schema",
    "description": "Create comprehensive database design",
    "status": "TODO",
    "priority": "HIGH",
    "projectId": "project-uuid",
    "assignedToId": "user-uuid"
  }'
```

---

#### GET /tasks/:id

Get task details.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "id": "task-uuid",
  "title": "Implement feature X",
  "description": "Detailed task description",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "projectId": "project-uuid",
  "assignedToId": "user-uuid",
  "assignedTo": {
    "id": "user-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  "createdAt": "2025-12-20T10:00:00.000Z",
  "updatedAt": "2025-12-25T15:30:00.000Z"
}
```

**Example**:
```bash
curl http://localhost:5000/api/tasks/task-uuid \
  -H "Authorization: Bearer <token>"
```

---

#### PATCH /tasks/:id

Update task information.

**Authentication**: Required

**Request Body** (all fields optional):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "COMPLETED",
  "priority": "MEDIUM",
  "assignedToId": "user-uuid"
}
```

**Response** (200 OK):
```json
{
  "message": "Task updated successfully",
  "task": {
    "id": "task-uuid",
    "title": "Updated title",
    "description": "Updated description",
    "status": "COMPLETED",
    "priority": "MEDIUM",
    "assignedToId": "user-uuid",
    "updatedAt": "2025-12-26T10:00:00.000Z"
  }
}
```

**Example**:
```bash
curl -X PATCH http://localhost:5000/api/tasks/task-uuid \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "priority": "LOW"
  }'
```

---

#### DELETE /tasks/:id

Delete a task.

**Authentication**: Required

**Response** (204 No Content)

**Example**:
```bash
curl -X DELETE http://localhost:5000/api/tasks/task-uuid \
  -H "Authorization: Bearer <token>"
```

---

## Rate Limiting

Currently no rate limiting is implemented. Production deployments should implement rate limiting (recommended: 100 requests per minute per IP).

## Pagination

All list endpoints support pagination with `page` and `limit` query parameters.

- Default page: 1
- Default limit: 10
- Maximum limit: 100

## Filtering & Sorting

Use query parameters to filter results:
```bash
GET /api/users?role=USER&page=2&limit=20
GET /api/tasks?status=COMPLETED&priority=HIGH
```

## Response Timestamps

All timestamps are in ISO 8601 format (UTC):
```
2025-12-26T10:00:00.000Z
```

---

**Last Updated**: December 26, 2025
**API Version**: 1.0.0

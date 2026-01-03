# Partnr SaaS Platform - AI Coding Agent Instructions

## Architecture Overview

Multi-tenant SaaS application with strict tenant data isolation using PostgreSQL + Prisma ORM. React frontend with Vite, Express backend with JWT auth. All tenant-scoped operations enforce `tenantId` filtering at the repository layer.

### Core Architectural Principles

1. **Tenant Isolation**: Every tenant-scoped table includes `tenantId`. All queries MUST filter by `tenantId` (except super_admin operations)
2. **Repository Pattern**: All database access goes through repositories (`backend/src/repositories/`) that extend `BaseRepository` with tenant-scoping built-in
3. **Three-tier Role System**: `super_admin` (cross-tenant), `tenant_admin` (tenant management), `user` (basic access)

## Critical Patterns & Conventions

### Backend Data Access Pattern

**ALWAYS** use repositories with tenant scoping:

```javascript
// CORRECT - Repository handles tenant scoping
const project = await projectRepository.findById(projectId, req.user.tenantId);

// WRONG - Direct Prisma queries bypass tenant scoping
const project = await prisma.project.findUnique({ where: { id: projectId } });
```

See [base.repository.js](backend/src/repositories/base.repository.js) for the tenant-scoping implementation that all repositories inherit.

### Authentication & Authorization Flow

1. JWT middleware ([auth.js](backend/src/middleware/auth.js)) verifies token → attaches `req.user` with `{ id, email, role, tenantId, tenant }`
2. RBAC middleware ([rbac.js](backend/src/middleware/rbac.js)) checks role permissions:
   - `requireRole(['tenant_admin', 'super_admin'])` for tenant management
   - `requireTenant` ensures user belongs to accessed tenant (auto-passes for super_admin)
3. Controllers use `req.user.tenantId` for all tenant-scoped operations

### Standard Response Format

All API responses use utilities from [response.js](backend/src/utils/response.js):

```javascript
// Success: sendSuccess(res, data, message, statusCode)
return sendSuccess(res, project, "Project created successfully", 201);

// Error: sendError(res, message, statusCode, errors)
return sendError(res, "Validation failed", 400, validationErrors);
```

### Frontend API Client Pattern

- Axios client ([client.js](frontend/src/api/client.js)) auto-injects JWT from localStorage
- AuthContext ([AuthContext.jsx](frontend/src/auth/AuthContext.jsx)) manages auth state globally
- All API calls go through `/api` base URL (proxied in Vite config)

## Database Schema Key Points

- **Users**: `tenantId` nullable only for super_admin; unique constraint on `(tenantId, email)`
- **Projects & Tasks**: Cascade delete on tenant removal; tasks include `tenantId` for efficient querying
- **Audit Logs**: Track all mutations with actor, tenant, action, entity type/id

See [schema.prisma](backend/prisma/schema.prisma) for complete schema with enums: `UserRole`, `TenantStatus`, `ProjectStatus`, `TaskStatus`, `TaskPriority`.

## Developer Workflows

### Local Development

```bash
# Backend
cd backend
npm run dev                  # Starts nodemon on :5000
npm run prisma:migrate       # Create new migration
npm run db:seed              # Seed demo data

# Frontend
cd frontend
npm run dev                  # Starts Vite on :3000
```

### Docker Deployment

```bash
docker-compose up -d         # Builds and starts all services
docker-compose ps            # Check service health
docker-compose logs backend  # View backend logs
```

Health check: `http://localhost:5000/api/health`

### Database Operations

```bash
npx prisma studio            # Visual DB browser on :5555
npx prisma generate          # Regenerate Prisma client after schema changes
npx prisma migrate reset     # Reset DB + rerun migrations + seed
```

**Important**: Always run `prisma generate` after modifying `schema.prisma` before starting the server.

## Project-Specific Conventions

### File Naming

- Controllers: `*.controller.js` (e.g., [auth.controller.js](backend/src/controllers/auth.controller.js))
- Services: `*.service.js` (business logic layer)
- Repositories: `*.repository.js` (data access layer)
- Routes: `*.routes.js` (Express route definitions)
- Middleware: descriptive names without suffix (e.g., [auth.js](backend/src/middleware/auth.js), [rbac.js](backend/src/middleware/rbac.js))

### Error Handling

- Use try-catch in controllers, delegate to [errorHandler.js](backend/src/middleware/errorHandler.js) middleware
- Log errors with structured logging via [logger.js](backend/src/utils/logger.js) (Pino)

### Audit Logging

- Call `auditService.logAction(tenantId, userId, action, entityType, entityId, metadata)` for all mutations
- See [audit.service.js](backend/src/services/audit.service.js) for implementation

## Common Pitfalls

1. **Forgetting tenant scoping**: Always pass `req.user.tenantId` to repository methods (except for super_admin cross-tenant operations)
2. **Direct Prisma usage**: Use repositories, not direct `prisma.model` calls, to ensure consistent tenant filtering
3. **Missing Prisma client regeneration**: After schema changes, must run `prisma generate` before code recognizes new fields
4. **Incorrect role checks**: Remember `super_admin` has no tenantId; check `req.user.role === 'super_admin'` before requiring tenantId

## Key Dependencies

- **Prisma 5.22+**: ORM with type-safe queries
- **bcrypt**: Password hashing (10 rounds configured in env)
- **jsonwebtoken**: JWT generation/verification with 24h expiry
- **Zod**: Request validation schemas
- **Pino**: Structured JSON logging

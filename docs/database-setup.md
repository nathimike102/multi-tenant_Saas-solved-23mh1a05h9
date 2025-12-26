# Database Setup Guide

## Overview

This project uses **PostgreSQL** with **Prisma ORM** for database management. Prisma provides type-safe database access, automatic migrations, and a powerful query builder.

## Database Schema

The database follows a multi-tenant architecture with the following core tables:

### Tables

1. **tenants** - Organization/workspace information
2. **users** - User accounts with tenant association
3. **projects** - Projects scoped to tenants
4. **tasks** - Tasks within projects
5. **audit_logs** - Security and compliance audit trail

**Note:** We use JWT-only authentication (stateless), so no sessions table is required.

## Schema Details

### 1. Tenants Table

```prisma
model Tenant {
  id                String           @id @default(uuid())
  name              String
  subdomain         String           @unique
  status            TenantStatus     @default(active)
  subscriptionPlan  SubscriptionPlan @default(free)
  maxUsers          Int              @default(5)
  maxProjects       Int              @default(10)
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
}
```

**Enums:**

- `TenantStatus`: active, suspended, trial
- `SubscriptionPlan`: free, pro, enterprise

**Default Limits by Plan:**

- Free: 5 users, 10 projects
- Pro: 50 users, 100 projects
- Enterprise: Unlimited

### 2. Users Table

```prisma
model User {
  id           String   @id @default(uuid())
  tenantId     String?  // Nullable for super_admin
  email        String
  passwordHash String
  fullName     String
  role         UserRole @default(user)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([tenantId, email])
  @@index([tenantId])
}
```

**Enums:**

- `UserRole`: super_admin, tenant_admin, user

**Unique Constraint:**

- `(tenantId, email)` - Email must be unique within each tenant
- Super admins have `tenantId = null`

### 3. Projects Table

```prisma
model Project {
  id          String        @id @default(uuid())
  tenantId    String
  name        String
  description String?
  status      ProjectStatus @default(active)
  createdBy   String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([tenantId])
}
```

**Enums:**

- `ProjectStatus`: active, archived, completed

### 4. Tasks Table

```prisma
model Task {
  id          String       @id @default(uuid())
  projectId   String
  tenantId    String
  title       String
  description String?
  status      TaskStatus   @default(todo)
  priority    TaskPriority @default(medium)
  assignedTo  String?      // Nullable - can be unassigned
  dueDate     DateTime?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([tenantId, projectId])
  @@index([assignedTo])
}
```

**Enums:**

- `TaskStatus`: todo, in_progress, completed
- `TaskPriority`: low, medium, high

### 5. Audit Logs Table

```prisma
model AuditLog {
  id         String   @id @default(uuid())
  tenantId   String?  // Nullable for system actions
  userId     String?  // Nullable for system actions
  action     String
  entityType String?
  entityId   String?
  ipAddress  String?
  createdAt  DateTime @default(now())

  @@index([tenantId, createdAt])
  @@index([action])
}
```

**Common Actions:**

- CREATE_USER, UPDATE_USER, DELETE_USER
- CREATE_PROJECT, UPDATE_PROJECT, DELETE_PROJECT
- CREATE_TASK, UPDATE_TASK, DELETE_TASK
- CREATE_TENANT, SUSPEND_TENANT

## Database Setup Instructions

### Prerequisites

- PostgreSQL 15+ installed or running via Docker
- Node.js 18+ installed

### 1. Create Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE saas_db;
\q

# Or let Docker Compose handle it (recommended)
```

### 2. Configure Environment

Create `backend/.env`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saas_db?schema=public"
```

For Docker:

```bash
DATABASE_URL="postgresql://postgres:postgres@db:5432/saas_db?schema=public"
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

This creates the Prisma Client based on your schema.

### 5. Run Migrations

```bash
npx prisma migrate dev --name init
```

This will:

- Create the database if it doesn't exist
- Generate SQL migration files in `prisma/migrations/`
- Apply migrations to the database
- Regenerate Prisma Client

### 6. Seed Database

```bash
npx prisma db seed
```

This populates the database with:

- 1 Super Admin account
- 1 Demo tenant (Demo Company)
- 1 Tenant Admin + 2 Users for Demo Company
- 2 Sample projects
- 5 Sample tasks

## Seed Data Credentials

After seeding, you can login with these accounts:

### Super Admin

```
Email: superadmin@system.com
Password: Admin@123
Role: super_admin
```

### Demo Company - Tenant Admin

```
Email: admin@demo.com
Password: Demo@123
Role: tenant_admin
Tenant: Demo Company (subdomain: demo)
```

### Demo Company - Regular Users

```
User 1: user1@demo.com / User@123
User 2: user2@demo.com / User@123
Role: user
```

## Common Commands

### View Database in Browser

```bash
npx prisma studio
```

Opens Prisma Studio at http://localhost:5555

### Create New Migration

```bash
npx prisma migrate dev --name description_of_change
```

### Apply Migrations in Production

```bash
npx prisma migrate deploy
```

### Reset Database (⚠️ Deletes all data)

```bash
npx prisma migrate reset
```

### Format Schema File

```bash
npx prisma format
```

### Validate Schema

```bash
npx prisma validate
```

## Migration Files

Prisma automatically generates migration files in `backend/prisma/migrations/`.

Example migration structure:

```
prisma/migrations/
├── 20250126000000_init/
│   └── migration.sql
└── migration_lock.toml
```

Each migration includes:

- Timestamp-based folder name
- SQL file with DDL statements
- Automatic UP migrations (no manual DOWN needed for dev)

## Multi-Tenant Data Isolation

### Tenant Scoping Rules

1. **All queries must include tenantId** (except super_admin)
2. **Users cannot access data from other tenants**
3. **Foreign keys enforce CASCADE delete for tenant data**
4. **Indexes on tenantId for performance**

### Example Queries

**Correct - Tenant-scoped:**

```javascript
const projects = await prisma.project.findMany({
  where: { tenantId: user.tenantId },
});
```

**Incorrect - Missing tenant scope:**

```javascript
// ❌ Don't do this - exposes all tenants' data
const projects = await prisma.project.findMany();
```

### Super Admin Access

Super admins can access all tenants:

```javascript
if (user.role === "super_admin") {
  // Can query across tenants
  const allProjects = await prisma.project.findMany();
} else {
  // Regular users must be scoped
  const projects = await prisma.project.findMany({
    where: { tenantId: user.tenantId },
  });
}
```

## Performance Considerations

### Indexes

Key indexes for performance:

- `tenants.subdomain` (UNIQUE) - Fast tenant lookup
- `users(tenantId, email)` (UNIQUE) - Fast user lookup
- `projects.tenantId` - Fast project queries
- `tasks(tenantId, projectId)` - Fast task queries
- `auditLogs(tenantId, createdAt)` - Fast audit queries

### Query Optimization Tips

1. **Always include indexes in WHERE clauses**
2. **Use `select` to limit returned fields**
3. **Use `include` carefully to avoid N+1 queries**
4. **Implement pagination for large result sets**

Example optimized query:

```javascript
const tasks = await prisma.task.findMany({
  where: {
    tenantId: user.tenantId,
    projectId: projectId,
    status: "todo",
  },
  select: {
    id: true,
    title: true,
    status: true,
    assignedTo: true,
    dueDate: true,
  },
  orderBy: { dueDate: "asc" },
  take: 20,
  skip: page * 20,
});
```

## Backup and Recovery

### Backup Database

```bash
pg_dump -U postgres saas_db > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
psql -U postgres saas_db < backup_20250126.sql
```

### Export Specific Tenant Data

```sql
COPY (
  SELECT * FROM projects WHERE tenant_id = 'tenant-uuid'
) TO '/tmp/tenant_projects.csv' CSV HEADER;
```

## Troubleshooting

### Migration Conflicts

```bash
# Reset and start fresh (development only)
npx prisma migrate reset
npx prisma migrate dev
```

### Schema Drift Detection

```bash
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma
```

### Connection Issues

```bash
# Test database connection
npx prisma db execute --stdin <<< "SELECT NOW();"
```

### Prisma Client Out of Sync

```bash
rm -rf node_modules/.prisma
npx prisma generate
```

## Next Steps

1. ✅ Database schema created
2. ✅ Migrations generated
3. ✅ Seed data loaded
4. ⏭️ Implement authentication middleware
5. ⏭️ Build API endpoints with tenant isolation
6. ⏭️ Add audit logging to all mutations
7. ⏭️ Implement role-based access control

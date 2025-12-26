# System Architecture Design

## 1. System Architecture Diagram

- Diagram: docs/images/system-architecture.png
- Description: Browser client calls the frontend app (React SPA). Frontend authenticates via backend API (Express/Node) using JWT. Auth endpoints issue/refresh JWTs; backend enforces tenant scoping and RBAC. Backend talks to PostgreSQL with Row-Level Security (RLS) and tenant-scoped schemas. Optional object storage and email service are behind the API for assets and notifications.
- Request flow (happy path):
  1. Browser sends request to frontend.
  2. Frontend calls `/auth/login`, receives JWT (24h) and optional refresh.
  3. Frontend stores token (HTTP-only cookie or memory) and sends it with API calls.
  4. API middleware validates JWT, sets `tenant_id` context, applies RLS and RBAC.
  5. Data reads/writes go through repositories enforcing tenant filters and auditing.

## 2. Database Schema Design

- ERD: docs/images/database-erd.png
- Modeling notes:
  - Every tenant-scoped table includes `tenant_id` with a b-tree index; composites for uniqueness (e.g., `(tenant_id, email)`).
  - Foreign keys always reference both id and `tenant_id` where applicable to prevent cross-tenant joins.
  - Row-Level Security policies enforce `tenant_id` equality on reads/writes.
- Tables (summary):
  - tenants(id pk, name, subdomain unique, status, plan, created_at)
  - users(id pk, tenant_id fk->tenants, email unique (tenant_id,email), role enum(super_admin, tenant_admin, end_user), mfa_enabled, password_hash, created_at, last_login_at)
  - invitations(id pk, tenant_id fk, email, role, token, expires_at, status)
  - projects(id pk, tenant_id fk, name unique per tenant, status, created_at, updated_at)
  - project_members(id pk, tenant_id fk, project_id fk, user_id fk, role, UNIQUE(tenant_id, project_id, user_id))
  - tasks(id pk, tenant_id fk, project_id fk, title, description, status, assigned_user_id fk users, due_date, created_at, updated_at)
  - audit_logs(id pk, tenant_id fk, actor_user_id fk, action, entity_type, entity_id, metadata jsonb, created_at; index on (tenant_id, created_at))
  - subscriptions(id pk, tenant_id fk, plan, seats_limit, projects_limit, status, period_end)
  - sessions(id pk, tenant_id fk, user_id fk, refresh_token hash, expires_at, revoked_at; index on (user_id, expires_at))
- Index highlights:
  - tenants.subdomain UNIQUE
  - users(tenant_id, email) UNIQUE; users(tenant_id, role)
  - projects(tenant_id, name) UNIQUE; projects(tenant_id, status)
  - tasks(tenant_id, project_id, status); tasks(tenant_id, assigned_user_id)
  - audit_logs(tenant_id, created_at DESC)

## 3. API Architecture

- Auth required: ✓ means JWT required; Role column lists minimum role.
- At least 15 endpoints across modules.

| Module   | Method | Path                                                    | Auth | Role                   | Notes                                     |
| :------- | :----- | :------------------------------------------------------ | :--- | :--------------------- | :---------------------------------------- |
| Auth     | POST   | /auth/login                                             | No   | —                      | Issue JWT (24h) + optional refresh token. |
| Auth     | POST   | /auth/refresh                                           | ✓    | any authenticated      | Rotate access token.                      |
| Auth     | POST   | /auth/logout                                            | ✓    | any authenticated      | Invalidate refresh token/session.         |
| Auth     | POST   | /auth/password/reset/request                            | No   | —                      | Send reset email link.                    |
| Auth     | POST   | /auth/password/reset/confirm                            | No   | —                      | Confirm reset with token.                 |
| Auth     | POST   | /auth/mfa/enable                                        | ✓    | tenant_admin or higher | Enroll MFA for admin roles.               |
| Tenants  | POST   | /tenants                                                | ✓    | super_admin            | Provision new tenant with subdomain.      |
| Tenants  | GET    | /tenants/{tenantId}                                     | ✓    | super_admin            | View tenant details/status.               |
| Tenants  | PATCH  | /tenants/{tenantId}/suspend                             | ✓    | super_admin            | Suspend/reactivate tenant.                |
| Tenants  | GET    | /tenants/self                                           | ✓    | tenant_admin or higher | Current tenant profile + plan limits.     |
| Users    | POST   | /tenants/{tenantId}/users                               | ✓    | tenant_admin           | Invite/create user with role.             |
| Users    | GET    | /tenants/{tenantId}/users                               | ✓    | tenant_admin           | List users with role filters.             |
| Users    | PATCH  | /tenants/{tenantId}/users/{userId}                      | ✓    | tenant_admin           | Update role/status.                       |
| Users    | POST   | /tenants/{tenantId}/users/{userId}/impersonate          | ✓    | super_admin            | Start support impersonation (audited).    |
| Projects | POST   | /tenants/{tenantId}/projects                            | ✓    | tenant_admin           | Create project (unique name per tenant).  |
| Projects | GET    | /tenants/{tenantId}/projects                            | ✓    | tenant_admin or member | List projects with filters.               |
| Projects | PATCH  | /tenants/{tenantId}/projects/{projectId}                | ✓    | tenant_admin           | Update project metadata/status.           |
| Tasks    | POST   | /tenants/{tenantId}/projects/{projectId}/tasks          | ✓    | project member         | Create task under project.                |
| Tasks    | GET    | /tenants/{tenantId}/projects/{projectId}/tasks          | ✓    | project member         | List tasks with status/due filters.       |
| Tasks    | PATCH  | /tenants/{tenantId}/projects/{projectId}/tasks/{taskId} | ✓    | project member         | Update task fields/status.                |
| Tasks    | POST   | /tenants/{tenantId}/projects/{projectId}/tasks/bulk     | ✓    | tenant_admin or lead   | Bulk update status/assignees (audited).   |

- Authentication enforcement: All non-auth endpoints require JWT; middleware sets `tenant_id`, enforces RLS, and checks route-level roles.
- Auditing: Mutations write to `audit_logs` with actor, tenant, entity, and metadata.
- Rate limiting: Per-IP and per-tenant limits on auth and mutation-heavy endpoints.

# Research & Requirements Analysis

## 1. Multi-Tenancy Analysis

This project must support multiple independent organizations (tenants) with strong data isolation, role-based access control, subscription limits, and a clean operational model. Multi‑tenancy is commonly implemented using one of three patterns. Below is a practical comparison focused on isolation, performance, operational complexity, and cost.

### 1.1 Approaches Compared

- Shared DB + Shared Schema (tenant_id column)

  - How: One database and shared tables; every row tagged with `tenant_id`; queries always scoped.
  - Pros: Lowest cost; simplest provisioning; easy super-admin cross-tenant queries; single set of migrations; scales one cluster horizontally.
  - Cons: Strict query discipline needed; noisy-neighbor risk; global-impact migrations; coarse per-tenant backup/restore.
  - Isolation: Medium (can be High with Row-Level Security).
  - Operational complexity: Low–Medium.
  - Cost: Lowest (single cluster).
  - Best for: SaaS MVPs, startups, predictable growth.

- Shared DB + Separate Schema (per tenant)

  - How: One database; each tenant gets its own schema (tables duplicated per tenant).
  - Pros: Better logical isolation; easier tenant offboarding/restore; per-tenant tuning; limits blast radius of tenant-specific changes.
  - Cons: Migrations run per schema; schema count can explode; harder cross-tenant reporting; added connection pooling pressure.
  - Isolation: High.
  - Operational complexity: Medium–High.
  - Cost: Medium (one DB, more objects).
  - Best for: B2B SaaS with fewer, larger tenants; stronger separation needs.

- Separate Database (per tenant)
  - How: Each tenant gets its own database instance.
  - Pros: Strongest isolation; clean per-tenant lifecycle and tuning; straightforward data residency controls.
  - Cons: Highest cost and overhead; provisioning automation required; complex cross-tenant analytics; version skew and connection management overhead.
  - Isolation: Very High.
  - Operational complexity: High.
  - Cost: Highest.
  - Best for: Enterprise tenants needing strict isolation, residency, and SLAs with variable workloads.

### 1.2 Chosen Approach and Rationale

For this system, the recommended default is Shared Database + Shared Schema with a `tenant_id` column on every tenant-scoped table, augmented with defense-in-depth controls:

- Application‑level enforcement: all reads/writes must include tenant scoping in repositories/ORM queries; super admin bypass allowed only via explicit guarded paths.
- Database‑level enforcement: PostgreSQL Row‑Level Security (RLS) policies to enforce `tenant_id` scoping at the database layer; this significantly reduces the risk of accidental cross‑tenant access caused by coding mistakes.
- Unique and index strategy: compound unique constraints (e.g., `(tenant_id, email)` for users) and b‑tree indexes on `tenant_id` columns to ensure both correctness and performance.
- Audit logging: persistent `audit_logs` tracking sensitive actions, subject IDs, tenant IDs, and metadata.

Why this choice:

- Requirement alignment: the core requirements mention indexes on `tenant_id`, unique constraints per tenant (e.g., email), and super‑admin across tenants—these map cleanly to shared schema.
- Speed and simplicity: enables rapid delivery of a production‑ready MVP while meeting isolation and RBAC needs.
- Cost efficiency: a single database cluster reduces cost and operational burden for early stages; it also simplifies CI/CD, migrations, and observability.
- Smooth upgrade path: if future enterprise needs demand stronger separation, we can evolve toward per‑schema or per‑database for select tenants while keeping shared‑schema for the long tail.

### 1.3 Isolation and Performance Considerations

- Isolation
  - Enforce `tenant_id` via app middleware/repositories, plus RLS at the DB layer for defense in depth.
  - Separate super-admin users with `tenant_id = NULL` and guard access paths tightly in the API and UI.
  - Ensure every tenant-scoped FK includes `tenant_id` in the parent key path or is validated at the application layer to prevent cross-tenant relationships.
- Indexing and query patterns
  - Add `tenant_id` b-tree indexes to all tenant-scoped tables; consider `(tenant_id, created_at)` for common list/sort queries.
  - Avoid full table scans by always scoping queries with `tenant_id` and supporting the most frequent filter/sort combinations with composite indexes.
- Multi-tenant throttling
  - Use per-tenant rate limiting and background job quotas to prevent noisy neighbor effects.
  - Surface per-tenant metrics (p95 latency, QPS, error rate) and budget alerts for proactive tuning.
- Operational safeguards
  - Write idempotent, additive migrations; run migrations with `LOCK TIMEOUT` and safe retries.
  - Backups should support point‑in‑time recovery; document restore runbooks and test them regularly.

In summary, shared schema with strict scoping, RLS, and strong observability provides the best balance of speed, cost, isolation, and maintainability for this project’s initial phase, with a clear path to higher isolation if required.

## 2. Technology Stack Justification

The stack prioritizes fast delivery, clear multi-tenant patterns, mature tooling, and Docker-first deployment. Alternatives are noted with trade-offs.

### 2.1 Backend Framework

- Choice: Node.js with Express (TypeScript)
  - Why: Ubiquitous ecosystem; lightweight, composable middleware; excellent support for JWT, RBAC, validation, logging; abundant operational knowledge for Dockerized deployments.
  - Fit: Pairs well with Prisma + PostgreSQL for strong type-safe data access and tenant scoping patterns; easy to implement uniform response envelopes and error handling.
  - Libraries: `express`, `zod`/`yup` for validation, `jsonwebtoken`, `helmet`, `morgan`, `pino`, `rate-limiter-flexible`, `cors`.
- Alternatives considered
  - NestJS (Node): Opinionated and modular, great for larger teams; steeper learning curve and heavier scaffolding.
  - FastAPI (Python): Rapid development and strong type hints; fewer turnkey Node-style middlewares; mixing Python client libs in a Node-heavy frontend shop can add cognitive load.
  - Spring Boot (Java/Kotlin): Enterprise-grade and robust; higher initial complexity and slower iteration for MVP.
  - Go (Fiber/Gin): Excellent performance and static binaries; more code for batteries-included features (RBAC, auth flows) and a smaller pool of ready-to-use multi-tenant samples.

### 2.2 Frontend Framework

- Choice: Next.js (React)
  - Why: Hybrid SSR/SSG/ISR for fast initial paint and SEO; mature auth patterns with JWT; vast ecosystem of UI libraries; easy environment configuration inside Docker.
  - Fit: Rapid development of protected routes, role‑based UI, and responsive dashboards.
  - Libraries: React Query/TanStack Query for data fetching, Tailwind CSS or MUI for components, React Hook Form with Zod for forms.
- Alternatives considered
  - Nuxt (Vue): Strong DX; smaller hiring pool for some teams and fewer sample integrations for the exact requirements.
  - Angular: Enterprise‑friendly; heavier framework and steeper learning curve for MVP cadence.

### 2.3 Database

- Choice: PostgreSQL
  - Why: First-class support for relational constraints, partial indexes, JSONB, and notably Row-Level Security (RLS) for defense-in-depth multi-tenant isolation.
  - Fit: Clear modeling for tenants, projects, tasks, users, and audit logs with strict FK constraints.
- Alternatives considered
  - MySQL/MariaDB: Solid relational option but weaker native RLS story; feature parity varies.
  - CockroachDB: Horizontal scale and PostgreSQL-like dialect; operational maturity and cost considerations for MVP.
  - MongoDB: Flexible schemas but weaker relational guarantees for strict isolation and constraints.

### 2.4 Authentication Method

- Choice: JWT (access token, 24h expiry as required)
  - Why: Stateless, simple to scale across containers; standard libraries; easy role claims and tenant claims (`tenant_id`) in the token.
  - Fit: Works with API gateways/proxies and aligns with Dockerized deployments.
- Alternatives considered
  - Session cookies + server state: Strong CSRF protection with SameSite; adds session store complexity and stickiness.
  - OAuth 2.0 / OIDC with third‑party IdP: Great for SSO; introduces external dependency and setup overhead for MVP.

### 2.5 Deployment Platforms

- Choice: Docker Compose (local and single-host), with a path to Kubernetes/ECS later
  - Why: The project mandates Docker; Compose provides one-command orchestration; easy inter-service networking by name.
  - Fit: Health checks, auto‑migrations/seeds, fixed ports per requirement.
- Alternatives considered
  - Kubernetes: Powerful for scale and isolation; higher operational overhead for MVP.
  - AWS ECS/Fargate / Fly.io / Render: Managed container platforms; great later with CI/CD but Compose is simpler to evaluate and iterate locally now.

Altogether, this stack balances speed, safety (RLS, constraints), and an uncomplicated deployment model that can evolve as scale and enterprise requirements grow.

## 3. Security Considerations

Security in a multi-tenant SaaS must assume partial compromise and prevent cross-tenant impact. The following measures create complementary layers of defense.

### 3.1 Five Key Measures for Multi-Tenant Security

1. Tenant-scoped data access by default
   - Every repository/ORM method requires an explicit `tenant_id` parameter; avoid direct table access without scoping wrappers. Enforce this convention via code reviews and lint rules.
2. Database Row-Level Security (RLS)
   - Implement RLS on all tenant-scoped tables with policies like `USING (tenant_id = current_setting('app.tenant_id')::uuid)`; set `app.tenant_id` per request connection when possible. This ensures DB-level isolation even if a query forgets a WHERE clause.
3. Principle of least privilege and RBAC
   - JWT includes `role` and `tenant_id`. Middleware enforces role requirements (`super_admin`, `tenant_admin`, `user`) per endpoint. Service accounts and DB users get only necessary permissions.
4. Secure authentication and credential storage
   - Hash passwords with Argon2id or bcrypt (cost‑tuned) plus per‑user salt; optionally add an application‑level pepper stored in environment variables. Enforce strong password policies and login rate limiting.
5. Comprehensive audit logging and monitoring
   - Persist `who did what, to which entity, in which tenant, when`, with request IDs to correlate logs. Ship logs to a central store, alert on anomalies (e.g., access to many tenants, mass deletions, repeated 403s).

### 3.2 Data Isolation Strategy

- Schema design
  - All tenant-scoped tables include `tenant_id`. Compound unique constraints (e.g., `(tenant_id, email)`), FK constraints with `ON DELETE CASCADE` where appropriate, and `tenant_id` indexes.
- Database enforcement
  - Enable RLS for all tenant tables; create `USING` and `WITH CHECK` policies to constrain reads and writes to the request’s tenant. Super admin actions use dedicated connections or temporarily elevated RLS settings under strict audit.
- Application patterns
  - Middleware extracts tenant from subdomain or explicit header, validates tenant existence and status, and injects `tenant_id` into request context. All service methods accept tenant context explicitly.

### 3.3 Authentication & Authorization

- Authentication
  - JWT with 24h access tokens as required; store only the token in memory or secure storage on the client; rotate `JWT_SECRET` via deployments; consider optional refresh tokens for longer sessions.
- Authorization
  - Route‑level RBAC middleware; claim validation (e.g., `role in [tenant_admin, super_admin]` for sensitive endpoints); resource‑level checks (e.g., user must belong to the same tenant as the target project).
- Hardening
  - Rate limiting per IP and per tenant; account lockout policy after repeated failures; device and geo anomaly alerts for admins.

### 3.4 Password Hashing Strategy

- Prefer Argon2id (memory‑hard) or strong bcrypt cost (e.g., 10–12) depending on runtime constraints. Store only salt + hash; never store plaintext.
- Use a server‑side pepper stored in environment variables to mitigate offline hash attacks if the DB is exfiltrated.
- Rehash on login when parameters change (e.g., cost factor increased) to transparently upgrade stored hashes.

### 3.5 API Security Measures

- Input validation and sanitization using schemas (Zod/Yup) to prevent injection and enforce types/limits.
- Authentication on all non-public routes; strict CORS allowing `http://frontend:3000` only in Docker network.
- Security headers via `helmet` (no‑sniff, XSS protection, frameguard), and TLS termination at the edge.
- Idempotent, transactional writes for critical flows (tenant registration); CSRF is minimized with token-in-header usage, but be mindful if cookies are ever introduced.
- Secrets management via environment variables committed with test/development values for evaluation; rotate keys regularly; never log secrets.

These layers—careful schema and indexes, RLS, strict RBAC, strong password hashing, validated inputs, rate limiting, and robust audit logging—provide a pragmatic and effective security posture appropriate for a multi-tenant SaaS that must run reliably and securely in containers.

# Product Requirements Document (PRD)

## 1. User Personas

### 1.1 Super Admin (System-level administrator)
- Role description: Owns the entire platform and operates across all tenants.
- Key responsibilities: Provision new tenants; enforce global policies; monitor system health; handle escalations and compliance.
- Main goals: Keep the platform reliable and secure; ensure tenant onboarding is smooth; gain cross-tenant observability.
- Pain points: High blast radius of mistakes; needs safe ways to debug without affecting tenant data; balancing security with support access.

### 1.2 Tenant Admin (Organization administrator)
- Role description: Manages their organization’s workspace, users, and subscriptions.
- Key responsibilities: Configure tenant settings; invite and manage users; assign roles; manage billing and plans; oversee projects.
- Main goals: Quickly onboard the team; keep access controlled; stay within plan limits; maintain project momentum.
- Pain points: Friction in user onboarding; risk of misconfiguring permissions; hitting plan limits unexpectedly; limited visibility into activity.

### 1.3 End User (Regular team member)
- Role description: Works within assigned projects to create and complete tasks.
- Key responsibilities: View projects and tasks; update task status; collaborate with teammates; meet deadlines.
- Main goals: Clear task visibility; fast, reliable UI; minimal distractions; predictable notifications.
- Pain points: Confusing navigation; slow load times; unclear task ownership or due dates; noisy or missing notifications.

## 2. Functional Requirements

### Auth
- FR-001: The system shall support email/password authentication and issue JWT access tokens expiring after 24 hours.
- FR-002: The system shall provide password reset via emailed, time-limited links.
- FR-003: The system shall support optional multi-factor authentication for Super Admins and Tenant Admins.

### Tenant
- FR-004: The system shall allow tenant registration with a unique subdomain.
- FR-005: The system shall enforce subscription plan limits on seats and projects per tenant.
- FR-006: The system shall allow suspension and reactivation of tenants without data loss.

### User
- FR-007: The system shall allow Tenant Admins to invite users via email and assign roles.
- FR-008: The system shall isolate tenant data completely, preventing cross-tenant access at the API and database layers.
- FR-009: The system shall allow Super Admins to impersonate Tenant Admins for support while recording full audit logs.

### Project
- FR-010: The system shall allow creation of projects scoped to a tenant with names unique within that tenant.
- FR-011: The system shall support assigning Tenant Admins and End Users to projects with role-based permissions.
- FR-012: The system shall provide project-level activity logs visible to Tenant Admins.

### Task
- FR-013: The system shall allow creating tasks under a project with statuses (Todo, In Progress, Done).
- FR-014: The system shall support assigning tasks to End Users with due dates and reminders.
- FR-015: The system shall allow bulk task updates (status or assignee) while recording audit entries.

## 3. Non-Functional Requirements

- NFR-001 (Performance): The system shall respond to at least 90% of API requests within 200ms server-side, excluding network latency.
- NFR-002 (Security): The system shall hash all passwords with a strong algorithm (Argon2id or bcrypt) and issue JWTs with a 24-hour expiry over TLS-only connections.
- NFR-003 (Scalability): The system shall support a minimum of 100 concurrent active users per tenant with a documented horizontal scaling path.
- NFR-004 (Availability): The system shall target 99% uptime per month, excluding scheduled maintenance.
- NFR-005 (Usability): The system shall provide a mobile-responsive UI for viewports 360–1280px and allow access to primary flows (login, project view, task update) within three clicks or taps.

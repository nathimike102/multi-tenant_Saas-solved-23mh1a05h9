# SaaS Frontend (React + Vite)

This is the React SPA for the multi-tenant SaaS platform.

## Scripts

```bash
# Install deps
npm install

# Start dev server (proxy to backend on :5000)
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

## Routing

- `/register` – Tenant registration
- `/login` – Login
- `/dashboard` – Protected dashboard (stats, recent projects, my tasks)
- `/projects` – Projects list with search and filter
- `/projects/:projectId` – Project details with task management
- `/users` – User management (tenant_admin+)

## Auth

- Stores JWT in localStorage
- Verifies token on app load via `/api/auth/me`
- Clears auth and redirects on 401 responses

## API Proxy

Vite dev proxy forwards `/api` to `http://localhost:5000`.

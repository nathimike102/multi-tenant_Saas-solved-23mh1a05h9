# Technical Specification

## 1. Project Structure

### 1.1 Backend Structure

```
backend/
├── src/
│   ├── controllers/          # Request handlers for each module
│   │   ├── auth.controller.js
│   │   ├── tenant.controller.js
│   │   ├── user.controller.js
│   │   ├── project.controller.js
│   │   └── task.controller.js
│   ├── middleware/           # Express middleware functions
│   │   ├── auth.middleware.js        # JWT validation
│   │   ├── rbac.middleware.js        # Role-based access control
│   │   ├── tenant.middleware.js      # Tenant context injection
│   │   ├── validation.middleware.js  # Request validation
│   │   ├── rateLimit.middleware.js   # Rate limiting
│   │   └── errorHandler.middleware.js
│   ├── models/               # Database models (Prisma schema)
│   │   └── schema.prisma     # Prisma schema definition
│   ├── routes/               # API route definitions
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── tenant.routes.js
│   │   ├── user.routes.js
│   │   ├── project.routes.js
│   │   └── task.routes.js
│   ├── services/             # Business logic layer
│   │   ├── auth.service.js
│   │   ├── tenant.service.js
│   │   ├── user.service.js
│   │   ├── project.service.js
│   │   ├── task.service.js
│   │   ├── email.service.js
│   │   └── audit.service.js
│   ├── repositories/         # Data access layer (tenant-scoped)
│   │   ├── base.repository.js
│   │   ├── tenant.repository.js
│   │   ├── user.repository.js
│   │   ├── project.repository.js
│   │   └── task.repository.js
│   ├── utils/                # Helper functions and utilities
│   │   ├── jwt.util.js
│   │   ├── password.util.js
│   │   ├── validation.util.js
│   │   ├── logger.util.js
│   │   └── response.util.js
│   ├── config/               # Configuration files
│   │   ├── database.config.js
│   │   ├── jwt.config.js
│   │   ├── email.config.js
│   │   └── app.config.js
│   └── app.js                # Express app initialization
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.js               # Database seed data
├── tests/
│   ├── unit/                 # Unit tests
│   │   ├── services/
│   │   ├── repositories/
│   │   └── utils/
│   ├── integration/          # Integration tests
│   │   ├── auth.test.js
│   │   ├── tenant.test.js
│   │   └── project.test.js
│   └── setup.js              # Test configuration
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
├── .eslintrc.js
├── Dockerfile
└── docker-compose.yml
```

### 1.2 Frontend Structure

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/               # Static assets
├── src/
│   ├── components/           # Reusable React components
│   │   ├── common/           # Shared components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   └── Loader.jsx
│   │   ├── layout/           # Layout components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── auth/             # Auth-specific components
│   │   │   ├── LoginForm.jsx
│   │   │   ├── PasswordReset.jsx
│   │   │   └── MFASetup.jsx
│   │   ├── projects/         # Project module components
│   │   │   ├── ProjectCard.jsx
│   │   │   ├── ProjectList.jsx
│   │   │   └── ProjectForm.jsx
│   │   └── tasks/            # Task module components
│   │       ├── TaskCard.jsx
│   │       ├── TaskList.jsx
│   │       └── TaskForm.jsx
│   ├── pages/                # Page components (routes)
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx
│   │   ├── projects/
│   │   │   ├── ProjectsPage.jsx
│   │   │   └── ProjectDetailPage.jsx
│   │   ├── tasks/
│   │   │   └── TasksPage.jsx
│   │   ├── users/
│   │   │   └── UsersPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useTenant.js
│   │   ├── useProjects.js
│   │   ├── useTasks.js
│   │   └── useDebounce.js
│   ├── services/             # API service layer
│   │   ├── api.service.js    # Base API client
│   │   ├── auth.service.js
│   │   ├── project.service.js
│   │   ├── task.service.js
│   │   └── user.service.js
│   ├── store/                # State management (if using Redux/Zustand)
│   │   ├── authSlice.js
│   │   ├── tenantSlice.js
│   │   └── store.js
│   ├── routes/               # Route configuration
│   │   ├── AppRoutes.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleRoute.jsx
│   ├── utils/                # Utility functions
│   │   ├── auth.util.js
│   │   ├── validation.util.js
│   │   ├── format.util.js
│   │   └── constants.js
│   ├── styles/               # Global styles
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── themes.css
│   ├── App.jsx               # Root component
│   └── main.jsx              # Entry point
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
├── .eslintrc.js
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS config
├── Dockerfile
└── docker-compose.yml
```

### 1.3 Folder Purpose Explanation

#### Backend Folders

- **`src/controllers/`**: Handle HTTP requests and responses. Controllers receive requests, call services, and return formatted responses. Keep them thin—no business logic here.
- **`src/middleware/`**: Express middleware for cross-cutting concerns (authentication, authorization, validation, logging, error handling). Applied before route handlers.
- **`src/models/`**: Contains the Prisma schema defining the database structure. Generated Prisma Client provides type-safe database access.
- **`src/routes/`**: Define API endpoints and map them to controllers. Attach middleware for auth, validation, and RBAC per route.
- **`src/services/`**: Business logic layer. Orchestrates data operations, enforces business rules, and coordinates between repositories and external services.
- **`src/repositories/`**: Data access layer. Encapsulates all database queries with tenant scoping. Ensures no query bypasses tenant isolation.
- **`src/utils/`**: Reusable helper functions (JWT signing/verification, password hashing, logging, response formatting).
- **`src/config/`**: Configuration modules for database, JWT, email, and application settings. Reads from environment variables.
- **`prisma/`**: Prisma schema and migrations. `prisma migrate` generates SQL migrations; `seed.js` populates initial data.
- **`tests/`**: Unit and integration tests. Unit tests for services/repositories; integration tests for full API flows.

#### Frontend Folders

- **`src/components/`**: Reusable UI components organized by type (common, layout, feature-specific). Promotes component reuse and consistency.
- **`src/pages/`**: Top-level page components mapped to routes. Each page composes smaller components and handles page-level logic.
- **`src/hooks/`**: Custom React hooks for shared logic (auth state, data fetching, form handling). Keeps components clean.
- **`src/services/`**: API client layer. Centralizes all HTTP requests to the backend with error handling and token injection.
- **`src/store/`**: Global state management (Redux Toolkit, Zustand, or Context API). Manages auth state, tenant context, and cached data.
- **`src/routes/`**: Route definitions and protected route wrappers. Handles route guards based on authentication and role.
- **`src/utils/`**: Helper functions (formatting, validation, constants). Shared utilities used across components.
- **`src/styles/`**: Global CSS, theme variables, and style utilities (if not using Tailwind exclusively).

---

## 2. Development Setup Guide

### 2.1 Prerequisites

- **Node.js**: v18.x or v20.x (LTS recommended)
- **npm**: v9.x or higher (comes with Node.js)
- **Docker**: v24.x or higher
- **Docker Compose**: v2.x or higher
- **PostgreSQL**: v15.x or higher (via Docker or local installation)
- **Git**: v2.x or higher

Verify installations:
```bash
node --version   # Should show v18.x or v20.x
npm --version    # Should show v9.x+
docker --version # Should show v24.x+
docker compose version # Should show v2.x+
```

### 2.2 Environment Variables

#### Backend Environment Variables

Create `backend/.env` from `backend/.env.example`:

```bash
# Server Configuration
NODE_ENV=development
PORT=4000
API_VERSION=v1

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@db:5432/saas_db?schema=public

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-token-secret-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://frontend:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (optional for MVP)
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-user
EMAIL_PASSWORD=your-mailtrap-password
EMAIL_FROM=noreply@example.com

# Logging
LOG_LEVEL=debug

# Security
BCRYPT_ROUNDS=10
COOKIE_SECRET=your-cookie-secret-change-in-production
```

#### Frontend Environment Variables

Create `frontend/.env` from `frontend/.env.example`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_API_TIMEOUT=30000

# Application Configuration
VITE_APP_NAME=SaaS Platform
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_MFA=true
VITE_ENABLE_ANALYTICS=false
```

### 2.3 Installation Steps

#### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository**:
```bash
git clone <repository-url>
cd SaaS
```

2. **Create environment files**:
```bash
# Backend
cp backend/.env.example backend/.env
# Frontend
cp frontend/.env.example frontend/.env
```

3. **Start all services**:
```bash
docker compose up --build
```

This will:
- Build backend and frontend Docker images
- Start PostgreSQL container
- Run database migrations
- Seed initial data
- Start backend API on port 4000
- Start frontend dev server on port 3000

4. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Database: localhost:5432

#### Option 2: Local Development (Without Docker)

1. **Clone the repository**:
```bash
git clone <repository-url>
cd SaaS
```

2. **Install PostgreSQL locally** (if not using Docker for DB only):
```bash
# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-15
sudo systemctl start postgresql
```

3. **Create database**:
```bash
psql -U postgres
CREATE DATABASE saas_db;
\q
```

4. **Setup Backend**:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local database URL
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_db

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start backend
npm run dev
```

5. **Setup Frontend** (in a new terminal):
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
# VITE_API_BASE_URL=http://localhost:4000/api/v1

# Start frontend
npm run dev
```

### 2.4 How to Run Locally

#### Using Docker Compose

```bash
# Start all services
docker compose up

# Start in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild and start
docker compose up --build
```

#### Using npm scripts

**Backend:**
```bash
cd backend

# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start

# Run migrations
npm run migrate

# Generate Prisma Client
npm run prisma:generate

# Reset database (warning: deletes all data)
npm run db:reset
```

**Frontend:**
```bash
cd frontend

# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

### 2.5 How to Run Tests

#### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration

# Run unit tests only
npm run test:unit
```

#### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run component tests
npm run test:component

# Run e2e tests (if configured)
npm run test:e2e
```

#### Test Database Setup

For integration tests, use a separate test database:

1. Create `.env.test` in backend:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_test_db
```

2. Create test database:
```bash
psql -U postgres -c "CREATE DATABASE saas_test_db;"
```

3. Run migrations on test DB:
```bash
NODE_ENV=test npx prisma migrate deploy
```

### 2.6 Common Development Tasks

#### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name add_new_field

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (visual DB editor)
npx prisma studio

# Reset database (dev only)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

#### Code Quality

```bash
# Backend
cd backend
npm run lint          # ESLint
npm run format        # Prettier

# Frontend
cd frontend
npm run lint
npm run format
```

#### Docker Management

```bash
# View running containers
docker ps

# View logs for specific service
docker compose logs -f backend
docker compose logs -f frontend

# Execute command in container
docker compose exec backend npm run migrate
docker compose exec backend sh

# Remove all containers and volumes
docker compose down -v

# Rebuild specific service
docker compose build backend
docker compose up -d backend
```

### 2.7 Troubleshooting

#### Port Already in Use

```bash
# Find process using port 4000 (backend)
lsof -i :4000
kill -9 <PID>

# Find process using port 3000 (frontend)
lsof -i :3000
kill -9 <PID>
```

#### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps

# Check database logs
docker compose logs db

# Recreate database container
docker compose down
docker volume rm saas_db_data
docker compose up -d db
```

#### Module Not Found Errors

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Prisma Client Out of Sync

```bash
cd backend
npx prisma generate
npm run dev
```

---

## 3. Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | React | 18.x |
| **Build Tool** | Vite | 5.x |
| **Routing** | React Router | 6.x |
| **State Management** | React Query / Zustand | Latest |
| **UI Framework** | Tailwind CSS | 3.x |
| **Backend Framework** | Express.js | 4.x |
| **Runtime** | Node.js | 18.x/20.x |
| **Language** | JavaScript (ES6+) | Latest |
| **Database** | PostgreSQL | 15.x |
| **ORM** | Prisma | 5.x |
| **Authentication** | JWT | jsonwebtoken |
| **Password Hashing** | bcrypt | Latest |
| **Validation** | Zod | Latest |
| **Testing (Backend)** | Jest + Supertest | Latest |
| **Testing (Frontend)** | Vitest + React Testing Library | Latest |
| **Containerization** | Docker + Docker Compose | Latest |

---

## 4. Next Steps

1. ✅ Complete project structure setup
2. ✅ Configure development environment
3. ⏭️ Implement database schema with Prisma
4. ⏭️ Build authentication module
5. ⏭️ Implement tenant management
6. ⏭️ Build project and task modules
7. ⏭️ Add frontend UI components
8. ⏭️ Write tests
9. ⏭️ Deploy to production

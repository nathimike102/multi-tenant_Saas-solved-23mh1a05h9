# Nathi SaaS Platform

A comprehensive multi-tenant SaaS application for managing organizations, users, projects, and tasks with role-based access control.

## 🎯 Project Description

A modern SaaS platform designed to enable organizations to manage their operations across multiple teams and projects. It provides a complete multi-tenancy solution with isolated data, role-based access control, and comprehensive project and task management capabilities.

**Target Audience:** Enterprise organizations and businesses requiring multi-tenant, scalable project management solutions.

## ✨ Key Features

1. **Multi-Tenancy Architecture** - Complete data isolation between different organizations
2. **User Management** - Create, manage, and assign users with role-based access control
3. **Project Management** - Organize work into projects with collaborative features
4. **Task Management** - Create, assign, and track tasks with status and priority levels
5. **Role-Based Access Control** - Super Admin, Tenant Admin, and User roles with granular permissions
6. **Authentication & Authorization** - Secure JWT-based authentication with token refresh
7. **Real-time Data Isolation** - Automatic filtering of data based on tenant membership
8. **Subscription Management** - Tenant subscription plans with resource limits (users, projects)
9. **Audit Logging** - Complete audit trail of all system actions
10. **RESTful API** - 19+ comprehensive API endpoints for all platform features

## 🏗️ Technology Stack

### Frontend

- **React** 18.2+ - UI library
- **React Router** 6.22+ - Client-side routing
- **Vite** 5.0+ - Build tool and dev server
- **Axios** - HTTP client with JWT interceptors
- **React Hook Form** - Form state management
- **Zod** - TypeScript-first schema validation

### Backend

- **Node.js** 18+ - JavaScript runtime
- **Express** 4.18+ - Web framework
- **Prisma** 5.22+ - ORM for database operations
- **PostgreSQL** 15+ - Relational database
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcrypt** - Password hashing
- **Pino** - Structured logging

### Database

- **PostgreSQL** 15+ - Primary database
- **Prisma Accelerate** - Database connection pooling

### DevOps & Deployment

- **Docker** 24+ - Container runtime
- **Docker Compose** 2.0+ - Container orchestration
- **Node.js Alpine** - Minimal Docker images

## 🏛️ Architecture Overview

### Multi-Tenancy Approach

- **Data Isolation**: Each tenant's data is completely isolated using `tenant_id` filtering
- **Subdomain-Based Access**: Each tenant is assigned a unique subdomain (e.g., `demo.nathi.local`)
- **Role-Based Authorization**: Access control enforced at the API middleware level
- **Resource Limits**: Subscriptions define max users and projects per tenant

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** 18.0+ (with npm)
- **Docker** 24+ and Docker Compose 2.0+
- **PostgreSQL** 15+ (if running locally without Docker)
- **Git** 2.0+

### Docker Setup (Recommended)

1. **Build and start all services**

   ```bash
   docker-compose up -d
   ```

2. **Verify services are running**

   ```bash
   docker-compose ps
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

4. **Check health status**
   ```bash
   curl http://localhost:5000/api/health
   ```

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone git@github.com:nathimike102/multi-tenant_Saas-solved-23mh1a05h9.git
   cd multi-tenant_Saas-solved-23mh1a05h9
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   npx prisma migrate deploy
   node scripts/seed.js
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📚 API Documentation

See [docs/API.md](./docs/API.md) for complete API reference with all 19+ endpoints.

### Main Endpoint Categories

- **Authentication** - Register, login, logout
- **Tenants** - Manage organizations
- **Users** - Manage users per tenant
- **Projects** - Manage projects
- **Tasks** - Manage tasks
- **Health** - System health check

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with 10 rounds
- **CORS Protection**: Configurable origin restrictions
- **Input Validation**: Zod schemas on frontend and backend
- **Tenant Isolation**: Automatic data filtering by tenant
- **Role-Based Access Control**: Three-tier authorization system

## 🧪 Testing Credentials

**Super Admin**

- Email: `superadmin@system.com`
- Password: `Admin@123`

**Tenant Admin**

- Email: `admin@demo.com`
- Password: `Demo@123`
- Subdomain: `demo`

**Regular Users**

- Email: `user1@demo.com` or `user2@demo.com`
- Password: `User@123`

## 📦 Docker Services

All services configured with health checks and auto-restart:

- **database**: PostgreSQL 15 (Port 5432)
- **backend**: Node.js Express API (Port 5000)
- **frontend**: React Vite App (Port 3000)

## 🔧 Development Commands

**Backend**

```bash
npm run dev      # Start with nodemon
npm start        # Production mode
```

**Frontend**

```bash
npm run dev      # Start dev server
npm run build    # Build for production
```

**Docker**

```bash
docker-compose up -d      # Start all services
docker-compose down       # Stop all services
docker-compose logs       # View logs
```

## 📝 Project Structure

```
multi-tenant_Saas-solved-23mh1a05h9/
├── backend/                  # Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utilities
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── scripts/
│   │   └── seed.js          # Database seeding
│   └── Dockerfile
├── frontend/                 # React Vite App
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── components/      # Reusable components
│   │   ├── api/             # API client
│   │   └── auth/            # Auth logic
│   └── Dockerfile
├── docs/
│   └── API.md               # API documentation
├── docker-compose.yml        # Docker orchestration
├── README.md                 # This file
└── submission.json          # Test credentials
```

**Frontend API calls failing**

- Verify CORS configuration in backend
- Ensure backend health check passes: `curl http://localhost:5000/api/health`
- Check browser console for error details

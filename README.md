# 🚀 Saarthi TaskEngine - Task Automation & Job Processing Platform

A production-grade, asynchronous **Task Automation & Job Processing Platform** designed as a Micro SaaS module. Built with **Next.js**, **Express.js**, **PostgreSQL**, **Redis**, **BullMQ**, and **Socket.IO**.

---

## 📐 Architecture Overview

```mermaid
flowchart TB
    subgraph Client ["Frontend (Next.js 14 / TypeScript)"]
        UI["Glassmorphic UI (React, Redux, TanStack Query)"]
        SocketClient["Socket.IO Client"]
    end

    subgraph API ["Backend API Server (Express + Node.js)"]
        AuthMiddleware["JWT & RBAC Middleware"]
        Controllers["Auth / Task / Dashboard Controllers"]
        Services["Task & Auth Services"]
        SocketServer["Socket.IO Server"]
    end

    subgraph WorkerLayer ["Asynchronous Queue Engine"]
        BullProducer["BullMQ Queue Producer"]
        BullWorker["BullMQ Worker Process"]
    end

    subgraph DataStore ["Data & Caching Layer"]
        PG[("PostgreSQL Database (Prisma ORM)")]
        RedisDB[("Redis (Queue & Session Cache)")]
    end

    UI -->|REST APIs| AuthMiddleware
    AuthMiddleware --> Controllers
    Controllers --> Services
    Services -->|Persist & Query| PG
    Services -->|Cache Stats & Sessions| RedisDB
    Services -->|Enqueue Jobs| BullProducer
    BullProducer -->|Job Data| RedisDB
    BullWorker -->|Pop & Process| RedisDB
    BullWorker -->|Update Job Status| PG
    BullWorker -->|Emit Live Events| SocketServer
    SocketServer -->|Real-Time Push| SocketClient
```

---

## 🌟 Key Features

1. **User Authentication & Authorization**:
   - Secure Registration and Login with `bcryptjs` password hashing.
   - JWT Access Tokens (15m expiration) + Refresh Token Rotation stored in Redis and DB.
   - Role-Based Access Control (RBAC) with `ADMIN` and `USER` permissions.

2. **Asynchronous Job Processing (Redis + BullMQ)**:
   - Priority Queuing (`URGENT`, `HIGH`, `MEDIUM`, `LOW`).
   - Job scheduling & delayed execution (`scheduledAt`).
   - Exponential backoff auto-retry strategy for failed jobs.
   - Manual retry trigger endpoint for failed or completed jobs.

3. **Real-Time WebSockets Telemetry (Socket.IO)**:
   - Instant status transitions (`PENDING` ➔ `PROCESSING` ➔ `COMPLETED` / `FAILED`).
   - Dynamic dashboard statistics auto-updates without page refreshes.

4. **Task Management & Search**:
   - Instant keyword search by title and content.
   - Status filtering tabs & priority dropdowns.
   - Dynamic sorting (Newest, Oldest, Priority, Title).
   - Server-side pagination.

5. **File Upload Support**:
   - Multer middleware supporting PDF documents and image attachments.

6. **DevOps & Containerization**:
   - Fully dockerized via `docker-compose.yml` (Postgres, Redis, API, Worker, Next.js).
   - GitHub Actions CI pipeline for automated builds and syntax checks.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Redux Toolkit, TanStack Query, Socket.IO Client, Tailwind CSS |
| **Backend** | Node.js, Express.js, TypeScript, Winston Logger, Zod Validator |
| **Database** | PostgreSQL + Prisma ORM (Indexing, Repository Pattern, Seed Data) |
| **Queue & Cache** | Redis 7 + BullMQ Queue Engine |
| **Real-Time** | Socket.IO |
| **DevOps & CI** | Docker, Docker Compose, GitHub Actions |
| **Testing** | Jest + Supertest |

---

## 📂 Project Structure

```
.
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Database schema (User, RefreshToken, Task, AuditLog)
│   ├── src/
│   │   ├── config/              # Prisma & Redis singletons
│   │   ├── controllers/         # Express Controllers (Auth, Task, Dashboard)
│   │   ├── middlewares/         # Auth JWT, RBAC, Zod Validation, Multer, Error Handler
│   │   ├── queues/              # BullMQ Task Queue Producer & Worker Engine
│   │   ├── repositories/        # Repository Pattern (UserRepository, TaskRepository)
│   │   ├── routes/              # Express API Routes
│   │   ├── services/            # Business Logic & Redis Caching
│   │   ├── utils/               # Logger, SocketManager, AppError, ApiResponse
│   │   ├── app.ts               # Express application initialization
│   │   ├── server.ts            # HTTP & Socket.IO server startup
│   │   └── worker.ts            # Standalone worker entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router (Dashboard, Login, Register)
│   │   ├── components/          # Glassmorphic Navbar, TaskTable, TaskModal, Stats
│   │   ├── lib/                 # Axios API interceptors & Socket.IO client
│   │   ├── providers/           # Redux, TanStack Query, and Socket Providers
│   │   ├── store/               # Redux Toolkit Auth slice
│   │   └── styles/              # Global Glassmorphism CSS
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml           # Unified multi-container configuration
├── postman_collection.json      # Complete API test suite
├── .env.example                 # Environment variables blueprint
└── README.md
```

---

## ⚙️ Environment Variables Configuration

Both backend and frontend leverage environment variables configured in `.env` and `.env.local`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_platform_db?schema=public

# Redis Configuration (Queue & Cache)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secrets
JWT_SECRET=super-secret-access-token-key-saarthi-2026
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=super-secret-refresh-token-key-saarthi-2026
JWT_REFRESH_EXPIRES_IN=7d

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/) OR Node.js v22+ with PostgreSQL & Redis installed locally.

### Option 1: Running via Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/saarthi-task-platform.git
   cd saarthi-task-platform
   ```

2. **Launch all services via Docker Compose**:
   ```bash
   docker-compose up --build -d
   ```

3. **Access Applications**:
   - **Frontend App**: [http://localhost:3000](http://localhost:3000)
   - **Backend REST API**: [http://localhost:5000/api](http://localhost:5000/api)
   - **Prisma Studio GUI**: Run `npx prisma studio` in backend directory (`http://localhost:5555`)

---

### Option 2: Running Locally (Manual Setup)

1. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run prisma:seed
   npm run dev
   ```

3. **Frontend Setup**:
   In a separate terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🔑 Demo Login Credentials

Pre-seeded database accounts for instant testing:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Standard User** | `user@saarthi.ai` | `UserPassword123!` |
| **System Admin** | `admin@saarthi.ai` | `AdminPassword123!` |

---

## 📡 API Documentation Summary

### Authentication Endpoints
- `POST /api/auth/register`: Create a new user account.
- `POST /api/auth/login`: Authenticate user & return JWT tokens.
- `POST /api/auth/refresh-token`: Issue new access token using valid refresh token.
- `POST /api/auth/logout`: Invalidate session and refresh tokens.
- `GET /api/auth/me`: Get current authenticated user profile.

### Task Management Endpoints
- `POST /api/tasks`: Create & enqueue a new task (supports multipart form file attachment & scheduled execution).
- `GET /api/tasks`: Retrieve paginated tasks with search (`?search=`), status (`?status=`), priority (`?priority=`), and sorting (`?sortBy=createdAt&sortOrder=desc`).
- `GET /api/tasks/:id`: Get task details, execution JSON output, and failure logs.
- `PUT /api/tasks/:id`: Update task metadata.
- `POST /api/tasks/:id/retry`: Re-trigger execution for a failed or completed task.
- `DELETE /api/tasks/:id`: Delete a task.

### Dashboard & Analytics
- `GET /api/dashboard/stats`: Retrieve real-time task metrics and Redis BullMQ queue telemetry.

---

## 💡 Assumptions Made

1. **Redis Engine Availability**: Redis is running on default port `6379` to maintain BullMQ queue states and session memory.
2. **Asynchronous Execution Simulation**: Background tasks simulate execution workloads (2-4s runtime) to showcase real-time WebSocket status transitions (`PENDING` ➔ `PROCESSING` ➔ `COMPLETED`).
3. **Database Isolation**: Each task is scoped to a specific `userId`, with `ADMIN` users possessing global administrative override access.

---

## ⚖️ Architectural Trade-offs

1. **Redis Queue vs Dedicated Kafka Cluster**: BullMQ backed by Redis was selected over Apache Kafka to keep deployment lightweight while retaining exponential backoff, priority queues, and delayed job timers.
2. **WebSocket Broadcasting vs Polling**: Socket.IO was chosen for sub-second UI synchronization over short-polling to eliminate unnecessary HTTP overhead.
3. **Single Database vs CQRS Split**: PostgreSQL serves both transactional writes and analytical stats aggregations with B-Tree indexes, backed by short-lived Redis API caching to handle high throughput.

---

## 🔮 Future Improvements

1. **Multi-Tenant Workspaces**: Add tenant isolation for team collaboration and organization-level task queues.
2. **Cron Scheduler UI**: Visual recurrence editor for automated cron-scheduled tasks (`0 * * * *`).
3. **S3 / Cloud Storage Integration**: AWS S3 storage integration for persistent handling of large file attachments (> 100MB).
4. **Dead Letter Queue (DLQ) Inspector**: Visual DLQ management tool to inspect, modify, and retry permanently dead jobs.

---

## 🧪 Running Automated Tests

Run backend unit and integration test suite via Jest:

```bash
cd backend
npm test
```

---

## 📄 License & Assessment Information

Submitted for **Saarthi AI Private Limited - Full Stack Engineering Challenge**.

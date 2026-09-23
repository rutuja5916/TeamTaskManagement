# Team Task Management System

A role-based full-stack Task Management System built with **.NET 8** and **React 19**, designed for organizations to manage teams, assign tasks, track progress, collaborate through comments, and receive notifications on important task events.

> Built as an assessment project to demonstrate the ability to design, implement, secure, test, document, and deploy a production-oriented role-based application.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Assessment Objective](#assessment-objective)
- [Key Features](#key-features)
- [User Roles & Permissions](#user-roles--permissions)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Authentication & Authorization](#authentication--authorization)
- [Task Management](#task-management)
- [Team Management](#team-management)
- [Task Status Workflow](#task-status-workflow)
- [Comments & Collaboration](#comments--collaboration)
- [Notifications](#notifications)
- [Dashboard](#dashboard)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Frontend](#frontend)
- [Docker Setup](#docker-setup)
- [Testing](#testing)
- [Health Check](#health-check)
- [Swagger / API Documentation](#swagger--api-documentation)
- [Local Setup Instructions](#local-setup-instructions)
- [Configuration](#configuration)
- [Sample / Test Credentials](#sample--test-credentials)
- [Assessment Requirement Coverage](#assessment-requirement-coverage)
- [Future Improvements](#future-improvements)

---

## Project Overview

This is a full-stack web application where organizations can:

- Register users and authenticate them securely using JWT tokens.
- Create and manage teams, assigning users as team members.
- Create, assign, and track tasks with statuses, priorities, and deadlines.
- Collaborate on tasks through a comments section.
- Receive in-app notifications when tasks are assigned or their status changes.
- View a dashboard summarizing task metrics with filtering options.

The backend is built on **ASP.NET Core 8 Web API** following a clean layered architecture, and the frontend is a **React 19 SPA** bootstrapped with Vite, styled using Bootstrap 5.

---

## Assessment Objective

Demonstrate the ability to design, implement, secure, test, document, and deploy a production-oriented role-based full-stack task management application.

---

## Key Features

- JWT-based authentication with secure password hashing
- Role-based access control (Admin, Manager, User)
- Full CRUD operations for tasks, teams, and users
- Task assignment with priority levels (Low, Medium, High)
- Task status tracking (To Do → In Progress → Done)
- Task collaboration via comments
- In-app notification system (task assignment & status changes)
- Dashboard with filtering by status, priority, and deadline range
- Swagger/OpenAPI documentation with JWT support
- Dockerized multi-container setup (API + SQL Server)
- CI/CD pipeline via GitHub Actions
- Unit and integration tests using xUnit
- Global exception handling middleware
- Health check endpoint

---

## User Roles & Permissions

| Role    | Capabilities                                                                 |
|---------|-----------------------------------------------------------------------------|
| **Admin**   | Manage teams (CRUD), assign tasks, manage users (activate/deactivate, change roles), view all data |
| **Manager** | Create and assign tasks to team members, manage team membership, view teams and users |
| **User**    | View and update assigned tasks, add comments, view notifications             |

Roles are seeded into the database via EF Core data seeding:
- `Admin` (Id: 1)
- `Manager` (Id: 2)
- `User` (Id: 3)

New user registrations are assigned the **User** role by default.

---

## Technology Stack

| Layer          | Technology                                                  |
|----------------|-------------------------------------------------------------|
| Backend        | ASP.NET Core 8 Web API (.NET 8)                             |
| Frontend       | React 19 with Vite                                          |
| Database       | SQL Server (SQL Express for local dev, SQL Server 2022 for Docker) |
| ORM            | Entity Framework Core 8                                     |
| Authentication | JWT Bearer Tokens                                           |
| Password Hashing | ASP.NET Core Identity `IPasswordHasher<User>`             |
| HTTP Client    | Axios                                                       |
| UI Framework   | Bootstrap 5.3 + Bootstrap Icons                             |
| Testing        | xUnit, Microsoft.AspNetCore.Mvc.Testing, EF Core InMemory   |
| Containerization | Docker + Docker Compose                                   |
| CI/CD          | GitHub Actions                                              |
| API Docs       | Swagger / OpenAPI (Swashbuckle)                             |

---

## Architecture

The backend follows a **Clean/Layered Architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────┐
│        TeamTaskManagement.API       │  ← Presentation Layer
│   Controllers, Middleware, Program  │     (HTTP handling, DI setup)
├─────────────────────────────────────┤
│        TeamTaskManagement.Core      │  ← Domain Layer
│   Entities, DTOs, Enums, Interfaces │     (No infrastructure deps)
├─────────────────────────────────────┤
│   TeamTaskManagement.Infrastructure │  ← Persistence Layer
│   DbContext, Configurations,        │     (EF Core, Service impls)
│   Services, Migrations              │
├─────────────────────────────────────┤
│       TeamTaskManagement.Tests      │  ← Test Layer
│   Unit Tests, Integration Tests     │     (xUnit, InMemory DB)
├─────────────────────────────────────┤
│       TeamTaskManagement.Client     │  ← Frontend (React SPA)
│   Pages, Components, Services       │     (Vite, Bootstrap)
└─────────────────────────────────────┘
```

---

## Project Structure

```
TeamTaskManagement/
├── .github/
│   └── workflows/
│       └── ci.yml                          # GitHub Actions CI pipeline
├── TeamTaskManagement.API/
│   ├── Controllers/
│   │   ├── AuthController.cs               # Registration & Login
│   │   ├── TaskController.cs               # Task CRUD & status updates
│   │   ├── TeamController.cs               # Team CRUD & member management
│   │   ├── UserController.cs               # User listing & role/status mgmt
│   │   ├── CommentController.cs            # Task comments
│   │   ├── DashboardController.cs          # Dashboard metrics
│   │   ├── NotificationController.cs       # User notifications
│   │   └── TestController.cs               # Auth verification endpoints
│   ├── Middleware/
│   │   └── ExceptionHandlingMiddleware.cs  # Global error handling
│   ├── Program.cs                          # App startup & DI config
│   └── appsettings.json                    # App configuration
├── TeamTaskManagement.Core/
│   ├── DTOs/                               # Request/Response models
│   ├── Entities/
│   │   ├── User.cs
│   │   ├── Role.cs
│   │   ├── Team.cs
│   │   ├── TeamMember.cs
│   │   ├── TaskItem.cs
│   │   ├── Comment.cs
│   │   └── Notification.cs
│   ├── Enums/
│   │   ├── RoleType.cs                     # Admin, Manager, User
│   │   ├── TaskStatus.cs                   # ToDo, InProgress, Done
│   │   ├── TaskPriority.cs                 # Low, Medium, High
│   │   └── NotificationType.cs             # TaskAssigned, TaskStatusUpdated
│   └── Interfaces/                         # Service contracts
├── TeamTaskManagement.Infrastructure/
│   ├── Data/
│   │   └── ApplicationDbContext.cs         # EF Core DbContext
│   ├── Configurations/                     # Fluent API entity configs
│   │   ├── RoleConfiguration.cs            # Includes role seed data
│   │   ├── UserConfiguration.cs
│   │   ├── TeamConfiguration.cs
│   │   ├── TeamMemberConfiguration.cs
│   │   ├── TaskItemConfiguration.cs
│   │   ├── CommentConfiguration.cs
│   │   └── NotificationConfiguration.cs
│   ├── Migrations/                         # EF Core migrations
│   └── Services/
│       ├── AuthService.cs                  # Registration & login logic
│       ├── JwtTokenService.cs              # JWT generation
│       ├── TaskService.cs                  # Task business logic
│       ├── TeamService.cs                  # Team business logic
│       ├── UserService.cs                  # User administration
│       ├── CommentService.cs               # Comment management
│       ├── NotificationService.cs          # Notification generation
│       └── DashboardService.cs             # Dashboard aggregation
├── TeamTaskManagement.Tests/
│   ├── Unit/
│   │   ├── AuthServiceTests.cs
│   │   ├── TaskServiceTests.cs
│   │   └── TeamServiceTests.cs
│   └── Integration/
│       ├── AuthApiTests.cs
│       └── CustomWebApplicationFactory.cs
├── TeamTaskManagement.Client/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx          # Auth guard for routes
│   │   ├── context/
│   │   │   └── AuthContext.jsx             # Global auth state
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx              # Sidebar + topbar layout
│   │   ├── pages/
│   │   │   ├── auth/Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── dashboard/Dashboard.jsx
│   │   │   ├── tasks/Tasks.jsx
│   │   │   ├── tasks/TaskDetails.jsx
│   │   │   ├── teams/Teams.jsx
│   │   │   ├── users/Users.jsx
│   │   │   └── notifications/Notifications.jsx
│   │   ├── services/
│   │   │   ├── api.js                      # Axios instance + interceptors
│   │   │   ├── authService.js
│   │   │   ├── taskService.js
│   │   │   ├── teamService.js
│   │   │   ├── userService.js
│   │   │   ├── commentService.js
│   │   │   ├── dashboardService.js
│   │   │   └── notificationService.js
│   │   └── App.jsx                         # Root component & routing
│   └── package.json
├── Dockerfile                              # Multi-stage .NET build
├── docker-compose.yml                      # API + SQL Server containers
└── TeamTaskManagement.sln                  # .NET solution file
```

---

## Authentication & Authorization

### JWT Authentication

- Users authenticate via `POST /api/Auth/login` and receive a JWT token.
- The token contains claims for `UserId`, `Email`, and `Role`.
- Token expiration is configurable (default: 2 hours).
- Tokens are validated for issuer, audience, signing key, and lifetime with zero clock skew.

### Password Security

- Passwords are hashed using ASP.NET Core's built-in `IPasswordHasher<User>` (PBKDF2-based).
- Raw passwords are never stored.

### Role-Based Access Control (RBAC)

- Endpoints are protected using `[Authorize(Roles = "...")]` attributes.
- The frontend uses a `ProtectedRoute` component that checks authentication state before rendering protected pages.
- Teams and Users management pages are restricted to Admin and Manager roles in the frontend routing.

### Session / Token Expiration Handling

- JWT lifetime is validated server-side with `ValidateLifetime = true`.
- The frontend Axios interceptor catches `401 Unauthorized` responses, clears stored credentials from `localStorage`, and redirects to the login page.

---

## Task Management

- **Create**: Admins and Managers can create tasks with a title, description, team, assignee, priority, and deadline.
- **View**: All authenticated users can view tasks (scoped by role and team membership).
- **Update**: Admins and Managers can update task details.
- **Status Update**: All roles (Admin, Manager, User) can update a task's status.
- **Delete**: Admins and Managers can delete tasks.
- **Filtering**: Tasks can be filtered by deadline, status, and priority via query parameters.

---

## Team Management

- **Create Team**: Admin only.
- **Update / Delete Team**: Admin only.
- **View Teams**: Admins and Managers.
- **View Team Details**: Admin, Manager, and User.
- **Add Members**: Admins and Managers can add users to a team.
- **View Members**: All authenticated roles can view team members.

---

## Task Status Workflow

Tasks follow a defined status lifecycle:

```
┌──────────┐      ┌──────────────┐      ┌──────────┐
│   To Do  │ ───► │ In Progress  │ ───► │   Done   │
│  (1)     │      │   (2)        │      │   (3)    │
└──────────┘      └──────────────┘      └──────────┘
```

Status updates are available to all roles (Admin, Manager, User), and each status change triggers a notification to the assigned user.

---

## Comments & Collaboration

- Users can add comments to any task they have access to via `POST /api/Task/{taskId}/comments`.
- All comments for a task can be retrieved via `GET /api/Task/{taskId}/comments`.
- Users can delete their own comments via `DELETE /api/Comment/{id}`.
- The Task Details page in the frontend provides a real-time comment thread interface.

---

## Notifications

The system uses an **in-app database-backed notification system**. Notifications are automatically created when:

| Event                | Notification Type     |
|----------------------|-----------------------|
| Task is assigned     | `TaskAssigned` (1)    |
| Task status changes  | `TaskStatusUpdated` (2) |

- Notifications are persisted in the `Notifications` table.
- Users can view their notifications via `GET /api/Notification`.
- Notifications can be marked as read via `PUT /api/Notification/{id}/read`.
- A dedicated Notifications page is available in the frontend UI.

> **Note**: Email notifications are not implemented. The system uses mock/in-app notifications as per the assessment's alternative option.

---

## Dashboard

The dashboard provides an overview of task metrics based on the authenticated user's role:

- **Total Tasks** count
- **Pending Tasks** (To Do + In Progress) count
- **Completed Tasks** (Done) count
- **Total Teams** count
- **Task Status Breakdown** (To Do / In Progress / Done)

### Filtering

The dashboard supports client-side filtering by:
- **Status** (To Do, In Progress, Done)
- **Priority** (Low, Medium, High)
- **Deadline Range** (From date / To date)

---

## API Endpoints

### Authentication

| Method | Endpoint               | Auth | Description          |
|--------|------------------------|------|----------------------|
| POST   | `/api/Auth/register`   | No   | Register a new user  |
| POST   | `/api/Auth/login`      | No   | Login & get JWT      |

### Tasks

| Method | Endpoint                    | Roles               | Description            |
|--------|-----------------------------|----------------------|------------------------|
| POST   | `/api/Task`                 | Admin, Manager       | Create a task          |
| GET    | `/api/Task`                 | Admin, Manager, User | List tasks (filterable)|
| GET    | `/api/Task/{id}`            | Admin, Manager, User | Get task by ID         |
| PUT    | `/api/Task/{id}`            | Admin, Manager       | Update a task          |
| PUT    | `/api/Task/{id}/status`     | Admin, Manager, User | Update task status     |
| DELETE | `/api/Task/{id}`            | Admin, Manager       | Delete a task          |

### Teams

| Method | Endpoint                     | Roles               | Description              |
|--------|------------------------------|----------------------|--------------------------|
| POST   | `/api/Team`                  | Admin                | Create a team            |
| GET    | `/api/Team`                  | Admin, Manager       | List all teams           |
| GET    | `/api/Team/{id}`             | Admin, Manager, User | Get team by ID           |
| PUT    | `/api/Team/{id}`             | Admin                | Update a team            |
| DELETE | `/api/Team/{id}`             | Admin                | Delete a team            |
| POST   | `/api/Team/{id}/members`     | Admin, Manager       | Add member to team       |
| GET    | `/api/Team/{id}/members`     | Admin, Manager, User | List team members        |

### Users

| Method | Endpoint                     | Roles          | Description              |
|--------|------------------------------|----------------|--------------------------|
| GET    | `/api/User`                  | Admin, Manager | List all users           |
| GET    | `/api/User/{id}`             | Admin, Manager | Get user by ID           |
| PUT    | `/api/User/{id}/status`      | Admin          | Activate/deactivate user |
| PUT    | `/api/User/{id}/role`        | Admin          | Change user role         |

### Comments

| Method | Endpoint                            | Roles               | Description             |
|--------|-------------------------------------|----------------------|-------------------------|
| POST   | `/api/Task/{taskId}/comments`       | Admin, Manager, User | Add comment to task     |
| GET    | `/api/Task/{taskId}/comments`       | Admin, Manager, User | Get task comments       |
| DELETE | `/api/Comment/{id}`                 | Admin, Manager, User | Delete a comment        |

### Dashboard

| Method | Endpoint           | Roles               | Description               |
|--------|--------------------|----------------------|---------------------------|
| GET    | `/api/Dashboard`   | Admin, Manager, User | Get dashboard metrics     |

### Notifications

| Method | Endpoint                        | Roles               | Description             |
|--------|---------------------------------|----------------------|-------------------------|
| GET    | `/api/Notification`             | Authenticated        | Get user notifications  |
| PUT    | `/api/Notification/{id}/read`   | Authenticated        | Mark as read            |

### Health & Test

| Method | Endpoint            | Auth | Description              |
|--------|---------------------|------|--------------------------|
| GET    | `/health`           | No   | Health check endpoint    |
| GET    | `/api/Test/public`  | No   | Public test endpoint     |
| GET    | `/api/Test/protected` | Yes | Auth verification        |
| GET    | `/api/Test/admin`   | Admin | Admin role test         |
| GET    | `/api/Test/manager` | Manager | Manager role test     |
| GET    | `/api/Test/user`    | User  | User role test          |

---

## Database

### Database Provider

- **Local development**: SQL Server Express (LocalDB)
- **Docker**: SQL Server 2022 (Linux container)

### Entity Relationship Overview

```
┌──────────┐       ┌────────────┐       ┌──────────┐
│   Role   │1────*│    User     │*────1 │  Team    │
│          │       │             │       │(CreatedBy)│
└──────────┘       └──────┬──────┘       └─────┬────┘
                          │                     │
                   ┌──────┴──────┐        ┌─────┴──────┐
                   │ TeamMember  │        │  TaskItem  │
                   │(UserId,     │        │(AssignedTo,│
                   │ TeamId)     │        │ TeamId)    │
                   └─────────────┘        └─────┬──────┘
                                                │
                                   ┌────────────┼────────────┐
                                   │            │            │
                              ┌────┴───┐  ┌─────┴─────┐     │
                              │Comment │  │Notification│     │
                              │(TaskId,│  │(TaskId,    │     │
                              │ UserId)│  │ UserId)    │     │
                              └────────┘  └───────────┘     │
```

### Entities

| Entity       | Key Fields                                                             |
|--------------|------------------------------------------------------------------------|
| User         | Id, FirstName, LastName, Email, PasswordHash, RoleId, IsActive         |
| Role         | Id, Name (Admin/Manager/User) — seeded                                 |
| Team         | Id, Name, Description, CreatedBy                                       |
| TeamMember   | Id, TeamId, UserId, JoinedAt                                           |
| TaskItem     | Id, Title, Description, TeamId, AssignedTo, AssignedBy, Status, Priority, Deadline |
| Comment      | Id, TaskId, UserId, Content, CreatedAt                                 |
| Notification | Id, UserId, TaskId, Type, Message, IsRead, CreatedAt                   |

### EF Core Configuration

- Entity configurations use Fluent API via `IEntityTypeConfiguration<T>` classes.
- All configurations are auto-discovered via `ApplyConfigurationsFromAssembly()`.
- Roles are seeded using `HasData()` in `RoleConfiguration.cs`.
- Migrations are stored in `Infrastructure/Migrations/`.

---

## Frontend

### Technology

- **React 19** bootstrapped with **Vite**
- **React Router v7** for client-side routing
- **Axios** for HTTP requests with request/response interceptors
- **Bootstrap 5.3** + **Bootstrap Icons** for responsive UI
- **React Context API** for global authentication state

### Pages

| Page           | Route             | Access                | Description                        |
|----------------|-------------------|-----------------------|------------------------------------|
| Login          | `/login`          | Public                | User authentication                |
| Register       | `/register`       | Public                | New user registration              |
| Dashboard      | `/dashboard`      | All authenticated     | Task overview with filters         |
| Tasks          | `/tasks`          | All authenticated     | Task listing and management        |
| Task Details   | `/tasks/:id`      | All authenticated     | Detailed view, comments, status    |
| Teams          | `/teams`          | Admin, Manager        | Team CRUD and member management    |
| Users          | `/users`          | Admin, Manager        | User management                    |
| Notifications  | `/notifications`  | All authenticated     | View and manage notifications      |

### Key Frontend Features

- **Protected Routes**: `ProtectedRoute` component wraps all authenticated routes.
- **Responsive Layout**: `MainLayout` provides a sidebar + topbar structure.
- **Token Management**: JWT is stored in `localStorage` and automatically injected into API requests via Axios interceptors.
- **Auto-logout**: 401 responses trigger automatic credential clearing and redirect to login.
- **Error Display**: API errors are shown using Bootstrap alert components.

---

## Docker Setup

### Architecture

The Docker setup uses a multi-container architecture with Docker Compose:

1. **`sqlserver`** — SQL Server 2022 container with persistent data volume.
2. **`api`** — .NET 8 API built via multi-stage Dockerfile.

### Dockerfile

Uses a multi-stage build:
- **Build stage**: `mcr.microsoft.com/dotnet/sdk:8.0` — restores, builds, and publishes the API.
- **Runtime stage**: `mcr.microsoft.com/dotnet/aspnet:8.0` — runs the published DLL on port 8080.

### Running with Docker

```bash
# Build the API image
docker build -t teamtaskmanagement-api:latest .

# Start all containers
docker-compose up -d
```

The API will be available at `http://localhost:8080`.

> **Note**: The Docker setup currently containerizes the backend API and SQL Server. The React frontend is not included in the Docker Compose configuration and runs separately via Vite's dev server.

---

## Testing

### Test Framework

- **xUnit** for unit and integration testing
- **Microsoft.AspNetCore.Mvc.Testing** for integration test hosting
- **EF Core InMemory** provider for isolated database testing
- **Coverlet** for code coverage collection

### Test Coverage

| Test Type    | File                              | What It Tests                           |
|--------------|-----------------------------------|-----------------------------------------|
| Unit         | `AuthServiceTests.cs`             | Registration and login logic            |
| Unit         | `TaskServiceTests.cs`             | Task CRUD and business rules            |
| Unit         | `TeamServiceTests.cs`             | Team management operations              |
| Integration  | `AuthApiTests.cs`                 | End-to-end auth API request flows       |
| Integration  | `CustomWebApplicationFactory.cs`  | Test server setup with InMemory DB      |

### Running Tests

```bash
dotnet test TeamTaskManagement.sln
```

---

## Health Check

A health check endpoint is configured and available at:

```
GET /health
```

Returns `200 OK` with `Healthy` when the API is running.

---

## Swagger / API Documentation

Swagger UI is available in **Development** mode at:

```
GET /swagger
```

### Features

- Full OpenAPI specification for all endpoints.
- JWT Bearer token authentication support built into the Swagger UI — click "Authorize" and paste a valid JWT token to test protected endpoints.
- Security definitions configured with `Bearer` scheme.

---

## Local Setup Instructions

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18+)
- [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) or SQL Server (LocalDB)

### Backend Setup

```bash
# 1. Navigate to the solution root
cd TeamTaskManagement

# 2. Restore NuGet packages
dotnet restore

# 3. Apply database migrations
dotnet ef database update --project TeamTaskManagement.Infrastructure --startup-project TeamTaskManagement.API

# 4. Run the API
dotnet run --project TeamTaskManagement.API
```

The API will start at `https://localhost:5001` (or the port configured in `launchSettings.json`).

### Frontend Setup

```bash
# 1. Navigate to the client project
cd TeamTaskManagement.Client

# 2. Install dependencies
npm install

# 3. Create a .env file (if not present)
echo VITE_API_BASE_URL=https://localhost:5001/api > .env

# 4. Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Configuration

Configuration is managed through `appsettings.json` and environment variables.

| Setting                              | Description                                    |
|--------------------------------------|------------------------------------------------|
| `ConnectionStrings:DefaultConnection`| SQL Server connection string                   |
| `Jwt:Key`                            | Secret key for signing JWT tokens              |
| `Jwt:Issuer`                         | JWT issuer (default: `TeamTaskManagement.API`) |
| `Jwt:Audience`                       | JWT audience (default: `TeamTaskManagement.Client`) |
| `Jwt:ExpirationInHours`             | Token validity period (default: 2 hours)       |

For Docker deployments, these values are overridden via environment variables in `docker-compose.yml`.

> **Important**: Always change the default JWT secret key in production environments.

---

## Sample / Test Credentials

There are no hardcoded user accounts seeded into the database. To get started:

1. **Register a new user** via `POST /api/Auth/register` or the Register page in the frontend.
2. All new registrations are assigned the **User** role by default.
3. To create an Admin or Manager account:
   - Register a user normally.
   - Directly update the `RoleId` in the database (`1` = Admin, `2` = Manager, `3` = User).
   - Alternatively, once an Admin account exists, use `PUT /api/User/{id}/role` to promote other users.

---

## Assessment Requirement Coverage

| Requirement                  | Status             | Implementation Details                                                                                       |
|------------------------------|--------------------|--------------------------------------------------------------------------------------------------------------|
| JWT Authentication           | ✅ Implemented     | JWT Bearer tokens with configurable expiration, issuer/audience validation, and zero clock skew.              |
| Secure Password Hashing      | ✅ Implemented     | ASP.NET Core `IPasswordHasher<User>` (PBKDF2-based hashing).                                                |
| Token Expiration Handling    | ✅ Implemented     | Server-side lifetime validation + frontend 401 interceptor with auto-logout.                                 |
| Role-Based Access Control    | ✅ Implemented     | Three roles (Admin, Manager, User) with `[Authorize(Roles)]` on all endpoints. Frontend route guards.        |
| User Registration & Login    | ✅ Implemented     | Full registration with validation, login returns JWT + user info.                                            |
| Task CRUD & Assignment       | ✅ Implemented     | Create, read, update, delete tasks. Assignment with team, user, priority, and deadline.                      |
| Task Statuses (ToDo/InProgress/Done) | ✅ Implemented | Enum-based statuses with dedicated status update endpoint.                                                   |
| Team Management              | ✅ Implemented     | Team CRUD, member assignment/listing. Admin creates teams, Admin/Manager manage members.                     |
| Comments / Collaboration     | ✅ Implemented     | Add, view, delete comments per task. Frontend task detail page with comment thread.                          |
| Notifications                | ✅ Implemented     | In-app database-backed notifications for task assignment and status changes. Mark-as-read support.           |
| Dashboard                    | ✅ Implemented     | Task metrics overview with filtering by status, priority, and deadline range.                                |
| .NET Backend (Bonus)         | ✅ Implemented     | Built with ASP.NET Core 8 (.NET implementation is considered a bonus per assessment).                        |
| REST API Design              | ✅ Implemented     | RESTful endpoints with proper auth, authorization, validation, and structured error responses.               |
| SQL Server Database          | ✅ Implemented     | SQL Server with EF Core, Fluent API configurations, and migrations.                                          |
| Entity Framework Core        | ✅ Implemented     | EF Core 8 with DbContext, entity configurations, data seeding, and migrations.                               |
| React Frontend               | ✅ Implemented     | React 19 SPA with Vite, React Router v7, Axios, and Bootstrap 5.                                            |
| Clean & Responsive UI        | ✅ Implemented     | Bootstrap 5.3 responsive grid, sidebar layout, Bootstrap Icons, alert-based error handling.                  |
| Docker Setup (Bonus)         | ✅ Implemented     | Multi-stage Dockerfile + Docker Compose with SQL Server and API containers.                                  |
| Unit Tests (Bonus)           | ✅ Implemented     | xUnit unit tests for AuthService, TaskService, and TeamService.                                              |
| Integration Tests (Bonus)    | ✅ Implemented     | Integration tests using `WebApplicationFactory` with EF Core InMemory provider.                              |
| Swagger Documentation (Bonus)| ✅ Implemented     | Swagger/OpenAPI with JWT Bearer security definition in Swagger UI.                                           |
| CI/CD (Bonus)                | ✅ Implemented     | GitHub Actions workflow: checkout → setup .NET 8 → restore → build → test (on push/PR to main/master).      |
| Deployment (Bonus)           | ❌ Not Implemented | No live deployment to Render, Railway, Netlify, or Vercel is configured.                                     |
| Email Notifications          | ❌ Not Implemented | Uses in-app (mock) notifications instead of email integration.                                               |

---

## Future Improvements

- **Email Notifications**: Integrate an SMTP provider or SendGrid for real email delivery on task events.
- **Live Deployment**: Deploy the backend to Azure App Service or Railway, and the frontend to Vercel or Netlify.
- **Frontend Dockerization**: Add the React client to the Docker Compose setup with an Nginx container.
- **Real-time Updates**: Add SignalR for live notifications and task status updates.
- **Pagination**: Add server-side pagination for task and user listing endpoints.
- **Password Reset**: Implement a forgot-password / reset-password flow.
- **Audit Logging**: Track all CRUD operations with timestamps and user references.
- **File Attachments**: Allow users to attach files to tasks.
- **Search**: Add full-text search across tasks, comments, and teams.

---

## License

This project was developed as part of a technical assessment.

# API Documentation — Team Task Management System

This document covers all the REST API endpoints available in the Team Task Management backend. The API is built using ASP.NET Core 8 and follows standard REST conventions. All protected routes require a valid JWT token in the `Authorization` header.

**Base URL**: `https://localhost:7209/api` (local dev) or `http://localhost:8080/api` (Docker)

---

## Table of Contents

- [Authentication](#authentication)
- [How to Use the Token](#how-to-use-the-token)
- [Error Response Format](#error-response-format)
- [Auth Endpoints](#auth-endpoints)
- [Task Endpoints](#task-endpoints)
- [Team Endpoints](#team-endpoints)
- [User Endpoints](#user-endpoints)
- [Comment Endpoints](#comment-endpoints)
- [Dashboard Endpoints](#dashboard-endpoints)
- [Notification Endpoints](#notification-endpoints)
- [Health & Test Endpoints](#health--test-endpoints)
- [Enums Reference](#enums-reference)

---

## Authentication

The API uses **JWT Bearer Token** authentication. You get a token by logging in, and then you send that token with every subsequent request.

### How to Use the Token

After a successful login, include the token in the `Authorization` header like this:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens expire after **2 hours** by default. Once expired, you'll get a `401 Unauthorized` response and need to log in again.

---

## Error Response Format

All errors follow a consistent JSON structure:

```json
{
  "statusCode": 400,
  "message": "Validation failed.",
  "errors": {
    "Email": ["The Email field is required."],
    "Password": ["The Password field is required."]
  }
}
```

For non-validation errors (404, 403, 500), the response looks like:

```json
{
  "statusCode": 404,
  "message": "Task not found."
}
```

### Common HTTP Status Codes

| Code | Meaning                                              |
|------|------------------------------------------------------|
| 200  | Success                                              |
| 201  | Created (resource was successfully created)          |
| 204  | No Content (successful deletion)                     |
| 400  | Bad Request (validation errors or invalid operation) |
| 401  | Unauthorized (missing or expired token)              |
| 403  | Forbidden (valid token but insufficient role)        |
| 404  | Not Found (resource doesn't exist)                   |
| 500  | Internal Server Error                                |

---

## Auth Endpoints

### Register a New User

Creates a new user account. All new users are assigned the **User** role by default.

```
POST /api/Auth/register
```

**Auth Required**: No

**Request Body**:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "MySecurePass123"
}
```

| Field       | Type   | Required | Validation               |
|-------------|--------|----------|--------------------------|
| firstName   | string | Yes      | Max 50 characters        |
| lastName    | string | Yes      | Max 50 characters        |
| email       | string | Yes      | Valid email, max 150 chars|
| password    | string | Yes      | Min 8 characters         |

**Success Response** (`200 OK`):

```json
{
  "userId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "User",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2025-01-15T14:30:00Z"
}
```

**Error Responses**:
- `400` — Email already exists or validation failed

---

### Login

Authenticates a user and returns a JWT token.

```
POST /api/Auth/login
```

**Auth Required**: No

**Request Body**:

```json
{
  "email": "john.doe@example.com",
  "password": "MySecurePass123"
}
```

| Field    | Type   | Required | Validation    |
|----------|--------|----------|---------------|
| email    | string | Yes      | Valid email    |
| password | string | Yes      | —             |

**Success Response** (`200 OK`):

```json
{
  "userId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "Admin",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2025-01-15T14:30:00Z"
}
```

**Error Responses**:
- `403` — Invalid email or password, or account is deactivated

---

## Task Endpoints

### Create a Task

```
POST /api/Task
```

**Auth Required**: Yes — `Admin`, `Manager`

**Request Body**:

```json
{
  "title": "Design login page",
  "description": "Create the login page UI with form validation",
  "teamId": 1,
  "assignedTo": 3,
  "status": 1,
  "priority": 2,
  "deadline": "2025-02-15T00:00:00Z"
}
```

| Field       | Type     | Required | Validation          | Notes                        |
|-------------|----------|----------|---------------------|------------------------------|
| title       | string   | Yes      | Max 200 chars       |                              |
| description | string   | No       | Max 2000 chars      |                              |
| teamId      | int      | Yes      | —                   | Must be a valid team ID      |
| assignedTo  | int      | Yes      | —                   | Must be a valid user ID      |
| status      | int      | No       | 1-3                 | Defaults to `1` (ToDo)       |
| priority    | int      | Yes      | 1-3                 | See [Enums](#enums-reference)|
| deadline    | datetime | Yes      | —                   | ISO 8601 format              |

**Success Response** (`201 Created`):

```json
{
  "id": 1,
  "title": "Design login page",
  "description": "Create the login page UI with form validation",
  "teamId": 1,
  "teamName": "Frontend Team",
  "assignedTo": 3,
  "assignedToName": "Jane Smith",
  "assignedBy": 1,
  "assignedByName": "John Doe",
  "status": 1,
  "priority": 2,
  "deadline": "2025-02-15T00:00:00Z",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": null
}
```

**Error Responses**:
- `400` — Validation failed
- `404` — Team or user not found

> A notification of type `TaskAssigned` is automatically created for the assigned user.

---

### Get All Tasks (with Filters)

```
GET /api/Task
```

**Auth Required**: Yes — `Admin`, `Manager`, `User`

**Query Parameters** (all optional):

| Parameter    | Type     | Description                              |
|-------------|----------|------------------------------------------|
| status      | int      | Filter by status (1=ToDo, 2=InProgress, 3=Done) |
| priority    | int      | Filter by priority (1=Low, 2=Medium, 3=High) |
| deadlineFrom| datetime | Filter tasks with deadline on or after this date |
| deadlineTo  | datetime | Filter tasks with deadline on or before this date |
| assignedTo  | int      | Filter by assigned user ID               |
| teamId      | int      | Filter by team ID                        |

**Example**:

```
GET /api/Task?status=1&priority=3&teamId=2
```

**Success Response** (`200 OK`):

```json
[
  {
    "id": 1,
    "title": "Design login page",
    "description": "Create the login page UI",
    "teamId": 2,
    "teamName": "Frontend Team",
    "assignedTo": 3,
    "assignedToName": "Jane Smith",
    "assignedBy": 1,
    "assignedByName": "John Doe",
    "status": 1,
    "priority": 3,
    "deadline": "2025-02-15T00:00:00Z",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": null
  }
]
```

---

### Get Task by ID

```
GET /api/Task/{id}
```

**Auth Required**: Yes — `Admin`, `Manager`, `User`

**Success Response** (`200 OK`): Returns a single `TaskResponse` object.

**Error Responses**:
- `404` — Task not found

---

### Update a Task

```
PUT /api/Task/{id}
```

**Auth Required**: Yes — `Admin`, `Manager`

**Request Body**:

```json
{
  "title": "Design login page - Updated",
  "description": "Updated description with new requirements",
  "assignedTo": 4,
  "priority": 3,
  "deadline": "2025-03-01T00:00:00Z"
}
```

| Field       | Type     | Required | Validation     |
|-------------|----------|----------|----------------|
| title       | string   | Yes      | Max 200 chars  |
| description | string   | No       | Max 2000 chars |
| assignedTo  | int      | Yes      | Valid user ID  |
| priority    | int      | Yes      | 1-3            |
| deadline    | datetime | Yes      | ISO 8601       |

**Success Response** (`200 OK`): Returns the updated `TaskResponse`.

**Error Responses**:
- `400` — Validation failed
- `403` — Not authorized to update this task
- `404` — Task not found

---

### Update Task Status

```
PUT /api/Task/{id}/status
```

**Auth Required**: Yes — `Admin`, `Manager`, `User`

**Request Body**:

```json
{
  "status": 2
}
```

| Field  | Type | Required | Values                              |
|--------|------|----------|-------------------------------------|
| status | int  | Yes      | 1 (ToDo), 2 (InProgress), 3 (Done) |

**Success Response** (`200 OK`):

```json
{
  "message": "Task status updated successfully."
}
```

**Error Responses**:
- `403` — Not authorized
- `404` — Task not found

> A notification of type `TaskStatusUpdated` is automatically created for the assigned user.

---

### Delete a Task

```
DELETE /api/Task/{id}
```

**Auth Required**: Yes — `Admin`, `Manager`

**Success Response** (`200 OK`):

```json
{
  "message": "Task deleted successfully."
}
```

**Error Responses**:
- `403` — Not authorized
- `404` — Task not found

---

## Team Endpoints

### Create a Team

```
POST /api/Team
```

**Auth Required**: Yes — `Admin`

**Request Body**:

```json
{
  "name": "Backend Team",
  "description": "Handles all server-side development"
}
```

| Field       | Type   | Required | Validation    |
|-------------|--------|----------|---------------|
| name        | string | Yes      | Max 100 chars |
| description | string | No       | Max 500 chars |

**Success Response** (`201 Created`):

```json
{
  "id": 1,
  "name": "Backend Team",
  "description": "Handles all server-side development",
  "createdBy": 1,
  "createdByName": "John Doe",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z",
  "memberCount": 0
}
```

**Error Responses**:
- `400` — Validation failed

---

### Get All Teams

```
GET /api/Team
```

**Auth Required**: Yes — `Admin`, `Manager`

**Success Response** (`200 OK`): Returns an array of `TeamResponse` objects.

---

### Get Team by ID

```
GET /api/Team/{id}
```

**Auth Required**: Yes — `Admin`, `Manager`, `User`

**Success Response** (`200 OK`): Returns a single `TeamResponse` object.

**Error Responses**:
- `404` — Team not found

---

### Update a Team

```
PUT /api/Team/{id}
```

**Auth Required**: Yes — `Admin`

**Request Body**:

```json
{
  "name": "Backend Team - Renamed",
  "description": "Updated description"
}
```

| Field       | Type   | Required | Validation    |
|-------------|--------|----------|---------------|
| name        | string | Yes      | Max 100 chars |
| description | string | No       | Max 500 chars |

**Success Response** (`200 OK`): Returns the updated `TeamResponse`.

**Error Responses**:
- `400` — Validation failed
- `404` — Team not found

---

### Delete a Team

```
DELETE /api/Team/{id}
```

**Auth Required**: Yes — `Admin`

**Success Response** (`204 No Content`)

**Error Responses**:
- `400` — Team has dependencies
- `404` — Team not found

---

### Add Member to Team

```
POST /api/Team/{id}/members
```

**Auth Required**: Yes — `Admin`, `Manager`

**Request Body**:

```json
{
  "userId": 5
}
```

| Field  | Type | Required | Notes              |
|--------|------|----------|--------------------|
| userId | int  | Yes      | Must be a valid user ID |

**Success Response** (`200 OK`):

```json
{
  "message": "User added to team successfully."
}
```

**Error Responses**:
- `400` — User already in team or invalid request
- `404` — Team or user not found

---

### Get Team Members

```
GET /api/Team/{id}/members
```

**Auth Required**: Yes — `Admin`, `Manager`, `User`

**Success Response** (`200 OK`):

```json
[
  {
    "userId": 3,
    "fullName": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "User",
    "joinedAt": "2025-01-15T10:30:00Z"
  }
]
```

**Error Responses**:
- `404` — Team not found

---

## User Endpoints

### Get All Users

```
GET /api/User
```

**Auth Required**: Yes — `Admin`, `Manager`

**Success Response** (`200 OK`):

```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "roleId": 1,
    "role": "Admin",
    "isActive": true,
    "createdAt": "2025-01-10T08:00:00Z"
  }
]
```

---

### Get User by ID

```
GET /api/User/{id}
```

**Auth Required**: Yes — `Admin`, `Manager`

**Success Response** (`200 OK`): Returns a single `UserResponse` object.

**Error Responses**:
- `404` — User not found

---

### Update User Status (Activate/Deactivate)

```
PUT /api/User/{id}/status
```

**Auth Required**: Yes — `Admin`

**Request Body**:

```json
{
  "isActive": false
}
```

| Field    | Type | Required | Notes                              |
|----------|------|----------|------------------------------------|
| isActive | bool | Yes      | `true` to activate, `false` to deactivate |

**Success Response** (`200 OK`):

```json
{
  "message": "User status updated successfully."
}
```

**Error Responses**:
- `404` — User not found

> Deactivated users cannot log in.

---

### Update User Role

```
PUT /api/User/{id}/role
```

**Auth Required**: Yes — `Admin`

**Request Body**:

```json
{
  "roleId": 2
}
```

| Field  | Type | Required | Values                           |
|--------|------|----------|----------------------------------|
| roleId | int  | Yes      | 1 (Admin), 2 (Manager), 3 (User)|

**Success Response** (`200 OK`):

```json
{
  "message": "User role updated successfully."
}
```

**Error Responses**:
- `404` — User not found

---

## Comment Endpoints

### Add Comment to a Task

```
POST /api/Task/{taskId}/comments
```

**Auth Required**: Yes — `Admin`, `Manager`, `User`

**Request Body**:

```json
{
  "content": "I've started working on the UI mockups."
}
```

| Field   | Type   | Required | Validation     |
|---------|--------|----------|----------------|
| content | string | Yes      | Max 2000 chars |

**Success Response** (`200 OK`):

```json
{
  "id": 1,
  "taskId": 5,
  "userId": 3,
  "userName": "Jane Smith",
  "content": "I've started working on the UI mockups.",
  "createdAt": "2025-01-15T11:00:00Z",
  "updatedAt": "2025-01-15T11:00:00Z"
}
```

**Error Responses**:
- `404` — Task not found

---

### Get Comments for a Task

```
GET /api/Task/{taskId}/comments
```

**Auth Required**: Yes — `Admin`, `Manager`, `User`

**Success Response** (`200 OK`): Returns an array of `CommentResponse` objects.

**Error Responses**:
- `403` — Not authorized to view comments on this task
- `404` — Task not found

---

### Delete a Comment

```
DELETE /api/Comment/{id}
```

**Auth Required**: Yes — `Admin`, `Manager`, `User`

**Success Response** (`200 OK`):

```json
{
  "message": "Comment deleted successfully."
}
```

**Error Responses**:
- `403` — Can only delete your own comments
- `404` — Comment not found

---

## Dashboard Endpoints

### Get Dashboard Metrics

```
GET /api/Dashboard
```

**Auth Required**: Yes — `Admin`, `Manager`, `User`

Returns aggregated task and team statistics based on the current user's role. Admins see everything, Managers see their teams, Users see only their assigned tasks.

**Success Response** (`200 OK`):

```json
{
  "totalTasks": 25,
  "totalUsers": 10,
  "totalTeams": 3,
  "pendingTasks": 15,
  "completedTasks": 10,
  "statusSummary": {
    "toDo": 8,
    "inProgress": 7,
    "done": 10,
    "total": 25
  }
}
```

**Error Responses**:
- `401` — Unauthorized

---

## Notification Endpoints

### Get My Notifications

```
GET /api/Notification
```

**Auth Required**: Yes (any authenticated user)

Returns all notifications for the currently logged-in user.

**Success Response** (`200 OK`):

```json
[
  {
    "id": 1,
    "taskId": 5,
    "type": 1,
    "message": "You have been assigned a new task: Design login page",
    "isRead": false,
    "createdAt": "2025-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "taskId": 5,
    "type": 2,
    "message": "Task 'Design login page' status changed to InProgress",
    "isRead": true,
    "createdAt": "2025-01-16T09:00:00Z"
  }
]
```

---

### Mark Notification as Read

```
PUT /api/Notification/{id}/read
```

**Auth Required**: Yes (any authenticated user)

**Success Response** (`200 OK`):

```json
{
  "message": "Notification marked as read."
}
```

**Error Responses**:
- `404` — Notification not found

---

## Health & Test Endpoints

These are utility endpoints mainly used during development to verify that the API and auth system are working correctly.

| Method | Endpoint             | Auth Required | Role Required | Description               |
|--------|----------------------|---------------|---------------|---------------------------|
| GET    | `/health`            | No            | —             | Returns `Healthy` if API is up |
| GET    | `/api/Test/public`   | No            | —             | Public endpoint check     |
| GET    | `/api/Test/protected`| Yes           | Any           | Verify token works        |
| GET    | `/api/Test/admin`    | Yes           | Admin         | Verify Admin role access  |
| GET    | `/api/Test/manager`  | Yes           | Manager       | Verify Manager role access|
| GET    | `/api/Test/user`     | Yes           | User          | Verify User role access   |

---

## Enums Reference

### Task Status

| Value | Name       | Description                 |
|-------|------------|-----------------------------|
| 1     | ToDo       | Task hasn't been started    |
| 2     | InProgress | Task is currently being worked on |
| 3     | Done       | Task is completed           |

### Task Priority

| Value | Name   | Description     |
|-------|--------|-----------------|
| 1     | Low    | Low priority    |
| 2     | Medium | Medium priority |
| 3     | High   | High priority   |

### Notification Type

| Value | Name              | Triggered When              |
|-------|-------------------|-----------------------------|
| 1     | TaskAssigned      | A task is assigned to a user|
| 2     | TaskStatusUpdated | A task's status is changed  |

### Role Type

| Value | Name    |
|-------|---------|
| 1     | Admin   |
| 2     | Manager |
| 3     | User    |

---

## Swagger UI

If you're running the API in **Development** mode, Swagger is available at:

```
https://localhost:5001/swagger
```

You can test all the endpoints directly from the browser. To authenticate:

1. Call the **Login** endpoint to get a token.
2. Click the **Authorize** button (🔒) at the top of the Swagger page.
3. Enter: `Bearer <your-token>` in the value field.
4. Click **Authorize** — now all subsequent requests will include the token.

---

## Quick Start Example

Here's a quick walkthrough to get started with the API:

```bash
# 1. Register a new user
curl -X POST https://localhost:5001/api/Auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Password123"
  }'

# 2. Login (copy the token from the response)
curl -X POST https://localhost:5001/api/Auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'

# 3. Use the token to access protected endpoints
curl -X GET https://localhost:5001/api/Dashboard \
  -H "Authorization: Bearer <paste-your-token-here>"
```

> **Note**: New users are registered with the `User` role. To access admin features, you'll need to manually update the role in the database or use an existing admin account to promote the user via `PUT /api/User/{id}/role`.

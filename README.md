Home Library Service
Task 3 — Logging, Error Handling, Authentication & Authorization (JWT)

This task extends the existing REST service with logging, global error handling, and authentication & authorization using JWT.

The implementation strictly follows the task requirements and keeps existing functionality intact.

What Was Implemented
1. Logging & Error Handling
  - Custom Logging Service
  - Logging Middleware
  - Global Exception Filter
  - Process-level Error Handling

2. Authentication & Authorization (JWT)
- Password Handling
- Auth Endpoints
    Signup
          POST /auth/signup
    Request body:
          {
            "login": "string",
            "password": "string"
          }
    Responses:
          201 Created — user created
          400 Bad Request — invalid DTO
          409 Conflict — login already exists

    Login
          POST /auth/login

    Request body:
          {
            "login": "string",
            "password": "string"
          }   
    Response:
          {
            "accessToken": "...",
            "refreshToken": "..."
          }

    Responses:
            200 OK — tokens issued
            400 Bad Request — invalid DTO
            403 Forbidden — authentication failed
    Refresh
            POST /auth/refresh

    Request body:
            {
              "refreshToken": "string"
            }
    Responses:
            200 OK — new access & refresh tokens
            401 Unauthorized — refreshToken missing
            403 Forbidden — invalid or expired refresh token

JWT Configuration

JWT secrets and expiration times are stored in .env:

            JWT_ACCESS_SECRET=access_secret_123
            JWT_REFRESH_SECRET=refresh_secret_456

            JWT_ACCESS_EXPIRES_IN=60s
            JWT_REFRESH_EXPIRES_IN=7d

Authorization Guard
A global JwtAuthGuard is applied.

Behavior:

  All routes are protected except:

        /
        /doc
        /auth/signup
        /auth/login
        /auth/refresh

  Authorization header must follow Bearer scheme:

        Authorization: Bearer <access_token>


  If token is:

        missing
        malformed
        expired
        invalid
        → request is blocked with 401 Unauthorized

TEST_MODE Logic (Important)

The project supports two execution modes:

  Normal mode
      npm test

      Authentication guard is disabled
      Service behaves like previous tasks

  Auth mode
      TEST_MODE=auth npm run test:auth

        Authentication guard is enabled
        All protected routes require a valid JWT

  This behavior is implemented intentionally to satisfy testing requirements.

Project Structure (Auth & Logging)
src/
 ├── auth/
 │   ├── auth.controller.ts
 │   ├── auth.service.ts
 │   ├── auth.module.ts
 │   ├── jwt-auth.guard.ts
 │   └── dto/
 │       ├── signup.dto.ts
 │       ├── login.dto.ts
 │       └── refresh.dto.ts
 │
 ├── common/loggin/
 │   ├── logging.service.ts
 │   ├── logging.middleware.ts
 │   ├── logging.module.ts
 │   └── all-exceptions.filter.ts

Running the Project
  Full Cleanup (Recommended)
    docker compose down -v --remove-orphans

  Start Containers
    docker compose up -d --build

  Apply Migrations (Required)
    docker compose exec app npx prisma migrate deploy

  Health Check
    curl http://localhost:4000/user

  Expected result:
    []

Running Tests
Regular Tests (without auth)
    npm test

Auth Tests (with JWT protection)

⚠️ Important: TEST_MODE=auth must be set before starting containers

  docker compose down -v --remove-orphans

  TEST_MODE=auth docker compose up -d --build
  docker compose exec app npx prisma migrate deploy

  npm run test:auth


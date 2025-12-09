# Home Library Service

A REST service for managing a home music library.
Implements Users, Artists, Albums, Tracks and Favorites, fully persisted in PostgreSQL using Prisma ORM.

---

##  Prerequisites

Before running the project, make sure you have installed:

- **Git** — https://git-scm.com/downloads  
- **Node.js LTS (v18 or higher)** — https://nodejs.org  
- **npm** (comes with Node.js)
- **Docker** & **Docker Compose** — https://www.docker.com/

---

## Downloading the Project

```bash
git clone https://github.com/<your-github>/nodejs2025Q2-service.git
cd nodejs2025Q2-service

nstalling Dependencies
npm install

Running the Application Locally (without Docker)
npm run start:dev



## Tech Stack

Node.js 24
NestJS
TypeScript
Prisma ORM
PostgreSQL (Docker container)
Docker / Docker Compose
Jest (E2E tests)
Trivy (Docker image vulnerability scanning)

Project Features 
  - Fully containerized (App + Database)
  - PostgreSQL runs only inside Docker
  - Prisma ORM with migrations
  - All entities stored in DB (not in-memory!)
  - Auto-restart on container crash
  - Volumes for DB data & logs
  - User-defined Docker network
  - Image size < 500 MB (optimized multistage build)
  - Vulnerability scan included
  - Ready-to-use DockerHub images


Docker Images
Component	                  Image
App	                          fainmariya/home-library-app:latest
Database	                  fainmariya/home-library-postgres:latest

DockerHub profile:
👉 https://hub.docker.com/u/fainmariya


#Environment Variables

Create .env file in project root:

APP_PORT=4000

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=music_db
POSTGRES_PORT=5432

# Hostname "postgres" = docker service name
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/music_db?schema=public"



Running with Docker
Build and start services
docker compose up -d --build
>>>>>>> task/docker-db


This launches:

- PostgreSQL database
- NestJS application
- App auto-restarts on crash
- Both containers share user-defined bridge network

Stop containers
   docker compose down

View logs
   docker compose logs -f

Database & Prisma
   Run migrations (automatically sync DB with schema)
     npx prisma migrate deploy
   For development:
     npx prisma migrate dev
   Regenerate Prisma client
     npx prisma generate
Running the Application Locally (without Docker)
     npm install
     npm run start:dev

Application runs at:
👉 http://localhost:4000

API Documentation (Swagger)
If Swagger is enabled in main.ts, documentation will be available at:
👉 http://localhost:4000/doc/

Testing
Run all basic E2E tests:
   npm run test

Run a specific suite:
npm run test -- test/users.e2e.spec.ts
npm run test -- test/artists.e2e.spec.ts
npm run test -- test/tracks.e2e.spec.ts
npm run test -- test/albums.e2e.spec.ts
npm run test -- test/favorites.e2e.spec.ts


Entities Overview (Persisted in PostgreSQL)

All entities are stored in PostgreSQL using Prisma ORM with full relational mapping.

User (/user)

id (UUID)
login (unique)
password (hashed)
version (auto-increments on password change)
createdAt
updatedAt

Supports: create, read, update password, delete.

Artist (/artist)

id (UUID)
name
grammy (boolean)
Relations:
albums[]
tracks[]
favorites[]
Deleting an artist:
sets artistId = null in Album & Track
removes from Favorites

Album (/album)

id (UUID)
name
year
artistId (nullable)
Deleting an album:
sets albumId = null in Track
removes from Favorites

Track (/track)

id (UUID)
name
duration
albumId / artistId (nullable)
Deleting a track:
removes from Favorites

Favorites (/favorites)

Contains only IDs, but API returns full entities.

Routes:
GET /favorites
POST /favorites/track/:id
POST /favorites/album/:id
POST /favorites/artist/:id
DELETE /favorites/entity

Rules:

Cannot add non-existing entity
UUID is validated
Removing entity clears it from favorites automatically

Security Scan with Trivy

Run scan for both app and DB images:
npm run docker:scan


Scan only DB:

npm run docker:scan:db


Trivy is executed via Docker and uses:

-v /var/run/docker.sock:/var/run/docker.sock
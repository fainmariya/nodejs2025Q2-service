# Home Library Service

A REST service for managing a home music library.
It supports Users, Artists, Albums, Tracks, and Favorites.

## 🔧 Tech Stack

- **Node.js**
- **NestJS**
- **TypeScript**
- **class-validator** (DTO validation)
- **Jest** (E2E tests)
- **PostgreSQL**(with Docker)
- **Docker/Docker Compose** 
- **Trivy** (image vulnerability scanning)


---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-github-id>/nodejs2025Q2-service.git
cd nodejs2025Q2-service


2. Install dependencies
npm install

3. Environment variables

Create a .env file in the project root (if missing):

PORT=4000

POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=music_db

DATABASE_URL="postgresql://postgres:postgres@postgres:5432/music_db?schema=public"


postgres is the hostname of the database container in Docker.
music_db is the database name.
schema=public is the default Prisma schema.


## Docker images

- App image: `fainmariya/home-library-app:latest`
- DB image: `fainmariya/home-library-postgres:latest`
- Docker Hub: https://hub.docker.com/u/fainmariya

Running the Service with Docker

The project contains a docker-compose.yml that runs:
NestJS application
PostgreSQL database

Start all services
docker compose up --build


Run the application
npm start


The service will start on:

http://localhost:4000

API Documentation

After starting the app, you can open Swagger documentation at:

http://localhost:4000/doc/


(Available if Swagger module is enabled.)

Testing
Run all E2E tests (no authorization)
npm run test

Run a specific test suite
npm run test -- test/users.e2e.spec.ts
npm run test -- test/artists.e2e.spec.ts
npm run test -- test/tracks.e2e.spec.ts
npm run test -- test/albums.e2e.spec.ts
npm run test -- test/favorites.e2e.spec.ts

Run tests with authorization enabled
npm run test:auth

Run a specific authorized test suite
npm run test:auth -- test/users.e2e.spec.ts

Entities & Routes Overview

The service uses in-memory storage (no database yet).
All IDs must be UUID v4.

User (/user)
Method	      Route	          Description
GET       	/.user	          Get all users
GET	        /user/:id	     Get user by ID
POST	     /user	         Create a new user
PUT	        /user/:id	    Update user password
DELETE	     /user/:id	        Delete user

Responses:

Validations for UUID

Password is never returned in responses

Version number increments on update

createdAt / updatedAt are timestamps

Artist (/artist)
Method	  Route	        Description
GET	     /artist	  Get all artists
GET	   /artist/:id	  Get artist by ID
POST     /artist	   Create artist
PUT	   /artist/:id	   Update artist
DELETE	/artist/:id	    Delete artist

On delete:

All artistId references in Albums and Tracks become null

Artist ID is removed from Favorites

Album (/album)
Method	       Route	    Description
GET	          /album	  Get all albums
GET	         /album/:id.  Get album by ID
POST	      /album	   Create album
PUT	         /album/:id	    Update album
DELETE	     /album/:id	    Delete album

On delete:

All albumId references in Tracks become null

Album ID is removed from Favorites

Track (/track)
Method	        Route	     Description
GET	           /track	   Get all tracks
GET	         /track/:id	    Get track by ID
POST	      /track	    Create track
PUT	         /track/:id	     Update track
DELETE	      /track/:id	 Delete track

On delete:

Track ID is removed from Favorites

Favorites (/favorites)
Method	       Route	                  Description
GET	        /favorites	         Get all favorites (full objects)
POST	/favorites/track/:id	    Add track to favorites
DELETE	/favorites/track/:id	   Remove track from favorites
POST	/favorites/album/:id	   Add album to favorites
DELETE	/favorites/album/:id	    Remove album from favorites
POST	/favorites/artist/:id	     Add artist to favorites
DELETE	/favorites/artist/:id	  Remove artist from favorites

Rules:

Non-existing entities cannot be added

IDs must be valid UUID

Deleting an entity automatically removes it from favorites


Security Scan with Trivy
To analyze Docker images for vulnerabilities, Trivy is used via Docker.

Available scripts
npm run docker:scan       # Scan application + database images
npm run docker:scan:db    # Scan only DB image


Trivy runs as a container and attaches to the Docker daemon via:

-v /var/run/docker.sock:/var/run/docker.sock
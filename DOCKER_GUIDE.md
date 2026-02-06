# Docker Setup Guide for Teacher-Buddy

## Overview
This project uses Docker and Docker Compose to containerize the Teacher-Buddy application with PostgreSQL database support. The setup provides a complete, isolated environment for development and production.

## Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)
- Git (for cloning the repository)

## Quick Start

### 1. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and update the required variables:
```bash
# Generate a secure session secret
openssl rand -hex 32

# Add to .env:
POSTGRES_PASSWORD=your_secure_password_here
REPL_ID=your_actual_repl_id
SESSION_SECRET=generated_secret_from_above
```

**Note:** You need a `REPL_ID` from Replit. Get it from your Replit project settings or environment.

### 2. Build and Run
Build and start all services:
```bash
docker-compose up -d --build
```

The application will be available at: `http://localhost:5000`

### 3. Database Initialization
After the containers are running, run database migrations:
```bash
docker-compose exec app npm run db:push
```

## Service Details

### PostgreSQL Service
- **Container Name**: teacher-buddy-db
- **Port**: 5432 (exposed to host)
- **Database**: teacher_buddy (default)
- **User**: postgres
- **Data Persistence**: Volume `postgres_data` ensures data survives container restarts

### Application Service
- **Container Name**: teacher-buddy-app
- **Port**: 5000
- **Depends On**: PostgreSQL (waits for healthy status)
- **Health Check**: Enabled with 30s interval

## Configuration

### Environment Variables
Edit `.env` file to customize:
- `POSTGRES_DB`: Database name (default: teacher_buddy)
- `POSTGRES_USER`: Database user (default: postgres)
- `POSTGRES_PASSWORD`: Database password (CHANGE THIS!)
- `DB_PORT`: Database port mapping (default: 5432)
- `NODE_ENV`: Node environment (default: production)
- `PORT`: Application port (default: 5000)
- `APP_PORT`: Port mapping on host (default: 5000)
- `REPL_ID`: Your Replit ID for OAuth (required for authentication)
- `SESSION_SECRET`: Session secret for passport (required, generate with: `openssl rand -hex 32`)
- `ISSUER_URL`: OpenID issuer URL (default: https://replit.com/oidc)

## Common Commands

### Start Services
```bash
# Start in background
docker-compose up -d

# Start with logs visible
docker-compose up

# Build before starting
docker-compose up -d --build
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: data loss)
docker-compose down -v
```

### View Logs
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f postgres
```

### Execute Commands
```bash
# Run database migrations
docker-compose exec app npm run db:push

# Run npm commands in app container
docker-compose exec app npm run check

# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d teacher_buddy

# Access container shell
docker-compose exec app sh
```

### Rebuild
```bash
# Rebuild app image without cache
docker-compose build --no-cache app

# Rebuild everything
docker-compose build --no-cache
```

## Development Workflow

### For Development (Hot Reload)
If you want to use development mode with hot reload, create a `docker-compose.dev.yml`:
```yaml
version: "3.8"

services:
  app:
    environment:
      NODE_ENV: development
    command: npm run dev
    volumes:
      - .:/app
      - /app/node_modules
```

Then run:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### View Database
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d teacher_buddy

# List tables
\dt

# View migrations
\dm
```

## Troubleshooting

### Port Already in Use
If port 5000 is already in use:
```bash
# Change APP_PORT in .env or use -p flag
docker-compose down
docker-compose up -d --build -p my_unique_project_5000:5000
```

### Database Connection Refused
```bash
# Check if postgres service is healthy
docker-compose ps

# Check postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Application Not Starting
```bash
# Check app logs
docker-compose logs app

# Verify dependencies installed
docker-compose exec app npm list

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Reset Everything
```bash
# Stop services and remove volumes
docker-compose down -v

# Remove built images
docker image rm teacher-buddy-teacher-buddy-app:latest

# Rebuild and start fresh
docker-compose up -d --build
```

## Production Considerations

### Security
1. Change all default passwords in `.env`:
   ```bash
   POSTGRES_PASSWORD=<strong_password>
   ```

2. Add environment-specific `.env.production`:
   ```bash
   cp .env.example .env.production
   ```

3. Never commit `.env` files to version control

### Database Backups
```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres teacher_buddy > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U postgres teacher_buddy
```

### Resource Limits
Edit `docker-compose.yml` to add resource limits:
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Monitoring
```bash
# Monitor container resource usage
docker stats

# Persistent monitoring with compose
docker-compose stats
```

## File Structure

```
Teacher-Buddy/
├── Dockerfile              # Multi-stage build for app
├── docker-compose.yml      # Services definition
├── .dockerignore           # Files to exclude from build
├── .env.example            # Environment variables template
├── package.json            # Node dependencies
├── client/                 # React frontend
├── server/                 # Express backend
├── shared/                 # Shared types/schema
└── migrations/             # Database migrations
```

## Deployment

### Using Docker Registry (Docker Hub)
```bash
# Build image
docker build -t yourusername/teacher-buddy:latest .

# Push to registry
docker push yourusername/teacher-buddy:latest

# Pull and run
docker run -e DATABASE_URL=... -p 5000:5000 yourusername/teacher-buddy:latest
```

### Using Private Registry
Update docker-compose.yml image:
```yaml
services:
  app:
    image: your-registry/teacher-buddy:latest
```

## Support
For issues or questions, check the logs and review the troubleshooting section above.

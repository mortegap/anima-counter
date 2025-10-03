# Anima Counter - Docker Guide

Specific documentation for Docker deployment and development.

---

## 📦 Container Architecture

The application is divided into 4 Docker services:

```
┌────────────────┐    ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│   frontend     │    │    backend     │    │   postgres     │    │    adminer     │
│   (Nginx)      │◄──►│  (Node.js)     │◄──►│  (PostgreSQL)  │◄──►│   (DB Admin)   │
│   Port: 80     │    │   Port: 3000   │    │   Port: 5432   │    │   Port: 8080   │
└────────────────┘    └────────────────┘    └────────────────┘    └────────────────┘
```

### Services

1. **frontend**: Nginx server with Vue 3 build
2. **backend**: Node.js/Express API with JWT authentication
3. **postgres**: PostgreSQL 15 database with persistence
4. **adminer**: Web interface for database management

---

## 🚀 Quick Start

### Production

```bash
# Build and start
docker-compose up -d --build

# View status
docker-compose ps

# View logs
docker-compose logs -f
```

### Development (with hot-reload)

```bash
# Build and start
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

**Development differences:**
- ✅ Backend hot-reload (nodemon)
- ✅ Frontend HMR (Vite)
- ✅ Debug port: 9229
- ✅ Mounted volumes for real-time changes

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# PostgreSQL
POSTGRES_DB=anima_counter
POSTGRES_USER=anima_user
POSTGRES_PASSWORD=change_secure_password

# Backend
JWT_SECRET=change_very_long_jwt_secret
NODE_ENV=production
PORT=3000

# Database URL (auto-generated)
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
```

---

## 🗄️ Database

### PostgreSQL Access

**Via Adminer (Web):**
- URL: http://localhost:8080
- System: PostgreSQL
- Server: postgres
- User: anima_user (or configured in .env)
- Database: anima_counter

**Via psql (CLI):**
```bash
docker-compose exec postgres psql -U anima_user -d anima_counter
```

### Backup and Restore

**Create backup:**
```bash
docker-compose exec postgres pg_dump -U anima_user anima_counter > backup_$(date +%Y%m%d).sql
```

**Restore backup:**
```bash
docker-compose exec -T postgres psql -U anima_user anima_counter < backup.sql
```

**Automatic backup with Makefile:**
```bash
make db-backup              # Creates timestamped backup
make db-restore FILE=backup.sql
```

### Initialization

Schema is created automatically on first start using:
- `init-db/01-schema.sql`

The `postgres_data` volume persists data between restarts.

---

## 🛠️ Useful Commands

### Service Management

```bash
# View status
docker-compose ps

# Start services
docker-compose up -d

# Stop services
docker-compose stop

# Restart a service
docker-compose restart backend

# View logs in real-time
docker-compose logs -f

# View logs of specific service
docker-compose logs -f backend
```

### Rebuild Containers

```bash
# Rebuild everything
docker-compose up -d --build

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d

# Rebuild specific service
docker-compose up -d --build backend
```

### Clean Resources

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes (warning! deletes DB)
docker-compose down -v

# Clean orphaned images
docker image prune -f

# Clean entire Docker system
docker system prune -a
```

### Shell Access

```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# PostgreSQL
docker-compose exec postgres bash

# Execute command in backend
docker-compose exec backend npm run migrate
```

---

## 📊 Healthchecks

All services implement healthchecks:

**Backend:**
```bash
curl http://localhost:3000/health
```

**Frontend:**
```bash
curl http://localhost/
```

**PostgreSQL:**
```bash
docker-compose exec postgres pg_isready -U anima_user
```

View health status:
```bash
docker-compose ps
# STATUS column should show "(healthy)"
```

---

## 🔍 Troubleshooting

### Service won't start

```bash
# View detailed logs
docker-compose logs backend

# Verify configuration
docker-compose config

# Restart service
docker-compose restart backend
```

### Database won't connect

```bash
# Verify postgres is running
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres

# Test connection from backend
docker-compose exec backend ping postgres
```

### Port already in use

```bash
# See what process uses port 80
sudo lsof -i :80

# Change ports in docker-compose.yaml
# frontend: "8080:80" instead of "80:80"
```

### Volume permissions

```bash
# Change volume ownership
docker-compose exec postgres chown -R postgres:postgres /var/lib/postgresql/data

# Or delete and recreate volume
docker-compose down -v
docker-compose up -d
```

### Frontend won't load

```bash
# Verify frontend build
docker-compose exec frontend ls -la /usr/share/nginx/html

# Verify nginx
docker-compose exec frontend nginx -t

# View nginx logs
docker-compose logs frontend
```

### Backend not responding

```bash
# Verify environment variables
docker-compose exec backend env | grep DATABASE

# Verify DB connectivity
docker-compose exec backend node -e "const pg = require('pg'); new pg.Pool().query('SELECT NOW()')"

# Restart backend
docker-compose restart backend
```

---

## 📦 Optimizations

### Multi-stage Builds

**Frontend** (3 stages):
1. `deps`: Install dependencies
2. `builder`: Production build with Vite
3. `production`: Alpine Nginx with static files

**Backend** (2 stages):
1. `deps`: Install production dependencies
2. `production`: Alpine Node with code

**Benefits:**
- Reduction from 450MB → 25MB in frontend (-94%)
- Reduction from 200MB → 85MB in backend (-58%)
- Layer caching for 5-10x faster builds

### Security

- ✅ Non-root users in all containers
- ✅ Environment variables for secrets
- ✅ Isolated networks
- ✅ Healthchecks in all services

---

## 🔧 Local Development

### Without Docker

**Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Configure local DATABASE_URL
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**PostgreSQL:**
```bash
createdb anima_counter
psql anima_counter < init-db/01-schema.sql
```

### With Docker + hybrid local development

```bash
# Only start PostgreSQL
docker-compose up -d postgres adminer

# Backend and frontend locally
cd backend && npm run dev
cd frontend && npm run dev
```

---

## 📝 Makefile

The project includes a Makefile with simplified commands:

```bash
make help         # View all commands
make dev          # Development with hot-reload
make prod         # Production
make db-backup    # Database backup
make db-shell     # PostgreSQL shell
make clean        # Clean everything
```

See [Makefile](Makefile) for more details.

---

## 📚 More Information

- [Main README](README.md) - General information
- [API Documentation](docs/API.md) - REST endpoints
- [Development Guide](docs/DEVELOPMENT.md) - Development guide
- [Docker Optimization](docs/DOCKER_OPTIMIZATION.md) - Technical details

---

**Docker problems?** [Report issue](https://github.com/mortegap/anima-counter/issues)

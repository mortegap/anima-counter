# 🎲 Anima Counter

**Zeon Counter for Anima Beyond Fantasy**

![Vue.js](https://img.shields.io/badge/Vue.js-3.4-4fc08d?style=flat&logo=vuedotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

Web application to manage Zeon, spells and combat in Anima Beyond Fantasy game sessions.

---

## 📋 Features

- ⚡ **Zeon Management**: Turn counter, zeon pool, accumulation and regeneration
- 📚 **Spell Grimoire**: Manage your personal spell list with 4 levels
- 🎯 **Ready to Cast**: Select which spells to cast next turn
- 🔄 **Maintained Spells**: Track active spells with maintenance cost
- 👤 **Character Stats**: Max zeon, ACT, zeonic regeneration
- 🌓 **Light/Dark Theme**: Adaptable interface with preference persistence
- 🔐 **Authentication System**: Register and login with JWT
- 💾 **Persistence**: All data saved in PostgreSQL

---

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────┐
│  Frontend   │◄───────►│   Backend    │◄───────►│   DB     │
│   Vue 3     │  REST   │   Node.js    │   SQL   │ Postgres │
│  + Vite     │         │  + Express   │         │          │
└─────────────┘         └──────────────┘         └──────────┘
```

**Tech Stack:**
- **Frontend**: Vue 3, Vite, Pinia, Vue Router, Axios, Bootstrap Icons
- **Backend**: Node.js, Express, JWT, Joi, bcrypt
- **Database**: PostgreSQL 15
- **Infrastructure**: Docker, Docker Compose, Nginx

---

## 🚀 Installation

### Prerequisites

- Docker and Docker Compose installed
- Ports 80, 3000 and 8080 available

### With Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/mortegap/anima-counter.git
   cd anima-counter
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env` and modify:
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   # PostgreSQL
   POSTGRES_DB=anima_counter
   POSTGRES_USER=anima_user
   POSTGRES_PASSWORD=your_secure_password

   # Backend
   JWT_SECRET=your_very_long_and_secure_jwt_secret
   NODE_ENV=production
   ```

3. **Build and start services**
   ```bash
   docker-compose up -d --build
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - Adminer (DB management): http://localhost:8080

5. **Verify status**
   ```bash
   docker-compose ps
   ```

   All containers should show `(healthy)`.

---

## 📱 Usage

### First Start

1. **Register**: Create an account with username and password
2. **Configure character**: Set max zeon, ACT and zeonic regeneration
3. **Add spells**: Create your grimoire with your character's spells

### During the Game

**Turn Management:**
- Use ← → arrows to advance/go back turns
- **+1 day** button: Advance to next day and regenerate zeon
- **Reset** button: Reset turn and accumulated zeon to 0

**Zeon Management:**
- **Zeon Pool**: Progress bar with available zeon
- **Accumulate Zeon**: Toggle with checkbox
- **Accumulated Zeon**: Automatically displayed when accumulating
- **Lost Zeon**: Register zeon lost from hits or interruptions

**Spell System:**
1. **Add to grimoire**: "Add new spell" button in spell list
2. **Prepare spell**: Select level and optionally mark "Maintain spell"
3. **Cast spells**: "Cast Spells" button consumes zeon and moves to maintained if applicable
4. **Stop maintaining**: Remove spells from maintained list

---

## 📂 Project Structure

```
anima-counter/
├── backend/
│   ├── src/
│   │   ├── config/          # DB configuration
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Authentication and validation
│   │   ├── models/          # Data models
│   │   ├── routes/          # Endpoint definitions
│   │   ├── schemas/         # Joi validation
│   │   ├── utils/           # Utilities (JWT, bcrypt)
│   │   └── server.js        # Entry point
│   ├── tests/               # Unit tests
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── assets/          # CSS and images
│   │   ├── components/      # Vue components
│   │   │   ├── spells/      # Spell system
│   │   │   ├── character/   # Profiles
│   │   │   ├── common/      # Reusable components
│   │   │   └── layout/      # Header, footer
│   │   ├── router/          # Vue Router
│   │   ├── stores/          # Pinia stores
│   │   ├── views/           # Pages
│   │   ├── App.vue
│   │   └── main.js
│   ├── public/              # Static assets
│   ├── dist/                # Production build
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── init-db/
│   └── 01-schema.sql        # PostgreSQL schema
│
├── docs/
│   ├── API.md               # REST API documentation
│   ├── DEVELOPMENT.md       # Development guide
│   └── DOCKER_OPTIMIZATION.md
│
├── docker-compose.yaml      # Production
├── docker-compose.dev.yml   # Development with hot-reload
├── nginx.conf               # Nginx configuration
├── Makefile                 # Development commands
├── .env.example             # Environment variables example
├── .gitignore
└── README.md
```

---

## 💻 Development

### Quick Commands (Makefile)

```bash
make help         # See all available commands

# Development with hot-reload
make dev          # Start development environment
make dev-logs     # View logs in real-time
make dev-down     # Stop containers
make dev-clean    # Clean everything (containers + volumes)

# Production
make prod         # Start production
make prod-logs    # View logs
make prod-down    # Stop

# Database
make db-shell     # Connect to PostgreSQL
make db-backup    # Create backup
make db-restore FILE=backup.sql

# Utilities
make ps           # View container status
make shell-backend # Shell in backend container
make install      # Install dependencies locally
```

### Local Development Without Docker

**Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Configure DATABASE_URL and JWT_SECRET
npm run dev           # Port 3000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev           # Port 5173
```

**Database:**
```bash
# PostgreSQL must be running locally
createdb anima_counter
psql anima_counter < init-db/01-schema.sql
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Database Access

**Adminer (Web UI):**
- URL: http://localhost:8080
- System: PostgreSQL
- Server: postgres
- User/Password: Configured in `.env`

**psql (CLI):**
```bash
docker-compose exec postgres psql -U anima_user -d anima_counter
```

---

## 📚 Additional Documentation

- **REST API**: [docs/API.md](docs/API.md) - Endpoints and authentication
- **Development**: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) - Complete development guide
- **Docker**: [docs/DOCKER_OPTIMIZATION.md](docs/DOCKER_OPTIMIZATION.md) - Optimizations and architecture

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License. See [LICENSE.txt](LICENSE.txt) for details.

---

## 🙏 Credits

- **Developer**: [Moperez](https://github.com/mortegap)
- **Game**: Anima Beyond Fantasy by Edge Entertainment
- **Stack**: Vue.js, Node.js, PostgreSQL

---

**Found a bug?** [Report issue](https://github.com/mortegap/anima-counter/issues)

**Made with ❤️ for the Anima Beyond Fantasy community**

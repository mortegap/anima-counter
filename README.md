<div id="top">

<!-- HEADER -->
<div align="center">

# 🎲 Anima Counter

<em>Contador de Zeon para Anima Beyond Fantasy</em>

<!-- BADGES -->
<p>
<img src="https://img.shields.io/badge/Vue.js-3.4-4fc08d?style=flat&logo=vuedotjs&logoColor=white" alt="Vue.js 3">
<img src="https://img.shields.io/badge/Node.js-18-339933?style=flat&logo=nodedotjs&logoColor=white" alt="Node.js">
<img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL">
<img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white" alt="Docker">
<img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</p>

<em>Herramienta web para gestionar Zeon, hechizos y estado de combate en Anima Beyond Fantasy</em>

</div>
<br>

---

## 📑 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
  - [Con Docker (Recomendado)](#con-docker-recomendado)
  - [Desarrollo Local](#desarrollo-local)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Documentation](#api-documentation)
- [Desarrollo](#desarrollo)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## 📖 Descripción

**Anima Counter** es una aplicación web completa diseñada para ayudar a los jugadores del juego de rol **Anima Beyond Fantasy** a gestionar sus recursos mágicos (Zeon) durante las partidas.

La aplicación permite:
- 🧙‍♂️ Gestionar múltiples perfiles de personajes
- ⚡ Contador avanzado de Zeon con regeneración y acumulación
- 📚 Grimorio personalizable de hechizos
- 🎯 Sistema de preparación y lanzamiento de hechizos
- 🔄 Gestión de hechizos mantenidos
- 🌓 Modo oscuro/claro
- 💾 Persistencia de datos en PostgreSQL
- 🔐 Sistema de autenticación seguro

---

## ✨ Características

### Gestión de Zeon
- **Contador de turnos** con reset automático de combate
- **Zeon actual** con cálculos de regeneración
- **Zeon acumulado** para preparar hechizos
- **Acumulación activa** con indicador visual
- **Regeneración innata** y **Zeon de regeneración**
- **Bloqueo/desbloqueo** para evitar cambios accidentales

### Sistema de Hechizos
- **Grimorio personal** - Guarda tus hechizos con 4 niveles (Base, Intermedio, Avanzado, Arcano)
- **Preparación de hechizos** - Selecciona hechizos para lanzar en el próximo turno
- **Mantenimiento** - Gestiona hechizos con coste de mantenimiento
- **Vías mágicas** - Organiza hechizos por escuelas de magia

### Gestión de Perfiles
- **Múltiples personajes** por usuario
- **Datos independientes** para cada perfil
- **Cambio rápido** entre personajes

### Interfaz
- 🎨 **Diseño responsive** - Funciona en móviles y escritorio
- 🌗 **Tema claro/oscuro** con persistencia
- 🎯 **UI intuitiva** con iconos de Bootstrap
- ⚡ **Actualización en tiempo real**

---

## 🏗️ Arquitectura

La aplicación sigue una arquitectura **cliente-servidor moderna** con separación clara de responsabilidades:

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│                 │         │                  │         │              │
│   Frontend      │◄───────►│     Backend      │◄───────►│  PostgreSQL  │
│   (Vue 3)       │  HTTP   │  (Node.js +      │  SQL    │              │
│   + Vite        │  REST   │   Express)       │         │              │
│                 │         │                  │         │              │
└─────────────────┘         └──────────────────┘         └──────────────┘
      Nginx                    JWT Auth                   Persistent DB
```

### Frontend (Vue 3 + Vite)
- **Framework**: Vue 3 con Composition API
- **Build Tool**: Vite para desarrollo rápido y build optimizado
- **State Management**: Pinia (stores modulares)
- **Router**: Vue Router 4
- **HTTP Client**: Axios
- **Servidor Web**: Nginx (producción)

### Backend (Node.js + Express)
- **Arquitectura**: MVC (Model-View-Controller)
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Joi schemas
- **Seguridad**: bcrypt para passwords, middleware de autenticación
- **Base de datos**: PostgreSQL con pg driver

### Base de Datos (PostgreSQL)
- **Tablas principales**:
  - `users` - Usuarios del sistema
  - `user_profiles` - Perfiles de personajes
  - `game_state` - Estado de juego por perfil
  - `spells` - Grimorio de hechizos
  - `ready_to_cast` - Hechizos preparados
  - `spell_mantain_list` - Hechizos mantenidos

### Infraestructura (Docker)
- **Docker Compose** para orquestación
- **Multi-stage builds** para optimización
- **Healthchecks** en todos los servicios
- **Adminer** para gestión de BD

---

## 🛠️ Tecnologías

### Frontend
- **Vue.js 3.4** - Framework progresivo
- **Vite 5.x** - Build tool ultrarrápido
- **Pinia 2.x** - State management oficial
- **Vue Router 4.x** - Routing
- **Axios 1.x** - Cliente HTTP
- **Bootstrap Icons** - Iconografía
- **SCSS** - Preprocesador CSS

### Backend
- **Node.js 18** - Runtime de JavaScript
- **Express 4.x** - Framework web
- **PostgreSQL 15** - Base de datos relacional
- **pg** - PostgreSQL client para Node.js
- **bcrypt** - Hashing de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **Joi** - Validación de schemas
- **Winston** - Logger

### DevOps
- **Docker** - Containerización
- **Docker Compose** - Orquestación multi-container
- **Nginx** - Servidor web y proxy reverso
- **Adminer** - Gestión de base de datos

---

## 🚀 Instalación

### Requisitos Previos

- **Docker** y **Docker Compose** instalados
- Puerto **80** y **3000** disponibles
- (Opcional para desarrollo) **Node.js 18+** y **npm**

### Con Docker (Recomendado)

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/anima-counter.git
   cd anima-counter
   ```

2. **Configurar variables de entorno**

   Crear archivo `.env` en la raíz del proyecto:
   ```env
   # PostgreSQL
   POSTGRES_DB=anima_counter
   POSTGRES_USER=anima_user
   POSTGRES_PASSWORD=tu_password_seguro

   # Backend
   JWT_SECRET=tu_secreto_jwt_muy_seguro_y_largo
   NODE_ENV=production
   ```

3. **Construir y levantar servicios**
   ```bash
   docker-compose up -d --build
   ```

4. **Acceder a la aplicación**
   - Frontend: [http://localhost](http://localhost)
   - Backend API: [http://localhost:3000](http://localhost:3000)
   - Adminer (DB): [http://localhost:8080](http://localhost:8080)

5. **Verificar que los servicios están saludables**
   ```bash
   docker-compose ps
   ```

   Todos los contenedores deben mostrar `(healthy)`:
   ```
   NAME                        STATUS
   anima-counter-backend       Up (healthy)
   anima-counter-db            Up (healthy)
   anima-counter-frontend      Up (healthy)
   anima-counter-adminer       Up
   ```

### Desarrollo Local

#### Backend

1. **Navegar a la carpeta backend**
   ```bash
   cd backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar PostgreSQL local**

   Asegúrate de tener PostgreSQL corriendo y crea la base de datos:
   ```bash
   createdb anima_counter
   psql anima_counter < init-db/01-schema.sql
   ```

4. **Configurar variables de entorno**

   Crear `.env` en `/backend`:
   ```env
   DATABASE_URL=postgresql://usuario:password@localhost:5432/anima_counter
   JWT_SECRET=tu_secreto_jwt
   NODE_ENV=development
   PORT=3000
   ```

5. **Ejecutar servidor de desarrollo**
   ```bash
   npm run dev
   ```

#### Frontend

1. **Navegar a la carpeta frontend**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Acceder a**
   - Frontend: [http://localhost:5173](http://localhost:5173)

---

## 📱 Uso

### Primer uso

1. **Registrarse**
   - Accede a la aplicación
   - Haz clic en "Registrarse"
   - Crea una cuenta con usuario y contraseña

2. **Crear perfil de personaje**
   - Una vez logueado, se crea automáticamente un perfil por defecto
   - Puedes crear más perfiles desde el menú de perfiles

3. **Configurar estadísticas base**
   - Configura el **Zeon de regeneración** (rzeon)
   - Configura la **Acumulación** (act)
   - Configura la **Regeneración innata** (rzeoni)

4. **Añadir hechizos al grimorio**
   - Ve a la sección "Grimorio"
   - Añade tus hechizos con sus costes en los 4 niveles
   - Opcionalmente especifica costes de mantenimiento

### Durante el juego

1. **Gestión de turnos**
   - Al inicio del turno, haz clic en "Nuevo día" para regenerar Zeon
   - El turno se incrementa automáticamente

2. **Acumular Zeon**
   - Activa/desactiva la acumulación con el botón "Acumular"
   - El Zeon acumulado se muestra en el contador de Zeona

3. **Preparar hechizos**
   - Selecciona hechizos de tu grimorio
   - Elige el nivel (Base/Inter/Avanzado/Arcano)
   - Marca si quieres mantenerlo activo
   - Añádelo a "Hechizos preparados"

4. **Lanzar hechizos**
   - Cuando estés listo, haz clic en "Lanzar hechizos"
   - El sistema calculará automáticamente:
     - Consumo de Zeona
     - Zeon perdido (zeonp)
     - Creación de mantenimientos

5. **Reset de combate**
   - Al finalizar el combate, usa "Reset" para limpiar:
     - Turnos, Zeon actual, Zeona, Zeonp
     - Hechizos preparados y mantenidos
   - Mantiene: rzeon, act, rzeoni, grimorio

---

## 📂 Estructura del Proyecto

```
anima-counter/
├── backend/                    # Backend Node.js
│   ├── src/
│   │   ├── config/            # Configuración (DB, constantes)
│   │   ├── controllers/       # Controladores MVC
│   │   ├── middleware/        # Middlewares (auth, validación, errores)
│   │   ├── models/            # Modelos de datos
│   │   ├── routes/            # Definición de rutas
│   │   ├── schemas/           # Schemas de validación Joi
│   │   ├── utils/             # Utilidades (JWT, passwords, etc)
│   │   └── server.js          # Punto de entrada del servidor
│   ├── tests/                 # Tests (pendiente)
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                  # Frontend Vue 3
│   ├── src/
│   │   ├── assets/           # Assets estáticos (imágenes, estilos)
│   │   ├── components/       # Componentes Vue
│   │   │   ├── auth/        # Componentes de autenticación
│   │   │   ├── game/        # Componentes de juego (turnos, stats)
│   │   │   ├── layout/      # Layout (header, footer, theme)
│   │   │   └── spells/      # Sistema de hechizos
│   │   ├── composables/     # Composables reutilizables
│   │   ├── router/          # Configuración de Vue Router
│   │   ├── services/        # Servicios API
│   │   ├── stores/          # Stores de Pinia
│   │   ├── views/           # Vistas/páginas
│   │   ├── App.vue          # Componente raíz
│   │   └── main.js          # Punto de entrada
│   ├── public/              # Archivos públicos
│   ├── package.json
│   ├── vite.config.js       # Configuración de Vite
│   └── Dockerfile
│
├── init-db/                  # Scripts SQL de inicialización
│   └── 01-schema.sql        # Schema de base de datos
│
├── docs/                     # Documentación
│   └── API.md               # Documentación de API REST
│
├── docker-compose.yaml      # Orquestación Docker
├── nginx.conf               # Configuración de Nginx
├── .env.example             # Ejemplo de variables de entorno
├── PLAN.md                  # Plan de desarrollo
└── README.md                # Este archivo
```

---

## 📚 API Documentation

La documentación completa de la API REST está disponible en:

👉 **[docs/API.md](./docs/API.md)**

### Endpoints principales

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/verify`
- **Perfiles**: `/api/profiles`
- **Estado**: `/api/gamestate/:profileId`
- **Hechizos**: `/api/spells/:profileId`
- **Preparados**: `/api/ready-to-cast/:profileId`
- **Mantenimientos**: `/api/spell-mantain/:profileId`

Todos los endpoints (excepto register/login) requieren autenticación JWT.

---

## 💻 Desarrollo

### Comandos rápidos con Makefile

El proyecto incluye un Makefile para simplificar comandos comunes:

```bash
# Ver todos los comandos disponibles
make help

# Desarrollo
make dev              # Iniciar entorno de desarrollo con hot-reload
make dev-logs         # Ver logs en tiempo real
make dev-down         # Detener entorno de desarrollo
make dev-clean        # Limpiar todo (contenedores + volúmenes)

# Producción
make prod             # Iniciar producción
make prod-logs        # Ver logs de producción
make prod-down        # Detener producción

# Base de datos
make db-shell         # Conectar a PostgreSQL
make db-backup        # Crear backup
make db-restore FILE=backup.sql  # Restaurar backup

# Utilidades
make ps               # Ver estado de contenedores
make shell-backend    # Abrir shell en backend
make install          # Instalar dependencias localmente
```

### Desarrollo con Docker (Recomendado)

**Entorno de desarrollo optimizado** con hot-reload:

```bash
# Iniciar (primera vez)
docker-compose -f docker-compose.dev.yml up --build

# Iniciar (siguientes veces)
docker-compose -f docker-compose.dev.yml up

# En background
docker-compose -f docker-compose.dev.yml up -d
```

**Características**:
- ✅ Hot-reload automático en backend (nodemon)
- ✅ HMR (Hot Module Replacement) en frontend (Vite)
- ✅ Puerto de debug: 9229
- ✅ Volúmenes montados para cambios en tiempo real
- ✅ Adminer en http://localhost:8080

**Acceso**:
- Frontend: http://localhost:5173 (con HMR)
- Backend API: http://localhost:3000
- Adminer: http://localhost:8080

📖 **Ver más**: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

### Optimizaciones Docker

El proyecto utiliza **builds multi-stage optimizados**:

- 🎯 **Frontend**: 3 stages (deps → builder → production)
- 🎯 **Backend**: 2 stages (deps → production)
- 📦 **Imágenes Alpine Linux** (reducción de ~70% en tamaño)
- ⚡ **Layer caching** para builds incrementales 5-10x más rápidos
- 🔒 **Usuario no-root** para mejor seguridad
- 💾 **Healthchecks** optimizados

**Mejoras de tamaño**:
- Frontend: 450 MB → 25 MB (-94%)
- Backend: 200 MB → 85 MB (-58%)

📖 **Ver más**: [docs/DOCKER_OPTIMIZATION.md](docs/DOCKER_OPTIMIZATION.md)

### Ejecutar tests (pendiente - Fase 4)

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Linting y formato (pendiente - Fase 5)

```bash
# Backend
npm run lint
npm run format

# Frontend
npm run lint
npm run format
```

### Build para producción

```bash
# Con Makefile
make prod-build

# O manualmente
docker-compose -f docker-compose.yaml up -d --build
```

### Acceder a logs

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Acceder a la base de datos

**Opción 1: Adminer (interfaz web)**
- URL: [http://localhost:8080](http://localhost:8080)
- Sistema: PostgreSQL
- Servidor: postgres
- Usuario: anima_user
- Contraseña: (la configurada en .env)
- Base de datos: anima_counter

**Opción 2: psql (línea de comandos)**
```bash
docker-compose exec postgres psql -U anima_user -d anima_counter
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres contribuir:

1. **Fork** el repositorio
2. Crea una **rama** para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. **Commit** tus cambios (`git commit -m 'Añadir nueva característica'`)
4. **Push** a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un **Pull Request**

### Guías de contribución

- Sigue las convenciones de código existentes
- Añade tests para nuevas funcionalidades (cuando esté implementado)
- Actualiza la documentación según sea necesario
- Mantén los commits atómicos y con mensajes descriptivos

---

## 📸 Screenshots

### Vista Principal
![UI Overview](images/anima-overview.png)

### Modo Oscuro
![Dark Mode](images/dark-mode.png)

*(Añadir screenshots actualizados de la nueva UI Vue 3)*

---

## 🗺️ Roadmap

- [x] **Fase 1**: Limpieza y organización backend (MVC)
- [x] **Fase 2**: Esquema de base de datos documentado
- [x] **Fase 3**: Modernización frontend (Vue 3 + Vite)
- [x] **Fase 6**: Documentación completa
- [x] **Fase 7**: Optimización Docker
- [ ] **Fase 4**: Tests automatizados (Backend + Frontend)
- [ ] **Fase 5**: Configuración de desarrollo (ESLint, Prettier, Husky)
- [ ] **Fase 8**: CI/CD con GitHub Actions

### Próximas características

- 📊 Dashboard con estadísticas de uso
- 🎲 Calculadora de tiradas
- 📖 Integración con SRD de Anima
- 🌐 PWA (Progressive Web App)
- 🔔 Notificaciones de turno
- 👥 Modo multijugador (compartir sesión con DJ)

---

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](./LICENSE.txt) para más detalles.

---

## 👥 Autores

- **Desarrollador Principal** - Moperez
- **Contribuidores** - Ver [contributors](../../graphs/contributors)

---

## 🙏 Agradecimientos

- Al equipo de **Edge Entertainment** por el maravilloso juego Anima Beyond Fantasy
- A la comunidad de Vue.js y Node.js
- A todos los jugadores que han probado y dado feedback

---

## 📞 Soporte

Si encuentras algún bug o tienes sugerencias:

- 🐛 [Reportar un bug](../../issues)
- 💡 [Solicitar una característica](../../issues)
- 💬 [Discusiones](../../discussions)

---

<div align="center">

**Hecho con ❤️ para la comunidad de Anima Beyond Fantasy**

[⬆ Volver arriba](#top)

</div>

# 🛠️ Guía de Desarrollo - Anima Counter

Esta guía explica cómo configurar y trabajar en el entorno de desarrollo de Anima Counter.

---

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Configuración Inicial](#configuración-inicial)
- [Desarrollo con Docker](#desarrollo-con-docker)
- [Desarrollo Local (Sin Docker)](#desarrollo-local-sin-docker)
- [Estructura de Archivos](#estructura-de-archivos)
- [Scripts Disponibles](#scripts-disponibles)
- [Debugging](#debugging)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos Previos

### Para desarrollo con Docker
- Docker 20.10+
- Docker Compose 2.0+
- Git

### Para desarrollo local
- Node.js 18+
- npm 9+
- PostgreSQL 15+
- Git

---

## ⚙️ Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/anima-counter.git
cd anima-counter
```

### 2. Configurar variables de entorno

Para desarrollo, copia el archivo de ejemplo:

```bash
cp .env.dev.example .env
```

Edita `.env` si necesitas cambiar algún valor por defecto.

---

## 🐳 Desarrollo con Docker (Recomendado)

El entorno de desarrollo con Docker incluye:
- 🔄 **Hot-reload** automático en backend y frontend
- 🐛 **Puerto de debug** (9229) para Node.js
- 📊 **Adminer** para gestión de base de datos
- 🔗 **Volúmenes** montados para cambios en tiempo real

### Iniciar el entorno de desarrollo

```bash
docker-compose -f docker-compose.dev.yml up
```

O en modo background:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Acceder a los servicios

- **Frontend**: http://localhost:5173 (con HMR)
- **Backend API**: http://localhost:3000
- **Adminer**: http://localhost:8080
- **PostgreSQL**: localhost:5432

### Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose -f docker-compose.dev.yml logs -f

# Solo backend
docker-compose -f docker-compose.dev.yml logs -f backend

# Solo frontend
docker-compose -f docker-compose.dev.yml logs -f frontend
```

### Detener el entorno

```bash
docker-compose -f docker-compose.dev.yml down
```

Para eliminar también los volúmenes (reinicio completo):

```bash
docker-compose -f docker-compose.dev.yml down -v
```

### Rebuilds

Si cambias dependencias en `package.json`:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

---

## 💻 Desarrollo Local (Sin Docker)

### Backend

1. **Instalar dependencias**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar base de datos**
   ```bash
   # Crear base de datos
   createdb anima_counter_dev

   # Aplicar schema
   psql anima_counter_dev < ../init-db/01-schema.sql
   ```

3. **Configurar variables de entorno**

   Crear `backend/.env`:
   ```env
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=anima_counter_dev
   DB_USER=tu_usuario
   DB_PASSWORD=tu_password
   PORT=3000
   JWT_SECRET=dev_secret_key
   FRONTEND_URL=http://localhost:5173
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

El backend estará disponible en http://localhost:3000

### Frontend

1. **Instalar dependencias**
   ```bash
   cd frontend
   npm install
   ```

2. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

El frontend estará disponible en http://localhost:5173

---

## 📁 Estructura de Archivos

### Archivos de Docker

```
.
├── Dockerfile                    # Frontend producción (multi-stage)
├── docker-compose.yaml          # Producción
├── docker-compose.dev.yml       # Desarrollo (hot-reload)
├── .dockerignore                # Archivos a ignorar en builds
│
├── backend/
│   ├── Dockerfile               # Backend producción (multi-stage)
│   └── Dockerfile.dev           # Backend desarrollo
│
└── frontend/
    └── Dockerfile.dev           # Frontend desarrollo
```

### Optimizaciones implementadas

#### ✅ Multi-stage builds
- **Backend**: 2 stages (deps → production)
- **Frontend**: 3 stages (deps → builder → production)

#### ✅ Layer caching
- Dependencias se copian primero
- Código fuente se copia después
- Aprovecha cache de Docker entre builds

#### ✅ Imágenes Alpine
- Todas las imágenes base usan Alpine Linux
- Reduce tamaño de imágenes en ~70%

#### ✅ Seguridad
- Usuario no-root en contenedores
- Healthchecks configurados
- Secrets vía variables de entorno

---

## 🚀 Scripts Disponibles

### Backend (`backend/package.json`)

```bash
npm start          # Ejecutar en producción
npm run dev        # Desarrollo con nodemon (hot-reload)
npm test          # Ejecutar tests (pendiente)
```

### Frontend (`frontend/package.json`)

```bash
npm run dev        # Desarrollo con Vite (HMR)
npm run build      # Build para producción
npm run preview    # Preview del build de producción
npm run lint       # Ejecutar ESLint (pendiente)
```

---

## 🐛 Debugging

### Backend con VS Code

Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Docker: Attach to Backend",
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}/backend",
      "remoteRoot": "/usr/src/app",
      "protocol": "inspector",
      "restart": true
    }
  ]
}
```

Con el entorno de desarrollo corriendo, conecta el debugger (F5).

### Frontend con Vue DevTools

Instala la extensión de Vue DevTools en tu navegador:
- [Chrome](https://chrome.google.com/webstore/detail/vuejs-devtools)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

---

## ✨ Best Practices

### Commits

```bash
# Commits atómicos y descriptivos
git commit -m "feat: add spell search functionality"
git commit -m "fix: resolve zeon calculation bug"
git commit -m "docs: update API endpoints"
```

Convención de mensajes:
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` cambios en documentación
- `style:` formato, punto y coma, etc
- `refactor:` refactorización de código
- `test:` añadir o modificar tests
- `chore:` mantenimiento, dependencias, etc

### Branches

```bash
# Crear branch para nueva feature
git checkout -b feature/nombre-feature

# Crear branch para fix
git checkout -b fix/nombre-bug

# Merge a main solo cuando esté probado
git checkout main
git merge feature/nombre-feature
```

### Testing Manual

Antes de hacer commit de cambios importantes:

1. ✅ Probar login/registro
2. ✅ Probar CRUD de hechizos
3. ✅ Probar gestión de Zeon
4. ✅ Probar reset de combate
5. ✅ Verificar que no hay errores en consola

---

## 🔧 Troubleshooting

### Puerto ya en uso

```bash
# Ver qué está usando el puerto
lsof -i :3000
lsof -i :5173

# Matar proceso
kill -9 <PID>

# O cambiar puerto en .env
BACKEND_PORT=3001
FRONTEND_PORT=5174
```

### Problemas con node_modules

```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install

# En Docker, rebuild sin cache
docker-compose -f docker-compose.dev.yml build --no-cache
```

### Base de datos no conecta

```bash
# Verificar que PostgreSQL está corriendo
docker-compose -f docker-compose.dev.yml ps

# Ver logs de PostgreSQL
docker-compose -f docker-compose.dev.yml logs postgres

# Recrear contenedor de BD
docker-compose -f docker-compose.dev.yml up -d --force-recreate postgres
```

### Hot-reload no funciona

**Docker**:
```bash
# Verificar que los volúmenes están montados
docker-compose -f docker-compose.dev.yml config

# Recrear contenedores
docker-compose -f docker-compose.dev.yml up -d --force-recreate
```

**Local**:
```bash
# Verificar versión de nodemon/vite
npm list nodemon
npm list vite

# Reinstalar
npm install nodemon --save-dev
```

### Permisos en archivos (Linux/Mac)

```bash
# Si los archivos creados por Docker no son editables
sudo chown -R $USER:$USER .

# O agregar tu usuario al grupo docker
sudo usermod -aG docker $USER
```

---

## 📚 Recursos Adicionales

- [Documentación de API](./API.md)
- [README Principal](../README.md)
- [Plan de Desarrollo](../PLAN.md)
- [Vue 3 Docs](https://vuejs.org/)
- [Vite Docs](https://vitejs.dev/)
- [Express Docs](https://expressjs.com/)
- [Docker Docs](https://docs.docker.com/)

---

## 🤝 ¿Necesitas Ayuda?

- 🐛 [Reportar un bug](../../issues)
- 💬 [Discusiones](../../discussions)
- 📧 Contacto: [tu-email@example.com]

---

**Happy Coding! 🚀**

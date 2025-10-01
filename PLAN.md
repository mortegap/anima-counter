# 📋 PLAN DE MEJORAS - ANIMA COUNTER

## 📊 ANÁLISIS DEL ESTADO ACTUAL

### Resumen del Proyecto
- **Aplicación**: Contador de Zeon para el juego de rol Anima Beyond Fantasy
- **Stack Tecnológico**: 
  - Frontend: Vue.js 2 embebido en HTML
  - Backend: Node.js/Express
  - Base de datos: PostgreSQL
  - Infraestructura: Docker/Docker Compose/Nginx
- **Estado**: Funcional pero con arquitectura legacy y código no optimizado

### Problemas Identificados

#### 🎨 Frontend
1. Vue.js 2 cargado desde CDN (versión obsoleta)
2. Todo el código en index.html (1400+ líneas)
3. Sin sistema de componentes modularizado
4. Sin build process (webpack/vite)
5. Estructura frontend/src vacía y sin usar
6. Dependencias cargadas desde CDN sin versionado fijo
7. CSS mezclado inline y en archivo externo
8. Sin sistema de enrutamiento real
9. Manejo de estado local sin Vuex/Pinia

#### ⚙️ Backend
1. Dos archivos de servidor duplicados (server.js y server-simple.js)
2. Rutas comentadas en server.js
3. Lógica de autenticación duplicada
4. Sin estructura MVC clara
5. Falta de validación consistente
6. Sin manejo de errores centralizado
7. Sin tests unitarios o de integración
8. Sin documentación de API

#### 🗄️ Base de Datos
1. Sin archivo de esquema SQL visible
2. Sin sistema de migraciones
3. Sin seeders para datos de prueba
4. Sin índices optimizados definidos

#### 🐳 Docker/Infraestructura
1. Sin optimización de imágenes Docker
2. Sin healthchecks en todos los servicios
3. Variables de entorno sensibles en .env
4. Sin configuración para diferentes entornos

#### 📝 General
1. Sin ESLint/Prettier configurado
2. Sin pre-commit hooks
3. Sin CI/CD pipeline
4. Documentación incompleta
5. Sin logging centralizado
6. Sin monitoreo o métricas

---

## 🎯 PLAN DE MEJORAS SECUENCIAL

### FASE 1: LIMPIEZA Y ORGANIZACIÓN BACKEND (Prioridad: ALTA)
**Objetivo**: Consolidar y limpiar el código backend existente

#### Paso 1.1: Consolidar Servidores
```bash
# Ubicación: /backend/
```

**Acciones:**
1. **Analizar diferencias entre server.js y server-simple.js**
   - Abrir ambos archivos lado a lado
   - Identificar funcionalidades únicas en cada uno
   - Documentar qué endpoints están activos

2. **Crear backup del código actual**
   ```bash
   cp backend/server.js backend/server.js.backup
   cp backend/server-simple.js backend/server-simple.js.backup
   ```

3. **Consolidar en un único server.js**
   - Mantener TODA la funcionalidad de server-simple.js (que está funcionando)
   - Integrar las rutas comentadas de server.js si son necesarias
   - Eliminar código duplicado
   - Resultado: UN SOLO archivo server.js funcional

4. **Actualizar Dockerfile del backend**
   - Cambiar CMD para usar server.js en lugar de server-simple.js

#### Paso 1.2: Estructurar el Backend con MVC
```bash
# Nueva estructura en /backend/
```

**Crear estructura de carpetas:**
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js    # Configuración de PostgreSQL
│   │   └── constants.js   # Constantes de la aplicación
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── gameStateController.js
│   │   ├── spellsController.js
│   │   └── profilesController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Profile.js
│   │   ├── GameState.js
│   │   └── Spell.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── gameState.routes.js
│   │   ├── spells.routes.js
│   │   └── profiles.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   └── error.middleware.js
│   ├── utils/
│   │   ├── password.utils.js
│   │   └── jwt.utils.js
│   └── server.js
├── tests/
├── package.json
└── Dockerfile
```

**Acciones secuenciales:**

1. **Crear config/database.js**
   - Mover configuración de Pool de PostgreSQL aquí
   - Exportar instancia singleton del pool
   - Añadir función de healthcheck de DB

2. **Crear utils/password.utils.js**
   - Mover funciones hashPassword y verifyPassword
   - Exportar como módulo

3. **Crear utils/jwt.utils.js**
   - Mover generateToken y verificación
   - Centralizar configuración JWT_SECRET

4. **Crear controladores uno por uno**
   - authController.js: login, register, verify, changePassword
   - gameStateController.js: get, update, reset
   - spellsController.js: list, create, delete
   - profilesController.js: list, create, update, delete

5. **Actualizar rutas**
   - Usar express.Router() en cada archivo de rutas
   - Importar controladores correspondientes
   - Aplicar middleware donde corresponda

6. **Actualizar server.js principal**
   - Importar todas las rutas
   - Configurar middleware global
   - Mantener estructura limpia

#### Paso 1.3: Añadir Validación y Manejo de Errores

1. **Instalar dependencias necesarias**
   ```json
   "dependencies": {
     "joi": "^17.9.2",
     "winston": "^3.10.0"
   }
   ```

2. **Crear schemas de validación con Joi**
   - Crear carpeta `backend/src/schemas/`
   - Definir schemas para cada entidad

3. **Implementar middleware de validación**
   - Validar body, params, query
   - Retornar errores consistentes

4. **Implementar logger con Winston**
   - Configurar niveles de log
   - Guardar logs en archivos
   - Formato consistente

### FASE 2: CREAR ESQUEMA DE BASE DE DATOS (Prioridad: ALTA)

#### Paso 2.1: Documentar Esquema Actual

1. **Crear o actualizar archivo init-db/01-schema.sql**
   ```sql
   -- Esquema completo de la base de datos
   CREATE DATABASE IF NOT EXISTS anima_counter;
   
   -- Tabla users
   CREATE TABLE IF NOT EXISTS users (
     id SERIAL PRIMARY KEY,
     username VARCHAR(50) UNIQUE NOT NULL,
     email VARCHAR(100) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     display_name VARCHAR(100),
     is_active BOOLEAN DEFAULT true,
     last_login TIMESTAMP,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Tabla user_profiles
   CREATE TABLE IF NOT EXISTS user_profiles (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     name VARCHAR(100) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Tabla game_state
   CREATE TABLE IF NOT EXISTS game_state (
     id SERIAL PRIMARY KEY,
     user_profile_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
     turn_number INTEGER DEFAULT 0,
     zeon INTEGER DEFAULT 0,
     rzeon INTEGER DEFAULT 0,
     zeona INTEGER DEFAULT 0,
     act INTEGER DEFAULT 0,
     rzeoni INTEGER DEFAULT 0,
     zeonp INTEGER DEFAULT 0,
     acu BOOLEAN DEFAULT false,
     lock_state INTEGER DEFAULT 0,
     zeon_to_spend INTEGER DEFAULT 0,
     mantain_zeon_to_spend INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(user_profile_id)
   );
   
   -- Tabla spells
   CREATE TABLE IF NOT EXISTS spells (
     id SERIAL PRIMARY KEY,
     user_profile_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
     spell_name VARCHAR(100) NOT NULL,
     spell_base INTEGER NOT NULL,
     spell_inter INTEGER NOT NULL,
     spell_advanced INTEGER NOT NULL,
     spell_arcane INTEGER NOT NULL,
     spell_base_mantain INTEGER DEFAULT 0,
     spell_inter_mantain INTEGER DEFAULT 0,
     spell_advanced_mantain INTEGER DEFAULT 0,
     spell_arcane_mantain INTEGER DEFAULT 0,
     spell_via VARCHAR(50),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Tabla ready_to_cast
   CREATE TABLE IF NOT EXISTS ready_to_cast (
     id SERIAL PRIMARY KEY,
     user_profile_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
     spell_id INTEGER REFERENCES spells(id) ON DELETE SET NULL,
     spell_name VARCHAR(100) NOT NULL,
     spell_zeon INTEGER NOT NULL,
     spell_mantain INTEGER DEFAULT 0,
     spell_mantain_turn BOOLEAN DEFAULT false,
     spell_index INTEGER,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Tabla spell_mantain_list
   CREATE TABLE IF NOT EXISTS spell_mantain_list (
     id SERIAL PRIMARY KEY,
     user_profile_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
     spell_id INTEGER REFERENCES spells(id) ON DELETE SET NULL,
     spell_name VARCHAR(100) NOT NULL,
     spell_mantain INTEGER NOT NULL,
     spell_index INTEGER,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Índices para mejorar rendimiento
   CREATE INDEX idx_users_username ON users(username);
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
   CREATE INDEX idx_game_state_profile_id ON game_state(user_profile_id);
   CREATE INDEX idx_spells_profile_id ON spells(user_profile_id);
   CREATE INDEX idx_ready_to_cast_profile_id ON ready_to_cast(user_profile_id);
   CREATE INDEX idx_spell_mantain_profile_id ON spell_mantain_list(user_profile_id);
   ```

2. **Crear o actualizar archivo init-db/02-seed-data.sql** (Opcional)
   ```sql
   -- Datos de prueba para desarrollo
   ```

### FASE 3: MODERNIZAR FRONTEND (Prioridad: MEDIA)

#### Paso 3.1: Migrar a Vue 3 con Vite

1. **Crear nuevo proyecto Vue 3 en carpeta temporal**
   ```bash
   npm create vite@latest frontend-new -- --template vue
   cd frontend-new
   npm install
   ```

2. **Instalar dependencias necesarias**
   ```json
   {
     "dependencies": {
       "vue": "^3.3.4",
       "vue-router": "^4.2.4",
       "pinia": "^2.1.6",
       "axios": "^1.5.0",
       "@vueuse/core": "^10.4.1"
     },
     "devDependencies": {
       "vite": "^4.4.9",
       "@vitejs/plugin-vue": "^4.3.4",
       "eslint": "^8.49.0",
       "eslint-plugin-vue": "^9.17.0",
       "prettier": "^3.0.3",
       "sass": "^1.66.1"
     }
   }
   ```

3. **Crear estructura de componentes**
   ```
   frontend-new/src/
   ├── assets/
   │   ├── styles/
   │   │   ├── main.scss
   │   │   ├── variables.scss
   │   │   └── components/
   │   └── images/
   ├── components/
   │   ├── auth/
   │   │   ├── LoginForm.vue
   │   │   └── RegisterForm.vue
   │   ├── game/
   │   │   ├── TurnCounter.vue
   │   │   ├── ZeonStats.vue
   │   │   └── CharacterStats.vue
   │   ├── spells/
   │   │   ├── SpellBook.vue
   │   │   ├── SpellForm.vue
   │   │   ├── ReadyToCast.vue
   │   │   └── MaintainedSpells.vue
   │   └── layout/
   │       ├── AppHeader.vue
   │       ├── AppFooter.vue
   │       └── ThemeToggle.vue
   ├── composables/
   │   ├── useAuth.js
   │   ├── useGameState.js
   │   └── useSpells.js
   ├── router/
   │   └── index.js
   ├── stores/
   │   ├── auth.js
   │   ├── gameState.js
   │   └── spells.js
   ├── services/
   │   ├── api.js
   │   ├── auth.service.js
   │   └── game.service.js
   ├── utils/
   │   └── validators.js
   ├── views/
   │   ├── HomeView.vue
   │   ├── LoginView.vue
   │   ├── RegisterView.vue
   │   └── GameView.vue
   ├── App.vue
   └── main.js
   ```

#### Paso 3.2: Migrar Funcionalidad Existente

**IMPORTANTE: Hacer esto componente por componente**

1. **Extraer lógica de autenticación**
   - Crear store de Pinia para auth
   - Migrar métodos login/register/logout
   - Implementar guards de navegación

2. **Migrar componente de estadísticas**
   - Crear CharacterStats.vue
   - Migrar data: zeon, rzeon, act, rzeoni, etc.
   - Migrar métodos: addDay, lockUnlock

3. **Migrar componente de turnos**
   - Crear TurnCounter.vue
   - Migrar lógica de turnos
   - Migrar método reset

4. **Migrar sistema de hechizos**
   - Crear SpellBook.vue para lista de hechizos
   - Crear SpellForm.vue para añadir hechizos
   - Crear ReadyToCast.vue para hechizos preparados
   - Crear MaintainedSpells.vue para mantenimientos

5. **Implementar sistema de rutas**
   ```javascript
   // router/index.js
   const routes = [
     { path: '/', component: HomeView },
     { path: '/login', component: LoginView },
     { path: '/register', component: RegisterView },
     { path: '/game', component: GameView, meta: { requiresAuth: true } }
   ]
   ```

#### Paso 3.3: Configurar Build Process

1. **Actualizar vite.config.js**
   ```javascript
   export default {
     base: '/',
     build: {
       outDir: 'dist',
       assetsDir: 'assets'
     },
     server: {
       proxy: {
         '/api': {
           target: 'http://localhost:3000',
           changeOrigin: true
         }
       }
     }
   }
   ```

2. **Actualizar Dockerfile del frontend**
   ```dockerfile
   # Build stage
   FROM node:18-alpine as builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   # Production stage
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

### FASE 4: OPTIMIZACIÓN Y TESTING (Prioridad: MEDIA)

#### Paso 4.1: Añadir Tests al Backend

1. **Instalar dependencias de testing**
   ```json
   "devDependencies": {
     "jest": "^29.6.4",
     "supertest": "^6.3.3",
     "@types/jest": "^29.5.4"
   }
   ```

2. **Crear estructura de tests**
   ```
   backend/tests/
   ├── unit/
   │   ├── controllers/
   │   ├── middleware/
   │   └── utils/
   └── integration/
       ├── auth.test.js
       ├── gameState.test.js
       └── spells.test.js
   ```

3. **Configurar jest.config.js**
   ```javascript
   module.exports = {
     testEnvironment: 'node',
     coverageDirectory: 'coverage',
     collectCoverageFrom: [
       'src/**/*.js',
       '!src/server.js'
     ]
   }
   ```

4. **Escribir tests básicos para cada endpoint**

#### Paso 4.2: Añadir Tests al Frontend

1. **Instalar Vitest**
   ```bash
   npm install -D vitest @vue/test-utils
   ```

2. **Crear tests para componentes críticos**
   ```
   frontend-new/tests/
   ├── unit/
   │   ├── components/
   │   └── stores/
   └── e2e/
   ```

### FASE 5: CONFIGURACIÓN DE DESARROLLO (Prioridad: BAJA)

#### Paso 5.1: Configurar ESLint y Prettier

1. **Crear .eslintrc.js en raíz**
   ```javascript
   module.exports = {
     root: true,
     extends: [
       'eslint:recommended',
       'plugin:vue/vue3-recommended',
       'prettier'
     ],
     rules: {
       'vue/multi-word-component-names': 'off'
     }
   }
   ```

2. **Crear .prettierrc**
   ```json
   {
     "semi": false,
     "singleQuote": true,
     "tabWidth": 2,
     "trailingComma": "none"
   }
   ```

#### Paso 5.2: Configurar Git Hooks

1. **Instalar husky y lint-staged**
   ```bash
   npm install -D husky lint-staged
   npx husky init
   ```

2. **Configurar pre-commit hook**
   ```json
   // package.json
   "lint-staged": {
     "*.{js,vue}": ["eslint --fix", "prettier --write"]
   }
   ```

### FASE 6: DOCUMENTACIÓN (Prioridad: BAJA)

#### Paso 6.1: Crear Documentación de API

1. **Crear archivo docs/API.md**
   - Documentar todos los endpoints
   - Incluir ejemplos de request/response
   - Documentar códigos de error

2. **Implementar Swagger (Opcional)**
   ```bash
   npm install swagger-jsdoc swagger-ui-express
   ```

#### Paso 6.2: Actualizar README

1. **Actualizar README.md principal**
   - Incluir nueva arquitectura
   - Actualizar instrucciones de instalación
   - Añadir sección de desarrollo

### FASE 7: OPTIMIZACIÓN DOCKER (Prioridad: BAJA)

#### Paso 7.1: Optimizar Imágenes

1. **Usar multi-stage builds**
2. **Minimizar layers**
3. **Usar imágenes Alpine**
4. **Implementar cache de dependencias**

#### Paso 7.2: Crear docker-compose para desarrollo

1. **Crear docker-compose.dev.yml**
   - Montar volúmenes para hot-reload
   - Exponer puertos de debug
   - Variables de entorno de desarrollo

### FASE 8: CI/CD (Prioridad: BAJA)

#### Paso 8.1: Configurar GitHub Actions

1. **Crear .github/workflows/ci.yml**
   ```yaml
   name: CI
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Run tests
           run: |
             npm install
             npm test
   ```

---

## 📌 ORDEN DE EJECUCIÓN RECOMENDADO

### Semana 1: Backend
1. **Día 1-2**: Consolidar servidores (Fase 1.1)
2. **Día 3-4**: Estructurar MVC (Fase 1.2)
3. **Día 5**: Validación y errores (Fase 1.3)

### Semana 2: Base de Datos y Frontend Inicial
1. **Día 1**: Esquema de BD (Fase 2)
2. **Día 2-3**: Setup Vue 3 (Fase 3.1)
3. **Día 4-5**: Migrar componentes básicos (Fase 3.2)

### Semana 3: Frontend Completo
1. **Día 1-3**: Completar migración de componentes
2. **Día 4**: Configurar build (Fase 3.3)
3. **Día 5**: Testing básico

### Semana 4: Pulido y Despliegue
1. **Día 1-2**: Tests completos (Fase 4)
2. **Día 3**: Configuración desarrollo (Fase 5)
3. **Día 4**: Documentación (Fase 6)
4. **Día 5**: Optimización Docker (Fase 7)

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### Mantener Funcionalidad
- **NUNCA** eliminar funcionalidad existente
- Hacer cambios incrementales
- Probar cada cambio antes de continuar
- Mantener backups del código funcionando

### Prioridades
1. **CRÍTICO**: Backend funcional y limpio
2. **IMPORTANTE**: Base de datos documentada
3. **DESEABLE**: Frontend moderno
4. **OPCIONAL**: CI/CD y optimizaciones

### Testing
- Probar manualmente después de cada cambio
- No avanzar si algo deja de funcionar
- Mantener la aplicación funcionando en todo momento

### Versionado
- Hacer commits frecuentes
- Usar branches para cambios grandes
- Mantener main/master siempre funcional

---

## 📋 CHECKLIST FINAL

### Backend
- [ ] Un único archivo server.js funcional
- [ ] Estructura MVC implementada
- [ ] Validación con Joi
- [ ] Manejo de errores centralizado
- [ ] Logger configurado
- [ ] Tests unitarios básicos

### Frontend
- [ ] Vue 3 con Vite
- [ ] Componentes modulares
- [ ] Router configurado
- [ ] Store con Pinia
- [ ] Build optimizado

### Base de Datos
- [ ] Esquema SQL documentado
- [ ] Índices optimizados
- [ ] Migraciones configuradas

### DevOps
- [ ] Docker optimizado
- [ ] Variables de entorno seguras
- [ ] Documentación completa
- [ ] CI/CD básico

### Calidad
- [ ] ESLint configurado
- [ ] Prettier configurado
- [ ] Pre-commit hooks
- [ ] Tests >70% cobertura

---

## 🚀 RESULTADO ESPERADO

Una aplicación moderna, mantenible y escalable con:
- Código limpio y organizado
- Arquitectura clara y documentada
- Tests automatizados
- Despliegue containerizado
- Documentación completa
- Mejores prácticas implementadas

**Tiempo estimado total**: 4 semanas trabajando 2-3 horas diarias
**Nivel de dificultad**: Medio-Alto
**Impacto en UX**: Mínimo (misma funcionalidad, mejor rendimiento)
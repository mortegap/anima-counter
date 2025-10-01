# Anima Counter - Aplicación Persistente con Docker

Esta aplicación Vue.js para el contador de Zeon de Anima RPG ahora cuenta con persistencia de datos usando PostgreSQL y una API backend en Node.js/Express.

## 🚀 Características

- **Frontend**: Vue.js 2 con interfaz responsive
- **Backend**: Node.js/Express con API RESTful
- **Base de datos**: PostgreSQL 15 con persistencia completa
- **Containerización**: Docker y Docker Compose
- **Administración**: Adminer para gestión de la base de datos

## 📁 Estructura del Proyecto

```
anima-counter/
├── backend/                    # API Node.js/Express
│   ├── package.json
│   ├── server.js
│   └── Dockerfile
├── init-db/                    # Scripts de inicialización de BD
│   └── 01-init.sql
├── index.html                  # Frontend Vue.js actualizado
├── index.js                    # Funcionalidad de tema
├── style.css                   # Estilos
├── nginx.conf                  # Configuración de nginx
├── docker-compose.yaml         # Orquestación de servicios
├── Dockerfile                  # Container del frontend
└── .env                        # Variables de entorno
```

## 🔧 Instalación y Ejecución

### Prerrequisitos
- Docker
- Docker Compose

### Ejecutar la aplicación

1. **Clonar y navegar al directorio**:
   ```bash
   cd anima-counter
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   # Edita .env si necesitas cambiar alguna configuración
   ```

3. **Construir y ejecutar todos los servicios**:
   ```bash
   docker-compose up -d
   ```

4. **Verificar que los servicios estén ejecutándose**:
   ```bash
   docker-compose ps
   ```

### 🌐 Acceso a los servicios

- **Aplicación Frontend**: http://localhost
- **API Backend**: http://localhost:3000
- **Adminer (Gestión DB)**: http://localhost:8080
- **PostgreSQL**: localhost:5432

### 🗄️ Credenciales de la base de datos

- **Host**: localhost (desde fuera del container) / postgres (desde dentro)
- **Puerto**: 5432
- **Base de datos**: anima_counter
- **Usuario**: anima_user
- **Contraseña**: anima_password_2024

## 📊 Estructura de la Base de Datos

### Tablas principales:

1. **user_profiles**: Perfiles de usuario
2. **game_state**: Estado actual del juego (turnos, zeon, etc.)
3. **spells**: Libro de hechizos personalizado
4. **ready_to_cast**: Hechizos preparados para lanzar
5. **spell_mantain_list**: Hechizos en mantenimiento

## 🔄 Persistencia de Datos

La aplicación ahora guarda automáticamente:

- ✅ Estado del juego (turnos, zeon, reservas, etc.)
- ✅ Libro de hechizos personalizado
- ✅ Hechizos listos para lanzar
- ✅ Hechizos en mantenimiento
- ✅ Configuraciones de ACT y regeneración

Los datos se sincronizan automáticamente con la base de datos en tiempo real.

## 🛠️ Comandos útiles

### Logs de los contenedores
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Gestión de servicios
```bash
# Detener todos los servicios
docker-compose stop

# Reiniciar un servicio específico
docker-compose restart backend

# Reconstruir y ejecutar
docker-compose up --build -d

# Eliminar todo (incluyendo volúmenes)
docker-compose down -v
```

### Backup de la base de datos
```bash
# Crear backup
docker-compose exec postgres pg_dump -U anima_user anima_counter > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U anima_user anima_counter < backup.sql
```

## 🔧 Desarrollo

### Variables de entorno

Las variables de entorno están configuradas en el archivo `.env`. Copia `.env.example` a `.env` y modifica según tu configuración:

```bash
cp .env.example .env
```

**Variables disponibles:**

#### PostgreSQL Database
- `POSTGRES_DB`: Nombre de la base de datos
- `POSTGRES_USER`: Usuario de PostgreSQL
- `POSTGRES_PASSWORD`: Contraseña de PostgreSQL
- `POSTGRES_HOST_AUTH_METHOD`: Método de autenticación

#### Conexión de aplicaciones
- `DB_HOST`: Host de la base de datos (postgres para Docker, localhost para desarrollo)
- `DB_PORT`: Puerto de PostgreSQL (5432)
- `DB_NAME`: Nombre de la base de datos
- `DB_USER`: Usuario para las aplicaciones
- `DB_PASSWORD`: Contraseña para las aplicaciones

#### Backend API
- `NODE_ENV`: Entorno de Node.js (production/development)
- `BACKEND_PORT`: Puerto del backend API (3000)
- `FRONTEND_URL`: URL del frontend para CORS

#### Frontend
- `APP_PORT`: Puerto de la aplicación web (80)

#### Herramientas
- `ADMINER_DEFAULT_SERVER`: Servidor por defecto para Adminer
- `DATABASE_URL`: URL completa de conexión a la base de datos

### API Endpoints

La API backend expone los siguientes endpoints:

- `GET /api/profiles` - Obtener perfiles
- `POST /api/profiles` - Crear perfil
- `GET /api/gamestate/:profileId` - Obtener estado del juego
- `PUT /api/gamestate/:profileId` - Actualizar estado del juego
- `GET /api/spells/:profileId` - Obtener hechizos
- `POST /api/spells/:profileId` - Crear hechizo
- `DELETE /api/spells/:profileId/:spellId` - Eliminar hechizo
- `GET /api/ready-to-cast/:profileId` - Obtener hechizos listos
- `POST /api/ready-to-cast/:profileId` - Agregar hechizo listo
- `DELETE /api/ready-to-cast/:profileId/:id` - Eliminar hechizo listo
- `GET /api/spell-mantain/:profileId` - Obtener hechizos en mantenimiento
- `POST /api/spell-mantain/:profileId` - Agregar hechizo en mantenimiento
- `DELETE /api/spell-mantain/:profileId/:id` - Eliminar hechizo en mantenimiento

## 🚨 Solución de Problemas

### La aplicación no se conecta a la base de datos
1. Verificar que PostgreSQL esté ejecutándose: `docker-compose ps`
2. Revisar logs: `docker-compose logs postgres`
3. Verificar conectividad: `docker-compose exec backend ping postgres`

### El frontend no puede conectarse al backend
1. Verificar que el backend esté ejecutándose: `docker-compose logs backend`
2. Probar la API directamente: `curl http://localhost:3000/health`

### Problemas de permisos
```bash
# Reconstruir sin cache
docker-compose build --no-cache

# Reiniciar Docker (en caso extremo)
sudo systemctl restart docker
```

## 📝 Notas

- Los datos persisten entre reinicios gracias al volumen `postgres_data`
- La aplicación crea automáticamente un perfil por defecto si no existe ninguno
- Los hechizos se guardan inmediatamente al añadirlos
- El estado del juego se sincroniza automáticamente al hacer cambios

¡La aplicación ahora es completamente persistente y lista para usar en producción!
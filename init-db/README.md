# 📚 Esquema de Base de Datos - Anima Counter

## 📋 Descripción

Este directorio contiene el esquema completo de la base de datos PostgreSQL para la aplicación Anima Counter.

## 🗂️ Archivos

### `01-schema.sql`
**Esquema principal de la base de datos**
- Definición completa de todas las tablas
- Funciones y triggers
- Índices optimizados
- Comentarios de documentación

### `02-seed-data.sql` (Opcional)
**Datos de prueba para desarrollo**
- Usuarios demo para testing
- Perfiles de ejemplo
- Estados de juego iniciales
- Hechizos de muestra

⚠️ **NOTA**: Los datos de prueba NO deben usarse en producción.

## 🏗️ Estructura de Tablas

### Autenticación
- **`users`**: Usuarios del sistema
- **`user_sessions`**: Gestión de sesiones y tokens JWT

### Perfiles y Juego
- **`user_profiles`**: Perfiles/personajes de cada usuario
- **`game_state`**: Estado del contador de Zeon

### Hechizos
- **`spells`**: Libro de hechizos (persistente)
- **`ready_to_cast`**: Hechizos preparados (temporal)
- **`spell_mantain_list`**: Hechizos en mantenimiento (temporal)

## 🔗 Relaciones

```
users (1) ──→ (N) user_profiles
users (1) ──→ (N) user_sessions

user_profiles (1) ──→ (1) game_state
user_profiles (1) ──→ (N) spells
user_profiles (1) ──→ (N) ready_to_cast
user_profiles (1) ──→ (N) spell_mantain_list

spells (1) ──→ (N) ready_to_cast
spells (1) ──→ (N) spell_mantain_list
```

## 🔑 Tipos de Datos

### Valores Persistentes (NO se resetean en login)
- `rzeon` - Zeon máximo
- `zeon` - Zeon actual
- `act` - ACT del personaje
- `rzeoni` - Regeneración zeónica
- `lock_state` - Estado de bloqueo
- `spells` - Lista de hechizos del libro

### Valores Temporales (SE resetean en login)
- `turn_number` - Número de turno
- `zeona` - Zeon acumulado
- `zeonp` - Zeon perdido
- `zeon_to_spend` - Zeon a gastar calculado
- `mantain_zeon_to_spend` - Zeon de mantenimiento
- `ready_to_cast` - Hechizos preparados
- `spell_mantain_list` - Hechizos mantenidos

## 🚀 Uso

### Inicialización Manual
```bash
# Conectar a la base de datos
docker exec -it anima-counter-db psql -U anima_user -d anima_counter

# Ejecutar esquema
\i /docker-entrypoint-initdb.d/01-schema.sql

# (Opcional) Cargar datos de prueba
\i /docker-entrypoint-initdb.d/02-seed-data.sql
```

### Inicialización Automática (Docker)
Los archivos en `init-db/` se ejecutan automáticamente al crear el contenedor de PostgreSQL por primera vez.

## 📊 Índices Optimizados

### Tablas de Usuario
- `idx_users_username` - Búsqueda por username
- `idx_users_email` - Búsqueda por email
- `idx_user_profiles_user_id` - Relación user → profiles

### Tablas de Juego
- `idx_game_state_user_profile` - Estado por perfil
- `idx_spells_user_profile` - Hechizos por perfil
- `idx_ready_to_cast_user_profile` - Hechizos preparados por perfil
- `idx_spell_mantain_list_user_profile` - Mantenimiento por perfil

### Tablas de Sesión
- `idx_user_sessions_user_id` - Sesiones por usuario
- `idx_user_sessions_token_hash` - Búsqueda de tokens

## 🔄 Triggers

### Actualización Automática de `updated_at`
- `update_users_updated_at` → Tabla `users`
- `update_user_profiles_updated_at` → Tabla `user_profiles`
- `update_game_state_updated_at` → Tabla `game_state`

### Función: `update_updated_at_column()`
Actualiza automáticamente el campo `updated_at` a `CURRENT_TIMESTAMP` en cada UPDATE.

## 🔐 Seguridad

- Todas las contraseñas se almacenan hasheadas con PBKDF2
- Las sesiones tienen expiración y pueden revocarse
- Eliminación en cascada para integridad referencial
- UUID como claves primarias para mayor seguridad

## 🧹 Mantenimiento

### Limpiar Sesiones Expiradas
```sql
SELECT cleanup_expired_sessions();
```

### Ver Estructura de una Tabla
```sql
\d nombre_tabla
```

### Ver Todos los Índices
```sql
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public';
```

## 📝 Notas

- El esquema usa UUID v4 para todas las claves primarias
- Timestamps en formato UTC sin zona horaria
- Restricción `ON DELETE CASCADE` para limpieza automática
- Campos `created_at` y `updated_at` en tablas principales

## 🔗 Referencias

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [UUID Best Practices](https://www.postgresql.org/docs/current/datatype-uuid.html)
- [Indexing Strategies](https://www.postgresql.org/docs/current/indexes.html)

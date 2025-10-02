# 🔍 Consultas Útiles - Anima Counter Database

## Conexión a la Base de Datos

```bash
# Conectar a PostgreSQL desde Docker
docker exec -it anima-counter-db psql -U anima_user -d anima_counter

# Conectar desde host (si puerto expuesto)
psql -h localhost -p 5432 -U anima_user -d anima_counter
```

## Comandos PostgreSQL Básicos

```sql
-- Listar todas las tablas
\dt

-- Describir estructura de una tabla
\d nombre_tabla

-- Listar todos los índices
\di

-- Listar todas las funciones
\df

-- Ver definición de una función
\df+ nombre_funcion

-- Salir
\q
```

## Consultas de Verificación

### Ver Esquema General
```sql
-- Resumen de todas las tablas con conteo de registros
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Verificar Índices
```sql
-- Ver todos los índices con tamaño
SELECT
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_indexes
JOIN pg_class ON pg_indexes.indexname = pg_class.relname
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Verificar Triggers
```sql
-- Listar todos los triggers
SELECT
    trigger_name,
    event_object_table AS table_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

## Consultas de Datos

### Usuarios y Perfiles
```sql
-- Ver todos los usuarios con sus perfiles
SELECT
    u.username,
    u.email,
    u.display_name,
    COUNT(up.id) as total_profiles
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
GROUP BY u.id
ORDER BY u.created_at DESC;

-- Ver perfiles con estado de juego
SELECT
    u.username,
    up.name as profile_name,
    gs.turn_number,
    gs.zeon,
    gs.rzeon,
    gs.act
FROM users u
JOIN user_profiles up ON u.id = up.user_id
JOIN game_state gs ON up.id = gs.user_profile_id
ORDER BY u.username, up.name;
```

### Hechizos
```sql
-- Ver hechizos por perfil
SELECT
    u.username,
    up.name as profile_name,
    COUNT(s.id) as total_spells
FROM users u
JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN spells s ON up.id = s.user_profile_id
GROUP BY u.id, up.id
ORDER BY u.username;

-- Ver hechizos de un usuario específico
SELECT
    up.name as profile_name,
    s.spell_name,
    s.spell_base,
    s.spell_inter,
    s.spell_advanced,
    s.spell_arcane,
    s.spell_via
FROM spells s
JOIN user_profiles up ON s.user_profile_id = up.id
JOIN users u ON up.user_id = u.id
WHERE u.username = 'demo'
ORDER BY up.name, s.spell_name;
```

### Sesiones Activas
```sql
-- Ver sesiones activas
SELECT
    u.username,
    us.created_at,
    us.expires_at,
    us.is_revoked,
    CASE
        WHEN us.expires_at > CURRENT_TIMESTAMP AND NOT us.is_revoked
        THEN 'Activa'
        ELSE 'Expirada'
    END as status
FROM user_sessions us
JOIN users u ON us.user_id = u.id
ORDER BY us.created_at DESC;
```

## Mantenimiento

### Limpiar Sesiones Expiradas
```sql
-- Ejecutar función de limpieza
SELECT cleanup_expired_sessions();

-- Verificar sesiones eliminadas
SELECT COUNT(*) FROM user_sessions
WHERE expires_at < CURRENT_TIMESTAMP OR is_revoked = true;
```

### Actualizar Timestamps
```sql
-- Forzar actualización de updated_at en game_state
UPDATE game_state
SET updated_at = CURRENT_TIMESTAMP
WHERE id = 'uuid-del-registro';

-- Ver última actualización
SELECT
    up.name,
    gs.updated_at,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - gs.updated_at)) / 3600 as hours_ago
FROM game_state gs
JOIN user_profiles up ON gs.user_profile_id = up.id
ORDER BY gs.updated_at DESC;
```

## Análisis y Estadísticas

### Usuarios Activos
```sql
-- Usuarios con actividad reciente
SELECT
    u.username,
    u.last_login,
    CURRENT_TIMESTAMP - u.last_login as time_since_login,
    u.is_active
FROM users u
WHERE u.last_login > CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY u.last_login DESC;
```

### Estadísticas de Hechizos
```sql
-- Hechizos más usados (por cantidad de perfiles que los tienen)
SELECT
    spell_name,
    COUNT(DISTINCT user_profile_id) as profiles_with_spell,
    AVG(spell_base) as avg_base_cost,
    AVG(spell_arcane) as avg_arcane_cost
FROM spells
GROUP BY spell_name
ORDER BY profiles_with_spell DESC, spell_name;
```

### Uso de Zeon
```sql
-- Estadísticas de Zeon por perfil
SELECT
    u.username,
    up.name as profile_name,
    gs.zeon as current_zeon,
    gs.rzeon as max_zeon,
    ROUND(100.0 * gs.zeon / NULLIF(gs.rzeon, 0), 2) as zeon_percentage,
    gs.act,
    gs.rzeoni
FROM game_state gs
JOIN user_profiles up ON gs.user_profile_id = up.id
JOIN users u ON up.user_id = u.id
WHERE gs.rzeon > 0
ORDER BY zeon_percentage DESC;
```

## Consultas de Debugging

### Verificar Integridad Referencial
```sql
-- Perfiles sin estado de juego
SELECT up.id, up.name
FROM user_profiles up
LEFT JOIN game_state gs ON up.id = gs.user_profile_id
WHERE gs.id IS NULL;

-- Perfiles huérfanos (sin usuario)
SELECT up.id, up.name
FROM user_profiles up
LEFT JOIN users u ON up.user_id = u.id
WHERE u.id IS NULL;
```

### Ver Cascadas de Eliminación
```sql
-- Ver qué se eliminaría si se borra un usuario
WITH RECURSIVE cascade_delete AS (
    SELECT
        'users'::text as table_name,
        id::text as record_id,
        username as record_info
    FROM users
    WHERE username = 'demo'

    UNION ALL

    SELECT
        'user_profiles'::text,
        up.id::text,
        up.name
    FROM user_profiles up
    JOIN users u ON up.user_id = u.id
    WHERE u.username = 'demo'
)
SELECT * FROM cascade_delete;
```

## Operaciones Comunes

### Crear Usuario y Perfil Completo
```sql
-- Insertar usuario
INSERT INTO users (username, email, password_hash, display_name)
VALUES ('newuser', 'new@example.com', 'hash_aqui', 'New User')
RETURNING id;

-- Insertar perfil (usar ID del usuario anterior)
INSERT INTO user_profiles (user_id, name)
VALUES ('uuid-del-usuario', 'Mi Personaje')
RETURNING id;

-- Insertar estado de juego (usar ID del perfil)
INSERT INTO game_state (user_profile_id, rzeon, act, rzeoni)
VALUES ('uuid-del-perfil', 500, 10, 90);
```

### Reset de Estado de Juego
```sql
-- Resetear estado de combate (como en login)
UPDATE game_state
SET
    turn_number = 0,
    zeona = 0,
    zeonp = 0,
    zeon_to_spend = 0,
    mantain_zeon_to_spend = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE user_profile_id = 'uuid-del-perfil';

-- Limpiar hechizos temporales
DELETE FROM ready_to_cast WHERE user_profile_id = 'uuid-del-perfil';
DELETE FROM spell_mantain_list WHERE user_profile_id = 'uuid-del-perfil';
```

### Backup y Restore

```bash
# Backup de la base de datos
docker exec anima-counter-db pg_dump -U anima_user anima_counter > backup.sql

# Restore de la base de datos
docker exec -i anima-counter-db psql -U anima_user anima_counter < backup.sql

# Backup solo del esquema
docker exec anima-counter-db pg_dump -U anima_user --schema-only anima_counter > schema.sql

# Backup solo de los datos
docker exec anima-counter-db pg_dump -U anima_user --data-only anima_counter > data.sql
```

## Performance

### Analizar Queries Lentas
```sql
-- Ver estadísticas de índices
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Ver tamaño de tablas
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Vacuum y Analyze
```sql
-- Limpiar y optimizar
VACUUM ANALYZE;

-- Por tabla específica
VACUUM ANALYZE users;
```

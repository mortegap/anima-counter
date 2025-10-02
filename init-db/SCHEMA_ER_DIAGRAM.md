# 🗺️ Diagrama Entidad-Relación - Anima Counter

## Diagrama Visual

```
┌─────────────────────────┐
│        users            │
│─────────────────────────│
│ PK  id (UUID)           │
│ UQ  username            │
│ UQ  email               │
│     password_hash       │
│     display_name        │
│     created_at          │
│     updated_at          │
│     last_login          │
│     is_active           │
└─────────────────────────┘
         │ 1
         │
         │ N
         ├──────────────────────────────────┐
         │                                   │
         ▼                                   ▼
┌─────────────────────────┐      ┌─────────────────────────┐
│   user_sessions         │      │   user_profiles         │
│─────────────────────────│      │─────────────────────────│
│ PK  id (UUID)           │      │ PK  id (UUID)           │
│ FK  user_id → users     │      │ FK  user_id → users     │
│     token_hash          │      │     name                │
│     expires_at          │      │     created_at          │
│     created_at          │      │     updated_at          │
│     is_revoked          │      └─────────────────────────┘
└─────────────────────────┘               │ 1
                                          │
                  ┌───────────────────────┴─────────────────────────┐
                  │                       │                         │
                  ▼ 1                     ▼ 1                       ▼ N
         ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
         │    game_state           │  │       spells            │  │   ready_to_cast         │
         │─────────────────────────│  │─────────────────────────│  │─────────────────────────│
         │ PK  id (UUID)           │  │ PK  id (UUID)           │  │ PK  id (UUID)           │
         │ FK  user_profile_id     │  │ FK  user_profile_id     │  │ FK  user_profile_id     │
         │     turn_number         │  │     spell_name          │  │ FK  spell_id → spells   │
         │     zeon                │  │     spell_base          │  │     spell_name          │
         │     rzeon               │  │     spell_inter         │  │     spell_zeon          │
         │     act                 │  │     spell_advanced      │  │     spell_mantain       │
         │     rzeoni              │  │     spell_arcane        │  │     spell_mantain_turn  │
         │     zeona               │  │     spell_via           │  │     spell_index         │
         │     zeonp               │  │     spell_base_mantain  │  │     created_at          │
         │     acu                 │  │     spell_inter_mantain │  └─────────────────────────┘
         │     lock_state          │  │     spell_advanced_...  │               │
         │     zeon_to_spend       │  │     spell_arcane_...    │               │
         │     mantain_zeon_...    │  │     created_at          │               ▼ N
         │     created_at          │  └─────────────────────────┘      ┌─────────────────────────┐
         │     updated_at          │               │ 1                 │  spell_mantain_list     │
         └─────────────────────────┘               │                   │─────────────────────────│
                                                   │                   │ PK  id (UUID)           │
                                                   ▼ N                 │ FK  user_profile_id     │
                                          ┌─────────────────────────┐  │ FK  spell_id → spells   │
                                          │  spell_mantain_list     │  │     spell_name          │
                                          │─────────────────────────│  │     spell_mantain       │
                                          │ (mismo contenido)       │  │     spell_index         │
                                          └─────────────────────────┘  │     created_at          │
                                                                       └─────────────────────────┘

```

## Leyenda

- **PK**: Primary Key (Clave Primaria)
- **FK**: Foreign Key (Clave Foránea)
- **UQ**: Unique Constraint (Restricción de Unicidad)
- **1**: Relación uno-a-uno
- **N**: Relación uno-a-muchos

## Relaciones Detalladas

### 1. users → user_sessions (1:N)
- Un usuario puede tener múltiples sesiones activas
- Eliminación en cascada: Si se elimina un usuario, se eliminan sus sesiones

### 2. users → user_profiles (1:N)
- Un usuario puede tener múltiples perfiles/personajes
- Eliminación en cascada: Si se elimina un usuario, se eliminan sus perfiles

### 3. user_profiles → game_state (1:1)
- Cada perfil tiene exactamente un estado de juego
- Eliminación en cascada: Si se elimina un perfil, se elimina su estado

### 4. user_profiles → spells (1:N)
- Cada perfil puede tener múltiples hechizos en su libro
- Eliminación en cascada: Si se elimina un perfil, se eliminan sus hechizos

### 5. user_profiles → ready_to_cast (1:N)
- Cada perfil puede tener múltiples hechizos preparados
- Eliminación en cascada: Si se elimina un perfil, se eliminan sus hechizos preparados

### 6. user_profiles → spell_mantain_list (1:N)
- Cada perfil puede mantener múltiples hechizos
- Eliminación en cascada: Si se elimina un perfil, se eliminan sus mantenimientos

### 7. spells → ready_to_cast (1:N)
- Un hechizo del libro puede estar preparado múltiples veces (diferentes niveles)
- Eliminación en cascada: Si se elimina un hechizo, se eliminan sus preparaciones

### 8. spells → spell_mantain_list (1:N)
- Un hechizo del libro puede estar en mantenimiento
- Eliminación en cascada: Si se elimina un hechizo, se eliminan sus mantenimientos

## Tipos de Datos Principales

### Identificadores
- Todas las PKs son **UUID v4**
- Mayor seguridad y distribución
- No predecibles ni secuenciales

### Timestamps
- `created_at`: Timestamp de creación (inmutable)
- `updated_at`: Timestamp de última modificación (auto-actualizado con trigger)

### Strings
- `VARCHAR(50)`: Usernames
- `VARCHAR(100)`: Nombres, display names
- `VARCHAR(255)`: Emails, hashes

### Numéricos
- `INTEGER`: Valores de juego (zeon, act, etc.)
- `BOOLEAN`: Flags (is_active, acu, etc.)

## Estrategia de Eliminación

Todas las relaciones usan **ON DELETE CASCADE** para mantener integridad referencial:

```
users (eliminado)
  └── Elimina user_sessions
  └── Elimina user_profiles
      └── Elimina game_state
      └── Elimina spells
          └── Elimina ready_to_cast
          └── Elimina spell_mantain_list
      └── Elimina ready_to_cast (directo)
      └── Elimina spell_mantain_list (directo)
```

## Índices Estratégicos

### Búsquedas Frecuentes
- `idx_users_username`: Login por username
- `idx_users_email`: Login/recuperación por email
- `idx_user_sessions_token_hash`: Validación de tokens

### Relaciones FK
- `idx_user_profiles_user_id`: Perfiles de un usuario
- `idx_game_state_user_profile`: Estado de un perfil
- `idx_spells_user_profile`: Hechizos de un perfil
- `idx_ready_to_cast_user_profile`: Preparados de un perfil
- `idx_spell_mantain_list_user_profile`: Mantenimientos de un perfil

## Reglas de Negocio Implementadas

### Autenticación
1. Username y email únicos
2. Sesiones con expiración
3. Posibilidad de revocar tokens

### Perfiles
1. Múltiples perfiles por usuario
2. Nombres descriptivos
3. Estado independiente por perfil

### Hechizos
1. **Persistentes**: `spells` (libro permanente)
2. **Temporales**: `ready_to_cast` y `spell_mantain_list` (se resetean)

### Estado de Juego
1. Un estado único por perfil
2. Valores persistentes vs temporales diferenciados
3. Auto-actualización de timestamps

## Mejoras Futuras Posibles

- [ ] Tabla de audit_log para tracking de cambios
- [ ] Tabla de spell_templates para hechizos predefinidos
- [ ] Sistema de roles y permisos
- [ ] Histórico de estados de juego
- [ ] Estadísticas agregadas de uso

# 📖 API Documentation - Anima Counter

## Información General

- **Base URL**: `http://localhost:3000/api`
- **Formato**: JSON
- **Autenticación**: JWT (JSON Web Tokens)
- **Versión**: 1.0.0

## Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Perfiles](#perfiles)
3. [Estado del Juego](#estado-del-juego)
4. [Hechizos](#hechizos)
5. [Hechizos Preparados](#hechizos-preparados)
6. [Hechizos Mantenidos](#hechizos-mantenidos)
7. [Códigos de Error](#códigos-de-error)

---

## Autenticación

### Registro de Usuario

Registra un nuevo usuario en el sistema.

**Endpoint**: `POST /api/auth/register`

**Autenticación**: No requerida

**Request Body**:
```json
{
  "username": "string (required, 3-30 caracteres alfanuméricos)",
  "password": "string (required, mínimo 6 caracteres)",
  "email": "string (optional, formato email válido)",
  "displayName": "string (optional, máximo 100 caracteres)"
}
```

**Response Success** (201):
```json
{
  "message": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario123@anima-counter.local",
    "displayName": "Usuario 123"
  }
}
```

**Response Error** (409):
```json
{
  "error": "El usuario ya existe"
}
```

**Response Error** (400):
```json
{
  "error": "El nombre de usuario debe tener al menos 3 caracteres"
}
```

---

### Login

Inicia sesión y obtiene un token JWT.

**Endpoint**: `POST /api/auth/login`

**Autenticación**: No requerida

**Request Body**:
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response Success** (200):
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario123@anima-counter.local",
    "displayName": "Usuario 123"
  }
}
```

**Response Error** (401):
```json
{
  "error": "Credenciales inválidas"
}
```

---

### Verificar Token

Verifica la validez del token JWT.

**Endpoint**: `GET /api/auth/verify`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Response Success** (200):
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario123@anima-counter.local"
  }
}
```

**Response Error** (401):
```json
{
  "error": "Token inválido o expirado"
}
```

---

## Perfiles

### Listar Perfiles del Usuario

Obtiene todos los perfiles del usuario autenticado.

**Endpoint**: `GET /api/profiles`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Response Success** (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Perfil de Usuario 123",
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "user_id": 1,
    "name": "Mago Oscuro",
    "created_at": "2025-01-16T14:20:00.000Z",
    "updated_at": "2025-01-16T14:20:00.000Z"
  }
]
```

---

### Crear Perfil

Crea un nuevo perfil para el usuario autenticado.

**Endpoint**: `POST /api/profiles`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "name": "string (required, máximo 100 caracteres)"
}
```

**Response Success** (201):
```json
{
  "message": "Perfil creado exitosamente",
  "profile": {
    "id": 3,
    "user_id": 1,
    "name": "Guerrero Místico",
    "created_at": "2025-01-17T09:15:00.000Z",
    "updated_at": "2025-01-17T09:15:00.000Z"
  }
}
```

**Response Error** (400):
```json
{
  "error": "El nombre del perfil es requerido"
}
```

---

### Actualizar Perfil

Actualiza el nombre de un perfil.

**Endpoint**: `PUT /api/profiles/:profileId`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "name": "string (required)"
}
```

**Response Success** (200):
```json
{
  "message": "Perfil actualizado exitosamente",
  "profile": {
    "id": 3,
    "user_id": 1,
    "name": "Guerrero Arcano",
    "created_at": "2025-01-17T09:15:00.000Z",
    "updated_at": "2025-01-17T10:30:00.000Z"
  }
}
```

**Response Error** (404):
```json
{
  "error": "Perfil no encontrado"
}
```

---

### Eliminar Perfil

Elimina un perfil del usuario.

**Endpoint**: `DELETE /api/profiles/:profileId`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Response Success** (200):
```json
{
  "message": "Perfil eliminado exitosamente"
}
```

**Response Error** (404):
```json
{
  "error": "Perfil no encontrado"
}
```

---

## Estado del Juego

### Obtener Estado del Juego

Obtiene el estado del juego de un perfil específico.

**Endpoint**: `GET /api/gamestate/:profileId`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Response Success** (200):
```json
{
  "id": 1,
  "user_profile_id": 1,
  "turn_number": 5,
  "zeon": 450,
  "rzeon": 500,
  "zeona": 50,
  "act": 8,
  "rzeoni": 10,
  "zeonp": 100,
  "acu": false,
  "lock_state": 0,
  "zeon_to_spend": 80,
  "mantain_zeon_to_spend": 20,
  "created_at": "2025-01-15T10:30:00.000Z",
  "updated_at": "2025-01-17T14:20:00.000Z"
}
```

**Campos del Estado**:
- `turn_number`: Número del turno actual
- `zeon`: Zeon actual disponible
- `rzeon`: Zeon de regeneración
- `zeona`: Zeon acumulado
- `act`: Acumulación actual
- `rzeoni`: Regeneración innata
- `zeonp`: Zeon perdido
- `acu`: Booleano indicando si está acumulando
- `lock_state`: Estado de bloqueo (0 = desbloqueado)
- `zeon_to_spend`: Zeon a gastar en hechizos preparados
- `mantain_zeon_to_spend`: Zeon a gastar en mantenimientos

---

### Actualizar Estado del Juego

Actualiza el estado del juego. Solo actualiza los campos enviados.

**Endpoint**: `PUT /api/gamestate/:profileId`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body** (todos los campos son opcionales):
```json
{
  "turn_number": 6,
  "zeon": 380,
  "rzeon": 500,
  "zeona": 100,
  "act": 8,
  "rzeoni": 10,
  "zeonp": 120,
  "acu": true,
  "lock_state": 1,
  "zeon_to_spend": 100,
  "mantain_zeon_to_spend": 30
}
```

**Response Success** (200):
```json
{
  "id": 1,
  "user_profile_id": 1,
  "turn_number": 6,
  "zeon": 380,
  "rzeon": 500,
  "zeona": 100,
  "act": 8,
  "rzeoni": 10,
  "zeonp": 120,
  "acu": true,
  "lock_state": 1,
  "zeon_to_spend": 100,
  "mantain_zeon_to_spend": 30,
  "created_at": "2025-01-15T10:30:00.000Z",
  "updated_at": "2025-01-17T14:25:00.000Z"
}
```

---

### Resetear Estado de Combate

Resetea el estado de combate manteniendo las características persistentes del personaje.

**Campos que se resetean**: `turn_number`, `zeon`, `zeona`, `zeonp`, hechizos preparados y mantenidos

**Campos que se mantienen**: `rzeon`, `act`, `rzeoni`, `lock_state`, grimorio de hechizos

**Endpoint**: `POST /api/gamestate/:profileId/reset`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Response Success** (200):
```json
{
  "message": "Estado de combate reseteado exitosamente",
  "gameState": {
    "id": 1,
    "user_profile_id": 1,
    "turn_number": 0,
    "zeon": 0,
    "rzeon": 500,
    "zeona": 0,
    "act": 8,
    "rzeoni": 10,
    "zeonp": 0,
    "acu": false,
    "lock_state": 0,
    "zeon_to_spend": 0,
    "mantain_zeon_to_spend": 0,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-17T15:00:00.000Z"
  }
}
```

---

## Hechizos

### Listar Hechizos del Grimorio

Obtiene todos los hechizos guardados en el grimorio de un perfil.

**Endpoint**: `GET /api/spells/:profileId`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Response Success** (200):
```json
[
  {
    "id": 1,
    "user_profile_id": 1,
    "spell_name": "Bola de Fuego",
    "spell_base": 40,
    "spell_inter": 80,
    "spell_advanced": 120,
    "spell_arcane": 200,
    "spell_base_mantain": 5,
    "spell_inter_mantain": 10,
    "spell_advanced_mantain": 15,
    "spell_arcane_mantain": 25,
    "spell_via": "Fuego",
    "created_at": "2025-01-15T11:00:00.000Z",
    "updated_at": "2025-01-15T11:00:00.000Z"
  },
  {
    "id": 2,
    "user_profile_id": 1,
    "spell_name": "Escudo Arcano",
    "spell_base": 30,
    "spell_inter": 60,
    "spell_advanced": 90,
    "spell_arcane": 150,
    "spell_base_mantain": 10,
    "spell_inter_mantain": 20,
    "spell_advanced_mantain": 30,
    "spell_arcane_mantain": 50,
    "spell_via": "Defensa",
    "created_at": "2025-01-15T11:15:00.000Z",
    "updated_at": "2025-01-15T11:15:00.000Z"
  }
]
```

---

### Crear Hechizo

Añade un nuevo hechizo al grimorio.

**Endpoint**: `POST /api/spells/:profileId`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "spell_name": "string (required)",
  "spell_via": "string (optional)",
  "spell_base": "number (required, >= 0)",
  "spell_inter": "number (required, >= 0)",
  "spell_advanced": "number (required, >= 0)",
  "spell_arcane": "number (required, >= 0)",
  "spell_base_mantain": "number (optional, >= 0, default: 0)",
  "spell_inter_mantain": "number (optional, >= 0, default: 0)",
  "spell_advanced_mantain": "number (optional, >= 0, default: 0)",
  "spell_arcane_mantain": "number (optional, >= 0, default: 0)"
}
```

**Response Success** (201):
```json
{
  "message": "Hechizo añadido exitosamente",
  "spell": {
    "id": 3,
    "user_profile_id": 1,
    "spell_name": "Rayo Congelante",
    "spell_base": 50,
    "spell_inter": 100,
    "spell_advanced": 150,
    "spell_arcane": 250,
    "spell_base_mantain": 8,
    "spell_inter_mantain": 15,
    "spell_advanced_mantain": 22,
    "spell_arcane_mantain": 35,
    "spell_via": "Hielo",
    "created_at": "2025-01-17T16:00:00.000Z",
    "updated_at": "2025-01-17T16:00:00.000Z"
  }
}
```

**Response Error** (400):
```json
{
  "error": "Todos los campos de coste del hechizo son requeridos"
}
```

---

### Eliminar Hechizo

Elimina un hechizo del grimorio.

**Endpoint**: `DELETE /api/spells/:profileId/:spellId`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Response Success** (200):
```json
{
  "message": "Hechizo eliminado exitosamente"
}
```

**Response Error** (404):
```json
{
  "error": "Hechizo no encontrado"
}
```

---

## Hechizos Preparados

### Listar Hechizos Preparados

Obtiene la lista de hechizos preparados para lanzar.

**Endpoint**: `GET /api/ready-to-cast/:profileId`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Response Success** (200):
```json
[
  {
    "id": 1,
    "user_profile_id": 1,
    "spell_id": 1,
    "spell_name": "Bola de Fuego",
    "spell_zeon": 80,
    "spell_mantain": 10,
    "spell_mantain_turn": true,
    "spell_index": 0,
    "created_at": "2025-01-17T16:30:00.000Z"
  },
  {
    "id": 2,
    "user_profile_id": 1,
    "spell_id": 2,
    "spell_name": "Escudo Arcano",
    "spell_zeon": 60,
    "spell_mantain": 20,
    "spell_mantain_turn": false,
    "spell_index": 1,
    "created_at": "2025-01-17T16:31:00.000Z"
  }
]
```

---

### Preparar Hechizo

Añade un hechizo a la lista de preparados.

**Endpoint**: `POST /api/ready-to-cast/:profileId`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "spell_id": "number (optional, referencia al grimorio)",
  "spell_name": "string (required)",
  "spell_zeon": "number (required, >= 0)",
  "spell_mantain": "number (required, >= 0)",
  "spell_mantain_turn": "boolean (optional, default: false)",
  "spell_index": "number (optional)"
}
```

**Response Success** (201):
```json
{
  "message": "Hechizo añadido a preparados",
  "readyToCast": {
    "id": 3,
    "user_profile_id": 1,
    "spell_id": 3,
    "spell_name": "Rayo Congelante",
    "spell_zeon": 100,
    "spell_mantain": 15,
    "spell_mantain_turn": true,
    "spell_index": 2,
    "created_at": "2025-01-17T16:35:00.000Z"
  }
}
```

---

### Quitar Hechizo Preparado

Elimina un hechizo de la lista de preparados.

**Endpoint**: `DELETE /api/ready-to-cast/:profileId/:readyToCastId`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Response Success** (200):
```json
{
  "message": "Hechizo eliminado de preparados"
}
```

---

### Lanzar Hechizos

Lanza todos los hechizos preparados y gestiona los mantenimientos.

**Endpoint**: `POST /api/ready-to-cast/:profileId/cast`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Response Success** (200):
```json
{
  "message": "Hechizos lanzados exitosamente"
}
```

**Nota**: Esta acción:
1. Crea mantenimientos para hechizos marcados con `spell_mantain_turn: true`
2. Consume zeon acumulado (zeona) y actualiza zeon perdido (zeonp)
3. Limpia la lista de hechizos preparados
4. Actualiza el estado del juego

---

## Hechizos Mantenidos

### Listar Hechizos Mantenidos

Obtiene la lista de hechizos que están siendo mantenidos.

**Endpoint**: `GET /api/spell-mantain/:profileId`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Response Success** (200):
```json
[
  {
    "id": 1,
    "user_profile_id": 1,
    "spell_id": 1,
    "spell_name": "Bola de Fuego",
    "spell_mantain": 10,
    "spell_index": 0,
    "created_at": "2025-01-17T17:00:00.000Z"
  },
  {
    "id": 2,
    "user_profile_id": 1,
    "spell_id": 3,
    "spell_name": "Rayo Congelante",
    "spell_mantain": 15,
    "spell_index": 1,
    "created_at": "2025-01-17T17:01:00.000Z"
  }
]
```

---

### Dejar de Mantener Hechizo

Elimina un hechizo de la lista de mantenimientos.

**Endpoint**: `DELETE /api/spell-mantain/:profileId/:mantainId`

**Autenticación**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Response Success** (200):
```json
{
  "message": "Mantenimiento eliminado exitosamente"
}
```

**Response Error** (404):
```json
{
  "error": "Mantenimiento no encontrado"
}
```

---

## Códigos de Error

### Códigos HTTP Usados

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Error de validación o datos incorrectos |
| 401 | Unauthorized - Token inválido, expirado o faltante |
| 403 | Forbidden - No tienes permisos para acceder a este recurso |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej: usuario ya existe) |
| 500 | Internal Server Error - Error interno del servidor |

### Formato de Errores

Todos los errores siguen el mismo formato:

```json
{
  "error": "Mensaje descriptivo del error"
}
```

### Errores de Validación

Los errores de validación de Joi devuelven mensajes específicos en español:

```json
{
  "error": "El nombre de usuario debe tener al menos 3 caracteres"
}
```

---

## Autenticación JWT

### Formato del Token

El token JWT debe incluirse en el header `Authorization` con el prefijo `Bearer`:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Estructura del Token

El payload del token contiene:

```json
{
  "id": 1,
  "username": "usuario123",
  "email": "usuario123@anima-counter.local",
  "iat": 1705502400,
  "exp": 1705588800
}
```

### Expiración

Los tokens tienen una duración de **24 horas** desde su emisión.

---

## Ejemplos de Uso

### Flujo de Autenticación Completo

```javascript
// 1. Registrarse
const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'miusuario',
    password: 'mipassword123'
  })
});

const { token } = await registerResponse.json();

// 2. Usar el token en peticiones posteriores
const profilesResponse = await fetch('http://localhost:3000/api/profiles', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const profiles = await profilesResponse.json();
```

### Flujo de Gestión de Hechizos

```javascript
// 1. Añadir hechizo al grimorio
await fetch(`http://localhost:3000/api/spells/${profileId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    spell_name: 'Bola de Fuego',
    spell_via: 'Fuego',
    spell_base: 40,
    spell_inter: 80,
    spell_advanced: 120,
    spell_arcane: 200,
    spell_base_mantain: 5,
    spell_inter_mantain: 10,
    spell_advanced_mantain: 15,
    spell_arcane_mantain: 25
  })
});

// 2. Preparar hechizo para lanzar
await fetch(`http://localhost:3000/api/ready-to-cast/${profileId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    spell_id: 1,
    spell_name: 'Bola de Fuego',
    spell_zeon: 80,
    spell_mantain: 10,
    spell_mantain_turn: true
  })
});

// 3. Lanzar hechizos
await fetch(`http://localhost:3000/api/ready-to-cast/${profileId}/cast`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Notas Adicionales

### Middleware de Autenticación

- `authenticateToken`: Verifica que el token JWT sea válido
- `verifyProfileAccess`: Verifica que el usuario tenga acceso al perfil especificado

### Política CORS

El backend acepta peticiones desde:
- `http://localhost` (frontend en producción)
- `http://localhost:5173` (frontend en desarrollo con Vite)

### Base de Datos

Todas las operaciones son transaccionales y utilizan PostgreSQL como base de datos.

### Zona Horaria

Todos los timestamps se almacenan en UTC y siguen el formato ISO 8601.

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0

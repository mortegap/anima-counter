-- ===================================================================
-- ANIMA COUNTER - DATOS DE PRUEBA (SEED DATA)
-- ===================================================================
-- Datos iniciales y de prueba para desarrollo y testing
-- Versión: 2.0
-- Fecha: 2025-10-02
-- ===================================================================

-- ===================================================================
-- USUARIOS DE PRUEBA
-- ===================================================================

-- Usuario demo (contraseña: "demo123")
-- Hash generado con PBKDF2 (compatible con el backend actual)
INSERT INTO users (username, email, password_hash, display_name)
VALUES (
    'demo',
    'demo@example.com',
    '4a19431788e5ca5dd1e1f0c99d2b95c57e23c92b4a5e62d8c57cefc91ad9f0db:aee0e8fc5dd5b78a4767b87d05fc5e02',
    'Usuario Demo'
) ON CONFLICT (username) DO NOTHING;

-- Usuario de testing (contraseña: "test123")
INSERT INTO users (username, email, password_hash, display_name)
VALUES (
    'testuser',
    'test@example.com',
    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8:5421e9f42f14a26cb1a4e2c1cd5d3d8c',
    'Test User'
) ON CONFLICT (username) DO NOTHING;

-- ===================================================================
-- PERFILES DE PRUEBA
-- ===================================================================

-- Perfil para usuario demo
INSERT INTO user_profiles (user_id, name)
SELECT id, 'Mago Elemental'
FROM users
WHERE username = 'demo'
ON CONFLICT DO NOTHING;

-- Segundo perfil para usuario demo
INSERT INTO user_profiles (user_id, name)
SELECT id, 'Guerrero Místico'
FROM users
WHERE username = 'demo'
ON CONFLICT DO NOTHING;

-- Perfil para usuario de testing
INSERT INTO user_profiles (user_id, name)
SELECT id, 'Perfil de Test'
FROM users
WHERE username = 'testuser'
ON CONFLICT DO NOTHING;

-- ===================================================================
-- ESTADOS DE JUEGO INICIALES
-- ===================================================================

-- Estado para el perfil "Mago Elemental"
INSERT INTO game_state (
    user_profile_id,
    turn_number,
    zeon,
    rzeon,
    act,
    rzeoni,
    zeona,
    zeonp,
    acu,
    lock_state,
    zeon_to_spend,
    mantain_zeon_to_spend
)
SELECT
    up.id,
    0,      -- turn_number
    450,    -- zeon actual
    450,    -- rzeon (máximo)
    12,     -- act
    85,     -- regeneración zeónica
    0,      -- zeona
    0,      -- zeonp
    false,  -- acu
    0,      -- lock_state
    0,      -- zeon_to_spend
    0       -- mantain_zeon_to_spend
FROM user_profiles up
JOIN users u ON up.user_id = u.id
WHERE u.username = 'demo' AND up.name = 'Mago Elemental'
ON CONFLICT DO NOTHING;

-- Estado para el perfil "Guerrero Místico"
INSERT INTO game_state (
    user_profile_id,
    turn_number,
    zeon,
    rzeon,
    act,
    rzeoni,
    zeona,
    zeonp,
    acu,
    lock_state,
    zeon_to_spend,
    mantain_zeon_to_spend
)
SELECT
    up.id,
    0,      -- turn_number
    200,    -- zeon actual
    200,    -- rzeon (máximo)
    8,      -- act
    45,     -- regeneración zeónica
    0,      -- zeona
    0,      -- zeonp
    false,  -- acu
    0,      -- lock_state
    0,      -- zeon_to_spend
    0       -- mantain_zeon_to_spend
FROM user_profiles up
JOIN users u ON up.user_id = u.id
WHERE u.username = 'demo' AND up.name = 'Guerrero Místico'
ON CONFLICT DO NOTHING;

-- Estado para perfil de testing (valores en 0)
INSERT INTO game_state (
    user_profile_id,
    turn_number,
    zeon,
    rzeon,
    act,
    rzeoni,
    zeona,
    zeonp,
    acu,
    lock_state,
    zeon_to_spend,
    mantain_zeon_to_spend
)
SELECT
    up.id,
    0, 0, 0, 0, 0, 0, 0, false, 0, 0, 0
FROM user_profiles up
JOIN users u ON up.user_id = u.id
WHERE u.username = 'testuser'
ON CONFLICT DO NOTHING;

-- ===================================================================
-- HECHIZOS DE EJEMPLO
-- ===================================================================

-- Hechizos para el perfil "Mago Elemental"
INSERT INTO spells (
    user_profile_id,
    spell_name,
    spell_base,
    spell_inter,
    spell_advanced,
    spell_arcane,
    spell_via,
    spell_base_mantain,
    spell_inter_mantain,
    spell_advanced_mantain,
    spell_arcane_mantain
)
SELECT
    up.id,
    'Bola de Fuego',
    40,     -- base
    80,     -- intermedio
    120,    -- avanzado
    180,    -- arcano
    'Fuego',
    0, 0, 0, 0  -- sin mantenimiento
FROM user_profiles up
JOIN users u ON up.user_id = u.id
WHERE u.username = 'demo' AND up.name = 'Mago Elemental'
ON CONFLICT DO NOTHING;

INSERT INTO spells (
    user_profile_id,
    spell_name,
    spell_base,
    spell_inter,
    spell_advanced,
    spell_arcane,
    spell_via,
    spell_base_mantain,
    spell_inter_mantain,
    spell_advanced_mantain,
    spell_arcane_mantain
)
SELECT
    up.id,
    'Escudo Mágico',
    30,     -- base
    60,     -- intermedio
    90,     -- avanzado
    140,    -- arcano
    'Protección',
    10,     -- base mantain
    20,     -- inter mantain
    35,     -- advanced mantain
    50      -- arcane mantain
FROM user_profiles up
JOIN users u ON up.user_id = u.id
WHERE u.username = 'demo' AND up.name = 'Mago Elemental'
ON CONFLICT DO NOTHING;

INSERT INTO spells (
    user_profile_id,
    spell_name,
    spell_base,
    spell_inter,
    spell_advanced,
    spell_arcane,
    spell_via,
    spell_base_mantain,
    spell_inter_mantain,
    spell_advanced_mantain,
    spell_arcane_mantain
)
SELECT
    up.id,
    'Rayo de Hielo',
    50,     -- base
    100,    -- intermedio
    150,    -- avanzado
    220,    -- arcano
    'Agua',
    0, 0, 0, 0  -- sin mantenimiento
FROM user_profiles up
JOIN users u ON up.user_id = u.id
WHERE u.username = 'demo' AND up.name = 'Mago Elemental'
ON CONFLICT DO NOTHING;

-- ===================================================================
-- NOTAS
-- ===================================================================
--
-- Los datos de prueba incluyen:
-- - 2 usuarios (demo y testuser) con contraseñas conocidas
-- - 3 perfiles de personaje
-- - Estados de juego inicializados
-- - Hechizos de ejemplo para testing
--
-- IMPORTANTE: Estos datos son solo para desarrollo/testing
-- No usar en producción sin cambiar las contraseñas
-- ===================================================================

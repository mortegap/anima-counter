-- ===================================================================
-- ANIMA COUNTER - DATABASE SCHEMA
-- ===================================================================
-- Esquema completo de la base de datos para el contador de Zeon
-- Versión: 2.0
-- Fecha: 2025-10-02
-- ===================================================================

-- ===================================================================
-- EXTENSIONES
-- ===================================================================

-- Habilitar generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- FUNCIONES Y TRIGGERS
-- ===================================================================

-- Función para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar sesiones expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions
    WHERE expires_at < CURRENT_TIMESTAMP OR is_revoked = true;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- TABLAS PRINCIPALES
-- ===================================================================

-- ---------------------------------------------------------------------
-- Tabla: users
-- Descripción: Almacena información de los usuarios del sistema
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- ---------------------------------------------------------------------
-- Tabla: user_sessions
-- Descripción: Gestión de sesiones y tokens JWT (para blacklist)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT false
);

-- ---------------------------------------------------------------------
-- Tabla: user_profiles
-- Descripción: Perfiles/personajes de cada usuario
-- Relación: Un usuario puede tener múltiples perfiles
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: game_state
-- Descripción: Estado del juego/contador para cada perfil
-- Relación: Cada perfil tiene un único estado de juego
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS game_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    turn_number INTEGER DEFAULT 0,
    zeon INTEGER DEFAULT 0,
    rzeon INTEGER DEFAULT 0,
    act INTEGER DEFAULT 0,
    rzeoni INTEGER DEFAULT 0,
    zeona INTEGER DEFAULT 0,
    zeonp INTEGER DEFAULT 0,
    acu BOOLEAN DEFAULT false,
    lock_state INTEGER DEFAULT 0,
    zeon_to_spend INTEGER DEFAULT 0,
    mantain_zeon_to_spend INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: spells
-- Descripción: Libro de hechizos persistente de cada perfil
-- Relación: Un perfil puede tener múltiples hechizos
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spells (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    spell_name VARCHAR(100) NOT NULL,
    spell_base INTEGER NOT NULL,
    spell_inter INTEGER NOT NULL,
    spell_advanced INTEGER NOT NULL,
    spell_arcane INTEGER NOT NULL,
    spell_via VARCHAR(50),
    spell_base_mantain INTEGER DEFAULT 0,
    spell_inter_mantain INTEGER DEFAULT 0,
    spell_advanced_mantain INTEGER DEFAULT 0,
    spell_arcane_mantain INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: ready_to_cast
-- Descripción: Hechizos preparados/listos para lanzar (temporal)
-- Relación: Un perfil puede tener múltiples hechizos preparados
-- Nota: Se eliminan al hacer login/reset
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ready_to_cast (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    spell_id UUID REFERENCES spells(id) ON DELETE CASCADE,
    spell_name VARCHAR(100) NOT NULL,
    spell_zeon INTEGER NOT NULL,
    spell_mantain INTEGER DEFAULT 0,
    spell_mantain_turn BOOLEAN DEFAULT false,
    spell_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: spell_mantain_list
-- Descripción: Hechizos siendo mantenidos actualmente (temporal)
-- Relación: Un perfil puede mantener múltiples hechizos
-- Nota: Se eliminan al hacer login/reset
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spell_mantain_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    spell_id UUID REFERENCES spells(id) ON DELETE CASCADE,
    spell_name VARCHAR(100) NOT NULL,
    spell_mantain INTEGER NOT NULL,
    spell_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ===================================================================

-- Índices para tabla users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Índices para tabla user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);

-- Índices para tabla user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Índices para tabla game_state
CREATE INDEX IF NOT EXISTS idx_game_state_user_profile ON game_state(user_profile_id);

-- Índices para tabla spells
CREATE INDEX IF NOT EXISTS idx_spells_user_profile ON spells(user_profile_id);

-- Índices para tabla ready_to_cast
CREATE INDEX IF NOT EXISTS idx_ready_to_cast_user_profile ON ready_to_cast(user_profile_id);

-- Índices para tabla spell_mantain_list
CREATE INDEX IF NOT EXISTS idx_spell_mantain_list_user_profile ON spell_mantain_list(user_profile_id);

-- ===================================================================
-- TRIGGERS
-- ===================================================================

-- Trigger para actualizar updated_at en tabla users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en tabla user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en tabla game_state
CREATE TRIGGER update_game_state_updated_at
    BEFORE UPDATE ON game_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- COMENTARIOS EN TABLAS Y COLUMNAS (Documentación)
-- ===================================================================

COMMENT ON TABLE users IS 'Usuarios del sistema con autenticación';
COMMENT ON TABLE user_sessions IS 'Gestión de sesiones y tokens JWT';
COMMENT ON TABLE user_profiles IS 'Perfiles/personajes de cada usuario';
COMMENT ON TABLE game_state IS 'Estado del contador de Zeon para cada perfil';
COMMENT ON TABLE spells IS 'Libro de hechizos persistente';
COMMENT ON TABLE ready_to_cast IS 'Hechizos preparados para lanzar (temporal)';
COMMENT ON TABLE spell_mantain_list IS 'Hechizos en mantenimiento (temporal)';

-- Comentarios en columnas de game_state
COMMENT ON COLUMN game_state.turn_number IS 'Número de turno actual';
COMMENT ON COLUMN game_state.zeon IS 'Zeon actual disponible';
COMMENT ON COLUMN game_state.rzeon IS 'Zeon máximo (reserva)';
COMMENT ON COLUMN game_state.act IS 'ACT del personaje';
COMMENT ON COLUMN game_state.rzeoni IS 'Regeneración zeónica';
COMMENT ON COLUMN game_state.zeona IS 'Zeon acumulado en el turno';
COMMENT ON COLUMN game_state.zeonp IS 'Zeon perdido';
COMMENT ON COLUMN game_state.acu IS 'Acumulación activa (boolean)';
COMMENT ON COLUMN game_state.lock_state IS 'Estado de bloqueo';
COMMENT ON COLUMN game_state.zeon_to_spend IS 'Zeon a gastar calculado';
COMMENT ON COLUMN game_state.mantain_zeon_to_spend IS 'Zeon de mantenimiento calculado';

-- ===================================================================
-- NOTA: Este archivo define solo el esquema. Los datos iniciales
-- y de prueba se encuentran en archivos separados (02-seed-data.sql)
-- ===================================================================

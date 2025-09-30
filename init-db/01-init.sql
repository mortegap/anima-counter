-- Script de inicialización de la base de datos para Anima Counter

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla para guardar perfiles/personajes de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para guardar el estado del juego/contador
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

-- Tabla para guardar hechizos del libro de hechizos
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

-- Tabla para hechizos listos para lanzar
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

-- Tabla para hechizos en mantenimiento
CREATE TABLE IF NOT EXISTS spell_mantain_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    spell_id UUID REFERENCES spells(id) ON DELETE CASCADE,
    spell_name VARCHAR(100) NOT NULL,
    spell_mantain INTEGER NOT NULL,
    spell_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_game_state_user_profile ON game_state(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_spells_user_profile ON spells(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_ready_to_cast_user_profile ON ready_to_cast(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_spell_mantain_list_user_profile ON spell_mantain_list(user_profile_id);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualización automática de updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_state_updated_at BEFORE UPDATE ON game_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar un perfil de usuario por defecto
INSERT INTO user_profiles (name) VALUES ('Jugador Principal')
ON CONFLICT DO NOTHING;

-- Insertar estado de juego inicial para el perfil por defecto
INSERT INTO game_state (user_profile_id, turn_number, zeon, rzeon, act, rzeoni, zeona, zeonp, acu, lock_state)
SELECT id, 0, 0, 0, 0, 0, 0, 0, false, 0
FROM user_profiles
WHERE name = 'Jugador Principal'
ON CONFLICT DO NOTHING;
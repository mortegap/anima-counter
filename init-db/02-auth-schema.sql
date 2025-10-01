-- Script de autenticación y gestión de usuarios para Anima Counter

-- Tabla de usuarios
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

-- Tabla de sesiones/tokens (opcional para JWT blacklist)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT false
);

-- Modificar tabla user_profiles para referenciar usuarios
-- Primero agregar la columna user_id
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Trigger para actualizar updated_at en usuarios
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para limpiar sesiones expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions
    WHERE expires_at < CURRENT_TIMESTAMP OR is_revoked = true;
END;
$$ LANGUAGE plpgsql;

-- Crear un usuario demo (contraseña: "demo123")
-- Hash bcrypt para "demo123": $2b$10$rOI8QKmXoKcCk8jrK8y8n.H.J8VqjNJXd9SyE.Vg.l5Xr8YqzQ2OW
INSERT INTO users (username, email, password_hash, display_name)
VALUES (
    'demo',
    'demo@example.com',
    '$2b$10$rOI8QKmXoKcCk8jrK8y8n.H.J8VqjNJXd9SyE.Vg.l5Xr8YqzQ2OW',
    'Usuario Demo'
) ON CONFLICT (username) DO NOTHING;

-- Asociar el perfil existente con el usuario demo
UPDATE user_profiles
SET user_id = (SELECT id FROM users WHERE username = 'demo')
WHERE name = 'Jugador Principal' AND user_id IS NULL;
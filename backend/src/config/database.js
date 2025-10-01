const { Pool } = require('pg');
require('dotenv').config();

// Configuración del pool de PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'anima_counter',
  user: process.env.DB_USER || 'anima_user',
  password: process.env.DB_PASSWORD || 'anima_password_2024',
});

// Evento de conexión exitosa
pool.on('connect', () => {
  console.log('✓ Conexión a PostgreSQL establecida');
});

// Evento de error
pool.on('error', (err) => {
  console.error('✗ Error inesperado en PostgreSQL:', err);
  process.exit(-1);
});

// Función para verificar la salud de la base de datos
async function checkDatabaseHealth() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Error al verificar salud de la base de datos:', error);
    return false;
  }
}

module.exports = {
  pool,
  checkDatabaseHealth
};

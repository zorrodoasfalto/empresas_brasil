const { Pool } = require('pg');

async function checkRole() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const result = await pool.query('SELECT id, email, name, role FROM simple_users WHERE email = $1', ['rodyrodrigo@gmail.com']);
    console.log('rodyrodrigo em simple_users:', result.rows[0]);
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
  }
}

checkRole();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: { rejectUnauthorized: false },
});

async function checkPassword() {
  try {
    const user = await pool.query('SELECT * FROM simple_users WHERE email = $1', ['rodyrodrigo@gmail.com']);

    if (user.rows.length > 0) {
      console.log('Usuário encontrado:');
      console.log('Email:', user.rows[0].email);
      console.log('Password hash:', user.rows[0].password);

      // Testar senhas comuns
      const passwords = ['teste123', 'admin', '123456', 'password', 'rodyrodrigo'];

      for (const pwd of passwords) {
        const match = await bcrypt.compare(pwd, user.rows[0].password);
        if (match) {
          console.log(`✅ Senha correta: ${pwd}`);
          return;
        }
      }

      console.log('❌ Nenhuma senha testada funcionou');
      console.log('🔧 Atualizando senha para "teste123"...');

      const hash = await bcrypt.hash('teste123', 10);
      await pool.query('UPDATE simple_users SET password = $1 WHERE email = $2', [hash, 'rodyrodrigo@gmail.com']);

      console.log('✅ Senha atualizada para "teste123"');
    } else {
      console.log('❌ Usuário não encontrado');
    }
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

checkPassword();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: { rejectUnauthorized: false },
});

async function syncAllUsers() {
  try {
    console.log('🔄 SINCRONIZANDO TODOS OS USUÁRIOS');
    console.log('=================================');

    // 1. Buscar todos os usuários de simple_users
    console.log('\\n📊 1. Buscando usuários de simple_users...');
    const simpleUsers = await pool.query('SELECT * FROM simple_users ORDER BY id');
    console.log(`✅ Encontrados ${simpleUsers.rows.length} usuários em simple_users`);

    // 2. Verificar estrutura da tabela users
    console.log('\\n📊 2. Verificando estrutura de users...');
    const usersColumns = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    const columnNames = usersColumns.rows.map(row => row.column_name);
    console.log('✅ Colunas em users:', columnNames);

    // 3. Sincronizar cada usuário
    console.log('\\n🔄 3. Sincronizando usuários...');
    let synced = 0;
    let errors = 0;

    for (const user of simpleUsers.rows) {
      try {
        // Primeiro tentar UPDATE
        const updateResult = await pool.query(`
          UPDATE users
          SET email = $1,
              role = $2,
              trial_expires_at = $3,
              subscription_active = $4,
              subscription_expires_at = $5
          WHERE id = $6
        `, [
          user.email,
          user.role || 'user',
          user.trial_expires_at || '2025-01-29 23:59:59', // 7 dias de trial
          user.subscription_active || false,
          user.subscription_expires_at || null,
          user.id
        ]);

        if (updateResult.rowCount === 0) {
          // Se não atualizou nenhuma linha, usuário não existe - fazer INSERT
          await pool.query(`
            INSERT INTO users (id, email, role, trial_expires_at, subscription_active, subscription_expires_at)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            user.id,
            user.email,
            user.role || 'user',
            user.trial_expires_at || '2025-01-29 23:59:59',
            user.subscription_active || false,
            user.subscription_expires_at || null
          ]);
        }

        console.log(`✅ Usuário ${user.id} (${user.email}) sincronizado`);
        synced++;

      } catch (error) {
        console.log(`❌ Erro ao sincronizar usuário ${user.id}: ${error.message}`);
        errors++;
      }
    }

    console.log('\\n📊 4. Resultado da sincronização:');
    console.log(`✅ Usuários sincronizados: ${synced}`);
    console.log(`❌ Erros: ${errors}`);

    // 5. Verificar resultado final
    console.log('\\n🔍 5. Verificação final...');
    const finalCheck = await pool.query('SELECT COUNT(*) as total FROM users');
    const adminCheck = await pool.query(`
      SELECT id, email, role, subscription_active
      FROM users
      WHERE role = 'admin'
    `);

    console.log(`✅ Total de usuários em 'users': ${finalCheck.rows[0].total}`);
    console.log(`👑 Admins encontrados: ${adminCheck.rows.length}`);

    if (adminCheck.rows.length > 0) {
      adminCheck.rows.forEach(admin => {
        console.log(`   - ID ${admin.id}: ${admin.email} (${admin.role})`);
      });
    }

    console.log('\\n🎯 SINCRONIZAÇÃO COMPLETA!');

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

syncAllUsers();
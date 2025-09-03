const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: { rejectUnauthorized: false }
});

async function restoreCorrectCredits() {
  try {
    console.log('🔧 Restaurando lógica correta de créditos...');
    
    // 1. Restaurar créditos corretos por plano na tabela user_credits
    console.log('\n1️⃣ Restaurando créditos corretos por plano...');
    
    // Admin: 10.000 créditos (apenas admin)
    const adminUpdate = await pool.query(`
      UPDATE user_credits 
      SET credits = 10000, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id IN (SELECT id FROM simple_users WHERE role = 'admin')
        AND plan = 'admin'
    `);
    console.log(`✅ ${adminUpdate.rowCount} admins com 10.000 créditos`);
    
    // Max: 300 créditos  
    const maxUpdate = await pool.query(`
      UPDATE user_credits 
      SET credits = 300, updated_at = CURRENT_TIMESTAMP 
      WHERE plan = 'max'
    `);
    console.log(`✅ ${maxUpdate.rowCount} usuários MAX com 300 créditos`);
    
    // Premium: 150 créditos
    const premiumUpdate = await pool.query(`
      UPDATE user_credits 
      SET credits = 150, updated_at = CURRENT_TIMESTAMP 
      WHERE plan = 'premium'
    `);
    console.log(`✅ ${premiumUpdate.rowCount} usuários PREMIUM com 150 créditos`);
    
    // Pro: 50 créditos
    const proUpdate = await pool.query(`
      UPDATE user_credits 
      SET credits = 50, updated_at = CURRENT_TIMESTAMP 
      WHERE plan = 'pro'
    `);
    console.log(`✅ ${proUpdate.rowCount} usuários PRO com 50 créditos`);
    
    // Trial: 10 créditos (não 5!)
    const trialUpdate = await pool.query(`
      UPDATE user_credits 
      SET credits = 10, updated_at = CURRENT_TIMESTAMP 
      WHERE plan = 'trial'
    `);
    console.log(`✅ ${trialUpdate.rowCount} usuários TRIAL com 10 créditos`);
    
    // 2. Sincronizar com outras tabelas (se existirem as colunas)
    console.log('\n2️⃣ Sincronizando com outras tabelas...');
    
    try {
      // Sync com simple_users
      const syncSimple = await pool.query(`
        UPDATE simple_users 
        SET credits = uc.credits
        FROM user_credits uc 
        WHERE simple_users.id = uc.user_id
      `);
      console.log(`✅ ${syncSimple.rowCount} usuários sincronizados em simple_users`);
    } catch (error) {
      if (error.code === '42703') {
        console.log('ℹ️  Coluna credits não existe em simple_users (ok)');
      }
    }
    
    try {
      // Sync com users
      const syncUsers = await pool.query(`
        UPDATE users 
        SET credits = uc.credits
        FROM user_credits uc 
        WHERE users.id = uc.user_id
      `);
      console.log(`✅ ${syncUsers.rowCount} usuários sincronizados em users`);
    } catch (error) {
      if (error.code === '42703') {
        console.log('ℹ️  Coluna credits não existe em users (ok)');
      }
    }
    
    // 3. Mostrar status final do Rody
    console.log('\n3️⃣ Status final do rodyrodrigo@gmail.com:');
    const finalStatus = await pool.query(`
      SELECT 
        su.email,
        su.role,
        uc.credits,
        uc.plan,
        uc.updated_at
      FROM simple_users su
      JOIN user_credits uc ON su.id = uc.user_id
      WHERE su.email = 'rodyrodrigo@gmail.com'
    `);
    
    if (finalStatus.rows.length > 0) {
      const status = finalStatus.rows[0];
      console.log(`📧 Email: ${status.email}`);
      console.log(`👑 Role: ${status.role}`);
      console.log(`💳 Créditos: ${status.credits}`);
      console.log(`📋 Plano: ${status.plan}`);
      console.log(`🕒 Atualizado: ${status.updated_at}`);
    }
    
    // 4. Mostrar resumo geral
    console.log('\n4️⃣ Resumo dos planos:');
    const summary = await pool.query(`
      SELECT plan, COUNT(*) as users, AVG(credits) as avg_credits
      FROM user_credits 
      GROUP BY plan 
      ORDER BY AVG(credits) DESC
    `);
    
    summary.rows.forEach(row => {
      console.log(`${row.plan}: ${row.users} usuários com ${row.avg_credits} créditos em média`);
    });

    await pool.end();
    console.log('\n🎉 Sistema de créditos restaurado corretamente!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    await pool.end();
    process.exit(1);
  }
}

restoreCorrectCredits();
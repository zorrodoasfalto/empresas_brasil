const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: { rejectUnauthorized: false }
});

async function fixCreditsSystem() {
  try {
    console.log('🔧 Corrigindo sistema de créditos...');
    
    // 1. Add credits column to simple_users table
    console.log('\n1️⃣ Adicionando coluna credits na tabela simple_users...');
    try {
      await pool.query('ALTER TABLE simple_users ADD COLUMN credits INTEGER DEFAULT 0');
      console.log('✅ Coluna credits adicionada em simple_users');
    } catch (error) {
      if (error.code === '42701') { // Column already exists
        console.log('ℹ️  Coluna credits já existe em simple_users');
      } else {
        throw error;
      }
    }
    
    // 2. Add credits column to users table
    console.log('\n2️⃣ Adicionando coluna credits na tabela users...');
    try {
      await pool.query('ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 0');
      console.log('✅ Coluna credits adicionada em users');
    } catch (error) {
      if (error.code === '42701') { // Column already exists
        console.log('ℹ️  Coluna credits já existe em users');
      } else {
        throw error;
      }
    }

    // 3. Sync credits from user_credits to simple_users
    console.log('\n3️⃣ Sincronizando créditos para simple_users...');
    const syncSimple = await pool.query(`
      UPDATE simple_users 
      SET credits = uc.credits
      FROM user_credits uc 
      WHERE simple_users.id = uc.user_id
    `);
    console.log(`✅ ${syncSimple.rowCount} usuários sincronizados em simple_users`);

    // 4. Sync credits from user_credits to users
    console.log('\n4️⃣ Sincronizando créditos para users...');
    const syncUsers = await pool.query(`
      UPDATE users 
      SET credits = uc.credits
      FROM user_credits uc 
      WHERE users.id = uc.user_id
    `);
    console.log(`✅ ${syncUsers.rowCount} usuários sincronizados em users`);
    
    // 5. Set admin credits to 10,000 in all tables
    console.log('\n5️⃣ Definindo créditos de admin para 10.000...');
    
    // Update user_credits table
    const updateUserCredits = await pool.query(`
      UPDATE user_credits 
      SET credits = 10000, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id IN (SELECT id FROM simple_users WHERE role = 'admin')
    `);
    
    // Update simple_users table
    const updateSimpleUsers = await pool.query(`
      UPDATE simple_users 
      SET credits = 10000 
      WHERE role = 'admin'
    `);
    
    // Update users table
    const updateUsers = await pool.query(`
      UPDATE users 
      SET credits = 10000 
      WHERE role = 'admin'
    `);
    
    console.log(`✅ ${updateUserCredits.rowCount} admins atualizados em user_credits`);
    console.log(`✅ ${updateSimpleUsers.rowCount} admins atualizados em simple_users`);
    console.log(`✅ ${updateUsers.rowCount} admins atualizados em users`);
    
    // 6. Show final status
    console.log('\n6️⃣ Status final do rodyrodrigo@gmail.com:');
    const finalStatus = await pool.query(`
      SELECT 
        su.email,
        su.role,
        su.credits as simple_credits,
        uc.credits as user_credits_credits,
        u.credits as users_credits
      FROM simple_users su
      LEFT JOIN user_credits uc ON su.id = uc.user_id
      LEFT JOIN users u ON su.email = u.email
      WHERE su.email = 'rodyrodrigo@gmail.com'
    `);
    
    if (finalStatus.rows.length > 0) {
      const status = finalStatus.rows[0];
      console.log(`📧 Email: ${status.email}`);
      console.log(`👑 Role: ${status.role}`);
      console.log(`💳 simple_users credits: ${status.simple_credits}`);
      console.log(`💳 user_credits credits: ${status.user_credits_credits}`);
      console.log(`💳 users credits: ${status.users_credits}`);
    }

    await pool.end();
    console.log('\n🎉 Sistema de créditos corrigido com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    await pool.end();
    process.exit(1);
  }
}

fixCreditsSystem();
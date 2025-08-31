const { Pool } = require('pg');

async function checkUsersStats() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('📊 ESTATÍSTICAS COMPLETAS DE USUÁRIOS');
    console.log('='.repeat(50));
    
    // 1. Total de usuários por tabela
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalSimpleUsers = await pool.query('SELECT COUNT(*) as count FROM simple_users');
    
    console.log('👥 TOTAIS:');
    console.log(`   users: ${totalUsers.rows[0].count} usuários`);
    console.log(`   simple_users: ${totalSimpleUsers.rows[0].count} usuários`);
    
    // 2. Verificar campos de assinatura na simple_users
    const simpleUsersFields = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'simple_users'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 CAMPOS em simple_users:');
    simpleUsersFields.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (null: ${col.is_nullable})`);
    });
    
    // 3. Verificar campos de assinatura na users
    const usersFields = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      AND column_name LIKE '%subscription%' OR column_name LIKE '%trial%' OR column_name LIKE '%premium%'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 CAMPOS DE ASSINATURA em users:');
    if (usersFields.rows.length > 0) {
      usersFields.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('   ❌ Nenhum campo de assinatura encontrado em users');
    }
    
    // 4. Dados de assinatura na simple_users
    const subscriptionStats = await pool.query(`
      SELECT 
        subscription_active,
        COUNT(*) as count
      FROM simple_users 
      GROUP BY subscription_active
      ORDER BY subscription_active DESC
    `);
    
    console.log('\n💎 STATUS DE ASSINATURAS (simple_users):');
    subscriptionStats.rows.forEach(row => {
      const status = row.subscription_active ? 'ATIVA' : 'INATIVA';
      console.log(`   ${status}: ${row.count} usuários`);
    });
    
    // 5. Verificar se há trial ativo
    const trialStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE trial_expires_at > CURRENT_TIMESTAMP) as active_trials,
        COUNT(*) FILTER (WHERE trial_expires_at <= CURRENT_TIMESTAMP) as expired_trials,
        COUNT(*) FILTER (WHERE trial_expires_at IS NULL) as no_trial
      FROM simple_users
    `);
    
    console.log('\n🆓 STATUS DE TRIAL:');
    const trial = trialStats.rows[0];
    console.log(`   Total: ${trial.total}`);
    console.log(`   Trial ativo: ${trial.active_trials}`);
    console.log(`   Trial expirado: ${trial.expired_trials}`);
    console.log(`   Sem trial: ${trial.no_trial}`);
    
    // 6. Verificar tabela Stripe se existir
    const stripeTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'stripe_customers'
      )
    `);
    
    if (stripeTableExists.rows[0].exists) {
      const stripeStats = await pool.query('SELECT COUNT(*) as count FROM stripe_customers');
      console.log(`\n💳 CLIENTES STRIPE: ${stripeStats.rows[0].count}`);
    } else {
      console.log('\n💳 STRIPE: Tabela não encontrada');
    }
    
    // 7. Resumo para implementação
    console.log('\n🎯 RESUMO PARA CARDS ADMIN:');
    console.log(`   📊 Total Usuários: ${totalUsers.rows[0].count}`);
    console.log(`   🆓 Usuários Free: ${totalUsers.rows[0].count - (subscriptionStats.rows.find(r => r.subscription_active)?.count || 0)}`);
    console.log(`   💎 Usuários Premium: ${subscriptionStats.rows.find(r => r.subscription_active)?.count || 0}`);
    console.log(`   ⏰ Trial Ativo: ${trial.active_trials}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

checkUsersStats();
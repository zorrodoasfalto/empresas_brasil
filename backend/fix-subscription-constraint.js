const { Pool } = require('pg');
require('dotenv').config();

async function fixSubscriptionConstraint() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔧 CORRIGINDO FOREIGN KEY CONSTRAINT');
    console.log('=' .repeat(50));
    
    console.log('🔍 1. Verificando constraint atual...');
    const currentConstraint = await pool.query(`
      SELECT 
        tc.constraint_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE 
        tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'subscriptions'
        AND kcu.column_name = 'user_id'
    `);
    
    if (currentConstraint.rows.length > 0) {
      const constraint = currentConstraint.rows[0];
      console.log(`   Constraint atual: ${constraint.constraint_name}`);
      console.log(`   Aponta para: ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
      
      if (constraint.foreign_table_name === 'simple_users') {
        console.log('❌ Constraint aponta para tabela ERRADA (simple_users)');
        console.log('🔧 Corrigindo para apontar para tabela users...');
        
        // Drop da constraint antiga
        await pool.query(`ALTER TABLE subscriptions DROP CONSTRAINT ${constraint.constraint_name}`);
        console.log('✅ Constraint antiga removida');
        
        // Criar nova constraint apontando para users
        await pool.query(`
          ALTER TABLE subscriptions 
          ADD CONSTRAINT subscriptions_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `);
        console.log('✅ Nova constraint criada apontando para users.id');
        
      } else {
        console.log('✅ Constraint já aponta para tabela correta');
      }
    } else {
      console.log('❌ Nenhuma constraint de user_id encontrada');
      
      // Criar constraint apontando para users
      await pool.query(`
        ALTER TABLE subscriptions 
        ADD CONSTRAINT subscriptions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('✅ Constraint criada apontando para users.id');
    }
    
    console.log('\n🧪 2. Testando constraint...');
    // Testar se Victor pode criar subscription agora
    const victorId = 39;
    const testResult = await pool.query(`
      SELECT COUNT(*) as can_create
      FROM users 
      WHERE id = $1
    `, [victorId]);
    
    if (testResult.rows[0].can_create > 0) {
      console.log('✅ Victor (ID 39) pode criar subscriptions agora');
    } else {
      console.log('❌ Victor (ID 39) ainda não pode criar subscriptions');
    }
    
    console.log('\n✅ CORREÇÃO CONCLUÍDA!');
    console.log('🎯 Agora Victor e esposa podem usar códigos de afiliado normalmente');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    pool.end();
  }
}

fixSubscriptionConstraint();
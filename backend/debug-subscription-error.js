const { Pool } = require('pg');
require('dotenv').config();

async function debugSubscriptionError() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 INVESTIGANDO ERRO DE SUBSCRIPTIONS');
    console.log('=' .repeat(50));
    
    // 1. Verificar estrutura da tabela subscriptions
    console.log('📋 1. Estrutura da tabela subscriptions:');
    const subscriptionsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'subscriptions' 
      ORDER BY ordinal_position
    `);
    
    subscriptionsStructure.rows.forEach(col => {
      console.log(`   ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} - Default: ${col.column_default || 'None'}`);
    });
    
    // 2. Verificar constraints da tabela
    console.log('\n🔗 2. Foreign key constraints:');
    const constraints = await pool.query(`
      SELECT 
        tc.constraint_name, 
        tc.table_name, 
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
    `);
    
    constraints.rows.forEach(constraint => {
      console.log(`   ${constraint.constraint_name}: ${constraint.table_name}.${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
    });
    
    // 3. Verificar dados órfãos
    console.log('\n🔍 3. Verificando dados órfãos na tabela subscriptions:');
    const orphanedSubscriptions = await pool.query(`
      SELECT s.id, s.user_id, s.created_at
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE u.id IS NULL
      ORDER BY s.id DESC
      LIMIT 10
    `);
    
    if (orphanedSubscriptions.rows.length > 0) {
      console.log('❌ Dados órfãos encontrados:');
      orphanedSubscriptions.rows.forEach(sub => {
        console.log(`   Subscription ID: ${sub.id}, User ID: ${sub.user_id}, Created: ${sub.created_at}`);
      });
    } else {
      console.log('✅ Nenhum dado órfão encontrado');
    }
    
    // 4. Verificar últimas subscriptions criadas
    console.log('\n📊 4. Últimas subscriptions criadas:');
    const recentSubscriptions = await pool.query(`
      SELECT s.id, s.user_id, u.email, s.plan_type, s.status, s.created_at
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 5
    `);
    
    recentSubscriptions.rows.forEach(sub => {
      console.log(`   ID: ${sub.id}, User: ${sub.email} (${sub.user_id}), Plan: ${sub.plan_type}, Status: ${sub.status}`);
    });
    
    // 5. Verificar se Victor e esposa existem
    console.log('\n👫 5. Verificando usuários Victor e esposa:');
    const victorUsers = await pool.query(`
      SELECT id, email, first_name, last_name, role
      FROM users 
      WHERE email ILIKE '%victor%' OR first_name ILIKE '%victor%' OR last_name ILIKE '%victor%'
      ORDER BY id
    `);
    
    console.log('Usuários relacionados ao Victor:');
    victorUsers.rows.forEach(user => {
      console.log(`   ID: ${user.id}, Email: ${user.email}, Nome: ${user.first_name} ${user.last_name}, Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    pool.end();
  }
}

debugSubscriptionError();
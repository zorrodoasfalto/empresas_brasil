const { Pool } = require('pg');
const path = require('path');

// Load .env from backend directory
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

async function testDatabase() {
  console.log('🧪 TESTANDO TABELAS DO BANCO...\n');

  try {
    // Test 1: Check if tables exist
    const tables = await pool.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('subscriptions', 'affiliates', 'affiliate_referrals', 'affiliate_withdrawals', 'affiliate_commissions')
      ORDER BY tablename;
    `);

    console.log('✅ Tabelas encontradas:', tables.rows.map(r => r.tablename));

    // Test 2: Check table structures
    for (const table of ['subscriptions', 'affiliates', 'affiliate_referrals']) {
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position;
      `, [table]);
      
      console.log(`\n📋 Estrutura da tabela "${table}":`);
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }

    // Test 3: Check indexes
    const indexes = await pool.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname;
    `);

    console.log('\n🗂️  Índices criados:', indexes.rows.length);
    indexes.rows.forEach(idx => {
      console.log(`  - ${idx.indexname} em ${idx.tablename}`);
    });

  } catch (error) {
    console.error('❌ Erro ao testar banco:', error.message);
  }
}

async function testAffiliateCode() {
  console.log('\n🧪 TESTANDO GERAÇÃO DE CÓDIGO AFILIADO...\n');

  try {
    // Test creating affiliate code for user ID 1
    const userCheck = await pool.query('SELECT id FROM simple_users LIMIT 1');
    
    if (userCheck.rows.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado para teste');
      return;
    }

    const userId = userCheck.rows[0].id;
    console.log(`📝 Testando com usuário ID: ${userId}`);

    // Generate affiliate code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let affiliateCode = '';
    for (let i = 0; i < 8; i++) {
      affiliateCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Insert affiliate record
    await pool.query(
      `INSERT INTO affiliates (user_id, affiliate_code) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id) DO UPDATE SET 
       affiliate_code = $2, updated_at = CURRENT_TIMESTAMP`,
      [userId, affiliateCode]
    );

    console.log(`✅ Código afiliado criado: ${affiliateCode}`);

    // Verify it was created
    const verify = await pool.query(
      'SELECT * FROM affiliates WHERE user_id = $1',
      [userId]
    );

    console.log('📊 Dados do afiliado:', verify.rows[0]);

  } catch (error) {
    console.error('❌ Erro ao testar código afiliado:', error.message);
  }
}

async function testStripeConfig() {
  console.log('\n🧪 TESTANDO CONFIGURAÇÃO STRIPE...\n');

  const requiredEnvs = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY', 
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PRICE_ID_PRO',
    'STRIPE_PRICE_ID_PREMIUM',
    'STRIPE_PRICE_ID_MAX'
  ];

  for (const env of requiredEnvs) {
    const value = process.env[env];
    if (value && value !== 'whsec_placeholder_for_webhook' && value !== 'price_placeholder_pro') {
      console.log(`✅ ${env}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`❌ ${env}: NÃO CONFIGURADO`);
    }
  }

  // Test Stripe connection
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const account = await stripe.account.retrieve();
    console.log(`✅ Stripe conectado: ${account.display_name || account.id}`);
  } catch (error) {
    console.error('❌ Erro ao conectar Stripe:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 INICIANDO TESTES DO SISTEMA STRIPE + AFILIADOS\n');
  console.log('='.repeat(60));

  await testDatabase();
  await testAffiliateCode();
  await testStripeConfig();

  console.log('\n' + '='.repeat(60));
  console.log('🎯 TESTES CONCLUÍDOS!');
  
  process.exit(0);
}

runTests().catch(console.error);
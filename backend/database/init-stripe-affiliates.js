const { Pool } = require('pg');

// Usar a mesma configuração do server.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

async function initStripeAndAffiliatesTables() {
  const client = await pool.connect();
  
  try {
    console.log('🏗️  Criando tabelas Stripe e Afiliados...');

    // 1. Tabela de assinaturas
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255) UNIQUE,
        stripe_price_id VARCHAR(255),
        plan_type VARCHAR(50) DEFAULT 'pro', -- pro, premium, max
        status VARCHAR(50) DEFAULT 'inactive', -- active, inactive, canceled, past_due
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 2. Tabela de afiliados 
    await client.query(`
      CREATE TABLE IF NOT EXISTS affiliates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        affiliate_code VARCHAR(20) UNIQUE NOT NULL,
        total_earned DECIMAL(10,2) DEFAULT 0.00,
        total_referrals INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 3. Tabela de referrals
    await client.query(`
      CREATE TABLE IF NOT EXISTS affiliate_referrals (
        id SERIAL PRIMARY KEY,
        affiliate_id INTEGER NOT NULL,
        referred_user_id INTEGER NOT NULL,
        commission_rate DECIMAL(5,2) DEFAULT 15.00,
        monthly_commission DECIMAL(10,2) DEFAULT 0.00,
        plan_type VARCHAR(50),
        status VARCHAR(20) DEFAULT 'active', -- active, inactive, canceled
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE,
        FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(affiliate_id, referred_user_id)
      );
    `);

    // 4. Tabela de saques de afiliados
    await client.query(`
      CREATE TABLE IF NOT EXISTS affiliate_withdrawals (
        id SERIAL PRIMARY KEY,
        affiliate_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, paid
        pix_key VARCHAR(255),
        notes TEXT,
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP,
        processed_by VARCHAR(255), -- email do admin
        FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE
      );
    `);

    // 5. Tabela de histórico de comissões
    await client.query(`
      CREATE TABLE IF NOT EXISTS affiliate_commissions (
        id SERIAL PRIMARY KEY,
        affiliate_id INTEGER NOT NULL,
        referred_user_id INTEGER NOT NULL,
        stripe_subscription_id VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        plan_type VARCHAR(50),
        commission_month DATE NOT NULL, -- YYYY-MM-01
        status VARCHAR(20) DEFAULT 'earned', -- earned, paid
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE,
        FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Criar índices para performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
      
      CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
      CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
      
      CREATE INDEX IF NOT EXISTS idx_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
      CREATE INDEX IF NOT EXISTS idx_referrals_referred_user ON affiliate_referrals(referred_user_id);
      
      CREATE INDEX IF NOT EXISTS idx_withdrawals_affiliate_id ON affiliate_withdrawals(affiliate_id);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON affiliate_withdrawals(status);
      
      CREATE INDEX IF NOT EXISTS idx_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
      CREATE INDEX IF NOT EXISTS idx_commissions_month ON affiliate_commissions(commission_month);
    `);

    console.log('✅ Tabelas Stripe e Afiliados criadas com sucesso!');
    
    // Verificar se tabelas foram criadas
    const tables = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('subscriptions', 'affiliates', 'affiliate_referrals', 'affiliate_withdrawals', 'affiliate_commissions')
      ORDER BY tablename;
    `);
    
    console.log('📋 Tabelas criadas:', tables.rows.map(row => row.tablename));

  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initStripeAndAffiliatesTables()
    .then(() => {
      console.log('🎉 Inicialização concluída!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Erro na inicialização:', error);
      process.exit(1);
    });
}

module.exports = { initStripeAndAffiliatesTables, pool };
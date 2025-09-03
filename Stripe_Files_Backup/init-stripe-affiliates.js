const { Pool } = require('pg');

async function initStripeAndAffiliates(pool) {
  console.log('🏗️  Creating Stripe and Affiliates tables...');
  
  try {
    // Create subscriptions table
    await pool.query(`
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

    // Create affiliates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS affiliates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        affiliate_code VARCHAR(20) NOT NULL UNIQUE,
        total_referrals INTEGER DEFAULT 0,
        total_commissions INTEGER DEFAULT 0, -- in cents
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create affiliate referrals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS affiliate_referrals (
        id SERIAL PRIMARY KEY,
        affiliate_id INTEGER NOT NULL,
        referred_user_id INTEGER NOT NULL,
        plan_type VARCHAR(50) NOT NULL,
        monthly_commission INTEGER NOT NULL, -- in cents
        status VARCHAR(50) DEFAULT 'active', -- active, inactive
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE,
        FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(affiliate_id, referred_user_id)
      );
    `);

    // Create affiliate withdrawals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS affiliate_withdrawals (
        id SERIAL PRIMARY KEY,
        affiliate_id INTEGER NOT NULL,
        amount INTEGER NOT NULL, -- in cents
        status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, paid
        pix_key VARCHAR(255),
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE
      );
    `);

    // Create affiliate commissions table (monthly tracking)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS affiliate_commissions (
        id SERIAL PRIMARY KEY,
        affiliate_id INTEGER NOT NULL,
        referred_user_id INTEGER NOT NULL,
        stripe_subscription_id VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL, -- in cents
        plan_type VARCHAR(50) NOT NULL,
        commission_month DATE NOT NULL, -- YYYY-MM-01 format
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE,
        FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(affiliate_id, referred_user_id, commission_month)
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
      CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
      CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
      CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
      CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_user_id ON affiliate_referrals(referred_user_id);
      CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
      CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_month ON affiliate_commissions(commission_month);
    `);

    console.log('✅ Stripe and Affiliates tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating Stripe and Affiliates tables:', error);
    throw error;
  }
}

module.exports = { initStripeAndAffiliates };
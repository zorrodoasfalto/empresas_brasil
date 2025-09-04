const { Pool } = require('pg');
require('dotenv').config();

async function checkUserCredits() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔍 CHECKING CREDITS FOR rodyrodrigo@gmail.com');
    console.log('=' + '='.repeat(50));
    
    // 1. Check if user exists
    const userResult = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      ['rodyrodrigo@gmail.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found with email rodyrodrigo@gmail.com');
      return;
    }
    
    const user = userResult.rows[0];
    console.log(`✅ User found: ID ${user.id}, Email: ${user.email}`);
    
    // 2. Check user credits
    const creditsResult = await pool.query(
      'SELECT * FROM user_credits WHERE user_id = $1',
      [user.id]
    );
    
    if (creditsResult.rows.length === 0) {
      console.log(`❌ No credits record found for user ID ${user.id}`);
      console.log('📝 Creating credits record...');
      
      // Create credits record
      await pool.query(
        'INSERT INTO user_credits (user_id, credits) VALUES ($1, 0)',
        [user.id]
      );
      console.log('✅ Credits record created with 0 credits');
    } else {
      const credits = creditsResult.rows[0];
      console.log(`💳 Credits found: ${credits.credits} credits`);
      console.log(`📅 Updated: ${credits.updated_at}`);
      console.log(`📅 Created: ${credits.created_at}`);
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    pool.end();
  }
}

checkUserCredits();
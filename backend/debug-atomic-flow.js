const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = 'empresas-brasil-jwt-secret-2025-super-secure-key-for-production-and-development';

async function debugAtomicFlow() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔍 DEBUGGING ATOMIC FLOW - rodyrodrigo@gmail.com');
    console.log('=' .repeat(55));
    
    // Check if atomic code is being reached by adding test log
    console.log('💳 Testing if atomic section would be reached...');
    
    // Generate token for admin
    const token = jwt.sign({ id: 2, email: 'rodyrodrigo@gmail.com' }, JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log(`✅ Token created and decoded: ID=${decoded.id}, Email=${decoded.email}`);
    
    // Test the exact atomic logic here
    const requiredCredits = 1;
    console.log('💳 Attempting atomic credit deduction...');
    
    const deductionResult = await pool.query(`
      UPDATE user_credits 
      SET credits = credits - $1, updated_at = NOW() 
      WHERE user_id = $2 AND credits >= $1
      RETURNING credits, credits + $1 as original_credits
    `, [requiredCredits, decoded.id]);
    
    console.log('📊 Deduction result:', deductionResult.rows);
    
    if (deductionResult.rows.length === 0) {
      console.log('❌ No rows returned - either user not found or insufficient credits');
      
      const creditsCheck = await pool.query('SELECT credits FROM user_credits WHERE user_id = $1', [decoded.id]);
      console.log('💳 Current credits:', creditsCheck.rows);
    } else {
      const newCredits = deductionResult.rows[0].credits;
      const originalCredits = deductionResult.rows[0].original_credits;
      
      console.log(`💳 ✅ ATOMIC deduction successful: ${originalCredits} → ${newCredits} (-${requiredCredits})`);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    pool.end();
  }
}

debugAtomicFlow();
const { Pool } = require('pg');
require('dotenv').config();

async function checkRecentCreditUsage() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📋 ÚLTIMAS 10 OPERAÇÕES DE CRÉDITO (rodyrodrigo@gmail.com):');
    console.log('=' .repeat(70));
    
    const usageLog = await pool.query(`
      SELECT user_id, search_type, credits_used, search_query, timestamp 
      FROM credit_usage_log 
      WHERE user_id = 2 
      ORDER BY timestamp DESC 
      LIMIT 10
    `);
    
    if (usageLog.rows.length > 0) {
      usageLog.rows.forEach((log, index) => {
        const searchQuery = JSON.parse(log.search_query);
        console.log(`${index + 1}. ${log.search_type}: ${log.credits_used} crédito(s)`);
        console.log(`   📅 ${log.timestamp.toLocaleString('pt-BR')}`);
        console.log(`   🔍 UF: ${searchQuery.uf || 'N/A'}, Limit: ${searchQuery.companyLimit || 'N/A'}`);
        if (searchQuery.page) console.log(`   📄 Página: ${searchQuery.page}`);
        console.log('');
      });
    } else {
      console.log('📋 Nenhum log de uso encontrado');
    }
    
    // Check current credits
    const creditsResult = await pool.query('SELECT credits FROM user_credits WHERE user_id = 2');
    console.log(`💰 CRÉDITOS ATUAIS: ${creditsResult.rows[0].credits}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    pool.end();
  }
}

checkRecentCreditUsage();
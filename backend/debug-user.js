const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Debug endpoint to check who is logged in
app.get('/api/debug/who-am-i', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json({ error: 'No auth header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.json({ error: 'No token' });
    }

    // Simple decode (not verifying for debug purposes)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    // Get user from DB
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
      [payload.userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Check if user is affiliate
    const affiliateResult = await pool.query(
      'SELECT affiliate_code FROM affiliates WHERE user_id = $1',
      [user.id]
    );
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`.trim(),
        role: user.role
      },
      affiliate: affiliateResult.rows[0] || null,
      victorsCode: 'VICT039',
      canUseVictorsCode: user.id !== 39, // Victor can't use his own code
      message: user.id === 39 ? '❌ Victor cannot use his own affiliate code!' : '✅ Can use affiliate codes'
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔍 Debug server running on http://localhost:${PORT}`);
  console.log('📋 Test endpoint: http://localhost:3001/api/debug/who-am-i');
  console.log('💡 Use with Authorization: Bearer YOUR_JWT_TOKEN');
});

console.log('🎯 Para testar, você precisa:');
console.log('1. Fazer login no site');
console.log('2. Pegar o token JWT do localStorage');
console.log('3. Fazer GET para /api/debug/who-am-i com Authorization header');
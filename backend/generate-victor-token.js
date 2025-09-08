const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/jwt');

console.log('🔑 GERANDO TOKEN PARA victormagalhaesg@gmail.com');
console.log('=' .repeat(50));

const payload = {
  id: 39,
  email: 'victormagalhaesg@gmail.com'
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

console.log('✅ Token gerado:');
console.log(token);

console.log('\n🧪 Teste com curl:');
console.log(`curl -X GET http://localhost:6000/api/credits -H "Authorization: Bearer ${token}"`);
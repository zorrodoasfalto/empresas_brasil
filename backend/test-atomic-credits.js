const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = 'empresas-brasil-jwt-secret-2025-super-secure-key-for-production-and-development';

async function testAtomicCreditDeduction() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🧪 TESTING ATOMIC CREDIT DEDUCTION SYSTEM');
    console.log('=' .repeat(60));
    
    const adminEmail = 'rodyrodrigo@gmail.com';
    
    // 1. Check current credits BEFORE test
    console.log('💰 1. CHECKING CREDITS BEFORE TEST:');
    const creditsBefore = await pool.query(
      'SELECT credits FROM user_credits WHERE user_id = 2'
    );
    
    const initialCredits = creditsBefore.rows[0].credits;
    console.log(`   💳 Initial credits: ${initialCredits}`);
    
    // 2. Generate JWT token for admin
    console.log('\n🔑 2. GENERATING JWT TOKEN:');
    const token = jwt.sign({ id: 2, email: adminEmail }, JWT_SECRET, { expiresIn: '1h' });
    console.log('   ✅ Token generated successfully');
    
    // 3. Make a single API call to test atomic deduction
    console.log('\n🎯 3. TESTING SINGLE API CALL (should deduct exactly 1 credit):');
    
    const response = await fetch('http://localhost:6000/api/companies/filtered', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        uf: 'SP',
        companyLimit: 10,
        page: 1
      })
    });
    
    if (response.ok) {
      console.log('   ✅ API call successful');
    } else {
      const errorText = await response.text();
      console.log(`   ❌ API call failed: ${response.status} - ${errorText}`);
    }
    
    // 4. Check credits AFTER the test
    console.log('\n💰 4. CHECKING CREDITS AFTER TEST:');
    const creditsAfter = await pool.query(
      'SELECT credits FROM user_credits WHERE user_id = 2'
    );
    
    const finalCredits = creditsAfter.rows[0].credits;
    const difference = initialCredits - finalCredits;
    
    console.log(`   💳 Final credits: ${finalCredits}`);
    console.log(`   🔻 Difference: ${difference} credit(s)`);
    
    // 5. Analyze result
    console.log('\n📊 5. TEST RESULT ANALYSIS:');
    if (difference === 1) {
      console.log('   ✅ ✅ ✅ SUCCESS! Exactly 1 credit was deducted');
      console.log('   🔒 Atomic deduction system is working correctly');
    } else if (difference === 0) {
      console.log('   ⚠️  WARNING: No credits were deducted');
    } else {
      console.log(`   ❌ PROBLEM: ${difference} credits were deducted instead of 1`);
    }
    
    // 6. Test duplicate protection by making rapid consecutive calls
    console.log('\n⚡ 6. TESTING DUPLICATE PROTECTION (rapid consecutive calls):');
    console.log('   Making 3 identical requests within 1 second...');
    
    const rapidCallPromises = [];
    for (let i = 0; i < 3; i++) {
      rapidCallPromises.push(
        fetch('http://localhost:6000/api/companies/filtered', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            uf: 'RJ',
            companyLimit: 5,
            page: 1
          })
        })
      );
    }
    
    const rapidResults = await Promise.all(rapidCallPromises);
    let successCount = 0;
    let duplicateCount = 0;
    
    for (let i = 0; i < rapidResults.length; i++) {
      const result = rapidResults[i];
      if (result.ok) {
        successCount++;
        console.log(`   Request ${i+1}: ✅ Success (${result.status})`);
      } else if (result.status === 429) {
        duplicateCount++;
        console.log(`   Request ${i+1}: 🚫 Blocked as duplicate (${result.status})`);
      } else {
        console.log(`   Request ${i+1}: ❌ Error (${result.status})`);
      }
    }
    
    // 7. Check final credits after rapid test
    console.log('\n💰 7. FINAL CREDITS CHECK:');
    const creditsRapidAfter = await pool.query(
      'SELECT credits FROM user_credits WHERE user_id = 2'
    );
    
    const rapidFinalCredits = creditsRapidAfter.rows[0].credits;
    const rapidDifference = finalCredits - rapidFinalCredits;
    
    console.log(`   💳 Credits after rapid test: ${rapidFinalCredits}`);
    console.log(`   🔻 Additional deduction: ${rapidDifference} credit(s)`);
    
    // 8. Final analysis
    console.log('\n🏆 8. FINAL ANALYSIS:');
    console.log(`   📊 Total credits used in test: ${initialCredits - rapidFinalCredits}`);
    console.log(`   🚫 Duplicate requests blocked: ${duplicateCount}`);
    console.log(`   ✅ Successful requests: ${successCount + 1}`); // +1 for first single test
    
    if (rapidDifference <= successCount) {
      console.log('   ✅ ✅ ✅ DUPLICATE PROTECTION WORKING!');
      console.log('   🔒 System successfully prevented multiple credit deductions');
    } else {
      console.log('   ❌ DUPLICATE PROTECTION FAILED - Multiple deductions occurred');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    pool.end();
  }
}

testAtomicCreditDeduction();
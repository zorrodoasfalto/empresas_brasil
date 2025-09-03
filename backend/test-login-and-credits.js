const { Pool } = require('pg');
require('dotenv').config();

async function testLoginAndCredits() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🧪 TESTING LOGIN AND ATOMIC CREDIT DEDUCTION');
    console.log('=' .repeat(65));
    
    const adminEmail = 'rodyrodrigo@gmail.com';
    const adminPassword = '123456';
    
    // 1. Check current credits BEFORE test
    console.log('💰 1. CHECKING CREDITS BEFORE TEST:');
    const creditsBefore = await pool.query(
      'SELECT credits FROM user_credits WHERE user_id = 2'
    );
    
    const initialCredits = creditsBefore.rows[0].credits;
    console.log(`   💳 Initial credits: ${initialCredits}`);
    
    // 2. Login to get real JWT token
    console.log('\n🔑 2. LOGGING IN TO GET JWT TOKEN:');
    const loginResponse = await fetch('http://localhost:6000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword
      })
    });
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log(`   ❌ Login failed: ${loginResponse.status} - ${errorText}`);
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('   ✅ Login successful, JWT token obtained');
    
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
      const data = await response.json();
      console.log(`   📊 Found ${data.companies?.length || 0} companies`);
    } else {
      const errorText = await response.text();
      console.log(`   ❌ API call failed: ${response.status} - ${errorText}`);
    }
    
    // 4. Check credits AFTER the test
    console.log('\n💰 4. CHECKING CREDITS AFTER SINGLE TEST:');
    const creditsAfter = await pool.query(
      'SELECT credits FROM user_credits WHERE user_id = 2'
    );
    
    const afterSingleCredits = creditsAfter.rows[0].credits;
    const singleDifference = initialCredits - afterSingleCredits;
    
    console.log(`   💳 Credits after single test: ${afterSingleCredits}`);
    console.log(`   🔻 Difference: ${singleDifference} credit(s)`);
    
    // 5. Analyze single test result
    console.log('\n📊 5. SINGLE TEST ANALYSIS:');
    if (singleDifference === 1) {
      console.log('   ✅ ✅ ✅ SUCCESS! Exactly 1 credit was deducted');
      console.log('   🔒 Atomic deduction system is working correctly');
    } else if (singleDifference === 0) {
      console.log('   ⚠️  WARNING: No credits were deducted');
    } else {
      console.log(`   ❌ PROBLEM: ${singleDifference} credits were deducted instead of 1`);
    }
    
    // 6. Test duplicate protection by making rapid consecutive calls
    console.log('\n⚡ 6. TESTING DUPLICATE PROTECTION (rapid consecutive calls):');
    console.log('   Making 3 identical requests within 500ms...');
    
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
        const errorText = await result.text();
        console.log(`   Request ${i+1}: ❌ Error (${result.status}) - ${errorText.substring(0, 100)}`);
      }
    }
    
    // 7. Check final credits after rapid test
    console.log('\n💰 7. FINAL CREDITS CHECK:');
    const creditsRapidAfter = await pool.query(
      'SELECT credits FROM user_credits WHERE user_id = 2'
    );
    
    const rapidFinalCredits = creditsRapidAfter.rows[0].credits;
    const rapidDifference = afterSingleCredits - rapidFinalCredits;
    
    console.log(`   💳 Credits after rapid test: ${rapidFinalCredits}`);
    console.log(`   🔻 Additional credits deducted: ${rapidDifference}`);
    
    // 8. Final analysis
    console.log('\n🏆 8. FINAL ANALYSIS:');
    const totalUsed = initialCredits - rapidFinalCredits;
    console.log(`   📊 Total credits used in all tests: ${totalUsed}`);
    console.log(`   ✅ Total successful requests: ${1 + successCount}`); // +1 for first single test
    console.log(`   🚫 Duplicate requests blocked: ${duplicateCount}`);
    
    if (totalUsed <= (1 + successCount)) {
      console.log('   ✅ ✅ ✅ ATOMIC PROTECTION WORKING PERFECTLY!');
      console.log('   🔒 System successfully prevented double credit deductions');
    } else {
      console.log('   ❌ ATOMIC PROTECTION FAILED - Extra deductions occurred');
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log(`   Initial: ${initialCredits} → Final: ${rapidFinalCredits} (Used: ${totalUsed})`);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    pool.end();
  }
}

testLoginAndCredits();
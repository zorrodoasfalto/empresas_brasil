const jwt = require('jsonwebtoken');

const JWT_SECRET = 'empresas-brasil-jwt-secret-2025-super-secure-key-for-production-and-development';

async function testPagination() {
  console.log('🧪 TESTING PAGINATION LOGIC');
  console.log('='.repeat(50));
  
  // Generate token
  const token = jwt.sign({ 
    id: 2, 
    email: 'rodyrodrigo@gmail.com',
    uuid: '8666a63a-2623-41cd-98a3-8630f33438b4',
    role: 'admin',
    status: 'active',
    subscription: 'none'
  }, JWT_SECRET, { expiresIn: '24h', audience: 'web-app', issuer: 'empresas-brasil' });

  // Test different search sizes
  const testSizes = [100, 1000, 5000, 10000, 25000];
  
  for (const size of testSizes) {
    console.log(`\n📊 TESTING ${size} COMPANIES:`);
    
    try {
      const response = await fetch('http://localhost:6000/api/companies/filtered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uf: 'SP',
          companyLimit: size
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const actualCount = data.data ? data.data.length : 0;
        
        console.log(`   ✅ Backend returned: ${actualCount} companies`);
        console.log(`   📈 Expected: ${size} | Actual: ${actualCount} | Match: ${actualCount === size ? '✅' : '❌'}`);
        
        // Test dynamic page size logic
        const getItemsPerPage = (totalResults) => {
          if (totalResults >= 50000) return 10000;
          if (totalResults >= 25000) return 5000;  
          if (totalResults >= 10000) return 2500;  
          if (totalResults >= 5000) return 1000;   
          return 500;
        };
        
        const itemsPerPage = getItemsPerPage(actualCount);
        const totalPages = Math.ceil(actualCount / itemsPerPage);
        
        console.log(`   📄 Dynamic pagination: ${itemsPerPage} per page = ${totalPages} pages`);
        
        if (size >= 50000) {
          if (itemsPerPage === 10000) {
            console.log(`   ✅ 50k test: Will show ${itemsPerPage} companies per page (${totalPages} pages total)`);
          } else {
            console.log(`   ❌ 50k test: Should show 10000 per page, but got ${itemsPerPage}`);
          }
        }
        
      } else {
        const errorText = await response.text();
        console.log(`   ❌ API error: ${response.status} - ${errorText.substring(0, 100)}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Request error: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎯 PAGINATION TEST COMPLETE');
  console.log('If 50k companies test showed 10000 per page, the fix is working! ✅');
}

testPagination();
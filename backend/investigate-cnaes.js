const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function investigateCnaes() {
    try {
        console.log('🔍 INVESTIGATING CNAE DATA IN DATABASE...\n');
        
        // 1. Check what CNAEs exist for retail (starting with 47)
        console.log('📋 RETAIL CNAEs (47xxxx) in São Paulo with active status:');
        console.log('=' .repeat(60));
        
        const retailQuery = `
            SELECT cnae_fiscal, COUNT(*) as count
            FROM public.empresas_estabelecimentos 
            WHERE uf = $1 
            AND situacao_cadastral = $2 
            AND cnae_fiscal LIKE '47%'
            GROUP BY cnae_fiscal 
            ORDER BY count DESC 
            LIMIT 20
        `;
        
        const retailResult = await pool.query(retailQuery, ['SP', 2]);
        
        if (retailResult.rows.length > 0) {
            retailResult.rows.forEach(row => {
                console.log(`   ${row.cnae_fiscal}: ${row.count} empresas`);
            });
        } else {
            console.log('   ❌ No retail CNAEs (47xxxx) found in São Paulo');
        }
        
        // 2. Check the specific CNAEs we're trying to use
        console.log('\n🎯 CHECKING SPECIFIC CNAEs FROM SEGMENT 13:');
        console.log('=' .repeat(60));
        
        const specificCnaes = ["4781400","4782201","4789099","4754701","4744001"];
        
        for (const cnae of specificCnaes) {
            const checkQuery = `
                SELECT COUNT(*) as count
                FROM public.empresas_estabelecimentos 
                WHERE uf = $1 
                AND situacao_cadastral = $2 
                AND cnae_fiscal = $3
            `;
            
            const result = await pool.query(checkQuery, ['SP', 2, cnae]);
            const count = result.rows[0].count;
            
            console.log(`   ${cnae}: ${count} empresas`);
            
            // If count is 0, check if CNAE exists anywhere
            if (count === '0') {
                const anywhereQuery = `
                    SELECT COUNT(*) as count
                    FROM public.empresas_estabelecimentos 
                    WHERE cnae_fiscal = $1
                `;
                const anywhereResult = await pool.query(anywhereQuery, [cnae]);
                const totalCount = anywhereResult.rows[0].count;
                console.log(`     (Total in Brazil: ${totalCount})`);
            }
        }
        
        // 3. Check what CNAE format is used in the database
        console.log('\n📊 CNAE FORMAT ANALYSIS:');
        console.log('=' .repeat(60));
        
        const formatQuery = `
            SELECT cnae_fiscal, LENGTH(cnae_fiscal) as length
            FROM public.empresas_estabelecimentos 
            WHERE uf = 'SP' AND situacao_cadastral = 2
            LIMIT 10
        `;
        
        const formatResult = await pool.query(formatQuery);
        console.log('Sample CNAEs from database:');
        formatResult.rows.forEach(row => {
            console.log(`   ${row.cnae_fiscal} (length: ${row.length})`);
        });
        
        // 4. Find the most common CNAEs in São Paulo
        console.log('\n🏆 TOP 10 MOST COMMON CNAEs IN SÃO PAULO (ACTIVE):');
        console.log('=' .repeat(60));
        
        const topQuery = `
            SELECT cnae_fiscal, COUNT(*) as count
            FROM public.empresas_estabelecimentos 
            WHERE uf = $1 AND situacao_cadastral = $2
            GROUP BY cnae_fiscal 
            ORDER BY count DESC 
            LIMIT 10
        `;
        
        const topResult = await pool.query(topQuery, ['SP', 2]);
        topResult.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.cnae_fiscal}: ${row.count} empresas`);
        });
        
    } catch (error) {
        console.error('❌ Error investigating CNAEs:', error.message);
    } finally {
        await pool.end();
    }
}

investigateCnaes();
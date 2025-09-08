const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function investigateVictorUser() {
    try {
        console.log('🔍 INVESTIGATING VICTOR USER DATA...\n');
        
        // Check in both possible user tables
        const userTables = ['users', 'usuarios'];
        
        for (const table of userTables) {
            console.log(`📋 Checking table: ${table}`);
            console.log('='.repeat(50));
            
            try {
                // Check if Victor exists
                const checkQuery = `SELECT * FROM public.${table} WHERE email = $1`;
                const result = await pool.query(checkQuery, ['victormagalhaesg@gmail.com']);
                
                if (result.rows.length > 0) {
                    const user = result.rows[0];
                    console.log(`✅ Found Victor in ${table} table:`);
                    console.log(`   ID: ${user.id}`);
                    console.log(`   UUID: ${user.uuid}`);
                    console.log(`   Email: ${user.email}`);
                    console.log(`   Name: ${user.name}`);
                    console.log(`   Role: ${user.role}`);
                    console.log(`   Status: ${user.status}`);
                    console.log(`   Password hash: ${user.password ? (typeof user.password + ' - ' + user.password.substring(0, 20) + '...') : 'NULL'}`);
                    console.log(`   Created at: ${user.created_at}`);
                    console.log(`   Updated at: ${user.updated_at}`);
                    
                    // Check password hash validity
                    if (!user.password) {
                        console.log(`   ❌ PROBLEM: Password is NULL`);
                    } else if (typeof user.password !== 'string') {
                        console.log(`   ❌ PROBLEM: Password is not a string (type: ${typeof user.password})`);
                    } else if (!user.password.startsWith('$2b$') && !user.password.startsWith('$2a$')) {
                        console.log(`   ❌ PROBLEM: Password doesn't look like a bcrypt hash`);
                    } else {
                        console.log(`   ✅ Password hash looks valid`);
                    }
                } else {
                    console.log(`❌ Victor NOT found in ${table} table`);
                }
            } catch (error) {
                console.log(`❌ Error checking table ${table}: ${error.message}`);
            }
            
            console.log('');
        }
        
        // Check all users for comparison
        console.log('👥 ALL USERS COMPARISON:');
        console.log('='.repeat(50));
        
        for (const table of userTables) {
            try {
                const allUsersQuery = `SELECT id, email, name, role, status, password IS NOT NULL as has_password FROM public.${table} ORDER BY id`;
                const result = await pool.query(allUsersQuery);
                
                if (result.rows.length > 0) {
                    console.log(`\n📊 ${table} table (${result.rows.length} users):`);
                    result.rows.forEach(user => {
                        const status = user.has_password ? '✅' : '❌';
                        console.log(`   ${status} ID:${user.id} - ${user.email} (${user.role}) - ${user.status}`);
                    });
                } else {
                    console.log(`\n📊 ${table} table: No users found`);
                }
            } catch (error) {
                console.log(`\n❌ Error reading ${table}: ${error.message}`);
            }
        }
        
        // Show table schema for debugging
        console.log('\n📝 TABLE SCHEMA ANALYSIS:');
        console.log('='.repeat(50));
        
        for (const table of userTables) {
            try {
                const schemaQuery = `
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                    ORDER BY ordinal_position
                `;
                const result = await pool.query(schemaQuery, [table]);
                
                if (result.rows.length > 0) {
                    console.log(`\n🔧 ${table} schema:`);
                    result.rows.forEach(col => {
                        console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}) default: ${col.column_default || 'none'}`);
                    });
                } else {
                    console.log(`\n❌ Table ${table} not found`);
                }
            } catch (error) {
                console.log(`\n❌ Error getting schema for ${table}: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error investigating Victor user:', error.message);
    } finally {
        await pool.end();
    }
}

investigateVictorUser();
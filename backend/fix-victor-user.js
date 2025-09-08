const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixVictorUser() {
    try {
        console.log('🔧 FIXING VICTOR USER DATA...\n');
        
        const email = 'victormagalhaesg@gmail.com';
        const name = 'Victor Magalhães';
        const tempPassword = 'TempPass123!';
        
        // Hash the temporary password
        console.log('🔐 Generating password hash...');
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(tempPassword, saltRounds);
        console.log('✅ Password hash generated successfully');
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            console.log('🔍 Checking if Victor exists in user_profiles...');
            const existingUser = await client.query(`
                SELECT id, email, password_hash, name, is_active 
                FROM user_profiles 
                WHERE email = $1
            `, [email]);
            
            if (existingUser.rows.length > 0) {
                const user = existingUser.rows[0];
                console.log(`📋 Found existing user: ID=${user.id}, Active=${user.is_active}`);
                console.log(`📋 Current password hash: ${user.password_hash ? (typeof user.password_hash + ' - ' + String(user.password_hash).substring(0, 20) + '...') : 'NULL'}`);
                
                console.log('🔧 Updating existing user...');
                await client.query(`
                    UPDATE user_profiles 
                    SET password_hash = $1,
                        name = $2,
                        is_active = true,
                        email_verified = true,
                        failed_login_attempts = 0,
                        locked_until = NULL,
                        updated_at = NOW()
                    WHERE email = $3
                `, [passwordHash, name, email]);
                console.log('✅ Updated user_profiles table');
                
            } else {
                console.log('🆕 Creating new user in user_profiles...');
                await client.query(`
                    INSERT INTO user_profiles (email, password_hash, name, is_active, email_verified, created_at, updated_at)
                    VALUES ($1, $2, $3, true, true, NOW(), NOW())
                `, [email, passwordHash, name]);
                console.log('✅ Created user in user_profiles table');
            }
            
            // Also check/update users table (used for authentication)
            console.log('🔍 Checking if Victor exists in users table...');
            const existingMainUser = await client.query(`
                SELECT id, email, password_hash 
                FROM users 
                WHERE email = $1
            `, [email]);
            
            if (existingMainUser.rows.length > 0) {
                console.log('🔧 Updating users table...');
                await client.query(`
                    UPDATE users 
                    SET password_hash = $1,
                        updated_at = NOW()
                    WHERE email = $2
                `, [passwordHash, email]);
                console.log('✅ Updated users table');
            } else {
                console.log('🆕 Creating new user in users table...');
                await client.query(`
                    INSERT INTO users (email, password_hash, name, status, role, created_at, updated_at)
                    VALUES ($1, $2, $3, 'active', 'admin', NOW(), NOW())
                `, [email, passwordHash, name]);
                console.log('✅ Created user in users table');
            }
            
            await client.query('COMMIT');
            
            console.log('\n🎉 SUCCESS! Victor\'s user has been fixed:');
            console.log(`📧 Email: ${email}`);
            console.log(`👤 Name: ${name}`);
            console.log(`🔑 Temporary Password: ${tempPassword}`);
            console.log(`🛡️  Role: admin`);
            console.log(`✅ Status: active`);
            console.log(`\n💡 Victor can now reset his password using the normal reset flow!`);
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('❌ Error fixing Victor user:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await pool.end();
    }
}

fixVictorUser();
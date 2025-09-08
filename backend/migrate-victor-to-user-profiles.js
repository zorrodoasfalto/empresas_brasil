const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateVictorToUserProfiles() {
    try {
        console.log('🔄 MIGRATING VICTOR FROM simple_users TO user_profiles...\n');
        
        const email = 'victormagalhaesg@gmail.com';
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // 1. Get Victor's data from simple_users
            console.log('🔍 Getting Victor\'s data from simple_users...');
            const simpleUserResult = await client.query(`
                SELECT id, email, password_hash, name, created_at 
                FROM simple_users 
                WHERE email = $1
            `, [email]);
            
            if (simpleUserResult.rows.length === 0) {
                throw new Error('Victor not found in simple_users table');
            }
            
            const victorData = simpleUserResult.rows[0];
            console.log(`✅ Found Victor in simple_users: ID=${victorData.id}, Name=${victorData.name}`);
            
            // 2. Check if Victor already exists in user_profiles
            console.log('🔍 Checking if Victor exists in user_profiles...');
            const userProfilesResult = await client.query(`
                SELECT id, email, name 
                FROM user_profiles 
                WHERE email = $1
            `, [email]);
            
            if (userProfilesResult.rows.length > 0) {
                console.log(`⚠️  Victor already exists in user_profiles with ID=${userProfilesResult.rows[0].id}`);
                console.log('🔧 Updating existing user_profiles record...');
                
                // Update existing record
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
                `, [victorData.password_hash, victorData.name, email]);
                
                console.log('✅ Updated existing user_profiles record');
            } else {
                console.log('🆕 Creating new user_profiles record...');
                
                // Insert new record
                await client.query(`
                    INSERT INTO user_profiles (
                        email, password_hash, name, 
                        is_active, email_verified, 
                        created_at, updated_at
                    )
                    VALUES ($1, $2, $3, true, true, $4, NOW())
                `, [email, victorData.password_hash, victorData.name, victorData.created_at]);
                
                console.log('✅ Created new user_profiles record');
            }
            
            // 3. Verify the migration
            console.log('🔍 Verifying migration...');
            const verifyResult = await client.query(`
                SELECT id, email, name, is_active, email_verified, created_at
                FROM user_profiles 
                WHERE email = $1
            `, [email]);
            
            if (verifyResult.rows.length > 0) {
                const migratedUser = verifyResult.rows[0];
                console.log('✅ MIGRATION SUCCESSFUL!');
                console.log(`📋 Victor in user_profiles: ID=${migratedUser.id}, Name=${migratedUser.name}, Active=${migratedUser.is_active}`);
            } else {
                throw new Error('Migration verification failed - user not found in user_profiles');
            }
            
            await client.query('COMMIT');
            
            console.log('\\n🎉 SUCCESS! Victor has been migrated to user_profiles table');
            console.log(`📧 Email: ${email}`);
            console.log(`👤 Name: ${victorData.name}`);
            console.log(`✅ Status: active and email verified`);
            console.log('\\n💡 Victor can now use password reset functionality!');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('❌ Error migrating Victor to user_profiles:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await pool.end();
    }
}

migrateVictorToUserProfiles();
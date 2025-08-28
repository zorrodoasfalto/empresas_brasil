const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const CONNECTION_STRING = 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway';

class User {
  constructor() {
    this.pool = new Pool({
      connectionString: CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
      max: 5,
      min: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
    
    this.initDatabase();
  }

  async initDatabase() {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          trial_start_date TIMESTAMP DEFAULT NOW(),
          trial_expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days',
          subscription_active BOOLEAN DEFAULT FALSE,
          subscription_expires_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      // Create indexes
      await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
      
      // Add trial fields to existing users who don't have them - BOTH TABLES
      try {
        // Update users table
        await this.pool.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days',
          ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP NULL
        `);
        
        // Update simple_users table
        await this.pool.query(`
          ALTER TABLE simple_users 
          ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days',
          ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP NULL
        `);
        
        // Update existing users to have 30 day trial from their creation date
        await this.pool.query(`
          UPDATE users 
          SET 
            trial_start_date = COALESCE(trial_start_date, created_at),
            trial_expires_at = NOW() + INTERVAL '30 days'
        `);
        
        await this.pool.query(`
          UPDATE simple_users 
          SET 
            trial_start_date = COALESCE(trial_start_date, created_at),
            trial_expires_at = NOW() + INTERVAL '30 days'
        `);
        
        console.log('✅ Trial fields added/updated for existing users in BOTH tables');
      } catch (error) {
        console.log('ℹ️ Trial fields already exist or error adding them:', error.message);
      }
      
      console.log('✅ Users table initialized in PostgreSQL');
    } catch (error) {
      console.error('❌ Error initializing users table:', error.message);
    }
  }

  async create(email, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await this.pool.query(`
        INSERT INTO users (email, password)
        VALUES ($1, $2)
        RETURNING id, email, trial_start_date, trial_expires_at, subscription_active, created_at
      `, [email, hashedPassword]);
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email já está em uso');
      }
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const result = await this.pool.query(`
        SELECT id, email, password, trial_start_date, trial_expires_at, 
               subscription_active, subscription_expires_at, created_at
        FROM users
        WHERE email = $1
      `, [email]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async findById(id) {
    try {
      const result = await this.pool.query(`
        SELECT id, email, trial_start_date, trial_expires_at, 
               subscription_active, subscription_expires_at, created_at
        FROM users
        WHERE id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by id:', error);
      return null;
    }
  }

  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async updatePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const result = await this.pool.query(`
        UPDATE users 
        SET password = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, email
      `, [hashedPassword, id]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.pool.query(`
        DELETE FROM users
        WHERE id = $1
        RETURNING id, email
      `, [id]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const result = await this.pool.query(`
        SELECT id, email, created_at
        FROM users
        ORDER BY created_at DESC
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async checkUserAccess(userId) {
    try {
      // Check both tables for user
      let result = await this.pool.query(`
        SELECT id, email, trial_expires_at, subscription_active, subscription_expires_at
        FROM users
        WHERE id = $1
        UNION
        SELECT id, email, trial_expires_at, subscription_active, subscription_expires_at
        FROM simple_users
        WHERE id = $1
      `, [userId]);
      
      if (!result.rows[0]) {
        return { hasAccess: false, reason: 'user_not_found' };
      }

      const user = result.rows[0];
      const now = new Date();
      
      // Check if subscription is active and not expired
      if (user.subscription_active) {
        if (!user.subscription_expires_at || new Date(user.subscription_expires_at) > now) {
          return { hasAccess: true, reason: 'subscription_active', user };
        }
      }
      
      // Check if trial is still valid
      if (new Date(user.trial_expires_at) > now) {
        return { hasAccess: true, reason: 'trial_active', user };
      }
      
      // Access expired
      return { hasAccess: false, reason: 'trial_expired', user };
      
    } catch (error) {
      console.error('Error checking user access:', error);
      return { hasAccess: false, reason: 'error' };
    }
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = new User();
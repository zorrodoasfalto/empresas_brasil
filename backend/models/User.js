const { Pool } = require('../utils/sqlServerPool');
const bcrypt = require('bcryptjs');

class User {
  constructor() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        process.env.SQLSERVER_URL ||
        'sqlserver://sa:YourStrong!Passw0rd@localhost:1433/empresas_brasil?encrypt=false&trustServerCertificate=true'
    });

    this.initDatabase().catch((error) => {
      console.error('❌ Error initializing users table:', error.message);
    });
  }

  async initDatabase() {
    await this.pool.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'users')
      BEGIN
        CREATE TABLE users (
          id INT IDENTITY(1,1) PRIMARY KEY,
          email NVARCHAR(255) NOT NULL UNIQUE,
          password NVARCHAR(255) NOT NULL,
          trial_start_date DATETIME2 DEFAULT SYSDATETIME(),
          trial_expires_at DATETIME2 DEFAULT DATEADD(DAY, 7, SYSDATETIME()),
          subscription_active BIT DEFAULT 0,
          subscription_expires_at DATETIME2 NULL,
          created_at DATETIME2 DEFAULT SYSDATETIME(),
          updated_at DATETIME2 DEFAULT SYSDATETIME()
        );
      END
    `);

    await this.pool.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.indexes WHERE name = 'idx_users_email' AND object_id = OBJECT_ID('users')
      )
      BEGIN
        CREATE INDEX idx_users_email ON users(email);
      END
    `);

    await this.pool.query(`
      IF COL_LENGTH('users', 'trial_start_date') IS NULL
      BEGIN
        ALTER TABLE users ADD trial_start_date DATETIME2 DEFAULT SYSDATETIME();
      END
    `);

    await this.pool.query(`
      IF COL_LENGTH('users', 'trial_expires_at') IS NULL
      BEGIN
        ALTER TABLE users ADD trial_expires_at DATETIME2 DEFAULT DATEADD(DAY, 7, SYSDATETIME());
      END
    `);

    await this.pool.query(`
      IF COL_LENGTH('users', 'subscription_active') IS NULL
      BEGIN
        ALTER TABLE users ADD subscription_active BIT DEFAULT 0;
      END
    `);

    await this.pool.query(`
      IF COL_LENGTH('users', 'subscription_expires_at') IS NULL
      BEGIN
        ALTER TABLE users ADD subscription_expires_at DATETIME2 NULL;
      END
    `);

    await this.pool.query(`
      IF COL_LENGTH('simple_users', 'trial_start_date') IS NULL
      BEGIN
        ALTER TABLE simple_users ADD trial_start_date DATETIME2 DEFAULT SYSDATETIME();
      END
    `);

    await this.pool.query(`
      IF COL_LENGTH('simple_users', 'trial_expires_at') IS NULL
      BEGIN
        ALTER TABLE simple_users ADD trial_expires_at DATETIME2 DEFAULT DATEADD(DAY, 7, SYSDATETIME());
      END
    `);

    await this.pool.query(`
      IF COL_LENGTH('simple_users', 'subscription_active') IS NULL
      BEGIN
        ALTER TABLE simple_users ADD subscription_active BIT DEFAULT 0;
      END
    `);

    await this.pool.query(`
      IF COL_LENGTH('simple_users', 'subscription_expires_at') IS NULL
      BEGIN
        ALTER TABLE simple_users ADD subscription_expires_at DATETIME2 NULL;
      END
    `);

    await this.pool.query(`
      UPDATE users
      SET
        trial_start_date = SYSDATETIME(),
        trial_expires_at = DATEADD(DAY, 7, SYSDATETIME())
    `);

    await this.pool.query(`
      UPDATE simple_users
      SET
        trial_start_date = SYSDATETIME(),
        trial_expires_at = DATEADD(DAY, 7, SYSDATETIME())
    `);

    console.log('✅ Users table initialized in SQL Server');
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
        SET password = $1, updated_at = SYSDATETIME()
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
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

class AuthUser {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
    
    this.initDatabase();
  }

  async initDatabase() {
    try {
      // Usar a tabela permanente user_profiles (criada pelo setup-permanent-users.js)
      // Verificar se a tabela existe, se não existir, executar o setup automático
      const tableExists = await this.pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'user_profiles'
        )
      `);
      
      if (!tableExists.rows[0].exists) {
        console.log('⚠️  Tabela user_profiles não encontrada, executando setup automático...');
        const PermanentUserSetup = require('../setup-permanent-users');
        const setup = new PermanentUserSetup();
        await setup.setupPermanentDatabase();
        await setup.close();
      }
      
      // Criar tabela de tokens de reset se não existir
      await this.createPasswordResetTable();
      
      console.log('✅ Sistema de usuários permanentes ativo');
    } catch (error) {
      console.error('❌ Erro ao inicializar sistema de usuários:', error.message);
    }
  }

  async createPasswordResetTable() {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            token VARCHAR(64) NOT NULL UNIQUE,
            expires_at TIMESTAMP NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            ip_address INET,
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            used_at TIMESTAMP,
            
            -- Foreign key constraint
            CONSTRAINT fk_password_reset_user 
                FOREIGN KEY (user_id) 
                REFERENCES user_profiles(id) 
                ON DELETE CASCADE
        )
      `);

      // Create indexes
      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)
      `);
      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)
      `);
      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at)
      `);

      console.log('✅ Tabela password_reset_tokens inicializada');
    } catch (error) {
      console.error('❌ Erro ao criar tabela password_reset_tokens:', error.message);
    }
  }

  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  async createUser(email, password, name = null) {
    try {
      const passwordHash = await this.hashPassword(password);
      
      const result = await this.pool.query(`
        INSERT INTO user_profiles (email, password_hash, name, email_verified)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, name, is_active, email_verified, created_at
      `, [email.toLowerCase().trim(), passwordHash, name, true]);
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email já está em uso');
      }
      throw error;
    }
  }

  async findUserByEmail(email) {
    try {
      // Primeiro procurar na tabela user_profiles
      let result = await this.pool.query(`
        SELECT id, email, password_hash, name, is_active, email_verified, 
               failed_login_attempts, locked_until, last_login, created_at
        FROM user_profiles
        WHERE email = $1 AND is_active = true
      `, [email.toLowerCase().trim()]);
      
      if (result.rows[0]) {
        return result.rows[0];
      }
      
      // Se não encontrou, procurar na tabela users (para compatibilidade)
      result = await this.pool.query(`
        SELECT id, email, password_hash, email as name, 
               true as is_active, true as email_verified,
               0 as failed_login_attempts, null as locked_until, 
               null as last_login, created_at
        FROM users
        WHERE email = $1 AND status = 'active'
      `, [email.toLowerCase().trim()]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  async findUserById(id) {
    try {
      const result = await this.pool.query(`
        SELECT id, email, name, is_active, email_verified, last_login, created_at
        FROM user_profiles
        WHERE id = $1 AND is_active = true
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      return null;
    }
  }

  async authenticateUser(email, password) {
    try {
      const user = await this.findUserByEmail(email);
      
      if (!user) {
        return { success: false, message: 'Email ou senha incorretos' };
      }

      // Check if account is locked
      if (user.locked_until && new Date() < new Date(user.locked_until)) {
        return { success: false, message: 'Conta temporariamente bloqueada. Tente novamente mais tarde.' };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password_hash);
      
      if (!isValidPassword) {
        // Increment failed attempts
        await this.incrementFailedAttempts(user.id);
        return { success: false, message: 'Email ou senha incorretos' };
      }

      // Reset failed attempts and update last login
      await this.resetFailedAttempts(user.id);
      
      // Return user without password hash
      const { password_hash, ...userWithoutPassword } = user;
      return { 
        success: true, 
        user: userWithoutPassword 
      };
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  async incrementFailedAttempts(userId) {
    try {
      const result = await this.pool.query(`
        UPDATE user_profiles 
        SET failed_login_attempts = failed_login_attempts + 1,
            locked_until = CASE 
              WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
              ELSE locked_until 
            END,
            updated_at = NOW()
        WHERE id = $1
        RETURNING failed_login_attempts
      `, [userId]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao incrementar tentativas:', error);
    }
  }

  async resetFailedAttempts(userId) {
    try {
      await this.pool.query(`
        UPDATE user_profiles 
        SET failed_login_attempts = 0,
            locked_until = NULL,
            last_login = NOW(),
            updated_at = NOW()
        WHERE id = $1
      `, [userId]);
    } catch (error) {
      console.error('Erro ao resetar tentativas:', error);
    }
  }

  async getAllUsers() {
    try {
      const result = await this.pool.query(`
        SELECT id, email, name, is_active, email_verified, last_login, created_at, is_permanent
        FROM user_profiles
        WHERE is_active = true
        ORDER BY is_permanent DESC, created_at DESC
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return [];
    }
  }

  async deactivateUser(id) {
    try {
      const result = await this.pool.query(`
        UPDATE user_profiles 
        SET is_active = false, updated_at = NOW()
        WHERE id = $1 AND is_permanent = false
        RETURNING id, email
      `, [id]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      throw error;
    }
  }

  // 🔐 PASSWORD RESET METHODS

  generateSecurePassword(length = 12) {
    // Generate a secure, user-friendly password
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%&*';
    
    const all = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least one character from each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  async resetPasswordWithEmail(email, ipAddress = null, userAgent = null) {
    try {
      const user = await this.findUserByEmail(email);
      if (!user) {
        // Security: Don't reveal if email exists or not
        return { 
          success: true, 
          message: 'Se o email existir, você receberá uma nova senha em alguns minutos.' 
        };
      }

      // Generate new secure password
      const newPassword = this.generateSecurePassword();
      const passwordHash = await this.hashPassword(newPassword);

      // Start transaction
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');

        // Update password in BOTH tables to ensure login works
        await client.query(`
          UPDATE user_profiles 
          SET password_hash = $1, 
              failed_login_attempts = 0, 
              locked_until = NULL,
              updated_at = NOW()
          WHERE id = $2
        `, [passwordHash, user.id]);

        // Also update the main users table (needed for login authentication)
        await client.query(`
          UPDATE users 
          SET password_hash = $1,
              updated_at = NOW()
          WHERE email = $2
        `, [passwordHash, email]);

        // Log the password reset for security
        await client.query(`
          INSERT INTO password_reset_tokens (user_id, token, expires_at, ip_address, user_agent, used, used_at)
          VALUES ($1, $2, NOW() + INTERVAL '1 day', $3, $4, TRUE, NOW())
        `, [user.id, `AUTO_RESET_${Date.now()}`, ipAddress, userAgent]);

        await client.query('COMMIT');

        return {
          success: true,
          user: { id: user.id, email: user.email, name: user.name },
          newPassword, // Will be used to send email
          message: 'Nova senha gerada com sucesso. Enviando por email...'
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return { 
        success: false, 
        message: 'Erro interno do servidor. Tente novamente mais tarde.' 
      };
    }
  }

  async validateResetToken(token) {
    try {
      const result = await this.pool.query(`
        SELECT 
          prt.id, prt.user_id, prt.token, prt.expires_at, prt.used,
          up.email, up.name, up.is_active
        FROM password_reset_tokens prt
        JOIN user_profiles up ON prt.user_id = up.id
        WHERE prt.token = $1 AND prt.used = FALSE AND up.is_active = TRUE
      `, [token]);

      if (result.rows.length === 0) {
        return { 
          success: false, 
          message: 'Token inválido ou expirado.' 
        };
      }

      const tokenData = result.rows[0];
      
      // Check if token is expired
      if (new Date() > new Date(tokenData.expires_at)) {
        return { 
          success: false, 
          message: 'Token expirado. Solicite um novo link de recuperação.' 
        };
      }

      return {
        success: true,
        tokenData,
        user: {
          id: tokenData.user_id,
          email: tokenData.email,
          name: tokenData.name
        }
      };
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return { 
        success: false, 
        message: 'Erro interno do servidor.' 
      };
    }
  }

  async resetPassword(token, newPassword) {
    try {
      // First validate the token
      const validation = await this.validateResetToken(token);
      if (!validation.success) {
        return validation;
      }

      const { user } = validation;

      // Hash the new password
      const passwordHash = await this.hashPassword(newPassword);

      // Start transaction
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');

        // Update password
        await client.query(`
          UPDATE user_profiles 
          SET password_hash = $1, updated_at = NOW()
          WHERE id = $2
        `, [passwordHash, user.id]);

        // Mark token as used
        await client.query(`
          UPDATE password_reset_tokens 
          SET used = TRUE, used_at = NOW()
          WHERE token = $1
        `, [token]);

        // Reset any failed login attempts
        await client.query(`
          UPDATE user_profiles 
          SET failed_login_attempts = 0, locked_until = NULL
          WHERE id = $1
        `, [user.id]);

        await client.query('COMMIT');

        return {
          success: true,
          message: 'Senha alterada com sucesso. Você pode fazer login com a nova senha.'
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return { 
        success: false, 
        message: 'Erro interno do servidor. Tente novamente mais tarde.' 
      };
    }
  }

  async cleanupExpiredTokens() {
    try {
      const result = await this.pool.query(`
        DELETE FROM password_reset_tokens 
        WHERE expires_at < NOW() - INTERVAL '24 hours'
        RETURNING COUNT(*) as deleted_count
      `);
      
      const deletedCount = result.rows[0]?.deleted_count || 0;
      if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} expired reset tokens`);
      }
      
      return { success: true, deletedCount };
    } catch (error) {
      console.error('Erro ao limpar tokens expirados:', error);
      return { success: false, error: error.message };
    }
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = new AuthUser();
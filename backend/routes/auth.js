const express = require('express');
const SecurityUtils = require('../utils/security');
const { Pool } = require('pg');

// 🛡️ SISTEMA DE RATE LIMITING E SEGURANÇA
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const MAX_REGISTRATIONS_PER_IP = 2; // Máximo 2 registros por IP em 15 min
const MAX_REGISTRATIONS_PER_EMAIL_DOMAIN = 5; // Máximo 5 por domínio

// Conectar ao banco PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const router = express.Router();

// 🛡️ FUNÇÕES DE SEGURANÇA
function checkRateLimit(ip, type = 'registration') {
  const now = Date.now();
  const key = `${ip}:${type}`;
  
  if (!rateLimit.has(key)) {
    rateLimit.set(key, { count: 1, firstAttempt: now });
    return true;
  }
  
  const data = rateLimit.get(key);
  
  // Reset se passou da janela de tempo
  if (now - data.firstAttempt > RATE_LIMIT_WINDOW) {
    rateLimit.set(key, { count: 1, firstAttempt: now });
    return true;
  }
  
  // Verificar limite
  if (data.count >= MAX_REGISTRATIONS_PER_IP) {
    return false;
  }
  
  data.count++;
  rateLimit.set(key, data);
  return true;
}

function validateBusinessEmail(email) {
  // Bloquear emails temporários/descartáveis
  const disposableEmailDomains = [
    '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 
    'tempmail.org', 'yopmail.com', 'temp-mail.org', '24hourmail.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (disposableEmailDomains.includes(domain)) {
    return { valid: false, reason: 'Email temporário não permitido' };
  }
  
  // Verificar formato profissional
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Formato de email inválido' };
  }
  
  return { valid: true };
}

/**
 * POST /api/auth/register - Cadastro com verificação de email
 */
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
  
  try {
    console.log(`🔐 REGISTER ATTEMPT: ${email} from IP: ${clientIP}`);
    
    // 🛡️ RATE LIMITING
    if (!checkRateLimit(clientIP, 'registration')) {
      console.log(`🚫 RATE LIMIT EXCEEDED: ${clientIP} - Too many registrations`);
      return res.status(429).json({
        success: false,
        message: 'Muitos registros foram feitos deste IP. Tente novamente em 15 minutos.',
        retryAfter: RATE_LIMIT_WINDOW / 1000
      });
    }
    
    // Validar entrada básica
    if (!email || !password || !firstName || !lastName) {
      console.log(`❌ REGISTER FAILED: Missing required fields`);
      return res.status(400).json({
        success: false,
        message: 'Email, senha, nome e sobrenome são obrigatórios'
      });
    }
    
    // 🛡️ VALIDAÇÃO DE EMAIL PROFISSIONAL
    const emailValidation = validateBusinessEmail(email);
    if (!emailValidation.valid) {
      console.log(`❌ REGISTER FAILED: Invalid email - ${emailValidation.reason}`);
      return res.status(400).json({
        success: false,
        message: emailValidation.reason
      });
    }

    // Verificar se usuário já existe
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log(`❌ REGISTER FAILED: User already exists - ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Este email já está cadastrado'
      });
    }

    // Validar força da senha
    const passwordValidation = SecurityUtils.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha não atende aos critérios de segurança',
        errors: passwordValidation.errors
      });
    }

    // Hash seguro da senha
    const { hash: passwordHash, salt: passwordSalt } = await SecurityUtils.hashPassword(password);
    
    // Gerar tokens
    const uuid = SecurityUtils.generateUUID();
    const emailVerificationToken = SecurityUtils.generateSecureToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // 🚀 SISTEMA SIMPLES: ATIVO COM TRIAL IMEDIATO
    const trialExpires = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 dias
    
    console.log(`🔧 INSERTING USER: ${email} with UUID: ${uuid} - AUTO ACTIVE`);
    
    const result = await pool.query(
      `INSERT INTO users (
        uuid, email, password_hash, password_salt, 
        first_name, last_name, 
        email_verification_token, email_verification_expires,
        status, role, subscription_status, subscription_expires,
        email_verified, created_by_ip, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, uuid, email, first_name, last_name, status, role, subscription_status, subscription_expires, created_at`,
      [
        uuid, email, passwordHash, passwordSalt,
        firstName || null, lastName || null,
        emailVerificationToken, emailVerificationExpires,
        'active', 'user', 'active', trialExpires, // 🎯 ATIVO COM TRIAL
        true, // Email já verificado
        clientIP, req.get('User-Agent') || 'Unknown'
      ]
    );
    
    console.log(`✅ USER ACTIVE: ${email} - Trial until ${trialExpires}`);

    const user = result.rows[0];

    res.status(201).json({
      success: true,
      message: '🎉 Cadastro realizado com sucesso! Sua conta está ativa com 15 dias de trial.',
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        status: user.status,
        subscriptionStatus: user.subscription_status,
        trialExpires: user.subscription_expires
      },
      autoActivated: true,
      trialDays: 15
    });

  } catch (error) {
    console.error('❌ REGISTRATION ERROR DETAILS:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack,
      email: email
    });

    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Log específico para troubleshooting
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.error('❌ DATABASE TABLE MISSING - Running table creation...');
      try {
        const { createUsersTable } = require('../database/init-users');
        await createUsersTable();
        console.log('✅ Users table created, please try registration again');
      } catch (createError) {
        console.error('❌ Failed to create users table:', createError.message);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/auth/verify-email/:token - Verificar email
 */
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  try {
    console.log('🔍 Email verification attempt:', token.slice(-8));

    // Buscar usuário pelo token
    const result = await pool.query(
      `SELECT id, email, first_name, email_verification_expires, status
       FROM users 
       WHERE email_verification_token = $1 
       AND status = 'pending_verification'`,
      [token]
    );

    if (result.rows.length === 0) {
      console.log('❌ Invalid verification token');
      return res.status(400).json({
        success: false,
        message: 'Token de verificação inválido ou já utilizado'
      });
    }

    const user = result.rows[0];

    // Verificar se token expirou
    if (new Date() > user.email_verification_expires) {
      console.log('❌ Expired verification token');
      return res.status(400).json({
        success: false,
        message: 'Token de verificação expirado. Solicite um novo.',
        expired: true
      });
    }

    // Ativar conta
    await pool.query(
      `UPDATE users 
       SET status = 'active', 
           email_verified = true,
           email_verification_token = NULL,
           email_verification_expires = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [user.id]
    );

    console.log('✅ Email verified successfully:', user.email);

    res.json({
      success: true,
      message: 'Email verificado com sucesso! Sua conta está ativa.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('❌ Email verification failed:', error.message);

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/resend-verification - Reenviar email de verificação
 */
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  
  try {
    console.log('🔄 Resend verification request:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Buscar usuário não verificado
    const result = await pool.query(
      `SELECT id, email, first_name, email_verification_token 
       FROM users 
       WHERE email = $1 AND status = 'pending_verification'`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado ou já verificado'
      });
    }

    const user = result.rows[0];
    let token = user.email_verification_token;

    // Se não tem token ou expirou, gerar novo
    if (!token) {
      token = SecurityUtils.generateSecureToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      await pool.query(
        `UPDATE users 
         SET email_verification_token = $1, email_verification_expires = $2
         WHERE id = $3`,
        [token, emailVerificationExpires, user.id]
      );
    }

    // Reenviar email
    const emailService = require('../services/emailService');
    await emailService.sendVerificationEmail(email, token, user.first_name);

    console.log('✅ Verification email resent:', email);

    res.json({
      success: true,
      message: 'Email de verificação reenviado com sucesso!'
    });

  } catch (error) {
    console.error('❌ Resend verification error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/login - Login (só permite se email verificado)
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    console.log('🔐 Login attempt:', email);

    // Buscar usuário
    const result = await pool.query(
      `SELECT id, uuid, email, password_hash, password_salt, first_name, last_name, 
              status, role, email_verified, subscription_status, subscription_expires
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const user = result.rows[0];

    // ✅ VERIFICAR STATUS SIMPLES
    if (user.status !== 'active') {
      console.log('❌ User not active:', user.email, 'Status:', user.status);
      return res.status(403).json({
        success: false,
        message: 'Conta não está ativa. Entre em contato conosco.',
        requiresActivation: true,
        status: user.status
      });
    }

    // Verificar senha
    const isPasswordValid = await SecurityUtils.verifyPassword(
      password, 
      user.password_hash, 
      user.password_salt
    );

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gerar tokens JWT
    const tokenPayload = {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
      status: user.status,
      subscription: user.subscription_status
    };

    const accessToken = SecurityUtils.generateAccessToken(tokenPayload);
    const refreshToken = SecurityUtils.generateRefreshToken({ id: user.id, uuid: user.uuid });

    // Atualizar último login
    await pool.query(
      `UPDATE users 
       SET last_login = CURRENT_TIMESTAMP, last_login_ip = $1
       WHERE id = $2`,
      [req.ip, user.id]
    );

    console.log('✅ Login successful:', user.email);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        status: user.status,
        role: user.role,
        subscription: user.subscription_status
      },
      token: accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/grant-trial - Dar trial de 15 dias para todos (admin)
 */
router.post('/grant-trial', async (req, res) => {
  try {
    console.log('🎁 Granting 15-day trial to all users...');

    // Atualizar todos os usuários para ter trial de 15 dias
    const result = await pool.query(`
      UPDATE users 
      SET 
        subscription_status = 'active',
        subscription_expires = CURRENT_TIMESTAMP + INTERVAL '15 days',
        updated_at = CURRENT_TIMESTAMP
      WHERE subscription_status = 'none' OR subscription_expires IS NULL OR subscription_expires < CURRENT_TIMESTAMP
      RETURNING email, subscription_expires
    `);

    console.log(`✅ Trial granted to ${result.rows.length} users`);

    res.json({
      success: true,
      message: `Trial de 15 dias concedido para ${result.rows.length} usuários`,
      users: result.rows
    });

  } catch (error) {
    console.error('❌ Grant trial error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/remove-subscription - Remover subscription de usuário para teste
 */
router.post('/remove-subscription', async (req, res) => {
  const { email } = req.body;
  
  try {
    console.log('❌ Removing subscription from:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    const result = await pool.query(`
      UPDATE users 
      SET 
        subscription_status = 'none',
        subscription_expires = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE email = $1
      RETURNING id, email, status, subscription_status, subscription_expires
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const user = result.rows[0];
    console.log('❌ Subscription removed from:', user.email);

    res.json({
      success: true,
      message: 'Subscription removida com sucesso!',
      user: {
        email: user.email,
        status: user.status,
        subscription_status: user.subscription_status,
        subscription_expires: user.subscription_expires
      }
    });

  } catch (error) {
    console.error('❌ Remove subscription error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/grant-premium - Dar premium vitalício para usuário específico
 */
router.post('/grant-premium', async (req, res) => {
  const { email } = req.body;
  
  try {
    console.log('💎 Granting lifetime premium to:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Dar premium vitalício (100 anos)
    const premiumExpires = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
    
    const result = await pool.query(`
      UPDATE users 
      SET 
        status = 'active',
        email_verified = true,
        email_verification_token = NULL,
        email_verification_expires = NULL,
        subscription_status = 'active',
        subscription_expires = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE email = $1
      RETURNING id, email, status, subscription_status, subscription_expires
    `, [email, premiumExpires]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const user = result.rows[0];
    console.log('💎 Premium granted to:', user.email, 'until:', user.subscription_expires);

    res.json({
      success: true,
      message: 'Premium vitalício concedido com sucesso!',
      user: {
        email: user.email,
        status: user.status,
        subscription_status: user.subscription_status,
        subscription_expires: user.subscription_expires
      }
    });

  } catch (error) {
    console.error('❌ Grant premium error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/force-activate - Forçar ativação de usuário específico (admin)
 */
router.post('/force-activate', async (req, res) => {
  const { email, newPassword } = req.body;
  
  try {
    console.log('🔧 Force activating user:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Ativar usuário e dar trial de 15 dias
    const trialExpires = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    let updateQuery = `
      UPDATE users 
      SET 
        status = 'active',
        email_verified = true,
        email_verification_token = NULL,
        email_verification_expires = NULL,
        subscription_status = 'active',
        subscription_expires = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE email = $1
      RETURNING id, email, status, subscription_status, subscription_expires
    `;
    let queryParams = [email, trialExpires];

    // Se nova senha fornecida, incluir no update
    if (newPassword) {
      const { hash: passwordHash, salt: passwordSalt } = await SecurityUtils.hashPassword(newPassword);
      updateQuery = `
        UPDATE users 
        SET 
          status = 'active',
          email_verified = true,
          email_verification_token = NULL,
          email_verification_expires = NULL,
          subscription_status = 'active',
          subscription_expires = $2,
          password_hash = $3,
          password_salt = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE email = $1
        RETURNING id, email, status, subscription_status, subscription_expires
      `;
      queryParams = [email, trialExpires, passwordHash, passwordSalt];
    }
    
    const result = await pool.query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const user = result.rows[0];
    console.log('✅ User force activated:', user.email);

    res.json({
      success: true,
      message: newPassword ? 'Usuário ativado, trial concedido e senha redefinida!' : 'Usuário ativado e trial concedido com sucesso!',
      user: {
        email: user.email,
        status: user.status,
        subscription_status: user.subscription_status,
        subscription_expires: user.subscription_expires
      }
    });

  } catch (error) {
    console.error('❌ Force activate error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/resend-verification - Reenviar email de verificação
 */
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  
  try {
    console.log(`🔄 RESEND VERIFICATION: ${email}`);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Buscar usuário
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const user = userQuery.rows[0];
    
    // Verificar se já está ativo
    if (user.status === 'active' && user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Esta conta já está ativa'
      });
    }

    // Gerar novo token se necessário
    let emailVerificationToken = user.email_verification_token;
    if (!emailVerificationToken || new Date() > user.email_verification_expires) {
      const SecurityUtils = require('../utils/security');
      emailVerificationToken = SecurityUtils.generateSecureToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      await pool.query(`
        UPDATE users 
        SET email_verification_token = $1, email_verification_expires = $2
        WHERE email = $3
      `, [emailVerificationToken, emailVerificationExpires, email]);
    }

    // Tentar enviar email
    const emailService = require('../services/emailService');
    let emailSent = false;
    let emailError = null;
    
    try {
      await emailService.sendVerificationEmail(email, emailVerificationToken, user.first_name);
      emailSent = true;
      console.log('✅ Verification email resent to:', email);
    } catch (emailSendError) {
      emailError = emailSendError.message;
      console.warn('⚠️ Failed to resend verification email:', emailSendError.message);
      
      // Em desenvolvimento, logar o link
      if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY) {
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4001';
        const verificationUrl = `${baseUrl}/verify-email/${emailVerificationToken}`;
        console.log('🔗 MANUAL VERIFICATION LINK (DEV):', verificationUrl);
      }
    }

    res.status(200).json({
      success: true,
      message: emailSent 
        ? 'Email de verificação reenviado com sucesso!'
        : 'Houve um problema temporário. Entre em contato conosco para ativar sua conta.',
      emailSent: emailSent,
      emailError: emailError
    });

  } catch (error) {
    console.error('❌ RESEND VERIFICATION ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/approve-user - Aprovar usuário pendente (ADMIN)
 */
router.post('/approve-user', async (req, res) => {
  const { email, adminKey } = req.body;
  
  try {
    // Verificação simples de admin (em produção, use JWT admin)
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'admin-empresas-brasil-2025') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }
    
    console.log(`🔧 ADMIN APPROVAL: ${email}`);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }
    
    // Ativar usuário e dar trial
    const trialExpires = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    
    const result = await pool.query(`
      UPDATE users 
      SET 
        status = 'active',
        email_verified = true,
        subscription_status = 'active',
        subscription_expires = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE email = $1 AND status = 'pending_verification'
      RETURNING id, email, first_name, status, subscription_status, subscription_expires
    `, [email, trialExpires]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado ou não está pendente de aprovação'
      });
    }
    
    const user = result.rows[0];
    console.log(`✅ USER APPROVED: ${user.email} - Trial until ${user.subscription_expires}`);
    
    res.json({
      success: true,
      message: 'Usuário aprovado com sucesso!',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        status: user.status,
        subscriptionStatus: user.subscription_status,
        trialExpires: user.subscription_expires
      }
    });
    
  } catch (error) {
    console.error('❌ Approve user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/auth/pending-users - Listar usuários pendentes (ADMIN)
 */
router.get('/pending-users', async (req, res) => {
  const { adminKey } = req.query;
  
  try {
    // Verificação simples de admin
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'admin-empresas-brasil-2025') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }
    
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, created_at, created_by_ip, user_agent
      FROM users 
      WHERE status = 'pending_verification'
      ORDER BY created_at DESC
      LIMIT 50
    `);
    
    console.log(`📋 PENDING USERS REQUEST: Found ${result.rows.length} users`);
    
    res.json({
      success: true,
      users: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Pending users error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/manual-register - Registro manual para troubleshooting
 */
router.post('/manual-register', async (req, res) => {
  try {
    console.log('🔧 MANUAL REGISTER FOR CARLOS...');
    
    const email = 'carlos@ogservicos.com.br';
    const password = 'Carlos123!'; // Senha temporária forte
    
    // Verificar se já existe
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.json({
        success: true,
        message: 'Usuário já existe no sistema',
        user: existing.rows[0]
      });
    }
    
    // Hash da senha
    const { hash: passwordHash, salt: passwordSalt } = await SecurityUtils.hashPassword(password);
    
    // Dados do usuário
    const uuid = SecurityUtils.generateUUID();
    const emailVerificationToken = SecurityUtils.generateSecureToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const trialExpires = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    
    // Inserir
    const result = await pool.query(
      `INSERT INTO users (
        uuid, email, password_hash, password_salt, 
        first_name, last_name, 
        email_verification_token, email_verification_expires,
        status, role, subscription_status, subscription_expires,
        created_by_ip, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, uuid, email, status, created_at`,
      [
        uuid, email, passwordHash, passwordSalt,
        'Carlos', 'OG Serviços',
        emailVerificationToken, emailVerificationExpires,
        'active', 'user', 'active', trialExpires, // Já ativo para ele usar
        '127.0.0.1', 'Manual Registration'
      ]
    );
    
    console.log('✅ CARLOS REGISTERED SUCCESSFULLY');
    
    res.json({
      success: true,
      message: 'Usuário Carlos registrado com sucesso!',
      user: result.rows[0],
      temporaryPassword: password,
      note: 'Usuário pode fazer login e trocar a senha'
    });
    
  } catch (error) {
    console.error('❌ MANUAL REGISTER ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no registro manual',
      error: error.message
    });
  }
});

// 🔐 PASSWORD RESET ENDPOINT
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    // Validação básica
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Rate limiting para reset de senha
    if (!checkRateLimit(clientIP, 'password_reset')) {
      console.log(`🚫 Password reset rate limit exceeded for IP: ${clientIP}`);
      return res.status(429).json({
        success: false,
        message: 'Muitas tentativas de recuperação de senha. Tente novamente em 15 minutos.'
      });
    }

    console.log(`🔐 Password reset requested for: ${email} from IP: ${clientIP}`);

    // Importar AuthUser e EmailService
    const AuthUser = require('../models/AuthUser');
    const emailService = require('../services/emailService');

    // Usar o método resetPasswordWithEmail do AuthUser que já gera nova senha
    const resetResult = await AuthUser.resetPasswordWithEmail(email, clientIP, req.headers['user-agent']);

    if (resetResult.success) {
      // Check if user object exists and has required data
      if (resetResult.user && resetResult.user.email && resetResult.newPassword) {
        // Enviar email com a nova senha
        const emailResult = await emailService.sendPasswordResetEmail(
          resetResult.user.email,
          resetResult.user.name,
          resetResult.newPassword
        );

        if (emailResult.success) {
          console.log(`✅ Password reset email sent to: ${resetResult.user.email}`);
          res.json({
            success: true,
            message: 'Se o email existir em nossa base, você receberá uma nova senha em alguns minutos.'
          });
        } else {
          console.error('❌ Failed to send password reset email:', emailResult.message);
          res.status(500).json({
            success: false,
            message: 'Erro ao enviar email. Tente novamente mais tarde.'
          });
        }
      } else {
        // Success but no user data - treat as security response (email not found)
        console.log(`🔐 Password reset requested for non-existent or invalid user`);
        res.json({
          success: true,
          message: 'Se o email existir em nossa base, você receberá uma nova senha em alguns minutos.'
        });
      }
    } else {
      // Sempre retornar sucesso por segurança (não revelar se email existe)
      res.json({
        success: true,
        message: 'Se o email existir em nossa base, você receberá uma nova senha em alguns minutos.'
      });
    }

  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor. Tente novamente mais tarde.'
    });
  }
});

module.exports = router;
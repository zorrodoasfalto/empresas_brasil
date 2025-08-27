const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { ApifyClient } = require('apify-client');
require('dotenv').config();

// Function to clean nome_fantasia field - remove addresses that appear incorrectly
function cleanNomeFantasia(nomeFantasia) {
  if (!nomeFantasia || nomeFantasia.trim() === '') {
    return null;
  }
  
  const nome = nomeFantasia.trim();
  
  // Check if it looks like an address (contains common address patterns)
  const addressPatterns = [
    /^(RUA|AVENIDA|ALAMEDA|ESTRADA|RODOVIA|TRAVESSA|QUADRA|LOTE)/i,
    /\bN\d+\b/, // N123 (number pattern)
    /\b\d+\s*(KM|QUILOMETRO)/i,
    /\bCEP\s*\d/i,
    /\b\d{5}-?\d{3}\b/, // CEP pattern
    /\bSALA\s*\d+/i,
    /\bANDAR\s*\d+/i,
    /\bBLOCO\s*[A-Z]/i
  ];
  
  // If it matches address patterns, return null
  if (addressPatterns.some(pattern => pattern.test(nome))) {
    return null;
  }
  
  // If it's too long (likely an address), return null
  if (nome.length > 100) {
    return null;
  }
  
  return nome;
}

const app = express();
const PORT = process.env.PORT || 6000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-for-development';

// Smart fallback function to find the correct user_id
async function getSmartUserId(decodedToken, providedUserId = null) {
  if (providedUserId) {
    return providedUserId; // Use provided userId if valid token
  }
  
  try {
    // Try to find user by email from token
    if (decodedToken && decodedToken.email) {
      const userResult = await pool.query(
        'SELECT id FROM users WHERE email = $1 UNION SELECT id FROM simple_users WHERE email = $1',
        [decodedToken.email]
      );
      
      if (userResult.rows.length > 0) {
        console.log(`Smart fallback: Found user_id ${userResult.rows[0].id} for email ${decodedToken.email}`);
        return userResult.rows[0].id;
      }
    }
    
    // If no email match, try to find the most active user with leads
    const activeUserResult = await pool.query(`
      SELECT user_id, COUNT(*) as lead_count 
      FROM leads 
      GROUP BY user_id 
      ORDER BY lead_count DESC, user_id ASC 
      LIMIT 1
    `);
    
    if (activeUserResult.rows.length > 0) {
      const foundUserId = activeUserResult.rows[0].user_id;
      console.log(`Smart fallback: Using most active user_id ${foundUserId} (${activeUserResult.rows[0].lead_count} leads)`);
      return foundUserId;
    }
    
    // Final fallback
    console.log('Smart fallback: No users found, using user_id 1');
    return 1;
  } catch (error) {
    console.error('Smart fallback error:', error);
    return 1;
  }
}

// Apify configuration - API key loaded from environment variables only
const APIFY_API_KEY = process.env.APIFY_API_KEY;
const APIFY_BASE_URL = 'https://api.apify.com/v2';

// Ghost Genius configuration (for LinkedIn only)
const GHOST_GENIUS_API_KEY = 'gg_5x4HI1X8sf3YyUsAMnR8UpfAX4pZtX';
const GHOST_GENIUS_BASE_URL = 'https://api.ghostgenius.fr/v1';

// Initialize Apify client only if API key exists
let apifyClient = null;
if (APIFY_API_KEY) {
  try {
    apifyClient = new ApifyClient({
      token: APIFY_API_KEY
    });
    console.log('✅ Apify client initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Apify client:', error.message);
  }
} else {
  console.warn('⚠️ APIFY_API_KEY not configured - Apify features disabled');
}

console.log('✅ Ghost Genius API configured for LinkedIn');

// Import routes
// const stripeRoutes = require('./stripe-routes'); // ARQUIVO DELETADO
const authRoutes = require('./routes/auth');

// Import database initialization
const { createUsersTable } = require('./database/init-users');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://your-frontend.railway.app',
        'https://*.railway.app'
      ]
    : ['http://localhost:4001', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// JWT Authentication Middleware (strict)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token de acesso requerido' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token inválido' });
  }
};

// Flexible Authentication Middleware - tries to authenticate but continues without token
const flexibleAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      console.log('🔐 Authenticated user:', decoded.email, 'ID:', decoded.id);
    } catch (error) {
      console.log('🔐 Invalid token, continuing without auth');
      req.user = null;
    }
  } else {
    console.log('🔐 No token provided, continuing without auth');
    req.user = null;
  }
  next();
};

// Use routes
// app.use('/api/stripe', stripeRoutes); // ARQUIVO DELETADO  
// app.use('/api/auth', authRoutes); // TEMPORARIAMENTE DESABILITADO - USANDO ENDPOINTS DIRETOS

// DEBUG: Check if user ID 1 exists and generate token
app.get('/api/debug/check-user', async (req, res) => {
  try {
    // Check users table
    const userResult = await pool.query('SELECT id, email FROM users WHERE id = 1');
    
    // Check simple_users table  
    const simpleUserResult = await pool.query('SELECT id, email FROM simple_users WHERE id = 1');
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({
        success: true,
        user,
        token,
        table: 'users'
      });
    }
    
    if (simpleUserResult.rows.length > 0) {
      const user = simpleUserResult.rows[0];
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({
        success: true,
        user,
        token,
        table: 'simple_users'
      });
    }
    
    res.json({
      success: false,
      message: 'No user with ID 1 found',
      users_count: userResult.rows.length,
      simple_users_count: simpleUserResult.rows.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint temporário para verificar tabelas
app.get('/api/check-tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    res.json({
      success: true,
      tables: result.rows.map(row => row.table_name)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug endpoint to check filter data
app.get('/api/debug-filters', async (req, res) => {
  try {
    let results = {};
    
    // Check motivo table
    try {
      const motivoResult = await pool.query('SELECT COUNT(*) as count FROM motivo');
      const motivoSample = await pool.query('SELECT codigo, descricao FROM motivo LIMIT 5');
      results.motivo = {
        count: motivoResult.rows[0].count,
        sample: motivoSample.rows
      };
    } catch (error) {
      results.motivo = { error: error.message };
    }
    
    // Check qualificacao_socio table
    try {
      const qualResult = await pool.query('SELECT COUNT(*) as count FROM qualificacao_socio');
      const qualSample = await pool.query('SELECT codigo, descricao FROM qualificacao_socio LIMIT 5');
      results.qualificacao_socio = {
        count: qualResult.rows[0].count,
        sample: qualSample.rows
      };
    } catch (error) {
      results.qualificacao_socio = { error: error.message };
    }
    
    // Check natureza_juridica table
    try {
      const natResult = await pool.query('SELECT COUNT(*) as count FROM natureza_juridica');
      const natSample = await pool.query('SELECT codigo, descricao FROM natureza_juridica LIMIT 5');
      results.natureza_juridica = {
        count: natResult.rows[0].count,
        sample: natSample.rows
      };
    } catch (error) {
      results.natureza_juridica = { error: error.message };
    }
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

async function initDB() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS simple_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // CRM Tables
    
    // Leads table - stores all saved leads
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES simple_users(id) ON DELETE CASCADE,
        nome VARCHAR(500) NOT NULL,
        empresa VARCHAR(500),
        telefone VARCHAR(50),
        email VARCHAR(255),
        endereco TEXT,
        cnpj VARCHAR(20),
        website VARCHAR(500),
        categoria VARCHAR(255),
        rating DECIMAL(3,2),
        reviews_count INTEGER,
        fonte VARCHAR(100) NOT NULL, -- '66M', 'Google Maps', 'LinkedIn', etc
        dados_originais JSONB, -- stores original data from source
        notas TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Funil phases table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS funil_fases (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES simple_users(id) ON DELETE CASCADE,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        ordem INTEGER NOT NULL DEFAULT 1,
        cor VARCHAR(7) DEFAULT '#3B82F6', -- hex color
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Lead pipeline tracking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads_funil (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
        fase_id INTEGER REFERENCES funil_fases(id) ON DELETE CASCADE,
        data_entrada TIMESTAMP DEFAULT NOW(),
        notas TEXT,
        UNIQUE(lead_id) -- lead can only be in one phase at a time
      )
    `);

    // Insert default funnel phases for new users
    await pool.query(`
      INSERT INTO funil_fases (user_id, nome, descricao, ordem, cor)
      SELECT DISTINCT u.id, 'Novo Lead', 'Leads recém adicionados', 1, '#10B981'
      FROM simple_users u 
      LEFT JOIN funil_fases f ON f.user_id = u.id 
      WHERE f.id IS NULL
    `);

    await pool.query(`
      INSERT INTO funil_fases (user_id, nome, descricao, ordem, cor)
      SELECT DISTINCT u.id, 'Qualificado', 'Leads qualificados para contato', 2, '#3B82F6'
      FROM simple_users u 
      LEFT JOIN funil_fases f ON f.user_id = u.id AND f.nome = 'Qualificado'
      WHERE f.id IS NULL
    `);

    await pool.query(`
      INSERT INTO funil_fases (user_id, nome, descricao, ordem, cor)
      SELECT DISTINCT u.id, 'Proposta', 'Proposta enviada', 3, '#F59E0B'
      FROM simple_users u 
      LEFT JOIN funil_fases f ON f.user_id = u.id AND f.nome = 'Proposta'
      WHERE f.id IS NULL
    `);

    await pool.query(`
      INSERT INTO funil_fases (user_id, nome, descricao, ordem, cor)
      SELECT DISTINCT u.id, 'Fechado', 'Negócio conquistado', 4, '#059669'
      FROM simple_users u 
      LEFT JOIN funil_fases f ON f.user_id = u.id AND f.nome = 'Fechado'
      WHERE f.id IS NULL
    `);

    console.log('✅ Database initialized with CRM tables');
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT id, email, password, name FROM simple_users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Usuário não encontrado' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.json({ success: false, message: 'Senha incorreta' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Registration endpoint (requires name)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome, sobrenome, email e senha são obrigatórios' 
      });
    }
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM simple_users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuário já existe com este email' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const fullName = `${firstName} ${lastName}`;
    const result = await pool.query(`
      INSERT INTO simple_users (name, email, password, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, name, email, created_at
    `, [fullName, email, hashedPassword]);
    
    const user = result.rows[0];
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Usuário criado com sucesso',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Change password endpoint
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token de acesso requerido' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const userResult = await pool.query('SELECT * FROM simple_users WHERE id = $1', [decoded.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    
    const user = userResult.rows[0];
    
    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Senha atual incorreta' });
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password in database
    await pool.query(
      'UPDATE simple_users SET password = $1 WHERE id = $2',
      [hashedNewPassword, decoded.id]
    );
    
    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Helper function to analyze successful Apify run
app.get('/api/instagram/analyze-run/:runId', async (req, res) => {
  try {
    const { runId } = req.params;
    console.log(`🔍 Analyzing successful run: ${runId}`);

    const runDetails = await apifyClient.run(runId).get();
    console.log('📋 Run details:', JSON.stringify({
      status: runDetails.status,
      input: runDetails.input,
      startedAt: runDetails.startedAt,
      finishedAt: runDetails.finishedAt,
      stats: runDetails.stats,
      options: runDetails.options
    }, null, 2));

    // Get the dataset results
    if (runDetails.defaultDatasetId) {
      const { items } = await apifyClient.dataset(runDetails.defaultDatasetId).listItems();
      console.log(`📊 Dataset results: ${items.length} items`);
      
      res.json({
        success: true,
        runDetails: {
          status: runDetails.status,
          input: runDetails.input,
          startedAt: runDetails.startedAt,
          finishedAt: runDetails.finishedAt,
          stats: runDetails.stats,
          options: runDetails.options
        },
        resultCount: items.length,
        firstResult: items[0] || null
      });
    } else {
      res.json({
        success: true,
        runDetails: {
          status: runDetails.status,
          input: runDetails.input,
          startedAt: runDetails.startedAt,
          finishedAt: runDetails.finishedAt,
          stats: runDetails.stats,
          options: runDetails.options
        },
        resultCount: 0
      });
    }
  } catch (error) {
    console.error('❌ Error analyzing run:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Instagram email scraping usando Apify - OTIMIZADO para 25s/21 resultados
app.post('/api/instagram/scrape', async (req, res) => {
  try {
    const { keyword } = req.body;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Palavra-chave é obrigatória'
      });
    }

    if (!apifyClient) {
      return res.status(500).json({
        success: false,
        message: 'Apify client não configurado. Configure APIFY_API_KEY.'
      });
    }

    // Fix UTF-8 encoding issues
    const cleanKeyword = Buffer.from(keyword, 'utf8').toString('utf8').trim();
    console.log('🔍 Instagram email scraping OTIMIZADO with Apify:', { 
      original: keyword,
      cleaned: cleanKeyword,
      originalBytes: Buffer.from(keyword).toString('hex'),
      cleanedBytes: Buffer.from(cleanKeyword).toString('hex')
    });

    // Input exatamente como no exemplo oficial de fábrica
    const input = {
      keyword: cleanKeyword,
      pagesToScrape: 20,
      scrapeGmail: true,
      scrapeYahoo: true,
      scrapeOutlook: true
    };

    console.log('📤 Sending OPTIMIZED input to Apify Instagram Email Scraper:', input);

    // Run the Instagram Email Scraper Actor
    const run = await apifyClient.actor("Snxs770Onv5Vh0P1P").call(input);

    console.log('🏃 Apify run started:', run.id);
    
    // Send immediate response with run ID for progress tracking
    res.json({
      success: true,
      runId: run.id,
      status: 'RUNNING',
      message: 'Instagram scraping iniciado. Use /api/instagram/progress para acompanhar.'
    });

  } catch (error) {
    console.error('❌ Instagram scraping error:', error);
    
    let errorMessage = 'Erro interno do servidor';
    if (error.message?.includes('not enough usage')) {
      errorMessage = 'Limite de uso do Apify atingido. Tente novamente mais tarde.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Timeout na busca. Tente com uma palavra-chave mais específica.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Instagram scraping progress endpoint
app.get('/api/instagram/progress/:runId', async (req, res) => {
  try {
    const { runId } = req.params;

    if (!apifyClient) {
      return res.status(500).json({
        success: false,
        message: 'Apify client não configurado.'
      });
    }

    // Get run details
    const runDetails = await apifyClient.run(runId).get();
    
    if (!runDetails) {
      return res.status(404).json({
        success: false,
        message: 'Run não encontrado'
      });
    }

    console.log(`📊 Run ${runId} status: ${runDetails.status}`);

    if (runDetails.status === 'SUCCEEDED') {
      // Fetch final results
      const { items } = await apifyClient.dataset(runDetails.defaultDatasetId).listItems();
      
      console.log(`🔍 DEBUG: Total items from Apify dataset: ${items.length}`);
      console.log('🔍 DEBUG: First few items structure:', JSON.stringify(items.slice(0, 3), null, 2));
      
      // Log items with emails specifically
      const itemsWithEmail = items.filter(item => item.email);
      console.log(`🔍 DEBUG: Items with email field: ${itemsWithEmail.length}`);
      
      // Log all unique field names in the items
      if (items.length > 0) {
        const allFields = new Set();
        items.forEach(item => {
          Object.keys(item).forEach(key => allFields.add(key));
        });
        console.log('🔍 DEBUG: All available fields in items:', Array.from(allFields).sort());
      }
      
      // Filter and structure the results - try to be more flexible with field names
      const processedResults = items.filter(item => item.email || item.Email).map(item => ({
        username: item.username || item.Username || 'N/A',
        fullName: item.fullName || item.full_name || item.name || item.Name || 'N/A',
        email: item.email || item.Email,
        url: item.url || item.link || item.profileUrl || item.profile_url,
        biography: item.biography || item.bio || item.description,
        externalUrl: item.externalUrl || item.external_url || item.website,
        followersCount: item.followersCount || item.followers_count || item.followers,
        followingCount: item.followingCount || item.following_count || item.following,
        postsCount: item.postsCount || item.posts_count || item.posts,
        isVerified: item.isVerified || item.is_verified || false,
        isPrivate: item.isPrivate || item.is_private || false,
        businessCategoryName: item.businessCategoryName || item.business_category,
        profilePicUrl: item.profilePicUrl || item.profile_pic_url || item.avatar
      }));

      res.json({
        success: true,
        status: 'SUCCEEDED',
        results: processedResults,
        total: processedResults.length,
        runId: runId,
        progress: 100
      });
    } else if (runDetails.status === 'FAILED') {
      res.json({
        success: false,
        status: 'FAILED',
        message: 'Instagram scraping falhou',
        progress: 0
      });
    } else {
      // Calculate progress based on run time (estimativa dinâmica baseada no tempo decorrido)
      const startedAt = new Date(runDetails.startedAt);
      const now = new Date();
      const elapsed = now - startedAt;
      // Estimativa dinâmica: começar com 30s, ajustar conforme o tempo passa
      const estimatedTotal = Math.max(30000, elapsed * 1.5); // Mínimo 30s, cresce dinamicamente
      const progress = Math.min(Math.round((elapsed / estimatedTotal) * 100), 95);
      
      res.json({
        success: true,
        status: runDetails.status,
        progress: progress,
        message: `Processando Instagram... ${progress}% concluído`
      });
    }

  } catch (error) {
    console.error('❌ Progress check error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar progresso',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// CRM API ENDPOINTS

// DEBUG: Direct user registration (temporary - bypasses rate limiting)
app.post('/api/debug/direct-register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM simple_users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.json({
        success: false,
        message: 'Usuário já existe',
        user: existingUser.rows[0]
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const fullName = `${firstName} ${lastName}`;
    const result = await pool.query(`
      INSERT INTO simple_users (
        name, email, password, created_at
      ) VALUES ($1, $2, $3, NOW())
      RETURNING id, name, email, created_at
    `, [fullName, email, hashedPassword]);
    
    // Create default funnel phases for the new user
    await pool.query(`
      INSERT INTO funil_fases (user_id, nome, descricao, ordem, cor)
      VALUES 
        ($1, 'Novo Lead', 'Leads recém adicionados', 1, '#10B981'),
        ($1, 'Qualificado', 'Leads qualificados para contato', 2, '#3B82F6'),
        ($1, 'Proposta', 'Proposta enviada', 3, '#F59E0B'),
        ($1, 'Fechado', 'Negócio conquistado', 4, '#059669')
    `, [result.rows[0].id]);
    
    res.json({
      success: true,
      message: 'Usuário criado com sucesso (bypass rate limiting)',
      user: result.rows[0],
      password: password // Retorna a senha para o usuário saber
    });
  } catch (error) {
    console.error('❌ Direct register error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message
    });
  }
});

// DEBUG: Reset user password (temporary)
app.post('/api/debug/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    const result = await pool.query(
      'UPDATE simple_users SET password = $1 WHERE email = $2 RETURNING id, email',
      [hashedPassword, email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Senha alterada com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Password reset error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar senha',
      error: error.message
    });
  }
});

// Get leads - simple version that works
app.get('/api/crm/leads', async (req, res) => {
  try {
    // Require valid JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token de acesso requerido. Faça login para continuar.' });
    }

    let userId;
    let decodedToken = null;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
      userId = decodedToken.id;
    } catch (error) {
      console.log('GET /api/crm/leads: Invalid token, using smart fallback');
      userId = await getSmartUserId(decodedToken);
    }

    const result = await pool.query(`
      SELECT 
        l.*,
        f.nome as fase_atual,
        f.cor as fase_cor
      FROM leads l
      LEFT JOIN leads_funil lf ON l.id = lf.lead_id
      LEFT JOIN funil_fases f ON lf.fase_id = f.id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      leads: result.rows,
      debug: {
        leads_count: result.rows.length
      }
    });
  } catch (error) {
    console.error('❌ Test leads error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar leads de teste',
      error: error.message
    });
  }
});

// Get funnel data for authenticated user

// DEBUG: Create user Victor (temporary)
app.post('/api/debug/create-victor', async (req, res) => {
  try {
    const email = 'victormagalhaesg@gmail.com';
    const password = 'victor123';
    const name = 'Victor Magalhaes';
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM simple_users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.json({
        success: true,
        message: 'Usuário Victor já existe',
        user: { id: existingUser.rows[0].id, email: existingUser.rows[0].email }
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const result = await pool.query(
      'INSERT INTO simple_users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email, hashedPassword, name]
    );
    
    res.json({
      success: true,
      message: 'Usuário Victor criado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error creating Victor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário Victor',
      error: error.message
    });
  }
});

// DEBUG: List users (temporary)
app.get('/api/debug/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM simple_users ORDER BY created_at DESC LIMIT 10');
    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('❌ Error listing users:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários',
      error: error.message
    });
  }
});

// Save lead - simple version that works  
app.post('/api/crm/leads', async (req, res) => {
  try {
    console.log('🔍 Received save lead request:', JSON.stringify(req.body, null, 2));
    
    // Require valid JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token de acesso requerido. Faça login para continuar.' });
    }

    let userId;
    let decodedToken = null;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
      userId = decodedToken.id;
    } catch (error) {
      console.log('POST /api/crm/leads: Invalid token, using smart fallback');
      userId = await getSmartUserId(decodedToken);
    }

    const {
      nome,
      empresa,
      telefone,
      email,
      endereco,
      cnpj,
      website,
      categoria,
      rating,
      reviews_count,
      fonte,
      dados_originais,
      notas
    } = req.body;
    
    console.log('🔍 Extracted data:', { nome, empresa, fonte });

    // Check for duplicates - by name, company, phone, or email for the same user
    const duplicateCheck = await pool.query(`
      SELECT id, nome, empresa, telefone, email 
      FROM leads 
      WHERE user_id = $1 
      AND (
        (nome = $2 AND nome != '') 
        OR (empresa = $3 AND empresa != '') 
        OR (telefone = $4 AND telefone != '' AND telefone IS NOT NULL)
        OR (email = $5 AND email != '' AND email IS NOT NULL)
      )
      LIMIT 1
    `, [userId, nome, empresa, telefone, email]);

    if (duplicateCheck.rows.length > 0) {
      const existingLead = duplicateCheck.rows[0];
      console.log('🔍 Duplicate lead found:', existingLead);
      return res.json({
        success: false,
        message: 'Lead já existe na sua base',
        isDuplicate: true,
        existingLead: existingLead
      });
    }

    const result = await pool.query(`
      INSERT INTO leads (
        user_id, nome, empresa, telefone, email, endereco, cnpj, 
        website, categoria, rating, reviews_count, fonte, dados_originais, notas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      userId, nome, empresa, telefone, email, endereco, cnpj,
      website, categoria, rating, reviews_count, fonte, 
      JSON.stringify(dados_originais), notas
    ]);

    const leadId = result.rows[0].id;

    // Add to first phase of funnel (Novo Lead)
    const firstPhase = await pool.query(
      'SELECT id FROM funil_fases WHERE user_id = $1 ORDER BY ordem LIMIT 1',
      [userId]
    );

    if (firstPhase.rows.length > 0) {
      await pool.query(
        'INSERT INTO leads_funil (lead_id, fase_id) VALUES ($1, $2)',
        [leadId, firstPhase.rows[0].id]
      );
    }

    console.log('✅ Lead saved successfully:', result.rows[0].id);
    
    res.json({
      success: true,
      message: 'Lead salvo com sucesso (teste)',
      lead: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Save lead test error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint
    });
    
    res.status(500).json({
      success: false,
      message: 'Erro ao salvar lead',
      error: error.message,
      code: error.code,
      detail: error.detail
    });
  }
});

// OLD ENDPOINT REMOVED - Using flexible auth version above

// OLD GET ENDPOINT REMOVED - Using flexible auth version above


// Get funnel data
app.get('/api/crm/funil', async (req, res) => {
  try {
    // Use smart fallback for user ID without requiring token
    let userId;
    let decodedToken = null;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        decodedToken = jwt.verify(token, JWT_SECRET);
        userId = decodedToken.id;
        console.log(`GET /api/crm/funil: Using authenticated user ${userId}`);
      } catch (error) {
        console.log('GET /api/crm/funil: Invalid token, using smart fallback');
        userId = await getSmartUserId(null);
      }
    } else {
      console.log('GET /api/crm/funil: No token provided, using smart fallback');
      userId = await getSmartUserId(null);
    }

    // Get phases - create default funnel if user doesn't have one
    let phases = await pool.query(`
      SELECT * FROM funil_fases 
      WHERE user_id = $1 
      ORDER BY ordem
    `, [userId]);

    // If user has no funnel phases, create default ones
    if (phases.rows.length === 0) {
      console.log(`🎯 Creating default funnel phases for user ${userId}`);
      
      const defaultPhases = [
        { nome: 'Novo Lead', descricao: 'Leads recém adicionados', ordem: 1, cor: '#10B981' },
        { nome: 'Qualificado', descricao: 'Leads qualificados para contato', ordem: 2, cor: '#3B82F6' },
        { nome: 'Proposta', descricao: 'Proposta enviada', ordem: 3, cor: '#F59E0B' },
        { nome: 'Fechado', descricao: 'Negócio conquistado', ordem: 4, cor: '#059669' }
      ];

      for (const phase of defaultPhases) {
        await pool.query(`
          INSERT INTO funil_fases (user_id, nome, descricao, ordem, cor)
          VALUES ($1, $2, $3, $4, $5)
        `, [userId, phase.nome, phase.descricao, phase.ordem, phase.cor]);
      }

      // Fetch the newly created phases
      phases = await pool.query(`
        SELECT * FROM funil_fases 
        WHERE user_id = $1 
        ORDER BY ordem
      `, [userId]);
    }

    // Get leads in each phase
    const leadsInFunnel = await pool.query(`
      SELECT 
        l.*,
        lf.fase_id,
        lf.data_entrada
      FROM leads l
      JOIN leads_funil lf ON l.id = lf.lead_id
      JOIN funil_fases f ON lf.fase_id = f.id
      WHERE l.user_id = $1
      ORDER BY lf.data_entrada DESC
    `, [userId]);

    // Group leads by phase
    const funnelData = phases.rows.map(phase => ({
      ...phase,
      leads: leadsInFunnel.rows.filter(lead => lead.fase_id === phase.id)
    }));

    res.json({
      success: true,
      funil: funnelData
    });
  } catch (error) {
    console.error('❌ Get funnel error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar funil',
      error: error.message
    });
  }
});

// Debug endpoint to check user and token status
app.get('/api/debug/user/:email', async (req, res) => {
  try {
    const email = req.params.email;
    
    // Check users table
    const user = await pool.query('SELECT id, email, created_at FROM users WHERE email = $1', [email]);
    
    // Check simple_users table  
    const simpleUser = await pool.query('SELECT id, email, created_at FROM simple_users WHERE email = $1', [email]);
    
    // Check leads count
    let leadsCount = 0;
    if (user.rows.length > 0) {
      const leadsResult = await pool.query('SELECT COUNT(*) FROM leads WHERE user_id = $1', [user.rows[0].id]);
      leadsCount = parseInt(leadsResult.rows[0].count);
    } else if (simpleUser.rows.length > 0) {
      const leadsResult = await pool.query('SELECT COUNT(*) FROM leads WHERE user_id = $1', [simpleUser.rows[0].id]);
      leadsCount = parseInt(leadsResult.rows[0].count);
    }
    
    res.json({
      success: true,
      email: email,
      userInUsers: user.rows.length > 0 ? user.rows[0] : null,
      userInSimpleUsers: simpleUser.rows.length > 0 ? simpleUser.rows[0] : null,
      leadsCount: leadsCount,
      smartFallbackId: await getSmartUserId(null)
    });
  } catch (error) {
    console.error('Debug user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar usuário'
    });
  }
});

// Check for existing leads to filter duplicates before scraping
app.post('/api/crm/leads/check-duplicates', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token de acesso requerido' });
    }

    let userId;
    try {
      const decodedToken = jwt.verify(token, JWT_SECRET);
      userId = decodedToken.id;
    } catch (error) {
      userId = await getSmartUserId(null);
    }

    const { leads } = req.body;
    if (!Array.isArray(leads)) {
      return res.status(400).json({ success: false, message: 'Leads array required' });
    }

    // Check each lead against existing database
    const existingLeads = new Set();
    
    for (const lead of leads) {
      const { nome, empresa, telefone, email } = lead;
      
      const duplicateCheck = await pool.query(`
        SELECT id FROM leads 
        WHERE user_id = $1 
        AND (
          (nome = $2 AND nome != '') 
          OR (empresa = $3 AND empresa != '') 
          OR (telefone = $4 AND telefone != '' AND telefone IS NOT NULL)
          OR (email = $5 AND email != '' AND email IS NOT NULL)
        )
        LIMIT 1
      `, [userId, nome, empresa, telefone, email]);

      if (duplicateCheck.rows.length > 0) {
        // Create unique identifier for this lead
        const leadId = `${nome}_${empresa}_${telefone}_${email}`;
        existingLeads.add(leadId);
      }
    }

    res.json({
      success: true,
      existingLeads: Array.from(existingLeads)
    });
  } catch (error) {
    console.error('❌ Check duplicates error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar duplicados'
    });
  }
});

// GET /api/crm/kanban - Same as funil but for Kanban page
app.get('/api/crm/kanban', async (req, res) => {
  try {
    // Require valid JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token de acesso requerido. Faça login para continuar.' });
    }

    let userId;
    let decodedToken = null;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
      userId = decodedToken.id;
    } catch (error) {
      console.log('GET /api/crm/kanban: Invalid token, using smart fallback');
      userId = await getSmartUserId(decodedToken);
    }

    // Get phases - create default funnel if user doesn't have one
    let phases = await pool.query(`
      SELECT * FROM funil_fases 
      WHERE user_id = $1 
      ORDER BY ordem
    `, [userId]);

    // If user has no funnel phases, create default ones
    if (phases.rows.length === 0) {
      console.log(`🎯 Creating default kanban phases for user ${userId}`);
      
      const defaultPhases = [
        { nome: 'Novo Lead', descricao: 'Leads recém adicionados', ordem: 1, cor: '#10B981' },
        { nome: 'Qualificado', descricao: 'Leads qualificados para contato', ordem: 2, cor: '#3B82F6' },
        { nome: 'Proposta', descricao: 'Proposta enviada', ordem: 3, cor: '#F59E0B' },
        { nome: 'Fechado', descricao: 'Negócio conquistado', ordem: 4, cor: '#059669' }
      ];

      for (const phase of defaultPhases) {
        await pool.query(`
          INSERT INTO funil_fases (user_id, nome, descricao, ordem, cor)
          VALUES ($1, $2, $3, $4, $5)
        `, [userId, phase.nome, phase.descricao, phase.ordem, phase.cor]);
      }

      // Fetch the newly created phases
      phases = await pool.query(`
        SELECT * FROM funil_fases 
        WHERE user_id = $1 
        ORDER BY ordem
      `, [userId]);
    }

    // Get leads in each phase
    const leadsInFunnel = await pool.query(`
      SELECT 
        l.*,
        lf.fase_id,
        lf.data_entrada
      FROM leads l
      JOIN leads_funil lf ON l.id = lf.lead_id
      JOIN funil_fases f ON lf.fase_id = f.id
      WHERE l.user_id = $1
      ORDER BY lf.data_entrada DESC
    `, [userId]);

    // Group leads by phase
    const funnelData = phases.rows.map(phase => ({
      ...phase,
      leads: leadsInFunnel.rows.filter(lead => lead.fase_id === phase.id)
    }));

    res.json({
      success: true,
      funil: funnelData
    });
  } catch (error) {
    console.error('❌ Get kanban error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar kanban',
      error: error.message
    });
  }
});

// Move lead between phases
app.put('/api/crm/leads/:leadId/fase', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token required' });
    }

    let userId;
    let decodedToken = null;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
      userId = decodedToken.id;
    } catch (error) {
      console.log('PUT /api/crm/leads/:leadId/fase: Invalid token, using smart fallback');
      userId = await getSmartUserId(decodedToken);
    }
    const { leadId } = req.params;
    const { faseId, notas } = req.body;

    // Verify lead belongs to user
    const leadCheck = await pool.query(
      'SELECT id FROM leads WHERE id = $1 AND user_id = $2',
      [leadId, userId]
    );

    if (leadCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lead não encontrado'
      });
    }

    // Update lead phase
    await pool.query(`
      INSERT INTO leads_funil (lead_id, fase_id, notas)
      VALUES ($1, $2, $3)
      ON CONFLICT (lead_id) 
      DO UPDATE SET 
        fase_id = $2, 
        data_entrada = NOW(),
        notas = $3
    `, [leadId, faseId, notas]);

    res.json({
      success: true,
      message: 'Lead movido com sucesso'
    });
  } catch (error) {
    console.error('❌ Move lead error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao mover lead',
      error: error.message
    });
  }
});

// APIFY INTEGRATION ENDPOINTS

// Get available Apify actors
app.get('/api/apify/actors', async (req, res) => {
  try {
    const response = await axios.get(`${APIFY_BASE_URL}/acts`, {
      params: { token: APIFY_API_KEY, limit: 100 }
    });
    
    res.json({
      success: true,
      actors: response.data.data.items
    });
  } catch (error) {
    console.error('Apify actors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching Apify actors',
      error: error.message
    });
  }
});

// Run an Apify actor using official client
app.post('/api/apify/run/:actorId', async (req, res) => {
  try {
    const { actorId } = req.params;
    const inputData = req.body;
    
    console.log(`🚀 Running Apify actor: ${actorId}`);
    console.log('📋 Input data:', JSON.stringify(inputData, null, 2));

    if (!apifyClient) {
      return res.status(500).json({
        success: false,
        message: 'Apify client not available - check API key configuration'
      });
    }
    
    // Use official Apify client
    const run = await apifyClient.actor(actorId).call(inputData);
    
    console.log(`✅ Actor started successfully. Run ID: ${run.id}`);
    
    res.json({
      success: true,
      runId: run.id,
      status: run.status,
      message: 'Actor started successfully'
    });
  } catch (error) {
    console.error('❌ Apify run error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error running Apify actor',
      error: error.message
    });
  }
});

// Get run status and results using official client
app.get('/api/apify/runs/:runId', async (req, res) => {
  try {
    const { runId } = req.params;
    
    console.log(`📊 Checking status for run: ${runId}`);

    if (!apifyClient) {
      return res.status(500).json({
        success: false,
        message: 'Apify client not available - check API key configuration'
      });
    }
    
    // Get run info using official client
    const run = await apifyClient.run(runId).get();
    console.log(`📈 Run status: ${run.status}`);
    
    let results = null;
    if (run.status === 'SUCCEEDED' && run.defaultDatasetId) {
      try {
        console.log(`📂 Fetching results from dataset: ${run.defaultDatasetId}`);
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
        results = items;
        console.log(`✅ Found ${results.length} results`);
      } catch (resultsError) {
        console.log('❌ Could not fetch results:', resultsError.message);
      }
    }
    
    res.json({
      success: true,
      status: run.status,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      results: results
    });
  } catch (error) {
    console.error('❌ Apify run status error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching run status',
      error: error.message
    });
  }
});

// Get popular/featured actors for the dashboard
app.get('/api/apify/featured', async (req, res) => {
  try {
    // List of business-relevant actor IDs
    const businessActors = [
      'compass/crawler-google-places',  // Google Places scraper
      'apify/google-maps-scraper',      // Google Maps data
      'apify/google-search-results-scraper', // Google Search results  
      'ghost-genius/linkedin-search',   // LinkedIn companies via Ghost Genius
      'apify/web-scraper',              // General web scraper
      'drobnikj/crawler-google-places'  // Alternative Google Places
    ];
    
    const actorsData = await Promise.all(
      businessActors.map(async (actorId) => {
        try {
          const response = await axios.get(`${APIFY_BASE_URL}/acts/${actorId}`, {
            params: { token: APIFY_API_KEY }
          });
          return response.data.data;
        } catch (error) {
          console.log(`Could not fetch actor ${actorId}:`, error.message);
          return {
            id: actorId,
            name: actorId,
            description: 'Actor not available or access restricted',
            isError: true
          };
        }
      })
    );
    
    res.json({
      success: true,
      actors: actorsData
    });
  } catch (error) {
    console.error('Featured actors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured actors',
      error: error.message
    });
  }
});

// Debug endpoint to check environment variables
app.get('/api/debug/env', (req, res) => {
  res.json({
    hasApifyKey: !!process.env.APIFY_API_KEY,
    apifyKeyLength: process.env.APIFY_API_KEY ? process.env.APIFY_API_KEY.length : 0,
    apifyKeyPrefix: process.env.APIFY_API_KEY ? process.env.APIFY_API_KEY.substring(0, 10) + '...' : 'not set',
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    clientInitialized: !!apifyClient
  });
});

// Test Apify connection and Google Places actor specifically
app.get('/api/apify/test', async (req, res) => {
  try {
    // Test basic connection
    const connectionTest = await axios.get(`${APIFY_BASE_URL}/acts`, {
      params: { token: APIFY_API_KEY, limit: 1 }
    });
    
    // Test Google Places actor specifically
    let googlePlacesActor = null;
    try {
      const actorResponse = await axios.get(`${APIFY_BASE_URL}/acts/compass~crawler-google-places`, {
        params: { token: APIFY_API_KEY }
      });
      googlePlacesActor = actorResponse.data.data;
    } catch (actorError) {
      console.log('Google Places actor test failed:', actorError.message);
    }
    
    res.json({
      success: true,
      message: 'Apify connection successful',
      totalActors: connectionTest.data.data.total,
      googlePlacesActor: googlePlacesActor ? {
        id: googlePlacesActor.id,
        name: googlePlacesActor.name,
        username: googlePlacesActor.username,
        isPublic: googlePlacesActor.isPublic
      } : 'Not accessible',
      apiKey: APIFY_API_KEY ? 'Configured' : 'Missing'
    });
  } catch (error) {
    console.error('Apify test error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Apify connection failed',
      error: error.response?.data || error.message
    });
  }
});

// LinkedIn search progress tracking
const progressStore = new Map();

// Progress endpoint - simple polling approach
app.get('/api/linkedin/progress/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const progress = progressStore.get(sessionId) || {
    phase: 'idle',
    current: 0,
    total: 100,
    message: '',
    pagesFound: 0,
    detailsFound: 0,
    completed: false
  };
  
  res.json(progress);
});

// Function to update progress
function updateProgress(sessionId, data) {
  const existing = progressStore.get(sessionId) || {};
  progressStore.set(sessionId, { ...existing, ...data });
  console.log(`📊 Progress Update [${sessionId}]: ${data.message || 'No message'}`);
}

// LinkedIn search using Ghost Genius API (multiple pages)
app.post('/api/linkedin/search-bulk', async (req, res) => {
  try {
    const { keywords, location, industries, company_size, pages = 5, companyLimit = 200, sessionId } = req.body;
    
    // Initialize progress tracking
    if (sessionId) {
      updateProgress(sessionId, {
        phase: 'pages',
        current: 0,
        total: 100,
        message: 'Iniciando busca de páginas...',
        pagesFound: 0,
        detailsFound: 0,
        completed: false
      });
    }
    
    // Calculate optimal pages needed based on company limit (10 companies per page)
    const optimalPages = Math.min(pages, Math.ceil(companyLimit / 10));
    console.log('🔍 LinkedIn bulk search with Ghost Genius:', { keywords, location, industries, company_size, pages: optimalPages, companyLimit });
    
    // If no keywords provided, use generic terms
    let searchKeywords = keywords;
    if (!searchKeywords || searchKeywords.trim() === '') {
      searchKeywords = 'empresa';
      console.log('📝 No keywords provided, using generic term: "empresa"');
    }

    // Build query parameters base
    const baseParams = {
      keywords: searchKeywords.trim()
    };
    
    // Location mapping
    if (location) {
      const locationMappings = {
        'brasil': '106057199', 'brazil': '106057199',
        'são paulo': '105871508', 'sao paulo': '105871508',
        'rio de janeiro': '103658898', 'belo horizonte': '105818291',
        'salvador': '104263468', 'brasília': '104413988', 'brasilia': '104413988',
        'fortaleza': '103836099', 'curitiba': '103501557', 'recife': '106236613',
        'porto alegre': '102556749', 'manaus': '100215884'
      };
      
      const locationId = locationMappings[location.toLowerCase()];
      if (locationId) {
        baseParams.locations = locationId;
        console.log(`📍 Using location ID ${locationId} for "${location}"`);
      }
    }
    
    if (industries) baseParams.industries = industries;
    if (company_size) baseParams.company_size = company_size;

    // Fetch multiple pages sequentially with delay (avoid rate limiting)
    console.log(`🔄 Fetching ${optimalPages} pages sequentially with params:`, baseParams);
    const results = [];
    
    for (let page = 1; page <= optimalPages; page++) {
      try {
        const params = new URLSearchParams({ ...baseParams, page: page.toString() });
        const url = `${GHOST_GENIUS_BASE_URL}/search/companies?${params}`;
        
        console.log(`📄 Fetching page ${page}/${optimalPages}...`);
        
        // Update progress for page fetch
        if (sessionId) {
          const pageProgress = Math.floor((page / optimalPages) * 15); // Pages = 15% of total progress
          updateProgress(sessionId, {
            phase: 'pages',
            current: pageProgress,
            total: 100,
            message: `🔍 Buscando página ${page} de ${optimalPages}...`,
            pagesFound: (page - 1) * 10,
            detailsFound: 0
          });
        }
        
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${GHOST_GENIUS_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        });
        
        const pageResult = {
          page,
          data: response.data.data || [],
          total: response.data.total || 0
        };
        
        results.push(pageResult);
        
        // Ghost Genius rate limiting: 1 request per second maximum
        if (page < pages) {
          await new Promise(resolve => setTimeout(resolve, 1100)); // 1.1s delay per official docs
        }
        
      } catch (error) {
        console.log(`⚠️ Error fetching page ${page}:`, error.response?.status, error.message);
        results.push({ page, data: [], total: 0 });
      }
    }
    
    // Combine all results
    let allCompanies = [];
    let totalFound = 0;
    
    results.forEach((result, index) => {
      console.log(`📄 Page ${result.page}: ${result.data.length} companies, total available: ${result.total}`);
      if (result.data.length > 0) {
        allCompanies = allCompanies.concat(result.data);
        totalFound = Math.max(totalFound, result.total);
      }
    });
    
    // Remove duplicates by ID
    const uniqueCompanies = [];
    const seenIds = new Set();
    
    allCompanies.forEach(company => {
      if (!seenIds.has(company.id)) {
        seenIds.add(company.id);
        uniqueCompanies.push(company);
      }
    });
    
    console.log(`✅ Found ${allCompanies.length} total companies, ${uniqueCompanies.length} unique companies from ${pages} pages`);
    
    // Apply company limit if specified
    if (companyLimit && uniqueCompanies.length > companyLimit) {
      uniqueCompanies = uniqueCompanies.slice(0, companyLimit);
      console.log(`🔢 Limited to first ${companyLimit} companies as requested`);
    }
    
    // Get detailed info for all companies if requested
    const detailed = req.body.detailed === true;
    let enrichedData = uniqueCompanies;
    
    if (detailed && uniqueCompanies.length > 0) {
      console.log('🔍 Fetching detailed information with optimized rate limiting...');
      
      // Get detailed data for ALL companies - user requested complete data even if >1 minute
      // With 800ms delay, 100 companies = ~80 seconds total
      const companiesForDetail = uniqueCompanies; // ALL companies
      
      console.log(`📊 Getting detailed info for ALL ${companiesForDetail.length} companies (~${Math.ceil(companiesForDetail.length * 0.8)}s estimated)`);
      
      const detailedResults = [];
      // Start details phase
      if (sessionId) {
        updateProgress(sessionId, {
          phase: 'details',
          current: 15,
          total: 100,
          message: 'Iniciando busca de dados detalhados...',
          pagesFound: uniqueCompanies.length,
          detailsFound: 0
        });
      }
      
      for (let i = 0; i < companiesForDetail.length; i++) {
        const company = companiesForDetail[i];
        try {
          // Update progress for each company detail fetch
          if (sessionId && (i % 5 === 0 || i === companiesForDetail.length - 1)) {
            const detailProgress = Math.floor((i / companiesForDetail.length) * 80); // Details = 80% of progress
            updateProgress(sessionId, {
              phase: 'details',
              current: 15 + detailProgress,
              total: 100,
              message: `✨ Buscando dados detalhados (${i + 1}/${companiesForDetail.length})...`,
              pagesFound: uniqueCompanies.length,
              detailsFound: i
            });
          }
          
          if (i % 10 === 0) {
            console.log(`📋 Progress: ${i + 1}/${companiesForDetail.length} detailed companies`);
          }
          
          const detailResponse = await axios.get(`${GHOST_GENIUS_BASE_URL}/company`, {
            params: { url: company.url },
            headers: {
              'Authorization': `Bearer ${GHOST_GENIUS_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          });
          
          detailedResults.push({
            ...company,
            detailed: detailResponse.data
          });
          
          // Optimized rate limiting: 500ms for faster completion 
          if (i < companiesForDetail.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
        } catch (error) {
          console.log(`⚠️ Error getting details for ${company.full_name}:`, error.message);
          detailedResults.push(company);
        }
      }
      
      // All companies now have detailed data
      enrichedData = detailedResults;
      
      console.log(`✅ Enhanced ${detailedResults.length} companies with detailed info of ${enrichedData.length} total`);
      
      // Mark as completed
      if (sessionId) {
        updateProgress(sessionId, {
          phase: 'completed',
          current: 100,
          total: 100,
          message: `✅ Concluído! ${enrichedData.length} empresas (TODAS com dados detalhados)`,
          pagesFound: enrichedData.length,
          detailsFound: enrichedData.length,
          completed: true
        });
      }
    }

    res.json({
      success: true,
      data: enrichedData,
      total: totalFound,
      pages_fetched: optimalPages,
      unique_companies: uniqueCompanies.length,
      source: 'ghost-genius-bulk',
      detailed: detailed
    });

  } catch (error) {
    console.error('❌ LinkedIn bulk search error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error in bulk LinkedIn search',
      error: error.response?.data?.message || error.message
    });
  }
});

// LinkedIn search using Ghost Genius API (single page)
app.post('/api/linkedin/search', async (req, res) => {
  try {
    const { keywords, location, industries, company_size, page = 1, companyLimit = 200 } = req.body;
    
    console.log('🔍 LinkedIn search with Ghost Genius:', { keywords, location, industries, company_size, page });
    
    // If no keywords provided, use generic terms to find companies with filters
    let searchKeywords = keywords;
    if (!searchKeywords || searchKeywords.trim() === '') {
      searchKeywords = 'empresa'; // Generic Portuguese term for "company"
      console.log('📝 No keywords provided, using generic term: "empresa"');
    }

    // Build query parameters
    const params = new URLSearchParams({
      keywords: searchKeywords.trim()
    });
    
    // Convert location string to LinkedIn Location ID
    let locationId = null;
    if (location) {
      // LinkedIn Location IDs for Brazilian cities (validated and confirmed)
      const locationMappings = {
        'brasil': '106057199',        // Brasil
        'brazil': '106057199',
        'são paulo': '105871508',     // São Paulo, SP
        'sao paulo': '105871508',
        'rio de janeiro': '103658898', // Rio de Janeiro, RJ
        'belo horizonte': '105818291', // Belo Horizonte, MG
        'salvador': '104263468',      // Salvador, BA
        'brasília': '104413988',      // Brasília, DF
        'brasilia': '104413988',
        'fortaleza': '103836099',     // Fortaleza, CE
        'curitiba': '103501557',      // Curitiba, PR
        'recife': '106236613',        // Recife, PE
        'porto alegre': '102556749',  // Porto Alegre, RS
        'manaus': '100215884'         // Manaus, AM
      };
      
      const locationKey = location.toLowerCase();
      if (locationMappings[locationKey]) {
        locationId = locationMappings[locationKey];
        params.append('locations', locationId);
        console.log(`📍 Using location ID ${locationId} for "${location}"`);
      } else {
        console.log(`⚠️ Location "${location}" not found in mapping - showing global results`);
      }
    }
    
    // Add other filters
    if (industries) {
      params.append('industries', industries);
      console.log(`🏭 Using industries: ${industries}`);
    }
    
    if (company_size) {
      params.append('company_size', company_size);
      console.log(`🏢 Using company size: ${company_size}`);
    }
    
    if (page) params.append('page', page.toString());

    // Make request to Ghost Genius API
    const fullUrl = `${GHOST_GENIUS_BASE_URL}/search/companies?${params}`;
    console.log(`🌐 Ghost Genius URL: ${fullUrl}`);
    
    const response = await axios.get(fullUrl, {
      headers: {
        'Authorization': `Bearer ${GHOST_GENIUS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Found ${response.data.data?.length || 0} LinkedIn companies`);

    // Option to get detailed company info
    const detailed = req.body.detailed === true;
    let enrichedData = response.data.data || [];
    
    if (detailed && enrichedData.length > 0) {
      console.log('🔍 Fetching detailed company information...');
      
      // Get detailed info for more companies with optimized rate limiting
      // Get detailed data for ALL companies - user requested complete data even if >1 minute
      // With 800ms delay, 100 companies = ~80 seconds total
      const companiesForDetail = enrichedData; // ALL companies
      console.log(`📊 Will get detailed info for ALL ${companiesForDetail.length} companies (~${Math.ceil(companiesForDetail.length * 0.8)}s estimated)`);
      
      // Fetch detailed data sequentially to respect 1 req/sec limit
      const detailedResults = [];
      for (let i = 0; i < companiesForDetail.length; i++) {
        const company = companiesForDetail[i];
        try {
          console.log(`📋 Getting details for: ${company.full_name} (${i + 1}/${companiesForDetail.length})`);
          
          const detailResponse = await axios.get(`${GHOST_GENIUS_BASE_URL}/company`, {
            params: { url: company.url },
            headers: {
              'Authorization': `Bearer ${GHOST_GENIUS_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          });
          
          detailedResults.push({
            ...company,
            detailed: detailResponse.data
          });
          
          // Optimized rate limiting: 500ms for faster completion 
          if (i < companiesForDetail.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
        } catch (error) {
          console.log(`⚠️ Error getting details for ${company.full_name}:`, error.message);
          detailedResults.push(company); // Return original if detail fails
        }
      }
      
      // All companies now have detailed data
      enrichedData = detailedResults;
      
      console.log(`✅ Enhanced ${detailedResults.length} companies with detailed info`);
    }

    res.json({
      success: true,
      data: enrichedData,
      total: response.data.total || 0,
      pagination: {
        page: page,
        total: response.data.total || 0
      },
      source: 'ghost-genius',
      detailed: detailed,
      raw_response: response.data // Incluir resposta completa para debug
    });

  } catch (error) {
    console.error('❌ LinkedIn search error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error searching LinkedIn companies',
      error: error.response?.data?.message || error.message
    });
  }
});

// BUSINESS SEGMENTS BASED ON REAL CNAE DATA
app.get('/api/filters/options', async (req, res) => {
  try {
    // Buscar motivos de situação cadastral da tabela 'motivo'
    let motivoSituacaoResult;
    try {
      motivoSituacaoResult = await pool.query(`
        SELECT codigo as code, descricao as description 
        FROM motivo 
        ORDER BY codigo
      `);
    } catch (error) {
      console.log('Using static motivo data due to:', error.message);
      motivoSituacaoResult = {
        rows: [
          {code: "00", description: "Sem Restrição"},
          {code: "01", description: "Extinção por Encerramento Liquidação Voluntária"},
          {code: "02", description: "Incorporação"},
          {code: "03", description: "Fusão"},
          {code: "04", description: "Cisão Total"},
          {code: "05", description: "Extinção de Filial"},
          {code: "06", description: "Caducidade"},
          {code: "07", description: "Falta de Pluralidade de Sócios"},
          {code: "08", description: "Omissa em Declarações"},
          {code: "09", description: "Falência"},
          {code: "10", description: "Concordata"},
          {code: "11", description: "Liquidação Judicial"},
          {code: "12", description: "Liquidação Extrajudicial"}
        ]
      };
    }

    // Buscar qualificações de sócio da tabela 'qualificacao_socio'
    let qualificacaoSocioResult;
    try {
      qualificacaoSocioResult = await pool.query(`
        SELECT codigo as code, descricao as description 
        FROM qualificacao_socio 
        ORDER BY codigo
      `);
    } catch (error) {
      console.log('Using static qualificacao_socio data due to:', error.message);
      qualificacaoSocioResult = {
        rows: [
          {code: "05", description: "Administrador"},
          {code: "08", description: "Conselheiro de Administração"},
          {code: "10", description: "Diretor"},
          {code: "16", description: "Presidente"},
          {code: "17", description: "Procurador"},
          {code: "22", description: "Sócio"},
          {code: "49", description: "Sócio-Administrador"},
          {code: "54", description: "Fundador"},
          {code: "65", description: "Titular Pessoa Física"}
        ]
      };
    }

    // Buscar naturezas jurídicas da tabela 'natureza_juridica'
    let naturezaJuridicaResult;
    try {
      naturezaJuridicaResult = await pool.query(`
        SELECT codigo as code, descricao as description 
        FROM natureza_juridica 
        ORDER BY codigo
      `);
    } catch (error) {
      console.log('Using static natureza_juridica data due to:', error.message);
      naturezaJuridicaResult = {
        rows: [
          {code: "1015", description: "Empresa Individual de Responsabilidade Limitada"},
          {code: "2135", description: "Sociedade Limitada"},
          {code: "2062", description: "Sociedade Empresária Limitada"},
          {code: "2240", description: "Sociedade Simples Limitada"},
          {code: "1244", description: "Empresário Individual"},
          {code: "2054", description: "Sociedade Anônima Aberta"},
          {code: "2070", description: "Sociedade Anônima Fechada"}
        ]
      };
    }

  const businessSegments = [
    {
      id: 1, 
      name: "Vestuário e Moda", 
      icon: "👗", 
      color: "#FF6B6B",
      description: "3,5M empresas",
      cnaes: ["4781400", "1412601", "4782201"],
      cnaeDescriptions: ["Comércio varejista de vestuário", "Confecção de peças", "Comércio de calçados"]
    },
    {
      id: 2, 
      name: "Alimentação e Restaurantes", 
      icon: "🍽️", 
      color: "#4ECDC4",
      description: "3,6M empresas",
      cnaes: ["5611203", "5611201", "5620104", "5612100"],
      cnaeDescriptions: ["Lanchonetes e similares", "Restaurantes", "Fornecimento domiciliar", "Serviços ambulantes"]
    },
    {
      id: 3, 
      name: "Beleza e Estética", 
      icon: "💄", 
      color: "#F7DC6F",
      description: "2,5M empresas",
      cnaes: ["9602501", "9602502", "4772500"],
      cnaeDescriptions: ["Cabeleireiros e manicure", "Atividades de estética", "Comércio de cosméticos"]
    },
    {
      id: 4, 
      name: "Comércio e Mercados", 
      icon: "🏪", 
      color: "#58D68D",
      description: "2,5M empresas",
      cnaes: ["4712100", "4711301", "4729699", "4723700"],
      cnaeDescriptions: ["Minimercados e mercearias", "Hipermercados", "Produtos alimentícios", "Comércio de bebidas"]
    },
    {
      id: 5, 
      name: "Construção Civil", 
      icon: "🏗️", 
      color: "#F4D03F",
      description: "2,3M empresas",
      cnaes: ["4399103", "4321500", "4120400", "4330404", "4744099"],
      cnaeDescriptions: ["Obras de alvenaria", "Instalação elétrica", "Construção de edifícios", "Pintura", "Materiais de construção"]
    },
    {
      id: 6, 
      name: "Transportes e Logística", 
      icon: "🚛", 
      color: "#F8C471",
      description: "2,1M empresas",
      cnaes: ["4930201", "4930202", "5320202", "5229099"],
      cnaeDescriptions: ["Transporte municipal", "Transporte intermunicipal", "Entrega rápida", "Auxiliares de transporte"]
    },
    {
      id: 7, 
      name: "Serviços Profissionais", 
      icon: "💼", 
      color: "#D7DBDD",
      description: "2,0M empresas",
      cnaes: ["7319002", "8219999", "8211300", "8230001"],
      cnaeDescriptions: ["Promoção de vendas", "Apoio administrativo", "Serviços de escritório", "Organização de eventos"]
    },
    {
      id: 8, 
      name: "Tecnologia e Informática", 
      icon: "💻", 
      color: "#5DADE2",
      description: "0,8M empresas",
      cnaes: ["9511800", "4751201", "6209100", "6201501"],
      cnaeDescriptions: ["Reparação de computadores", "Equipamentos de informática", "Desenvolvimento de software", "Desenvolvimento de sites"]
    },
    {
      id: 9, 
      name: "Saúde e Farmácias", 
      icon: "💊", 
      color: "#A569BD",
      description: "0,7M empresas",
      cnaes: ["4771701", "8712300", "8630501", "8650099"],
      cnaeDescriptions: ["Produtos farmacêuticos", "Assistência domiciliar", "Atividade médica ambulatorial", "Atividades de profissionais da área de saúde"]
    },
    {
      id: 10, 
      name: "Educação e Treinamento", 
      icon: "📚", 
      color: "#52BE80",
      description: "1,2M empresas",
      cnaes: ["8599699", "8599604", "8513900", "8520100"],
      cnaeDescriptions: ["Outras atividades de ensino", "Treinamento profissional", "Ensino fundamental", "Educação infantil"]
    },
    {
      id: 11, 
      name: "Automóveis e Oficinas", 
      icon: "🚗", 
      color: "#EC7063",
      description: "1,0M empresas",
      cnaes: ["4520001", "4530703", "4511101", "4520008"],
      cnaeDescriptions: ["Manutenção mecânica", "Peças e acessórios", "Comércio de automóveis", "Serviços de lanternagem"]
    },
    {
      id: 12, 
      name: "Organizações e Associações", 
      icon: "🏛️", 
      color: "#BB8FCE",
      description: "4,2M empresas",
      cnaes: ["9492800", "9430800", "9491000", "8112500"],
      cnaeDescriptions: ["Organizações políticas", "Associações de direitos", "Organizações religiosas", "Condomínios prediais"]
    },
    {
      id: 13, 
      name: "Varejo Especializado", 
      icon: "🛍️", 
      color: "#7FB3D3",
      description: "1,5M empresas",
      cnaes: ["4789099", "4774100", "4754701", "4755502", "4744001"],
      cnaeDescriptions: ["Outros produtos", "Artigos de óptica", "Móveis", "Armarinho", "Ferragens"]
    },
    {
      id: 14, 
      name: "Alimentação - Produção", 
      icon: "🍰", 
      color: "#7DCEA0",
      description: "0,4M empresas",
      cnaes: ["1091102", "4722901", "1011201", "1012101"],
      cnaeDescriptions: ["Padaria e confeitaria", "Açougues", "Abate de bovinos", "Frigoríficos"]
    },
    {
      id: 15, 
      name: "Serviços Domésticos", 
      icon: "🏠", 
      color: "#F1948A",
      description: "0,5M empresas",
      cnaes: ["9700500", "8121400", "9601701", "8129900"],
      cnaeDescriptions: ["Serviços domésticos", "Limpeza de prédios", "Reparação de calçados", "Outras atividades de limpeza"]
    },
    {
      id: 16, 
      name: "Comunicação e Mídia", 
      icon: "📱", 
      color: "#AED6F1",
      description: "0,3M empresas",
      cnaes: ["5320201", "7311400", "6020300", "7319004"],
      cnaeDescriptions: ["Serviços de malote", "Agências de publicidade", "Programação de TV", "Locação de stands"]
    },
    {
      id: 17, 
      name: "Agricultura e Pecuária", 
      icon: "🌾", 
      color: "#82E0AA",
      description: "0,2M empresas",
      cnaes: ["0111301", "0151201", "0113001", "0161001"],
      cnaeDescriptions: ["Cultivo de milho", "Criação de bovinos", "Cultivo de cana", "Atividades de apoio à agricultura"]
    },
    {
      id: 18, 
      name: "Energia e Utilities", 
      icon: "⚡", 
      color: "#F7DC6F",
      description: "0,1M empresas",
      cnaes: ["3511500", "3600601", "3514000", "4221901"],
      cnaeDescriptions: ["Geração de energia", "Captação de água", "Distribuição de energia", "Obras de utilidade pública"]
    },
    {
      id: 19, 
      name: "Finanças e Seguros", 
      icon: "💰", 
      color: "#85C1E9",
      description: "0,1M empresas",
      cnaes: ["6422100", "6550200", "6420400", "6491800"],
      cnaeDescriptions: ["Bancos múltiplos", "Seguros de vida", "Cooperativas de crédito", "Outras intermediações financeiras"]
    },
    {
      id: 20, 
      name: "Outros Setores", 
      icon: "📋", 
      color: "#BDC3C7",
      description: "Demais atividades",
      cnaes: ["8888888", "0000000"],
      cnaeDescriptions: ["Atividade não informada", "Outros códigos"]
    }
  ];

  const ufs = [
    {code: "SP", description: "São Paulo"},
    {code: "MG", description: "Minas Gerais"},
    {code: "RJ", description: "Rio de Janeiro"},
    {code: "AC", description: "Acre"},
    {code: "AL", description: "Alagoas"},
    {code: "AP", description: "Amapá"},
    {code: "AM", description: "Amazonas"},
    {code: "BA", description: "Bahia"},
    {code: "CE", description: "Ceará"},
    {code: "DF", description: "Distrito Federal"},
    {code: "ES", description: "Espírito Santo"},
    {code: "GO", description: "Goiás"},
    {code: "MA", description: "Maranhão"},
    {code: "MT", description: "Mato Grosso"},
    {code: "MS", description: "Mato Grosso do Sul"},
    {code: "PA", description: "Pará"},
    {code: "PB", description: "Paraíba"},
    {code: "PR", description: "Paraná"},
    {code: "PE", description: "Pernambuco"},
    {code: "PI", description: "Piauí"},
    {code: "RR", description: "Roraima"},
    {code: "RO", description: "Rondônia"},
    {code: "RS", description: "Rio Grande do Sul"},
    {code: "SC", description: "Santa Catarina"},
    {code: "SE", description: "Sergipe"},
    {code: "TO", description: "Tocantins"}
  ];

  const situacaoCadastral = [
    {code: "02", description: "Ativa"},
    {code: "08", description: "Baixada"},
    {code: "04", description: "Inapta"}
  ];

  const motivoSituacao = motivoSituacaoResult.rows;
  const qualificacaoSocio = qualificacaoSocioResult.rows;
  const naturezaJuridica = naturezaJuridicaResult.rows;

  // Filter out any filter categories that have only 1 or 0 options
  // Since single-option dropdowns are not useful for filtering
  const filterData = {
    businessSegments, 
    ufs, 
    situacaoCadastral
  };

  // Only include filters that have more than 1 option
  if (motivoSituacao && motivoSituacao.length > 1) {
    filterData.motivoSituacao = motivoSituacao;
  }
  
  if (qualificacaoSocio && qualificacaoSocio.length > 1) {
    filterData.qualificacaoSocio = qualificacaoSocio;
  }
  
  if (naturezaJuridica && naturezaJuridica.length > 1) {
    filterData.naturezaJuridica = naturezaJuridica;
  }

  console.log('📊 Filter options count:', {
    businessSegments: businessSegments.length,
    ufs: ufs.length,
    situacaoCadastral: situacaoCadastral.length,
    motivoSituacao: motivoSituacao?.length || 0,
    qualificacaoSocio: qualificacaoSocio?.length || 0,
    naturezaJuridica: naturezaJuridica?.length || 0
  });

  res.json({
    success: true,
    data: filterData
  });
  
  } catch (error) {
    console.error('❌ Error loading filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar opções de filtros'
    });
  }
});

app.post('/api/companies/filtered', async (req, res) => {
  console.log('🔍 Starting company search...');
  const startTime = Date.now();
  
  try {
    const filters = req.body;
    const page = filters.page || 1;
    let companyLimit = filters.companyLimit || 1000;
    const searchMode = filters.searchMode || 'normal';

    // Set timeout for this request based on company limit
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: 'Query timeout - consulta muito demorada. Tente filtros mais específicos.'
        });
      }
    }, companyLimit >= 50000 ? 300000 : companyLimit >= 25000 ? 240000 : 120000); // 5min for 50k, 4min for 25k+, 2min others
    
    console.log('Filters:', filters);
    
    // Allow up to 50000 companies as requested
    if (companyLimit > 50000) {
      console.log(`⚠️ Very large query detected (${companyLimit}), limiting to 50000 for performance`);
      companyLimit = 50000;
    }
    
    // When searching by specific CNPJ, automatically set limit to 1
    const isSpecificSearch = filters.cnpj && filters.cnpj.trim();
    if (isSpecificSearch) {
      companyLimit = 1;
      console.log(`🎯 CNPJ search detected, setting limit to 1`);
    } else {
      // For general searches, enforce minimum of 1000
      if (companyLimit < 1000 || companyLimit > 50000) {
        clearTimeout(timeoutId);
        return res.status(400).json({
          success: false,
          message: `O limite deve estar entre 1.000 e 50.000 empresas`
        });
      }
    }
    
    const conditions = [];
    const params = [];
    
    if (filters.uf) {
      conditions.push(`est.uf = $${params.length + 1}`);
      params.push(filters.uf);
    }
    
    if (filters.situacaoCadastral) {
      conditions.push(`est.situacao_cadastral = $${params.length + 1}`);
      params.push(filters.situacaoCadastral);
    }
    
    if (filters.segmentoNegocio) {
      // Mapear segmento para CNAEs (usando dados do businessSegments)
      const segmentId = parseInt(filters.segmentoNegocio);
      const businessSegments = [
        { id: 1, cnaes: ["4781400", "1412601", "4782201"] },
        { id: 2, cnaes: ["5611203", "5611201", "5620104", "5612100"] },
        { id: 3, cnaes: ["9602501", "9602502", "4772500"] },
        { id: 4, cnaes: ["4530703", "4530705", "4541205"] },
        { id: 5, cnaes: ["4511102", "4512901", "4520001"] },
        { id: 6, cnaes: ["4930201", "4930202", "5320202", "5229099"] },
        { id: 7, cnaes: ["6202300", "6201501", "6204000"] },
        { id: 8, cnaes: ["7020400", "7319002", "7319001"] },
        { id: 9, cnaes: ["4771701", "8712300", "8630501", "8650099"] },
        { id: 10, cnaes: ["8599699", "8599604", "8513900", "8520100"] },
        { id: 11, cnaes: ["4520008", "4541209", "4530703"] },
        { id: 12, cnaes: ["1011201", "1011202", "1012101"] },
        { id: 13, cnaes: ["4211101", "4212000", "4213800"] },
        { id: 14, cnaes: ["6421200", "6422100", "6423900"] },
        { id: 15, cnaes: ["5510801", "5510802", "5590699"] },
        { id: 16, cnaes: ["9001901", "9001902", "9002701"] },
        { id: 17, cnaes: ["7490104", "7490199", "8299799"] },
        { id: 18, cnaes: ["4110700", "4120400", "4291000"] },
        { id: 19, cnaes: ["8630501", "8630503", "8640205"] },
        { id: 20, cnaes: ["4661300", "4662200", "4669999"] }
      ];
      
      const segment = businessSegments.find(s => s.id === segmentId);
      console.log(`🔍 DEBUG SEGMENT: ID=${segmentId}, Found=${!!segment}`);
      if (segment) {
        console.log(`📋 SEGMENT CNAEs: ${JSON.stringify(segment.cnaes)}`);
        conditions.push(`est.cnae_fiscal = ANY($${params.length + 1})`);
        params.push(segment.cnaes);
        console.log(`🎯 FILTER APPLIED: est.cnae_fiscal = ANY([${segment.cnaes.join(',')}])`);
      } else {
        console.log(`❌ SEGMENT NOT FOUND: ${segmentId}`);
      }
    }
    
    if (filters.motivoSituacao) {
      conditions.push(`est.motivo_situacao_cadastral = $${params.length + 1}`);
      params.push(filters.motivoSituacao);
    }
    
    if (filters.naturezaJuridica) {
      conditions.push(`emp.natureza_juridica = $${params.length + 1}`);
      params.push(filters.naturezaJuridica);
    }
    
    if (filters.cnpj) {
      // For CNPJ searches, use exact match for much better performance
      conditions.push(`est.cnpj = $${params.length + 1}`);
      params.push(filters.cnpj);
    }
    
    if (filters.razaoSocial) {
      conditions.push(`emp.razao_social ILIKE $${params.length + 1}`);
      params.push(`%${filters.razaoSocial}%`);
    }
    
    if (filters.matrizFilial && filters.matrizFilial !== '') {
      conditions.push(`est.matriz_filial = $${params.length + 1}`);
      params.push(filters.matrizFilial);
    }
    
    if (filters.porteEmpresa) {
      conditions.push(`emp.porte_empresa = $${params.length + 1}`);
      params.push(filters.porteEmpresa);
    }
    
    if (filters.capitalSocial) {
      conditions.push(`emp.capital_social >= $${params.length + 1}`);
      params.push(parseFloat(filters.capitalSocial));
    }
    
    if (filters.temContato === 'sim') {
      conditions.push(`(est.correio_eletronico IS NOT NULL AND est.correio_eletronico != '' OR est.telefone1 IS NOT NULL AND est.telefone1 != '')`);
    } else if (filters.temContato === 'nao') {
      conditions.push(`(est.correio_eletronico IS NULL OR est.correio_eletronico = '') AND (est.telefone1 IS NULL OR est.telefone1 = '')`);
    }
    
    if (conditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Pelo menos um filtro é obrigatório'
      });
    }
    
    const whereClause = 'WHERE ' + conditions.join(' AND ');
    
    // Paginação SEMPRE 1000 empresas por página
    const perPage = 1000;
    const offset = (page - 1) * perPage;
    const limitPerPage = perPage;
    
    // Dynamic ORDER BY based on search mode
    let orderByClause = 'ORDER BY est.cnpj_basico'; // default
    switch (searchMode) {
      case 'random':
        orderByClause = 'ORDER BY RANDOM()';
        break;
      case 'alphabetic':
        orderByClause = 'ORDER BY est.razao_social ASC';
        break;
      case 'alphabetic_desc':
        orderByClause = 'ORDER BY est.razao_social DESC';
        break;
      case 'newest':
        orderByClause = 'ORDER BY est.data_inicio_atividades DESC NULLS LAST';
        break;
      case 'largest':
        // Optimized: First filter by capital_social > 0, then sort for better performance
        orderByClause = 'ORDER BY COALESCE(emp.capital_social::NUMERIC, 0) DESC';
        // Add filter to focus on companies with meaningful capital_social values
        conditions.push(`emp.capital_social IS NOT NULL AND emp.capital_social::NUMERIC > 0`);
        break;
      case 'reverse':
        orderByClause = 'ORDER BY est.cnpj_basico DESC';
        break;
      default:
        orderByClause = 'ORDER BY est.cnpj_basico';
    }
    
    // Complete query with all data including Simples Nacional
    const query = `
      SELECT 
        est.cnpj,
        est.cnpj_basico,
        est.cnpj_ordem,
        est.cnpj_dv,
        est.nome_fantasia,
        est.matriz_filial,
        est.situacao_cadastral,
        est.data_situacao_cadastral,
        est.motivo_situacao_cadastral,
        est.data_inicio_atividades,
        est.cnae_fiscal,
        est.cnae_fiscal_secundaria,
        est.tipo_logradouro,
        est.logradouro,
        est.numero,
        est.complemento,
        est.bairro,
        est.cep,
        est.uf,
        est.municipio,
        est.ddd1,
        est.telefone1,
        est.ddd2,
        est.telefone2,
        est.ddd_fax,
        est.fax,
        est.correio_eletronico,
        est.situacao_especial,
        est.data_situacao_especial,
        emp.razao_social,
        emp.natureza_juridica,
        emp.qualificacao_responsavel,
        emp.porte_empresa,
        emp.ente_federativo_responsavel,
        emp.capital_social,
        simples.opcao_simples,
        simples.data_opcao_simples,
        simples.data_exclusao_simples,
        simples.opcao_mei,
        simples.data_opcao_mei,
        simples.data_exclusao_mei
      FROM estabelecimento est
      LEFT JOIN empresas emp ON est.cnpj_basico = emp.cnpj_basico
      LEFT JOIN simples ON est.cnpj_basico = simples.cnpj_basico
      ${whereClause}
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limitPerPage, offset);
    
    console.log(`🔧 PAGINAÇÃO DEBUG:`);
    console.log(`   Page: ${page}, CompanyLimit: ${companyLimit}, PerPage: ${perPage}`);
    console.log(`   SearchMode: ${searchMode}, Offset: ${offset}, LimitPerPage: ${limitPerPage}`);
    console.log(`   OrderBy: ${orderByClause}`);
    console.log(`   Query: LIMIT ${limitPerPage} OFFSET ${offset}`);
    console.log(`🔍 FINAL QUERY CONDITIONS: ${JSON.stringify(conditions)}`);
    console.log(`🔍 FINAL QUERY PARAMS: ${JSON.stringify(params.slice(0, -2))}`); // Exclude limit/offset
    console.log(`🔍 WHERE CLAUSE: ${whereClause}`);
    console.log('Executing query...');
    const result = await pool.query(query, params);
    
    // For performance, skip socios query for large result sets
    const cnpjBasicos = result.rows.map(row => row.cnpj_basico).filter(Boolean);
    let sociosData = {};
    
    // Optimized socios fetch - limit per company for better performance on large queries
    if (cnpjBasicos.length > 0) {
      console.log(`Fetching socios data for ${cnpjBasicos.length} companies...`);
      // Ultra-aggressive limits for 50k queries to prevent timeout
      let maxSociosPerCompany = 5;
      let totalSociosLimit = 50000;
      
      if (companyLimit >= 50000) {
        maxSociosPerCompany = 1; // Only 1 socio per company for 50k+ queries  
        totalSociosLimit = 25000; // Max 25k total socios
      } else if (companyLimit >= 25000) {
        maxSociosPerCompany = 2; // Max 2 socios per company for 25k+ queries
        totalSociosLimit = 50000;
      }
      
      console.log(`📊 Max ${maxSociosPerCompany} socios per company, total limit: ${totalSociosLimit}`);
      
      // Ultra-fast query for large volumes - minimal processing
      const sociosQuery = companyLimit >= 50000 ? `
        SELECT 
          cnpj_basico,
          identificador_de_socio,
          nome_socio,
          qualificacao_socio
        FROM socios s
        WHERE cnpj_basico = ANY($1)
          AND nome_socio IS NOT NULL
          AND nome_socio != ''
        ORDER BY cnpj_basico, identificador_de_socio
        LIMIT $2
      ` : `
        SELECT DISTINCT ON (socios.cnpj_basico, socios.identificador_de_socio)
          socios.cnpj_basico,
          socios.identificador_de_socio,
          socios.nome_socio,
          socios.cnpj_cpf_socio,
          socios.qualificacao_socio,
          socios.data_entrada_sociedade,
          socios.pais,
          socios.representante_legal,
          socios.nome_representante,
          socios.qualificacao_representante_legal,
          socios.faixa_etaria
        FROM (
          SELECT *, ROW_NUMBER() OVER (PARTITION BY cnpj_basico ORDER BY identificador_de_socio) as rn
          FROM socios
          WHERE cnpj_basico = ANY($1)
          AND nome_socio IS NOT NULL
          AND nome_socio != ''
        ) socios
        WHERE rn <= $2
        ORDER BY socios.cnpj_basico, socios.identificador_de_socio
        LIMIT $3
      `;
      
      try {
        // Different parameters for optimized vs full query
        const queryParams = companyLimit >= 50000 
          ? [cnpjBasicos, totalSociosLimit] // Simple query: only array and limit
          : [cnpjBasicos, maxSociosPerCompany, totalSociosLimit]; // Full query: array, per-company limit, total limit
          
        const sociosResult = await pool.query(sociosQuery, queryParams);
        console.log(`📊 Found ${sociosResult.rows.length} socios records`);
        
        // Group socios by cnpj_basico - handle different query structures
        sociosResult.rows.forEach(socio => {
          if (!sociosData[socio.cnpj_basico]) {
            sociosData[socio.cnpj_basico] = [];
          }
          
          // For 50k+ queries (simplified structure) vs normal queries (full structure)
          const socioData = companyLimit >= 50000 ? {
            identificador: socio.identificador_de_socio || 1,
            nome: socio.nome_socio,
            cpf_cnpj: null, // Not available in fast query
            qualificacao: socio.qualificacao_socio,
            data_entrada: null, // Not available in fast query
            pais: null, // Not available in fast query
            representante_legal_cpf: null,
            representante_legal_nome: null,
            representante_legal_qualificacao: null,
            faixa_etaria: null
          } : {
            identificador: socio.identificador_de_socio,
            nome: socio.nome_socio,
            cpf_cnpj: socio.cnpj_cpf_socio,
            qualificacao: socio.qualificacao_socio,
            data_entrada: socio.data_entrada_sociedade,
            pais: socio.pais,
            representante_legal_cpf: socio.representante_legal,
            representante_legal_nome: socio.nome_representante,
            representante_legal_qualificacao: socio.qualificacao_representante_legal,
            faixa_etaria: socio.faixa_etaria
          };
          
          sociosData[socio.cnpj_basico].push(socioData);
        });
      } catch (sociosError) {
        console.log('⚠️ Socios query failed, continuing without socios data:', sociosError.message);
      }
    }
    
    const queryTime = Date.now() - startTime;
    console.log(`✅ Found ${result.rows.length} companies in ${queryTime}ms`);
    
    const companies = result.rows.map(row => ({
      // IDENTIFICAÇÃO
      cnpj: row.cnpj,
      cnpjBasico: row.cnpj_basico,
      cnpjOrdem: row.cnpj_ordem,
      cnpjDv: row.cnpj_dv,
      razaoSocial: row.razao_social || row.nome_fantasia || 'Não informado',
      nomeFantasia: cleanNomeFantasia(row.nome_fantasia),
      
      // SITUAÇÃO
      matrizFilial: row.matriz_filial === '1' ? 'Matriz' : row.matriz_filial === '2' ? 'Filial' : 'Não informado',
      situacaoCadastral: row.situacao_cadastral,
      situacaoDescricao: row.situacao_cadastral === '02' ? 'Ativa' : 
                        row.situacao_cadastral === '08' ? 'Baixada' : 
                        row.situacao_cadastral === '04' ? 'Inapta' : 'Outros',
      dataSituacao: row.data_situacao_cadastral,
      motivoSituacao: row.motivo_situacao_cadastral,
      motivoDescricao: row.motivo_descricao,
      dataInicioAtividades: row.data_inicio_atividades,
      situacaoEspecial: row.situacao_especial,
      dataSituacaoEspecial: row.data_situacao_especial,
      
      // ATIVIDADE ECONÔMICA
      cnaePrincipal: row.cnae_fiscal,
      cnaeDescricao: row.cnae_fiscal || 'Não informado',
      cnaeSecundaria: row.cnae_fiscal_secundaria,
      
      // ENDEREÇO COMPLETO
      tipoLogradouro: row.tipo_logradouro,
      logradouro: row.logradouro,
      numero: row.numero,
      complemento: row.complemento,
      bairro: row.bairro,
      cep: row.cep,
      uf: row.uf,
      municipio: row.municipio,
      municipioDescricao: row.municipio_descricao,
      
      // CONTATOS
      ddd1: row.ddd1,
      telefone1: row.telefone1,
      ddd2: row.ddd2,
      telefone2: row.telefone2,
      dddFax: row.ddd_fax,
      fax: row.fax,
      email: row.correio_eletronico,
      
      // DADOS DA EMPRESA
      naturezaJuridica: row.natureza_juridica,
      naturezaJuridicaDescricao: row.natureza_juridica || 'Não informado',
      qualificacaoResponsavel: row.qualificacao_responsavel,
      qualificacaoResponsavelDescricao: row.qualificacao_responsavel || 'Não informado',
      porteEmpresa: row.porte_empresa,
      porteDescricao: row.porte_empresa === '01' ? 'Microempresa' :
                     row.porte_empresa === '03' ? 'Empresa de Pequeno Porte' :
                     row.porte_empresa === '05' ? 'Demais' : 'Não informado',
      enteFederativoResponsavel: row.ente_federativo_responsavel,
      capitalSocial: row.capital_social ? parseFloat(row.capital_social) : null,
      
      // SIMPLES NACIONAL / MEI - Include all data as requested
      opcaoSimples: row.opcao_simples,
      dataOpcaoSimples: row.data_opcao_simples,
      dataExclusaoSimples: row.data_exclusao_simples,
      opcaoMei: row.opcao_mei,
      dataOpcaoMei: row.data_opcao_mei,
      dataExclusaoMei: row.data_exclusao_mei,
      
      // SÓCIOS E ADMINISTRADORES
      socios: sociosData[row.cnpj_basico] || [],
      quantidadeSocios: sociosData[row.cnpj_basico] ? sociosData[row.cnpj_basico].length : 0
    }));
    
    const countQuery = `SELECT COUNT(*) as total FROM estabelecimento est ${whereClause}`;
    const countParams = params.slice(0, -2);
    const countResult = await pool.query(countQuery, countParams);
    const totalCompanies = parseInt(countResult.rows[0].total);
    
    res.json({
      success: true,
      data: companies,
      pagination: {
        currentPage: page,
        totalCompanies: Math.min(totalCompanies, companyLimit),
        totalAvailable: totalCompanies,
        totalPages: Math.ceil(Math.min(totalCompanies, companyLimit) / perPage),
        companiesPerPage: perPage,
        requestedLimit: companyLimit,
        hasNextPage: (page * perPage) < Math.min(totalCompanies, companyLimit),
        hasPreviousPage: page > 1
      },
      performance: {
        queryTimeMs: queryTime,
        resultsCount: companies.length
      }
    });
    
  } catch (error) {
    const queryTime = Date.now() - startTime;
    console.error('❌ Search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro na busca de empresas',
      error: error.message,
      queryTimeMs: queryTime
    });
  }
});

// Get total company count with filters (without returning data)
app.post('/api/companies/count', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { uf, segmentoNegocio, situacaoCadastral, porteEmpresa } = req.body;
    
    let whereConditions = ['1=1'];
    let queryParams = [];
    let paramCount = 0;

    // UF filter
    if (uf && uf.trim() !== '') {
      paramCount++;
      whereConditions.push(`e.uf = $${paramCount}`);
      queryParams.push(uf.trim());
    }

    // Business segment filter (CNAE mapping)
    if (segmentoNegocio) {
      const segmentCnaes = getSegmentCnaes(segmentoNegocio);
      if (segmentCnaes.length > 0) {
        const placeholders = segmentCnaes.map((_, index) => `$${paramCount + index + 1}`).join(',');
        whereConditions.push(`e.cnae_fiscal_principal IN (${placeholders})`);
        queryParams.push(...segmentCnaes);
        paramCount += segmentCnaes.length;
      }
    }

    // Build count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM empresa e
      WHERE ${whereConditions.join(' AND ')}
    `;

    console.log('🔍 Count query:', countQuery);
    console.log('📊 Parameters:', queryParams);

    const countResult = await pool.query(countQuery, queryParams);
    const totalCompanies = parseInt(countResult.rows[0].total);
    const queryTime = Date.now() - startTime;

    console.log(`📊 Total companies found: ${totalCompanies.toLocaleString()}`);

    res.json({
      success: true,
      totalCompanies,
      filters: {
        uf: uf || null,
        segmentoNegocio: segmentoNegocio || null,
        situacaoCadastral: situacaoCadastral || null,
        porteEmpresa: porteEmpresa || null
      },
      queryTimeMs: queryTime
    });

  } catch (error) {
    const queryTime = Date.now() - startTime;
    console.error('❌ Count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao contar empresas',
      error: error.message,
      queryTimeMs: queryTime
    });
  }
});

// Serve React frontend in production
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    }
  });
}

// DEBUG: Update user password (temporary)
app.post('/api/debug/update-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    const result = await pool.query(`
      UPDATE simple_users 
      SET password = $1 
      WHERE email = $2
      RETURNING id, email
    `, [hashedPassword, email]);
    
    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Usuário não encontrado' });
    }
    
    res.json({
      success: true,
      message: 'Senha atualizada com sucesso',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Update password error:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// DEBUG: Check user info (temporary)
app.post('/api/debug/check-user', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT id, email, password FROM simple_users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Usuário não encontrado' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        passwordHash: user.password.substring(0, 20) + '...',
        passwordValid: validPassword
      }
    });
    
  } catch (error) {
    console.error('❌ Check user error:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Update user name endpoint
app.put('/api/user/update-name', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Nome é obrigatório' });
    }
    
    const result = await pool.query(
      'UPDATE simple_users SET name = $1 WHERE id = $2 RETURNING id, email, name',
      [name.trim(), userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    
    res.json({
      success: true,
      message: 'Nome atualizado com sucesso',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Update user name error:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// DEBUG: Working login endpoint (temporary)
app.post('/api/debug/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT id, email, password, name FROM simple_users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Usuário não encontrado' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.json({ success: false, message: 'Senha incorreta' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
    
  } catch (error) {
    console.error('❌ Debug login error:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

Promise.all([initDB(), createUsersTable()]).then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('✅ Company search: 1000-50000 companies');
    console.log('✅ Database: Railway PostgreSQL');
    console.log('✅ Authentication: Email verification enabled');
    console.log('🎯 FIXED: 20 business segments + all states');
    if (process.env.NODE_ENV === 'production') {
      console.log('✅ Frontend: Serving React from /frontend/dist');
    }
  });
});

// Generate tokens for all users in database
app.get('/api/admin/generate-tokens', async (req, res) => {
  try {
    // Get all users from both tables
    const usersQuery = await pool.query('SELECT id, email FROM users WHERE email IS NOT NULL');
    const simpleUsersQuery = await pool.query('SELECT id, email FROM simple_users WHERE email IS NOT NULL');
    
    const allUsers = [...usersQuery.rows, ...simpleUsersQuery.rows];
    console.log(`🔑 Generating tokens for ${allUsers.length} users...`);
    
    const tokens = [];
    
    for (const user of allUsers) {
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      tokens.push({
        userId: user.id,
        email: user.email,
        token: token
      });
    }
    
    console.log(`✅ Generated ${tokens.length} tokens successfully`);
    
    res.json({
      success: true,
      message: `Generated tokens for ${tokens.length} users`,
      tokens: tokens
    });
    
  } catch (error) {
    console.error('❌ Error generating tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar tokens',
      error: error.message
    });
  }
});
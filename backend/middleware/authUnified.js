const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

/**
 * Middleware de autenticação JWT unificado
 * Resolve problemas de inconsistência e tokens expirados
 */
const authenticateToken = (req, res, next) => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acesso requerido',
        code: 'NO_TOKEN'
      });
    }

    // Verificar e decodificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Adicionar informações do usuário na request
    req.user = decoded;
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    // Tratamento específico para diferentes tipos de erro
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED',
        needsRefresh: true
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'NotBeforeError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token ainda não é válido',
        code: 'TOKEN_NOT_ACTIVE'
      });
    }

    return res.status(401).json({ 
      success: false, 
      message: 'Erro de autenticação',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Gerar token JWT com configurações padronizadas
 */
const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
    issuer: 'empresas-brasil',
    audience: 'web-app'
  });
};

/**
 * Verificar token JWT
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

/**
 * Middleware opcional - não bloqueia se não há token
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      req.userId = decoded.id;
      req.userEmail = decoded.email;
      req.userRole = decoded.role;
    } catch (error) {
      // Ignora erro de token inválido em auth opcional
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};

module.exports = {
  authenticateToken,
  generateToken,
  verifyToken,
  optionalAuth,
  JWT_SECRET
};
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const User = require('../models/User');

module.exports = function createCheckUserAccess(pool) {
  return async function checkUserAccess(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'Token de autorização necessário', needsSubscription: true });
      }

      const decodedToken = jwt.verify(token, JWT_SECRET);

      if (!decodedToken || !decodedToken.email) {
        return res.status(401).json({ error: 'Token inválido', needsSubscription: true });
      }

      let userResult = await pool.query(
        'SELECT id, role FROM simple_users WHERE email = $1',
        [decodedToken.email]
      );

      if (userResult.rows.length === 0) {
        userResult = await pool.query(
          'SELECT id, COALESCE(role, \'trial\') as role FROM users WHERE email = $1',
          [decodedToken.email]
        );
      }

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'Usuário não encontrado', needsSubscription: true });
      }

      const userId = userResult.rows[0].id;
      const userRole = userResult.rows[0].role;

      req.userId = userId;
      req.userEmail = decodedToken.email;
      req.userRole = userRole;

      if (userRole === 'admin') {
        req.userAccess = { hasAccess: true, reason: 'admin' };
        next();
        return;
      }

      // Check if the user still has access (trial/subscription)
      let accessCheck;
      try {
        accessCheck = await User.checkUserAccess(userId);
        console.log('🔐 Middleware access check:', accessCheck);
      } catch (error) {
        console.error('❌ Middleware access check error:', error);
        return res.status(500).json({ error: 'Erro interno na verificação de acesso' });
      }

      if (!accessCheck?.hasAccess) {
        if (accessCheck?.reason === 'trial_expired') {
          return res.status(403).json({
            error: 'Seu período de trial de 7 dias expirou. Para continuar usando o sistema, assine um dos nossos planos.',
            needsSubscription: true,
            trialExpired: true
          });
        }

        return res.status(401).json({
          error: 'Acesso negado',
          needsSubscription: true,
          accessReason: accessCheck?.reason || 'access_denied'
        });
      }

      req.userAccess = accessCheck;

      next();
    } catch (error) {
      console.error('Error checking user access:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token inválido', needsSubscription: true });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado', needsSubscription: true });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

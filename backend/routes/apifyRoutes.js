const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const User = require('../models/User');

module.exports = function createApifyRoutes({ pool, apifyClient, apifyConfig }) {
  const router = express.Router();
  const { apiKey, baseUrl } = apifyConfig;

  router.get('/actors', async (req, res) => {
    try {
      const response = await axios.get(`${baseUrl}/acts`, {
        params: { token: apiKey, limit: 100 }
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

  router.post('/run/:actorId', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de acesso requerido' });
      }

      const token = authHeader.substring(7);
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      console.log('🔍 Checking user access for Apify run, user ID:', decoded.id);
      let accessCheck;
      try {
        accessCheck = await User.checkUserAccess(decoded.id);
        console.log('🔍 Access check result:', accessCheck);
      } catch (error) {
        console.error('❌ Error during access check:', error);
        return res.status(500).json({ error: 'Erro interno na verificação de acesso' });
      }

      if (!accessCheck || !accessCheck.hasAccess) {
        console.log('❌ Access denied:', accessCheck?.reason || 'unknown');
        if (accessCheck?.reason === 'trial_expired') {
          return res.status(403).json({
            error: 'Seu período de trial de 7 dias expirou. Para continuar usando o sistema, assine um dos nossos planos.',
            needsSubscription: true,
            trialExpired: true
          });
        }
        return res.status(401).json({ error: 'Acesso negado', needsSubscription: true });
      }

      console.log('✅ Access granted, proceeding to credit check');

      const { actorId } = req.params;
      let inputData = req.body;

      let searchType = 'google_maps';
      let requiredCredits = 1;

      if (actorId.includes('linkedin') || actorId === 'ghost-genius/linkedin-search') {
        searchType = 'linkedin';
        requiredCredits = 50;
      } else if (actorId.includes('instagram')) {
        searchType = 'instagram';
        requiredCredits = 10;
      } else if (actorId.includes('google') || actorId.includes('places') || actorId.includes('maps') || actorId === 'nwua9Gu5YrADL7ZDj' || actorId === 'compass~crawler-google-places') {
        searchType = 'google_maps';
        requiredCredits = 10;
      }

      console.log(`🎯 Search type: ${searchType}, Credits required: ${requiredCredits}`);

      const creditsResult = await pool.query(`
        SELECT * FROM user_credits WHERE user_id = $1
      `, [decoded.id]);

      if (creditsResult.rows.length === 0) {
        return res.status(400).json({ error: 'Conta de créditos não encontrada' });
      }

      const currentCredits = creditsResult.rows[0].credits;

      if (currentCredits < requiredCredits) {
        return res.status(400).json({
          error: 'Créditos insuficientes para realizar a busca',
          currentCredits,
          requiredCredits
        });
      }

      const newCredits = currentCredits - requiredCredits;
      await pool.query(`
        UPDATE user_credits SET credits = $1, updated_at = SYSDATETIME() WHERE user_id = $2
      `, [newCredits, decoded.id]);

      await pool.query(`
        INSERT INTO credit_usage_log (user_id, search_type, credits_used, search_query, timestamp)
        VALUES ($1, $2, $3, $4, SYSDATETIME())
      `, [decoded.id, searchType, requiredCredits, JSON.stringify({ actorId, ...inputData })]);

      console.log(`💳 Debited ${requiredCredits} credits from user ${decoded.id}, remaining: ${newCredits}`);

      if (actorId === 'compass~crawler-google-places' || actorId === 'nwua9Gu5YrADL7ZDj') {
        const maxPlaces = parseInt(inputData.maxCrawledPlacesPerSearch || inputData.maxResults) || 50;

        inputData = {
          ...inputData,
          maxCrawledPlacesPerSearch: maxPlaces,
          maxConcurrency: Math.min(3, inputData.maxConcurrency || 3),
          proxyConfiguration: inputData.proxyConfiguration || { useApifyProxy: true }
        };
      }

      if (!apifyClient) {
        return res.status(500).json({
          success: false,
          message: 'Apify client não configurado. Configure APIFY_API_KEY.'
        });
      }

      const run = await apifyClient.actor(actorId).call(inputData);

      console.log('🏃 Apify run started:', run.id);

      res.json({
        success: true,
        runId: run.id,
        status: run.status,
        taskId: run.actId,
        message: 'Actor iniciado com sucesso'
      });

    } catch (error) {
      console.error('❌ Apify run error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  router.get('/runs/:runId', async (req, res) => {
    try {
      const { runId } = req.params;

      if (!apifyClient) {
        return res.status(500).json({
          success: false,
          message: 'Apify client não configurado.'
        });
      }

      const runDetails = await apifyClient.run(runId).get();

      if (!runDetails) {
        return res.status(404).json({
          success: false,
          message: 'Run não encontrado'
        });
      }

      if (runDetails.defaultDatasetId) {
        const { items } = await apifyClient.dataset(runDetails.defaultDatasetId).listItems();

        res.json({
          success: true,
          runDetails,
          resultCount: items.length,
          firstResult: items[0] || null
        });
      } else {
        res.json({
          success: true,
          runDetails,
          resultCount: 0
        });
      }
    } catch (error) {
      console.error('❌ Apify run status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno ao buscar status do run'
      });
    }
  });

  router.get('/featured', async (req, res) => {
    try {
      const response = await axios.get(`${baseUrl}/acts`, {
        params: {
          token: apiKey,
          limit: 5,
          offset: 0,
          orderBy: 'totalRuns'
        }
      });

      res.json({
        success: true,
        actors: response.data.data.items
      });
    } catch (error) {
      console.error('Apify featured error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching featured actors',
        error: error.message
      });
    }
  });

  router.get('/test', async (req, res) => {
    try {
      const connectionTest = await axios.get(`${baseUrl}/acts`, {
        params: { token: apiKey, limit: 1 }
      });

      let googlePlacesActor = null;
      try {
        const actorResponse = await axios.get(`${baseUrl}/acts/compass~crawler-google-places`, {
          params: { token: apiKey }
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
        apiKey: apiKey ? 'Configured' : 'Missing'
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

  return router;
};

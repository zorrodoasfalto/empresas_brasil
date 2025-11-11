const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const User = require('../models/User');

module.exports = function createInstagramRoutes({ pool, apifyClient, checkUserAccess }) {
  const router = express.Router();

  router.get('/analyze-run/:runId', checkUserAccess, async (req, res) => {
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

  router.post('/scrape', async (req, res) => {
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

      console.log('🔍 Checking user access for Instagram search, user ID:', decoded.id);
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

      const creditsResult = await pool.query(`
        SELECT * FROM user_credits WHERE user_id = $1
      `, [decoded.id]);

      if (creditsResult.rows.length === 0) {
        return res.status(400).json({ error: 'Conta de créditos não encontrada' });
      }

      const currentCredits = creditsResult.rows[0].credits;
      const requiredCredits = 10;

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
      `, [decoded.id, 'instagram', requiredCredits, JSON.stringify(req.body)]);

      console.log(`💳 Debited ${requiredCredits} credits from user ${decoded.id}, remaining: ${newCredits}`);

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

      const cleanKeyword = Buffer.from(keyword, 'utf8').toString('utf8').trim();
      console.log('🔍 Instagram email scraping OTIMIZADO with Apify:', {
        original: keyword,
        cleaned: cleanKeyword,
        originalBytes: Buffer.from(keyword).toString('hex'),
        cleanedBytes: Buffer.from(cleanKeyword).toString('hex')
      });

      const input = {
        keyword: cleanKeyword,
        pagesToScrape: 20,
        scrapeGmail: true,
        scrapeYahoo: true,
        scrapeOutlook: true
      };

      console.log('📤 Sending OPTIMIZED input to Apify Instagram Email Scraper:', input);

      const run = await apifyClient.actor('Snxs770Onv5Vh0P1P').call(input);

      console.log('🏃 Apify run started:', run.id);

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

  router.get('/progress/:runId', async (req, res) => {
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

      console.log(`📊 Run ${runId} status: ${runDetails.status}`);

      if (runDetails.status === 'SUCCEEDED') {
        const { items } = await apifyClient.dataset(runDetails.defaultDatasetId).listItems();

        console.log(`🔍 DEBUG: Total items from Apify dataset: ${items.length}`);
        console.log('🔍 DEBUG: First few items structure:', JSON.stringify(items.slice(0, 3), null, 2));

        const itemsWithEmail = items.filter(item => item.email);
        console.log(`🔍 DEBUG: Items with email field: ${itemsWithEmail.length}`);

        if (items.length > 0) {
          const allFields = new Set();
          items.forEach(item => {
            Object.keys(item).forEach(key => allFields.add(key));
          });
          console.log('🔍 DEBUG: All available fields in items:', Array.from(allFields).sort());
        }

        const isCodeLikeUsername = (username) => {
          if (!username) return false;

          const cleanUsername = username.replace('@', '');

          if (cleanUsername.length < 4 || cleanUsername.length > 30) return true;

          const vowels = 'aeiouAEIOU';
          const numbers = '0123456789';

          let vowelCount = 0;
          let numberCount = 0;
          let consonantCount = 0;

          for (let char of cleanUsername) {
            if (vowels.includes(char)) {
              vowelCount++;
            } else if (numbers.includes(char)) {
              numberCount++;
            } else if (/[a-zA-Z]/.test(char)) {
              consonantCount++;
            }
          }

          const totalLetters = vowelCount + consonantCount;
          const numberRatio = numberCount / cleanUsername.length;
          const vowelRatio = totalLetters > 0 ? vowelCount / totalLetters : 0;

          if (numberRatio > 0.5) return true;
          if (totalLetters > 3 && vowelRatio < 0.15) return true;

          const hasRandomPattern = /^[A-Z][a-z][A-Z].*[0-9][A-Z].*[a-z]/.test(cleanUsername) ||
                                  /^[a-zA-Z]*[0-9][a-zA-Z]*[0-9]/.test(cleanUsername) && vowelRatio < 0.2;

          return hasRandomPattern;
        };

        const processedResults = items
          .filter(item => item.email || item.Email)
          .filter(item => {
            const url = item.url || item.link || item.profileUrl || item.profile_url;
            let extractedUsername = item.username || item.Username;

            if (!extractedUsername && url) {
              const urlParts = url.split('/').filter(part => part);
              if (urlParts.length > 0) {
                extractedUsername = urlParts[urlParts.length - 1];
              }
            }

            if (isCodeLikeUsername(extractedUsername)) {
              console.log(`🚫 Filtered out code-like username: ${extractedUsername}`);
              return false;
            }

            return true;
          })
          .map(item => {
            const url = item.url || item.link || item.profileUrl || item.profile_url;
            let extractedUsername = item.username || item.Username;

            if (!extractedUsername && url) {
              const urlParts = url.split('/').filter(part => part);
              if (urlParts.length > 0) {
                extractedUsername = '@' + urlParts[urlParts.length - 1];
              }
            }

            return {
              username: extractedUsername || '',
              fullName: item.fullName || item.full_name || item.name || item.Name || '',
              email: item.email || item.Email,
              url: url,
              biography: item.biography || item.bio || item.description,
              externalUrl: item.externalUrl || item.external_url || item.website,
              followersCount: item.followersCount || item.followers_count || item.followers,
              followingCount: item.followingCount || item.following_count || item.following,
              postsCount: item.postsCount || item.posts_count || item.posts,
              isVerified: item.isVerified || item.is_verified || false,
              isPrivate: item.isPrivate || item.is_private || false,
              businessCategoryName: item.businessCategoryName || item.business_category,
              profilePicUrl: item.profilePicUrl || item.profile_pic_url || item.avatar
            };
          });

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
        const startedAt = new Date(runDetails.startedAt);
        const now = new Date();
        const elapsed = now - startedAt;

        let progress = 0;
        let message = 'Iniciando busca no Instagram...';

        if (elapsed < 5000) {
          progress = Math.round((elapsed / 5000) * 15);
          message = '🔍 Conectando ao Instagram...';
        } else if (elapsed < 10000) {
          progress = 15 + Math.round(((elapsed - 5000) / 5000) * 25);
          message = '📱 Analisando perfis do Instagram...';
        } else if (elapsed < 20000) {
          progress = 40 + Math.round(((elapsed - 10000) / 10000) * 35);
          message = '📧 Extraindo emails dos perfis...';
        } else {
          progress = 75 + Math.round(((elapsed - 20000) / 10000) * 20);
          progress = Math.min(progress, 95);
          message = '⏳ Finalizando coleta de dados...';
        }

        res.json({
          success: true,
          status: runDetails.status,
          progress: progress,
          message: message
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

  return router;
};

const express = require('express');
const jwt = require('jsonwebtoken');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe = null;

if (stripeSecretKey) {
  try {
    stripe = require('stripe')(stripeSecretKey);
  } catch (error) {
    console.error('❌ Failed to initialize Stripe SDK:', error.message);
  }
} else {
  console.warn('⚠️ STRIPE_SECRET_KEY not configured - Stripe routes will return 503');
}
const { Pool } = require('pg');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe = null;

if (stripeSecretKey) {
  try {
    stripe = require('stripe')(stripeSecretKey);
  } catch (error) {
    console.error('❌ Failed to initialize Stripe SDK:', error.message);
  }
} else {
  console.warn('⚠️ STRIPE_SECRET_KEY not configured - Stripe routes will return 503');
}
const { Pool } = require('../utils/sqlServerPool');

// Database connection usando SQL Server
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    process.env.SQLSERVER_URL ||
    'sqlserver://sa:YourStrong!Passw0rd@localhost:1433/empresas_brasil?encrypt=false&trustServerCertificate=true'
});

const router = express.Router();

router.use((req, res, next) => {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Integração com Stripe desativada. Defina STRIPE_SECRET_KEY para habilitar.'
    });
  }
  return next();
});

router.use((req, res, next) => {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Integração com Stripe desativada. Defina STRIPE_SECRET_KEY para habilitar.'
    });
  }
  return next();
});
const { JWT_SECRET } = require('../config/jwt');

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Plan configuration
const PLANS = {
  pro: {
    name: 'Plano Pro',
    priceId: null, // Temporário: usar price_data até configurar price IDs ativos
    price: 9700, // R$ 97.00 in cents
    credits: 50, // Créditos mensais do plano
    interval: 'month'
  },
  premium: {
    name: 'Plano Premium', 
    priceId: null, // Temporário: usar price_data até configurar price IDs ativos
    price: 14700, // R$ 147.00 in cents
    credits: 150, // Créditos mensais do plano
    interval: 'month'
  },
  max: {
    name: 'Plano Max',
    priceId: null, // Forçar price_data para evitar problemas em produção
    price: 24700, // R$ 247.00 in cents
    credits: 300, // Créditos mensais do plano
    interval: 'month'
  }
};

// Generate affiliate code
async function generateAffiliateCode(userId) {
  try {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let affiliateCode = '';
    for (let i = 0; i < 8; i++) {
      affiliateCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    console.log(`🔄 Tentando inserir afiliado - UserID: ${userId}, Code: ${affiliateCode}`);

    await pool.query(
      `INSERT INTO affiliates (user_id, affiliate_code) 
       VALUES ($1, $2)`,
      [userId, affiliateCode]
    );

    console.log(`✅ Código de afiliado inserido com sucesso: ${affiliateCode}`);
    return affiliateCode;
  } catch (error) {
    console.error('❌ Erro ao gerar código de afiliado:', error.message);
    console.error('Error details:', error);
    
    // Se o erro for de chave duplicada, tenta novamente
    if (error.code === '23505') { // duplicate key error
      console.log('🔄 Código duplicado, tentando novamente...');
      return generateAffiliateCode(userId);
    }
    
    return null;
  }
}

// Check for referral tracking
async function checkReferralTracking(referredUserId, affiliateCode) {
  try {
    if (!affiliateCode) {
      console.log('❌ No affiliate code provided');
      return null;
    }

    console.log('🔍 Looking for affiliate code in DB:', affiliateCode);
    const affiliateResult = await pool.query(
      'SELECT id, user_id FROM affiliates WHERE affiliate_code = $1',
      [affiliateCode]
    );

    if (affiliateResult.rows.length === 0) {
      console.log('❌ Affiliate code not found in database:', affiliateCode);
      return null;
    }

    const affiliate = affiliateResult.rows[0];
    console.log('✅ Found affiliate:', affiliate.id, 'belonging to user:', affiliate.user_id);
    
    if (affiliate.user_id === referredUserId) {
      console.log('❌ User trying to refer themselves - blocked');
      return null; // Can't refer yourself
    }

    console.log('✅ Valid referral! Affiliate ID:', affiliate.id);
    return affiliate.id;
  } catch (error) {
    console.error('Error checking referral:', error);
    return null;
  }
}

// DEBUG: Who am I endpoint
router.get('/debug-user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    // Get full user info
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
      [userId]
    );
    
    // Check if user is affiliate
    const affiliateResult = await pool.query(
      'SELECT affiliate_code FROM affiliates WHERE user_id = $1',
      [userId]
    );
    
    const user = userResult.rows[0];
    
    res.json({
      debug: {
        userId: userId,
        email: userEmail,
        name: user ? `${user.first_name} ${user.last_name}`.trim() : 'Unknown',
        role: user ? user.role : 'Unknown',
        isVictor: userId === 39,
        affiliateCode: affiliateResult.rows[0]?.affiliate_code || null,
        victorsCode: 'VICT039',
        canUseVictorsCode: userId !== 39,
        message: userId === 39 ? '❌ Victor cannot use his own affiliate code VICT039!' : '✅ Can use affiliate codes including VICT039'
      }
    });
    
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { planType = 'pro', affiliateCode } = req.body;
    const userId = req.user.id;
    
    console.log('🔍 CHECKOUT DEBUG - User ID:', userId, 'Plan:', planType, 'Affiliate Code:', affiliateCode);

    // Validate plan
    if (!PLANS[planType]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plano inválido' 
      });
    }

    const plan = PLANS[planType];
    let discountAmount = 0;
    let affiliateId = null;

    // Check for referral discount
    if (affiliateCode) {
      console.log('🎯 Checking referral tracking for code:', affiliateCode);
      affiliateId = await checkReferralTracking(userId, affiliateCode);
      if (affiliateId) {
        discountAmount = Math.round(plan.price * 0.1); // 10% discount
        console.log('✅ Discount applied! Amount:', discountAmount, 'cents');
      } else {
        console.log('❌ No valid referral found for code:', affiliateCode);
      }
    }

    // Create or retrieve customer
    const customer = await stripe.customers.create({
      email: req.user.email,
      metadata: {
        user_id: userId.toString(),
        affiliate_code: affiliateCode || '',
        affiliate_id: affiliateId ? affiliateId.toString() : ''
      }
    });

    // Create line item - force price_data for Max plan to avoid production issues
    let lineItem;
    if (plan.priceId && planType !== 'max') {
      // Use priceId for Pro and Premium
      lineItem = {
        price: plan.priceId,
        quantity: 1,
      };
    } else {
      // Use price_data for Max plan or plans without priceId
      lineItem = {
        price_data: {
          currency: 'brl',
          product_data: {
            name: plan.name,
            description: `Acesso completo ao ${plan.name} - Consultas ilimitadas de empresas brasileiras`
          },
          unit_amount: plan.price,
          recurring: {
            interval: 'month'
          }
        },
        quantity: 1,
      };
    }

    // Create checkout session
    const sessionData = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [lineItem],
      customer: customer.id,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:4001'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:4001'}/checkout?canceled=true`,
      subscription_data: {
        metadata: {
          plan_type: planType,
          user_id: userId.toString()
        }
      },
      metadata: {
        user_id: userId.toString(),
        plan_type: planType,
        affiliate_id: affiliateId ? affiliateId.toString() : '',
        affiliate_code: affiliateCode || ''
      }
    };

    // Add discount if applicable
    if (discountAmount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: discountAmount,
        currency: 'brl',
        duration: 'forever'
      });
      sessionData.discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    // Store session info temporarily
    await pool.query(
      `INSERT INTO subscriptions (user_id, stripe_customer_id, plan_type, status) 
       VALUES ($1, $2, $3, 'pending')`,
      [userId, customer.id, planType]
    );

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar sessão de pagamento',
      error: error.message
    });
  }
});

// Force create affiliate code (temporary debug route)
router.post('/force-affiliate-code', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`🔧 Forçando criação de código de afiliado para usuário ${userId}...`);
    
    // Primeiro, verifica se já existe
    const existingAffiliate = await pool.query(
      'SELECT * FROM affiliates WHERE user_id = $1',
      [userId]
    );
    
    if (existingAffiliate.rows.length > 0) {
      console.log('📋 Código já existe:', existingAffiliate.rows[0]);
      return res.json({
        success: true,
        message: 'Código já existe',
        code: existingAffiliate.rows[0].affiliate_code
      });
    }
    
    // Se não existe, cria um novo
    const code = await generateAffiliateCode(userId);
    if (code) {
      console.log(`✅ Código criado com sucesso: ${code}`);
      res.json({
        success: true,
        message: 'Código criado com sucesso',
        code: code
      });
    } else {
      throw new Error('Falha na geração do código');
    }
    
  } catch (error) {
    console.error('❌ Erro ao forçar criação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar código de afiliado',
      error: error.message
    });
  }
});

// Get affiliate status
router.get('/affiliate-status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get or create affiliate data
    let affiliateResult = await pool.query(
      'SELECT * FROM affiliates WHERE user_id = $1',
      [userId]
    );

    let affiliate = affiliateResult.rows[0];
    
    if (!affiliate) {
      // Generate affiliate code for user (including admins)
      console.log(`🔄 Criando código de afiliado para usuário ${userId}...`);
      const code = await generateAffiliateCode(userId);
      console.log(`✅ Código de afiliado criado: ${code}`);
      
      if (code) {
        affiliateResult = await pool.query(
          'SELECT * FROM affiliates WHERE user_id = $1',
          [userId]
        );
        affiliate = affiliateResult.rows[0];
        console.log(`📋 Dados de afiliado recuperados:`, affiliate);
      } else {
        console.log('❌ Falha ao criar código de afiliado');
        // Força criação manual se falhou
        try {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let affiliateCode = 'ADMIN';
          for (let i = 0; i < 4; i++) {
            affiliateCode += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          
          await pool.query(
            `INSERT INTO affiliates (user_id, affiliate_code) VALUES ($1, $2)`,
            [userId, affiliateCode]
          );
          
          affiliateResult = await pool.query(
            'SELECT * FROM affiliates WHERE user_id = $1',
            [userId]
          );
          affiliate = affiliateResult.rows[0];
          console.log(`🛠️ Código de afiliado criado manualmente:`, affiliate);
        } catch (manualError) {
          console.error('❌ Erro na criação manual:', manualError);
        }
      }
    }

    // Get referral stats
    const referralStats = await pool.query(`
      SELECT 
        COUNT(*) as total_referrals,
        COALESCE(SUM(monthly_commission), 0) as total_commissions
      FROM affiliate_referrals 
      WHERE affiliate_id = $1 AND status = 'active'
    `, [affiliate?.id]);

    const stats = referralStats.rows[0] || { total_referrals: 0, total_commissions: 0 };

    // Get monthly commissions
    const monthlyCommissions = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as monthly_amount
      FROM affiliate_commissions 
      WHERE affiliate_id = $1 AND commission_month = DATE_TRUNC('month', CURRENT_DATE)
    `, [affiliate?.id]);

    const monthlyAmount = monthlyCommissions.rows[0]?.monthly_amount || 0;

    // Get pending withdrawals
    const pendingWithdrawals = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as pending_amount
      FROM affiliate_withdrawals 
      WHERE affiliate_id = $1 AND status = 'pending'
    `, [affiliate?.id]);

    const pendingAmount = pendingWithdrawals.rows[0]?.pending_amount || 0;

    res.json({
      success: true,
      code: affiliate?.affiliate_code || null,
      totalReferrals: parseInt(stats.total_referrals),
      totalCommissions: parseInt(stats.total_commissions),
      monthlyCommissions: parseInt(monthlyAmount),
      pendingWithdrawals: parseInt(pendingAmount)
    });

  } catch (error) {
    console.error('Error getting affiliate status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados de afiliado',
      error: error.message
    });
  }
});

// Stripe webhook (raw body middleware aplicado no server.js)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  // Check if webhook secret is configured
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ 
      error: 'Webhook secret not configured',
      received: false 
    });
  }

  // Check if signature header exists
  if (!sig) {
    console.error('❌ Missing stripe-signature header');
    return res.status(400).json({ 
      error: 'Missing stripe-signature header',
      received: false 
    });
  }

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('✅ Webhook signature verified successfully, event type:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    console.error('- Signature received:', sig?.substring(0, 50) + '...');
    console.error('- Body type:', typeof req.body);
    console.error('- Body length:', req.body?.length || 'undefined');
    
    // In production, return 200 even for invalid signatures to prevent Stripe from disabling webhook
    // This acknowledges receipt but logs the error for investigation
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 PRODUCTION: Returning 200 for invalid signature to prevent webhook disabling');
      return res.status(200).json({ 
        received: true,
        error: 'Invalid signature - logged for review',
        debug: false
      });
    }
    
    // In development, return 400 for proper debugging
    return res.status(400).json({ 
      error: 'Invalid signature',
      received: false,
      debug: true
    });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Always return 200 for successful webhook processing
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Log error but still return 200 to acknowledge receipt
    // Stripe requires 200-299 status codes to consider webhook delivered
    res.status(200).json({ 
      received: true, 
      error: 'Internal processing error - logged for review' 
    });
  }
});

// Handle checkout completion
async function handleCheckoutCompleted(session) {
  const userId = parseInt(session.metadata.user_id);
  const planType = session.metadata.plan_type;
  const affiliateId = session.metadata.affiliate_id ? parseInt(session.metadata.affiliate_id) : null;
  
  // Get subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  // Update subscription record
  await pool.query(`
    UPDATE subscriptions 
    SET stripe_subscription_id = $1, stripe_price_id = $2, status = 'active',
        current_period_start = $3, current_period_end = $4, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $5
  `, [
    subscription.id,
    subscription.items.data[0].price.id,
    new Date(subscription.current_period_start * 1000),
    new Date(subscription.current_period_end * 1000),
    userId
  ]);

  // Add credits for the new subscription
  const plan = PLANS[planType];
  if (plan && plan.credits) {
    console.log(`🎯 Adding ${plan.credits} credits to user ${userId} for plan ${planType}`);
    
    // Check if user already has credits record
    const existingCredits = await pool.query(
      'SELECT credits FROM user_credits WHERE user_id = $1',
      [userId]
    );
    
    if (existingCredits.rows.length > 0) {
      // Update existing credits (add to current balance)
      await pool.query(
        'UPDATE user_credits SET credits = credits + $1, plan = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3',
        [plan.credits, planType, userId]
      );
      console.log(`✅ Added ${plan.credits} credits to existing balance for user ${userId}`);
    } else {
      // Create new credits record
      await pool.query(
        'INSERT INTO user_credits (user_id, credits, plan, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [userId, plan.credits, planType]
      );
      console.log(`✅ Created new credits record with ${plan.credits} credits for user ${userId}`);
    }
  }

  // Handle affiliate referral if applicable
  if (affiliateId) {
    const plan = PLANS[planType];
    const monthlyCommission = Math.round(plan.price * 0.15); // 15% commission

    await pool.query(
      `INSERT INTO affiliate_referrals (affiliate_id, referred_user_id, plan_type, monthly_commission)
       VALUES ($1, $2, $3, $4)`,
      [affiliateId, userId, planType, monthlyCommission]
    );

    // Create first commission
    const commissionMonth = new Date().toISOString().slice(0, 7) + '-01';
    await pool.query(
      `INSERT INTO affiliate_commissions 
       (affiliate_id, referred_user_id, stripe_subscription_id, amount, plan_type, commission_month)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [affiliateId, userId, subscription.id, monthlyCommission, planType, commissionMonth]
    );
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    // Add monthly credits for subscription renewal
    const subscriptionResult = await pool.query(
      'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
      [subscription.id]
    );
    
    if (subscriptionResult.rows.length > 0) {
      const userId = subscriptionResult.rows[0].user_id;
      
      // Determine plan type from subscription metadata or price
      const priceId = subscription.items.data[0].price.id;
      let planType = null;
      
      // Try to get plan type from subscription metadata first
      if (subscription.metadata && subscription.metadata.plan_type) {
        planType = subscription.metadata.plan_type;
      } else {
        // Fallback: determine by price (this might need adjustment based on your actual price IDs)
        for (const [key, plan] of Object.entries(PLANS)) {
          if (plan.price === subscription.items.data[0].price.unit_amount) {
            planType = key;
            break;
          }
        }
      }
      
      if (planType && PLANS[planType]) {
        const plan = PLANS[planType];
        console.log(`🔄 Monthly renewal: Adding ${plan.credits} credits to user ${userId} for plan ${planType}`);
        
        // Add monthly credits (always add, as this is a renewal)
        await pool.query(
          'UPDATE user_credits SET credits = credits + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
          [plan.credits, userId]
        );
        console.log(`✅ Added ${plan.credits} monthly renewal credits to user ${userId}`);
      }
    }
    
    // Create new commission for affiliate if applicable
    const referralResult = await pool.query(
      `SELECT ar.affiliate_id, ar.monthly_commission, ar.plan_type 
       FROM affiliate_referrals ar
       JOIN subscriptions s ON s.user_id = ar.referred_user_id
       WHERE s.stripe_subscription_id = $1 AND ar.status = 'active'`,
      [subscription.id]
    );

    if (referralResult.rows.length > 0) {
      const referral = referralResult.rows[0];
      const commissionMonth = new Date().toISOString().slice(0, 7) + '-01';
      
      // Add monthly commission
      await pool.query(
        `INSERT INTO affiliate_commissions 
         (affiliate_id, referred_user_id, stripe_subscription_id, amount, plan_type, commission_month)
         VALUES ($1, (SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $2), $3, $4, $5, $6)`,
        [
          referral.affiliate_id,
          subscription.id, 
          subscription.id,
          referral.monthly_commission,
          referral.plan_type,
          commissionMonth
        ]
      );
    }
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  await pool.query(
    'UPDATE subscriptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE stripe_subscription_id = $2',
    ['canceled', subscription.id]
  );

  // Deactivate referral
  await pool.query(
    `UPDATE affiliate_referrals SET status = 'inactive', updated_at = CURRENT_TIMESTAMP 
     WHERE referred_user_id IN (SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1)`,
    [subscription.id]
  );
}

router.stripeConfigured = Boolean(stripe);

router.stripeConfigured = Boolean(stripe);

module.exports = router;
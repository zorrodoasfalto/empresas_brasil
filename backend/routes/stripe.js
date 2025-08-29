const express = require('express');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Pool } = require('pg');

// Database connection usando Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_jwt_super_secreta_aqui_2024';

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
    interval: 'month'
  },
  premium: {
    name: 'Plano Premium', 
    priceId: null, // Temporário: usar price_data até configurar price IDs ativos
    price: 14700, // R$ 147.00 in cents
    interval: 'month'
  },
  max: {
    name: 'Plano Max',
    priceId: 'price_1S1YbpP405WDxxG8uBdbYVC4', // Novo price ID do produto prod_SxTYu4T3TrJvfw
    price: 24700, // R$ 247.00 in cents
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

    await pool.query(
      `INSERT INTO affiliates (user_id, affiliate_code) 
       VALUES ($1, $2)`,
      [userId, affiliateCode]
    );

    return affiliateCode;
  } catch (error) {
    console.error('Error creating affiliate code:', error);
    return null;
  }
}

// Check for referral tracking
async function checkReferralTracking(referredUserId, affiliateCode) {
  try {
    if (!affiliateCode) return null;

    const affiliateResult = await pool.query(
      'SELECT id, user_id FROM affiliates WHERE affiliate_code = $1',
      [affiliateCode]
    );

    if (affiliateResult.rows.length === 0) return null;

    const affiliate = affiliateResult.rows[0];
    if (affiliate.user_id === referredUserId) return null; // Can't refer yourself

    return affiliate.id;
  } catch (error) {
    console.error('Error checking referral:', error);
    return null;
  }
}

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { planType = 'pro', affiliateCode } = req.body;
    const userId = req.user.id;

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
      affiliateId = await checkReferralTracking(userId, affiliateCode);
      if (affiliateId) {
        discountAmount = Math.round(plan.price * 0.1); // 10% discount
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

    // Create line item - use priceId if available, otherwise price_data
    let lineItem;
    if (plan.priceId) {
      lineItem = {
        price: plan.priceId,
        quantity: 1,
      };
    } else {
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
      // Generate affiliate code for user
      const code = await generateAffiliateCode(userId);
      if (code) {
        affiliateResult = await pool.query(
          'SELECT * FROM affiliates WHERE user_id = $1',
          [userId]
        );
        affiliate = affiliateResult.rows[0];
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

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
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
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
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

module.exports = router;
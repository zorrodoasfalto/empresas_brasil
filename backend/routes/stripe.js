const express = require('express');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Pool } = require('pg');

// Database connection (SAME as server.js)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-for-development';

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
    priceId: process.env.STRIPE_PRICE_ID_PRO,
    price: 9700, // R$ 97.00 in cents
    interval: 'month'
  },
  premium: {
    name: 'Plano Premium', 
    priceId: process.env.STRIPE_PRICE_ID_PREMIUM,
    price: 14700, // R$ 147.00 in cents
    interval: 'month'
  },
  max: {
    name: 'Plano Max',
    priceId: process.env.STRIPE_PRICE_ID_MAX,
    price: 19700, // R$ 197.00 in cents
    interval: 'month'
  }
};

// Generate affiliate code
function generateAffiliateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get or create affiliate code for user
async function getOrCreateAffiliateCode(userId) {
  try {
    // Check if user already has affiliate code
    let affiliateResult = await pool.query(
      'SELECT affiliate_code FROM affiliates WHERE user_id = $1',
      [userId]
    );

    if (affiliateResult.rows.length > 0) {
      return affiliateResult.rows[0].affiliate_code;
    }

    // Generate unique affiliate code
    let affiliateCode;
    let codeExists = true;
    
    while (codeExists) {
      affiliateCode = generateAffiliateCode();
      const existCheck = await pool.query(
        'SELECT id FROM affiliates WHERE affiliate_code = $1',
        [affiliateCode]
      );
      codeExists = existCheck.rows.length > 0;
    }

    // Create affiliate record
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

    // Find affiliate by code
    const affiliateResult = await pool.query(
      'SELECT id, user_id FROM affiliates WHERE affiliate_code = $1',
      [affiliateCode]
    );

    if (affiliateResult.rows.length === 0) return null;

    const affiliate = affiliateResult.rows[0];
    
    // Don't allow self-referral
    if (affiliate.user_id === referredUserId) return null;

    // Check if referral already exists
    const existingReferral = await pool.query(
      'SELECT id FROM affiliate_referrals WHERE affiliate_id = $1 AND referred_user_id = $2',
      [affiliate.id, referredUserId]
    );

    if (existingReferral.rows.length > 0) return null;

    return affiliate.id;
  } catch (error) {
    console.error('Error checking referral tracking:', error);
    return null;
  }
}

// 1. Create checkout session
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

    // Get user info
    const userResult = await pool.query(
      'SELECT email, name FROM simple_users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    const user = userResult.rows[0];

    // Create or get Stripe customer
    let customer;
    const existingCustomer = await pool.query(
      'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1 AND stripe_customer_id IS NOT NULL LIMIT 1',
      [userId]
    );

    if (existingCustomer.rows.length > 0) {
      customer = await stripe.customers.retrieve(existingCustomer.rows[0].stripe_customer_id);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          user_id: userId.toString()
        }
      });
    }

    // Create line items
    const lineItems = [{
      price: plan.priceId,
      quantity: 1
    }];

    // Create discount if applicable
    let discounts = [];
    if (discountAmount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: discountAmount,
        currency: 'brl',
        duration: 'once',
        name: '10% Desconto Afiliado'
      });

      discounts = [{ coupon: coupon.id }];
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: lineItems,
      discounts: discounts,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:4001'}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:4001'}/checkout?canceled=true`,
      metadata: {
        user_id: userId.toString(),
        plan_type: planType,
        affiliate_id: affiliateId ? affiliateId.toString() : '',
        affiliate_code: affiliateCode || ''
      }
    });

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

// 2. Webhook handler
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
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle checkout completion
async function handleCheckoutCompleted(session) {
  const userId = parseInt(session.metadata.user_id);
  const planType = session.metadata.plan_type;
  const affiliateId = session.metadata.affiliate_id ? parseInt(session.metadata.affiliate_id) : null;
  
  // Get subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  // Update subscription in database
  await pool.query(
    `UPDATE subscriptions SET 
     stripe_subscription_id = $1,
     stripe_price_id = $2,
     status = $3,
     current_period_start = $4,
     current_period_end = $5,
     updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $6`,
    [
      subscription.id,
      subscription.items.data[0].price.id,
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
      userId
    ]
  );

  // Create affiliate referral if applicable
  if (affiliateId) {
    const plan = PLANS[planType];
    const monthlyCommission = Math.round(plan.price * 0.15); // 15% commission

    await pool.query(
      `INSERT INTO affiliate_referrals (affiliate_id, referred_user_id, plan_type, monthly_commission)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (affiliate_id, referred_user_id) DO UPDATE SET
       plan_type = $3, monthly_commission = $4, status = 'active', updated_at = CURRENT_TIMESTAMP`,
      [affiliateId, userId, planType, monthlyCommission]
    );

    // Update affiliate totals
    await pool.query(
      `UPDATE affiliates SET 
       total_referrals = total_referrals + 1,
       total_earned = total_earned + $1,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [monthlyCommission, affiliateId]
    );

    // Create commission record
    const commissionMonth = new Date(subscription.current_period_start * 1000);
    commissionMonth.setDate(1); // First day of the month

    await pool.query(
      `INSERT INTO affiliate_commissions 
       (affiliate_id, referred_user_id, stripe_subscription_id, amount, plan_type, commission_month)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [affiliateId, userId, subscription.id, monthlyCommission, planType, commissionMonth]
    );
  }

  console.log(`✅ Subscription activated for user ${userId}`);
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  await pool.query(
    `UPDATE subscriptions SET 
     status = $1,
     current_period_start = $2,
     current_period_end = $3,
     updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $4`,
    [
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
      subscription.id
    ]
  );
  
  console.log(`✅ Subscription updated: ${subscription.id}`);
}

// Handle subscription cancellation
async function handleSubscriptionCanceled(subscription) {
  await pool.query(
    `UPDATE subscriptions SET 
     status = 'canceled',
     updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $1`,
    [subscription.id]
  );

  // Mark affiliate referral as inactive
  await pool.query(
    `UPDATE affiliate_referrals SET 
     status = 'inactive',
     updated_at = CURRENT_TIMESTAMP
     WHERE referred_user_id = (
       SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1
     )`,
    [subscription.id]
  );
  
  console.log(`✅ Subscription canceled: ${subscription.id}`);
}

// Handle successful payment (for recurring billing)
async function handlePaymentSucceeded(invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    // Update subscription dates
    await handleSubscriptionUpdated(subscription);
    
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
      const commissionMonth = new Date(subscription.current_period_start * 1000);
      commissionMonth.setDate(1);

      // Add monthly commission
      await pool.query(
        `INSERT INTO affiliate_commissions 
         (affiliate_id, referred_user_id, stripe_subscription_id, amount, plan_type, commission_month)
         VALUES ($1, (SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $2), $3, $4, $5, $6)
         ON CONFLICT (affiliate_id, referred_user_id, commission_month) DO NOTHING`,
        [
          referral.affiliate_id,
          subscription.id, 
          subscription.id,
          referral.monthly_commission,
          referral.plan_type,
          commissionMonth
        ]
      );

      // Update total earned
      await pool.query(
        `UPDATE affiliates SET 
         total_earned = total_earned + $1,
         updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [referral.monthly_commission, referral.affiliate_id]
      );
    }
  }
  
  console.log(`✅ Payment succeeded for invoice: ${invoice.id}`);
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  if (invoice.subscription) {
    await pool.query(
      `UPDATE subscriptions SET 
       status = 'past_due',
       updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $1`,
      [invoice.subscription]
    );
  }
  
  console.log(`❌ Payment failed for invoice: ${invoice.id}`);
}

// 3. Get subscription status
router.get('/subscription-status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT s.*, a.affiliate_code 
       FROM subscriptions s
       LEFT JOIN affiliates a ON a.user_id = s.user_id
       WHERE s.user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      // Create affiliate code if it doesn't exist
      const affiliateCode = await getOrCreateAffiliateCode(userId);
      
      return res.json({
        success: true,
        hasActiveSubscription: false,
        status: 'inactive',
        affiliateCode: affiliateCode
      });
    }
    
    const subscription = result.rows[0];
    const isActive = subscription.status === 'active' && 
                    new Date() < new Date(subscription.current_period_end);
    
    res.json({
      success: true,
      hasActiveSubscription: isActive,
      status: subscription.status,
      planType: subscription.plan_type,
      currentPeriodEnd: subscription.current_period_end,
      affiliateCode: subscription.affiliate_code
    });
    
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar status da assinatura' 
    });
  }
});

// 4. Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assinatura ativa não encontrada' 
      });
    }
    
    const subscriptionId = result.rows[0].stripe_subscription_id;
    
    // Cancel in Stripe
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
    
    res.json({
      success: true,
      message: 'Assinatura será cancelada no final do período atual'
    });
    
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao cancelar assinatura' 
    });
  }
});

module.exports = router;
/**
 * Zoho Pay widget backend — customer, session, mandate persistence.
 *
 *   node backend-examples/zoho-pay-widget.js
 *
 * Env:
 *   VITE_ZOHO_PAY_ACCOUNT_ID (or ZOHO_PAY_ACCOUNT_ID)
 *   ZOHO_OAUTH_TOKEN (or VITE_ZOHO_PAY_API_KEY as fallback)
 */

require('dotenv').config();

const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 5000;
const ACCOUNT_ID = process.env.VITE_ZOHO_PAY_ACCOUNT_ID || process.env.ZOHO_PAY_ACCOUNT_ID || '';
const API_KEY = process.env.VITE_ZOHO_PAY_API_KEY || '';
const OAUTH_TOKEN = process.env.ZOHO_OAUTH_TOKEN || '';
const ZOHO_API_BASE = 'payments.zoho.com';

function getAuthToken() {
  if (OAUTH_TOKEN) return OAUTH_TOKEN;
  if (API_KEY) return API_KEY;
  throw new Error('Set ZOHO_OAUTH_TOKEN or VITE_ZOHO_PAY_API_KEY');
}

function zohoRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const token = getAuthToken();
    const url = `${path}?account_id=${encodeURIComponent(ACCOUNT_ID)}`;
    const payload = body ? JSON.stringify(body) : null;

    const options = {
      hostname: ZOHO_API_BASE,
      path: `/api/v1${url}`,
      method,
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data || '{}');
          if (res.statusCode >= 400) {
            reject(new Error(parsed?.message || parsed?.error || `Zoho API ${res.statusCode}`));
          } else {
            resolve(parsed);
          }
        } catch {
          reject(new Error(`Non-JSON Zoho response (${res.statusCode})`));
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function createOrFindCustomer(name, email, phone, onboardingId) {
  const body = {
    name: name || email,
    email,
    ...(phone ? { phone } : {}),
    ...(onboardingId ? { meta_data: [{ key: 'onboarding_id', value: String(onboardingId) }] } : {}),
  };

  const data = await zohoRequest('POST', '/customers', body);
  const customerId = data?.customer?.customer_id;
  if (!customerId) throw new Error('Zoho did not return customer_id');
  return customerId;
}

async function createPaymentSession(amount, currency, customerId, plan) {
  const description = plan === 'monthly'
    ? 'Dyad monthly recurring ACH authorization'
    : `Dyad ${plan} recurring ACH authorization`;

  const data = await zohoRequest('POST', '/paymentsessions', {
    amount: Number.parseFloat(amount),
    currency,
    description,
    customer_id: customerId,
    configurations: {
      allowed_payment_methods: ['ach_debit'],
    },
  });

  const session = data?.payments_session;
  const paymentsSessionId = session?.payments_session_id;
  if (!paymentsSessionId) throw new Error('Zoho did not return payments_session_id');

  return {
    payments_session_id: paymentsSessionId,
    amount: session.amount ?? amount,
    currency_code: session.currency ?? currency,
  };
}

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

async function handleCustomer(body) {
  const { name, email, phone, onboardingId } = body;
  if (!email) throw new Error('email is required');

  const customerId = await createOrFindCustomer(name, email, phone, onboardingId);
  return { success: true, customerId, customer_id: customerId };
}

async function handleCreateSession(body) {
  const amount = body.amount ?? 1;
  const currency = body.currency ?? 'USD';
  const customerId = body.customerId ?? body.customer_id;
  const plan = body.plan ?? 'monthly';
  if (!customerId) throw new Error('customerId is required');

  const session = await createPaymentSession(amount, currency, customerId, plan);
  return {
    success: true,
    plan,
    api_key: API_KEY,
    ...session,
  };
}

/** In-memory subscription store for local dev (keyed by onboardingId). */
const subscriptionStore = new Map();

async function verifyZohoPayment(paymentId) {
  const data = await zohoRequest('GET', `/payments/${encodeURIComponent(paymentId)}`);
  const payment = data?.payment ?? data;
  const paymentMethodId = payment?.payment_method_id ?? payment?.payment_method?.payment_method_id;

  return {
    success: true,
    payment_id: payment?.payment_id ?? paymentId,
    status: payment?.status ?? 'succeeded',
    customer_id: payment?.customer_id,
    payment_method_id: paymentMethodId,
    amount: String(payment?.amount ?? '1'),
    currency: payment?.currency ?? 'USD',
    data: payment ?? {},
  };
}

async function createPaymentMethodSession(customerId) {
  const data = await zohoRequest('POST', '/paymentmethodsessions', {
    customer_id: customerId,
    payment_method: 'ach_debit',
  });

  const session = data?.payment_method_session ?? data;
  const paymentMethodSessionId = session?.payment_method_session_id;
  if (!paymentMethodSessionId) {
    throw new Error('Zoho did not return payment_method_session_id');
  }

  return {
    payment_method_session_id: paymentMethodSessionId,
    customer_id: customerId,
    account_id: ACCOUNT_ID,
    api_key: API_KEY,
    widget: {
      payment_method: 'ach_debit',
      transaction_type: 'add',
      customer_id: customerId,
      payment_method_session_id: paymentMethodSessionId,
    },
  };
}

function handleSaveSubscription(body) {
  const paymentId = body.payment_id ?? body.paymentId;
  const paymentMethodId = body.payment_method_id ?? body.paymentMethodId;
  const customerId = body.customerId ?? body.customer_id;
  const onboardingId = body.onboardingId ?? body.userId ?? body.owner_id;
  const plan = body.plan ?? 'monthly';
  const amount = String(body.amount ?? '1');
  const currency = body.currency ?? 'USD';

  if (!paymentId) throw new Error('payment_id is required');
  if (!paymentMethodId) throw new Error('payment_method_id is required');
  if (!customerId) throw new Error('customerId is required');
  if (!onboardingId) throw new Error('onboardingId is required');

  const existing = subscriptionStore.get(onboardingId);
  const nextCharge = new Date();
  nextCharge.setMonth(nextCharge.getMonth() + (plan === 'yearly' ? 12 : 1));

  const record = {
    id: existing?.id ?? subscriptionStore.size + 1,
    owner_id: onboardingId,
    zoho_customer_id: customerId,
    zoho_payment_id: paymentId,
    zoho_payment_method_id: paymentMethodId,
    plan,
    amount,
    currency,
    status: 'active',
    next_charge: nextCharge.toISOString(),
  };

  subscriptionStore.set(onboardingId, record);

  return {
    success: true,
    isNew: !existing,
    data: record,
  };
}

function handleGetSubscription(onboardingId) {
  const record = subscriptionStore.get(onboardingId);
  if (!record) {
    return { success: false, message: 'Subscription not found' };
  }
  return { success: true, data: record };
}

async function handleSaveMandate(body) {
  const customerId = body.customerId ?? body.customer_id;
  const result = body.result ?? body;

  const paymentId = result.payment_id ?? result.paymentId;
  const paymentMethodId = result.payment_method_id ?? result.paymentMethodId;
  const mandateId = result.mandate_id ?? result.mandateId ?? paymentMethodId;

  if (!customerId) throw new Error('customerId is required');
  if (!paymentId && !paymentMethodId && !mandateId) {
    throw new Error('No payment or mandate references in widget result');
  }

  return {
    success: true,
    customer_id: customerId,
    payment_id: paymentId,
    payment_method_id: paymentMethodId,
    mandate_id: mandateId,
    onboarding_id: body.onboardingId ?? body.onboarding_id,
  };
}

async function routeRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    return res.end();
  }

  const url = req.url?.split('?')[0];

  if (req.method === 'POST' && url === '/api/customer') {
    try {
      const body = await readBody(req);
      return sendJson(res, 201, await handleCustomer(body));
    } catch (err) {
      return sendJson(res, 500, { success: false, message: err.message });
    }
  }

  if (req.method === 'POST' && url === '/api/create-session') {
    try {
      const body = await readBody(req);
      return sendJson(res, 201, await handleCreateSession(body));
    } catch (err) {
      return sendJson(res, 500, { success: false, message: err.message });
    }
  }

  if (req.method === 'POST' && url === '/api/save-mandate') {
    try {
      const body = await readBody(req);
      return sendJson(res, 200, await handleSaveMandate(body));
    } catch (err) {
      return sendJson(res, 500, { success: false, message: err.message });
    }
  }

  if (req.method === 'POST' && url === '/api/verify-payment') {
    try {
      const body = await readBody(req);
      const paymentId = body.payment_id ?? body.paymentId;
      if (!paymentId) throw new Error('payment_id is required');
      return sendJson(res, 200, await verifyZohoPayment(paymentId));
    } catch (err) {
      return sendJson(res, 500, { success: false, message: err.message });
    }
  }

  if (req.method === 'POST' && url === '/api/create-payment-method-session') {
    try {
      const body = await readBody(req);
      const customerId = body.customerId ?? body.customer_id;
      if (!customerId) throw new Error('customerId is required');
      return sendJson(res, 201, await createPaymentMethodSession(customerId));
    } catch (err) {
      return sendJson(res, 500, { success: false, message: err.message });
    }
  }

  if (req.method === 'POST' && url === '/api/save-subscription') {
    try {
      const body = await readBody(req);
      return sendJson(res, 200, handleSaveSubscription(body));
    } catch (err) {
      return sendJson(res, 500, { success: false, message: err.message });
    }
  }

  const subscriptionMatch = url?.match(/^\/api\/subscription\/([^/]+)$/);
  if (req.method === 'GET' && subscriptionMatch) {
    const onboardingId = decodeURIComponent(subscriptionMatch[1]);
    const result = handleGetSubscription(onboardingId);
    return sendJson(res, result.success ? 200 : 404, result);
  }

  if (req.method === 'GET' && url === '/api/health') {
    return sendJson(res, 200, { status: 'ok', zohoAccountId: ACCOUNT_ID });
  }

  return sendJson(res, 404, { success: false, message: 'Not found' });
}

if (require.main === module) {
  http.createServer(routeRequest).listen(PORT, () => {
    console.log(`Zoho Pay widget server → http://localhost:${PORT}`);
    console.log('  POST /api/customer');
    console.log('  POST /api/create-session');
    console.log('  POST /api/verify-payment');
    console.log('  POST /api/create-payment-method-session');
    console.log('  POST /api/save-subscription');
    console.log('  GET  /api/subscription/:onboardingId');
    console.log('  POST /api/save-mandate');
  });
}

module.exports = routeRequest;

/**
 * Zoho Pay widget backend — customer, session, mandate persistence.
 *
 *   node backend-examples/zoho-pay-widget.js
 *
 * Env:
 *   VITE_ZOHO_PAY_ACCOUNT_ID (or ZOHO_PAY_ACCOUNT_ID)
 *   ZOHO_OAUTH_TOKEN (or VITE_ZOHO_PAY_API_KEY as fallback)
 *
 * Endpoints:
 *   POST /api/customer
 *   POST /api/create-session
 *   POST /api/verify-payment
 *   POST /api/create-payment-method-session
 *   POST /api/save-subscription
 *   POST /api/zoho/payment-failure
 *   POST /api/zoho/webhook
 *   GET  /api/subscription/:onboardingId
 */

require('dotenv').config();

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const PORT = process.env.PORT || 5000;
const ACCOUNT_ID = process.env.VITE_ZOHO_PAY_ACCOUNT_ID || process.env.ZOHO_PAY_ACCOUNT_ID || '';
const API_KEY = process.env.VITE_ZOHO_PAY_API_KEY || '';
const OAUTH_TOKEN = process.env.ZOHO_OAUTH_TOKEN || '';
const ZOHO_API_BASE = 'payments.zoho.com';
const DATA_FILE = path.join(__dirname, '.zoho-pay-store.json');

const ACCEPTABLE_PAYMENT_STATUSES = new Set([
  'succeeded', 'success', 'pending', 'processing', 'authorized',
]);

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return {
        subscriptions: raw.subscriptions ?? {},
        paymentsById: raw.paymentsById ?? {},
        failureLogs: Array.isArray(raw.failureLogs) ? raw.failureLogs : [],
      };
    }
  } catch {
    // fall through
  }
  return { subscriptions: {}, paymentsById: {}, failureLogs: [] };
}

function saveStore(store) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
}

let store = loadStore();

function getSubscriptionByOnboardingId(onboardingId) {
  return store.subscriptions[onboardingId] ?? null;
}

function getSubscriptionByPaymentId(paymentId) {
  const onboardingId = store.paymentsById[paymentId];
  return onboardingId ? store.subscriptions[onboardingId] : null;
}

function deriveSubscriptionStatus(paymentStatus) {
  const normalized = String(paymentStatus ?? '').toLowerCase();
  if (normalized === 'succeeded' || normalized === 'success') return 'active';
  if (normalized === 'failed' || normalized === 'cancelled') return 'failed';
  return 'pending';
}

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

/** Persistent subscription store (keyed by onboardingId). */
function handleSaveSubscription(body) {
  const paymentId = body.payment_id ?? body.paymentId;
  const paymentMethodId = body.payment_method_id ?? body.paymentMethodId;
  const customerId = body.customerId ?? body.customer_id;
  const onboardingId = body.onboardingId ?? body.userId ?? body.owner_id;
  const plan = body.plan ?? 'monthly';
  const amount = String(body.amount ?? '1');
  const currency = body.currency ?? 'USD';
  const paymentStatus = body.payment_status ?? body.paymentStatus ?? 'succeeded';
  const sessionId = body.session_id ?? body.sessionId ?? '';
  const mandateId = body.mandate_id ?? body.mandateId ?? paymentMethodId;

  if (!paymentId) throw new Error('payment_id is required');
  if (!paymentMethodId) throw new Error('payment_method_id is required');
  if (!customerId) throw new Error('customerId is required');
  if (!onboardingId) throw new Error('onboardingId is required');

  const existingByPayment = getSubscriptionByPaymentId(paymentId);
  if (existingByPayment) {
    return {
      success: true,
      isNew: false,
      data: existingByPayment,
    };
  }

  const existing = getSubscriptionByOnboardingId(onboardingId);
  const nextCharge = new Date();
  nextCharge.setMonth(nextCharge.getMonth() + (plan === 'yearly' ? 12 : 1));

  const record = {
    id: existing?.id ?? Object.keys(store.subscriptions).length + 1,
    owner_id: onboardingId,
    zoho_customer_id: customerId,
    zoho_payment_id: paymentId,
    zoho_payment_method_id: paymentMethodId,
    zoho_mandate_id: mandateId,
    zoho_session_id: sessionId,
    payment_status: paymentStatus,
    plan,
    amount,
    currency,
    status: deriveSubscriptionStatus(paymentStatus),
    next_charge: nextCharge.toISOString(),
    authorized_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.subscriptions[onboardingId] = record;
  store.paymentsById[paymentId] = onboardingId;
  saveStore(store);

  return {
    success: true,
    isNew: !existing,
    data: record,
  };
}

function handleGetSubscription(onboardingId) {
  const record = getSubscriptionByOnboardingId(onboardingId);
  if (!record) {
    return { success: false, message: 'Subscription not found' };
  }
  return { success: true, data: record };
}

function handlePaymentFailure(body) {
  const entry = {
    id: store.failureLogs.length + 1,
    onboarding_id: body.onboardingId ?? body.onboarding_id ?? '',
    stage: body.stage ?? 'unknown',
    error: body.error ?? 'unknown',
    customer_id: body.customerId ?? body.customer_id ?? '',
    session_id: body.sessionId ?? body.session_id ?? '',
    payment_id: body.paymentId ?? body.payment_id ?? '',
    created_at: new Date().toISOString(),
  };
  store.failureLogs.push(entry);
  saveStore(store);
  return { success: true, data: entry };
}

function handleZohoWebhook(body) {
  const payment = body.payment ?? body.data?.payment ?? body;
  const paymentId = payment?.payment_id ?? body.payment_id;
  const paymentStatus = payment?.status ?? body.status ?? body.event_type;
  const eventType = body.event_type ?? body.type ?? 'payment.updated';

  if (!paymentId) {
    return { success: false, message: 'payment_id missing in webhook payload' };
  }

  const record = getSubscriptionByPaymentId(paymentId);
  if (!record) {
    return { success: true, ignored: true, message: 'No local subscription for payment_id' };
  }

  const normalizedStatus = String(paymentStatus ?? '').toLowerCase();
  if (normalizedStatus.includes('fail') || normalizedStatus === 'payment.failed') {
    record.status = 'failed';
    record.payment_status = 'failed';
  } else if (ACCEPTABLE_PAYMENT_STATUSES.has(normalizedStatus) || normalizedStatus.includes('success')) {
    record.payment_status = normalizedStatus.includes('pending') || normalizedStatus.includes('processing')
      ? normalizedStatus
      : 'succeeded';
    record.status = deriveSubscriptionStatus(record.payment_status);
  }

  record.last_webhook_event = eventType;
  record.updated_at = new Date().toISOString();
  store.subscriptions[record.owner_id] = record;
  saveStore(store);

  return { success: true, data: record };
}

async function handleVerifyPayment(body) {
  const paymentId = body.payment_id ?? body.paymentId;
  if (!paymentId) throw new Error('payment_id is required');

  const result = await verifyZohoPayment(paymentId);
  const normalized = String(result.status ?? '').toLowerCase();
  const acceptable = ACCEPTABLE_PAYMENT_STATUSES.has(normalized)
    || normalized === 'succeeded'
    || normalized === 'success';

  return {
    ...result,
    success: acceptable,
    message: acceptable ? undefined : `Payment could not be verified (status: ${result.status})`,
    onboarding_id: body.onboardingId ?? body.onboarding_id ?? '',
    session_id: body.session_id ?? body.sessionId ?? '',
    plan: body.plan ?? 'monthly',
    amount: String(body.amount ?? result.amount ?? '1'),
    currency: body.currency ?? result.currency ?? 'USD',
  };
}

async function verifyZohoPayment(paymentId) {
  const data = await zohoRequest('GET', `/payments/${encodeURIComponent(paymentId)}`);
  const payment = data?.payment ?? data;
  const paymentMethodId = payment?.payment_method_id ?? payment?.payment_method?.payment_method_id;
  const status = payment?.status ?? 'succeeded';

  return {
    success: true,
    paymentId: payment?.payment_id ?? paymentId,
    payment_id: payment?.payment_id ?? paymentId,
    status,
    customerId: payment?.customer_id,
    customer_id: payment?.customer_id,
    paymentMethodId,
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
      const verified = await handleVerifyPayment(body);
      return sendJson(res, verified.success ? 200 : 200, verified);
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
      const result = handleSaveSubscription(body);
      return sendJson(res, result.isNew ? 201 : 200, result);
    } catch (err) {
      return sendJson(res, 500, { success: false, message: err.message });
    }
  }

  if (req.method === 'POST' && url === '/api/zoho/payment-failure') {
    try {
      const body = await readBody(req);
      return sendJson(res, 200, handlePaymentFailure(body));
    } catch (err) {
      return sendJson(res, 500, { success: false, message: err.message });
    }
  }

  if (req.method === 'POST' && url === '/api/zoho/webhook') {
    try {
      const body = await readBody(req);
      return sendJson(res, 200, handleZohoWebhook(body));
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
    console.log('  POST /api/zoho/payment-failure');
    console.log('  POST /api/zoho/webhook');
    console.log('  GET  /api/subscription/:onboardingId');
    console.log('  POST /api/save-mandate');
  });
}

module.exports = routeRequest;

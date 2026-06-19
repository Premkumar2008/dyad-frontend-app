/**
 * Zoho Pay widget backend — create payment session + persist mandate result.
 *
 * Mount on your Express app:
 *   const zohoPay = require('./backend-examples/zoho-pay-widget');
 *   app.use('/api', zohoPay);
 *
 * Or run standalone:
 *   node backend-examples/zoho-pay-widget.js
 *
 * Env:
 *   VITE_ZOHO_PAY_ACCOUNT_ID
 *   VITE_ZOHO_PAY_API_KEY  (or ZOHO_OAUTH_TOKEN)
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

async function createPaymentSession(amount, currency, description, email, name) {
  const data = await zohoRequest('POST', '/paymentsessions', {
    amount: Number.parseFloat(amount),
    currency,
    description,
    configurations: {
      allowed_payment_methods: ['ach_debit'],
      hosted_page_parameters: {
        email,
        name: name || email,
      },
    },
  });

  const session = data?.payments_session;
  const sessionId = session?.payments_session_id;
  if (!sessionId) throw new Error('Zoho did not return payments_session_id');

  return {
    session_id: sessionId,
    amount: String(session.amount ?? amount),
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

async function handleCreateSession(body) {
  const amount = String(body.amount ?? '49.99');
  const currency = body.currency ?? 'USD';
  const description = body.description
    ?? (body.onboardingId ? `Dyad ACH setup · ${body.onboardingId}` : 'Dyad ACH mandate setup');

  const session = await createPaymentSession(
    amount,
    currency,
    description,
    body.email,
    body.name,
  );

  return { success: true, ...session };
}

async function handleSaveMandate(body) {
  // Persist to your database — this example echoes identifiers for frontend confirmation.
  const paymentId = body.payment_id ?? body.paymentId;
  const paymentMethodId = body.payment_method_id ?? body.paymentMethodId;
  const mandateId = body.mandate_id ?? body.mandateId ?? paymentMethodId;

  if (!paymentId && !paymentMethodId && !mandateId) {
    throw new Error('No payment or mandate identifiers in widget result');
  }

  return {
    success: true,
    payment_id: paymentId,
    payment_method_id: paymentMethodId,
    mandate_id: mandateId,
    session_id: body.session_id ?? body.sessionId,
    onboarding_id: body.onboardingId ?? body.onboarding_id,
  };
}

async function routeRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    });
    return res.end();
  }

  const url = req.url?.split('?')[0];

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

  if (req.method === 'GET' && url === '/api/health') {
    return sendJson(res, 200, { status: 'ok', zohoAccountId: ACCOUNT_ID });
  }

  return sendJson(res, 404, { success: false, message: 'Not found' });
}

if (require.main === module) {
  http.createServer(routeRequest).listen(PORT, () => {
    console.log(`Zoho Pay widget server → http://localhost:${PORT}`);
    console.log('  POST /api/create-session');
    console.log('  POST /api/save-mandate');
  });
}

module.exports = routeRequest;

/**
 * Zoho Pay — recurring ACH mandate (embedded widget) backend routes.
 *
 * Mount on your Express app at /api/zoho-pay or merge into localhost:5000 server.
 *
 * Required env (server-side only):
 *   ZOHO_PAY_ACCOUNT_ID
 *   ZOHO_CLIENT_ID
 *   ZOHO_CLIENT_SECRET
 *   ZOHO_REFRESH_TOKEN
 *   ZOHO_PAYMENTS_API_BASE=https://payments.zoho.com/api/v1  (optional)
 *   ZOHO_ACCOUNTS_URL=https://accounts.zoho.com              (optional, use .com.au/.eu/.in for DC)
 *
 * Frontend env (Vite):
 *   VITE_ZOHO_PAY_ACCOUNT_ID
 *   VITE_ZOHO_PAY_API_KEY        (widget API key from Zoho Developers Space)
 *   VITE_ZOHO_PAY_DOMAIN=US
 */

const express = require('express');
const axios = require('axios');

const router = express.Router();

const ZOHO_API_BASE = process.env.ZOHO_PAYMENTS_API_BASE || 'https://payments.zoho.com/api/v1';
const ZOHO_ACCOUNTS_URL = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com';
const ZOHO_ACCOUNT_ID = process.env.ZOHO_PAY_ACCOUNT_ID;

let cachedAccessToken = '';
let tokenExpiresAt = 0;

async function getZohoAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN || '',
    client_id: process.env.ZOHO_CLIENT_ID || '',
    client_secret: process.env.ZOHO_CLIENT_SECRET || '',
    grant_type: 'refresh_token',
  });

  const { data } = await axios.post(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token?${params.toString()}`);
  if (!data.access_token) {
    throw new Error(data.error || 'Unable to refresh Zoho OAuth token');
  }

  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;
  return cachedAccessToken;
}

async function zohoRequest(method, path, body) {
  if (!ZOHO_ACCOUNT_ID) {
    throw new Error('ZOHO_PAY_ACCOUNT_ID is not configured on the server');
  }

  const token = await getZohoAccessToken();
  const separator = path.includes('?') ? '&' : '?';
  const url = `${ZOHO_API_BASE}${path}${separator}account_id=${encodeURIComponent(ZOHO_ACCOUNT_ID)}`;

  const response = await axios({
    method,
    url,
    data: body,
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    const message = response.data?.message || response.data?.error || `Zoho API ${response.status}`;
    throw new Error(message);
  }

  return response.data;
}

async function createZohoCustomer({ name, email, phone, onboardingId }) {
  const meta_data = onboardingId
    ? [{ key: 'onboarding_id', value: String(onboardingId) }]
    : undefined;

  const data = await zohoRequest('POST', '/customers', {
    name,
    email,
    phone: phone || undefined,
    meta_data,
  });

  const customerId = data?.customer?.customer_id;
  if (!customerId) {
    throw new Error('Zoho did not return customer_id');
  }
  return { customerId, raw: data };
}

async function createPaymentMethodSession(customerId, description) {
  const data = await zohoRequest('POST', '/paymentmethodsessions', {
    customer_id: customerId,
    description,
  });

  const session = data?.payment_method_session;
  if (!session?.payment_method_session_id) {
    throw new Error('Zoho did not return payment_method_session_id');
  }
  return { session, raw: data };
}

async function retrievePaymentMethodSession(paymentMethodSessionId) {
  const data = await zohoRequest('GET', `/paymentmethodsessions/${paymentMethodSessionId}`);
  const session = data?.payment_method_session;
  if (!session) {
    throw new Error('Payment method session not found');
  }
  return session;
}

async function retrievePaymentMethod(paymentMethodId) {
  const data = await zohoRequest('GET', `/paymentmethods/${paymentMethodId}`);
  return data?.payment_method || null;
}

/** POST /api/zoho-pay/ach-mandate/setup */
router.post('/ach-mandate/setup', async (req, res) => {
  try {
    const { email, name, phone, onboardingId, description, customer_id: existingCustomerId } = req.body || {};

    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'name and email are required' });
    }

    let customerId = existingCustomerId;
    if (!customerId) {
      const created = await createZohoCustomer({ name, email, phone, onboardingId });
      customerId = created.customerId;
    }

    const sessionDescription = description
      || (onboardingId ? `Dyad onboarding ACH mandate · ${onboardingId}` : 'Dyad onboarding ACH mandate setup');

    const { session, raw } = await createPaymentMethodSession(customerId, sessionDescription);

    return res.status(201).json({
      success: true,
      flow: 'payment_method',
      customer_id: customerId,
      payment_method_session: session,
      payment_method_session_id: session.payment_method_session_id,
      ...raw,
    });
  } catch (error) {
    console.error('[zoho-pay] setup error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to create ACH setup session',
    });
  }
});

/** POST /api/zoho-pay/ach-mandate/confirm */
router.post('/ach-mandate/confirm', async (req, res) => {
  try {
    const {
      payment_method_session_id: paymentMethodSessionId,
      payment_method_id: widgetPaymentMethodId,
      onboardingId,
    } = req.body || {};

    if (!paymentMethodSessionId) {
      return res.status(400).json({ success: false, message: 'payment_method_session_id is required' });
    }

    const session = await retrievePaymentMethodSession(paymentMethodSessionId);

    if (session.status !== 'succeeded') {
      return res.status(409).json({
        success: false,
        message: `Payment method session status is "${session.status || 'unknown'}", expected "succeeded"`,
        payment_method_session: session,
      });
    }

    const paymentMethodId = session.payment_method?.payment_method_id || widgetPaymentMethodId;
    if (!paymentMethodId) {
      return res.status(409).json({
        success: false,
        message: 'No payment_method_id on completed session',
        payment_method_session: session,
      });
    }

    if (widgetPaymentMethodId && widgetPaymentMethodId !== paymentMethodId) {
      return res.status(409).json({
        success: false,
        message: 'Widget payment_method_id does not match server session',
      });
    }

    const paymentMethod = await retrievePaymentMethod(paymentMethodId);
    if (paymentMethod?.type && paymentMethod.type !== 'ach_debit') {
      return res.status(409).json({
        success: false,
        message: `Expected ach_debit payment method, received "${paymentMethod.type}"`,
      });
    }

    if (paymentMethod?.status && paymentMethod.status !== 'active') {
      return res.status(409).json({
        success: false,
        message: `Payment method status is "${paymentMethod.status}", expected "active"`,
        payment_method: paymentMethod,
      });
    }

    return res.json({
      success: true,
      onboardingId,
      mandate_id: paymentMethodId,
      payment_method_id: paymentMethodId,
      customer_id: session.customer_id,
      status: paymentMethod?.status || session.payment_method?.status || 'active',
      payment_method_session: session,
      payment_method: paymentMethod,
    });
  } catch (error) {
    console.error('[zoho-pay] confirm error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to confirm ACH mandate',
    });
  }
});

/** Optional: charge saved ACH for recurring billing (server-side only). */
router.post('/ach-mandate/charge', async (req, res) => {
  try {
    const {
      payment_method_id: paymentMethodId,
      customer_id: customerId,
      amount,
      currency = 'USD',
      description,
      reference_number: referenceNumber,
      invoice_number: invoiceNumber,
    } = req.body || {};

    if (!paymentMethodId || !customerId || amount == null || !description) {
      return res.status(400).json({
        success: false,
        message: 'payment_method_id, customer_id, amount, and description are required',
      });
    }

    const data = await zohoRequest('POST', '/payments', {
      amount: Number(amount),
      currency,
      description,
      reference_number: referenceNumber,
      invoice_number: invoiceNumber,
      payment_method_id: paymentMethodId,
      customer_id: customerId,
    });

    return res.status(201).json({ success: true, ...data });
  } catch (error) {
    console.error('[zoho-pay] charge error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to create ACH payment',
    });
  }
});

module.exports = router;

// Standalone dev server:
if (require.main === module) {
  const app = express();
  app.use(express.json());
  app.use('/api/zoho-pay', router);
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Zoho Pay example API listening on http://localhost:${port}/api/zoho-pay`);
  });
}

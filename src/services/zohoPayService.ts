import api, { handleApiError } from './api';
import type { ZohoPayDomain, ZohoPayInitConfig, ZohoPayRequestPaymentMethodOptions, ZohoPayWidgetSuccess } from '../types/zohoPay';

export interface ZohoPayWidgetConfig {
  accountId: string;
  domain: ZohoPayDomain;
}

export interface EnsureCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  onboardingId?: string;
}

export interface EnsureCustomerResponse {
  customerId: string;
}

export interface CreatePaymentSessionRequest {
  amount?: string | number;
  currency?: string;
  customerId: string;
  plan?: string;
}

export interface CreatePaymentSessionResponse {
  paymentsSessionId: string;
  amount: string;
  currencyCode: string;
  apiKey?: string;
}

export interface VerifyPaymentRequest {
  payment_id: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  paymentId: string;
  status: string;
  customerId: string;
  paymentMethodId?: string;
  amount: string;
  currency: string;
}

export interface CreatePaymentMethodSessionRequest {
  customerId: string;
}

export interface PaymentMethodWidgetOptions {
  payment_method: string;
  transaction_type: string;
  customer_id: string;
  payment_method_session_id: string;
}

export interface CreatePaymentMethodSessionResponse {
  paymentMethodSessionId: string;
  customerId: string;
  accountId?: string;
  apiKey?: string;
  widget: PaymentMethodWidgetOptions;
}

export interface SaveSubscriptionRequest {
  payment_id: string;
  payment_method_id: string;
  customerId: string;
  onboardingId: string;
  plan?: string;
  amount: number | string;
  currency?: string;
}

export interface SubscriptionRecord {
  id?: number;
  ownerId?: string;
  zohoCustomerId?: string;
  zohoPaymentId?: string;
  zohoPaymentMethodId?: string;
  plan?: string;
  amount?: string;
  currency?: string;
  status?: string;
  nextCharge?: string;
}

export interface SaveSubscriptionResponse {
  success: boolean;
  isNew?: boolean;
  data?: SubscriptionRecord;
}

export interface GetSubscriptionResponse {
  success: boolean;
  data?: SubscriptionRecord;
}

export interface ZohoSubscriptionFinalizeResult {
  customerId: string;
  paymentId: string;
  paymentMethodId: string;
  mandateId: string;
  sessionId: string;
  paymentStatus: string;
  plan: string;
  amount: string;
  currency: string;
  subscriptionStatus?: string;
  subscriptionNextCharge?: string;
}

const asRecord = (value: unknown): Record<string, unknown> => (
  value && typeof value === 'object' ? value as Record<string, unknown> : {}
);

const parsePayload = (data: unknown): Record<string, unknown> => {
  const root = asRecord(data);
  return asRecord(root.data ?? root);
};

const readString = (record: Record<string, unknown>, ...keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
};

export const getZohoPayWidgetConfig = (): ZohoPayWidgetConfig | null => {
  const accountId = import.meta.env.VITE_ZOHO_PAY_ACCOUNT_ID?.trim();
  const domain = import.meta.env.VITE_ZOHO_PAY_DOMAIN?.trim() || 'US';

  if (!accountId) return null;
  return { accountId, domain };
};

export const getZohoPayInitConfig = (apiKey?: string): ZohoPayInitConfig | null => {
  const widgetConfig = getZohoPayWidgetConfig();
  if (!widgetConfig) return null;

  const key = apiKey?.trim() || import.meta.env.VITE_ZOHO_PAY_API_KEY?.trim();

  return {
    account_id: widgetConfig.accountId,
    domain: widgetConfig.domain,
    otherOptions: key ? { api_key: key } : {},
  };
};

export const isZohoPayConfigured = (): boolean => Boolean(getZohoPayWidgetConfig());

export const isZohoPayMockMode = (): boolean => import.meta.env.VITE_ZOHO_PAY_USE_MOCK === 'true';

export const getZohoPaySetupAmount = (): number => {
  const raw = import.meta.env.VITE_ZOHO_PAY_SETUP_AMOUNT?.trim() || '1';
  const parsed = Number.parseFloat(raw);
  return Number.isNaN(parsed) ? 1 : parsed;
};

export const getZohoPayPlan = (): string => (
  import.meta.env.VITE_ZOHO_PAY_PLAN?.trim() || 'monthly'
);

export const parseEnsureCustomerResponse = (data: unknown): EnsureCustomerResponse => {
  const nested = parsePayload(data);
  const customerId = readString(nested, 'customerId', 'customer_id')
    ?? readString(asRecord(nested.customer), 'customer_id');

  if (!customerId) {
    throw new Error('Backend did not return customerId');
  }

  return { customerId };
};

export const parseCreateSessionResponse = (data: unknown): CreatePaymentSessionResponse => {
  const nested = parsePayload(data);

  const paymentsSessionId = readString(nested, 'paymentsSessionId', 'payments_session_id', 'sessionId', 'session_id')
    ?? readString(asRecord(nested.payments_session), 'payments_session_id');

  const amount = readString(nested, 'amount') ?? String(getZohoPaySetupAmount());
  const currencyCode = readString(nested, 'currencyCode', 'currency_code', 'currency') ?? 'USD';
  const apiKey = readString(nested, 'apiKey', 'api_key');

  if (!paymentsSessionId) {
    throw new Error('Backend did not return payments_session_id');
  }

  return { paymentsSessionId, amount, currencyCode, apiKey };
};

export const parseVerifyPaymentResponse = (data: unknown): VerifyPaymentResponse => {
  const nested = parsePayload(data);

  const paymentId = readString(nested, 'paymentId', 'payment_id');
  const status = readString(nested, 'status') ?? 'unknown';
  const customerId = readString(nested, 'customerId', 'customer_id') ?? '';
  const paymentMethodId = readString(nested, 'paymentMethodId', 'payment_method_id');
  const amount = readString(nested, 'amount') ?? String(getZohoPaySetupAmount());
  const currency = readString(nested, 'currency', 'currency_code') ?? 'USD';

  if (!paymentId) {
    throw new Error('Verify payment did not return payment_id');
  }

  return {
    success: nested.success !== false,
    paymentId,
    status,
    customerId,
    paymentMethodId,
    amount,
    currency,
  };
};

export const parseCreatePaymentMethodSessionResponse = (data: unknown): CreatePaymentMethodSessionResponse => {
  const nested = parsePayload(data);
  const widgetRaw = asRecord(nested.widget);

  const paymentMethodSessionId = readString(
    nested,
    'paymentMethodSessionId',
    'payment_method_session_id',
  );
  const customerId = readString(nested, 'customerId', 'customer_id') ?? '';
  const apiKey = readString(nested, 'apiKey', 'api_key');

  if (!paymentMethodSessionId) {
    throw new Error('Backend did not return payment_method_session_id');
  }

  const widget: PaymentMethodWidgetOptions = {
    payment_method: readString(widgetRaw, 'payment_method') ?? 'ach_debit',
    transaction_type: readString(widgetRaw, 'transaction_type') ?? 'add',
    customer_id: readString(widgetRaw, 'customer_id') ?? customerId,
    payment_method_session_id: readString(widgetRaw, 'payment_method_session_id') ?? paymentMethodSessionId,
  };

  return {
    paymentMethodSessionId,
    customerId: widget.customer_id,
    accountId: readString(nested, 'accountId', 'account_id'),
    apiKey,
    widget,
  };
};

export const parseSaveSubscriptionResponse = (data: unknown): SaveSubscriptionResponse => {
  const root = asRecord(data);
  const nested = parsePayload(data);
  const record = asRecord(nested);

  return {
    success: root.success !== false && nested.success !== false,
    isNew: typeof nested.isNew === 'boolean' ? nested.isNew : undefined,
    data: {
      id: typeof record.id === 'number' ? record.id : undefined,
      ownerId: readString(record, 'ownerId', 'owner_id'),
      zohoCustomerId: readString(record, 'zohoCustomerId', 'zoho_customer_id'),
      zohoPaymentId: readString(record, 'zohoPaymentId', 'zoho_payment_id'),
      zohoPaymentMethodId: readString(record, 'zohoPaymentMethodId', 'zoho_payment_method_id'),
      plan: readString(record, 'plan'),
      amount: readString(record, 'amount'),
      currency: readString(record, 'currency'),
      status: readString(record, 'status'),
      nextCharge: readString(record, 'nextCharge', 'next_charge'),
    },
  };
};

export const parseGetSubscriptionResponse = (data: unknown): GetSubscriptionResponse => {
  const nested = parsePayload(data);

  return {
    success: asRecord(data).success !== false,
    data: {
      ownerId: readString(nested, 'ownerId', 'owner_id'),
      plan: readString(nested, 'plan'),
      amount: readString(nested, 'amount'),
      currency: readString(nested, 'currency'),
      status: readString(nested, 'status'),
      nextCharge: readString(nested, 'nextCharge', 'next_charge'),
      zohoCustomerId: readString(nested, 'zohoCustomerId', 'zoho_customer_id'),
      zohoPaymentId: readString(nested, 'zohoPaymentId', 'zoho_payment_id'),
      zohoPaymentMethodId: readString(nested, 'zohoPaymentMethodId', 'zoho_payment_method_id'),
    },
  };
};

// ---------------------------------------------------------------------------
// Direct Zoho Pay REST API helpers (used when backend is unavailable/misconfigured)
// ---------------------------------------------------------------------------

const getZohoApiBase = (): string => {
  const domain = import.meta.env.VITE_ZOHO_PAY_DOMAIN?.trim() || 'US';
  return domain === 'IN' ? 'https://payments.zoho.in/api/v1' : 'https://payments.zoho.com/api/v1';
};

const zohoDirectHeaders = (): Record<string, string> => {
  const apiKey = import.meta.env.VITE_ZOHO_PAY_API_KEY?.trim() || '';
  return {
    'Authorization': `Zoho-oauthtoken ${apiKey}`,
    'Content-Type': 'application/json',
  };
};

const ensureCustomerDirect = async (
  payload: EnsureCustomerRequest,
): Promise<EnsureCustomerResponse> => {
  const base = getZohoApiBase();
  const headers = zohoDirectHeaders();

  const res = await fetch(`${base}/customers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      display_name: payload.name || payload.email,
      email: payload.email,
      ...(payload.phone ? { phone: payload.phone } : {}),
    }),
  });

  const data: unknown = await res.json().catch(() => ({}));
  const record = asRecord(data);

  // Zoho returns code 3008 when customer with this email already exists — grab existing ID
  if (!res.ok) {
    const existingId = readString(asRecord(record.customer ?? {}), 'customer_id')
      ?? readString(asRecord((asRecord(record.error_data ?? {})).customer ?? {}), 'customer_id');
    if (existingId) return { customerId: existingId };
    throw new Error(`Zoho customer API error (${res.status}): ${readString(record, 'message') ?? res.statusText}`);
  }

  const customerId = readString(asRecord(record.customer ?? {}), 'customer_id')
    ?? readString(record, 'customerId', 'customer_id');
  if (!customerId) throw new Error('Zoho did not return a customer_id');

  return { customerId };
};

const createPaymentSessionDirect = async (
  payload: CreatePaymentSessionRequest,
): Promise<CreatePaymentSessionResponse> => {
  const base = getZohoApiBase();
  const headers = zohoDirectHeaders();

  const res = await fetch(`${base}/paymentsessions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer_id: payload.customerId,
      amount: payload.amount ?? getZohoPaySetupAmount(),
      currency_code: payload.currency ?? 'USD',
    }),
  });

  const data: unknown = await res.json().catch(() => ({}));
  const record = asRecord(data);

  if (!res.ok) {
    throw new Error(`Zoho session API error (${res.status}): ${readString(record, 'message') ?? res.statusText}`);
  }

  const sessionRecord = asRecord(record.payments_session ?? record.paymentsSession ?? record);
  const paymentsSessionId = readString(sessionRecord, 'payments_session_id', 'paymentsSessionId', 'session_id')
    ?? readString(record, 'payments_session_id', 'paymentsSessionId');

  if (!paymentsSessionId) throw new Error('Zoho did not return a payments_session_id');

  return {
    paymentsSessionId,
    amount: String(payload.amount ?? getZohoPaySetupAmount()),
    currencyCode: payload.currency ?? 'USD',
    apiKey: import.meta.env.VITE_ZOHO_PAY_API_KEY?.trim(),
  };
};

// ---------------------------------------------------------------------------

export const ensureCustomer = async (payload: EnsureCustomerRequest): Promise<EnsureCustomerResponse> => {
  // Try backend first; fall back to direct Zoho API if backend fails
  try {
    if (!payload.onboardingId?.trim()) throw new Error('no-onboarding-id');
    const response = await api.post('/customer', {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      onboardingId: payload.onboardingId,
    });
    return parseEnsureCustomerResponse(response.data);
  } catch {
    return ensureCustomerDirect(payload);
  }
};

export const createPaymentSession = async (
  payload: CreatePaymentSessionRequest,
): Promise<CreatePaymentSessionResponse> => {
  // Try backend first; fall back to direct Zoho API if backend fails
  try {
    const response = await api.post('/create-session', {
      amount: payload.amount ?? getZohoPaySetupAmount(),
      currency: payload.currency ?? 'USD',
      customerId: payload.customerId,
      plan: payload.plan ?? getZohoPayPlan(),
    });
    const parsed = parseCreateSessionResponse(response.data);
    return parsed;
  } catch {
    return createPaymentSessionDirect(payload);
  }
};

/** Step 3 — verify payment after checkout widget success. */
export const verifyPayment = async (payload: VerifyPaymentRequest): Promise<VerifyPaymentResponse> => {
  try {
    const response = await api.post('/verify-payment', {
      payment_id: payload.payment_id,
    });
    return parseVerifyPaymentResponse(response.data);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/** Step 4 — create payment method session when verify did not return payment_method_id. */
export const createPaymentMethodSession = async (
  payload: CreatePaymentMethodSessionRequest,
): Promise<CreatePaymentMethodSessionResponse> => {
  try {
    const response = await api.post('/create-payment-method-session', {
      customerId: payload.customerId,
    });
    return parseCreatePaymentMethodSessionResponse(response.data);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/** Step 5 — persist subscription after payment + payment method are confirmed. */
export const saveSubscription = async (
  payload: SaveSubscriptionRequest,
): Promise<SaveSubscriptionResponse> => {
  try {
    const response = await api.post('/save-subscription', {
      payment_id: payload.payment_id,
      payment_method_id: payload.payment_method_id,
      customerId: payload.customerId,
      onboardingId: payload.onboardingId,
      plan: payload.plan ?? getZohoPayPlan(),
      amount: payload.amount,
      currency: payload.currency ?? 'USD',
    });
    return parseSaveSubscriptionResponse(response.data);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/** Step 6 (optional) — fetch subscription status for onboarding owner. */
export const getSubscriptionStatus = async (onboardingId: string): Promise<GetSubscriptionResponse> => {
  try {
    const response = await api.get(`/subscription/${encodeURIComponent(onboardingId)}`);
    return parseGetSubscriptionResponse(response.data);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

const readWidgetPaymentId = (result: ZohoPayWidgetSuccess): string => (
  typeof result.payment_id === 'string' ? result.payment_id.trim() : ''
);

const readWidgetPaymentMethodId = (result: ZohoPayWidgetSuccess): string => {
  if (typeof result.payment_method_id === 'string' && result.payment_method_id.trim()) {
    return result.payment_method_id.trim();
  }
  if (typeof result.mandate_id === 'string' && result.mandate_id.trim()) {
    return result.mandate_id.trim();
  }
  return '';
};

/**
 * Steps 3–5 after checkout widget: verify → (optional save-bank widget) → save subscription.
 */
export const finalizeZohoSubscription = async (options: {
  checkoutWidgetResult: ZohoPayWidgetSuccess;
  customerId: string;
  onboardingId: string;
  sessionId: string;
  amount: string | number;
  currency?: string;
  plan?: string;
  openSavePaymentMethodWidget: (
    widgetOptions: ZohoPayRequestPaymentMethodOptions,
    apiKey?: string,
  ) => Promise<ZohoPayWidgetSuccess>;
  onProgress?: (message: string) => void;
}): Promise<ZohoSubscriptionFinalizeResult> => {
  const paymentId = readWidgetPaymentId(options.checkoutWidgetResult);
  if (!paymentId) {
    throw new Error('Checkout widget did not return payment_id');
  }

  options.onProgress?.('Verifying payment…');
  const verified = await verifyPayment({ payment_id: paymentId });

  if (verified.status !== 'succeeded' && verified.status !== 'success') {
    throw new Error(`Payment verification failed (status: ${verified.status})`);
  }

  let paymentMethodId = verified.paymentMethodId ?? readWidgetPaymentMethodId(options.checkoutWidgetResult);
  let mandateId = readWidgetPaymentMethodId(options.checkoutWidgetResult) || paymentMethodId;

  if (!paymentMethodId) {
    options.onProgress?.('Saving bank account…');
    const pmSession = await createPaymentMethodSession({ customerId: options.customerId });
    const saveWidgetResult = await options.openSavePaymentMethodWidget(
      {
        payment_method: pmSession.widget.payment_method as ZohoPayRequestPaymentMethodOptions['payment_method'],
        transaction_type: 'add',
        customer_id: pmSession.widget.customer_id,
        payment_method_session_id: pmSession.widget.payment_method_session_id,
      },
      pmSession.apiKey,
    );

    paymentMethodId = readWidgetPaymentMethodId(saveWidgetResult);
    if (!paymentMethodId) {
      throw new Error('Save-bank widget did not return payment_method_id');
    }
    mandateId = paymentMethodId;
  }

  const plan = options.plan ?? getZohoPayPlan();
  const amount = options.amount ?? verified.amount;
  const currency = options.currency ?? verified.currency ?? 'USD';

  options.onProgress?.('Saving subscription…');
  const subscription = await saveSubscription({
    payment_id: verified.paymentId,
    payment_method_id: paymentMethodId,
    customerId: verified.customerId || options.customerId,
    onboardingId: options.onboardingId,
    plan,
    amount,
    currency,
  });

  if (!subscription.success) {
    throw new Error('Failed to save subscription');
  }

  return {
    customerId: verified.customerId || options.customerId,
    paymentId: verified.paymentId,
    paymentMethodId,
    mandateId: mandateId || paymentMethodId,
    sessionId: options.sessionId,
    paymentStatus: verified.status,
    plan: subscription.data?.plan ?? plan,
    amount: subscription.data?.amount ?? String(amount),
    currency: subscription.data?.currency ?? currency,
    subscriptionStatus: subscription.data?.status,
    subscriptionNextCharge: subscription.data?.nextCharge,
  };
};

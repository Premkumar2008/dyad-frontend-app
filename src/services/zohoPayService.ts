import api from './api';
import type { ZohoPayDomain, ZohoPayInitConfig, ZohoPayRequestPaymentMethodOptions, ZohoPayWidgetSuccess, ZPaymentsInstance } from '../types/zohoPay';
import type { ZohoPayFailureLogRequest } from '../types/zohoPayMandate';
import { extractZohoErrorMessage, isZohoWidgetClosedError, rethrowZohoServiceError, shouldUseDirectZohoFallback } from '../utils/zohoPayErrors';
import { withTimeout } from '../utils/zohoPayLoader';
import { deriveZohoSubscriptionStatus, isAcceptableZohoPaymentStatus, isFailedZohoPaymentStatus, normalizeZohoPaymentStatus } from '../utils/zohoPayMandate';

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
  onboardingId: string;
  payments_session_id: string;
  amount?: number | string;
  plan?: string;
  currency?: string;
}

export interface VerifySessionRequest {
  payments_session_id: string;
  onboardingId: string;
  amount?: number | string;
  plan?: string;
  currency?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  pending?: boolean;
  paymentId: string;
  payment_id?: string;
  status: string;
  customerId: string;
  customer_id?: string;
  paymentMethodId?: string;
  payment_method_id?: string;
  amount: string;
  currency: string;
  message?: string;
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
  payment_status?: string;
  session_id?: string;
  mandate_id?: string;
}

export interface SubscriptionRecord {
  id?: number;
  ownerId?: string;
  zohoCustomerId?: string;
  zohoPaymentId?: string;
  zohoPaymentMethodId?: string;
  zohoMandateId?: string;
  zohoSessionId?: string;
  paymentStatus?: string;
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
  const isTestMode = import.meta.env.VITE_ZOHO_PAY_TEST_MODE === 'true';
  const otherOptions: ZohoPayInitConfig['otherOptions'] = {};

  if (key) otherOptions.api_key = key;
  if (isTestMode) otherOptions.is_test_mode = true;

  return {
    account_id: widgetConfig.accountId,
    domain: widgetConfig.domain,
    otherOptions,
  };
};

export const isZohoPayTestMode = (): boolean => import.meta.env.VITE_ZOHO_PAY_TEST_MODE === 'true';

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
    const message = readString(nested, 'message') ?? readString(asRecord(data), 'message');
    if (message) throw new Error(message);
    throw new Error(JSON.stringify(data));
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
    const message = readString(nested, 'message') ?? readString(asRecord(data), 'message');
    if (message) throw new Error(message);
    throw new Error(JSON.stringify(data));
  }

  return { paymentsSessionId, amount, currencyCode, apiKey };
};

export const parseVerifyPaymentResponse = (data: unknown): VerifyPaymentResponse => {
  const root = asRecord(data);
  const nested = parsePayload(data);

  const paymentId = readString(nested, 'paymentId', 'payment_id')
    ?? readString(root, 'paymentId', 'payment_id');
  const status = readString(nested, 'status') ?? readString(root, 'status') ?? 'unknown';
  const customerId = readString(nested, 'customerId', 'customer_id')
    ?? readString(root, 'customerId', 'customer_id')
    ?? '';
  const paymentMethodId = readString(nested, 'paymentMethodId', 'payment_method_id')
    ?? readString(root, 'paymentMethodId', 'payment_method_id');
  const amount = readString(nested, 'amount') ?? readString(root, 'amount') ?? String(getZohoPaySetupAmount());
  const currency = readString(nested, 'currency', 'currency_code')
    ?? readString(root, 'currency', 'currency_code')
    ?? 'USD';
  const message = readString(nested, 'message') ?? readString(root, 'message');
  const success = root.success !== false && nested.success !== false;
  const pending = nested.pending === true
    || root.pending === true
    || normalizeZohoPaymentStatus(status) === 'pending'
    || normalizeZohoPaymentStatus(status) === 'processing';

  return {
    success,
    pending,
    paymentId: paymentId ?? '',
    payment_id: paymentId,
    status,
    customerId,
    customer_id: customerId,
    paymentMethodId,
    payment_method_id: paymentMethodId,
    amount,
    currency,
    message,
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
    const message = readString(nested, 'message') ?? readString(asRecord(data), 'message');
    if (message) throw new Error(message);
    throw new Error(JSON.stringify(data));
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
      zohoMandateId: readString(record, 'zohoMandateId', 'zoho_mandate_id'),
      zohoSessionId: readString(record, 'zohoSessionId', 'zoho_session_id'),
      paymentStatus: readString(record, 'paymentStatus', 'payment_status'),
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
    const message = readString(record, 'message') ?? readString(asRecord(record.error_data ?? {}), 'message');
    if (message) throw new Error(message);
    throw new Error(JSON.stringify(record));
  }

  const customerId = readString(asRecord(record.customer ?? {}), 'customer_id')
    ?? readString(record, 'customerId', 'customer_id');
  if (!customerId) {
    const message = readString(record, 'message');
    if (message) throw new Error(message);
    throw new Error(JSON.stringify(record));
  }

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
    const message = readString(record, 'message');
    if (message) throw new Error(message);
    throw new Error(JSON.stringify(record));
  }

  const sessionRecord = asRecord(record.payments_session ?? record.paymentsSession ?? record);
  const paymentsSessionId = readString(sessionRecord, 'payments_session_id', 'paymentsSessionId', 'session_id')
    ?? readString(record, 'payments_session_id', 'paymentsSessionId');

  if (!paymentsSessionId) {
    const message = readString(record, 'message');
    if (message) throw new Error(message);
    throw new Error(JSON.stringify(record));
  }

  return {
    paymentsSessionId,
    amount: String(payload.amount ?? getZohoPaySetupAmount()),
    currencyCode: payload.currency ?? 'USD',
    apiKey: import.meta.env.VITE_ZOHO_PAY_API_KEY?.trim(),
  };
};

// ---------------------------------------------------------------------------

export const ensureCustomer = async (payload: EnsureCustomerRequest): Promise<EnsureCustomerResponse> => {
  try {
    if (!payload.onboardingId?.trim()) throw new Error('no-onboarding-id');
    const response = await api.post('/customer', {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      onboardingId: payload.onboardingId,
    });
    return parseEnsureCustomerResponse(response.data);
  } catch (error) {
    if (!shouldUseDirectZohoFallback(error)) {
      rethrowZohoServiceError(error);
    }
    return ensureCustomerDirect(payload);
  }
};

export const createPaymentSession = async (
  payload: CreatePaymentSessionRequest,
): Promise<CreatePaymentSessionResponse> => {
  try {
    const response = await api.post('/create-session', {
      amount: payload.amount ?? getZohoPaySetupAmount(),
      currency: payload.currency ?? 'USD',
      customerId: payload.customerId,
      plan: payload.plan ?? getZohoPayPlan(),
    });
    return parseCreateSessionResponse(response.data);
  } catch (error) {
    if (!shouldUseDirectZohoFallback(error)) {
      rethrowZohoServiceError(error);
    }
    return createPaymentSessionDirect(payload);
  }
};

/** Option A — verify by payment_id when the widget returned one. */
export const verifyPayment = async (payload: VerifyPaymentRequest): Promise<VerifyPaymentResponse> => {
  try {
    const response = await api.post('/verify-payment', {
      payment_id: payload.payment_id,
      onboardingId: payload.onboardingId,
      payments_session_id: payload.payments_session_id,
      amount: payload.amount,
      plan: payload.plan ?? getZohoPayPlan(),
      currency: payload.currency ?? 'USD',
    });
    return parseVerifyPaymentResponse(response.data);
  } catch (error) {
    rethrowZohoServiceError(error);
  }
};

/** Option B — verify by session when ACH checkout has no payment_id yet. */
export const verifySession = async (payload: VerifySessionRequest): Promise<VerifyPaymentResponse> => {
  try {
    const response = await api.post('/verify-session', {
      payments_session_id: payload.payments_session_id,
      onboardingId: payload.onboardingId,
      amount: payload.amount,
      plan: payload.plan ?? getZohoPayPlan(),
      currency: payload.currency ?? 'USD',
    });
    return parseVerifyPaymentResponse(response.data);
  } catch (error) {
    rethrowZohoServiceError(error);
  }
};

/** Route to verify-payment or verify-session based on widget result. */
export const verifyCheckoutAfterWidget = async (options: {
  widgetResult: ZohoPayWidgetSuccess;
  onboardingId: string;
  paymentsSessionId: string;
  amount?: string | number;
  plan?: string;
  currency?: string;
}): Promise<VerifyPaymentResponse> => {
  const paymentId = readWidgetPaymentId(options.widgetResult);
  const common = {
    onboardingId: options.onboardingId,
    amount: options.amount,
    plan: options.plan ?? getZohoPayPlan(),
    currency: options.currency ?? 'USD',
  };

  if (paymentId) {
    return verifyPayment({
      payment_id: paymentId,
      payments_session_id: options.paymentsSessionId,
      ...common,
    });
  }

  return verifySession({
    payments_session_id: options.paymentsSessionId,
    ...common,
  });
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
    rethrowZohoServiceError(error);
  }
};

/** Step 2 — persist subscription only after verify-payment succeeds. */
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
      payment_status: payload.payment_status,
      session_id: payload.session_id,
      mandate_id: payload.mandate_id,
    });
    const parsed = parseSaveSubscriptionResponse(response.data);
    if (!parsed.success) {
      const message = extractZohoErrorMessage(response.data);
      if (message) throw new Error(message);
      throw new Error(JSON.stringify(response.data));
    }
    return parsed;
  } catch (error) {
    rethrowZohoServiceError(error);
  }
};

/** Step 6 (optional) — fetch subscription status for onboarding owner. */
export const getSubscriptionStatus = async (onboardingId: string): Promise<GetSubscriptionResponse> => {
  try {
    const response = await api.get(`/subscription/${encodeURIComponent(onboardingId)}`);
    return parseGetSubscriptionResponse(response.data);
  } catch (error) {
    rethrowZohoServiceError(error);
  }
};

export interface PaymentSessionPayment {
  paymentId: string;
  status: string;
  paymentMethodId?: string;
}

export interface PaymentSessionDetails {
  paymentsSessionId: string;
  sessionStatus: string;
  payments: PaymentSessionPayment[];
}

const PAYMENT_SESSION_POLL_INTERVAL_MS = 3000;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

export type PaymentSessionSettledResult =
  | {
    settled: true;
    success: true;
    failed: false;
    paymentId?: string;
    paymentMethodId?: string;
  }
  | {
    settled: true;
    success: false;
    failed: true;
    message?: string;
  };

const settledSuccess = (
  paymentId?: string,
  paymentMethodId?: string,
): PaymentSessionSettledResult => ({
  settled: true,
  success: true,
  failed: false,
  paymentId,
  paymentMethodId,
});

const settledFailure = (message?: string): PaymentSessionSettledResult => ({
  settled: true,
  success: false,
  failed: true,
  message,
});

const parsePaymentSessionPollResponse = (data: unknown): PaymentSessionSettledResult | null => {
  const root = asRecord(data);

  if (root.failed === true) {
    return settledFailure(readString(root, 'message'));
  }

  const nested = parsePayload(data);
  const nestedRecord = asRecord(nested);

  if (nestedRecord.failed === true) {
    return settledFailure(readString(nestedRecord, 'message') ?? readString(root, 'message'));
  }

  const session = parsePaymentSessionResponse(data);
  const recoverablePayment = findRecoverableSessionPayment(session);
  const failedPayment = session.payments.find((payment) => isFailedZohoPaymentStatus(payment.status));

  if (failedPayment) {
    return settledFailure(`Payment ${failedPayment.status}`);
  }

  const paymentId = readString(nestedRecord, 'payment_id', 'paymentId')
    ?? readString(root, 'payment_id', 'paymentId')
    ?? recoverablePayment?.paymentId;
  const paymentMethodId = readString(nestedRecord, 'payment_method_id', 'paymentMethodId')
    ?? recoverablePayment?.paymentMethodId;

  const rootSuccess = root.success === true;
  const nestedSuccess = nestedRecord.success === true;

  if (rootSuccess || nestedSuccess) {
    if (paymentId || recoverablePayment) {
      return settledSuccess(paymentId ?? recoverablePayment?.paymentId, paymentMethodId);
    }
  }

  if (recoverablePayment) {
    return settledSuccess(recoverablePayment.paymentId, recoverablePayment.paymentMethodId);
  }

  return null;
};

const toWidgetSuccessFromSettled = (
  settled: Extract<PaymentSessionSettledResult, { success: true }>,
): ZohoPayWidgetSuccess => ({
  ...(settled.paymentId ? { payment_id: settled.paymentId } : {}),
  ...(settled.paymentMethodId ? { payment_method_id: settled.paymentMethodId } : {}),
});

/** Poll GET /api/payment-session/:sid until success: true or failed: true. */
export const pollPaymentSessionUntilSettled = async (
  sessionId: string,
  maxWaitMs: number,
  onProgress?: (message: string) => void,
): Promise<PaymentSessionSettledResult> => {
  const deadline = Date.now() + maxWaitMs;
  let lastError: unknown;

  while (Date.now() < deadline) {
    onProgress?.('Confirming payment — please do not refresh or leave this page…');

    try {
      const response = await api.get(`/payment-session/${encodeURIComponent(sessionId)}`);
      const parsed = parsePaymentSessionPollResponse(response.data);
      if (parsed) {
        return parsed;
      }
    } catch (error) {
      if (!shouldUseDirectZohoFallback(error)) {
        lastError = error;
      } else {
        try {
          const session = await retrievePaymentSessionDirect(sessionId);
          const failedPayment = session.payments.find((payment) => isFailedZohoPaymentStatus(payment.status));
          if (failedPayment) {
            return settledFailure(`Payment ${failedPayment.status}`);
          }
          const payment = findRecoverableSessionPayment(session);
          if (payment) {
            return settledSuccess(payment.paymentId, payment.paymentMethodId);
          }
        } catch (directError) {
          lastError = directError;
        }
      }
    }

    if (Date.now() + PAYMENT_SESSION_POLL_INTERVAL_MS > deadline) break;
    await sleep(PAYMENT_SESSION_POLL_INTERVAL_MS);
  }

  if (lastError) rethrowZohoServiceError(lastError);
  throw new Error('Payment confirmation timed out. Please try again.');
};

/** @deprecated Use pollPaymentSessionUntilSettled */
export const pollPaymentSessionForWidgetResult = async (
  sessionId: string,
  maxWaitMs: number,
  onProgress?: (message: string) => void,
): Promise<ZohoPayWidgetSuccess> => {
  const settled = await pollPaymentSessionUntilSettled(sessionId, maxWaitMs, onProgress);
  if (settled.failed) {
    throw new Error(settled.message || 'Payment failed');
  }
  return toWidgetSuccessFromSettled(settled);
};

/**
 * Open Zoho checkout widget. On widget_closed (normal for ACH bank sign-in),
 * poll GET /api/payment-session/:sid — do not treat panel close as failure.
 * Caller must keep loader visible until this resolves and only then call instance.close().
 */
export const openCheckoutWithSessionPolling = async (
  instance: ZPaymentsInstance,
  widgetOptions: ZohoPayRequestPaymentMethodOptions,
  sessionId: string,
  timeoutMs: number,
  onProgress?: (message: string) => void,
): Promise<ZohoPayWidgetSuccess> => {
  const pollUntilSettled = async (): Promise<ZohoPayWidgetSuccess> => {
    const settled = await pollPaymentSessionUntilSettled(sessionId, timeoutMs, onProgress);
    if (settled.failed) {
      throw new Error(settled.message || 'Payment failed');
    }
    return toWidgetSuccessFromSettled(settled);
  };

  try {
    const widgetResult = await withTimeout(
      instance.requestPaymentMethod(widgetOptions),
      timeoutMs,
      '__WIDGET_TIMEOUT__',
    );

    const paymentId = readWidgetPaymentId(widgetResult);
    if (paymentId) {
      onProgress?.('Payment received — confirming with server…');
      return widgetResult;
    }

    onProgress?.('Confirming payment with server…');
    return pollUntilSettled();
  } catch (err) {
    if (isZohoWidgetClosedError(err)) {
      onProgress?.('Complete bank sign-in — confirming payment…');
      return pollUntilSettled();
    }

    const message = err instanceof Error ? err.message : '';
    if (message === '__WIDGET_TIMEOUT__') {
      onProgress?.('Still confirming payment — please do not refresh this page…');
      return pollUntilSettled();
    }

    throw err;
  }
};

/** @deprecated Use openCheckoutWithSessionPolling */
export const requestCheckoutWithRecovery = openCheckoutWithSessionPolling;

export const parsePaymentSessionResponse = (data: unknown): PaymentSessionDetails => {
  const nested = parsePayload(data);
  const session = asRecord(nested.payments_session ?? nested);
  const paymentsRaw = Array.isArray(session.payments) ? session.payments : [];

  const payments = paymentsRaw
    .map((entry) => {
      const record = asRecord(entry);
      const paymentId = readString(record, 'payment_id', 'paymentId');
      if (!paymentId) return null;
      return {
        paymentId,
        status: readString(record, 'status') ?? '',
        paymentMethodId: readString(record, 'payment_method_id', 'paymentMethodId'),
      };
    })
    .filter((entry): entry is PaymentSessionPayment => entry !== null);

  return {
    paymentsSessionId: readString(session, 'payments_session_id', 'paymentsSessionId') ?? '',
    sessionStatus: readString(session, 'status') ?? '',
    payments,
  };
};

const findRecoverableSessionPayment = (
  session: PaymentSessionDetails,
): PaymentSessionPayment | null => {
  for (const payment of session.payments) {
    if (payment.paymentId && isAcceptableZohoPaymentStatus(payment.status)) {
      return payment;
    }
  }
  return null;
};

const toWidgetSuccessFromSessionPayment = (
  payment: PaymentSessionPayment,
): ZohoPayWidgetSuccess => ({
  payment_id: payment.paymentId,
  ...(payment.paymentMethodId ? { payment_method_id: payment.paymentMethodId } : {}),
});

const retrievePaymentSessionDirect = async (
  sessionId: string,
): Promise<PaymentSessionDetails> => {
  const base = getZohoApiBase();
  const accountId = import.meta.env.VITE_ZOHO_PAY_ACCOUNT_ID?.trim();
  if (!accountId) throw new Error('Zoho Pay account ID is not configured');

  const res = await fetch(
    `${base}/paymentsessions/${encodeURIComponent(sessionId)}?account_id=${encodeURIComponent(accountId)}`,
    { headers: zohoDirectHeaders() },
  );

  const data: unknown = await res.json().catch(() => ({}));
  const record = asRecord(data);

  if (!res.ok) {
    const message = readString(record, 'message');
    if (message) throw new Error(message);
    throw new Error(JSON.stringify(record));
  }

  return parsePaymentSessionResponse(data);
};

/** Fetch payment session details — used to recover when the checkout widget does not callback. */
export const retrievePaymentSession = async (
  sessionId: string,
): Promise<PaymentSessionDetails> => {
  try {
    const response = await api.get(`/payment-session/${encodeURIComponent(sessionId)}`);
    return parsePaymentSessionResponse(response.data);
  } catch (error) {
    if (!shouldUseDirectZohoFallback(error)) {
      rethrowZohoServiceError(error);
    }
    return retrievePaymentSessionDirect(sessionId);
  }
};

/**
 * After Zoho widget completes:
 *   1. POST /verify-payment (payment_id) or POST /verify-session (ACH, no payment_id)
 *   2. POST /save-subscription when verify.success (pending ACH is expected)
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
  const plan = options.plan ?? getZohoPayPlan();
  const amount = options.amount ?? getZohoPaySetupAmount();
  const currency = options.currency ?? 'USD';

  options.onProgress?.('Verifying payment…');
  const verify = await verifyCheckoutAfterWidget({
    widgetResult: options.checkoutWidgetResult,
    onboardingId: options.onboardingId,
    paymentsSessionId: options.sessionId,
    amount,
    plan,
    currency,
  });

  if (!verify.success) {
    throw new Error(verify.message?.trim() || JSON.stringify(verify));
  }

  if (!verify.paymentId && !verify.pending) {
    throw new Error(verify.message?.trim() || JSON.stringify(verify));
  }

  let paymentMethodId = verify.paymentMethodId ?? readWidgetPaymentMethodId(options.checkoutWidgetResult);
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
      throw new Error(extractZohoErrorMessage(saveWidgetResult) || JSON.stringify(saveWidgetResult));
    }
    mandateId = paymentMethodId;
  }

  // Step 2 — save-subscription only after verify succeeds
  options.onProgress?.('Saving subscription…');
  const subscription = await saveSubscription({
    payment_id: verify.paymentId,
    payment_method_id: paymentMethodId,
    customerId: verify.customerId || options.customerId,
    onboardingId: options.onboardingId,
    plan,
    amount: verify.amount || amount,
    currency: verify.currency || currency,
    payment_status: verify.status,
    session_id: options.sessionId,
    mandate_id: mandateId || paymentMethodId,
  });

  if (!subscription.success) {
    throw new Error(JSON.stringify(subscription));
  }

  const subscriptionStatus = subscription.data?.status
    ?? (verify.pending
      ? 'pending'
      : deriveZohoSubscriptionStatus(verify.status));

  return {
    customerId: verify.customerId || options.customerId,
    paymentId: verify.paymentId,
    paymentMethodId,
    mandateId: mandateId || paymentMethodId,
    sessionId: options.sessionId,
    paymentStatus: verify.status,
    plan: subscription.data?.plan ?? plan,
    amount: subscription.data?.amount ?? String(verify.amount || amount),
    currency: subscription.data?.currency ?? (verify.currency || currency),
    subscriptionStatus,
    subscriptionNextCharge: subscription.data?.nextCharge,
  };
};

/** Best-effort failure log for reconciliation and support. */
export const logZohoPayFailure = async (payload: ZohoPayFailureLogRequest): Promise<void> => {
  try {
    await api.post('/zoho/payment-failure', payload);
  } catch {
    // Non-blocking — local onboarding flow should continue to show the error to the user.
  }
};

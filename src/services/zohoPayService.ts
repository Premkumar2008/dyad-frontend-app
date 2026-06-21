import api, { handleApiError } from './api';
import type { ZohoPayDomain, ZohoPayInitConfig, ZohoPayWidgetSuccess } from '../types/zohoPay';

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

export interface SaveMandateRequest {
  customerId: string;
  result: ZohoPayWidgetSuccess;
  onboardingId?: string;
}

export interface SaveMandateResponse {
  success: boolean;
  mandateId?: string;
  paymentId?: string;
  paymentMethodId?: string;
}

const asRecord = (value: unknown): Record<string, unknown> => (
  value && typeof value === 'object' ? value as Record<string, unknown> : {}
);

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

/** ZPayments init — uses widget api_key from env or create-session response. */
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
  const raw = import.meta.env.VITE_ZOHO_PAY_SETUP_AMOUNT?.trim() || '49.99';
  const parsed = Number.parseFloat(raw);
  return Number.isNaN(parsed) ? 49.99 : parsed;
};

export const getZohoPayPlan = (): string => (
  import.meta.env.VITE_ZOHO_PAY_PLAN?.trim() || 'monthly'
);

export const parseEnsureCustomerResponse = (data: unknown): EnsureCustomerResponse => {
  const nested = asRecord(asRecord(data).data ?? data);
  const customerId = readString(nested, 'customerId', 'customer_id')
    ?? readString(asRecord(nested.customer), 'customer_id');

  if (!customerId) {
    throw new Error('Backend did not return customerId');
  }

  return { customerId };
};

export const parseCreateSessionResponse = (data: unknown): CreatePaymentSessionResponse => {
  const nested = asRecord(asRecord(data).data ?? data);

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

export const ensureCustomer = async (payload: EnsureCustomerRequest): Promise<EnsureCustomerResponse> => {
  if (!payload.onboardingId?.trim()) {
    throw new Error('Onboarding ID is required before Zoho Pay checkout');
  }

  try {
    const response = await api.post('/customer', {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      onboardingId: payload.onboardingId,
    });
    return parseEnsureCustomerResponse(response.data);
  } catch (error) {
    throw new Error(handleApiError(error));
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
    throw new Error(handleApiError(error));
  }
};

export const saveMandate = async (payload: SaveMandateRequest): Promise<SaveMandateResponse> => {
  try {
    const response = await api.post('/save-mandate', {
      customerId: payload.customerId,
      result: payload.result,
      onboardingId: payload.onboardingId,
    });
    const nested = asRecord(response.data?.data ?? response.data);
    const result = asRecord(payload.result);

    return {
      success: nested.success !== false,
      mandateId: readString(nested, 'mandateId', 'mandate_id') ?? readString(result, 'mandate_id'),
      paymentId: readString(nested, 'paymentId', 'payment_id') ?? readString(result, 'payment_id'),
      paymentMethodId: readString(nested, 'paymentMethodId', 'payment_method_id') ?? readString(result, 'payment_method_id'),
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

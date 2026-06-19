import api, { handleApiError } from './api';
import type { ZohoPayDomain, ZohoPayInitConfig, ZohoPayWidgetSuccess } from '../types/zohoPay';

export interface ZohoPayWidgetConfig {
  accountId: string;
  apiKey: string;
  domain: ZohoPayDomain;
}

export interface CreatePaymentSessionRequest {
  amount?: string;
  currency?: string;
  onboardingId?: string;
  email?: string;
  name?: string;
}

export interface CreatePaymentSessionResponse {
  sessionId: string;
  amount: string;
  currencyCode: string;
}

export interface SaveMandateRequest {
  onboardingId?: string;
  paymentId?: string;
  paymentMethodId?: string;
  customerId?: string;
  mandateId?: string;
  sessionId?: string;
  widgetResult?: ZohoPayWidgetSuccess;
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
  const apiKey = import.meta.env.VITE_ZOHO_PAY_API_KEY?.trim();
  const domain = import.meta.env.VITE_ZOHO_PAY_DOMAIN?.trim() || 'US';

  if (!accountId || !apiKey) return null;
  return { accountId, apiKey, domain };
};

export const getZohoPayInitConfig = (): ZohoPayInitConfig | null => {
  const widgetConfig = getZohoPayWidgetConfig();
  if (!widgetConfig) return null;

  return {
    account_id: widgetConfig.accountId,
    domain: widgetConfig.domain,
    otherOptions: { api_key: widgetConfig.apiKey },
  };
};

export const isZohoPayConfigured = (): boolean => Boolean(getZohoPayWidgetConfig());

export const isZohoPayMockMode = (): boolean => import.meta.env.VITE_ZOHO_PAY_USE_MOCK === 'true';

export const getZohoPaySetupAmount = (): string => (
  import.meta.env.VITE_ZOHO_PAY_SETUP_AMOUNT?.trim() || '49.99'
);

export const parseCreateSessionResponse = (data: unknown): CreatePaymentSessionResponse => {
  const root = asRecord(data);
  const nested = asRecord(root.data ?? root);

  const sessionId = readString(nested, 'sessionId', 'session_id', 'paymentsSessionId', 'payments_session_id')
    ?? readString(asRecord(nested.payments_session), 'payments_session_id');

  const amount = readString(nested, 'amount') ?? getZohoPaySetupAmount();
  const currencyCode = readString(nested, 'currencyCode', 'currency_code', 'currency') ?? 'USD';

  if (!sessionId) {
    throw new Error('Backend did not return a payment session id');
  }

  return { sessionId, amount, currencyCode };
};

export const createPaymentSession = async (
  payload: CreatePaymentSessionRequest = {},
): Promise<CreatePaymentSessionResponse> => {
  try {
    const response = await api.post('/create-session', {
      amount: payload.amount ?? getZohoPaySetupAmount(),
      currency: payload.currency ?? 'USD',
      onboardingId: payload.onboardingId,
      email: payload.email,
      name: payload.name,
    });
    return parseCreateSessionResponse(response.data);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const saveMandate = async (payload: SaveMandateRequest): Promise<SaveMandateResponse> => {
  try {
    const response = await api.post('/save-mandate', {
      onboardingId: payload.onboardingId,
      session_id: payload.sessionId,
      payment_id: payload.paymentId,
      payment_method_id: payload.paymentMethodId,
      customer_id: payload.customerId,
      mandate_id: payload.mandateId,
      ...payload.widgetResult,
    });
    const nested = asRecord(response.data?.data ?? response.data);
    return {
      success: nested.success !== false,
      mandateId: readString(nested, 'mandateId', 'mandate_id'),
      paymentId: readString(nested, 'paymentId', 'payment_id'),
      paymentMethodId: readString(nested, 'paymentMethodId', 'payment_method_id'),
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

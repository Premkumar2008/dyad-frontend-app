import api, { handleApiError } from './api';
import type { ZohoPayDomain } from '../types/zohoPay';
import type {
  ZohoPaymentMethodSession,
  ZohoPaymentMethodSessionCreateResponse,
  ZohoPaymentMethodSessionRetrieveResponse,
  ZohoPaymentSessionCreateResponse,
} from '../types/zohoPayApi';

export interface ZohoPayWidgetConfig {
  accountId: string;
  apiKey: string;
  domain: ZohoPayDomain;
}

/** Primary US flow: save ACH via payment method session widget. */
export type AchMandateFlow = 'payment_method' | 'payment';

export interface AchMandateSetupRequest {
  email: string;
  name: string;
  phone?: string;
  onboardingId?: string;
  reference?: string;
  description?: string;
  customerId?: string;
}

export interface AchMandateSetupResponse {
  flow: AchMandateFlow;
  customerId: string;
  paymentMethodSessionId?: string;
  paymentsSessionId?: string;
  amount?: string;
  currencyCode?: string;
  currencySymbol?: string;
  business?: string;
  description?: string;
  invoiceNumber?: string;
}

export interface AchMandateConfirmRequest {
  onboardingId?: string;
  customerId?: string;
  paymentMethodId?: string;
  paymentId?: string;
  paymentsSessionId?: string;
  paymentMethodSessionId?: string;
}

export interface AchMandateConfirmResponse {
  mandateId: string;
  status: string;
  paymentMethodId: string;
  customerId?: string;
  paymentMethodType?: string;
  sessionStatus?: string;
}

export interface ZohoAchActivateResult {
  mandateId: string;
  paymentMethodId: string;
  customerId: string;
  activatedAt: string;
  status: string;
  paymentMethodType?: string;
  sessionStatus?: string;
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

const readNestedRecord = (record: Record<string, unknown>, ...keys: string[]): Record<string, unknown> => {
  for (const key of keys) {
    const nested = asRecord(record[key]);
    if (Object.keys(nested).length > 0) return nested;
  }
  return {};
};

/** Parse Dyad backend or passthrough Zoho create-session payloads. */
export const parseAchMandateSetupResponse = (data: unknown): AchMandateSetupResponse => {
  const nested = parsePayload(data);

  const paymentMethodSession = readNestedRecord(
    nested,
    'payment_method_session',
    'paymentMethodSession',
  ) as ZohoPaymentMethodSession;

  const paymentSession = readNestedRecord(
    nested,
    'payments_session',
    'paymentSession',
  ) as ZohoPaymentSessionCreateResponse['payments_session'];

  const customerId = readString(nested, 'customerId', 'customer_id')
    ?? paymentMethodSession.customer_id;

  const paymentMethodSessionId = readString(
    nested,
    'paymentMethodSessionId',
    'payment_method_session_id',
  ) ?? paymentMethodSession.payment_method_session_id;

  const paymentsSessionId = readString(nested, 'paymentsSessionId', 'payments_session_id')
    ?? paymentSession?.payments_session_id;

  const flow: AchMandateFlow = paymentsSessionId && !paymentMethodSessionId ? 'payment' : 'payment_method';

  if (!customerId) {
    throw new Error('ACH setup response is missing customer_id');
  }

  if (flow === 'payment_method' && !paymentMethodSessionId) {
    throw new Error('ACH setup response is missing payment_method_session_id');
  }

  if (flow === 'payment' && !paymentsSessionId) {
    throw new Error('ACH setup response is missing payments_session_id');
  }

  return {
    flow,
    customerId,
    paymentMethodSessionId,
    paymentsSessionId,
    amount: readString(nested, 'amount') ?? paymentSession?.amount,
    currencyCode: readString(nested, 'currencyCode', 'currency_code', 'currency') ?? 'USD',
    currencySymbol: readString(nested, 'currencySymbol', 'currency_symbol') ?? '$',
    business: readString(nested, 'business'),
    description: readString(nested, 'description') ?? paymentSession?.description,
    invoiceNumber: readString(nested, 'invoiceNumber', 'invoice_number') ?? paymentSession?.invoice_number,
  };
};

/** Parse Dyad backend confirm or passthrough Zoho retrieve-session payloads. */
export const parseAchMandateConfirmResponse = (data: unknown): AchMandateConfirmResponse => {
  const nested = parsePayload(data);

  const paymentMethodSession = readNestedRecord(
    nested,
    'payment_method_session',
    'paymentMethodSession',
  ) as ZohoPaymentMethodSessionRetrieveResponse['payment_method_session'];

  const paymentMethod = paymentMethodSession?.payment_method;

  const paymentMethodId = readString(nested, 'paymentMethodId', 'payment_method_id')
    ?? paymentMethod?.payment_method_id;

  const mandateId = readString(nested, 'mandateId', 'mandate_id') ?? paymentMethodId;

  if (!mandateId || !paymentMethodId) {
    throw new Error('Server did not return a payment_method_id');
  }

  const sessionStatus = readString(
    asRecord(paymentMethodSession),
    'status',
  ) ?? readString(nested, 'sessionStatus', 'session_status');

  const paymentMethodStatus = readString(
    asRecord(paymentMethod),
    'status',
  ) ?? readString(nested, 'status') ?? 'active';

  return {
    mandateId,
    paymentMethodId,
    customerId: readString(nested, 'customerId', 'customer_id') ?? paymentMethodSession?.customer_id,
    status: paymentMethodStatus,
    paymentMethodType: paymentMethod?.type ?? readString(nested, 'paymentMethodType', 'payment_method_type'),
    sessionStatus,
  };
};

export const getZohoPayWidgetConfig = (): ZohoPayWidgetConfig | null => {
  const accountId = import.meta.env.VITE_ZOHO_PAY_ACCOUNT_ID?.trim();
  const apiKey = import.meta.env.VITE_ZOHO_PAY_API_KEY?.trim();
  const domain = import.meta.env.VITE_ZOHO_PAY_DOMAIN?.trim() || 'US';

  if (!accountId || !apiKey) return null;
  return { accountId, apiKey, domain };
};

export const isZohoPayConfigured = (): boolean => Boolean(getZohoPayWidgetConfig());

export const isZohoPayMockMode = (): boolean => import.meta.env.VITE_ZOHO_PAY_USE_MOCK === 'true';

export const createAchMandateSetupSession = async (
  payload: AchMandateSetupRequest,
): Promise<AchMandateSetupResponse> => {
  try {
    const response = await api.post('/zoho-pay/ach-mandate/setup', {
      email: payload.email,
      name: payload.name,
      phone: payload.phone,
      onboardingId: payload.onboardingId,
      reference: payload.reference,
      customer_id: payload.customerId,
      description: payload.description
        ?? (payload.onboardingId
          ? `Dyad onboarding ACH mandate · ${payload.onboardingId}`
          : 'Dyad onboarding ACH mandate setup'),
    });
    return parseAchMandateSetupResponse(response.data);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const confirmAchMandateSetup = async (
  payload: AchMandateConfirmRequest,
): Promise<AchMandateConfirmResponse> => {
  if (!payload.paymentMethodSessionId && !payload.paymentsSessionId) {
    throw new Error('Missing payment_method_session_id for confirmation');
  }

  try {
    const response = await api.post('/zoho-pay/ach-mandate/confirm', {
      onboardingId: payload.onboardingId,
      customer_id: payload.customerId,
      payment_method_id: payload.paymentMethodId,
      payment_id: payload.paymentId,
      payments_session_id: payload.paymentsSessionId,
      payment_method_session_id: payload.paymentMethodSessionId,
    });
    return parseAchMandateConfirmResponse(response.data);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

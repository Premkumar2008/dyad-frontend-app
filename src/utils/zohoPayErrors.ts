import type { ZohoPayInitConfig } from '../types/zohoPay';

const readString = (record: Record<string, unknown>, ...keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
};

/** Extract the message Zoho (or our Zoho proxy API) returned — no custom wrapping. */
export const extractZohoErrorMessage = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value.trim();

  if (value instanceof Error && value.message.trim()) {
    return value.message.trim();
  }

  if (!value || typeof value !== 'object') return undefined;

  const record = value as Record<string, unknown>;

  const response = record.response;
  if (response && typeof response === 'object') {
    const responseRecord = response as Record<string, unknown>;
    const fromData = extractZohoErrorMessage(responseRecord.data);
    if (fromData) return fromData;
  }

  const message = readString(record, 'message', 'error', 'error_message', 'description');
  if (message) return message;

  const nestedData = record.data;
  if (nestedData && typeof nestedData === 'object') {
    const fromNested = extractZohoErrorMessage(nestedData);
    if (fromNested) return fromNested;
  }

  return undefined;
};

export const formatZohoPayError = (err: unknown): string => (
  extractZohoErrorMessage(err) ?? (err instanceof Error ? err.message : String(err))
);

export const rethrowZohoServiceError = (error: unknown): never => {
  const message = extractZohoErrorMessage(error);
  if (message) throw new Error(message);
  if (error instanceof Error) throw error;
  throw new Error(String(error));
};

export const isZohoWidgetClosedError = (err: unknown): boolean => (
  err !== null
  && typeof err === 'object'
  && 'code' in err
  && String((err as { code?: string }).code) === 'widget_closed'
);

const shouldFallbackToDirectZoho = (error: unknown): boolean => {
  if (!error || typeof error !== 'object' || !('response' in error)) return true;
  return !(error as { response?: unknown }).response;
};

export const shouldUseDirectZohoFallback = shouldFallbackToDirectZoho;

export const buildZPaymentsConfig = (apiKey?: string): ZohoPayInitConfig | null => {
  const accountId = import.meta.env.VITE_ZOHO_PAY_ACCOUNT_ID?.trim();
  const domain = import.meta.env.VITE_ZOHO_PAY_DOMAIN?.trim() || 'US';
  const key = apiKey?.trim() || import.meta.env.VITE_ZOHO_PAY_API_KEY?.trim();
  const isTestMode = import.meta.env.VITE_ZOHO_PAY_TEST_MODE === 'true';
  const otherOptions: ZohoPayInitConfig['otherOptions'] = {};

  if (key) otherOptions.api_key = key;
  if (isTestMode) otherOptions.is_test_mode = true;

  if (!accountId) return null;

  return {
    account_id: accountId,
    domain,
    otherOptions,
  };
};

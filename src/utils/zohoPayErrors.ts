import type { ZohoPayInitConfig } from '../types/zohoPay';

export const formatZohoPayError = (err: unknown): string => {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === 'object') {
    const record = err as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message.trim()) return record.message;
    if (typeof record.error === 'string' && record.error.trim()) return record.error;
    if (typeof record.code === 'string' && record.code.trim()) return `Zoho Pay error (${record.code})`;
  }
  return 'Payment authorization failed';
};

export const isZohoWidgetClosedError = (err: unknown): boolean => (
  err !== null
  && typeof err === 'object'
  && 'code' in err
  && String((err as { code?: string }).code) === 'widget_closed'
);

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

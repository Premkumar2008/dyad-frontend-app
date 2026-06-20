import { ZOHO_PAY_SCRIPT_URL } from '../constants/zohoPay';
import { getZohoPayInitConfig } from '../services/zohoPayService';
import type { ZohoPayInitConfig, ZPaymentsInstance } from '../types/zohoPay';

let zPaymentsInstance: ZPaymentsInstance | null = null;

export function loadZohoPayScript(): Promise<void> {
  if (typeof window.ZPayments === 'function') {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${ZOHO_PAY_SCRIPT_URL}"]`);
    if (existing) {
      if (typeof window.ZPayments === 'function') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Zoho Pay script')));
      return;
    }

    reject(new Error('Zoho Pay script not found — add zpayments.js to index.html'));
  });
}

export async function getZPaymentsInstance(config?: ZohoPayInitConfig): Promise<ZPaymentsInstance> {
  await loadZohoPayScript();

  if (!window.ZPayments) {
    throw new Error('Zoho Pay SDK is unavailable');
  }

  const initConfig = config ?? getZohoPayInitConfig();
  if (!initConfig) {
    throw new Error('Zoho Pay is not configured. Set VITE_ZOHO_PAY_ACCOUNT_ID.');
  }

  if (!zPaymentsInstance) {
    zPaymentsInstance = new window.ZPayments(initConfig);
  }

  return zPaymentsInstance;
}

export async function closeZPaymentsInstance(): Promise<void> {
  if (!zPaymentsInstance) return;
  try {
    await zPaymentsInstance.close();
  } catch {
    // Widget may already be closed.
  }
}

export function resetZPaymentsInstance(): void {
  zPaymentsInstance = null;
}

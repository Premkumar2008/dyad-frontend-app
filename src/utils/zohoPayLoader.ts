import { ZOHO_PAY_SCRIPT_URL } from '../constants/zohoPay';
import { getZohoPayInitConfig } from '../services/zohoPayService';
import type { ZohoPayInitConfig, ZPaymentsInstance } from '../types/zohoPay';

let scriptPromise: Promise<void> | null = null;
let zPaymentsInstance: ZPaymentsInstance | null = null;

export function loadZohoPayScript(): Promise<void> {
  if (typeof window.ZPayments === 'function') {
    return Promise.resolve();
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${ZOHO_PAY_SCRIPT_URL}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load Zoho Pay script')));
        return;
      }

      const script = document.createElement('script');
      script.src = ZOHO_PAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Zoho Pay script'));
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

export async function getZPaymentsInstance(config?: ZohoPayInitConfig): Promise<ZPaymentsInstance> {
  await loadZohoPayScript();

  if (!window.ZPayments) {
    throw new Error('Zoho Pay SDK is unavailable');
  }

  const initConfig = config ?? getZohoPayInitConfig();
  if (!initConfig) {
    throw new Error('Zoho Pay is not configured. Set VITE_ZOHO_PAY_ACCOUNT_ID and VITE_ZOHO_PAY_API_KEY.');
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

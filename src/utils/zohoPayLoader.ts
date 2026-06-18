import type { ZohoPayInitConfig, ZPaymentsInstance } from '../types/zohoPay';
import { ZOHO_PAY_SCRIPT_URL } from '../constants/zohoPay';

const SCRIPT_URL = ZOHO_PAY_SCRIPT_URL;

let scriptPromise: Promise<void> | null = null;
let zPaymentsInstance: ZPaymentsInstance | null = null;

export function loadZohoPayScript(): Promise<void> {
  if (typeof window.ZPayments === 'function') {
    return Promise.resolve();
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
      if (existing) {
        if (typeof window.ZPayments === 'function') {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load Zoho Pay script')));
        return;
      }

      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Zoho Pay script'));
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

export async function getZPaymentsInstance(config: ZohoPayInitConfig): Promise<ZPaymentsInstance> {
  await loadZohoPayScript();
  if (!window.ZPayments) {
    throw new Error('Zoho Pay SDK is unavailable');
  }

  if (!zPaymentsInstance) {
    zPaymentsInstance = new window.ZPayments(config);
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

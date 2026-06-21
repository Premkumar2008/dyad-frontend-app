import { ZOHO_PAY_SCRIPT_URL } from '../constants/zohoPay';
import type { ZohoPayInitConfig, ZPaymentsInstance } from '../types/zohoPay';
import { buildZPaymentsConfig } from './zohoPayErrors';

const CLOSE_TIMEOUT_MS = 5000;

/** Never remove the React mount node or our widget container. */
const PROTECTED_ELEMENT_IDS = new Set(['root', 'zpay-card']);

let zPaymentsInstance: ZPaymentsInstance | null = null;
let activeConfigKey = '';

const configFingerprint = (config: ZohoPayInitConfig): string => (
  JSON.stringify({
    account_id: config.account_id,
    domain: config.domain,
    api_key: config.otherOptions?.api_key ?? '',
  })
);

const isZohoSdkOverlayElement = (el: Element): boolean => {
  if (PROTECTED_ELEMENT_IDS.has(el.id)) return false;

  const id = el.id.toLowerCase();
  const className = el.className?.toString().toLowerCase() ?? '';

  if (id.includes('zpay') || id.includes('zoho')) return true;
  if (className.includes('zpay') || className.includes('zoho')) return true;

  if (el instanceof HTMLIFrameElement) {
    return /zoho|zpay/i.test(el.src);
  }

  return false;
};

export function restorePageScroll(): void {
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.documentElement.style.overflow = '';
}

/** Remove only Zoho SDK overlay nodes (never #root or app content). */
export function forceClearZohoPayOverlay(): void {
  document.querySelectorAll('body > div, body > iframe').forEach((el) => {
    if (PROTECTED_ELEMENT_IDS.has(el.id)) return;
    if (isZohoSdkOverlayElement(el)) {
      el.remove();
    }
  });
  restorePageScroll();
}

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

  const initConfig = config ?? buildZPaymentsConfig();
  if (!initConfig) {
    throw new Error('Zoho Pay is not configured. Set VITE_ZOHO_PAY_ACCOUNT_ID.');
  }

  const fingerprint = configFingerprint(initConfig);
  if (!zPaymentsInstance || fingerprint !== activeConfigKey) {
    await closeZPaymentsInstanceSafely();
    zPaymentsInstance = new window.ZPayments(initConfig);
    activeConfigKey = fingerprint;
  }

  return zPaymentsInstance;
}

export async function closeZPaymentsInstanceSafely(): Promise<void> {
  const instance = zPaymentsInstance;

  if (!instance) {
    restorePageScroll();
    return;
  }

  try {
    await Promise.race([
      instance.close(),
      new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Zoho Pay close timed out')), CLOSE_TIMEOUT_MS);
      }),
    ]);
  } catch {
    forceClearZohoPayOverlay();
  } finally {
    resetZPaymentsInstance();
    restorePageScroll();
  }
}

/** @deprecated Use closeZPaymentsInstanceSafely */
export async function closeZPaymentsInstance(): Promise<void> {
  await closeZPaymentsInstanceSafely();
}

export function resetZPaymentsInstance(): void {
  zPaymentsInstance = null;
  activeConfigKey = '';
}

export function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

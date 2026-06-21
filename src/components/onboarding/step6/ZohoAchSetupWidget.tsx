import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ZOHO_PAY_MERCHANT_NAME } from '../../../constants/zohoPay';
import {
  createPaymentSession,
  ensureCustomer,
  getZohoPayInitConfig,
  getZohoPayPlan,
  getZohoPaySetupAmount,
  isZohoPayConfigured,
  isZohoPayMockMode,
  saveMandate,
} from '../../../services/zohoPayService';
import type { ZohoPayWidgetSuccess } from '../../../types/zohoPay';
import { formatZohoPayError, isZohoWidgetClosedError } from '../../../utils/zohoPayErrors';
import {
  closeZPaymentsInstanceSafely,
  getZPaymentsInstance,
  loadZohoPayScript,
  restorePageScroll,
  withTimeout,
} from '../../../utils/zohoPayLoader';

export interface ZohoAchMandateResult {
  customerId: string;
  paymentId: string;
  paymentMethodId: string;
  mandateId: string;
  sessionId: string;
}

interface ZohoAchSetupWidgetProps {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onboardingId?: string;
  mandateActive: boolean;
  paymentId?: string;
  paymentMethodId?: string;
  disabled?: boolean;
  onMandateSaved: (result: ZohoAchMandateResult) => void;
}

interface CheckoutContext {
  customerId: string;
  paymentsSessionId: string;
  amount: string;
  currencyCode: string;
  apiKey?: string;
}

const WIDGET_TIMEOUT_MS = 120_000;

const readWidgetIds = (result: ZohoPayWidgetSuccess) => {
  const paymentId = typeof result.payment_id === 'string' ? result.payment_id : '';
  const paymentMethodId = typeof result.payment_method_id === 'string'
    ? result.payment_method_id
    : (typeof result.mandate_id === 'string' ? result.mandate_id : '');
  const mandateId = typeof result.mandate_id === 'string'
    ? result.mandate_id
    : paymentMethodId;

  return { paymentId, paymentMethodId, mandateId };
};

export const ZohoAchSetupWidget: React.FC<ZohoAchSetupWidgetProps> = ({
  customerName = '',
  customerEmail = '',
  customerPhone = '',
  onboardingId = '',
  mandateActive,
  paymentId = '',
  paymentMethodId = '',
  disabled = false,
  onMandateSaved,
}) => {
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const checkoutRef = useRef<CheckoutContext | null>(null);
  const startCheckoutRef = useRef<(() => Promise<void>) | null>(null);

  const configured = isZohoPayConfigured();
  const mockMode = isZohoPayMockMode();
  const setupAmount = getZohoPaySetupAmount();

  const startCheckout = useCallback(async () => {
    if (mandateActive || mockMode) return;

    if (!customerEmail.trim()) return;
    if (!onboardingId.trim()) {
      setErrorMessage('Save onboarding progress first — onboarding ID is required for Zoho Pay.');
      return;
    }

    if (!configured) return;

    setCheckoutLoading(true);
    setErrorMessage('');
    setCheckoutReady(false);
    checkoutRef.current = null;

    try {
      await loadZohoPayScript();

      const { customerId } = await ensureCustomer({
        name: customerName.trim() || customerEmail.trim(),
        email: customerEmail.trim(),
        phone: customerPhone.trim() || undefined,
        onboardingId: onboardingId.trim(),
      });

      const session = await createPaymentSession({
        amount: setupAmount,
        currency: 'USD',
        customerId,
        plan: getZohoPayPlan(),
      });

      checkoutRef.current = {
        customerId,
        paymentsSessionId: session.paymentsSessionId,
        amount: session.amount,
        currencyCode: session.currencyCode,
        apiKey: session.apiKey,
      };
      setCheckoutReady(true);
    } catch (err) {
      setErrorMessage(formatZohoPayError(err));
    } finally {
      setCheckoutLoading(false);
    }
  }, [
    configured,
    customerEmail,
    customerName,
    customerPhone,
    mandateActive,
    mockMode,
    onboardingId,
    setupAmount,
  ]);

  startCheckoutRef.current = startCheckout;

  useEffect(() => {
    if (!mandateActive && !mockMode && configured && customerEmail.trim() && onboardingId.trim()) {
      startCheckoutRef.current?.();
    }
  }, [mandateActive, mockMode, configured, customerEmail, customerName, onboardingId]);

  const handleAuthorizeAch = useCallback(async () => {
    if (disabled || mandateActive || payLoading) return;

    if (!customerEmail.trim()) {
      toast.error('Contact email is required before authorizing ACH');
      return;
    }

    if (mockMode) {
      const mockResult: ZohoAchMandateResult = {
        customerId: `MOCK-CUS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        sessionId: `MOCK-SES-${Date.now()}`,
        paymentId: `MOCK-PAY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        paymentMethodId: `MOCK-PM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        mandateId: `MOCK-MND-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      };
      onMandateSaved(mockResult);
      toast.success('ACH mandate saved (demo mode)');
      return;
    }

    if (!configured) {
      toast.error('Zoho Pay is not configured. Set VITE_ZOHO_PAY_ACCOUNT_ID.');
      return;
    }

    if (!checkoutRef.current) {
      toast.error('Checkout is still loading — please wait');
      return;
    }

    const checkout = checkoutRef.current;
    setPayLoading(true);
    setErrorMessage('');

    try {
      const initConfig = getZohoPayInitConfig(checkout.apiKey);
      if (!initConfig) {
        throw new Error('Zoho Pay widget configuration is missing');
      }

      const instance = await getZPaymentsInstance(initConfig);

      const result = await withTimeout(
        instance.requestPaymentMethod({
          transaction_type: 'payment',
          payments_session_id: checkout.paymentsSessionId,
          amount: checkout.amount,
          currency_code: checkout.currencyCode,
          currency_symbol: '$',
          business: ZOHO_PAY_MERCHANT_NAME,
          description: 'Recurring ACH authorization',
          mandate: { type: 'recurring' },
          address: {
            name: customerName.trim() || undefined,
            email: customerEmail.trim() || undefined,
            phone: customerPhone.trim() || undefined,
          },
        }),
        WIDGET_TIMEOUT_MS,
        'Zoho Pay did not respond. Close the overlay and try again.',
      );

      const ids = readWidgetIds(result);
      if (!ids.paymentMethodId && !ids.paymentId) {
        throw new Error('Zoho Pay did not return payment or mandate references');
      }

      try {
        await saveMandate({
          customerId: checkout.customerId,
          result,
          onboardingId: onboardingId.trim() || undefined,
        });
      } catch (saveErr) {
        console.warn('save-mandate failed; continuing with widget result:', saveErr);
      }

      onMandateSaved({
        customerId: checkout.customerId,
        sessionId: checkout.paymentsSessionId,
        paymentId: ids.paymentId || ids.paymentMethodId,
        paymentMethodId: ids.paymentMethodId || ids.paymentId,
        mandateId: ids.mandateId || ids.paymentMethodId || ids.paymentId,
      });
      toast.success('Recurring ACH authorized');
    } catch (err) {
      if (!isZohoWidgetClosedError(err)) {
        const message = formatZohoPayError(err);
        setErrorMessage(message);
        toast.error(message);
      }
    } finally {
      setPayLoading(false);
      restorePageScroll();
      await closeZPaymentsInstanceSafely();
    }
  }, [
    configured,
    customerEmail,
    customerName,
    customerPhone,
    disabled,
    mandateActive,
    mockMode,
    onboardingId,
    onMandateSaved,
    payLoading,
  ]);

  const loading = checkoutLoading || payLoading;
  const missingOnboardingId = !mockMode && configured && !onboardingId.trim();

  return (
    <div className="zoho-ach-setup">
      {!mandateActive && mockMode && (
        <p className="zoho-ach-setup-note zoho-ach-setup-note--demo">Demo mode — mock mandate IDs only</p>
      )}
      {!mandateActive && !mockMode && !configured && (
        <p className="zoho-ach-setup-note zoho-ach-setup-note--warn">
          Add VITE_ZOHO_PAY_ACCOUNT_ID to enable Zoho Pay.
        </p>
      )}
      {missingOnboardingId && (
        <p className="zoho-ach-setup-note zoho-ach-setup-note--warn">
          Complete earlier onboarding steps so an onboarding ID is saved before authorizing ACH.
        </p>
      )}

      <div id="zpay-card" className="zoho-ach-setup-card" aria-hidden={mandateActive} />

      {mandateActive ? (
        <div className="zoho-ach-setup-done">
          <span className="zoho-ach-setup-done-icon" aria-hidden="true">✓</span>
          <div>
            <div className="zoho-ach-setup-done-title">Recurring ACH authorized</div>
            {(paymentMethodId || paymentId) && (
              <div className="zoho-ach-setup-done-ref">
                Ref: {paymentMethodId || paymentId}
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          id="pay-btn"
          className={`zoho-ach-setup-btn${loading ? ' zoho-ach-setup-btn--loading' : ''}`}
          onClick={handleAuthorizeAch}
          disabled={disabled || loading || missingOnboardingId || (!mockMode && configured && !checkoutReady)}
          aria-busy={loading}
        >
          {payLoading
            ? 'Opening Zoho Pay…'
            : checkoutLoading
              ? 'Preparing checkout…'
              : 'Authorize Recurring ACH'}
        </button>
      )}

      {errorMessage && !mandateActive && (
        <p className="zoho-ach-setup-error" role="alert">{errorMessage}</p>
      )}
    </div>
  );
};

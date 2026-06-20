import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  createPaymentSession,
  ensureCustomer,
  getZohoPayPlan,
  getZohoPaySetupAmount,
  isZohoPayConfigured,
  isZohoPayMockMode,
  saveMandate,
} from '../../../services/zohoPayService';
import type { ZohoPayWidgetSuccess } from '../../../types/zohoPay';
import { closeZPaymentsInstance, getZPaymentsInstance, loadZohoPayScript } from '../../../utils/zohoPayLoader';

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
  amount: number;
  currencyCode: string;
}

const isWidgetClosedError = (err: unknown): boolean => (
  err !== null
  && typeof err === 'object'
  && 'code' in err
  && String((err as { code?: string }).code) === 'widget_closed'
);

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
        onboardingId: onboardingId.trim() || undefined,
      });

      const session = await createPaymentSession({
        amount: setupAmount,
        currency: 'USD',
        customerId,
        plan: getZohoPayPlan(),
      });

      await getZPaymentsInstance();

      checkoutRef.current = {
        customerId,
        paymentsSessionId: session.paymentsSessionId,
        amount: Number.parseFloat(session.amount) || setupAmount,
        currencyCode: session.currencyCode,
      };
      setCheckoutReady(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to prepare Zoho Pay checkout';
      setErrorMessage(message);
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
    if (!mandateActive && !mockMode && configured && customerEmail.trim()) {
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
      const instance = await getZPaymentsInstance();

      try {
        const result = await instance.requestPaymentMethod({
          payments_session_id: checkout.paymentsSessionId,
          payment_method: 'ach',
          amount: checkout.amount,
          currency_code: checkout.currencyCode,
          mandate: { type: 'recurring' },
        });

        const ids = readWidgetIds(result);
        if (!ids.paymentMethodId && !ids.paymentId) {
          throw new Error('Zoho Pay did not return payment or mandate references');
        }

        await saveMandate({
          customerId: checkout.customerId,
          result,
          onboardingId: onboardingId.trim() || undefined,
        });

        onMandateSaved({
          customerId: checkout.customerId,
          sessionId: checkout.paymentsSessionId,
          paymentId: ids.paymentId || ids.paymentMethodId,
          paymentMethodId: ids.paymentMethodId || ids.paymentId,
          mandateId: ids.mandateId || ids.paymentMethodId || ids.paymentId,
        });
        toast.success('Recurring ACH authorized');
      } finally {
        await closeZPaymentsInstance();
      }
    } catch (err) {
      if (isWidgetClosedError(err)) return;
      const message = err instanceof Error ? err.message : 'Payment authorization failed';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setPayLoading(false);
    }
  }, [
    configured,
    customerEmail,
    disabled,
    mandateActive,
    mockMode,
    onboardingId,
    onMandateSaved,
    payLoading,
  ]);

  const loading = checkoutLoading || payLoading;

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
          disabled={disabled || loading || (!mockMode && configured && !checkoutReady)}
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

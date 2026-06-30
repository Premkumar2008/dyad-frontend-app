import React, { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ZOHO_PAY_MERCHANT_NAME } from '../../../constants/zohoPay';
import {
  createPaymentSession,
  ensureCustomer,
  finalizeZohoSubscription,
  getZohoPayInitConfig,
  getZohoPayPlan,
  getZohoPaySetupAmount,
  isZohoPayConfigured,
  isZohoPayMockMode,
  logZohoPayFailure,
  requestCheckoutWithRecovery,
} from '../../../services/zohoPayService';
import { getZohoMandateSuccessMessage } from '../../../utils/zohoPayMandate';
import type { ZohoPayRequestPaymentMethodOptions, ZohoPayWidgetSuccess } from '../../../types/zohoPay';
import { formatZohoPayError, isZohoWidgetClosedError } from '../../../utils/zohoPayErrors';
import {
  closeZPaymentsInstanceSafely,
  getZPaymentsInstance,
  loadZohoPayScript,
  restorePageScroll,
} from '../../../utils/zohoPayLoader';

import type { ZohoAchMandateResult } from '../../../types/zohoPayMandate';

export type { ZohoAchMandateResult };

interface ZohoAchSetupWidgetProps {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onboardingId?: string;
  mandateActive: boolean;
  paymentId?: string;
  paymentMethodId?: string;
  paymentStatus?: string;
  subscriptionStatus?: string;
  subscriptionNextCharge?: string;
  disabled?: boolean;
  onMandateSaved: (result: ZohoAchMandateResult) => void | Promise<void>;
}

interface CheckoutContext {
  customerId: string;
  paymentsSessionId: string;
  amount: string;
  currencyCode: string;
  apiKey?: string;
}

const WIDGET_TIMEOUT_MS = 120_000;

export const ZohoAchSetupWidget: React.FC<ZohoAchSetupWidgetProps> = ({
  customerName = '',
  customerEmail = '',
  customerPhone = '',
  onboardingId = '',
  mandateActive,
  paymentId = '',
  paymentMethodId = '',
  paymentStatus = '',
  subscriptionStatus = '',
  subscriptionNextCharge = '',
  disabled = false,
  onMandateSaved,
}) => {
  const [payLoading, setPayLoading] = useState(false);
  const [payStatusMessage, setPayStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const checkoutRef = useRef<CheckoutContext | null>(null);
  const authorizeInFlightRef = useRef(false);

  const configured = isZohoPayConfigured();
  const mockMode = isZohoPayMockMode();
  const setupAmount = getZohoPaySetupAmount();

  const handleAuthorizeAch = useCallback(async () => {
    if (disabled || mandateActive || payLoading || authorizeInFlightRef.current) return;

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
        paymentStatus: 'succeeded',
        subscriptionStatus: 'active',
        plan: getZohoPayPlan(),
        amount: String(setupAmount),
        currency: 'USD',
      };
      await onMandateSaved(mockResult);
      toast.success('ACH mandate saved (demo mode)');
      return;
    }

    if (!configured) {
      toast.error('Zoho Pay is not configured. Set VITE_ZOHO_PAY_ACCOUNT_ID.');
      return;
    }

    if (!onboardingId.trim()) {
      setErrorMessage('Save onboarding progress first — onboarding ID is required for Zoho Pay.');
      return;
    }

    authorizeInFlightRef.current = true;
    setPayLoading(true);
    setPayStatusMessage('Preparing session…');
    setErrorMessage('');

    let checkout: CheckoutContext;
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

      checkout = {
        customerId,
        paymentsSessionId: session.paymentsSessionId,
        amount: session.amount,
        currencyCode: session.currencyCode,
        apiKey: session.apiKey,
      };
      checkoutRef.current = checkout;
    } catch (err) {
      const message = formatZohoPayError(err);
      setErrorMessage(message);
      toast.error(message);
      authorizeInFlightRef.current = false;
      setPayLoading(false);
      setPayStatusMessage('');
      return;
    }

    setPayStatusMessage('Opening Zoho Pay…');

    const openSavePaymentMethodWidget = async (
      widgetOptions: ZohoPayRequestPaymentMethodOptions,
      apiKey?: string,
    ): Promise<ZohoPayWidgetSuccess> => {
      setPayStatusMessage('Saving bank account…');
      await closeZPaymentsInstanceSafely();

      const initConfig = getZohoPayInitConfig(apiKey ?? checkout.apiKey);
      if (!initConfig) throw new Error('');

      const saveInstance = await getZPaymentsInstance(initConfig);
      try {
        return await saveInstance.requestPaymentMethod(widgetOptions);
      } finally {
        await closeZPaymentsInstanceSafely();
      }
    };

    let widgetPaymentId = '';

    try {
      const initConfig = getZohoPayInitConfig(checkout.apiKey);
      if (!initConfig) throw new Error('');

      const instance = await getZPaymentsInstance(initConfig);

      setPayStatusMessage('Complete payment in Zoho Pay…');
      const result = await requestCheckoutWithRecovery(
        instance,
        {
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
        },
        checkout.paymentsSessionId,
        WIDGET_TIMEOUT_MS,
      );

      await closeZPaymentsInstanceSafely();

      const widgetPaymentIdFromResult = typeof result.payment_id === 'string' ? result.payment_id.trim() : '';
      widgetPaymentId = widgetPaymentIdFromResult;

      setPayStatusMessage('Verifying payment…');
      const finalized = await finalizeZohoSubscription({
        checkoutWidgetResult: result,
        customerId: checkout.customerId,
        onboardingId: onboardingId.trim(),
        sessionId: checkout.paymentsSessionId,
        amount: checkout.amount,
        currency: checkout.currencyCode,
        plan: getZohoPayPlan(),
        openSavePaymentMethodWidget,
        onProgress: setPayStatusMessage,
      });

      const mandateResult: ZohoAchMandateResult = {
        customerId: finalized.customerId,
        sessionId: finalized.sessionId,
        paymentId: finalized.paymentId,
        paymentMethodId: finalized.paymentMethodId,
        mandateId: finalized.mandateId,
        paymentStatus: finalized.paymentStatus,
        subscriptionStatus: finalized.subscriptionStatus,
        subscriptionNextCharge: finalized.subscriptionNextCharge,
        plan: finalized.plan,
        amount: finalized.amount,
        currency: finalized.currency,
      };

      await onMandateSaved(mandateResult);
      toast.success(getZohoMandateSuccessMessage(
        mandateResult.paymentStatus,
        mandateResult.subscriptionStatus,
      ));
    } catch (err) {
      if (!isZohoWidgetClosedError(err)) {
        const message = formatZohoPayError(err);
        setErrorMessage(message);
        toast.error(message);
        void logZohoPayFailure({
          onboardingId: onboardingId.trim(),
          stage: 'authorize_ach',
          error: message,
          customerId: checkoutRef.current?.customerId,
          sessionId: checkoutRef.current?.paymentsSessionId,
          paymentId: widgetPaymentId || undefined,
        });
      }
    } finally {
      authorizeInFlightRef.current = false;
      setPayLoading(false);
      setPayStatusMessage('');
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
    setupAmount,
  ]);

  const loading = payLoading;
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
            <div className="zoho-ach-setup-done-title">
              {subscriptionStatus === 'pending' || paymentStatus === 'pending' || paymentStatus === 'processing'
                ? 'ACH authorization submitted'
                : 'Recurring ACH authorized'}
            </div>
            {(paymentMethodId || paymentId) && (
              <div className="zoho-ach-setup-done-ref">
                Ref: {paymentMethodId || paymentId}
              </div>
            )}
            {subscriptionNextCharge && (
              <div className="zoho-ach-setup-done-ref">
                Next charge: {new Date(subscriptionNextCharge).toLocaleDateString()}
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
          disabled={disabled || loading || missingOnboardingId}
          aria-busy={loading}
        >
          {payLoading ? (payStatusMessage || 'Opening Zoho Pay…') : 'Authorize Recurring ACH'}
        </button>
      )}

      {errorMessage && !mandateActive && (
        <p className="zoho-ach-setup-error" role="alert">{errorMessage}</p>
      )}
    </div>
  );
};
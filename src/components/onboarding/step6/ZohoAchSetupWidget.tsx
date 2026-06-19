import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ZOHO_PAY_MERCHANT_NAME, ZOHO_RECURRING_MANDATE_DESCRIPTION } from '../../../constants/zohoPay';
import {
  createPaymentSession,
  getZohoPaySetupAmount,
  isZohoPayConfigured,
  isZohoPayMockMode,
  saveMandate,
} from '../../../services/zohoPayService';
import type { ZohoPayWidgetSuccess } from '../../../types/zohoPay';
import { closeZPaymentsInstance, getZPaymentsInstance, loadZohoPayScript } from '../../../utils/zohoPayLoader';

export interface ZohoAchMandateResult {
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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const configured = isZohoPayConfigured();
  const mockMode = isZohoPayMockMode();
  const setupAmount = getZohoPaySetupAmount();

  useEffect(() => {
    if ((configured || mockMode) && !mockMode) {
      loadZohoPayScript().catch(() => {
        // Handled again when the user clicks Set up ACH Payment.
      });
    }
  }, [configured, mockMode]);

  const handleSetupAch = useCallback(async () => {
    if (disabled || mandateActive || loading) return;

    if (!customerEmail.trim()) {
      toast.error('Contact email is required before setting up ACH');
      return;
    }

    if (!mockMode && !configured) {
      toast.error('Zoho Pay is not configured. Set VITE_ZOHO_PAY_ACCOUNT_ID and VITE_ZOHO_PAY_API_KEY.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      if (mockMode) {
        const mockResult: ZohoAchMandateResult = {
          sessionId: `MOCK-SES-${Date.now()}`,
          paymentId: `MOCK-PAY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          paymentMethodId: `MOCK-PM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          mandateId: `MOCK-MND-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        };
        onMandateSaved(mockResult);
        toast.success('ACH mandate saved (demo mode)');
        return;
      }

      const session = await createPaymentSession({
        amount: setupAmount,
        currency: 'USD',
        onboardingId: onboardingId.trim() || undefined,
        email: customerEmail.trim(),
        name: customerName.trim() || customerEmail.trim(),
      });

      const instance = await getZPaymentsInstance();

      try {
        const widgetResult = await instance.requestPaymentMethod({
          amount: session.amount,
          currency_code: session.currencyCode,
          payments_session_id: session.sessionId,
          payment_methods: ['us_bank_account'],
          mandate: {
            type: 'recurring',
            description: ZOHO_RECURRING_MANDATE_DESCRIPTION,
          },
          business: ZOHO_PAY_MERCHANT_NAME,
          description: ZOHO_RECURRING_MANDATE_DESCRIPTION,
          address: {
            name: customerName.trim() || undefined,
            email: customerEmail.trim() || undefined,
            phone: customerPhone.trim() || undefined,
          },
        });

        const ids = readWidgetIds(widgetResult);
        if (!ids.paymentMethodId && !ids.paymentId) {
          throw new Error('Zoho Pay did not return payment or mandate identifiers');
        }

        await saveMandate({
          onboardingId: onboardingId.trim() || undefined,
          sessionId: session.sessionId,
          paymentId: ids.paymentId || undefined,
          paymentMethodId: ids.paymentMethodId || undefined,
          mandateId: ids.mandateId || undefined,
          customerId: typeof widgetResult.customer_id === 'string' ? widgetResult.customer_id : undefined,
          widgetResult,
        });

        onMandateSaved({
          sessionId: session.sessionId,
          paymentId: ids.paymentId || ids.paymentMethodId,
          paymentMethodId: ids.paymentMethodId || ids.paymentId,
          mandateId: ids.mandateId || ids.paymentMethodId || ids.paymentId,
        });
        toast.success('ACH payment method saved');
      } finally {
        await closeZPaymentsInstance();
      }
    } catch (err) {
      if (isWidgetClosedError(err)) return;
      const message = err instanceof Error ? err.message : 'Unable to set up ACH payment';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [
    configured,
    customerEmail,
    customerName,
    customerPhone,
    disabled,
    loading,
    mandateActive,
    mockMode,
    onboardingId,
    onMandateSaved,
    setupAmount,
  ]);

  return (
    <div className="zoho-ach-setup">
      {!mandateActive && mockMode && (
        <p className="zoho-ach-setup-note zoho-ach-setup-note--demo">Demo mode — mock mandate IDs only</p>
      )}
      {!mandateActive && !mockMode && !configured && (
        <p className="zoho-ach-setup-note zoho-ach-setup-note--warn">
          Add VITE_ZOHO_PAY_ACCOUNT_ID and VITE_ZOHO_PAY_API_KEY to enable Zoho Pay.
        </p>
      )}

      {mandateActive ? (
        <div className="zoho-ach-setup-done">
          <span className="zoho-ach-setup-done-icon" aria-hidden="true">✓</span>
          <div>
            <div className="zoho-ach-setup-done-title">ACH mandate active</div>
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
          onClick={handleSetupAch}
          disabled={disabled || loading}
          aria-busy={loading}
        >
          {loading ? 'Opening Zoho Pay…' : 'Set up ACH Payment'}
        </button>
      )}

      {errorMessage && !mandateActive && (
        <p className="zoho-ach-setup-error" role="alert">{errorMessage}</p>
      )}
    </div>
  );
};

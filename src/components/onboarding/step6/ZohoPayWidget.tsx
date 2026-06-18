import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ZOHO_ACH_DEBIT_AUTHORIZATION } from '../../../constants/zohoPay';
import {
  confirmAchMandateSetup,
  createAchMandateSetupSession,
  getZohoPayWidgetConfig,
  isZohoPayConfigured,
  isZohoPayMockMode,
  type AchMandateSetupResponse,
  type ZohoAchActivateResult,
} from '../../../services/zohoPayService';
import type { ZohoPayRequestPaymentMethodOptions, ZohoPayWidgetSuccess } from '../../../types/zohoPay';
import { closeZPaymentsInstance, getZPaymentsInstance, loadZohoPayScript } from '../../../utils/zohoPayLoader';

interface ZohoPayWidgetProps {
  bankDisplay: string;
  mandateActive: boolean;
  mandateId: string;
  activatedAt: string;
  paymentMethodType?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  onboardingId?: string;
  zohoCustomerId?: string;
  achDebitAuthorized: boolean;
  onAchDebitAuthorizedChange: (authorized: boolean) => void;
  onActivate: (result: ZohoAchActivateResult) => void;
  disabled: boolean;
}

const formatActivatedAt = (): string => new Date().toLocaleString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const extractWidgetReferenceId = (result: ZohoPayWidgetSuccess): string | undefined => {
  const paymentMethodId = typeof result.payment_method_id === 'string' ? result.payment_method_id : undefined;
  const mandateId = typeof result.mandate_id === 'string' ? result.mandate_id : undefined;
  const paymentId = typeof result.payment_id === 'string' ? result.payment_id : undefined;
  return paymentMethodId ?? mandateId ?? paymentId;
};

const buildWidgetOptions = (
  session: AchMandateSetupResponse,
  customerName: string,
  customerEmail: string,
  customerPhone?: string,
): ZohoPayRequestPaymentMethodOptions => {
  if (session.flow === 'payment_method') {
    if (!session.customerId || !session.paymentMethodSessionId) {
      throw new Error('ACH setup session is missing customer or payment method session identifiers');
    }

    return {
      payment_method: 'ach_debit',
      transaction_type: 'add',
      customer_id: session.customerId,
      payment_method_session_id: session.paymentMethodSessionId,
      address: {
        name: customerName || undefined,
        email: customerEmail || undefined,
        phone: customerPhone || undefined,
      },
    };
  }

  if (!session.paymentsSessionId) {
    throw new Error('ACH setup session is missing payment session identifier');
  }

  return {
    payment_method: 'ach_debit',
    transaction_type: 'payment',
    payments_session_id: session.paymentsSessionId,
    amount: session.amount ?? '0.00',
    currency_code: session.currencyCode ?? 'USD',
    currency_symbol: session.currencySymbol ?? '$',
    business: session.business ?? 'Dyad Practice Solutions LLC',
    description: session.description ?? 'Recurring Auto-ACH mandate enrollment',
    invoice_number: session.invoiceNumber,
    address: {
      name: customerName || undefined,
      email: customerEmail || undefined,
      phone: customerPhone || undefined,
    },
  };
};

export const ZohoPayWidget: React.FC<ZohoPayWidgetProps> = ({
  bankDisplay,
  mandateActive,
  mandateId,
  activatedAt,
  paymentMethodType,
  customerName,
  customerEmail,
  customerPhone,
  onboardingId,
  zohoCustomerId,
  achDebitAuthorized,
  onAchDebitAuthorizedChange,
  onActivate,
  disabled,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const configured = isZohoPayConfigured();
  const mockMode = isZohoPayMockMode();

  useEffect(() => {
    if (configured && !mockMode) {
      loadZohoPayScript().catch(() => {
        // Script preload failure is handled again on activate.
      });
    }
  }, [configured, mockMode]);

  const activateMockMandate = useCallback(() => {
    const id = `ZP-MND-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const at = formatActivatedAt();
    onActivate({
      mandateId: id,
      paymentMethodId: id,
      customerId: `ZP-CUS-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      activatedAt: at,
      status: 'active',
      paymentMethodType: 'ach_debit',
      sessionStatus: 'succeeded',
    });
    toast.success('Auto-ACH mandate activated (demo mode)');
  }, [onActivate]);

  const handleActivate = useCallback(async () => {
    if (disabled) {
      toast.error('Complete operating account fields first');
      return;
    }

    if (!customerEmail.trim()) {
      toast.error('A verified contact email is required before activating ACH');
      return;
    }

    if (!achDebitAuthorized) {
      toast.error('Please acknowledge the ACH debit authorization below');
      return;
    }

    if (mockMode || !configured) {
      if (mockMode) {
        activateMockMandate();
        return;
      }
      toast.error('Zoho Pay is not configured. Set VITE_ZOHO_PAY_ACCOUNT_ID and VITE_ZOHO_PAY_API_KEY.');
      return;
    }

    const widgetConfig = getZohoPayWidgetConfig();
    if (!widgetConfig) {
      toast.error('Zoho Pay widget credentials are missing');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    let session: AchMandateSetupResponse | null = null;
    let widgetResult: ZohoPayWidgetSuccess | null = null;

    try {
      session = await createAchMandateSetupSession({
        email: customerEmail.trim(),
        name: customerName.trim() || customerEmail.trim(),
        phone: customerPhone?.trim() || undefined,
        onboardingId: onboardingId?.trim() || undefined,
        reference: onboardingId?.trim() || undefined,
        customerId: zohoCustomerId?.trim() || undefined,
      });

      const instance = await getZPaymentsInstance({
        account_id: widgetConfig.accountId,
        domain: widgetConfig.domain,
        otherOptions: { api_key: widgetConfig.apiKey },
      });

      const options = buildWidgetOptions(session, customerName, customerEmail, customerPhone);
      widgetResult = await instance.requestPaymentMethod(options);

      const widgetReferenceId = extractWidgetReferenceId(widgetResult);
      if (!widgetReferenceId) {
        throw new Error('Zoho Pay did not return a payment method identifier');
      }

      const confirmed = await confirmAchMandateSetup({
        onboardingId: onboardingId?.trim() || undefined,
        customerId: session.customerId ?? (typeof widgetResult.customer_id === 'string' ? widgetResult.customer_id : undefined),
        paymentMethodId: typeof widgetResult.payment_method_id === 'string' ? widgetResult.payment_method_id : undefined,
        paymentId: typeof widgetResult.payment_id === 'string' ? widgetResult.payment_id : undefined,
        paymentsSessionId: session.paymentsSessionId,
        paymentMethodSessionId: session.paymentMethodSessionId,
      });

      onActivate({
        mandateId: confirmed.mandateId,
        paymentMethodId: confirmed.paymentMethodId,
        customerId: confirmed.customerId ?? session.customerId,
        activatedAt: formatActivatedAt(),
        status: confirmed.status,
        paymentMethodType: confirmed.paymentMethodType ?? 'ach_debit',
        sessionStatus: confirmed.sessionStatus,
      });
      toast.success('Recurring Auto-ACH mandate activated');
    } catch (err) {
      const code = err && typeof err === 'object' && 'code' in err
        ? String((err as { code?: string }).code)
        : '';
      if (code === 'widget_closed') {
        return;
      }

      const message = err instanceof Error ? err.message : 'Unable to activate Auto-ACH mandate';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      await closeZPaymentsInstance();
      setLoading(false);
    }
  }, [
    achDebitAuthorized,
    activateMockMandate,
    configured,
    customerEmail,
    customerName,
    customerPhone,
    disabled,
    mockMode,
    onboardingId,
    onActivate,
    zohoCustomerId,
  ]);

  const ctaDisabled = disabled || loading || mandateActive || !achDebitAuthorized;

  return (
    <div className="ob-bank-zp-wrap">
      <div className="ob-bank-zp-head">
        <div className="ob-bank-zp-brand">
          <div className="ob-bank-zp-mark">Z</div>
          <div>
            <div className="ob-bank-zp-bn">Zoho Pay</div>
            <div className="ob-bank-zp-bs">Secure ACH Mandate Setup</div>
          </div>
        </div>
        <div className="ob-bank-zp-sec">
          <svg width="9" height="11" viewBox="0 0 12 14" fill="none" aria-hidden="true">
            <path d="M6 1C4 1 2.5 2.5 2.5 4.5V6H2v7h8V6H9.5V4.5C9.5 2.5 8 1 6 1zM4 6V4.5C4 3.4 4.9 2.5 6 2.5S8 3.4 8 4.5V6H4z" fill="#2E7D32" />
          </svg>
          256-bit TLS · NACHA Certified
        </div>
      </div>
      <div className="ob-bank-zp-body">
        {!mandateActive && mockMode && (
          <div className="ob-bank-zp-notice ob-bank-zp-notice-demo">Demo mode: mock mandate IDs only</div>
        )}
        {!mandateActive && !mockMode && !configured && (
          <div className="ob-bank-zp-notice ob-bank-zp-notice-warn">
            Zoho Pay widget credentials are not configured. Add VITE_ZOHO_PAY_ACCOUNT_ID and VITE_ZOHO_PAY_API_KEY 
          </div>
        )}
        <div className="ob-bank-zp-row">
          <div className="ob-bank-zp-llabel">Payment To (Merchant)</div>
          <div className="ob-bank-zp-card">
            <div className="ob-bank-zp-mlogo">D</div>
            <div className="ob-bank-zp-cinfo">
              <div className="ob-bank-zp-ctitle">Dyad Practice Solutions LLC</div>
              <div className="ob-bank-zp-csub">Verified ACH Originator · Zoho Pay Embedded</div>
            </div>
            <span className="ob-bank-zp-pill ob-bank-zp-pill-verified">Verified</span>
          </div>
        </div>
        <div className="ob-bank-zp-row">
          <div className="ob-bank-zp-llabel">Funding Source</div>
          <div className="ob-bank-zp-card">
            <div className="ob-bank-zp-bicon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 6L8 2.5L14 6V7H2V6Z" stroke="#002855" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M3.5 8V12M6 8V12M10 8V12M12.5 8V12" stroke="#002855" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M2 13H14" stroke="#002855" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="ob-bank-zp-cinfo">
              <div className="ob-bank-zp-ctitle">ACH Bank Debit (Provider Operating Account)</div>
              <div className="ob-bank-zp-csub">{bankDisplay || 'Linked to operating account entered above'}</div>
            </div>
            <span className="ob-bank-zp-pill">Selected</span>
          </div>
        </div>
        <div className="ob-bank-zp-row">
          <div className="ob-bank-zp-llabel">Recurring Mandate Configuration</div>
          <div className="ob-bank-zp-grid">
            <div className="ob-bank-zp-gi"><div className="ob-bank-zp-gl">Mandate Type</div><div className="ob-bank-zp-gv">Variable Recurring Debit</div></div>
            <div className="ob-bank-zp-gi"><div className="ob-bank-zp-gl">Frequency</div><div className="ob-bank-zp-gv">Monthly</div></div>
            <div className="ob-bank-zp-gi"><div className="ob-bank-zp-gl">Debit Trigger</div><div className="ob-bank-zp-gv">5th business day post-invoice</div></div>
            <div className="ob-bank-zp-gi"><div className="ob-bank-zp-gl">Amount Basis</div><div className="ob-bank-zp-gv">Per Exhibit D fee schedule</div></div>
            <div className="ob-bank-zp-gi"><div className="ob-bank-zp-gl">SEC Code</div><div className="ob-bank-zp-gv">CCD (Corporate)</div></div>
            <div className="ob-bank-zp-gi"><div className="ob-bank-zp-gl">Settlement</div><div className="ob-bank-zp-gv">Standard ACH (1–2 BD)</div></div>
          </div>
        </div>
        {!mandateActive && (
          <label className="ob-bank-zp-auth">
            <input
              type="checkbox"
              checked={achDebitAuthorized}
              onChange={e => onAchDebitAuthorizedChange(e.target.checked)}
            />
            <span>{ZOHO_ACH_DEBIT_AUTHORIZATION}</span>
          </label>
        )}
        {!mandateActive ? (
          <button
            type="button"
            className={`ob-bank-zp-cta${loading ? ' ob-bank-zp-cta-loading' : ''}`}
            onClick={handleActivate}
            disabled={ctaDisabled}
            aria-busy={loading}
          >
            {loading ? (
              'Opening Zoho Pay…'
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Activate Recurring Auto-ACH Mandate
              </>
            )}
          </button>
        ) : (
          <button type="button" className="ob-bank-zp-cta ob-bank-zp-cta-activated" disabled>
            Auto-Pay Mandate Active
          </button>
        )}
        {errorMessage && !mandateActive && (
          <div className="ob-bank-zp-error" role="alert">{errorMessage}</div>
        )}
        {mandateActive && (
          <div className="ob-bank-zp-mandate ob-bank-zp-mandate-show">
            <div className="ob-bank-zp-ma-head">
              <div className="ob-bank-zp-ma-icon">✓</div>
              <div className="ob-bank-zp-ma-title">Auto-Pay Mandate Active</div>
            </div>
            <div className="ob-bank-zp-ma-grid">
              <div><div className="ob-bank-zp-gl">Payment Method ID</div><div className="ob-bank-zp-gv">{mandateId}</div></div>
              <div><div className="ob-bank-zp-gl">Type</div><div className="ob-bank-zp-gv">{paymentMethodType || 'ach_debit'}</div></div>
              <div><div className="ob-bank-zp-gl">Status</div><div className="ob-bank-zp-gv">Active · Recurring</div></div>
              <div><div className="ob-bank-zp-gl">Activated At</div><div className="ob-bank-zp-gv">{activatedAt}</div></div>
            </div>
          </div>
        )}
      </div>
      <div className="ob-bank-zp-foot">
        <div>
          Powered by <strong style={{ color: '#E42527' }}>Zoho</strong><strong style={{ color: '#F38B00' }}>Pay</strong>
          {' '}· Authorized third-party ACH payment processor for Dyad Practice Solutions, LLC
        </div>
      </div>
    </div>
  );
};

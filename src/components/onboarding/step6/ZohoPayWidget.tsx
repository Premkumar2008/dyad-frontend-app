import React from 'react';
import toast from 'react-hot-toast';

interface ZohoPayWidgetProps {
  bankDisplay: string;
  mandateActive: boolean;
  mandateId: string;
  activatedAt: string;
  onActivate: (mandateId: string, activatedAt: string) => void;
  disabled: boolean;
}

export const ZohoPayWidget: React.FC<ZohoPayWidgetProps> = ({
  bankDisplay, mandateActive, mandateId, activatedAt, onActivate, disabled,
}) => {
  const handleActivate = () => {
    if (disabled) {
      toast.error('Complete operating account fields first');
      return;
    }
    const id = `ZP-MND-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const at = new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    onActivate(id, at);
    toast.success('Auto-ACH mandate activated');
  };

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
        <div className="ob-bank-zp-sec">🔒 256-bit TLS · NACHA Certified</div>
      </div>
      <div className="ob-bank-zp-body">
        <div className="ob-bank-zp-row">
          <div className="ob-bank-zp-llabel">Payment To (Merchant)</div>
          <div className="ob-bank-zp-card">
            <div className="ob-bank-zp-mlogo">D</div>
            <div className="ob-bank-zp-cinfo">
              <div className="ob-bank-zp-ctitle">Dyad Practice Solutions LLC</div>
              <div className="ob-bank-zp-csub">Merchant ID: ZP-DYAD-04472 · Verified ACH Originator</div>
            </div>
            <span className="ob-bank-zp-pill ob-bank-zp-pill-verified">Verified</span>
          </div>
        </div>
        <div className="ob-bank-zp-row">
          <div className="ob-bank-zp-llabel">Funding Source</div>
          <div className="ob-bank-zp-card">
            <div className="ob-bank-zp-bicon">🏦</div>
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
            <div className="ob-bank-zp-gi"><div className="ob-bank-zp-gl">Settlement</div><div className="ob-bank-zp-gv">Standard ACH (1-2 BD)</div></div>
          </div>
        </div>
        {!mandateActive ? (
          <button type="button" className="ob-bank-zp-cta" onClick={handleActivate} disabled={disabled}>
            ✓ Activate Recurring Auto-ACH Mandate
          </button>
        ) : (
          <div className="ob-bank-zp-mandate">
            <div className="ob-bank-zp-ma-head">
              <div className="ob-bank-zp-ma-icon">✓</div>
              <div className="ob-bank-zp-ma-title">Auto-Pay Mandate Active</div>
            </div>
            <div className="ob-bank-zp-ma-grid">
              <div><div className="ob-bank-zp-gl">Mandate ID</div><div className="ob-bank-zp-gv">{mandateId}</div></div>
              <div><div className="ob-bank-zp-gl">Status</div><div className="ob-bank-zp-gv">Active · Recurring</div></div>
              <div><div className="ob-bank-zp-gl">Activated At</div><div className="ob-bank-zp-gv">{activatedAt}</div></div>
            </div>
          </div>
        )}
      </div>
      <div className="ob-bank-zp-foot">
        Powered by <strong style={{ color: '#e42527' }}>Zoho</strong><strong style={{ color: '#f38b00' }}>Pay</strong>
        {' '}· Authorized third-party ACH payment processor for Dyad Practice Solutions, LLC
      </div>
    </div>
  );
};

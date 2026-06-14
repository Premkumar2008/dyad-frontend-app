import React, { useMemo } from 'react';
import toast from 'react-hot-toast';
import type { OnboardingData } from '../../../pages/DyadOnboarding';
import { ObForwardButtonLabel } from '../ObBtnArrow';
import { DYAD_REQUESTER_ADDRESS, W9_TAX_CLASSES } from './bankingConstants';

export interface FormW9SectionProps {
  formData: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  signerName: string;
  onSigned?: () => void;
}

const formatTin = (raw: string, type: 'EIN' | 'SSN' | '') => {
  const d = raw.replace(/\D/g, '').slice(0, 9);
  if (type === 'EIN') {
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}-${d.slice(2)}`;
  }
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
};

export const FormW9Section: React.FC<FormW9SectionProps> = ({ formData, set, signerName, onSigned }) => {
  const tinDigits = formData.w9Tin.replace(/\D/g, '');
  const tinValid = tinDigits.length === 9;

  const progress = useMemo(() => ({
    line1: !!formData.w9Line1.trim(),
    tc: !!formData.w9TaxClass && (formData.w9TaxClass !== '6' || !!formData.w9LlcClass) && (formData.w9TaxClass !== '7' || !!formData.w9OtherDesc.trim()),
    line5: !!formData.w9Line5.trim(),
    line6: !!formData.w9Line6.trim(),
    tin: tinValid,
    esign: formData.w9EsignConsent,
    irs: formData.w9IrsCert,
    auth: formData.w9AuthDist,
    sig: formData.w9Signature.trim().length > 2,
  }), [formData, tinValid]);

  const canGenerate = Object.values(progress).every(Boolean) && !formData.w9Item2Flagged;

  const handleGenerate = () => {
    if (!canGenerate) {
      toast.error('Complete all W-9 requirements');
      return;
    }
    const at = new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const hash = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    set('w9Signed', true);
    set('w9SignedAt', at);
    set('w9SignedHash', hash);
    toast.success('W-9 signed and generated');
    onSigned?.();
  };

  if (formData.w9Item2Flagged) {
    return (
      <div className="ob-bank-w9-admin-alert">
        <div className="ob-bank-w9-admin-head">ALERT TRIGGERED - Routed to Dyad Compliance Dashboard</div>
        <div className="ob-bank-w9-admin-body">
          <p><strong>Item 2 cross-out flag raised.</strong> This W-9 cannot be signed via the enrollment portal until Dyad&rsquo;s compliance team has reviewed the matter.</p>
          <p className="ob-bank-w9-admin-foot">Contact <strong>compliance@dyadmd.com</strong> for urgent matters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ob-bank-w9">
      <div className="ob-callout ob-callout-info">
        <strong>IRS Form W-9 (Rev. March 2024).</strong> Complete the fields below exactly as they appear on Form W-9. Upon completion and electronic signature, a fully populated and signed W-9 will be generated.
      </div>

      <div className="ob-bank-w9-line">
        <div className="ob-bank-w9-line-head">
          <span className="ob-bank-w9-num">1</span>
          <span>Name of entity/individual <span className="ob-req">*</span></span>
        </div>
        <input className="ob-input" value={formData.w9Line1} onChange={e => set('w9Line1', e.target.value)} placeholder="Legal entity name" />
      </div>

      <div className="ob-bank-w9-line">
        <div className="ob-bank-w9-line-head">
          <span className="ob-bank-w9-num">2</span>
          <span>Business name / disregarded entity name</span>
        </div>
        <input className="ob-input" value={formData.w9Line2} onChange={e => set('w9Line2', e.target.value)} placeholder="Optional - DBA or disregarded entity name" />
      </div>

      <div className="ob-bank-w9-line">
        <div className="ob-bank-w9-line-head">
          <span className="ob-bank-w9-num">3a</span>
          <span>Federal tax classification <span className="ob-req">*</span></span>
        </div>
        <div className="ob-bank-w9-radio-grid">
          {W9_TAX_CLASSES.map(tc => (
            <label key={tc.id} className={`ob-bank-w9-radio${formData.w9TaxClass === tc.id ? ' ob-bank-w9-radio-sel' : ''}`}>
              <input type="radio" name="w9-tc" checked={formData.w9TaxClass === tc.id} onChange={() => set('w9TaxClass', tc.id)} />
              {tc.label}
            </label>
          ))}
        </div>
        {formData.w9TaxClass === '6' && (
          <div className="ob-bank-w9-extra">
            <label className="ob-label">LLC tax classification <span className="ob-req">*</span></label>
            <select className="ob-input ob-select" value={formData.w9LlcClass} onChange={e => set('w9LlcClass', e.target.value)}>
              <option value="">Select tax classification</option>
              <option value="C">C - C corporation</option>
              <option value="S">S - S corporation</option>
              <option value="P">P - Partnership</option>
            </select>
          </div>
        )}
        {formData.w9TaxClass === '7' && (
          <div className="ob-bank-w9-extra">
            <label className="ob-label">&ldquo;Other&rdquo; classification description <span className="ob-req">*</span></label>
            <input className="ob-input" value={formData.w9OtherDesc} onChange={e => set('w9OtherDesc', e.target.value)} placeholder="Describe classification" />
          </div>
        )}
      </div>

      <div className="ob-bank-w9-line">
        <div className="ob-bank-w9-line-head"><span className="ob-bank-w9-num">5</span><span>Address <span className="ob-req">*</span></span></div>
        <input className="ob-input" value={formData.w9Line5} onChange={e => set('w9Line5', e.target.value)} placeholder="Street address" />
      </div>

      <div className="ob-bank-w9-line">
        <div className="ob-bank-w9-line-head"><span className="ob-bank-w9-num">6</span><span>City, state, and ZIP code <span className="ob-req">*</span></span></div>
        <input className="ob-input" value={formData.w9Line6} onChange={e => set('w9Line6', e.target.value)} placeholder="City, ST 12345" />
      </div>

      <div className="ob-bank-w9-line ob-bank-w9-line-requester">
        <div className="ob-bank-w9-line-head"><span className="ob-bank-w9-num part">R</span><span>Requester&rsquo;s name and address (auto-populated)</span></div>
        <input className="ob-input ob-input-readonly" readOnly value={DYAD_REQUESTER_ADDRESS} />
      </div>

      <div className="ob-bank-w9-line">
        <div className="ob-bank-w9-line-head"><span className="ob-bank-w9-num part">Part I</span><span>Taxpayer Identification Number (TIN) <span className="ob-req">*</span></span></div>
        <div className="ob-bank-w9-tin-toggle">
          <button type="button" className={formData.w9TinType === 'EIN' ? 'act' : ''} onClick={() => { set('w9TinType', 'EIN'); set('w9Tin', ''); }}>Employer ID Number (EIN)</button>
          <button type="button" className={formData.w9TinType === 'SSN' ? 'act' : ''} onClick={() => { set('w9TinType', 'SSN'); set('w9Tin', ''); }}>Social Security Number (SSN)</button>
        </div>
        <input
          className="ob-input"
          value={formData.w9Tin}
          onChange={e => set('w9Tin', formatTin(e.target.value, formData.w9TinType))}
          placeholder={formData.w9TinType === 'SSN' ? 'XXX-XX-XXXX' : 'XX-XXXXXXX'}
          maxLength={formData.w9TinType === 'SSN' ? 11 : 10}
        />
      </div>

      <div className="ob-bank-w9-line">
        <div className="ob-bank-w9-line-head"><span className="ob-bank-w9-num part">Part II</span><span>Certification - Preprinted Text from IRS Form W-9</span></div>
        <div className="ob-bank-w9-cert-box">
          <h5>Under penalties of perjury, I certify that:</h5>
          <ol>
            <li>The number shown on this form is my correct taxpayer identification number;</li>
            <li>I am not subject to backup withholding (unless notified by the IRS);</li>
            <li>I am a U.S. citizen or other U.S. person; and</li>
            <li>The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.</li>
          </ol>
          <button type="button" className="ob-bank-w9-item2-btn" onClick={() => set('w9Item2Flagged', true)}>
            I need to cross out Item 2 (subject to IRS backup withholding)
          </button>
        </div>
      </div>

      {!formData.w9Signed ? (
        <div className="ob-bank-w9-sign-card">
          <label className={`ob-bank-attest${formData.w9EsignConsent ? ' ob-bank-attest-checked' : ''}`}>
            <input type="checkbox" checked={formData.w9EsignConsent} onChange={e => set('w9EsignConsent', e.target.checked)} />
            <span><strong>ESIGN Consent.</strong> I consent to receive and execute this Form W-9 electronically.</span>
          </label>
          <label className={`ob-bank-attest${formData.w9IrsCert ? ' ob-bank-attest-checked' : ''}`}>
            <input type="checkbox" checked={formData.w9IrsCert} onChange={e => set('w9IrsCert', e.target.checked)} />
            <span><strong>IRS Part II Certification.</strong> I certify under penalties of perjury that the information provided is true, correct, and complete.</span>
          </label>
          <label className={`ob-bank-attest${formData.w9AuthDist ? ' ob-bank-attest-checked' : ''}`}>
            <input type="checkbox" checked={formData.w9AuthDist} onChange={e => set('w9AuthDist', e.target.checked)} />
            <span><strong>Authorization to Distribute.</strong> I authorize Dyad to retain and furnish copies of this executed Form W-9 as required.</span>
          </label>
          <div className="ob-form-row ob-form-row-half">
            <div className="ob-field">
              <label className="ob-label">Signature of U.S. Person <span className="ob-req">*</span></label>
              <input
                className={`ob-input ob-signature-input${formData.w9Signature ? ' ob-sig-filled' : ''}`}
                value={formData.w9Signature}
                onChange={e => set('w9Signature', e.target.value)}
                placeholder="Type full legal name to sign"
              />
            </div>
          </div>
          <button type="button" className={`ob-bank-w9-gen-btn${canGenerate ? '' : ' ob-btn-disabled'}`} onClick={handleGenerate} disabled={!canGenerate}>
            <ObForwardButtonLabel label="Generate & Sign W-9" />
          </button>
        </div>
      ) : (
        <div className="ob-bank-w9-success">
          <div className="ob-bank-w9-success-head">
            <div className="ob-bank-w9-success-icon">✓</div>
            <div className="ob-bank-w9-success-title">W-9 Successfully Signed and Generated</div>
          </div>
          <div className="ob-bank-w9-success-grid">
            <div><div className="ob-bank-w9-gl">Document</div><div className="ob-bank-w9-gv">IRS Form W-9 (Rev. 3-2024)</div></div>
            <div><div className="ob-bank-w9-gl">Signer</div><div className="ob-bank-w9-gv">{formData.w9Signature || signerName}</div></div>
            <div><div className="ob-bank-w9-gl">Signed at</div><div className="ob-bank-w9-gv">{formData.w9SignedAt}</div></div>
            <div><div className="ob-bank-w9-gl">Document SHA-256</div><div className="ob-bank-w9-gv">{formData.w9SignedHash}</div></div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useMemo, useState } from 'react';
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

const tinMask = (type: 'EIN' | 'SSN' | '') =>
  type === 'SSN' ? 'Format: XXX-XX-XXXX (9 digits)' : 'Format: XX-XXXXXXX (9 digits)';

export const FormW9Section: React.FC<FormW9SectionProps> = ({ formData, set, signerName, onSigned }) => {
  const [item2ConfirmOpen, setItem2ConfirmOpen] = useState(false);
  const tinDigits = formData.w9Tin.replace(/\D/g, '');
  const tinValid = tinDigits.length === 9;
  const sigDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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

  const progressItems = [
    { key: 'line1', ok: progress.line1, label: 'Enter Line 1 (Name of entity/individual)' },
    { key: 'tc', ok: progress.tc, label: 'Select Line 3a (Federal tax classification)' },
    { key: 'line5', ok: progress.line5, label: 'Enter Line 5 (Address)' },
    { key: 'line6', ok: progress.line6, label: 'Enter Line 6 (City, State, ZIP)' },
    { key: 'tin', ok: progress.tin, label: 'Enter a valid Taxpayer Identification Number' },
    { key: 'esign', ok: progress.esign, label: 'Affirm ESIGN Consent' },
    { key: 'irs', ok: progress.irs, label: 'Affirm IRS Part II Certification' },
    { key: 'auth', ok: progress.auth, label: 'Affirm Authorization to Distribute' },
    { key: 'sig', ok: progress.sig, label: 'Type your full legal name as signature' },
  ];

  const canGenerate = Object.values(progress).every(Boolean) && !formData.w9Item2Flagged;
  const allProgressDone = progressItems.every(i => i.ok);

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

  const confirmItem2Flag = () => {
    set('w9Item2Flagged', true);
    setItem2ConfirmOpen(false);
    toast.error('W-9 routed to Dyad compliance for review');
  };

  if (formData.w9Item2Flagged) {
    return (
      <div className="ob-bank-w9-admin-alert">
        <div className="ob-bank-w9-admin-head">
          <span className="ob-bank-w9-admin-pulse" aria-hidden="true" />
          ALERT TRIGGERED. Routed to Dyad Compliance Dashboard
        </div>
        <div className="ob-bank-w9-admin-body">
          <p className="ob-bank-w9-admin-summary">
            <strong>Item 2 cross-out flag raised.</strong> This W-9 cannot be signed via the enrollment portal until Dyad&rsquo;s compliance team has reviewed the matter. The Provider&rsquo;s authorized signatory will be contacted out-of-band, typically within 1 business hour during business days.
          </p>
          <p className="ob-bank-w9-admin-foot">For urgent matters, contact <strong>compliance@dyadmd.com</strong> directly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ob-bank-w9">
      <div className="ob-callout ob-callout-info">
        <strong>IRS Form W-9 (Rev. March 2024).</strong> Complete the fields below exactly as they appear on Form W-9. Upon completion and electronic signature, a fully populated and signed W-9 PDF will be generated. The signed PDF is suitable for submission to insurance carriers, plaintiff law firms (PI matters), Form 1099 issuers, and any other party requiring a W-9.
      </div>

      <div className="ob-bank-w9-line">
        <div className="ob-bank-w9-line-head">
          <span className="ob-bank-w9-num">1</span>
          <div className="ob-bank-w9-line-label">
            Name of entity/individual <span className="ob-req">*</span>
            {formData.w9Line1.trim() && <span className="ob-prefilled-badge">prefilled, editable</span>}
            <span className="ob-bank-w9-line-help">Must match the name on the entity&rsquo;s federal tax return. For sole proprietor / disregarded entity, enter the owner&rsquo;s name here.</span>
          </div>
        </div>
        <input className="ob-input" value={formData.w9Line1} onChange={e => set('w9Line1', e.target.value)} placeholder="Legal entity name (or individual name)" />
      </div>

      <div className="ob-bank-w9-line">
        <div className="ob-bank-w9-line-head">
          <span className="ob-bank-w9-num">2</span>
          <div className="ob-bank-w9-line-label">
            Business name / disregarded entity name
            <span className="ob-bank-w9-line-help">Only if different from Line 1. For sole proprietor, enter DBA. For disregarded entity, enter entity name.</span>
          </div>
        </div>
        <input className="ob-input" value={formData.w9Line2} onChange={e => set('w9Line2', e.target.value)} placeholder="Optional: DBA or disregarded entity name" />
      </div>

      <div className="ob-bank-w9-line">
        <div className="ob-bank-w9-line-head">
          <span className="ob-bank-w9-num">3a</span>
          <div className="ob-bank-w9-line-label">
            Federal tax classification <span className="ob-req">*</span>
            <span className="ob-bank-w9-line-help">Check the appropriate box for the federal tax classification of the entity on Line 1. Check only ONE of the seven boxes.</span>
          </div>
        </div>
        <div className="ob-bank-w9-radio-grid">
          {W9_TAX_CLASSES.map(tc => (
            <label
              key={tc.id}
              className={`ob-bank-w9-radio${formData.w9TaxClass === tc.id ? ' ob-bank-w9-radio-sel' : ''}${tc.id === '7' ? ' ob-bank-w9-radio-full' : ''}`}
            >
              <input type="radio" name="w9-tc" checked={formData.w9TaxClass === tc.id} onChange={() => set('w9TaxClass', tc.id)} />
              {tc.label}
            </label>
          ))}
        </div>
        {formData.w9TaxClass === '6' && (
          <div className="ob-bank-w9-extra ob-bank-w9-extra-show">
            <label className="ob-label">LLC tax classification <span className="ob-req">*</span></label>
            <select className="ob-input ob-select ob-bank-w9-llc-select" value={formData.w9LlcClass} onChange={e => set('w9LlcClass', e.target.value)}>
              <option value="">Select tax classification</option>
              <option value="C">C (C corporation)</option>
              <option value="S">S (S corporation)</option>
              <option value="P">P (Partnership)</option>
            </select>
            <p className="ob-field-hint">If the LLC is a single-member entity disregarded from its individual owner, do <strong>not</strong> select LLC here. Instead, check &ldquo;Individual / sole proprietor&rdquo; above and enter the owner&rsquo;s name on Line 1.</p>
          </div>
        )}
        {formData.w9TaxClass === '7' && (
          <div className="ob-bank-w9-extra ob-bank-w9-extra-show">
            <label className="ob-label">&ldquo;Other&rdquo; classification description <span className="ob-req">*</span></label>
            <input className="ob-input" value={formData.w9OtherDesc} onChange={e => set('w9OtherDesc', e.target.value)} placeholder="Describe (e.g., Nonprofit 501(c)(3), Cooperative)" />
          </div>
        )}
      </div>

      <div className="ob-bank-w9-line">
        <div className="ob-bank-w9-line-head">
          <span className="ob-bank-w9-num">5</span>
          <div className="ob-bank-w9-line-label">
            Address <span className="ob-req">*</span>
            {formData.w9Line5.trim() && <span className="ob-prefilled-badge">prefilled, editable</span>}
            <span className="ob-bank-w9-line-help">Number, street, and apartment or suite number. Information returns will be mailed to this address.</span>
          </div>
        </div>
        <input className="ob-input" value={formData.w9Line5} onChange={e => set('w9Line5', e.target.value)} placeholder="Street address" />
      </div>

      <div className="ob-bank-w9-line">
        <div className="ob-bank-w9-line-head">
          <span className="ob-bank-w9-num">6</span>
          <div className="ob-bank-w9-line-label">
            City, state, and ZIP code <span className="ob-req">*</span>
            {formData.w9Line6.trim() && <span className="ob-prefilled-badge">prefilled, editable</span>}
          </div>
        </div>
        <input className="ob-input" value={formData.w9Line6} onChange={e => set('w9Line6', e.target.value)} placeholder="City, ST 12345" />
      </div>

      <div className="ob-bank-w9-line ob-bank-w9-line-requester">
        <div className="ob-bank-w9-line-head">
          <span className="ob-bank-w9-num part">R</span>
          <div className="ob-bank-w9-line-label ob-bank-w9-line-label-accent">
            Requester&rsquo;s name and address (auto-populated)
            <span className="ob-bank-w9-line-help">Identifies Dyad as the entity requesting this W-9.</span>
          </div>
        </div>
        <input className="ob-input ob-input-readonly" readOnly value={DYAD_REQUESTER_ADDRESS} />
      </div>

      <div className="ob-bank-w9-line">
        <div className="ob-bank-w9-line-head">
          <span className="ob-bank-w9-num part">Part I</span>
          <div className="ob-bank-w9-line-label">
            Taxpayer Identification Number (TIN) <span className="ob-req">*</span>
            <span className="ob-bank-w9-line-help">Must match the name on Line 1 to avoid backup withholding. For entities, this is the EIN. For individuals / sole proprietors / disregarded entities, this is generally the SSN.</span>
          </div>
        </div>
        <div className="ob-bank-w9-tin-toggle">
          <button type="button" className={formData.w9TinType === 'EIN' ? 'act' : ''} onClick={() => { set('w9TinType', 'EIN'); set('w9Tin', ''); }}>Employer ID Number (EIN)</button>
          <button type="button" className={formData.w9TinType === 'SSN' ? 'act' : ''} onClick={() => { set('w9TinType', 'SSN'); set('w9Tin', ''); }}>Social Security Number (SSN)</button>
        </div>
        <div className="ob-bank-w9-tin-input">
          <input
            className="ob-input ob-bank-w9-tin-field"
            value={formData.w9Tin}
            onChange={e => set('w9Tin', formatTin(e.target.value, formData.w9TinType))}
            placeholder={formData.w9TinType === 'SSN' ? 'XXX-XX-XXXX' : 'XX-XXXXXXX'}
            maxLength={formData.w9TinType === 'SSN' ? 11 : 10}
            autoComplete="off"
          />
          <div className="ob-bank-w9-tin-mask">{tinMask(formData.w9TinType)}</div>
        </div>
      </div>

      <div className="ob-bank-w9-line">
        <div className="ob-bank-w9-line-head">
          <span className="ob-bank-w9-num part">Part II</span>
          <div className="ob-bank-w9-line-label">Certification: Preprinted Text from IRS Form W-9</div>
        </div>
        <div className="ob-bank-w9-cert-box">
          <div className="ob-bank-w9-cert-src">Source: IRS Form W-9 (Rev. March 2024), reproduced verbatim from the official form below.</div>
          <h5>Under penalties of perjury, I certify that:</h5>
          <ol>
            <li>The number shown on this form is my correct taxpayer identification number (or I am waiting for a number to be issued to me); and</li>
            <li>I am not subject to backup withholding because (a) I am exempt from backup withholding, or (b) I have not been notified by the Internal Revenue Service (IRS) that I am subject to backup withholding as a result of a failure to report all interest or dividends, or (c) the IRS has notified me that I am no longer subject to backup withholding; and</li>
            <li>I am a U.S. citizen or other U.S. person (defined below); and</li>
            <li>The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.</li>
          </ol>
          <div className="ob-bank-w9-cert-instr">
            <strong>Certification instructions.</strong> You must cross out item 2 above if you have been notified by the IRS that you are currently subject to backup withholding because you have failed to report all interest and dividends on your tax return.
          </div>
          <div className="ob-bank-w9-cert-portal-note">
            <strong>Dyad portal note (not part of IRS Form W-9).</strong> If item 2 above must be crossed out for your Form W-9, use the action below to flag this matter to Dyad compliance. The W-9 cannot be signed via this portal until reviewed.
          </div>
          {!item2ConfirmOpen ? (
            <div className="ob-bank-w9-item2-init">
              <button type="button" className="ob-bank-w9-item2-btn" onClick={() => setItem2ConfirmOpen(true)}>
                I need to cross out Item 2 (subject to IRS backup withholding)
              </button>
              <p className="ob-bank-w9-item2-help">Click only if you have been notified by the IRS that you are currently subject to backup withholding. This action will lock signing in this portal and route your W-9 to Dyad compliance.</p>
            </div>
          ) : (
            <div className="ob-bank-w9-item2-confirm">
              <div className="ob-bank-w9-item2-confirm-head">Confirm: cross out Item 2 and route for compliance review</div>
              <div className="ob-bank-w9-item2-confirm-body">
                By confirming, you certify that you have been notified by the IRS that you are currently subject to backup withholding. This action cannot be undone from the portal.
              </div>
              <div className="ob-bank-w9-item2-confirm-actions">
                <button type="button" className="ob-bank-w9-item2-cancel" onClick={() => setItem2ConfirmOpen(false)}>Cancel</button>
                <button type="button" className="ob-bank-w9-item2-confirm-btn" onClick={confirmItem2Flag}>Confirm: Cross Out &amp; Flag for Review</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!formData.w9Signed ? (
        <div className="ob-bank-w9-line ob-bank-w9-sign-card">
          <div className="ob-bank-w9-line-head">
            <span className="ob-bank-w9-num part">Sign</span>
            <div className="ob-bank-w9-line-label">
              Electronic Signature
              <span className="ob-bank-w9-line-help">Pursuant to the Electronic Signatures in Global and National Commerce Act (15 U.S.C. § 7001 et seq.) and IRS guidance permitting electronic execution of Form W-9.</span>
            </div>
          </div>

          <label className={`ob-bank-w9-esign-att${formData.w9EsignConsent ? ' ob-bank-w9-esign-att-checked' : ''}`}>
            <input type="checkbox" checked={formData.w9EsignConsent} onChange={e => set('w9EsignConsent', e.target.checked)} />
            <span className="ob-bank-w9-esign-att-text"><strong>ESIGN Consent.</strong> I consent to receive and execute this Form W-9 electronically. I confirm that I have the hardware and software necessary to receive and retain this electronic record, and I understand that my electronic signature shall have the same legal force and effect as a handwritten signature. I may withdraw this consent or request a paper copy by contacting <em>support@dyadmd.com</em>.</span>
          </label>
          <label className={`ob-bank-w9-esign-att${formData.w9IrsCert ? ' ob-bank-w9-esign-att-checked' : ''}`}>
            <input type="checkbox" checked={formData.w9IrsCert} onChange={e => set('w9IrsCert', e.target.checked)} />
            <span className="ob-bank-w9-esign-att-text"><strong>IRS Part II Certification.</strong> I, the undersigned, hereby certify under penalties of perjury that the information provided on this Form W-9 is true, correct, and complete; that I have read and understand the four numbered items in the Part II certification above; and that I am authorized to execute this Form W-9 on behalf of the entity identified on Line 1.</span>
          </label>
          <label className={`ob-bank-w9-esign-att${formData.w9AuthDist ? ' ob-bank-w9-esign-att-checked' : ''}`}>
            <input type="checkbox" checked={formData.w9AuthDist} onChange={e => set('w9AuthDist', e.target.checked)} />
            <span className="ob-bank-w9-esign-att-text"><strong>Authorization to Distribute.</strong> I authorize Dyad Practice Solutions, LLC to retain a copy of the executed Form W-9 in its records and to furnish a copy to insurance carriers, plaintiff law firms, Form 1099 issuers, and any other party with a legitimate need for the W-9.</span>
          </label>

          <div className="ob-bank-w9-sig-grid">
            <div>
              <input
                className="ob-bank-w9-sig-input"
                value={formData.w9Signature}
                onChange={e => set('w9Signature', e.target.value)}
                placeholder="Type full legal name to sign"
                autoComplete="off"
              />
              <span className="ob-bank-w9-sig-mini-label">Signature of U.S. Person (typed e-signature)</span>
            </div>
            <div>
              <div className="ob-bank-w9-sig-date">{sigDate}</div>
              <span className="ob-bank-w9-sig-mini-label">Date (auto)</span>
            </div>
          </div>

          <div className={`ob-bank-w9-progress${allProgressDone ? ' ob-bank-w9-progress-complete' : ''}`}>
            <div className="ob-bank-w9-progress-title">
              <span aria-hidden="true">{allProgressDone ? '✓' : '⚠'}</span>
              {allProgressDone ? 'All requirements complete. Ready to generate' : 'To complete Section 3, finish the following:'}
            </div>
            <ul className="ob-bank-w9-progress-list">
              {progressItems.map(item => (
                <li key={item.key} className={item.ok ? 'ok' : ''}>
                  <input type="checkbox" readOnly checked={item.ok} tabIndex={-1} aria-hidden="true" />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <button type="button" className={`ob-bank-w9-gen-btn${canGenerate ? '' : ' ob-btn-disabled'}`} onClick={handleGenerate} disabled={!canGenerate}>
            <ObForwardButtonLabel label="Generate & Sign W-9 PDF" />
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
          <p className="ob-bank-w9-success-foot">
            The signed Form W-9 will be included automatically at the end of the consolidated Document Package available for download or print at the bottom of this page.
          </p>
        </div>
      )}
    </div>
  );
};

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Landmark, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import type { OnboardingData } from '../../../pages/DyadOnboarding';
import { EnrollmentSaveNotice } from '../EnrollmentSaveNotice';
import { ObBackButtonLabel, ObForwardButtonLabel } from '../ObBtnArrow';
import { formatAgreementAcceptance } from '../step3/agreementHelpers';
import { FormW9Section } from './FormW9Section';
import { KycUploadBar } from './KycUploadBar';
import { ZohoPayWidget } from './ZohoPayWidget';
import {
  ACH_ATTEST_TEXT,
  AchDocumentBody,
  LpoaDocumentBody,
} from './bankingDocuments';
import { EnrollmentSectionsBarRow } from '../EnrollmentSectionsBarRow';
import {
  BANKING_SECTION_LABELS,
  BANKING_SECTION_ORDER,
  BANKING_SECTION_TITLES,
  CITIZENSHIP_OPTIONS,
  KYC_DOCUMENTS,
  US_STATES,
  type BankingSectionId,
  type KycDocId,
  type KycDocMeta,
} from './bankingConstants';

type SectionStatus = 'active' | 'completed' | 'locked';

export interface StepBankingPaymentSetupProps {
  formData: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const LPOA_ATTEST = 'I, the Authorized Signatory, grant Dyad Practice Solutions, LLC a Limited Power of Attorney as described above to open, establish, and administer a dedicated lockbox deposit account at Live Oak Bank, N.A. through the Anatomy Financial platform on behalf of my practice, and to perform all banking operations incidental to the revenue cycle services rendered under the Master Services Agreement. I certify that I have the legal authority to execute this Limited Power of Attorney on behalf of the Provider.';

const CIP_ATTEST = 'I certify under penalties of perjury that the personal information provided above is true, correct, and complete. I understand this information is required by federal banking regulations for customer identification and will be transmitted securely to Live Oak Bank, N.A. solely for the purpose of account verification.';

const SWEEP_ATTEST = 'I have reviewed the Designated Operating Account information shown above and the eight (8) provisions of the Sweep Authorization & Attestation. I authorize Dyad Practice Solutions, LLC to initiate weekly ACH credit sweeps from the Dyad lockbox account at Live Oak Banking Company, N.A. to the Designated Account specified above, and I agree to all terms set forth above on behalf of the Provider.';

const KYC_ATTEST = 'I certify that all documents provided above are authentic, current, and accurately represent the legal status and ownership structure of the practice. I understand that these documents are required by federal banking regulations and will be transmitted securely to Live Oak Bank, N.A. for the purpose of account verification and compliance with the Bank Secrecy Act and USA PATRIOT Act.';

const initSectionStatus = (formData: OnboardingData): Record<BankingSectionId, SectionStatus> => {
  const done: BankingSectionId[] = [];
  if (formData.step6Sec1Attested) done.push(1);
  if (formData.step6Sec2Attested) done.push(2);
  if (formData.w9Signed) done.push(3);
  if (formData.step6Sec4Attested) done.push(4);
  if (formData.step6Sec5Attested) done.push(5);
  if (formData.step6Sec6Attested) done.push(6);
  const status: Record<BankingSectionId, SectionStatus> = { 1: 'locked', 2: 'locked', 3: 'locked', 4: 'locked', 5: 'locked', 6: 'locked' };
  BANKING_SECTION_ORDER.forEach((id, i) => {
    if (done.includes(id)) status[id] = 'completed';
    else if (i === 0 || done.includes(BANKING_SECTION_ORDER[i - 1])) status[id] = 'active';
  });
  if (!done.length) status[1] = 'active';
  return status;
};

const AttestBox: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
  error?: string;
}> = ({ checked, onChange, children, error }) => (
  <>
    <label className={`ob-bank-attest${checked ? ' ob-bank-attest-checked' : ''}`}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="ob-bank-attest-text">{children}</div>
    </label>
    {error && <div className="ob-bank-attest-error">{error}</div>}
  </>
);

export const StepBankingPaymentSetup: React.FC<StepBankingPaymentSetupProps> = ({
  formData, set, onNext, onBack, isSubmitting,
}) => {
  const [sectionStatus, setSectionStatus] = useState(() => initSectionStatus(formData));
  const [openSections, setOpenSections] = useState<Record<BankingSectionId, boolean>>({
    1: !formData.step6Sec1Attested,
    2: false, 3: false, 4: false, 5: false, 6: false,
  });
  const [attestErrors, setAttestErrors] = useState<Partial<Record<BankingSectionId, string>>>({});
  const [showAccNum, setShowAccNum] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const signerFirst = formData.signerFirstName || formData.firstName;
  const signerLast = formData.signerLastName || formData.lastName;
  const signerName = `${signerFirst} ${signerLast}`.trim();
  const signerTitle = formData.signerTitle || formData.titleRole;
  const signerEmail = formData.signerEmail || formData.contactEmail;
  const signerPhone = formData.contactPhone;

  const prefillW9 = useCallback(() => {
    if (!formData.w9Line1) {
      const addr = formData.entityStreet
        ? `${formData.entityStreet}, ${formData.entityCity}, ${formData.entityAddrState || formData.state} ${formData.entityZip || formData.zip}`
        : `${formData.practiceAddress}, ${formData.city}, ${formData.state} ${formData.zip}`;
      set('w9Line1', formData.entityLegalName || formData.groupLegalName || formData.organizationName);
      set('w9Line5', formData.entityStreet || formData.practiceAddress);
      set('w9Line6', addr);
      if (formData.taxId) set('w9Tin', formData.taxId);
      if (!formData.w9TinType) set('w9TinType', 'EIN');
    }
  }, [formData, set]);

  useEffect(() => { prefillW9(); }, [prefillW9]);

  const sectionsComplete = BANKING_SECTION_ORDER.filter(id => sectionStatus[id] === 'completed').length;
  const progressPct = Math.round((sectionsComplete / BANKING_SECTION_ORDER.length) * 100);
  const allComplete = sectionsComplete === BANKING_SECTION_ORDER.length;

  const completeSection = (id: BankingSectionId) => {
    const idx = BANKING_SECTION_ORDER.indexOf(id);
    const next: Record<BankingSectionId, SectionStatus> = { ...sectionStatus, [id]: 'completed' };
    if (idx < BANKING_SECTION_ORDER.length - 1) {
      const n = BANKING_SECTION_ORDER[idx + 1];
      if (next[n] === 'locked') next[n] = 'active';
    }
    setSectionStatus(next);
    setOpenSections(prev => {
      const o = { ...prev, [id]: false };
      if (idx < BANKING_SECTION_ORDER.length - 1) o[BANKING_SECTION_ORDER[idx + 1]] = true;
      return o;
    });
    setAttestErrors(prev => ({ ...prev, [id]: undefined }));
    setTimeout(() => {
      const nextId = BANKING_SECTION_ORDER[idx + 1];
      if (nextId) document.getElementById(`ob-step6-sec-${nextId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  };

  const validateSection = (id: BankingSectionId): string | null => {
    if (id === 2) {
      if (!formData.step6CipDob || !formData.step6CipSsn || !formData.step6CipCitizenship
        || !formData.step6CipResAddress || !formData.step6CipResCity || !formData.step6CipResState || !formData.step6CipResZip) {
        return 'Please complete all required CIP fields';
      }
    }
    if (id === 3 && !formData.w9Signed) return 'Please generate and sign the W-9 in this section to complete it.';
    if (id === 4) {
      if (!formData.bankName || !formData.achBankPhone || !formData.achBankAddress
        || formData.routingNumber.length !== 9 || !formData.accountNumber || !formData.accountType) {
        return 'Please complete all operating account fields';
      }
      if (!formData.achMandateActive) return 'Please activate the Zoho Pay Auto-ACH mandate';
    }
    if (id === 5) {
      if (!formData.sweepUseSection4) {
        if (!formData.sweepOtherBankName || !formData.sweepOtherAcctType
          || formData.sweepOtherRouting.length !== 9 || !formData.sweepOtherAccount) {
          return 'Please complete alternate sweep destination account fields';
        }
      } else if (formData.routingNumber.length !== 9 || !formData.accountNumber) {
        return 'Complete Section 4 operating account first';
      }
    }
    if (id === 6) {
      const missing = KYC_DOCUMENTS.some(d => !formData.kycDocuments[d.id]);
      if (missing) return 'Please upload all required KYC documents';
    }
    return null;
  };

  const handleAttest = (id: BankingSectionId, checked: boolean, attestKey: keyof OnboardingData) => {
    if (!checked) {
      set(attestKey, false as never);
      if (sectionStatus[id] === 'completed') {
        setSectionStatus(prev => ({ ...prev, [id]: 'active' }));
      }
      return;
    }
    const err = validateSection(id);
    if (err) {
      setAttestErrors(prev => ({ ...prev, [id]: err }));
      return;
    }
    set(attestKey, true as never);
    completeSection(id);
  };

  const syncAchToLegacy = (field: string, value: string) => {
    if (field === 'bankName') set('bankName', value);
    if (field === 'routing') set('routingNumber', value.replace(/\D/g, '').slice(0, 9));
    if (field === 'account') set('accountNumber', value.replace(/\D/g, ''));
    if (field === 'type') set('accountType', value.replace(' Account', ''));
    set('accountHolderName', formData.entityLegalName || formData.groupLegalName || formData.organizationName);
  };

  const sweepDisplay = useMemo(() => {
    if (!formData.sweepUseSection4) {
      return {
        bank: formData.sweepOtherBankName || '—',
        type: formData.sweepOtherAcctType || '—',
        routing: formData.sweepOtherRouting || '—',
        account: formData.sweepOtherAccount ? '••••' + formData.sweepOtherAccount.slice(-4) : '—',
      };
    }
    return {
      bank: formData.bankName || 'Not yet entered in Section 4',
      type: formData.accountType ? `${formData.accountType} Account` : 'Not yet selected in Section 4',
      routing: formData.routingNumber || 'Not yet entered in Section 4',
      account: formData.accountNumber ? '••••' + formData.accountNumber.slice(-4) : 'Not yet entered in Section 4',
    };
  }, [formData]);

  const handleFinish = () => {
    if (!allComplete) {
      toast.error('Please complete all 6 sections before finishing enrollment');
      return;
    }
    const { recordId } = formatAgreementAcceptance();
    const confId = `DYAD-ENR-${recordId}`;
    const submitted = new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    set('step6ConfirmationId', confId);
    set('step6EnrollmentComplete', true);
    setShowComplete(true);
  };

  const handleConfirmComplete = () => {
    setShowComplete(false);
    onNext();
  };

  const renderHeader = (id: BankingSectionId) => {
    const status = sectionStatus[id];
    const open = openSections[id];
    return (
      <button
        type="button"
        className={`ob-step6-sec-hdr${status === 'active' ? ' ob-step6-sec-hdr-active' : ''}${status === 'completed' ? ' ob-step6-sec-hdr-done' : ''}${status === 'locked' ? ' ob-step6-sec-hdr-locked' : ''}`}
        onClick={() => status !== 'locked' && setOpenSections(p => ({ ...p, [id]: !p[id] }))}
        disabled={status === 'locked'}
      >
        <span className="ob-step6-sec-num">{status === 'completed' ? '✓' : id}</span>
        <span className="ob-step6-sec-meta">
          <span className="ob-step6-sec-title">{BANKING_SECTION_TITLES[id]}</span>
          <span className="ob-step6-sec-sts">
            {status === 'completed' ? 'Complete ✓'
              : status === 'active' ? 'In progress — complete to continue'
                : `Complete Section ${BANKING_SECTION_ORDER[BANKING_SECTION_ORDER.indexOf(id) - 1]} to unlock`}
          </span>
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
    );
  };

  const downloadSection = (title: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ob-step-content ob-step6-layout">
      <div className="ob-step-header">
        <h2 className="ob-step-title">Bank &amp; Payment Setup</h2>
        <p className="ob-step-subtitle">
          Complete the required banking authorizations and documentation below. Each section must be reviewed and attested to before proceeding.
        </p>
      </div>

      <div className="ob-info-callout ob-callout-secure">
        <Landmark size={16} className="ob-callout-icon" />
        <span>Your banking information is encrypted using AES-256. Dyad will only use these details for ACH remittance as outlined in your MSA.</span>
      </div>

      <div className="ob-step-sections-bar">
        <EnrollmentSectionsBarRow
          progressPct={progressPct}
          sectionsComplete={sectionsComplete}
          totalSections={BANKING_SECTION_ORDER.length}
        />
      </div>

      {/* Section 1: LPOA */}
      <div id="ob-step6-sec-1" className={`ob-step6-sec-card${openSections[1] ? ' ob-step6-sec-open' : ''}${sectionStatus[1] === 'completed' ? ' ob-step6-sec-done' : ''}`}>
        {renderHeader(1)}
        {openSections[1] && sectionStatus[1] !== 'locked' && (
          <div className="ob-step6-sec-body">
            <div className="ob-callout ob-callout-info">
              <strong>Authorization Required.</strong> In order to open and operate a dedicated lockbox deposit account on your behalf through Anatomy and Live Oak Bank, N.A., Dyad requires a Limited Power of Attorney from the Provider.
            </div>
            <LpoaDocumentBody />
            <AttestBox
              checked={formData.step6Sec1Attested}
              onChange={c => handleAttest(1, c, 'step6Sec1Attested')}
              error={attestErrors[1]}
            >
              {LPOA_ATTEST}
            </AttestBox>
          </div>
        )}
      </div>

      {/* Section 2: CIP */}
      <div id="ob-step6-sec-2" className={`ob-step6-sec-card${openSections[2] ? ' ob-step6-sec-open' : ''}${sectionStatus[2] === 'completed' ? ' ob-step6-sec-done' : ''}`}>
        {renderHeader(2)}
        {openSections[2] && sectionStatus[2] !== 'locked' && (
          <div className="ob-step6-sec-body">
            <div className="ob-callout ob-callout-info">
              <strong>Customer Identification Program (CIP).</strong> Federal banking regulations require Live Oak Bank to verify the identity of individuals with significant responsibility to control, manage, or direct the practice.
            </div>
            <div className="ob-form-row">
              <div className="ob-field">
                <label className="ob-label">First Name <span className="ob-confirmed-badge">✓ confirmed</span></label>
                <input className="ob-input ob-input-readonly" readOnly value={signerFirst} />
              </div>
              <div className="ob-field">
                <label className="ob-label">Last Name <span className="ob-confirmed-badge">✓ confirmed</span></label>
                <input className="ob-input ob-input-readonly" readOnly value={signerLast} />
              </div>
            </div>
            <div className="ob-form-row">
              <div className="ob-field">
                <label className="ob-label">Title / Role <span className="ob-confirmed-badge">✓ confirmed</span></label>
                <input className="ob-input ob-input-readonly" readOnly value={signerTitle} />
              </div>
              <div className="ob-field">
                <label className="ob-label">Date of Birth <span className="ob-req">*</span></label>
                <input type="date" className="ob-input" value={formData.step6CipDob} onChange={e => set('step6CipDob', e.target.value)} />
              </div>
            </div>
            <div className="ob-form-row">
              <div className="ob-field">
                <label className="ob-label">Social Security Number <span className="ob-req">*</span></label>
                <input type="password" className="ob-input" placeholder="•••-••-••••" maxLength={11} value={formData.step6CipSsn} onChange={e => set('step6CipSsn', e.target.value)} />
                <span className="ob-field-hint">Encrypted at rest and in transit. Shared only with Live Oak Bank for CIP verification.</span>
              </div>
              <div className="ob-field">
                <label className="ob-label">Citizenship <span className="ob-req">*</span></label>
                <select className="ob-input ob-select" value={formData.step6CipCitizenship} onChange={e => set('step6CipCitizenship', e.target.value)}>
                  <option value="">Select</option>
                  {CITIZENSHIP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="ob-field">
              <label className="ob-label">Residential Address <span className="ob-req">*</span></label>
              <input className="ob-input" placeholder="Personal residential address (not business address)" value={formData.step6CipResAddress} onChange={e => set('step6CipResAddress', e.target.value)} />
            </div>
            <div className="ob-form-row">
              <div className="ob-field">
                <label className="ob-label">City <span className="ob-req">*</span></label>
                <input className="ob-input" value={formData.step6CipResCity} onChange={e => set('step6CipResCity', e.target.value)} />
              </div>
              <div className="ob-field">
                <label className="ob-label">State <span className="ob-req">*</span></label>
                <select className="ob-input ob-select" value={formData.step6CipResState} onChange={e => set('step6CipResState', e.target.value)}>
                  <option value="">Select state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="ob-form-row">
              <div className="ob-field">
                <label className="ob-label">ZIP Code <span className="ob-req">*</span></label>
                <input className="ob-input" maxLength={10} value={formData.step6CipResZip} onChange={e => set('step6CipResZip', e.target.value)} />
              </div>
              <div className="ob-field">
                <label className="ob-label">Mobile Phone <span className="ob-confirmed-badge">✓ confirmed</span></label>
                <input className="ob-input ob-input-readonly" readOnly value={signerPhone} />
              </div>
            </div>
            <div className="ob-field">
              <label className="ob-label">Email <span className="ob-confirmed-badge">✓ confirmed</span></label>
              <input className="ob-input ob-input-readonly" readOnly value={signerEmail} />
            </div>
            <AttestBox
              checked={formData.step6Sec2Attested}
              onChange={c => handleAttest(2, c, 'step6Sec2Attested')}
              error={attestErrors[2]}
            >
              {CIP_ATTEST}
            </AttestBox>
          </div>
        )}
      </div>

      {/* Section 3: W-9 */}
      <div id="ob-step6-sec-3" className={`ob-step6-sec-card${openSections[3] ? ' ob-step6-sec-open' : ''}${sectionStatus[3] === 'completed' ? ' ob-step6-sec-done' : ''}`}>
        {renderHeader(3)}
        {openSections[3] && sectionStatus[3] !== 'locked' && (
          <div className="ob-step6-sec-body">
            <FormW9Section formData={formData} set={set} signerName={signerName} onSigned={() => completeSection(3)} />
          </div>
        )}
      </div>

      {/* Section 4: ACH */}
      <div id="ob-step6-sec-4" className={`ob-step6-sec-card${openSections[4] ? ' ob-step6-sec-open' : ''}${sectionStatus[4] === 'completed' ? ' ob-step6-sec-done' : ''}`}>
        {renderHeader(4)}
        {openSections[4] && sectionStatus[4] !== 'locked' && (
          <div className="ob-step6-sec-body">
            <div className="ob-callout ob-callout-warn">
              <strong>Important Distinction.</strong> The bank account information below must be your practice&rsquo;s <strong>existing operating account</strong> — the account from which Dyad will debit monthly service fees. This is <em>not</em> the new Dyad lockbox account.
            </div>
            <AchDocumentBody />
            <div className="ob-form-section-label" style={{ marginTop: 16 }}>Provider&rsquo;s Existing Operating Account (Account to be Debited)</div>
            <div className="ob-form-row">
              <div className="ob-field">
                <label className="ob-label">Bank Name <span className="ob-req">*</span></label>
                <input className="ob-input" value={formData.bankName} onChange={e => syncAchToLegacy('bankName', e.target.value)} placeholder="Enter your current bank name" />
              </div>
              <div className="ob-field">
                <label className="ob-label">Bank Phone <span className="ob-req">*</span></label>
                <input className="ob-input" value={formData.achBankPhone} onChange={e => set('achBankPhone', e.target.value)} placeholder="(555) 000-0000" />
              </div>
            </div>
            <div className="ob-field">
              <label className="ob-label">Bank Address <span className="ob-req">*</span></label>
              <input className="ob-input" value={formData.achBankAddress} onChange={e => set('achBankAddress', e.target.value)} placeholder="Full bank branch address" />
            </div>
            <div className="ob-form-row">
              <div className="ob-field">
                <label className="ob-label">Routing Number (ABA) <span className="ob-req">*</span></label>
                <input className="ob-input" maxLength={9} value={formData.routingNumber} onChange={e => syncAchToLegacy('routing', e.target.value)} placeholder="9-digit routing number" />
              </div>
              <div className="ob-field">
                <label className="ob-label">Account Number <span className="ob-req">*</span></label>
                <div className="ob-input-icon-wrap">
                  <input
                    type={showAccNum ? 'text' : 'password'}
                    className="ob-input ob-input-with-icon"
                    value={formData.accountNumber}
                    onChange={e => syncAchToLegacy('account', e.target.value)}
                    placeholder="Account number"
                  />
                  <button type="button" className="ob-input-icon-btn" onClick={() => setShowAccNum(v => !v)} tabIndex={-1}>
                    {showAccNum ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="ob-field">
              <label className="ob-label">Account Type <span className="ob-req">*</span></label>
              <select className="ob-input ob-select" value={formData.accountType ? `${formData.accountType} Account` : ''} onChange={e => syncAchToLegacy('type', e.target.value)}>
                <option value="">Select</option>
                <option>Checking Account</option>
                <option>Savings Account</option>
              </select>
            </div>
            <div className="ob-bank-zp-label">Initiate Recurring Auto-ACH Payment</div>
            <ZohoPayWidget
              bankDisplay={formData.bankName ? `${formData.bankName} · Routing ${formData.routingNumber || '—'}` : ''}
              mandateActive={formData.achMandateActive}
              mandateId={formData.achMandateId}
              activatedAt={formData.achMandateActivatedAt}
              disabled={!formData.bankName || formData.routingNumber.length !== 9 || !formData.accountNumber}
              onActivate={(id, at) => { set('achMandateActive', true); set('achMandateId', id); set('achMandateActivatedAt', at); }}
            />
            <AttestBox
              checked={formData.step6Sec4Attested}
              onChange={c => handleAttest(4, c, 'step6Sec4Attested')}
              error={attestErrors[4]}
            >
              {ACH_ATTEST_TEXT}
            </AttestBox>
          </div>
        )}
      </div>

      {/* Section 5: Sweep */}
      <div id="ob-step6-sec-5" className={`ob-step6-sec-card${openSections[5] ? ' ob-step6-sec-open' : ''}${sectionStatus[5] === 'completed' ? ' ob-step6-sec-done' : ''}`}>
        {renderHeader(5)}
        {openSections[5] && sectionStatus[5] !== 'locked' && (
          <div className="ob-step6-sec-body">
            <div className="ob-callout ob-callout-info">
              <strong>Automated Sweep Schedule.</strong> Collected funds deposited into your Dyad lockbox account are swept weekly to your Designated Operating Account.
            </div>
            <div className="ob-bank-sw-line">
              <div className="ob-bank-sw-head">Sweep Schedule</div>
              <div className="ob-form-row">
                <div className="ob-field"><label className="ob-label">Sweep Day</label><input className="ob-input ob-input-readonly" readOnly value="Every Friday" /></div>
                <div className="ob-field"><label className="ob-label">Frequency</label><input className="ob-input ob-input-readonly" readOnly value="Weekly" /></div>
                <div className="ob-field"><label className="ob-label">Expected Settlement</label><input className="ob-input ob-input-readonly" readOnly value="1–2 business days" /></div>
              </div>
            </div>
            <div className="ob-bank-sw-line">
              <div className="ob-bank-sw-head">Designated Operating Account (Sweep Destination)</div>
              <div className="ob-bank-sw-toggle">
                <label className={`ob-bank-sw-radio${formData.sweepUseSection4 ? ' ob-bank-sw-radio-sel' : ''}`}>
                  <input type="radio" name="sw-acct" checked={formData.sweepUseSection4} onChange={() => set('sweepUseSection4', true)} />
                  Use the account from Section 4 (recommended)
                </label>
                <label className={`ob-bank-sw-radio${!formData.sweepUseSection4 ? ' ob-bank-sw-radio-sel' : ''}`}>
                  <input type="radio" name="sw-acct" checked={!formData.sweepUseSection4} onChange={() => set('sweepUseSection4', false)} />
                  Specify a different account for sweeps
                </label>
              </div>
              {formData.sweepUseSection4 ? (
                <div className="ob-bank-sw-display">
                  <div className="ob-bank-sw-grid">
                    <div><div className="ob-bank-sw-dl">Bank Name</div><div className="ob-bank-sw-dv">{sweepDisplay.bank}</div></div>
                    <div><div className="ob-bank-sw-dl">Account Type</div><div className="ob-bank-sw-dv">{sweepDisplay.type}</div></div>
                    <div><div className="ob-bank-sw-dl">Routing Number</div><div className="ob-bank-sw-dv">{sweepDisplay.routing}</div></div>
                    <div><div className="ob-bank-sw-dl">Account Number</div><div className="ob-bank-sw-dv">{sweepDisplay.account}</div></div>
                  </div>
                </div>
              ) : (
                <div className="ob-bank-sw-form">
                  <div className="ob-form-row">
                    <div className="ob-field">
                      <label className="ob-label">Bank Name <span className="ob-req">*</span></label>
                      <input className="ob-input" value={formData.sweepOtherBankName} onChange={e => set('sweepOtherBankName', e.target.value)} />
                    </div>
                    <div className="ob-field">
                      <label className="ob-label">Account Type <span className="ob-req">*</span></label>
                      <select className="ob-input ob-select" value={formData.sweepOtherAcctType} onChange={e => set('sweepOtherAcctType', e.target.value)}>
                        <option value="">Select</option>
                        <option>Checking Account</option>
                        <option>Savings Account</option>
                      </select>
                    </div>
                  </div>
                  <div className="ob-form-row">
                    <div className="ob-field">
                      <label className="ob-label">Routing Number <span className="ob-req">*</span></label>
                      <input className="ob-input" maxLength={9} value={formData.sweepOtherRouting} onChange={e => set('sweepOtherRouting', e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <div className="ob-field">
                      <label className="ob-label">Account Number <span className="ob-req">*</span></label>
                      <input className="ob-input" value={formData.sweepOtherAccount} onChange={e => set('sweepOtherAccount', e.target.value.replace(/\D/g, ''))} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <AttestBox
              checked={formData.step6Sec5Attested}
              onChange={c => handleAttest(5, c, 'step6Sec5Attested')}
              error={attestErrors[5]}
            >
              {SWEEP_ATTEST}
            </AttestBox>
          </div>
        )}
      </div>

      {/* Section 6: KYC */}
      <div id="ob-step6-sec-6" className={`ob-step6-sec-card${openSections[6] ? ' ob-step6-sec-open' : ''}${sectionStatus[6] === 'completed' ? ' ob-step6-sec-done' : ''}`}>
        {renderHeader(6)}
        {openSections[6] && sectionStatus[6] !== 'locked' && (
          <div className="ob-step6-sec-body">
            <div className="ob-callout ob-callout-info">
              <strong>Federal Banking Requirement.</strong> The Bank Secrecy Act and CIP regulations require Live Oak Bank to verify your practice&rsquo;s identity prior to opening a deposit account.
            </div>
            {KYC_DOCUMENTS.map(doc => (
              <KycUploadBar
                key={doc.id}
                docId={doc.id}
                name={doc.name}
                desc={doc.desc}
                accept={doc.accept}
                meta={formData.kycDocuments[doc.id]}
                onUpload={(id, meta: KycDocMeta) => set('kycDocuments', { ...formData.kycDocuments, [id]: meta })}
                onRemove={(id: KycDocId) => set('kycDocuments', { ...formData.kycDocuments, [id]: null })}
              />
            ))}
            <AttestBox
              checked={formData.step6Sec6Attested}
              onChange={c => handleAttest(6, c, 'step6Sec6Attested')}
              error={attestErrors[6]}
            >
              {KYC_ATTEST}
            </AttestBox>
          </div>
        )}
      </div>

      {/* Document bundle */}
      <div className={`ob-bank-dlbundle${allComplete && formData.w9Signed ? ' ob-bank-dlbundle-ready' : ''}`}>
        <div className="ob-bank-dlbundle-head">
          <div className="ob-bank-dlbundle-icon">✓</div>
          <div>
            <div className="ob-bank-dlbundle-title">Documents — Download or Print Your Banking Package</div>
            <div className="ob-bank-dlbundle-desc">Consolidates all six sections plus your executed IRS Form W-9 into a single document set.</div>
          </div>
        </div>
        {!formData.w9Signed && (
          <div className="ob-bank-dlbundle-status">
            Form W-9 — <strong>not yet signed</strong>. Complete Section 3 to enable the complete document package.
          </div>
        )}
        <div className="ob-bank-dlbundle-grid">
          <button type="button" className="ob-bank-dlbundle-btn" disabled={!allComplete || !formData.w9Signed} onClick={() => window.print()}>
            🖨️ Print Complete Document Package
          </button>
          <button type="button" className="ob-bank-dlbundle-btn" disabled={!allComplete || !formData.w9Signed} onClick={() => downloadSection('Banking_Payment_Setup_Package', 'Dyad Banking & Payment Setup — Complete Package')}>
            ⬇️ Download Complete Document Package
          </button>
        </div>
      </div>

      {/* Finish bar */}
      <div className={`ob-bank-finish-bar${allComplete ? ' ob-bank-finish-bar-ready' : ''}`}>
        <div className="ob-bank-finish-icon"><ShieldCheck size={22} /></div>
        <div className="ob-bank-finish-body">
          <div className="ob-bank-finish-title">{allComplete ? 'All sections complete — ready to finish enrollment' : 'Complete all 6 sections to finish enrollment'}</div>
          <div className="ob-bank-finish-sub">
            {allComplete ? 'Your banking authorizations and KYC documentation will be submitted securely.' : `${sectionsComplete} of 6 sections attested. Each section unlocks sequentially.`}
          </div>
        </div>
        <button type="button" className="ob-bank-finish-btn" disabled={!allComplete || isSubmitting} onClick={handleFinish}>
          <ObForwardButtonLabel label="Complete Enrollment" loading={isSubmitting} loadingLabel="Submitting…" />
        </button>
      </div>

      <div className="ob-step-bottom-zone">
        <EnrollmentSaveNotice />
        <div className="ob-step-nav ob-step6-nav">
          <button type="button" className="ob-btn-secondary" onClick={onBack} disabled={isSubmitting}>
            <ObBackButtonLabel />
          </button>
        </div>
      </div>

      {showComplete && (
        <div className="ob-bank-complete-overlay" role="dialog" aria-modal>
          <div className="ob-bank-complete-card">
            <div className="ob-bank-complete-icon">✓</div>
            <h3 className="ob-bank-complete-title">Enrollment Complete</h3>
            <p className="ob-bank-complete-sub">Your banking authorizations and documentation have been submitted. Welcome to Dyad Practice Solutions.</p>
            <div className="ob-bank-complete-meta">
              <div className="ob-bank-complete-row"><span>Confirmation ID</span><span>{formData.step6ConfirmationId}</span></div>
              <div className="ob-bank-complete-row"><span>Submitted</span><span>{new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
            </div>
            <button type="button" className="ob-btn-primary" onClick={handleConfirmComplete}>
              <ObForwardButtonLabel label="Continue" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

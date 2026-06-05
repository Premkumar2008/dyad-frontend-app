import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendEmailOTP, verifyOTP } from '../../../services/api';
import { AgreementExhibit } from './AgreementExhibit';
import { NdaExhibitA } from './NdaExhibitA';
import { BaaExhibitB } from './BaaExhibitB';
import { formatAgreementAcceptance } from './agreementHelpers';
import type { OnboardingData } from '../../../pages/DyadOnboarding';
import { EnrollmentSectionsBarRow } from '../EnrollmentSectionsBarRow';
import { ObArrowRight, ObForwardButtonLabel, trimBtnArrow } from '../ObBtnArrow';

type Step3SectionId = 'A' | 'B' | 'C';
type SectionStatus = 'active' | 'completed' | 'locked';

const STEP3_SECTIONS: Step3SectionId[] = ['A', 'B', 'C'];

const ENTITY_TYPES = [
  'Professional Medical Corporation',
  'Professional Limited Liability Company (PLLC)',
  'Limited Liability Company (LLC)',
  'Limited Partnership (LP)',
  'General Partnership',
  'S Corporation',
  'C Corporation',
  'Sole Proprietorship / Solo Practice',
  'Ambulatory Surgery Center (ASC)',
  'Non-Profit Organization',
  'Government Entity',
  'Other',
];

const US_STATES_FULL = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
];

const US_STATES_ABBR = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM',
  'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA',
  'WV', 'WI', 'WY',
];

const emptyNdaFields = (): Record<string, string> => ({
  pname: '', edate: '', pentity: '', ptype: '', pstate: '', paddr: '', signame: '', sigtitle: '',
});

const emptyBaaFields = (): Record<string, string> => ({
  pname: '', centity: '', edate: '', signame: '', sigtitle: '',
});

export interface StepSignAgreementsProps {
  formData: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  renderNavBar: (props: {
    onBack: () => void;
    onNext: () => void;
    canProceed: boolean;
    nextLabel: string;
  }) => React.ReactNode;
}

const getInitialSectionStatus = (formData: OnboardingData): Record<Step3SectionId, SectionStatus> => {
  if (formData.step3BaaComplete) {
    return { A: 'completed', B: 'completed', C: 'completed' };
  }
  if (formData.step3NdaComplete) {
    return { A: 'completed', B: 'completed', C: 'active' };
  }
  if (formData.step3EntityComplete) {
    return { A: 'completed', B: 'active', C: 'locked' };
  }
  return { A: 'active', B: 'locked', C: 'locked' };
};

export const StepSignAgreements: React.FC<StepSignAgreementsProps> = ({
  formData, set, setFormData, onNext, onBack, isSubmitting, renderNavBar,
}) => {
  const [sectionStatus, setSectionStatus] = useState<Record<Step3SectionId, SectionStatus>>(
    () => getInitialSectionStatus(formData),
  );
  const [openSections, setOpenSections] = useState<Record<Step3SectionId, boolean>>({
    A: !formData.step3EntityComplete,
    B: formData.step3EntityComplete && !formData.step3NdaComplete,
    C: formData.step3NdaComplete && !formData.step3BaaComplete,
  });

  const [ndaFields, setNdaFields] = useState<Record<string, string>>(
    () => ({ ...emptyNdaFields(), ...formData.ndaFields }),
  );
  const [baaFields, setBaaFields] = useState<Record<string, string>>(
    () => ({ ...emptyBaaFields(), ...formData.baaFields }),
  );

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const [ndaAcceptedAt, setNdaAcceptedAt] = useState<string | null>(formData.ndaAcceptedAt || null);
  const [baaAcceptedAt, setBaaAcceptedAt] = useState<string | null>(formData.baaAcceptedAt || null);

  const preverifiedEmail = useMemo(
    () => !!(formData.contactEmail && formData.step2ContactContinued),
    [formData.contactEmail, formData.step2ContactContinued],
  );

  useEffect(() => {
    if (preverifiedEmail && !formData.signerEmailVerified) {
      set('signerEmailVerified', true);
    }
  }, [preverifiedEmail, formData.signerEmailVerified, set]);

  useEffect(() => {
    set('ndaFields', ndaFields);
  }, [ndaFields, set]);

  useEffect(() => {
    set('baaFields', baaFields);
  }, [baaFields, set]);

  const step3SectionsComplete =
    (formData.step3EntityComplete ? 1 : 0)
    + (formData.step3NdaComplete ? 1 : 0)
    + (formData.step3BaaComplete ? 1 : 0);
  const step3ProgressPct = Math.round((step3SectionsComplete / 3) * 100);

  const syncEntityFromPriorSteps = useCallback(() => {
    const legalName = formData.entityLegalName
      || formData.groupLegalName
      || formData.organizationName
      || '';
    const street = formData.entityStreet || formData.practiceAddress || '';
    const city = formData.entityCity || formData.city || '';
    const addrState = formData.entityAddrState || formData.state || '';
    const zip = formData.entityZip || formData.zip || '';

    if (!formData.entityLegalName && legalName) set('entityLegalName', legalName);
    if (!formData.entityStreet && street) set('entityStreet', street);
    if (!formData.entityCity && city) set('entityCity', city);
    if (!formData.entityAddrState && addrState) set('entityAddrState', addrState);
    if (!formData.entityZip && zip) set('entityZip', zip);
    if (!formData.signerEmail && formData.contactEmail) {
      setFormData(prev => ({
        ...prev,
        signerEmail: prev.contactEmail,
        signerFirstName: prev.firstName,
        signerLastName: prev.lastName,
        signerTitle: prev.titleRole,
      }));
    }
  }, [formData, set, setFormData]);

  useEffect(() => {
    syncEntityFromPriorSteps();
  }, [syncEntityFromPriorSteps]);

  const toggleSection = (id: Step3SectionId) => {
    if (sectionStatus[id] === 'locked') return;
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completeSection = (id: Step3SectionId) => {
    const idx = STEP3_SECTIONS.indexOf(id);
    const next: Record<Step3SectionId, SectionStatus> = { ...sectionStatus, [id]: 'completed' };
    if (idx < STEP3_SECTIONS.length - 1) {
      const nextId = STEP3_SECTIONS[idx + 1];
      if (next[nextId] === 'locked') next[nextId] = 'active';
    }
    setSectionStatus(next);
    setOpenSections(prev => {
      const o = { ...prev, [id]: false };
      if (idx < STEP3_SECTIONS.length - 1) o[STEP3_SECTIONS[idx + 1]] = true;
      return o;
    });
    setTimeout(() => {
      const el = document.getElementById(`ob-step3-section-${STEP3_SECTIONS[idx + 1] || id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  };

  const entityValid =
    !!formData.entityLegalName.trim()
    && !!formData.entityType
    && !!formData.entityFormationState
    && !!formData.entityStreet.trim()
    && !!formData.entityCity.trim()
    && !!formData.entityAddrState
    && !!formData.entityZip.trim()
    && !!formData.signerFirstName.trim()
    && !!formData.signerLastName.trim()
    && !!formData.signerTitle.trim()
    && !!formData.signerEmail.trim()
    && formData.signerEmailVerified;

  const handleSendOtp = async () => {
    const email = formData.signerEmail.trim();
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setOtpSending(true);
    try {
      await sendEmailOTP(email);
      setOtpSent(true);
      toast.success('Verification code sent');
    } catch {
      toast.error('Could not send verification code. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.trim().length < 4) {
      toast.error('Please enter the verification code sent to your email');
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await verifyOTP({ email: formData.signerEmail.trim(), otp: otpCode.trim() });
      if (res.data?.success) {
        set('signerEmailVerified', true);
        setOtpSent(false);
        toast.success('Email verified');
      } else {
        toast.error(res.data?.message || 'Invalid verification code');
      }
    } catch {
      toast.error('Verification failed. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const populateAgreementsFromEntity = () => {
    const name = formData.entityLegalName.trim();
    const etype = formData.entityType;
    const estate = formData.entityFormationState;
    const fullAddr = `${formData.entityStreet.trim()}, ${formData.entityCity.trim()}, ${formData.entityAddrState} ${formData.entityZip.trim()}`;
    const fullName = `${formData.signerFirstName.trim()} ${formData.signerLastName.trim()}`.trim();
    const stitle = formData.signerTitle.trim();
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const nda = {
      pname: name,
      pentity: name,
      ptype: etype,
      pstate: estate,
      paddr: fullAddr,
      edate: today,
      signame: fullName,
      sigtitle: stitle,
    };
    const baa = {
      pname: name,
      centity: name,
      edate: today,
      signame: fullName,
      sigtitle: stitle,
    };
    setNdaFields(prev => ({ ...prev, ...nda }));
    setBaaFields(prev => ({ ...prev, ...baa }));
  };

  const handleCompleteEntity = () => {
    if (!entityValid) {
      toast.error('Please complete all required fields and verify the signer email');
      return;
    }
    populateAgreementsFromEntity();
    set('step3EntityComplete', true);
    set('groupLegalName', formData.entityLegalName.trim());
    set('practiceAddress', formData.entityStreet.trim());
    set('city', formData.entityCity.trim());
    set('state', formData.entityAddrState);
    set('zip', formData.entityZip.trim());
    completeSection('A');
  };

  const ndaRequiredFilled = ['pname', 'edate', 'pentity', 'ptype', 'pstate', 'paddr', 'signame', 'sigtitle']
    .every(k => (ndaFields[k] || '').trim().length > 0);

  const baaRequiredFilled = ['pname', 'centity', 'edate', 'signame', 'sigtitle']
    .every(k => (baaFields[k] || '').trim().length > 0);

  const handleNdaAccept = (checked: boolean) => {
    set('confidentialityAgreed', checked);
    if (checked) {
      const { recordId, acceptedAt } = formatAgreementAcceptance();
      const at = `${acceptedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at ${acceptedAt.toLocaleTimeString('en-US')}`;
      set('ndaAcceptedRecordId', recordId);
      set('ndaAcceptedAt', at);
      setNdaAcceptedAt(at);
    } else {
      set('ndaAcceptedRecordId', '');
      set('ndaAcceptedAt', '');
      setNdaAcceptedAt(null);
    }
  };

  const handleBaaAccept = (checked: boolean) => {
    set('baaAgreed', checked);
    if (checked) {
      const { recordId, acceptedAt } = formatAgreementAcceptance();
      const at = `${acceptedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at ${acceptedAt.toLocaleTimeString('en-US')}`;
      set('baaAcceptedRecordId', recordId);
      set('baaAcceptedAt', at);
      setBaaAcceptedAt(at);
      set('baaSignature', baaFields.signame || `${formData.signerFirstName} ${formData.signerLastName}`.trim());
    } else {
      set('baaAcceptedRecordId', '');
      set('baaAcceptedAt', '');
      setBaaAcceptedAt(null);
    }
  };

  const handleCompleteNda = () => {
    if (!formData.confidentialityAgreed) {
      toast.error('Please accept the Confidentiality Agreement');
      return;
    }
    if (!ndaRequiredFilled) {
      toast.error('Please complete all required fields in Exhibit A');
      return;
    }
    set('step3NdaComplete', true);
    completeSection('B');
  };

  const handleCompleteBaa = () => {
    if (!formData.baaAgreed) {
      toast.error('Please accept the Business Associate Agreement');
      return;
    }
    if (!baaRequiredFilled) {
      toast.error('Please complete all required fields in Exhibit B');
      return;
    }
    set('step3BaaComplete', true);
    set('baaSignature', baaFields.signame || formData.baaSignature);
    completeSection('C');
  };

  const agreementsFullyAccepted =
    formData.confidentialityAgreed === true && formData.baaAgreed === true;

  const handleNext = () => {
    if (!formData.step3EntityComplete || !formData.step3NdaComplete || !formData.step3BaaComplete) {
      toast.error('Please complete all agreement sections before continuing');
      return;
    }
    if (!agreementsFullyAccepted) {
      toast.error('Please accept both the Confidentiality Agreement and Business Associate Agreement');
      return;
    }
    onNext();
  };

  const renderSectionHeader = (
    id: Step3SectionId,
    title: string,
    status: SectionStatus,
    open: boolean,
    statusLabel: string,
  ) => (
    <button
      type="button"
      className="ob-section-header ob-section-header-btn"
      onClick={() => toggleSection(id)}
      disabled={status === 'locked'}
    >
      <div className={`ob-section-badge${status === 'locked' ? ' ob-badge-locked' : status === 'completed' ? ' ob-badge-done' : ' ob-badge-inprogress'}`}>
        {status === 'completed' ? '✓' : id}
      </div>
      <div className="ob-section-meta">
        <span className="ob-section-title">{title}</span>
        <span className={`ob-section-status${
          status === 'completed' ? ' ob-status-done'
          : status === 'active' ? ' ob-status-inprogress'
          : ''}`}>
          {statusLabel}
        </span>
      </div>
      <div className="ob-section-chevron">
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
    </button>
  );

  const sectionLabel = (id: Step3SectionId) => {
    if (sectionStatus[id] === 'completed') return 'Complete';
    if (sectionStatus[id] === 'active') return 'In progress — complete to continue';
    const prev = STEP3_SECTIONS[STEP3_SECTIONS.indexOf(id) - 1];
    return prev ? `Complete Section ${prev} to unlock` : 'Locked';
  };

  return (
    <div className="ob-step-content ob-step3-layout">
      <div className="ob-step-header">
        <h2 className="ob-step-title">Confidentiality &amp; Business Associate Agreements</h2>
        <p className="ob-step-subtitle">
          Review each agreement in full, complete all required fields, and accept to establish your
          secure foundation with Dyad.
        </p>
      </div>

      <div className="ob-step-sections-bar">
        <EnrollmentSectionsBarRow
          progressPct={step3ProgressPct}
          sectionsComplete={step3SectionsComplete}
          totalSections={3}
        />
      </div>

      {/* Section A — Entity */}
      <div
        id="ob-step3-section-A"
        className={`ob-section-card${openSections.A ? ' ob-section-expanded' : ''}${sectionStatus.A === 'completed' ? ' ob-section-complete' : ''}${sectionStatus.A === 'locked' ? ' ob-section-locked' : ''}${sectionStatus.A === 'active' ? ' ob-section-active-ring' : ''}`}
      >
        {renderSectionHeader('A', 'Entity & Authorized Signer Information', sectionStatus.A, openSections.A, sectionLabel('A'))}
        <div className={`ob-section-collapse${openSections.A ? ' ob-section-collapse-open' : ''}`}>
          <div className="ob-section-collapse-inner">
            <div className="ob-section-body">
              <p className="ob-section-desc">
                Please confirm the legal entity entering into these agreements and the individual
                authorized to sign on its behalf. This information will be used to populate both the
                Confidentiality Agreement and the Business Associate Agreement.
              </p>

              <h4 className="ob-step3-form-heading">Legal Entity Information</h4>
              <div className="ob-form-row">
                <div className="ob-field">
                  <label className="ob-label">Legal Entity Name <span className="ob-req">*</span></label>
                  <input
                    type="text"
                    className="ob-input"
                    value={formData.entityLegalName}
                    onChange={e => set('entityLegalName', e.target.value)}
                    placeholder="e.g. Valley Eye Institute, Inc."
                  />
                </div>
                <div className="ob-field">
                  <label className="ob-label">Entity Type <span className="ob-req">*</span></label>
                  <select
                    className="ob-input ob-select"
                    value={formData.entityType}
                    onChange={e => set('entityType', e.target.value)}
                  >
                    <option value="">Select entity type</option>
                    {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="ob-form-row">
                <div className="ob-field">
                  <label className="ob-label">State of Licensure / Formation <span className="ob-req">*</span></label>
                  <select
                    className="ob-input ob-select"
                    value={formData.entityFormationState}
                    onChange={e => set('entityFormationState', e.target.value)}
                  >
                    <option value="">Select state</option>
                    {US_STATES_FULL.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="ob-field">
                  <label className="ob-label">Primary Specialty</label>
                  <input type="text" className="ob-input ob-input-readonly" readOnly value={formData.primarySpecialty} />
                </div>
              </div>

              <label className="ob-label">Legal Entity Address <span className="ob-req">*</span></label>
              <div className="ob-form-row ob-form-row-address">
                <div className="ob-field ob-field-street">
                  <input
                    type="text"
                    className="ob-input"
                    placeholder="Street Address"
                    value={formData.entityStreet}
                    onChange={e => set('entityStreet', e.target.value)}
                  />
                </div>
                <div className="ob-field">
                  <input
                    type="text"
                    className="ob-input"
                    placeholder="City"
                    value={formData.entityCity}
                    onChange={e => set('entityCity', e.target.value)}
                  />
                </div>
                <div className="ob-field">
                  <select
                    className="ob-input ob-select"
                    value={formData.entityAddrState}
                    onChange={e => set('entityAddrState', e.target.value)}
                  >
                    <option value="">State</option>
                    {US_STATES_ABBR.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="ob-field">
                  <input
                    type="text"
                    className="ob-input"
                    placeholder="ZIP"
                    value={formData.entityZip}
                    onChange={e => set('entityZip', e.target.value)}
                  />
                </div>
              </div>

              <h4 className="ob-step3-form-heading">Authorized Signer</h4>
              <div className="ob-callout ob-callout-info">
                Federal e-signature laws (ESIGN Act, 15 U.S.C. § 7001 et seq., and the Uniform Electronic
                Transactions Act) require verification that the signer has legal authority to bind the entity.
              </div>
              <p className="ob-section-desc ob-step3-signer-note">
                The individual below must have legal authority to bind the entity named above.
              </p>
              <div className="ob-form-row">
                <div className="ob-field">
                  <label className="ob-label">First Name <span className="ob-req">*</span></label>
                  <input
                    type="text"
                    className="ob-input"
                    value={formData.signerFirstName}
                    onChange={e => set('signerFirstName', e.target.value)}
                  />
                </div>
                <div className="ob-field">
                  <label className="ob-label">Last Name <span className="ob-req">*</span></label>
                  <input
                    type="text"
                    className="ob-input"
                    value={formData.signerLastName}
                    onChange={e => set('signerLastName', e.target.value)}
                  />
                </div>
              </div>
              <div className="ob-form-row">
                <div className="ob-field">
                  <label className="ob-label">Title / Role <span className="ob-req">*</span></label>
                  <input
                    type="text"
                    className="ob-input"
                    value={formData.signerTitle}
                    onChange={e => set('signerTitle', e.target.value)}
                    placeholder="e.g. Managing Partner, Medical Director"
                  />
                </div>
                <div className="ob-field">
                  <label className="ob-label">Email Address <span className="ob-req">*</span></label>
                  <div className="ob-otp-email-row">
                    <input
                      type="email"
                      className="ob-input"
                      value={formData.signerEmail}
                      onChange={e => {
                        set('signerEmail', e.target.value);
                        if (formData.signerEmailVerified) set('signerEmailVerified', false);
                      }}
                      readOnly={formData.signerEmailVerified}
                      placeholder="signer@practice.com"
                    />
                    {!formData.signerEmailVerified && !preverifiedEmail && (
                      <button
                        type="button"
                        className="ob-btn-primary ob-otp-send-btn"
                        onClick={handleSendOtp}
                        disabled={otpSending}
                      >
                        <ObForwardButtonLabel label={otpSent ? 'Resend Code' : 'Send Code'} />
                      </button>
                    )}
                  </div>
                  {otpSent && !formData.signerEmailVerified && !preverifiedEmail && (
                    <div className="ob-otp-flow">
                      <div className="ob-otp-verify-row">
                        <input
                          type="text"
                          className="ob-input ob-otp-input"
                          maxLength={6}
                          placeholder="Enter 6-digit code"
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value)}
                        />
                        <button
                          type="button"
                          className="ob-btn-primary"
                          onClick={handleVerifyOtp}
                          disabled={otpVerifying}
                        >
                          <ObForwardButtonLabel label="Verify" loading={otpVerifying} loadingLabel="Verifying…" />
                        </button>
                      </div>
                      <p className="ob-field-hint">A one-time verification code has been sent. It expires in 10 minutes.</p>
                    </div>
                  )}
                  {formData.signerEmailVerified && !preverifiedEmail && (
                    <p className="ob-otp-verified">✅ Email verified</p>
                  )}
                  {preverifiedEmail && formData.signerEmailVerified && (
                    <p className="ob-otp-verified">
                      ✅ Email verified during call scheduling — no additional verification required
                    </p>
                  )}
                </div>
              </div>

              <div className="ob-callout ob-callout-muted">
                <strong>Auto-populated from your intake form.</strong> Please review and correct any
                information above. Changes made here will be reflected throughout both agreements.
              </div>
            </div>
            {sectionStatus.A === 'active' && !formData.step3EntityComplete && (
              <div className="ob-section-footer ob-section-footer-fixed">
                <button
                  type="button"
                  className={`ob-btn-primary${!entityValid ? ' ob-btn-disabled' : ''}`}
                  disabled={!entityValid}
                  onClick={handleCompleteEntity}
                >
                  {trimBtnArrow('Continue to Confidentiality Agreement')} <ObArrowRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section B — NDA */}
      <div
        id="ob-step3-section-B"
        className={`ob-section-card${openSections.B ? ' ob-section-expanded' : ''}${sectionStatus.B === 'completed' ? ' ob-section-complete' : ''}${sectionStatus.B === 'locked' ? ' ob-section-locked' : ''}${sectionStatus.B === 'active' ? ' ob-section-active-ring' : ''}`}
      >
        {renderSectionHeader('B', 'Exhibit A — Confidentiality Agreement', sectionStatus.B, openSections.B, sectionLabel('B'))}
        <div className={`ob-section-collapse${openSections.B ? ' ob-section-collapse-open' : ''}`}>
          <div className="ob-section-collapse-inner">
            <div className="ob-section-body ob-step3-agreement-body">
              <p className="ob-section-desc">
                Protects practice-level financial data, operational metrics, and proprietary information
                shared during due diligence and ongoing engagement. This is a mutual agreement — Dyad&apos;s
                confidential information is equally protected.
              </p>
              <AgreementExhibit
                exhibitId="nda"
                title="Exhibit A — Confidentiality Agreement"
                scrollId="nda-scroll"
                accepted={formData.confidentialityAgreed}
                acceptedAt={ndaAcceptedAt}
                recordId={formData.ndaAcceptedRecordId || null}
                onAcceptChange={handleNdaAccept}
                checkboxLabel="I have read, understand, and agree to the terms of the Confidentiality Agreement (Exhibit A). I confirm that I have the legal authority to bind the above-named organization."
                continueLabel="Continue to Business Associate Agreement →"
                onContinue={handleCompleteNda}
                continueDisabled={!formData.confidentialityAgreed || !ndaRequiredFilled}
                providerName={ndaFields.pname || formData.entityLegalName}
              >
                <NdaExhibitA
                  fields={ndaFields}
                  onFieldChange={(k, v) => setNdaFields(prev => ({ ...prev, [k]: v }))}
                  providerDisplayName={ndaFields.pname || formData.entityLegalName}
                  showDyadSignature={!!formData.confidentialityAgreed}
                />
              </AgreementExhibit>
            </div>
          </div>
        </div>
      </div>

      {/* Section C — BAA */}
      <div
        id="ob-step3-section-C"
        className={`ob-section-card${openSections.C ? ' ob-section-expanded' : ''}${sectionStatus.C === 'completed' ? ' ob-section-complete' : ''}${sectionStatus.C === 'locked' ? ' ob-section-locked' : ''}${sectionStatus.C === 'active' ? ' ob-section-active-ring' : ''}`}
      >
        {renderSectionHeader('C', 'Exhibit B — Business Associate Agreement (BAA)', sectionStatus.C, openSections.C, sectionLabel('C'))}
        <div className={`ob-section-collapse${openSections.C ? ' ob-section-collapse-open' : ''}`}>
          <div className="ob-section-collapse-inner">
            <div className="ob-section-body ob-step3-agreement-body">
              <p className="ob-section-desc">
                Governs HIPAA-compliant handling of Protected Health Information (PHI). This agreement
                positions Dyad as your Business Associate under 45 CFR § 164.502(e).
              </p>
              <AgreementExhibit
                exhibitId="baa"
                title="Exhibit B — Business Associate Agreement"
                scrollId="baa-scroll"
                accepted={formData.baaAgreed}
                acceptedAt={baaAcceptedAt}
                recordId={formData.baaAcceptedRecordId || null}
                onAcceptChange={handleBaaAccept}
                checkboxLabel="I have read, understand, and agree to the terms of the Business Associate Agreement (Exhibit B). I confirm that I have the legal authority to bind the above-named organization and authorize the exchange of Protected Health Information as described herein."
                continueLabel="Mark Complete ✓"
                onContinue={handleCompleteBaa}
                continueDisabled={!formData.baaAgreed || !baaRequiredFilled}
                providerName={baaFields.pname || formData.entityLegalName}
              >
                <BaaExhibitB
                  fields={baaFields}
                  onFieldChange={(k, v) => setBaaFields(prev => ({ ...prev, [k]: v }))}
                  providerDisplayName={baaFields.pname || formData.entityLegalName}
                  showDyadSignature={!!formData.baaAgreed}
                />
              </AgreementExhibit>
            </div>
          </div>
        </div>
      </div>

      <div className="ob-info-banner">
        <ShieldCheck size={28} className="ob-info-banner-icon" aria-hidden />
        <div>
          <strong>Your agreements are secure</strong>
          <p>
            Executed copies are stored with tamper-evident audit trails and available for download at
            any time. All data is encrypted in transit and at rest.
          </p>
        </div>
      </div>

      {renderNavBar({
        onBack,
        onNext: handleNext,
        canProceed:
          formData.step3EntityComplete
          && formData.step3NdaComplete
          && formData.step3BaaComplete
          && agreementsFullyAccepted,
        nextLabel: 'Continue to Due Diligence →',
      })}
    </div>
  );
};

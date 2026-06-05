import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  DollarSign,
  FileText,
  Pencil,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { OnboardingData } from '../../../pages/DyadOnboarding';
import { EnrollmentSaveNotice } from '../EnrollmentSaveNotice';
import { ObArrowRight, ObBackButtonLabel, ObForwardButtonLabel } from '../ObBtnArrow';
import { DocumentUploadRow } from './DocumentUploadRow';
import { EnrollmentSectionsBarRow } from '../EnrollmentSectionsBarRow';
import {
  DUE_DILIGENCE_DOCS,
  FACILITY_OWNERSHIP_OPTIONS,
  emptyDueDiligenceDocuments,
  type DueDiligenceDocId,
  type DueDiligenceDocMeta,
} from './dueDiligenceConstants';

type Step4SectionId = 'provider' | 'financial' | 'docs';

const STEP4_SECTIONS: Step4SectionId[] = ['provider', 'financial', 'docs'];

export interface StepDueDiligenceProps {
  formData: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  practiceTypeTitle: string;
  onChangePracticeType: () => void;
}

const fmtNumber = (raw: string) => {
  const v = raw.replace(/[^\d]/g, '');
  return v ? parseInt(v, 10).toLocaleString() : '';
};

const fmtCurrency = (raw: string) => {
  const v = raw.replace(/[^\d]/g, '');
  return v ? `$${parseInt(v, 10).toLocaleString()}` : '';
};

const AttestationBlock: React.FC<{
  title: string;
  sub: string;
  error?: string;
  onConfirm: () => void;
  disabled?: boolean;
}> = ({ title, sub, error, onConfirm, disabled }) => (
  <div className="ob-dd-attest-wrap">
    {error && <div className="ob-dd-attest-error ob-dd-attest-error-visible">{error}</div>}
    <div className="ob-dd-attest-box">
      <div className="ob-dd-attest-icon" aria-hidden>
        <ShieldCheck size={22} color="#0a2d6e" />
      </div>
      <div className="ob-dd-attest-text">
        <div className="ob-dd-attest-title">{title}</div>
        <div className="ob-dd-attest-sub">{sub}</div>
      </div>
      <div className="ob-dd-attest-divider" aria-hidden />
      <button
        type="button"
        className="ob-dd-attest-btn"
        disabled={disabled}
        onClick={onConfirm}
      >
        Confirm &amp; Continue
        <ObArrowRight />
      </button>
    </div>
  </div>
);

export const StepDueDiligence: React.FC<StepDueDiligenceProps> = ({
  formData,
  set,
  onNext,
  onBack,
  isSubmitting,
  practiceTypeTitle,
  onChangePracticeType,
}) => {
  const isFacility = formData.confirmedPracticeType === 'asc' || formData.practiceType === 'asc';

  const [providerEditing, setProviderEditing] = useState(false);
  const [providerCollapsed, setProviderCollapsed] = useState(formData.step4ProviderConfirmed);
  const [financialCollapsed, setFinancialCollapsed] = useState(formData.step4FinancialConfirmed);
  const [docsCollapsed, setDocsCollapsed] = useState(formData.step4DocsConfirmed);
  const [openSections, setOpenSections] = useState({
    provider: !formData.step4ProviderConfirmed,
    financial: formData.step4ProviderConfirmed && !formData.step4FinancialConfirmed,
    docs: formData.step4FinancialConfirmed && !formData.step4DocsConfirmed,
  });
  const [provAttestError, setProvAttestError] = useState('');
  const [finAttestError, setFinAttestError] = useState('');

  const documents = useMemo(
    () => ({ ...emptyDueDiligenceDocuments(), ...formData.ddDocuments }),
    [formData.ddDocuments],
  );

  const primaryContact = useMemo(() => {
    const name = `${formData.signerFirstName || formData.firstName} ${formData.signerLastName || formData.lastName}`.trim();
    const title = formData.signerTitle || formData.titleRole;
    if (name && title) return `${name}, ${title}`;
    if (name) return name;
    return title || '';
  }, [formData]);

  const mainAddress = useMemo(() => {
    if (formData.entityStreet) {
      return `${formData.entityStreet}, ${formData.entityCity}, ${formData.entityAddrState || formData.state} ${formData.entityZip || formData.zip}`.replace(/,\s*,/g, ',').trim();
    }
    if (formData.practiceAddress) {
      return `${formData.practiceAddress}, ${formData.city}, ${formData.state} ${formData.zip}`.trim();
    }
    return '';
  }, [formData]);

  const providerDisplayName = formData.organizationName || formData.entityLegalName || formData.groupLegalName;
  const legalEntityName = formData.entityLegalName || formData.groupLegalName;

  const payerTotal = useMemo(() => {
    const c = parseInt(formData.ddPayerCommercial, 10) || 0;
    const m = parseInt(formData.ddPayerMedicare, 10) || 0;
    const p = parseInt(formData.ddPayerPI, 10) || 0;
    const s = parseInt(formData.ddPayerCash, 10) || 0;
    return c + m + p + s;
  }, [formData.ddPayerCommercial, formData.ddPayerMedicare, formData.ddPayerPI, formData.ddPayerCash]);

  const gapsException = (formData.reportAvailabilityNotes || '').trim().length > 10;
  const allDocsUploaded = DUE_DILIGENCE_DOCS.every(d => documents[d.id]);

  const step4SectionsComplete =
    (formData.step4ProviderConfirmed ? 1 : 0)
    + (formData.step4FinancialConfirmed ? 1 : 0)
    + (formData.step4DocsConfirmed ? 1 : 0);
  const step4ProgressPct = Math.round((step4SectionsComplete / 3) * 100);

  const setDoc = (docId: DueDiligenceDocId, meta: DueDiligenceDocMeta | null) => {
    set('ddDocuments', { ...documents, [docId]: meta });
  };

  const validateProvider = () => {
    const missing: string[] = [];
    if (!formData.taxId.trim()) missing.push('Legal Entity Tax ID (TIN)');
    if (!formData.website.trim()) missing.push('Website');
    if (!isFacility) {
      if (!formData.ddMidLevelProviders) missing.push('Mid-Level Providers');
      if (!formData.ddAllProvidersCredentialed) missing.push('All Providers Credentialed');
    } else {
      if (!formData.ddFacilityId.trim()) missing.push('Facility ID');
      if (!formData.ddOperatingRooms.trim()) missing.push('Operating / Procedure Rooms');
      if (!formData.ddCredentialedProviders.trim()) missing.push('Credentialed Providers');
      if (!formData.ddSpecialtiesPerformed.trim()) missing.push('Specialties Performed');
      if (!formData.ddFacilityOwnership) missing.push('Facility Ownership');
    }
    return missing;
  };

  const confirmProvider = () => {
    const missing = validateProvider();
    if (missing.length) {
      setProvAttestError(`Please complete the required fields: ${missing.join(', ')}.`);
      return;
    }
    setProvAttestError('');
    set('step4ProviderConfirmed', true);
    setProviderEditing(false);
    setProviderCollapsed(true);
    setOpenSections({ provider: false, financial: true, docs: false });
    setTimeout(() => document.getElementById('ob-step4-financial')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
  };

  const confirmFinancial = () => {
    const missing: string[] = [];
    if (!formData.annualCaseVolume.trim()) missing.push('Annual Case Volume');
    if (!formData.annualGrossCollections.trim()) missing.push('Annual Gross Collections');
    if (!formData.inNetworkPayerContracts.trim()) missing.push('In-Network Payer Contracts');
    if (missing.length || payerTotal !== 100) {
      setFinAttestError(
        missing.length
          ? `Please complete: ${missing.join(', ')}.`
          : 'Payer mix must total exactly 100% before confirming this section.',
      );
      return;
    }
    setFinAttestError('');
    set('step4FinancialConfirmed', true);
    setFinancialCollapsed(true);
    setOpenSections({ provider: false, financial: false, docs: true });
    setTimeout(() => document.getElementById('ob-step4-docs')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
  };

  const confirmDocs = () => {
    if (!allDocsUploaded && !gapsException) {
      toast.error('Upload all required reports or add notes describing availability gaps (10+ characters)');
      return;
    }
    set('step4DocsConfirmed', true);
    setDocsCollapsed(true);
    setOpenSections({ provider: false, financial: false, docs: false });
  };

  const canSubmit =
    formData.step4ProviderConfirmed
    && formData.step4FinancialConfirmed
    && formData.step4DocsConfirmed;

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error('Please confirm all three sections before submitting');
      return;
    }
    onNext();
  };

  const toggleSection = (id: Step4SectionId) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
    if (id === 'provider' && providerCollapsed) setProviderCollapsed(false);
    if (id === 'financial' && financialCollapsed) setFinancialCollapsed(false);
    if (id === 'docs' && docsCollapsed) setDocsCollapsed(false);
  };

  const step4SectionStatus = (id: Step4SectionId): 'completed' | 'active' | 'locked' => {
    if (id === 'provider') {
      if (formData.step4ProviderConfirmed) return 'completed';
      return 'active';
    }
    if (id === 'financial') {
      if (formData.step4FinancialConfirmed) return 'completed';
      if (!formData.step4ProviderConfirmed) return 'locked';
      return 'active';
    }
    if (formData.step4DocsConfirmed) return 'completed';
    if (!formData.step4FinancialConfirmed) return 'locked';
    return 'active';
  };

  const renderCardHeader = (
    sectionId: Step4SectionId,
    title: string,
    badge: React.ReactNode,
    extra?: React.ReactNode,
  ) => (
    <div className="ob-dd-card-hdr">
      <button
        type="button"
        className="ob-dd-card-hdr-main"
        onClick={() => toggleSection(sectionId)}
      >
        <span className="ob-dd-card-title">{title}</span>
        {badge}
        <span className="ob-section-chevron">
          {openSections[sectionId] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {extra}
    </div>
  );

  return (
    <div className="ob-step-content ob-step4-layout">
      <div className="ob-step-header">
        <h2 className="ob-step-title">Initial Due Diligence &amp; Discovery</h2>
        <p className="ob-step-subtitle">
          Please verify the information below and complete the remaining fields.
        </p>
      </div>

      <div className="ob-step-sections-bar">
        <EnrollmentSectionsBarRow
          progressPct={step4ProgressPct}
          sectionsComplete={step4SectionsComplete}
          totalSections={3}
        />
      </div>

      {/* Practice type banner */}
      <div className="ob-dd-practice-banner">
        <div className="ob-dd-practice-icon" aria-hidden>
          <ShieldCheck size={22} color="#0a2d6e" />
        </div>
        <div className="ob-dd-practice-main">
          <div className="ob-dd-practice-meta">
            <span className="ob-dd-practice-label">Practice Type</span>
            <span className="ob-dd-practice-sep" />
            <span className="ob-dd-practice-confirmed">
              <CheckCircle2Icon /> Confirmed
            </span>
          </div>
          <div className="ob-dd-practice-value">{practiceTypeTitle}</div>
        </div>
        <p className="ob-dd-practice-change">
          The fields below are tailored to your practice type.
          <button type="button" className="ob-dd-practice-change-link" onClick={onChangePracticeType}>
            Change practice type →
          </button>
        </p>
      </div>

      {/* Provider Information */}
      <div
        id="ob-step4-provider"
        className={`ob-dd-card${providerCollapsed ? ' ob-dd-card-collapsed' : ''}${openSections.provider ? ' ob-dd-card-open' : ''}`}
      >
        {renderCardHeader(
          'provider',
          'Provider Information',
          formData.step4ProviderConfirmed ? (
            <span className="ob-dd-badge-confirmed">✓ Confirmed</span>
          ) : (
            <span className="ob-dd-badge-required">Required</span>
          ),
          <div className="ob-dd-card-actions">
            {!providerCollapsed && (
              <>
                <button
                  type="button"
                  className={`ob-dd-edit-btn${providerEditing ? ' ob-dd-edit-btn-active' : ''}`}
                  onClick={() => setProviderEditing(e => !e)}
                >
                  {providerEditing ? <><X size={12} /> Cancel</> : <><Pencil size={12} /> Edit</>}
                </button>
                {providerEditing && (
                  <button
                    type="button"
                    className="ob-dd-save-btn"
                    onClick={() => setProviderEditing(false)}
                  >
                    <ObForwardButtonLabel label="Save" />
                  </button>
                )}
              </>
            )}
            {providerCollapsed && (
              <button type="button" className="ob-dd-expand-btn" onClick={() => { setProviderCollapsed(false); setOpenSections(s => ({ ...s, provider: true })); }}>
                Expand
              </button>
            )}
          </div>,
        )}
        {openSections.provider && !providerCollapsed && (
          <div className="ob-dd-card-body">
            <div className="ob-form-row">
              <div className="ob-field">
                <label className="ob-label">Provider Name <span className="ob-confirmed-tag">✓ confirmed</span></label>
                <input type="text" className="ob-input ob-input-confirmed" readOnly value={providerDisplayName} />
              </div>
              <div className="ob-field">
                <label className="ob-label">Legal Entity Name <span className="ob-confirmed-tag">✓ confirmed</span></label>
                <input type="text" className="ob-input ob-input-confirmed" readOnly value={legalEntityName} />
              </div>
            </div>
            <div className="ob-form-row">
              <div className="ob-field">
                <label className="ob-label">Legal Entity Tax ID (TIN) <span className="ob-req">*</span></label>
                <input
                  type="text"
                  className="ob-input"
                  placeholder="Enter Tax ID"
                  value={formData.taxId}
                  onChange={e => set('taxId', e.target.value)}
                />
              </div>
              <div className="ob-field">
                <label className="ob-label">Primary Contact <span className="ob-confirmed-tag">✓ confirmed</span></label>
                <input type="text" className="ob-input ob-input-confirmed" readOnly value={primaryContact} />
              </div>
            </div>
            <div className="ob-form-row">
              <div className="ob-field">
                <label className="ob-label">Email <span className="ob-confirmed-tag">✓ confirmed</span></label>
                <input type="email" className="ob-input ob-input-confirmed" readOnly value={formData.signerEmail || formData.contactEmail} />
              </div>
              <div className="ob-field">
                <label className="ob-label">Phone <span className="ob-confirmed-tag">✓ confirmed</span></label>
                <input type="tel" className="ob-input ob-input-confirmed" readOnly value={formData.contactPhone} />
              </div>
            </div>
            <div className="ob-form-row">
              <div className="ob-field">
                <label className="ob-label">Main Address <span className="ob-confirmed-tag">✓ confirmed</span></label>
                <input type="text" className="ob-input ob-input-confirmed" readOnly value={mainAddress} />
              </div>
              <div className="ob-field">
                <label className="ob-label">Website <span className="ob-req">*</span></label>
                <input
                  type="text"
                  className="ob-input"
                  placeholder="Enter practice website"
                  value={formData.website}
                  onChange={e => set('website', e.target.value)}
                />
              </div>
            </div>

            {!isFacility ? (
              <>
                <h4 className="ob-dd-divider">Practice Details</h4>
                <div className="ob-form-row">
                  <div className="ob-field">
                    <label className="ob-label">Number of Billable Providers <span className="ob-confirmed-tag">✓ confirmed</span></label>
                    <input type="text" className="ob-input ob-input-confirmed" readOnly value={formData.billableProviders} />
                  </div>
                  <div className="ob-field">
                    <label className="ob-label">Provider Specialties <span className="ob-confirmed-tag">✓ confirmed</span></label>
                    <input type="text" className="ob-input ob-input-confirmed" readOnly value={formData.primarySpecialty} />
                  </div>
                </div>
                <div className="ob-form-row">
                  <div className="ob-field">
                    <label className="ob-label">Mid-Level Providers? <span className="ob-req">*</span></label>
                    <select
                      className="ob-input ob-select"
                      value={formData.ddMidLevelProviders}
                      onChange={e => set('ddMidLevelProviders', e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="ob-field">
                    <label className="ob-label">All Providers Credentialed? <span className="ob-req">*</span></label>
                    <select
                      className="ob-input ob-select"
                      value={formData.ddAllProvidersCredentialed}
                      onChange={e => set('ddAllProvidersCredentialed', e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Most">Most</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h4 className="ob-dd-divider">Facility Details</h4>
                <div className="ob-form-row">
                  <div className="ob-field">
                    <label className="ob-label">Facility ID <span className="ob-req">*</span></label>
                    <input
                      type="text"
                      className="ob-input"
                      placeholder="Facility ID"
                      value={formData.ddFacilityId}
                      onChange={e => set('ddFacilityId', e.target.value)}
                    />
                  </div>
                  <div className="ob-field">
                    <label className="ob-label">Facility TIN</label>
                    <input
                      type="text"
                      className="ob-input"
                      placeholder="If different from entity TIN"
                      value={formData.ddFacilityTin}
                      onChange={e => set('ddFacilityTin', e.target.value)}
                    />
                  </div>
                </div>
                <div className="ob-form-row">
                  <div className="ob-field">
                    <label className="ob-label">Operating / Procedure Rooms <span className="ob-req">*</span></label>
                    <input
                      type="number"
                      className="ob-input"
                      placeholder="Number of rooms"
                      value={formData.ddOperatingRooms}
                      onChange={e => set('ddOperatingRooms', e.target.value)}
                    />
                  </div>
                  <div className="ob-field">
                    <label className="ob-label">Credentialed Providers <span className="ob-req">*</span></label>
                    <input
                      type="number"
                      className="ob-input"
                      placeholder="Providers at facility"
                      value={formData.ddCredentialedProviders}
                      onChange={e => set('ddCredentialedProviders', e.target.value)}
                    />
                  </div>
                </div>
                <div className="ob-form-row">
                  <div className="ob-field">
                    <label className="ob-label">Specialties Performed <span className="ob-req">*</span></label>
                    <input
                      type="text"
                      className="ob-input"
                      placeholder="e.g. Orthopedics, GI, Ophthalmology"
                      value={formData.ddSpecialtiesPerformed}
                      onChange={e => set('ddSpecialtiesPerformed', e.target.value)}
                    />
                  </div>
                  <div className="ob-field">
                    <label className="ob-label">Facility Ownership <span className="ob-req">*</span></label>
                    <select
                      className="ob-input ob-select"
                      value={formData.ddFacilityOwnership}
                      onChange={e => set('ddFacilityOwnership', e.target.value)}
                    >
                      <option value="">Select</option>
                      {FACILITY_OWNERSHIP_OPTIONS.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {!formData.step4ProviderConfirmed && (
              <AttestationBlock
                title="Confirm Section Review"
                sub="By confirming, you attest that the provider information above has been reviewed and is accurate."
                error={provAttestError}
                onConfirm={confirmProvider}
              />
            )}
          </div>
        )}
      </div>

      {/* Financial Metrics */}
      <div
        id="ob-step4-financial"
        className={`ob-dd-card${financialCollapsed ? ' ob-dd-card-collapsed' : ''}${openSections.financial ? ' ob-dd-card-open' : ''}`}
      >
        {renderCardHeader(
          'financial',
          'Key Financial Metrics',
          formData.step4FinancialConfirmed ? (
            <span className="ob-dd-badge-confirmed">✓ Confirmed</span>
          ) : (
            <span className="ob-dd-badge-required">Required</span>
          ),
          financialCollapsed ? (
            <button type="button" className="ob-dd-expand-btn" onClick={() => { setFinancialCollapsed(false); setOpenSections(s => ({ ...s, financial: true })); }}>
              Expand
            </button>
          ) : null,
        )}
        {openSections.financial && !financialCollapsed && (
          <div className="ob-dd-card-body">
            <div className="ob-callout ob-callout-info">
              <strong>Why this matters:</strong> These metrics allow Dyad to benchmark your practice against
              specialty-specific performance standards and identify areas of opportunity before our first
              working session together.
            </div>
            <div className="ob-dd-metric-row">
              <div className="ob-dd-metric-card">
                <div className="ob-dd-metric-icon"><BarChart3 size={22} color="#0a2d6e" /></div>
                <div className="ob-dd-metric-label">Annual Case Volume</div>
                <input
                  type="text"
                  className="ob-dd-metric-input"
                  placeholder="e.g. 5,200"
                  value={formData.annualCaseVolume}
                  onChange={e => set('annualCaseVolume', fmtNumber(e.target.value))}
                />
                <div className="ob-dd-metric-unit">Cases / encounters per year</div>
              </div>
              <div className="ob-dd-metric-card">
                <div className="ob-dd-metric-icon"><DollarSign size={22} color="#0a2d6e" /></div>
                <div className="ob-dd-metric-label">Annual Gross Collections</div>
                <input
                  type="text"
                  className="ob-dd-metric-input"
                  placeholder="e.g. $2,400,000"
                  value={formData.annualGrossCollections}
                  onChange={e => set('annualGrossCollections', fmtCurrency(e.target.value))}
                />
                <div className="ob-dd-metric-unit">Last 12 months or annualized</div>
              </div>
              <div className="ob-dd-metric-card">
                <div className="ob-dd-metric-icon"><FileText size={22} color="#0a2d6e" /></div>
                <div className="ob-dd-metric-label">In-Network Payer Contracts</div>
                <input
                  type="text"
                  className="ob-dd-metric-input"
                  placeholder="e.g. 14"
                  value={formData.inNetworkPayerContracts}
                  onChange={e => set('inNetworkPayerContracts', fmtNumber(e.target.value))}
                />
                <div className="ob-dd-metric-unit">Active payer contracts</div>
              </div>
            </div>

            <h4 className="ob-dd-divider">Payer Mix Breakdown</h4>
            <div className="ob-dd-payer-grid">
              <PayerMixItem
                label="Commercial Payers"
                color="#0066CC"
                value={formData.ddPayerCommercial}
                onChange={v => set('ddPayerCommercial', v)}
              />
              <PayerMixItem
                label="Medicare / Medicaid"
                color="#2E7D32"
                value={formData.ddPayerMedicare}
                onChange={v => set('ddPayerMedicare', v)}
              />
              <PayerMixItem
                label="PI / Workers' Comp"
                color="#F57C00"
                value={formData.ddPayerPI}
                onChange={v => set('ddPayerPI', v)}
              />
              <PayerMixItem
                label="Cash / Self-Pay"
                color="#7B1FA2"
                value={formData.ddPayerCash}
                onChange={v => set('ddPayerCash', v)}
              />
            </div>
            <div className={`ob-dd-payer-total${payerTotal === 100 ? ' ob-dd-payer-total-valid' : ' ob-dd-payer-total-invalid'}`}>
              Total: {payerTotal}%
            </div>
            <p className="ob-dd-payer-note">Adjust payer mix percentages so they total 100%.</p>

            {!formData.step4FinancialConfirmed && (
              <AttestationBlock
                title="Confirm Section Review"
                sub="By confirming, you attest that the financial metrics and payer mix above have been reviewed and are accurate."
                error={finAttestError}
                onConfirm={confirmFinancial}
                disabled={!formData.step4ProviderConfirmed}
              />
            )}
          </div>
        )}
      </div>

      {/* Documents */}
      <div
        id="ob-step4-docs"
        className={`ob-dd-card${docsCollapsed ? ' ob-dd-card-collapsed' : ''}${openSections.docs ? ' ob-dd-card-open' : ''}`}
      >
        {renderCardHeader(
          'docs',
          'Required Document Uploads',
          formData.step4DocsConfirmed ? (
            <span className="ob-dd-badge-confirmed">✓ Confirmed</span>
          ) : (
            <span className="ob-dd-badge-required">Required</span>
          ),
          docsCollapsed ? (
            <button type="button" className="ob-dd-expand-btn" onClick={() => { setDocsCollapsed(false); setOpenSections(s => ({ ...s, docs: true })); }}>
              Expand
            </button>
          ) : null,
        )}
        {openSections.docs && !docsCollapsed && (
          <div className="ob-dd-card-body">
            <div className="ob-callout ob-callout-info">
              <strong>Minimum 12-month reporting window.</strong> To prepare an accurate and meaningful service
              proposal, Dyad requires no less than the most recent 12 consecutive months of the following reports.
            </div>

            <table className="ob-dd-doc-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Minimum Period</th>
                  <th>Status / Upload</th>
                </tr>
              </thead>
              <tbody>
                {DUE_DILIGENCE_DOCS.map(doc => (
                  <DocumentUploadRow
                    key={doc.id}
                    docId={doc.id}
                    label={doc.label}
                    period={doc.period}
                    meta={documents[doc.id]}
                    onUpload={setDoc}
                    onRemove={id => setDoc(id, null)}
                  />
                ))}
              </tbody>
            </table>

            <div className="ob-field ob-dd-gaps-field">
              <label className="ob-label">Notes on Report Availability or Gaps</label>
              <textarea
                className="ob-input ob-dd-textarea"
                rows={3}
                placeholder="If any of the reports listed above are unavailable, partially available, or formatted differently than expected, please describe the gaps here."
                value={formData.reportAvailabilityNotes}
                onChange={e => set('reportAvailabilityNotes', e.target.value)}
              />
              {gapsException && (
                <div className="ob-dd-gaps-exception">
                  You may proceed without uploading all reports. Dyad will follow up regarding the gaps noted above.
                </div>
              )}
            </div>

            {!formData.step4DocsConfirmed && (
              <AttestationBlock
                title="Confirm Section Review"
                sub="By confirming, you attest that the documents and reporting notes above accurately reflect what is available for Dyad's review."
                onConfirm={confirmDocs}
                disabled={!formData.step4FinancialConfirmed}
              />
            )}
          </div>
        )}
      </div>

      <div className="ob-info-banner">
        <TrendingUp size={28} className="ob-info-banner-icon" aria-hidden />
        <div>
          <strong>What happens next?</strong>
          <p>
            Dyad&apos;s data analytics team will review the information and documents provided and prepare a
            customized service proposal, typically within 24 business hours. You will be notified by email when
            your proposal is ready for review.
          </p>
        </div>
      </div>

      <div className="ob-step-bottom-zone">
        <EnrollmentSaveNotice />
        <div className="ob-step-nav ob-step4-nav">
          <button type="button" className="ob-btn-secondary" onClick={onBack} disabled={isSubmitting}>
            <ObBackButtonLabel />
          </button>
          <button
            type="button"
            className={`ob-btn-primary${!canSubmit ? ' ob-btn-disabled' : ''}`}
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            <ObForwardButtonLabel label="Submit for Review" loading={isSubmitting} loadingLabel="Submitting…" />
          </button>
        </div>
      </div>
    </div>
  );
};

const CheckCircle2Icon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
    <circle cx="7" cy="7" r="6" stroke="#BDBDBD" strokeWidth="1.2" />
    <path d="M4.5 7L6.5 9L9.5 5.5" stroke="#BDBDBD" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PayerMixItem: React.FC<{
  label: string;
  color: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, color, value, onChange }) => (
  <div className="ob-dd-payer-item">
    <span className="ob-dd-payer-dot" style={{ background: color }} />
    <span className="ob-dd-payer-label">{label}</span>
    <input
      type="number"
      className="ob-dd-payer-input"
      min={0}
      max={100}
      value={value}
      onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 3))}
    />
    <span className="ob-dd-payer-pct">%</span>
  </div>
);

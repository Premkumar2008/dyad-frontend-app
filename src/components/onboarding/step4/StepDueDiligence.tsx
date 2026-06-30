import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
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
  cacheDueDiligenceDocumentFile,
  mergeUploadedDueDiligenceDocuments,
  uploadDueDiligenceDocuments,
} from '../../../services/onboardingDocumentService';
import {
  DUE_DILIGENCE_DOCS,
  FACILITY_OWNERSHIP_OPTIONS,
  emptyDueDiligenceDocuments,
  type DueDiligenceDocId,
  type DueDiligenceDocMeta,
} from './dueDiligenceConstants';

type Step4SectionId = 'provider' | 'financial' | 'docs';
type Step4SectionStatus = 'completed' | 'active' | 'locked';

const STEP4_SECTIONS: Step4SectionId[] = ['provider', 'financial', 'docs'];

const STEP4_SECTION_NUM: Record<Step4SectionId, string> = {
  provider: '1',
  financial: '2',
  docs: '3',
};

export interface StepDueDiligenceProps {
  formData: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  onNext: (overrides?: Partial<OnboardingData>) => Promise<void>;
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
  const [openSections, setOpenSections] = useState<Record<Step4SectionId, boolean>>({
    provider: !formData.step4ProviderConfirmed,
    financial: formData.step4ProviderConfirmed && !formData.step4FinancialConfirmed,
    docs: formData.step4FinancialConfirmed && !formData.step4DocsConfirmed,
  });
  const [provAttestError, setProvAttestError] = useState('');
  const [finAttestError, setFinAttestError] = useState('');
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);

  const documentFilesRef = useRef<Partial<Record<DueDiligenceDocId, File>>>({});
  const [documentFiles, setDocumentFiles] = useState<Partial<Record<DueDiligenceDocId, File>>>({});

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

  useEffect(() => {
    setOpenSections({
      provider: !formData.step4ProviderConfirmed,
      financial: formData.step4ProviderConfirmed && !formData.step4FinancialConfirmed,
      docs: formData.step4FinancialConfirmed && !formData.step4DocsConfirmed,
    });
  }, [formData.step4ProviderConfirmed, formData.step4FinancialConfirmed, formData.step4DocsConfirmed]);

  const setDoc = (docId: DueDiligenceDocId, meta: DueDiligenceDocMeta | null, file?: File) => {
    if (meta && file instanceof File) {
      const localMeta: DueDiligenceDocMeta = {
        fileName: meta.fileName,
        fileSize: meta.fileSize,
        uploadedAt: meta.uploadedAt,
        mimeType: meta.mimeType,
      };
      documentFilesRef.current[docId] = file;
      setDocumentFiles((prev) => ({ ...prev, [docId]: file }));
      if (formData.onboardingId.trim()) {
        cacheDueDiligenceDocumentFile(formData.onboardingId, docId, file);
      }
      cacheDueDiligenceDocumentFile('', docId, file);
      set('ddDocuments', { ...documents, [docId]: localMeta });
      return;
    }

    delete documentFilesRef.current[docId];
    setDocumentFiles((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
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

  const completeSection = (id: Step4SectionId) => {
    const idx = STEP4_SECTIONS.indexOf(id);
    setOpenSections(prev => {
      const next = { ...prev, [id]: false };
      if (idx < STEP4_SECTIONS.length - 1) {
        next[STEP4_SECTIONS[idx + 1]] = true;
      }
      return next;
    });
    setTimeout(() => {
      const nextId = STEP4_SECTIONS[idx + 1];
      if (nextId) {
        document.getElementById(`ob-step4-section-${nextId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 350);
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
    completeSection('provider');
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
    completeSection('financial');
  };

  const confirmDocs = () => {
    if (!allDocsUploaded && !gapsException) {
      toast.error('Upload all required reports or add notes describing availability gaps (10+ characters)');
      return;
    }
    set('step4DocsConfirmed', true);
    completeSection('docs');
  };

  const canSubmit =
    formData.step4ProviderConfirmed
    && formData.step4FinancialConfirmed
    && formData.step4DocsConfirmed;

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error('Please confirm all three sections before submitting');
      return;
    }

    if (!formData.onboardingId.trim()) {
      toast.error('Save onboarding progress first — onboarding ID is required');
      return;
    }

    const files = { ...documentFilesRef.current, ...documentFiles };
    const hasNewFiles = DUE_DILIGENCE_DOCS.some((doc) => {
      const file = files[doc.id];
      return file instanceof File && file.size > 0;
    });
    const missingPersistedDocs = DUE_DILIGENCE_DOCS.filter((doc) => {
      const file = files[doc.id];
      const hasLocalFile = file instanceof File && file.size > 0;
      return documents[doc.id] && !documents[doc.id]?.documentId && !hasLocalFile;
    });

    if (missingPersistedDocs.length > 0 && !gapsException) {
      toast.error('Please re-upload your documents before submitting');
      return;
    }

    if (!hasNewFiles && !gapsException && !allDocsUploaded) {
      toast.error('Upload all required reports or add notes describing availability gaps (10+ characters)');
      return;
    }

    setIsUploadingDocuments(true);
    try {
      if (hasNewFiles) {
        const uploadResult = await uploadDueDiligenceDocuments({
          onboardingId: formData.onboardingId.trim(),
          contactEmail: formData.contactEmail,
          reportAvailabilityNotes: formData.reportAvailabilityNotes,
          files,
        });

        const mergedDocuments = mergeUploadedDueDiligenceDocuments(
          documents,
          uploadResult.documents,
          files,
        );

        documentFilesRef.current = {};
        setDocumentFiles({});
        await onNext({ ddDocuments: mergedDocuments });
        return;
      }

      await onNext();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
    } finally {
      setIsUploadingDocuments(false);
    }
  };

  const isBusy = isSubmitting || isUploadingDocuments;

  const toggleSection = (id: Step4SectionId) => {
    if (step4SectionStatus(id) === 'locked') return;
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const step4SectionStatus = (id: Step4SectionId): Step4SectionStatus => {
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

  const sectionLabel = (id: Step4SectionId) => {
    const status = step4SectionStatus(id);
    if (status === 'completed') return 'Complete';
    if (status === 'active') return 'In progress - complete to continue';
    const prevIdx = STEP4_SECTIONS.indexOf(id) - 1;
    if (prevIdx >= 0) {
      return `Complete Section ${STEP4_SECTION_NUM[STEP4_SECTIONS[prevIdx]]} to unlock`;
    }
    return 'Locked';
  };

  const renderSectionHeader = (
    id: Step4SectionId,
    title: string,
    status: Step4SectionStatus,
    open: boolean,
  ) => (
    <button
      type="button"
      className="ob-section-header ob-section-header-btn"
      onClick={() => toggleSection(id)}
      disabled={status === 'locked'}
    >
      <div className={`ob-section-badge${status === 'locked' ? ' ob-badge-locked' : status === 'completed' ? ' ob-badge-done' : ' ob-badge-inprogress'}`}>
        {status === 'completed' ? '✓' : STEP4_SECTION_NUM[id]}
      </div>
      <div className="ob-section-meta">
        <span className="ob-section-title">{title}</span>
        <span className={`ob-section-status${
          status === 'completed' ? ' ob-status-done'
          : status === 'active' ? ' ob-status-inprogress'
          : ''}`}>
          {sectionLabel(id)}
        </span>
      </div>
      <div className="ob-section-chevron">
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
    </button>
  );

  const sectionCardClass = (id: Step4SectionId) => {
    const status = step4SectionStatus(id);
    return `ob-section-card${openSections[id] ? ' ob-section-expanded' : ''}${status === 'completed' ? ' ob-section-complete' : ''}${status === 'locked' ? ' ob-section-locked' : ''}${status === 'active' ? ' ob-section-active-ring' : ''}`;
  };

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
              <CheckCircle2 size={12} className="ob-check-green" /> Confirmed
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

      <div className="ob-step4-sections">
      {/* Provider Information */}
      <div id="ob-step4-section-provider" className={sectionCardClass('provider')}>
        {renderSectionHeader('provider', 'Provider Information', step4SectionStatus('provider'), openSections.provider)}
        <div className={`ob-section-collapse${openSections.provider ? ' ob-section-collapse-open' : ''}`}>
          <div className="ob-section-collapse-inner">
            <div className="ob-section-body">
            <div className="ob-step4-section-toolbar">
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
            </div>
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
          </div>
        </div>
      </div>

      {/* Financial Metrics */}
      <div id="ob-step4-section-financial" className={sectionCardClass('financial')}>
        {renderSectionHeader('financial', 'Key Financial Metrics', step4SectionStatus('financial'), openSections.financial)}
        <div className={`ob-section-collapse${openSections.financial ? ' ob-section-collapse-open' : ''}`}>
          <div className="ob-section-collapse-inner">
            <div className="ob-section-body">
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
          </div>
        </div>
      </div>

      {/* Documents */}
      <div id="ob-step4-section-docs" className={sectionCardClass('docs')}>
        {renderSectionHeader('docs', 'Required Document Uploads', step4SectionStatus('docs'), openSections.docs)}
        <div className={`ob-section-collapse${openSections.docs ? ' ob-section-collapse-open' : ''}`}>
          <div className="ob-section-collapse-inner">
            <div className="ob-section-body">
            <div className="ob-callout ob-callout-info">
              <strong>Minimum 12-month reporting window.</strong> To prepare an accurate and meaningful service
              proposal, Dyad requires no less than the most recent 12 consecutive months of the following reports.
            </div>

            <div className="ob-dd-doc-list">
              {DUE_DILIGENCE_DOCS.map(doc => (
                <DocumentUploadRow
                  key={doc.id}
                  docId={doc.id}
                  label={doc.label}
                  period={doc.period}
                  meta={documents[doc.id]}
                  onboardingId={formData.onboardingId}
                  file={documentFiles[doc.id] ?? documentFilesRef.current[doc.id]}
                  onUpload={(id, meta, file) => setDoc(id, meta, file)}
                  onRemove={id => setDoc(id, null)}
                />
              ))}
            </div>

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
          </div>
        </div>
      </div>
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
        <div className="ob-step-footer ob-step-nav ob-step4-nav">
          <button type="button" className="ob-btn-secondary" onClick={onBack} disabled={isBusy}>
            <ObBackButtonLabel />
          </button>
          <button
            type="button"
            className={`ob-btn-primary${!canSubmit ? ' ob-btn-disabled' : ''}`}
            onClick={handleSubmit}
            disabled={!canSubmit || isBusy}
          >
            <ObForwardButtonLabel
              label="Submit for Review"
              loading={isBusy}
              loadingLabel={isUploadingDocuments ? 'Uploading documents…' : 'Submitting…'}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown, Clock, Download, FileText, ShieldCheck, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { OnboardingData } from '../../../pages/DyadOnboarding';
import { EnrollmentSaveNotice } from '../EnrollmentSaveNotice';
import { ObArrowRight, ObBackButtonLabel, ObForwardButtonLabel, trimBtnArrow } from '../ObBtnArrow';
import { formatAgreementAcceptance } from '../step3/agreementHelpers';
import { DyadSignatureBlock } from '../step3/agreementHelpers';
import {
  CLAIM_TIERS,
  INCLUDED_SERVICE_CATEGORIES,
  MSA_SECTION_ORDER,
  type CommercialDecision,
  type MsaSectionId,
} from './commercialConstants';
import { EnrollmentSectionsBarRow } from '../EnrollmentSectionsBarRow';
import { ENTITY_TYPES, US_STATES_ABBR, US_STATES_FULL } from '../entityFormConstants';
import { InfoTooltip } from './InfoTooltip';
import { MsaDocShell } from './MsaDocShell';
import {
  CarriedForwardExhibit,
  ExhibitCBody,
  FeeScheduleBody,
  MsaAgreementBody,
} from './msaDocuments';

type SectionStatus = 'active' | 'completed' | 'locked';

export interface StepCommercialAlignmentProps {
  formData: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  practiceTypeTitle: string;
  specialtyTitle: string;
  showSpecialtyPlatform: boolean;
}

const emptyMsaFields = () => ({
  edate: '', pentity: '', ptype: '', pstate: '', paddr: '',
});

const getMsaSectionStatus = (formData: OnboardingData): Record<MsaSectionId, SectionStatus> => {
  if (formData.msaPackageExecuted || formData.step5FeeScheduleComplete) {
    return { A: 'completed', B: 'completed', C: 'completed', D: 'completed', E: 'completed', F: 'completed' };
  }
  if (formData.step5ExhibitCComplete) {
    return { A: 'completed', B: 'completed', C: 'completed', D: 'completed', E: 'completed', F: 'active' };
  }
  if (formData.step5CarriedExhibitBComplete) {
    return { A: 'completed', B: 'completed', C: 'completed', D: 'completed', E: 'active', F: 'locked' };
  }
  if (formData.step5CarriedExhibitAComplete) {
    return { A: 'completed', B: 'completed', C: 'completed', D: 'active', E: 'locked', F: 'locked' };
  }
  if (formData.step5MsaComplete) {
    return { A: 'completed', B: 'completed', C: 'active', D: 'locked', E: 'locked', F: 'locked' };
  }
  if (formData.step5EntityComplete) {
    return { A: 'completed', B: 'active', C: 'locked', D: 'locked', E: 'locked', F: 'locked' };
  }
  return { A: 'active', B: 'locked', C: 'locked', D: 'locked', E: 'locked', F: 'locked' };
};

const getInitialOpenMsaSections = (formData: OnboardingData): Record<MsaSectionId, boolean> => ({
  A: !formData.step5EntityComplete,
  B: formData.step5EntityComplete && !formData.step5MsaComplete,
  C: formData.step5MsaComplete && !formData.step5CarriedExhibitAComplete,
  D: formData.step5CarriedExhibitAComplete && !formData.step5CarriedExhibitBComplete,
  E: formData.step5CarriedExhibitBComplete && !formData.step5ExhibitCComplete,
  F: formData.step5ExhibitCComplete && !formData.step5FeeScheduleComplete,
});

const MSA_SECTION_COMPLETE_FIELD: Partial<Record<MsaSectionId, keyof OnboardingData>> = {
  B: 'step5MsaComplete',
  C: 'step5CarriedExhibitAComplete',
  D: 'step5CarriedExhibitBComplete',
  E: 'step5ExhibitCComplete',
  F: 'step5FeeScheduleComplete',
};

export const StepCommercialAlignment: React.FC<StepCommercialAlignmentProps> = ({
  formData, set, onNext, onBack, isSubmitting, practiceTypeTitle, specialtyTitle, showSpecialtyPlatform,
}) => {
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [tierDetailOpen, setTierDetailOpen] = useState(false);
  const [showMsaPackage, setShowMsaPackage] = useState(formData.commercialDecision === 'accept');
  const [declineReviewExhibit, setDeclineReviewExhibit] = useState<'A' | 'B' | null>(null);
  const providerSignatureInputRef = useRef<HTMLInputElement>(null);

  const [msaFields, setMsaFields] = useState(() => ({ ...emptyMsaFields(), ...formData.msaFields }));
  const [exhibitCFields, setExhibitCFields] = useState(() => ({ pentity: '', edate: '', ...formData.exhibitCFields }));
  const [feeFields, setFeeFields] = useState(() => ({ pentity: '', edate: '', ...formData.feeScheduleFields }));

  const [sectionStatus, setSectionStatus] = useState<Record<MsaSectionId, SectionStatus>>(
    () => getMsaSectionStatus(formData),
  );

  const [openMsaSections, setOpenMsaSections] = useState<Record<MsaSectionId, boolean>>(
    () => getInitialOpenMsaSections(formData),
  );

  const proposalValidThrough = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  const practiceName = formData.organizationName || formData.entityLegalName || formData.groupLegalName;
  const providerCount = formData.billableProviders || formData.providerCount || '-';
  const grossCollections = formData.annualGrossCollections || '-';
  const signerFullName = `${formData.signerFirstName || formData.firstName} ${formData.signerLastName || formData.lastName}`.trim();
  const allMsaAttestationsComplete =
    formData.step5MsaAttested
    && formData.step5ExhibitCAttested
    && formData.step5FeeScheduleAttested;
  const hasProviderSignature = !!formData.msaProviderSignatureImage?.trim();

  useEffect(() => {
    setShowMsaPackage(formData.commercialDecision === 'accept');
  }, [formData.commercialDecision]);

  useEffect(() => {
    if (formData.msaPackageExecuted && !hasProviderSignature) {
      set('msaPackageExecuted', false);
      set('msaPackageExecutedAt', '');
      set('msaPackageRecordId', '');
      set('msaPackageAgreed', false);
    }
  }, [formData.msaPackageExecuted, hasProviderSignature, set]);

  const handleProviderSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a PNG, JPG, or other image file for your signature');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Signature image must be under 2 MB');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        set('msaProviderSignatureImage', reader.result);
        toast.success('Digital signature uploaded');
      }
    };
    reader.onerror = () => {
      toast.error('Could not read the signature image. Please try again.');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemoveProviderSignature = () => {
    set('msaProviderSignatureImage', '');
    if (providerSignatureInputRef.current) {
      providerSignatureInputRef.current.value = '';
    }
  };

  const handleDeclineReviewExhibit = (exhibit: 'A' | 'B') => {
    setDeclineReviewExhibit(exhibit);
    setTimeout(() => {
      document.getElementById(`ob-decline-exhibit-${exhibit}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDownloadExecutedAgreements = () => {
    const nda = document.getElementById('exa-scroll');
    const baa = document.getElementById('exb-scroll');
    if (!nda && !baa) {
      toast.error('Executed agreements are not available yet.');
      return;
    }
    const w = window.open('', '_blank');
    if (!w) return;
    const printStyles = `
      body{font-family:Georgia,serif;padding:40px 60px;font-size:13px;line-height:1.8;color:#222}
      h2{font-size:18px;color:#0a2d6e;margin:24px 0 12px;text-align:center}
      p{margin-bottom:12px;text-align:justify}
    `;
    const body = [
      nda ? `<section><h2>Exhibit A - Confidentiality Agreement (Executed)</h2>${nda.innerHTML}</section>` : '',
      baa ? `<div style="page-break-before:always"></div><section><h2>Exhibit B - Business Associate Agreement (Executed)</h2>${baa.innerHTML}</section>` : '',
    ].join('');
    w.document.write(
      `<html><head><title>Executed Agreements</title><style>${printStyles}</style></head><body>${body}</body></html>`,
    );
    w.document.close();
    setTimeout(() => w.print(), 350);
  };

  const syncAgreementFields = useCallback(() => {
    const name = formData.entityLegalName || formData.groupLegalName || '';
    const etype = formData.entityType || '';
    const estate = formData.entityFormationState || formData.state || '';
    const addr = formData.entityStreet
      ? `${formData.entityStreet}, ${formData.entityCity}, ${formData.entityAddrState || formData.state} ${formData.entityZip || formData.zip}`.trim()
      : `${formData.practiceAddress}, ${formData.city}, ${formData.state} ${formData.zip}`.trim();
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    setMsaFields(prev => ({
      ...prev,
      pentity: name || prev.pentity,
      ptype: etype || prev.ptype,
      pstate: estate || prev.pstate,
      paddr: addr || prev.paddr,
      edate: prev.edate || today,
    }));
    setExhibitCFields(prev => ({
      ...prev,
      pentity: name || prev.pentity,
      edate: prev.edate || today,
    }));
    setFeeFields(prev => ({
      ...prev,
      pentity: name || prev.pentity,
      edate: prev.edate || today,
    }));
  }, [
    formData.entityLegalName,
    formData.groupLegalName,
    formData.entityType,
    formData.entityFormationState,
    formData.state,
    formData.entityStreet,
    formData.entityCity,
    formData.entityAddrState,
    formData.entityZip,
    formData.practiceAddress,
    formData.city,
    formData.zip,
  ]);

  useEffect(() => {
    setSectionStatus(getMsaSectionStatus(formData));
    setOpenMsaSections(getInitialOpenMsaSections(formData));
  }, [
    formData.step5EntityComplete,
    formData.step5MsaComplete,
    formData.step5CarriedExhibitAComplete,
    formData.step5CarriedExhibitBComplete,
    formData.step5ExhibitCComplete,
    formData.step5FeeScheduleComplete,
    formData.msaPackageExecuted,
  ]);

  useEffect(() => {
    const hasSavedMsa = formData.msaFields && Object.values(formData.msaFields).some(v => String(v || '').trim());
    if (!hasSavedMsa) syncAgreementFields();
  }, [
    formData.msaFields,
    syncAgreementFields,
    formData.entityLegalName,
    formData.groupLegalName,
    formData.organizationName,
  ]);

  useEffect(() => {
    if (!formData.msaFields || !Object.values(formData.msaFields).some(v => String(v || '').trim())) return;
    setMsaFields(prev => ({ ...emptyMsaFields(), ...prev, ...formData.msaFields }));
  }, [formData.msaFields]);

  useEffect(() => {
    if (!formData.exhibitCFields || !Object.values(formData.exhibitCFields).some(v => String(v || '').trim())) return;
    setExhibitCFields(prev => ({ pentity: '', edate: '', ...prev, ...formData.exhibitCFields }));
  }, [formData.exhibitCFields]);

  useEffect(() => {
    if (!formData.feeScheduleFields || !Object.values(formData.feeScheduleFields).some(v => String(v || '').trim())) return;
    setFeeFields(prev => ({ pentity: '', edate: '', ...prev, ...formData.feeScheduleFields }));
  }, [formData.feeScheduleFields]);

  useEffect(() => {
    if (JSON.stringify(formData.msaFields ?? {}) === JSON.stringify(msaFields)) return;
    set('msaFields', msaFields);
  }, [msaFields, set, formData.msaFields]);

  useEffect(() => {
    if (JSON.stringify(formData.exhibitCFields ?? {}) === JSON.stringify(exhibitCFields)) return;
    set('exhibitCFields', exhibitCFields);
  }, [exhibitCFields, set, formData.exhibitCFields]);

  useEffect(() => {
    if (JSON.stringify(formData.feeScheduleFields ?? {}) === JSON.stringify(feeFields)) return;
    set('feeScheduleFields', feeFields);
  }, [feeFields, set, formData.feeScheduleFields]);

  const msaSectionsComplete = MSA_SECTION_ORDER.filter(s => sectionStatus[s] === 'completed').length;
  const msaProgressPct = Math.round((msaSectionsComplete / MSA_SECTION_ORDER.length) * 100);

  const completeMsaSection = (id: MsaSectionId) => {
    const completeField = MSA_SECTION_COMPLETE_FIELD[id];
    if (completeField) set(completeField, true);

    const idx = MSA_SECTION_ORDER.indexOf(id);
    const next: Record<MsaSectionId, SectionStatus> = { ...sectionStatus, [id]: 'completed' };
    if (idx < MSA_SECTION_ORDER.length - 1) {
      const n = MSA_SECTION_ORDER[idx + 1];
      if (next[n] === 'locked') next[n] = 'active';
    }
    setSectionStatus(next);
    setOpenMsaSections(prev => {
      const o = { ...prev, [id]: false };
      if (idx < MSA_SECTION_ORDER.length - 1) o[MSA_SECTION_ORDER[idx + 1]] = true;
      return o;
    });
    const scrollId = id === 'F' ? 'ob-step5-final-sig' : `ob-step5-msa-${id}`;
    setTimeout(() => document.getElementById(scrollId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
  };

  const handleProposalAttest = (checked: boolean) => {
    set('proposalReviewed', checked);
  };

  const handleDecision = (dec: CommercialDecision) => {
    set('commercialDecision', dec);
    setShowMsaPackage(dec === 'accept');
    if (dec !== 'decline') {
      setDeclineReviewExhibit(null);
    }
    if (dec === 'accept') {
      setTimeout(() => document.getElementById('ob-step5-msa-package')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  };

  const attestDoc = (key: 'step5MsaAttested' | 'step5ExhibitCAttested' | 'step5FeeScheduleAttested', checked: boolean, metaKey: string, recordKey: string) => {
    set(key, checked);
    if (checked) {
      const { recordId, acceptedAt } = formatAgreementAcceptance();
      const at = `${acceptedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at ${acceptedAt.toLocaleTimeString('en-US')}`;
      set(recordKey as keyof OnboardingData, recordId as never);
      set(metaKey as keyof OnboardingData, `✓ Attested ${at}` as never);
    } else {
      set(recordKey as keyof OnboardingData, '' as never);
      set(metaKey as keyof OnboardingData, '' as never);
    }
  };

  const handleEntityContinue = () => {
    const missing: string[] = [];
    if (!formData.entityLegalName.trim()) missing.push('Legal Entity Name');
    if (!formData.entityType) missing.push('Entity Type');
    if (!formData.entityFormationState) missing.push('State of Licensure / Formation');
    if (!formData.entityStreet.trim()) missing.push('Street Address');
    if (!formData.entityCity.trim()) missing.push('City');
    if (!formData.entityAddrState) missing.push('State');
    if (!formData.entityZip.trim()) missing.push('ZIP Code');
    if (!formData.signerFirstName.trim()) missing.push('Signer First Name');
    if (!formData.signerLastName.trim()) missing.push('Signer Last Name');
    if (!formData.signerTitle.trim()) missing.push('Title / Role');
    const signerEmail = formData.signerEmail.trim() || formData.contactEmail.trim();
    if (!signerEmail) missing.push('Email Address');
    if (missing.length) {
      toast.error(`Please complete: ${missing.join(', ')}`);
      return;
    }
    set('step5EntityComplete', true);
    syncAgreementFields();
    completeMsaSection('A');
  };

  const handleUnifiedExecute = () => {
    if (!formData.step5MsaAttested || !formData.step5ExhibitCAttested || !formData.step5FeeScheduleAttested) {
      toast.error('Complete all document attestations first');
      return;
    }
    if (!formData.msaPackageAgreed) {
      toast.error('Please accept the unified signature disclosure');
      return;
    }
    if (!hasProviderSignature) {
      toast.error('Please upload your digital signature before executing the package');
      return;
    }
    const { recordId, acceptedAt } = formatAgreementAcceptance();
    const at = `${acceptedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at ${acceptedAt.toLocaleTimeString('en-US')}`;
    set('msaPackageExecuted', true);
    set('msaPackageRecordId', recordId);
    set('msaPackageExecutedAt', at);
    set('msaAgreed', true);
    set('msaSignature', signerFullName);
    completeMsaSection('F');
    toast.success('MSA package executed');
  };

  const canProceed =
    formData.proposalReviewed
    && formData.commercialDecision === 'accept'
    && formData.msaPackageExecuted;

  const handleSubmit = () => {
    if (formData.commercialDecision === 'discuss') {
      if (!formData.discussQuestions.trim()) {
        toast.error('Please share your questions');
        return;
      }
      toast.success('Your questions have been submitted. Our team will respond within 24 hours.');
      return;
    }
    if (formData.commercialDecision === 'decline') {
      toast.success('Thank you. Your application has been archived for 14 business days.');
      return;
    }
    if (!canProceed) {
      toast.error('Please accept the proposal and execute the MSA package');
      return;
    }
    onNext();
  };

  const nextBtnLabel =
    formData.commercialDecision === 'accept'
      ? 'Proceed to Bank & Payment Setup →'
      : formData.commercialDecision === 'discuss'
        ? 'Submit & Await Response'
        : formData.commercialDecision === 'decline'
          ? 'Confirm & Close'
          : 'Continue →';

  const decisionEnabled = formData.proposalReviewed;

  const renderMsaHeader = (id: MsaSectionId, title: string, badge?: React.ReactNode) => {
    const status = sectionStatus[id];
    const open = openMsaSections[id];
    return (
      <button
        type="button"
        className={`ob-step5-msa-hdr${status === 'active' ? ' ob-step5-msa-hdr-active' : ''}${status === 'completed' ? ' ob-step5-msa-hdr-done' : ''}${status === 'locked' ? ' ob-step5-msa-hdr-locked' : ''}`}
        onClick={() => status !== 'locked' && setOpenMsaSections(p => ({ ...p, [id]: !p[id] }))}
        disabled={status === 'locked'}
      >
        <span className="ob-step5-msa-num">{status === 'completed' ? '✓' : id}</span>
        <span className="ob-step5-msa-meta">
          <span className="ob-step5-msa-title">{title}{badge}</span>
          <span className="ob-step5-msa-sts">
            {status === 'completed' ? (id === 'C' || id === 'D' ? 'Carried forward - already executed ✓' : 'Attested ✓')
              : status === 'active' ? 'In progress - complete to continue'
                : `Complete Section ${MSA_SECTION_ORDER[MSA_SECTION_ORDER.indexOf(id) - 1] || 'A'} to unlock`}
          </span>
        </span>
        <ChevronDown size={18} className="ob-step5-msa-chv" />
      </button>
    );
  };

  const renderMsaCollapse = (id: MsaSectionId, children: React.ReactNode) => {
    if (sectionStatus[id] === 'locked') return null;
    const open = openMsaSections[id];
    return (
      <div className={`ob-section-collapse ob-step5-msa-collapse${open ? ' ob-section-collapse-open' : ''}`}>
        <div className="ob-section-collapse-inner">
          <div className="ob-step5-msa-body">{children}</div>
        </div>
      </div>
    );
  };

  const msaCardClass = (id: MsaSectionId, extra = '') => {
    const status = sectionStatus[id];
    const open = openMsaSections[id];
    return [
      'ob-step5-msa-card',
      extra,
      open ? 'ob-step5-msa-open' : '',
      status === 'completed' ? 'ob-step5-msa-complete' : '',
      status === 'locked' ? 'ob-step5-msa-locked' : '',
    ].filter(Boolean).join(' ');
  };

  const categories = INCLUDED_SERVICE_CATEGORIES.filter(c => !c.specialtyOnly || showSpecialtyPlatform);

  return (
    <div className="ob-step-content ob-step5-layout">
      <div className="ob-step-header">
        <h2 className="ob-step-title">Commercial Alignment &amp; MSA</h2>
        <p className="ob-step-subtitle">
          Review the terms and service scope prepared for your practice. This proposal reflects the
          information gathered during your discovery and due diligence process.
        </p>
      </div>

      <div className="ob-ca-expiry">
        <Clock size={16} aria-hidden />
        <span>This proposal is valid through <strong>{proposalValidThrough}</strong>. Terms and fee structure are held at current rates until this date.</span>
      </div>

      {/* Proposal */}
      <div className="ob-ca-proposal">
        <div className="ob-ca-proposal-top">
          <div className="ob-ca-proposal-title">Integrated Services Proposal</div>
          <div className="ob-ca-proposal-meta">
            <span><strong>Practice:</strong> {practiceName}</span>
            <span><strong>Specialty:</strong> {specialtyTitle || formData.primarySpecialty}</span>
            <span><strong>Providers:</strong> {providerCount}</span>
            <span><strong>Reported Annual Gross Collections:</strong> {grossCollections}</span>
          </div>
        </div>
        <div className="ob-ca-eng-row">
          <div className="ob-ca-eng-item">
            <div className="ob-ca-eng-icon"><FileText size={16} color="#0a2d6e" /></div>
            <div>
              <div className="ob-ca-eng-title">Fully Paperless Workflows</div>
              <div className="ob-ca-eng-desc">Every stage operates within a single digital infrastructure. No paper, no fax, no courier handoffs.</div>
            </div>
          </div>
          <div className="ob-ca-eng-sep" />
          <div className="ob-ca-eng-item">
            <div className="ob-ca-eng-icon"><Users size={16} color="#0a2d6e" /></div>
            <div>
              <div className="ob-ca-eng-title">Specialty-Dedicated Operations</div>
              <div className="ob-ca-eng-desc">Supported by an operations team with deep domain expertise in your specialty.</div>
            </div>
          </div>
        </div>
        <div className="ob-ca-fee-focal">
          <div className="ob-ca-fee-focal-label">Estimated Monthly Platform Fee</div>
          <div className="ob-ca-fee-focal-amount">-</div>
          <div className="ob-ca-fee-focal-basis">Determined by claims volume tier and reported gross collections</div>
        </div>

        <div className="ob-ca-section-static">
          <div className="ob-ca-section-label">Volume &amp; Rate Structure</div>
          <div className="ob-ca-tier-row">
            <div className="ob-ca-tier-left">
              Claims Volume Tier <InfoTooltip text="Your tier is determined by average monthly claim volume. Each tier carries a defined minimum monthly fee." />
            </div>
            <div className="ob-ca-tier-right">
              <div className="ob-ca-tier-badge">Tier 2 <span>201-500 claims / month</span></div>
              <button type="button" className="ob-ca-tier-toggle" onClick={() => setTierDetailOpen(v => !v)}>
                View all tiers {tierDetailOpen ? '▴' : '▾'}
              </button>
            </div>
          </div>
          {tierDetailOpen && (
            <div className="ob-ca-tier-tbl-wrap">
            <table className="ob-ca-tier-tbl">
              <thead><tr><th>Tier</th><th>Monthly Claim Volume</th><th>Min. Monthly Fee</th></tr></thead>
              <tbody>
                {CLAIM_TIERS.map(t => (
                  <tr key={t.tier} className={t.current ? 'ob-ca-tier-tbl-cur' : ''}>
                    <td>Tier {t.tier}</td><td>{t.range}</td><td>{t.minFee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          <div className="ob-ca-fee-line">
            <span className="ob-ca-fee-name">Billing Rate <InfoTooltip text="Applied as a percentage of total gross reported collections within your tier." /></span>
            <span className="ob-ca-fee-val">% of total gross reported collections</span>
          </div>
        </div>

        <div className="ob-ca-incl-section">
          <div className="ob-ca-incl-header">Fully Integrated Services</div>
          {categories.map(cat => (
            <div key={cat.id} className={`ob-ca-cat${openCats[cat.id] ? ' ob-ca-cat-open' : ''}`}>
              <button type="button" className="ob-ca-cat-hdr" onClick={() => setOpenCats(p => ({ ...p, [cat.id]: !p[cat.id] }))}>
                <span className="ob-ca-cat-dot" style={{ background: cat.dotColor || '#0a2d6e' }} />
                <span className="ob-ca-cat-title">{cat.title} <span className="ob-ca-cat-count">{cat.items.length}</span></span>
                <ChevronDown size={14} className="ob-ca-cat-chv" />
              </button>
              <div className="ob-ca-cat-body">
                {cat.note && <p className="ob-ca-cat-note">{cat.note}</p>}
                {cat.items.map(item => (
                  <div key={item.name} className="ob-ca-fee-line">
                    <span className="ob-ca-fee-name">
                      {item.name}{item.tip && <InfoTooltip text={item.tip} />}
                    </span>
                    <span className={`ob-ca-fee-val${item.included ? ' ob-ca-fee-val-inc' : ''}`}>
                      {item.included ? 'Included' : item.value}
                    </span>
                  </div>
                ))}
                {cat.id === 'idr' && (
                  <p className="ob-ca-fee-note">IDR reimbursements are net of the 10% service fee and all filing costs. All fees are fronted by Dyad.</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="ob-ca-proposal-attest">
          <label className={`ob-ca-attest-box${formData.proposalReviewed ? ' ob-ca-attest-box-checked' : ''}`}>
            <input type="checkbox" checked={formData.proposalReviewed} onChange={e => handleProposalAttest(e.target.checked)} />
            <div>
              <div className="ob-ca-attest-text">
                I have reviewed the service scope, fee structure, and terms outlined in this proposal and confirm my understanding of the services to be provided and the associated fee obligations.
              </div>
              {!formData.proposalReviewed && (
                <div className="ob-ca-attest-legal">
                  This acknowledgment does not constitute a binding agreement. Execution of the Master Services Agreement will formalize the engagement.
                </div>
              )}
             
            </div>
          </label>
        </div>
      </div>

      {/* Decision */}
      <div className={`ob-ca-decision-card${decisionEnabled ? '' : ' ob-ca-decision-disabled'}`}>
        <div className="ob-ca-decision-title">Next Steps</div>
        <p className="ob-ca-decision-sub">Please select how you would like to proceed.</p>

        <label className={`ob-ca-d-opt${formData.commercialDecision === 'accept' ? ' ob-ca-d-opt-sel' : ''}`}>
          <input type="radio" name="commercial-dec" checked={formData.commercialDecision === 'accept'} onChange={() => handleDecision('accept')} disabled={!decisionEnabled} />
          <div>
            <div className="ob-ca-d-label">Accept Proposal</div>
            <div className="ob-ca-d-desc">I have reviewed the terms, fees, and scope of services and I agree to move forward.</div>
            <div className="ob-ca-d-next">→ Proceed to Completing the Master Services Agreement, Account Authorizations, Bank Account &amp; Payment Setup</div>
          </div>
        </label>

        <label className={`ob-ca-d-opt${formData.commercialDecision === 'discuss' ? ' ob-ca-d-opt-sel' : ''}`}>
          <input type="radio" name="commercial-dec" checked={formData.commercialDecision === 'discuss'} onChange={() => handleDecision('discuss')} disabled={!decisionEnabled} />
          <div>
            <div className="ob-ca-d-label">Discuss Before Proceeding</div>
            <div className="ob-ca-d-desc">I have questions and would like to discuss before moving forward.</div>
          </div>
        </label>
        {formData.commercialDecision === 'discuss' && (
          <div className="ob-ca-d-expand">
            <label className="ob-label">Questions</label>
            <textarea className="ob-input ob-dd-textarea" rows={3} placeholder="Please share any questions or topics you'd like to address." value={formData.discussQuestions} onChange={e => set('discussQuestions', e.target.value)} />
            <p className="ob-ca-d-expand-note">Our enrollment team will respond within 24 hours.</p>
            <div className="ob-ca-contact-choice">
              <button type="button" className={`ob-ca-cc-btn${formData.discussContactPref === 'email' ? ' ob-ca-cc-btn-sel' : ''}`} onClick={() => set('discussContactPref', 'email')}>✉ Respond by email</button>
              <button type="button" className={`ob-ca-cc-btn${formData.discussContactPref === 'call' ? ' ob-ca-cc-btn-sel' : ''}`} onClick={() => set('discussContactPref', 'call')}>☎ Schedule a 30-minute call</button>
            </div>
          </div>
        )}

        <label className={`ob-ca-d-opt ob-ca-d-opt-decline-wrap${formData.commercialDecision === 'decline' ? ' ob-ca-d-opt-decline ob-ca-d-opt-sel' : ''}`}>
          <input type="radio" name="commercial-dec" checked={formData.commercialDecision === 'decline'} onChange={() => handleDecision('decline')} disabled={!decisionEnabled} />
          <div className="ob-ca-d-opt-content">
            <div className="ob-ca-d-label">Decline at This Time</div>
            <div className="ob-ca-d-desc">This is not the right fit for our organization at this time.</div>
            {formData.commercialDecision === 'decline' && (
              <div className="ob-ca-decline-panel">
                <p className="ob-ca-decline-thanks">
                  Thank you for taking the time to explore a partnership with Dyad Practice Solutions.
                  We appreciate your consideration and the trust you have shown throughout this process.
                </p>
                <div className="ob-ca-decline-remind">
                  <strong>Confidentiality reminder.</strong>{' '}
                  The Confidentiality Agreement (Exhibit A) and Business Associate Agreement (Exhibit B)
                  executed during enrollment remain in full force and effect.
                  <div className="ob-ca-decline-links">
                    <button
                      type="button"
                      className="ob-ca-decline-link"
                      onClick={() => handleDeclineReviewExhibit('A')}
                    >
                      Review executed Confidentiality Agreement →
                    </button>
                    <button
                      type="button"
                      className="ob-ca-decline-link"
                      onClick={() => handleDeclineReviewExhibit('B')}
                    >
                      Review executed BAA →
                    </button>
                  </div>
                </div>
                <p className="ob-ca-decline-archive">
                  Your application will be archived for <strong>14 business days</strong>. You may return
                  to resume enrollment during this period. An exit survey will be sent to the email on file.
                </p>
                <button
                  type="button"
                  className="ob-ca-decline-download-btn"
                  onClick={handleDownloadExecutedAgreements}
                >
                  <Download size={16} aria-hidden="true" />
                  Download executed agreements
                </button>
                <div
                  className={`ob-ca-decline-exhibits${declineReviewExhibit ? ' ob-ca-decline-exhibits-visible' : ' ob-ca-decline-exhibits-offscreen'}`}
                  aria-hidden={!declineReviewExhibit}
                >
                  <div
                    id="ob-decline-exhibit-A"
                    className={`ob-ca-decline-exhibit${declineReviewExhibit === 'A' ? ' ob-ca-decline-exhibit-open' : ''}`}
                  >
                    <CarriedForwardExhibit
                      exhibit="A"
                      entityName={formData.entityLegalName}
                      signerName={signerFullName}
                      signerTitle={formData.signerTitle || formData.titleRole}
                      recordId={formData.ndaAcceptedRecordId}
                      acceptedAt={formData.ndaAcceptedAt}
                      showDyadSignature={formData.confidentialityAgreed}
                      ndaFields={formData.ndaFields}
                    />
                  </div>
                  <div
                    id="ob-decline-exhibit-B"
                    className={`ob-ca-decline-exhibit${declineReviewExhibit === 'B' ? ' ob-ca-decline-exhibit-open' : ''}`}
                  >
                    <CarriedForwardExhibit
                      exhibit="B"
                      entityName={formData.entityLegalName}
                      signerName={signerFullName}
                      signerTitle={formData.signerTitle || formData.titleRole}
                      recordId={formData.baaAcceptedRecordId}
                      acceptedAt={formData.baaAcceptedAt}
                      showDyadSignature={formData.baaAgreed}
                      baaFields={formData.baaFields}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </label>
      </div>

      {/* MSA Package */}
      {showMsaPackage && (
        <div id="ob-step5-msa-package" className="ob-step5-msa-package">
          <div className="ob-step-header ob-step5-msa-header">
            <h2 className="ob-step-title">Master Services Agreement &amp; Exhibits</h2>
            <p className="ob-step-subtitle">
              Review the Master Services Agreement and its accompanying Exhibits, complete the attestation for each document, and apply a single electronic signature at the bottom to execute the entire package. Exhibits A and B were executed during Section 3 and are shown for reference only.
            </p>
          </div>
          <div className="ob-step-sections-bar ob-step5-msa-sections-bar">
            <EnrollmentSectionsBarRow
              progressPct={msaProgressPct}
              sectionsComplete={msaSectionsComplete}
              totalSections={MSA_SECTION_ORDER.length}
            />
          </div>

          <div className="ob-step5-msa-cards">
          <div id="ob-step5-msa-A" className={msaCardClass('A')}>
            {renderMsaHeader('A', 'Entity & Authorized Signer Information')}
            {renderMsaCollapse('A', (
              <>
                <p className="ob-section-desc">
                  The legal entity and authorized signer below were captured during your Confidentiality &amp; BAA execution in Section 3. This information is used to populate the Master Services Agreement, Exhibit C (Scope of Services), and the Fee Schedule. Review the carried-forward values and edit if anything has changed.
                </p>

                <div className="ob-ca-crribbon">
                  <div className="ob-ca-crribbon-icon">✓</div>
                  <div>
                    <div className="ob-ca-crribbon-title">Carried forward from Section 3 - Confidentiality &amp; BAA</div>
                    <div className="ob-ca-crribbon-desc">
                      Your entity details and authorized signer were validated and e-mail verified during the execution of Exhibits A and B. Any changes here will be reflected throughout the Master Services Agreement, Exhibit C, and the Fee Schedule.
                    </div>
                  </div>
                </div>

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
                    <input
                      type="text"
                      className="ob-input ob-input-readonly"
                      readOnly
                      value={specialtyTitle || formData.primarySpecialty}
                    />
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
                  The signer below was email-verified in Section 3.
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
                    <input
                      type="email"
                      className="ob-input ob-input-readonly"
                      readOnly
                      value={formData.signerEmail || formData.contactEmail}
                    />
                    {formData.signerEmailVerified && (
                      <p className="ob-otp-verified">✅ Email verified during Section 3 - no additional verification required</p>
                    )}
                  </div>
                </div>

                <div className="ob-agreement-sc2">
                  <button type="button" className="ob-agreement-bc2" onClick={handleEntityContinue}>
                    {trimBtnArrow('Continue to Master Services Agreement')} <ObArrowRight />
                  </button>
                </div>
              </>
            ))}
          </div>

          {/* B MSA */}
          <div id="ob-step5-msa-B" className={msaCardClass('B')}>
            {renderMsaHeader('B', 'Master Services Agreement')}
            {renderMsaCollapse('B', (
              <>
                <p className="ob-section-desc">
                  The Master Services Agreement (&ldquo;MSA&rdquo;) is the governing contract that establishes the working relationship between your practice and Dyad Practice Solutions, LLC. It incorporates Exhibit A (Confidentiality), Exhibit B (BAA), Exhibit C (Scope of Services), and the Fee Schedule by reference. Review the full text below, then attest at the bottom to confirm.
                </p>
                <MsaDocShell
                  docId="msa" title="Master Services Agreement" scrollId="msa-scroll"
                  executed={formData.msaPackageExecuted}
                  attested={formData.step5MsaAttested}
                  attestedMeta={formData.msaAttestMeta || null}
                  onAttestChange={c => attestDoc('step5MsaAttested', c, 'msaAttestMeta', 'msaAttestRecordId')}
                  attestLabel="I have reviewed the Master Services Agreement in full and confirm that I understand and agree to its terms. I acknowledge that this Agreement incorporates Exhibit A (Confidentiality Agreement), Exhibit B (Business Associate Agreement), Exhibit C (Scope of Services), and Exhibit D (Fee Schedule) by reference, and that the unified signature applied at the bottom of this screen will execute the Master Services Agreement and the new Exhibits not previously executed."
                  continueLabel="Continue to Exhibit A (carried forward) →"
                  onContinue={() => { if (formData.step5MsaAttested) completeMsaSection('B'); else toast.error('Please attest to the MSA'); }}
                  continueDisabled={!formData.step5MsaAttested}
                >
                  <MsaAgreementBody fields={msaFields} onFieldChange={(k, v) => setMsaFields(p => ({ ...p, [k]: v }))} />
                </MsaDocShell>
              </>
            ))}
          </div>

          {/* C Exhibit A carried */}
          <div id="ob-step5-msa-C" className={msaCardClass('C', 'ob-step5-msa-carr')}>
            {renderMsaHeader('C', 'Exhibit A - Confidentiality Agreement', <span className="ob-ca-cfbadge">✓ Carried Forward</span>)}
            {renderMsaCollapse('C', (
              <>
                <div className="ob-ca-crribbon">
                  <div className="ob-ca-crribbon-icon">✓</div>
                  <div>
                    <div className="ob-ca-crribbon-title">Already Executed in Section 3 - Sign Confidentiality &amp; BAA</div>
                    <div className="ob-ca-crribbon-desc">Exhibit A (Confidentiality Agreement) was reviewed, attested to, and electronically executed by both Parties when you completed Section 3 of enrollment. It is included here as part of the Master Services Agreement package for reference only.</div>
                  </div>
                </div>
                <CarriedForwardExhibit exhibit="A" entityName={formData.entityLegalName} signerName={signerFullName} signerTitle={formData.signerTitle || formData.titleRole} recordId={formData.ndaAcceptedRecordId} acceptedAt={formData.ndaAcceptedAt} showDyadSignature={formData.confidentialityAgreed} ndaFields={formData.ndaFields} />
                <div className="ob-ca-dat ob-ca-dat-checked">
                  <label className="ob-ca-dat-label">
                    <input type="checkbox" checked disabled />
                    <div>
                      <div className="ob-ca-dat-text">Exhibit A has been previously reviewed and executed. The attestation captured during Section 3 is carried forward and remains binding under this Master Services Agreement package.</div>
                      {formData.ndaAcceptedAt && <div className="ob-ca-dat-meta">✓ {formData.ndaAcceptedAt}</div>}
                    </div>
                  </label>
                </div>
                <div className="ob-agreement-sc2">
                  <button type="button" className="ob-agreement-bc2" onClick={() => completeMsaSection('C')}>
                    {trimBtnArrow('Continue to Exhibit B (carried forward)')} <ObArrowRight />
                  </button>
                </div>
              </>
            ))}
          </div>

          {/* D Exhibit B carried */}
          <div id="ob-step5-msa-D" className={msaCardClass('D', 'ob-step5-msa-carr')}>
            {renderMsaHeader('D', 'Exhibit B - Business Associate Agreement', <span className="ob-ca-cfbadge">✓ Carried Forward</span>)}
            {renderMsaCollapse('D', (
              <>
                <div className="ob-ca-crribbon">
                  <div className="ob-ca-crribbon-icon">✓</div>
                  <div>
                    <div className="ob-ca-crribbon-title">Already Executed in Section 3 - Sign Confidentiality &amp; BAA</div>
                    <div className="ob-ca-crribbon-desc">Exhibit B (Business Associate Agreement) was reviewed, attested to, and electronically executed by both Parties when you completed Section 3 of enrollment. It governs the handling of Protected Health Information under HIPAA and is incorporated by reference into the Master Services Agreement.</div>
                  </div>
                </div>
                <CarriedForwardExhibit exhibit="B" entityName={formData.entityLegalName} signerName={signerFullName} signerTitle={formData.signerTitle || formData.titleRole} recordId={formData.baaAcceptedRecordId} acceptedAt={formData.baaAcceptedAt} showDyadSignature={formData.baaAgreed} baaFields={formData.baaFields} />
                <div className="ob-ca-dat ob-ca-dat-checked">
                  <label className="ob-ca-dat-label">
                    <input type="checkbox" checked disabled />
                    <div>
                      <div className="ob-ca-dat-text">Exhibit B has been previously reviewed and executed. The attestation captured during Section 3 is carried forward and remains binding under this Master Services Agreement package.</div>
                      {formData.baaAcceptedAt && <div className="ob-ca-dat-meta">✓ {formData.baaAcceptedAt}</div>}
                    </div>
                  </label>
                </div>
                <div className="ob-agreement-sc2">
                  <button type="button" className="ob-agreement-bc2" onClick={() => completeMsaSection('D')}>
                    {trimBtnArrow('Continue to Exhibit C')} <ObArrowRight />
                  </button>
                </div>
              </>
            ))}
          </div>

          {/* E Exhibit C */}
          <div id="ob-step5-msa-E" className={msaCardClass('E')}>
            {renderMsaHeader('E', 'Exhibit C - Scope of Services')}
            {renderMsaCollapse('E', (
              <>
                <p className="ob-section-desc">
                  Exhibit C defines the specific services Dyad will perform on behalf of your practice. Review the scope below, then attest at the bottom to confirm the services match what was discussed during Commercial Alignment (Section 5).
                </p>
                <MsaDocShell
                  docId="exc" title="Exhibit C - Scope of Services" scrollId="exc-scroll"
                  executed={formData.msaPackageExecuted}
                  attested={formData.step5ExhibitCAttested}
                  attestedMeta={formData.exhibitCAttestMeta || null}
                  onAttestChange={c => attestDoc('step5ExhibitCAttested', c, 'exhibitCAttestMeta', 'exhibitCAttestRecordId')}
                  attestLabel="I have reviewed Exhibit C (Scope of Services) in full and confirm that the services described match the scope reviewed and agreed to during the Commercial Alignment phase of enrollment. I understand that this Exhibit is incorporated by reference into the Master Services Agreement and will be executed via the unified signature applied at the bottom of this screen."
                  continueLabel="Continue to Fee Schedule →"
                  onContinue={() => { if (formData.step5ExhibitCAttested) completeMsaSection('E'); else toast.error('Please attest to Exhibit C'); }}
                  continueDisabled={!formData.step5ExhibitCAttested}
                >
                  <ExhibitCBody fields={exhibitCFields} onFieldChange={(k, v) => setExhibitCFields(p => ({ ...p, [k]: v }))} />
                </MsaDocShell>
              </>
            ))}
          </div>

          {/* F Fee Schedule */}
          <div id="ob-step5-msa-F" className={msaCardClass('F')}>
            {renderMsaHeader('F', 'Fee Schedule')}
            {renderMsaCollapse('F', (
              <>
                <p className="ob-section-desc">
                  The Fee Schedule sets the rates, minimums, and onboarding fees for the engagement. The values below reflect the Commercial Alignment package presented and agreed to in Section 5. Review carefully and attest at the bottom to confirm.
                </p>
                <MsaDocShell
                  docId="exd" title="Fee Schedule" scrollId="exd-scroll"
                  executed={formData.msaPackageExecuted}
                  attested={formData.step5FeeScheduleAttested}
                  attestedMeta={formData.feeScheduleAttestMeta || null}
                  onAttestChange={c => attestDoc('step5FeeScheduleAttested', c, 'feeScheduleAttestMeta', 'feeScheduleAttestRecordId')}
                  attestLabel="I have reviewed the Fee Schedule in full and confirm that the rates, minimums, tiers, onboarding fee, pass-through cost provisions, and CPI adjustment terms match the commercial package reviewed and agreed to during the Commercial Alignment phase of enrollment. I understand that this Fee Schedule is incorporated by reference into the Master Services Agreement and will be executed via the unified signature applied at the bottom of this screen."
                  continueLabel="Continue to Final Signature →"
                  onContinue={() => { if (formData.step5FeeScheduleAttested) completeMsaSection('F'); else toast.error('Please attest to the Fee Schedule'); }}
                  continueDisabled={!formData.step5FeeScheduleAttested}
                >
                  <FeeScheduleBody fields={feeFields} onFieldChange={(k, v) => setFeeFields(p => ({ ...p, [k]: v }))} />
                </MsaDocShell>
              </>
            ))}
          </div>
          </div>

          {/* Unified signature */}
          <div id="ob-step5-final-sig" className="ob-ca-fsig">
            <div className="ob-ca-fsig-banner">
              <span className="ob-ca-fsig-banner-icon">✍️</span>
              <div>
                <div className="ob-ca-fsig-banner-title">Unified Electronic Signature - Master Services Agreement Package</div>
                <div className="ob-ca-fsig-banner-sub">A single electronic signature applied below executes the Master Services Agreement, Exhibit C (Scope of Services), and the Fee Schedule simultaneously. Exhibits A and B remain in effect as previously executed in Section 3.</div>
              </div>
            </div>
            <div className={`ob-ca-fsig-status${formData.msaPackageExecuted ? ' ob-ca-fsig-status-exec' : ''}`}>
              {formData.msaPackageExecuted
                ? <><strong>Package fully executed.</strong> All three new documents are now binding. Exhibits A and B remain in effect as previously executed in Section 3.</>
                : allMsaAttestationsComplete
                  ? hasProviderSignature
                    ? 'All attestations complete and signature uploaded. Accept the disclosure below, then execute the package.'
                    : 'All attestations complete. Upload your digital signature in the Provider field, then accept the disclosure to execute the package.'
                  : 'Complete all attestations above to enable execution.'}
            </div>
            <div className="ob-ca-fsig-scope">
              <div className="ob-ca-fsig-scope-title">Documents to be Executed by This Signature</div>
              {[
                { id: 'msa', label: 'Master Services Agreement', done: formData.step5MsaAttested || formData.msaPackageExecuted },
                { id: 'exa', label: 'Exhibit A - Confidentiality Agreement', carr: true },
                { id: 'exb', label: 'Exhibit B - Business Associate Agreement', carr: true },
                { id: 'exc', label: 'Exhibit C - Scope of Services', done: formData.step5ExhibitCAttested || formData.msaPackageExecuted },
                { id: 'exd', label: 'Fee Schedule', done: formData.step5FeeScheduleAttested || formData.msaPackageExecuted },
              ].map(doc => (
                <div key={doc.id} className={`ob-ca-fsig-scope-item${doc.done ? ' ob-ca-fsig-scope-done' : ''}${doc.carr ? ' ob-ca-fsig-scope-carr' : ''}`}>
                  <span className="ob-ca-fsig-scope-icn">✓</span>
                  <span className="ob-ca-fsig-scope-label">{doc.label}</span>
                  <span className="ob-ca-fsig-scope-status">
                    {doc.carr ? 'Previously executed in Section 3' : doc.done ? 'Attested ✓' : 'Pending attestation'}
                  </span>
                </div>
              ))}
            </div>
            <div className="ob-ca-fsig-body">
              <table className="ob-agreement-sigtbl">
                <tbody>
                  <tr>
                    <td className="ob-ca-fsig-provider-col">
                      <div className="ob-agreement-sigp">Provider: {formData.entityLegalName}</div>
                      <div
                        className="ob-agreement-sigl ob-ca-fsig-sig-line"
                        style={formData.msaPackageExecuted && hasProviderSignature ? { borderBottomColor: '#2e7d32' } : undefined}
                      />
                      <div className="ob-agreement-sign">Name: {signerFullName}</div>
                      <div className="ob-agreement-sign">Title: {formData.signerTitle || formData.titleRole}</div>

                      {hasProviderSignature && (
                        <div className="ob-ca-fsig-provider-preview">
                          <img
                            src={formData.msaProviderSignatureImage}
                            alt={`Signature of ${signerFullName}`}
                            className="ob-ca-fsig-sig-img"
                          />
                        </div>
                      )}

                      {!hasProviderSignature && (
                        <div className="ob-ca-fsig-provider-upload">
                          <p className="ob-ca-fsig-provider-upload-label">Digital signature</p>
                          <input
                            ref={providerSignatureInputRef}
                            id="ob-msa-provider-signature-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                            className="ob-ca-fsig-file-input-visible"
                            onChange={handleProviderSignatureUpload}
                          />
                          <button
                            type="button"
                            className="ob-ca-fsig-upload-btn-prominent"
                            onClick={() => providerSignatureInputRef.current?.click()}
                          >
                            Upload digital signature
                          </button>
                          <p className="ob-ca-fsig-upload-hint">
                            PNG or JPG, max 2 MB. Your signature will appear here once uploaded.
                          </p>
                        </div>
                      )}

                      {hasProviderSignature && !formData.msaPackageExecuted && (
                        <button
                          type="button"
                          className="ob-ca-fsig-upload-remove"
                          onClick={handleRemoveProviderSignature}
                        >
                          Remove and upload a different signature
                        </button>
                      )}
                    </td>
                    <td>
                      <DyadSignatureBlock showSignature={formData.msaPackageExecuted || formData.msaPackageAgreed} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="ob-ca-fsig-cws">
              <div className="ob-agreement-cwl">
                <strong>Electronic Signature Disclosure - ESIGN Act &amp; UETA Compliance.</strong> By checking the box below, you consent to use electronic signatures pursuant to the ESIGN Act (15 U.S.C. § 7001 et seq.) and the Uniform Electronic Transactions Act. You acknowledge that: (1) you have reviewed and attested to the Master Services Agreement, Exhibit C (Scope of Services), and the Fee Schedule in full; (2) you have the legal authority to bind <strong>{formData.entityLegalName}</strong>; (3) Exhibits A and B were previously executed during Section 3 and remain binding under this MSA package by incorporation; (4) your electronic acceptance below has the same legal effect as a handwritten signature applied to each of the three new documents; and (5) you may withdraw consent by contacting Dyad in writing, though withdrawal will not affect agreements already executed.
              </div>
              <label className={`ob-ca-fsig-cb${formData.msaPackageAgreed ? ' ob-ca-fsig-cb-checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={formData.msaPackageAgreed}
                  disabled={!formData.step5MsaAttested || !formData.step5ExhibitCAttested || !formData.step5FeeScheduleAttested || formData.msaPackageExecuted}
                  onChange={e => set('msaPackageAgreed', e.target.checked)}
                />
                <span>I agree to be bound by the MSA, Exhibit C, and Fee Schedule via this unified electronic signature.</span>
              </label>
              {formData.msaPackageExecuted && formData.msaPackageExecutedAt && (
                <div className="ob-agreement-cwts ob-agreement-cwts-visible">
                  ✅ Package executed {formData.msaPackageExecutedAt}
                </div>
              )}
              <div className="ob-ca-fsig-cta">
                <button
                  type="button"
                  className={`ob-ca-fsig-btn${formData.msaPackageExecuted ? ' ob-ca-fsig-btn-exec' : ''}`}
                  disabled={
                    !formData.msaPackageAgreed
                    || !hasProviderSignature
                    || formData.msaPackageExecuted
                  }
                  onClick={handleUnifiedExecute}
                >
                  {formData.msaPackageExecuted ? (
                    'Package Executed'
                  ) : (
                    <ObForwardButtonLabel label="Execute Packages" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="ob-info-banner">
            <ShieldCheck size={28} className="ob-info-banner-icon" aria-hidden />
            <div>
              <strong>Your agreements are secure</strong>
              <p>Executed copies are stored with tamper-evident audit trails and remain available for print. All data is encrypted in transit and at rest, and the executed package is delivered to the email address verified during Section 3.</p>
            </div>
          </div>
        </div>
      )}

      <div className="ob-step-bottom-zone">
        <EnrollmentSaveNotice />
        <div className="ob-step-footer ob-step-nav ob-step4-nav">
          <button type="button" className="ob-btn-secondary" onClick={onBack} disabled={isSubmitting}>
            <ObBackButtonLabel />
          </button>
          <button
            type="button"
            className={`ob-btn-primary${(!canProceed && formData.commercialDecision === 'accept') ? ' ob-btn-disabled' : ''}`}
            onClick={handleSubmit}
            disabled={(formData.commercialDecision === 'accept' && !canProceed) || isSubmitting || !formData.commercialDecision}
          >
            <ObForwardButtonLabel label={nextBtnLabel} loading={isSubmitting} loadingLabel="Submitting…" />
          </button>
        </div>
      </div>
    </div>
  );
};

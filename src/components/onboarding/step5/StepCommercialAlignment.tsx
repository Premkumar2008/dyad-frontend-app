import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronDown, ChevronUp, Clock, FileText, ShieldCheck, Users,
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

export const StepCommercialAlignment: React.FC<StepCommercialAlignmentProps> = ({
  formData, set, onNext, onBack, isSubmitting, practiceTypeTitle, specialtyTitle, showSpecialtyPlatform,
}) => {
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [tierDetailOpen, setTierDetailOpen] = useState(false);
  const [showMsaPackage, setShowMsaPackage] = useState(formData.commercialDecision === 'accept');

  const [msaFields, setMsaFields] = useState(() => ({ ...emptyMsaFields(), ...formData.msaFields }));
  const [exhibitCFields, setExhibitCFields] = useState(() => ({ pentity: '', edate: '', ...formData.exhibitCFields }));
  const [feeFields, setFeeFields] = useState(() => ({ pentity: '', edate: '', ...formData.feeScheduleFields }));

  const [sectionStatus, setSectionStatus] = useState<Record<MsaSectionId, SectionStatus>>(() => {
    if (formData.msaPackageExecuted) {
      return { A: 'completed', B: 'completed', C: 'completed', D: 'completed', E: 'completed', F: 'completed' };
    }
    if (formData.step5FeeScheduleAttested) return { A: 'completed', B: 'completed', C: 'completed', D: 'completed', E: 'completed', F: 'completed' };
    if (formData.step5ExhibitCAttested) return { A: 'completed', B: 'completed', C: 'completed', D: 'completed', E: 'completed', F: 'active' };
    if (formData.step5MsaAttested) return { A: 'completed', B: 'completed', C: 'active', D: 'locked', E: 'locked', F: 'locked' };
    if (formData.step5EntityComplete) return { A: 'completed', B: 'active', C: 'locked', D: 'locked', E: 'locked', F: 'locked' };
    return { A: 'active', B: 'locked', C: 'locked', D: 'locked', E: 'locked', F: 'locked' };
  });

  const [openMsaSections, setOpenMsaSections] = useState<Record<MsaSectionId, boolean>>({
    A: !formData.step5EntityComplete,
    B: formData.step5EntityComplete && !formData.step5MsaAttested,
    C: false, D: false, E: false, F: false,
  });

  const proposalValidThrough = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  const practiceName = formData.organizationName || formData.entityLegalName || formData.groupLegalName;
  const providerCount = formData.billableProviders || formData.providerCount || '—';
  const grossCollections = formData.annualGrossCollections || '—';
  const signerFullName = `${formData.signerFirstName || formData.firstName} ${formData.signerLastName || formData.lastName}`.trim();

  const syncAgreementFields = useCallback(() => {
    const name = formData.entityLegalName || formData.groupLegalName;
    const etype = formData.entityType;
    const estate = formData.entityFormationState || formData.state;
    const addr = formData.entityStreet
      ? `${formData.entityStreet}, ${formData.entityCity}, ${formData.entityAddrState || formData.state} ${formData.entityZip || formData.zip}`
      : `${formData.practiceAddress}, ${formData.city}, ${formData.state} ${formData.zip}`;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const base = { pentity: name, ptype: etype, pstate: estate, paddr: addr, edate: today };
    setMsaFields(prev => ({ ...prev, ...base, ...formData.msaFields }));
    setExhibitCFields(prev => ({ ...prev, pentity: name, edate: today, ...formData.exhibitCFields }));
    setFeeFields(prev => ({ ...prev, pentity: name, edate: today, ...formData.feeScheduleFields }));
  }, [formData]);

  useEffect(() => { syncAgreementFields(); }, [syncAgreementFields]);
  useEffect(() => { set('msaFields', msaFields); }, [msaFields, set]);
  useEffect(() => { set('exhibitCFields', exhibitCFields); }, [exhibitCFields, set]);
  useEffect(() => { set('feeScheduleFields', feeFields); }, [feeFields, set]);

  const msaSectionsComplete = MSA_SECTION_ORDER.filter(s => sectionStatus[s] === 'completed').length;
  const msaProgressPct = Math.round((msaSectionsComplete / MSA_SECTION_ORDER.length) * 100);

  const completeMsaSection = (id: MsaSectionId) => {
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
      set(metaKey as keyof OnboardingData, `✓ Attested ${at} — Record ID: ${recordId}` as never);
    } else {
      set(recordKey as keyof OnboardingData, '' as never);
      set(metaKey as keyof OnboardingData, '' as never);
    }
  };

  const handleEntityContinue = () => {
    if (!formData.entityLegalName.trim()) {
      toast.error('Please confirm entity information');
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
            {status === 'completed' ? (id === 'C' || id === 'D' ? 'Carried forward — already executed ✓' : 'Attested ✓')
              : status === 'active' ? 'In progress — complete to continue'
                : `Complete Section ${MSA_SECTION_ORDER[MSA_SECTION_ORDER.indexOf(id) - 1] || 'A'} to unlock`}
          </span>
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
    );
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
              <div className="ob-ca-eng-desc">Every stage operates within a single digital infrastructure.</div>
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
          <div className="ob-ca-fee-focal-amount">—</div>
          <div className="ob-ca-fee-focal-basis">Determined by claims volume tier and reported gross collections</div>
        </div>

        <div className="ob-ca-section-static">
          <div className="ob-ca-section-label">Volume &amp; Rate Structure</div>
          <div className="ob-ca-tier-row">
            <div className="ob-ca-tier-left">
              Claims Volume Tier <InfoTooltip text="Your tier is determined by average monthly claim volume. Each tier carries a defined minimum monthly fee." />
            </div>
            <div className="ob-ca-tier-right">
              <div className="ob-ca-tier-badge">Tier 2 <span>201–500 claims / month</span></div>
              <button type="button" className="ob-ca-tier-toggle" onClick={() => setTierDetailOpen(v => !v)}>
                View all tiers {tierDetailOpen ? '▴' : '▾'}
              </button>
            </div>
          </div>
          {tierDetailOpen && (
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
            <div className="ob-ca-d-next">→ Proceed to Master Services Agreement, Account Authorizations &amp; Bank Setup</div>
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

        <label className={`ob-ca-d-opt${formData.commercialDecision === 'decline' ? ' ob-ca-d-opt-decline' : ''}`}>
          <input type="radio" name="commercial-dec" checked={formData.commercialDecision === 'decline'} onChange={() => handleDecision('decline')} disabled={!decisionEnabled} />
          <div>
            <div className="ob-ca-d-label">Decline at This Time</div>
            <div className="ob-ca-d-desc">This is not the right fit for our organization at this time.</div>
          </div>
        </label>
        {formData.commercialDecision === 'decline' && (
          <div className="ob-ca-decline-panel">
            <p>Thank you for exploring a partnership with Dyad Practice Solutions.</p>
            <div className="ob-ca-decline-remind">
              <strong>Confidentiality reminder.</strong> Exhibits A and B executed during enrollment remain in full force and effect.
            </div>
            <p className="ob-ca-decline-archive">Your application will be archived for <strong>14 business days</strong>.</p>
          </div>
        )}
      </div>

      {/* MSA Package */}
      {showMsaPackage && (
        <div id="ob-step5-msa-package" className="ob-step5-msa-package">
          <h2 className="ob-step-title" style={{ fontSize: '1.35rem' }}>Master Services Agreement &amp; Exhibits</h2>
          <p className="ob-step-subtitle">
            Review the MSA and Exhibits, complete attestations for each document, and apply a single electronic signature to execute the package.
          </p>
          <div className="ob-step-sections-bar">
            <EnrollmentSectionsBarRow
              progressPct={msaProgressPct}
              sectionsComplete={msaSectionsComplete}
              totalSections={MSA_SECTION_ORDER.length}
            />
          </div>

          {/* A Entity */}
          <div id="ob-step5-msa-A" className={`ob-step5-msa-card${openMsaSections.A ? ' ob-step5-msa-open' : ''}`}>
            {renderMsaHeader('A', 'Entity & Authorized Signer Information')}
            {openMsaSections.A && sectionStatus.A !== 'locked' && (
              <div className="ob-step5-msa-body">
                <div className="ob-callout ob-callout-info" style={{ background: '#e8f5e9', borderLeftColor: '#2e7d32', color: '#1b5e20' }}>
                  <strong>✓ Carried forward from Section 3</strong> — Entity details and authorized signer were email-verified during Exhibits A and B.
                </div>
                <div className="ob-form-row">
                  <div className="ob-field">
                    <label className="ob-label">Legal Entity Name</label>
                    <input className="ob-input" value={formData.entityLegalName} onChange={e => set('entityLegalName', e.target.value)} />
                  </div>
                  <div className="ob-field">
                    <label className="ob-label">Entity Type</label>
                    <input className="ob-input" value={formData.entityType} onChange={e => set('entityType', e.target.value)} />
                  </div>
                </div>
                <div className="ob-form-row">
                  <div className="ob-field">
                    <label className="ob-label">Authorized Signer</label>
                    <input className="ob-input ob-input-readonly" readOnly value={signerFullName} />
                  </div>
                  <div className="ob-field">
                    <label className="ob-label">Email (verified)</label>
                    <input className="ob-input ob-input-readonly" readOnly value={formData.signerEmail || formData.contactEmail} />
                  </div>
                </div>
                <div className="ob-agreement-sc2">
                  <button type="button" className="ob-agreement-bc2" onClick={handleEntityContinue}>
                    {trimBtnArrow('Continue to Master Services Agreement')} <ObArrowRight />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* B MSA */}
          <div id="ob-step5-msa-B" className={`ob-step5-msa-card${openMsaSections.B ? ' ob-step5-msa-open' : ''}`}>
            {renderMsaHeader('B', 'Master Services Agreement')}
            {openMsaSections.B && sectionStatus.B !== 'locked' && (
              <div className="ob-step5-msa-body">
                <MsaDocShell
                  docId="msa" title="Master Services Agreement" scrollId="msa-scroll"
                  executed={formData.msaPackageExecuted}
                  attested={formData.step5MsaAttested}
                  attestedMeta={formData.msaAttestMeta || null}
                  onAttestChange={c => attestDoc('step5MsaAttested', c, 'msaAttestMeta', 'msaAttestRecordId')}
                  attestLabel="I have reviewed the Master Services Agreement in full and confirm that I understand and agree to its terms, including incorporation of Exhibits A–D."
                  continueLabel="Continue to Exhibit A (carried forward) →"
                  onContinue={() => { if (formData.step5MsaAttested) completeMsaSection('B'); else toast.error('Please attest to the MSA'); }}
                  continueDisabled={!formData.step5MsaAttested}
                  downloadFilename="Master_Services_Agreement.txt"
                >
                  <MsaAgreementBody fields={msaFields} onFieldChange={(k, v) => setMsaFields(p => ({ ...p, [k]: v }))} />
                </MsaDocShell>
              </div>
            )}
          </div>

          {/* C Exhibit A carried */}
          <div id="ob-step5-msa-C" className={`ob-step5-msa-card ob-step5-msa-carr${openMsaSections.C ? ' ob-step5-msa-open' : ''}`}>
            {renderMsaHeader('C', 'Exhibit A — Confidentiality Agreement', <span className="ob-ca-cfbadge">✓ Carried Forward</span>)}
            {openMsaSections.C && sectionStatus.C === 'active' && (
              <div className="ob-step5-msa-body">
                <div className="ob-ca-crribbon">
                  <div className="ob-ca-crribbon-icon">✓</div>
                  <div>
                    <div className="ob-ca-crribbon-title">Already Executed in Section 3</div>
                    <div className="ob-ca-crribbon-desc">Exhibit A is included for reference and remains binding under this MSA package.</div>
                    <div className="ob-ca-crribbon-meta">Record ID: {formData.ndaAcceptedRecordId || '—'}</div>
                  </div>
                </div>
                <div className="ob-agreement-ao">
                  <div className="ob-agreement-asw">
                    <CarriedForwardExhibit exhibit="A" entityName={formData.entityLegalName} signerName={signerFullName} signerTitle={formData.signerTitle || formData.titleRole} recordId={formData.ndaAcceptedRecordId} acceptedAt={formData.ndaAcceptedAt} showDyadSignature={formData.confidentialityAgreed} ndaFields={formData.ndaFields} />
                  </div>
                </div>
                <div className="ob-ca-dat ob-ca-dat-checked">
                  <label className="ob-ca-dat-label">
                    <input type="checkbox" checked disabled />
                    <div>
                      <div className="ob-ca-dat-text">Exhibit A attestation from Section 3 is carried forward and remains binding.</div>
                      {formData.ndaAcceptedAt && <div className="ob-ca-dat-meta">✓ {formData.ndaAcceptedAt} — Record ID: {formData.ndaAcceptedRecordId}</div>}
                    </div>
                  </label>
                </div>
                <div className="ob-agreement-sc2">
                  <button type="button" className="ob-agreement-bc2" onClick={() => completeMsaSection('C')}>
                    {trimBtnArrow('Continue to Exhibit B (carried forward)')} <ObArrowRight />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* D Exhibit B carried */}
          <div id="ob-step5-msa-D" className={`ob-step5-msa-card ob-step5-msa-carr${openMsaSections.D ? ' ob-step5-msa-open' : ''}`}>
            {renderMsaHeader('D', 'Exhibit B — Business Associate Agreement', <span className="ob-ca-cfbadge">✓ Carried Forward</span>)}
            {openMsaSections.D && sectionStatus.D !== 'locked' && (
              <div className="ob-step5-msa-body">
                <div className="ob-ca-crribbon">
                  <div className="ob-ca-crribbon-icon">✓</div>
                  <div>
                    <div className="ob-ca-crribbon-title">Already Executed in Section 3</div>
                    <div className="ob-ca-crribbon-desc">Exhibit B governs HIPAA-compliant PHI handling and is incorporated by reference.</div>
                    <div className="ob-ca-crribbon-meta">Record ID: {formData.baaAcceptedRecordId || '—'}</div>
                  </div>
                </div>
                <div className="ob-agreement-ao">
                  <div className="ob-agreement-asw">
                    <CarriedForwardExhibit exhibit="B" entityName={formData.entityLegalName} signerName={signerFullName} signerTitle={formData.signerTitle || formData.titleRole} recordId={formData.baaAcceptedRecordId} acceptedAt={formData.baaAcceptedAt} showDyadSignature={formData.baaAgreed} />
                  </div>
                </div>
                <div className="ob-ca-dat ob-ca-dat-checked">
                  <label className="ob-ca-dat-label">
                    <input type="checkbox" checked disabled />
                    <div>
                      <div className="ob-ca-dat-text">Exhibit B attestation from Section 3 is carried forward and remains binding.</div>
                      {formData.baaAcceptedAt && <div className="ob-ca-dat-meta">✓ {formData.baaAcceptedAt} — Record ID: {formData.baaAcceptedRecordId}</div>}
                    </div>
                  </label>
                </div>
                <div className="ob-agreement-sc2">
                  <button type="button" className="ob-agreement-bc2" onClick={() => completeMsaSection('D')}>
                    {trimBtnArrow('Continue to Exhibit C')} <ObArrowRight />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* E Exhibit C */}
          <div id="ob-step5-msa-E" className={`ob-step5-msa-card${openMsaSections.E ? ' ob-step5-msa-open' : ''}`}>
            {renderMsaHeader('E', 'Exhibit C — Scope of Services')}
            {openMsaSections.E && sectionStatus.E !== 'locked' && (
              <div className="ob-step5-msa-body">
                <MsaDocShell
                  docId="exc" title="Exhibit C — Scope of Services" scrollId="exc-scroll"
                  executed={formData.msaPackageExecuted}
                  attested={formData.step5ExhibitCAttested}
                  attestedMeta={formData.exhibitCAttestMeta || null}
                  onAttestChange={c => attestDoc('step5ExhibitCAttested', c, 'exhibitCAttestMeta', 'exhibitCAttestRecordId')}
                  attestLabel="I have reviewed Exhibit C and confirm the services described match the Commercial Alignment package."
                  continueLabel="Continue to Fee Schedule →"
                  onContinue={() => { if (formData.step5ExhibitCAttested) completeMsaSection('E'); else toast.error('Please attest to Exhibit C'); }}
                  continueDisabled={!formData.step5ExhibitCAttested}
                  downloadFilename="Exhibit_C_Scope_of_Services.txt"
                >
                  <ExhibitCBody fields={exhibitCFields} onFieldChange={(k, v) => setExhibitCFields(p => ({ ...p, [k]: v }))} />
                </MsaDocShell>
              </div>
            )}
          </div>

          {/* F Fee Schedule */}
          <div id="ob-step5-msa-F" className={`ob-step5-msa-card${openMsaSections.F ? ' ob-step5-msa-open' : ''}`}>
            {renderMsaHeader('F', 'Fee Schedule')}
            {openMsaSections.F && sectionStatus.F !== 'locked' && (
              <div className="ob-step5-msa-body">
                <MsaDocShell
                  docId="exd" title="Fee Schedule" scrollId="exd-scroll"
                  executed={formData.msaPackageExecuted}
                  attested={formData.step5FeeScheduleAttested}
                  attestedMeta={formData.feeScheduleAttestMeta || null}
                  onAttestChange={c => attestDoc('step5FeeScheduleAttested', c, 'feeScheduleAttestMeta', 'feeScheduleAttestRecordId')}
                  attestLabel="I have reviewed the Fee Schedule and confirm rates, minimums, tiers, and onboarding fee match the commercial package."
                  continueLabel="Continue to Final Signature →"
                  onContinue={() => { if (formData.step5FeeScheduleAttested) completeMsaSection('F'); else toast.error('Please attest to the Fee Schedule'); }}
                  continueDisabled={!formData.step5FeeScheduleAttested}
                  downloadFilename="Fee_Schedule.txt"
                >
                  <FeeScheduleBody fields={feeFields} onFieldChange={(k, v) => setFeeFields(p => ({ ...p, [k]: v }))} />
                </MsaDocShell>
              </div>
            )}
          </div>

          {/* Unified signature */}
          <div id="ob-step5-final-sig" className="ob-ca-fsig">
            <div className="ob-ca-fsig-banner">
              <span className="ob-ca-fsig-banner-icon">✍️</span>
              <div>
                <div className="ob-ca-fsig-banner-title">Unified Electronic Signature — Master Services Agreement Package</div>
                <div className="ob-ca-fsig-banner-sub">A single signature executes the MSA, Exhibit C, and Fee Schedule. Exhibits A and B remain in effect from Section 3.</div>
              </div>
            </div>
            <div className={`ob-ca-fsig-status${formData.msaPackageExecuted ? ' ob-ca-fsig-status-exec' : ''}`}>
              {formData.msaPackageExecuted
                ? <><strong>Package fully executed.</strong> All three new documents are now binding.</>
                : 'Complete all attestations above to enable execution.'}
            </div>
            <div className="ob-ca-fsig-scope">
              <div className="ob-ca-fsig-scope-title">Documents to be Executed by This Signature</div>
              {[
                { id: 'msa', label: 'Master Services Agreement', done: formData.step5MsaAttested || formData.msaPackageExecuted },
                { id: 'exa', label: 'Exhibit A — Confidentiality Agreement', carr: true },
                { id: 'exb', label: 'Exhibit B — Business Associate Agreement', carr: true },
                { id: 'exc', label: 'Exhibit C — Scope of Services', done: formData.step5ExhibitCAttested || formData.msaPackageExecuted },
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
                    <td>
                      <div className="ob-agreement-sigp">Provider: {formData.entityLegalName}</div>
                      <div className="ob-agreement-sigl" style={formData.msaPackageExecuted ? { borderBottomColor: '#2e7d32' } : undefined}>
                        {formData.msaPackageExecuted && <span className="ob-ca-sig-cursive">{signerFullName}</span>}
                      </div>
                      <div className="ob-agreement-sign">Name: {signerFullName}</div>
                      <div className="ob-agreement-sign">Title: {formData.signerTitle || formData.titleRole}</div>
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
                <strong>Electronic Signature Disclosure</strong> — By checking below, you consent to electronic signatures pursuant to the ESIGN Act and UETA. You have the legal authority to bind {formData.entityLegalName}.
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
                  ✅ Package executed {formData.msaPackageExecutedAt} · Record ID: {formData.msaPackageRecordId}
                </div>
              )}
              <div className="ob-ca-fsig-cta">
                <button
                  type="button"
                  className={`ob-ca-fsig-btn${formData.msaPackageExecuted ? ' ob-ca-fsig-btn-exec' : ''}`}
                  disabled={!formData.msaPackageAgreed || formData.msaPackageExecuted}
                  onClick={handleUnifiedExecute}
                >
                  {formData.msaPackageExecuted ? (
                    'Package Executed'
                  ) : (
                    <ObForwardButtonLabel label="Apply Unified Signature" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="ob-info-banner">
            <ShieldCheck size={28} className="ob-info-banner-icon" aria-hidden />
            <div>
              <strong>Your agreements are secure</strong>
              <p>Executed copies are stored with tamper-evident audit trails and remain available for download.</p>
            </div>
          </div>
        </div>
      )}

      <div className="ob-step-bottom-zone">
        <EnrollmentSaveNotice />
        <div className="ob-step-nav ob-step4-nav">
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

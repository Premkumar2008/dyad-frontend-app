import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope, Scissors, Activity, Building2,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Clock, AlertCircle,
  CheckCircle2, Calendar, FileText, CreditCard,
  ArrowRight, ArrowLeft, Eye, EyeOff,
  Phone, Mail, User, MapPin, Hash, DollarSign,
  Landmark, Check, Zap, Save, ShieldCheck, BarChart3, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import {
  fetchAvailableDates,
  fetchAvailableTimeSlots,
  bookIntroductionCall,
  buildScheduleCalendarMonths,
  SCHEDULE_DAYS_AHEAD,
} from '../services/onboardingCalendarService';
import {
  type NpiApiData,
  buildPrefillFromNpiData,
  clearNpiDerivedFields,
  formatNpiLookupError,
  lookupNpiRegistry,
  resetAllowedTaxonomiesCache,
} from '../services/npiRegistryService';
import { formatDateForDisplay, formatTimeForDisplay } from '../utils/dateTimeUtils';
import './DyadOnboarding.css';

// ─── Types ──────────────────────────────────────────────────────────────────

interface OnboardingData {
  // Step 1
  npi: string;
  npiConfirmed: boolean;
  npiEnumerationType: string;
  npiApiData: NpiApiData | null;
  practiceType: string;
  confirmedPracticeType: string;
  sectionAContinued: boolean;
  enrollmentPathwayViewed: boolean;
  // Step 2 — Schedule Introduction Call
  firstName: string;
  lastName: string;
  titleRole: string;
  organizationName: string;
  contactEmail: string;
  contactPhone: string;
  primarySpecialty: string;
  selectedStates: string[];
  organizationType: string;
  step2ContactContinued: boolean;
  billableProviders: string;
  locationsFacilities: string;
  step2OrgContinued: boolean;
  step2FootprintContinued: boolean;
  calendlyScheduled: boolean;
  step2ScheduleContinued: boolean;
  engagementTimeline: string;
  step2PrepareComplete: boolean;
  callDate: string;
  callTime: string;
  callerName: string;
  callerEmail: string;
  callerPhone: string;
  // Step 3
  confidentialityAgreed: boolean;
  baaAgreed: boolean;
  baaSignature: string;
  // Step 4
  groupLegalName: string;
  taxId: string;
  providerCount: string;
  practiceAddress: string;
  city: string;
  state: string;
  zip: string;
  website: string;
  // Step 5
  estimatedMonthlyClaims: string;
  primaryPayerMix: string;
  msaAgreed: boolean;
  msaSignature: string;
  contractStartDate: string;
  // Step 6
  accountHolderName: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: string;
}

const INITIAL_DATA: OnboardingData = {
  npi: '',
  npiConfirmed: false,
  npiEnumerationType: '',
  npiApiData: null,
  practiceType: '',
  confirmedPracticeType: '',
  sectionAContinued: false,
  enrollmentPathwayViewed: false,
  firstName: '',
  lastName: '',
  titleRole: '',
  organizationName: '',
  contactEmail: '',
  contactPhone: '',
  primarySpecialty: '',
  selectedStates: [],
  organizationType: '',
  step2ContactContinued: false,
  billableProviders: '',
  locationsFacilities: '',
  step2OrgContinued: false,
  step2FootprintContinued: false,
  calendlyScheduled: false,
  step2ScheduleContinued: false,
  engagementTimeline: '',
  step2PrepareComplete: false,
  callDate: '',
  callTime: '',
  callerName: '',
  callerEmail: '',
  callerPhone: '',
  confidentialityAgreed: false,
  baaAgreed: false,
  baaSignature: '',
  groupLegalName: '',
  taxId: '',
  providerCount: '',
  practiceAddress: '',
  city: '',
  state: '',
  zip: '',
  website: '',
  estimatedMonthlyClaims: '',
  primaryPayerMix: '',
  msaAgreed: false,
  msaSignature: '',
  contractStartDate: '',
  accountHolderName: '',
  bankName: '',
  routingNumber: '',
  accountNumber: '',
  accountType: '',
};

const STORAGE_KEY = 'dyad_onboarding_v1';
const STEP_KEY = 'dyad_onboarding_step_v1';

// ─── Constants ───────────────────────────────────────────────────────────────

const PRACTICE_TYPES = [
  {
    id: 'anesthesiology',
    Icon: Stethoscope,
    title: 'Anesthesiology',
    desc: 'Single or multi-provider anesthesia groups serving hospitals, ASCs, or office-based settings',
  },
  {
    id: 'surgical',
    Icon: Scissors,
    title: 'Surgical Specialty',
    desc: 'General surgery, orthopedics, ENT, ophthalmology, urology, or other procedural specialties',
  },
  {
    id: 'pain',
    Icon: Activity,
    title: 'Pain Medicine',
    desc: 'Interventional pain management, chronic pain clinics, or pain-focused practices',
  },
  {
    id: 'asc',
    Icon: Building2,
    title: 'ASC Facility',
    desc: 'Hospital-affiliated, joint venture, or freestanding ambulatory surgical centers',
  },
];

const SIDEBAR_STEPS = [
  { id: 1, label: 'Overview' },
  { id: 2, label: 'Schedule Intro Call' },
  { id: 3, label: 'Sign Confidentiality & BAA' },
  { id: 4, label: 'Due Diligence & Discovery' },
  { id: 5, label: 'Commercial Alignment & MSA' },
  { id: 6, label: 'Bank & Payment Setup' },
];

const PHASES = [
  'Welcome',
  'Intro Call',
  'Privacy Setup',
  'Discovery',
  'Align on Terms',
  'Enrollment Complete',
];

const PATHWAY_STEPS = [
  {
    num: 1,
    Icon: Phone,
    title: 'Discovery Call',
    desc: 'Schedule a 30-minute introduction call to discuss your practice and next steps',
    time: '~30 min',
  },
  {
    num: 2,
    Icon: ShieldCheck,
    title: 'Secure Foundation',
    desc: 'Digital execution of confidentiality and HIPAA Business Associate agreements',
    time: '~5 min',
  },
  {
    num: 3,
    Icon: BarChart3,
    title: 'Practice Analytics',
    desc: 'Upload practice metrics and key documents for comprehensive revenue cycle analysis conducted by our expert data analysts',
    time: '~15 min',
  },
  {
    num: 4,
    Icon: Briefcase,
    title: 'Commercial Alignment',
    desc: 'Review your personalized service proposal, fee structure, and KPI targets',
    time: '~30 min',
  },
  {
    num: 5,
    Icon: FileText,
    title: 'Master Services Agreement',
    desc: 'Review and execute the MSA, compliance documentation, and service-level commitments',
    time: '~30 min',
  },
  {
    num: 6,
    Icon: Landmark,
    title: 'Bank Account & Payment Setup',
    desc: 'Complete banking setup and payment authorizations to activate your account',
    time: '~15 min',
  },
];

const US_STATE_NAMES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
  'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const PRIMARY_SPECIALTIES = [
  'Anesthesiology',
  'General Surgery',
  'Orthopedics',
  'ENT / Otolaryngology',
  'Ophthalmology',
  'Urology',
  'Pain Medicine / Interventional Pain',
  'Gastroenterology',
  'Cardiology',
  'Ambulatory Surgery Center (ASC)',
  'Multi-Specialty Group',
  'Other',
];

const PROVIDER_COUNT_OPTIONS = [
  { value: '1', label: '1 provider — Solo provider' },
  { value: '2-10', label: '2–10 providers — Small group' },
  { value: '11-49', label: '11–49 providers — Mid-sized group' },
  { value: '50-99', label: '50–99 providers — Large group or regional platform' },
  { value: '100-499', label: '100–499 providers — Enterprise group or specialty platform' },
  { value: '500+', label: '500+ providers — National platform or integrated enterprise' },
  { value: 'unsure', label: 'Not sure — Dyad can help determine this during intake' },
];

const LOCATION_COUNT_OPTIONS = [
  { value: '1', label: '1 location or facility — Single-site practice' },
  { value: '2-5', label: '2–5 locations — Small multi-site group' },
  { value: '6-10', label: '6–10 locations — Regional footprint' },
  { value: '11-25', label: '11–25 locations — Large regional group or platform' },
  { value: '26-50', label: '26–50 locations — Multi-market platform or portfolio' },
  { value: '51+', label: '51+ locations — National platform or enterprise' },
  { value: 'unsure', label: 'Not sure — Dyad can help determine this during intake' },
];

const ENGAGEMENT_TIMELINES = [
  { value: 'immediate', label: 'Immediate need and are ready to move forward' },
  { value: '30days', label: 'Evaluating options and plan to engage within 30 days' },
  { value: '60-90', label: 'Planning a transition and expect to begin within 60–90 days' },
  { value: 'exploratory', label: 'Early research phase with no specific timeline' },
];

const ORG_PROFILE_TYPES = [
  { id: 'solo', title: 'Independent solo provider', desc: 'One independently operating provider' },
  { id: 'provider-group', title: 'Independent provider-owned group', desc: 'Provider-owned practice with multiple clinicians' },
  { id: 'asc', title: 'Ambulatory surgery center (ASC)', desc: 'Single or multi-site ambulatory surgical facility, independently owned or affiliated with a larger organization' },
  { id: 'mso', title: 'Management Services Organization', desc: 'Supports one or more practices or facilities through administrative, revenue cycle, technology, or operational services' },
  { id: 'pe-platform', title: 'Private equity-backed platform or portfolio', desc: 'Supports multiple providers, practices, facilities, or affiliated entities through an investor-backed platform' },
  { id: 'specialty-group', title: 'Regional or national specialty group', desc: 'Specialty-focused organization serving multiple locations, facilities, or markets' },
  { id: 'hospital-system', title: 'Hospital, health system, or integrated care organization', desc: 'Affiliated with a hospital, health system, payer-provider model, or integrated delivery network' },
  { id: 'other', title: 'Other / not sure', desc: 'Select this if the organization does not clearly fit one of the categories above' },
];

const STEP2_PREP_ITEMS = [
  'A general overview of your practice — number of providers, primary specialty, and patient volume',
  'Key challenges or goals you\'d like Dyad to address (collections, denials, credentialing, compliance, etc.)',
  'Names of any practice management or EHR systems currently in use',
  'Any relevant contracts or agreements that may be in transition (billing vendors, payer contracts, etc.)',
];

const getPhaseFromStep = (
  step: number,
  sectionAComplete = false,
  sectionBComplete = false,
) => {
  if (step === 1) {
    if (sectionAComplete && sectionBComplete) return 1;
    return 0;
  }
  return Math.min(step - 1, PHASES.length - 1);
};

const getProgressPct = (step: number, sectionAComplete: boolean, sectionBComplete: boolean) => {
  if (step === 1) {
    if (sectionAComplete && sectionBComplete) {
      return Math.round((1 / PHASES.length) * 100);
    }
    if (sectionAComplete) {
      return Math.round((0.5 / PHASES.length) * 100);
    }
    return 0;
  }
  return Math.round(((step - 1) / (PHASES.length - 1)) * 100);
};

const getStep2SectionsComplete = (data: OnboardingData) =>
  (data.step2ContactContinued ? 1 : 0)
  + (data.step2OrgContinued ? 1 : 0)
  + (data.step2FootprintContinued ? 1 : 0)
  + (data.step2ScheduleContinued ? 1 : 0)
  + (data.step2PrepareComplete ? 1 : 0);

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = (v: string) => v.replace(/\D/g, '').length >= 10;

const getOverviewSectionsComplete = (sectionAComplete: boolean, sectionBComplete: boolean) =>
  (sectionAComplete ? 1 : 0) + (sectionBComplete ? 1 : 0);

// ─── Progress Card ───────────────────────────────────────────────────────────

interface EnrollmentSectionsBarRowProps {
  progressPct: number;
  sectionsComplete: number;
  totalSections: number;
}

const EnrollmentSectionsBarRow: React.FC<EnrollmentSectionsBarRowProps> = ({
  progressPct, sectionsComplete, totalSections,
}) => (
  <div className="ob-ph-bar-row">
    <span className="ob-ph-bar-text">{sectionsComplete} of {totalSections} sections complete</span>
    <div className="ob-ph-track">
      <div className="ob-ph-fill" style={{ width: `${progressPct}%` }} />
    </div>
    <span className="ob-ph-bar-pct">{progressPct}%</span>
  </div>
);

const getEnrollmentPhasesComplete = (
  step: number,
  sectionAComplete: boolean,
  sectionBComplete: boolean,
) => {
  if (step > 1) return step - 1;
  if (sectionAComplete && sectionBComplete) return 1;
  return 0;
};

const getPhaseConnectorFillPct = (completedPhases: number, totalPhases: number) =>
  totalPhases > 1 ? (completedPhases / (totalPhases - 1)) * 100 : 0;

interface EnrollmentProgressCardProps {
  progressPct: number;
  phaseIdx: number;
  sectionsComplete: number;
  totalSections: number;
  className?: string;
  showBarRow?: boolean;
}

const EnrollmentProgressCard: React.FC<EnrollmentProgressCardProps> = ({
  progressPct, phaseIdx, sectionsComplete, totalSections, className = '', showBarRow = true,
}) => {
  const connectorFillPct = getPhaseConnectorFillPct(sectionsComplete, totalSections);

  return (
  <div className={`ob-progress-card${className ? ` ${className}` : ''}`}>
    <div className="ob-ph-top">
      <span className="ob-ph-label">ENROLLMENT PROGRESS</span>
    </div>

    <div className="ob-phases">
      <div className="ob-phases-connector" aria-hidden="true">
        <div className="ob-phases-connector-bg" />
        <div
          className="ob-phases-connector-fill"
          style={{ width: `${connectorFillPct}%` }}
        />
      </div>
      {PHASES.map((ph, i) => (
        <div
          key={ph}
          className={`ob-phase-step${i < sectionsComplete ? ' ob-phase-done' : ''}${i === phaseIdx ? ' ob-phase-active' : ''}`}
        >
          <div className="ob-phase-dot">
            {i < sectionsComplete
              ? <Check size={10} strokeWidth={3} />
              : <span className="ob-phase-dot-inner" />}
          </div>
          <span className="ob-phase-name">{ph}</span>
        </div>
      ))}
    </div>

    {showBarRow && (
      <EnrollmentSectionsBarRow
        progressPct={progressPct}
        sectionsComplete={sectionsComplete}
        totalSections={totalSections}
      />
    )}
  </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const DyadOnboarding: React.FC = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(() => {
    try { return parseInt(localStorage.getItem(STEP_KEY) || '1', 10) || 1; } catch { return 1; }
  });

  const [formData, setFormData] = useState<OnboardingData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return INITIAL_DATA;
      const parsed = { ...INITIAL_DATA, ...JSON.parse(raw) };
      if (!parsed.sectionAContinued) {
        parsed.enrollmentPathwayViewed = false;
      }
      if (!Array.isArray(parsed.selectedStates)) {
        parsed.selectedStates = [];
      }
      if (typeof parsed.npiConfirmed !== 'boolean') {
        parsed.npiConfirmed = false;
      }
      if (!parsed.npiApiData) {
        parsed.npiApiData = null;
      }
      if (parsed.sectionAContinued && parsed.practiceType && !parsed.confirmedPracticeType) {
        parsed.confirmedPracticeType = parsed.practiceType;
      }
      return parsed;
    } catch { return INITIAL_DATA; }
  });

  const [sectionAOpen, setSectionAOpen] = useState(() => !formData.sectionAContinued);
  const [sectionBOpen, setSectionBOpen] = useState(
    () => formData.sectionAContinued && !formData.enrollmentPathwayViewed
  );
  const [savedBadge, setSavedBadge] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAccNum, setShowAccNum] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialSave = useRef(true);

  const sectionAUnlocked = formData.npiConfirmed && !!formData.practiceType;
  const sectionAComplete = formData.sectionAContinued;
  const sectionBComplete = formData.enrollmentPathwayViewed;
  const canBeginEnrollment = sectionAComplete && sectionBComplete;
  const overviewSectionsComplete = getOverviewSectionsComplete(sectionAComplete, sectionBComplete);
  const progressPct = getProgressPct(currentStep, sectionAComplete, sectionBComplete);

  // Auto-save: debounced write to localStorage
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        localStorage.setItem(STEP_KEY, String(currentStep));
        if (isInitialSave.current) {
          isInitialSave.current = false;
          return;
        }
        setSavedBadge(true);
        setTimeout(() => setSavedBadge(false), 2000);
      } catch { /* ignore */ }
    }, 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [formData, currentStep]);

  const set = useCallback(<K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => {
    setFormData(prev => ({ ...prev, [k]: v }));
  }, []);

  const goToStep = (n: number) => {
    if (n >= 1 && n <= SIDEBAR_STEPS.length) {
      setCurrentStep(n);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const submitStep = async (step: number, payload: Record<string, unknown>) => {
    try {
      await api.post(`/onboarding/step/${step}`, payload);
    } catch {
      // Proceed even if API unavailable; data is saved locally
    }
  };

  const handleBeginEnrollment = async () => {
    if (!canBeginEnrollment) {
      toast.error('Please complete both sections to begin enrollment');
      return;
    }
    setIsSubmitting(true);
    await submitStep(1, {
      practiceType: formData.practiceType,
      npi: formData.npi,
      npiApiData: formData.npiApiData,
    });
    setIsSubmitting(false);
    goToStep(2);
  };

  const handleNextFromStep = async () => {
    setIsSubmitting(true);
    const payloads: Record<number, Record<string, unknown>> = {
      2: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        titleRole: formData.titleRole,
        organizationName: formData.organizationName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        primarySpecialty: formData.primarySpecialty,
        selectedStates: formData.selectedStates,
        organizationType: formData.organizationType,
        billableProviders: formData.billableProviders,
        locationsFacilities: formData.locationsFacilities,
        calendlyScheduled: formData.calendlyScheduled,
        callDate: formData.callDate,
        callTime: formData.callTime,
        engagementTimeline: formData.engagementTimeline,
        callerName: `${formData.firstName} ${formData.lastName}`.trim(),
        callerEmail: formData.contactEmail,
        callerPhone: formData.contactPhone,
      },
      3: { confidentialityAgreed: formData.confidentialityAgreed, baaAgreed: formData.baaAgreed, baaSignature: formData.baaSignature },
      4: { npi: formData.npi, groupLegalName: formData.groupLegalName, taxId: formData.taxId, providerCount: formData.providerCount, practiceAddress: formData.practiceAddress, city: formData.city, state: formData.state, zip: formData.zip },
      5: { estimatedMonthlyClaims: formData.estimatedMonthlyClaims, primaryPayerMix: formData.primaryPayerMix, msaAgreed: formData.msaAgreed, msaSignature: formData.msaSignature },
      6: { accountHolderName: formData.accountHolderName, bankName: formData.bankName, routingNumber: formData.routingNumber, accountNumber: formData.accountNumber, accountType: formData.accountType },
    };
    await submitStep(currentStep, payloads[currentStep] || {});
    setIsSubmitting(false);
    if (currentStep < SIDEBAR_STEPS.length) {
      goToStep(currentStep + 1);
    } else {
      toast.success('Enrollment complete! Welcome to Dyad Practice Solutions.');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);
      navigate('/');
    }
  };

  const phaseIdx = getPhaseFromStep(currentStep, sectionAComplete, sectionBComplete);
  const enrollmentPhasesComplete = getEnrollmentPhasesComplete(
    currentStep, sectionAComplete, sectionBComplete,
  );
  const stepLabel = SIDEBAR_STEPS.find(s => s.id === currentStep)?.label.toUpperCase() ?? 'OVERVIEW';
  const mobileStepDisplay = currentStep - 1;

  return (
    <div className="ob-wrapper">
      {/* ── Mobile Header ── */}
      <header className="ob-mobile-header">
        <button
          className="ob-mobile-back"
          onClick={() => navigate(-1)}
          type="button"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="ob-mobile-brand">
          <span className="ob-brand-dyad">DYAD</span>
          <span className="ob-brand-sub">PRACTICE SOLUTIONS</span>
        </div>
      </header>
      <div className="ob-mobile-subheader">
        <span>ENROLLMENT</span>
        <span className="ob-mobile-step-label">{stepLabel} · STEP {mobileStepDisplay} OF {SIDEBAR_STEPS.length}</span>
      </div>

      {/* ── Sidebar ── */}
      <aside className="ob-sidebar">
        <div className="ob-brand">
          <button className="ob-brand-btn" onClick={() => navigate('/')} type="button">
            <img alt="Dyad" className="adm2-logo-img" src="/assets/images/logo_main.png" />
          </button>
        </div>

        <div className="ob-sidebar-nav">
          <div className="ob-breadcrumb">
            <span>Home</span>
            <span className="ob-bc-sep">›</span>
            <span>Login</span>
            <span className="ob-bc-sep">›</span>
            <span>Onboarding</span>
            <span className="ob-bc-sep">›</span>
            <span className="ob-bc-active">{SIDEBAR_STEPS.find(s => s.id === currentStep)?.label ?? 'Overview'}</span>
          </div>

          <div className="ob-section-label">PROVIDER ENROLLMENT</div>

          <ul className="ob-steps-list">
            {SIDEBAR_STEPS.map(s => {
              const done = currentStep > s.id;
              const active = currentStep === s.id;
              const locked = currentStep < s.id;
              return (
                <li
                  key={s.id}
                  className={`ob-step-item${active ? ' ob-step-active' : ''}${done ? ' ob-step-done' : ''}${locked ? ' ob-step-locked' : ''}`}
                  onClick={() => !locked && goToStep(s.id)}
                  role="button"
                  tabIndex={locked ? -1 : 0}
                  onKeyDown={e => e.key === 'Enter' && !locked && goToStep(s.id)}
                >
                  <span className="ob-step-num">
                    {done ? <Check size={12} strokeWidth={3} /> : s.id}
                  </span>
                  <span className="ob-step-lbl">{s.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="ob-sidebar-footer">
          <div className={`ob-saved-badge${savedBadge ? ' ob-saved-badge-visible' : ''}`} aria-live="polite">
            <Save size={12} />
            <span>Saved</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ob-main">
        <div className="ob-progress-header">
          <EnrollmentProgressCard
            progressPct={progressPct}
            phaseIdx={phaseIdx}
            sectionsComplete={enrollmentPhasesComplete}
            totalSections={PHASES.length}
          />
        </div>

        {/* Step Content */}
        <div className="ob-content">
          {currentStep === 1 && (
            <StepOverview
              formData={formData}
              set={set}
              setFormData={setFormData}
              sectionAUnlocked={sectionAUnlocked}
              sectionAComplete={sectionAComplete}
              sectionBComplete={sectionBComplete}
              sectionAOpen={sectionAOpen}
              setSectionAOpen={setSectionAOpen}
              sectionBOpen={sectionBOpen}
              setSectionBOpen={setSectionBOpen}
              onBeginEnrollment={handleBeginEnrollment}
              isSubmitting={isSubmitting}
              overviewSectionsComplete={overviewSectionsComplete}
            />
          )}
          {currentStep === 2 && (
            <StepScheduleCall
              formData={formData}
              set={set}
              setFormData={setFormData}
              onNext={handleNextFromStep}
              onBack={() => goToStep(1)}
              isSubmitting={isSubmitting}
            />
          )}
          {currentStep === 3 && (
            <StepBAA
              formData={formData}
              set={set}
              onNext={handleNextFromStep}
              onBack={() => goToStep(2)}
              isSubmitting={isSubmitting}
            />
          )}
          {currentStep === 4 && (
            <StepDueDiligence
              formData={formData}
              set={set}
              onNext={handleNextFromStep}
              onBack={() => goToStep(3)}
              isSubmitting={isSubmitting}
            />
          )}
          {currentStep === 5 && (
            <StepCommercial
              formData={formData}
              set={set}
              onNext={handleNextFromStep}
              onBack={() => goToStep(4)}
              isSubmitting={isSubmitting}
            />
          )}
          {currentStep === 6 && (
            <StepBankSetup
              formData={formData}
              set={set}
              showAccNum={showAccNum}
              setShowAccNum={setShowAccNum}
              onNext={handleNextFromStep}
              onBack={() => goToStep(5)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </main>

      {/* ── Mobile Sticky Footer (Step 1) ── */}
      {currentStep === 1 && (
        <div className="ob-mobile-footer">
          <span className="ob-mobile-footer-hint">Complete both sections to unlock</span>
          <button
            className={`ob-mobile-footer-btn${!canBeginEnrollment ? ' ob-btn-disabled' : ''}`}
            onClick={handleBeginEnrollment}
            disabled={!canBeginEnrollment || isSubmitting}
            type="button"
          >
            {isSubmitting ? 'Starting…' : 'Begin Enrollment'} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Section Collapse ─────────────────────────────────────────────────────────

interface SectionCollapseProps {
  open: boolean;
  children: React.ReactNode;
}

const SectionCollapse: React.FC<SectionCollapseProps> = ({ open, children }) => (
  <div
    className={`ob-section-collapse${open ? ' ob-section-collapse-open' : ''}`}
    aria-hidden={!open}
  >
    <div className="ob-section-collapse-inner">{children}</div>
  </div>
);

// ─── Step 1: Overview ─────────────────────────────────────────────────────────

interface StepOverviewProps {
  formData: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  sectionAUnlocked: boolean;
  sectionAComplete: boolean;
  sectionBComplete: boolean;
  sectionAOpen: boolean;
  setSectionAOpen: (v: boolean) => void;
  sectionBOpen: boolean;
  setSectionBOpen: (v: boolean) => void;
  onBeginEnrollment: () => void;
  isSubmitting: boolean;
  overviewSectionsComplete: number;
}

const StepOverview: React.FC<StepOverviewProps> = ({
  formData, set, setFormData, sectionAUnlocked, sectionAComplete, sectionBComplete,
  sectionAOpen, setSectionAOpen, sectionBOpen, setSectionBOpen,
  onBeginEnrollment, isSubmitting,
  overviewSectionsComplete,
}) => {
  const [isNpiValidating, setIsNpiValidating] = useState(false);
  const [npiApiError, setNpiApiError] = useState('');
  const [previewNpiData, setPreviewNpiData] = useState<NpiApiData | null>(null);
  const [showNpiPanel, setShowNpiPanel] = useState(false);

  const showSectionAContinue = sectionAOpen && !formData.sectionAContinued;
  const showSectionBReview = formData.sectionAContinued && !sectionBComplete;
  const npiPanelData = previewNpiData;
  const verifiedNpiData = formData.npiApiData;

  const handleNpiInputChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    set('npi', digits);
    if (digits.length < 10) {
      setNpiApiError('');
      setShowNpiPanel(false);
      setPreviewNpiData(null);
    }
  };

  const handleResetNpi = () => {
    setFormData(prev => ({ ...prev, ...clearNpiDerivedFields() }));
    setNpiApiError('');
    setShowNpiPanel(false);
    setPreviewNpiData(null);
    setSectionAOpen(true);
    setSectionBOpen(false);
  };

  const handleNpiVerify = async () => {
    if (formData.npi.length !== 10) {
      toast.error('Please enter a valid 10-digit NPI number');
      return;
    }
    setIsNpiValidating(true);
    setNpiApiError('');
    setShowNpiPanel(false);
    setPreviewNpiData(null);
    try {
      const result = await lookupNpiRegistry(formData.npi);
      setPreviewNpiData(result);
      setShowNpiPanel(true);
    } catch (err: unknown) {
      resetAllowedTaxonomiesCache();
      setNpiApiError(formatNpiLookupError(err));
    } finally {
      setIsNpiValidating(false);
    }
  };

  const handleNpiConfirm = () => {
    if (!npiPanelData) return;
    const prefill = buildPrefillFromNpiData(npiPanelData);
    setFormData(prev => ({
      ...prev,
      ...prefill,
      confirmedPracticeType: '',
      sectionAContinued: false,
      enrollmentPathwayViewed: false,
    }));
    setShowNpiPanel(false);
    setPreviewNpiData(null);
    setNpiApiError('');
    if (prefill.practiceType) {
      toast.success('Practice type assigned from your NPI taxonomy');
    } else {
      toast.error('We could not determine a practice type from this NPI. Please try a different NPI.');
    }
  };

  const handleContinueToPathway = () => {
    if (!formData.npiConfirmed) {
      toast.error('Please verify and confirm your NPI before continuing');
      return;
    }
    if (!formData.practiceType) {
      toast.error('Practice type could not be determined from your NPI. Please try a different NPI.');
      return;
    }
    set('confirmedPracticeType', formData.practiceType);
    set('sectionAContinued', true);
    setSectionAOpen(false);
    setSectionBOpen(true);
  };

  const handlePathwayReviewed = () => {
    set('enrollmentPathwayViewed', true);
    setSectionBOpen(false);
  };

  const toggleSectionA = () => {
    if (formData.sectionAContinued) {
      setSectionAOpen(!sectionAOpen);
    }
  };

  const toggleSectionB = () => {
    if (formData.sectionAContinued) {
      setSectionBOpen(!sectionBOpen);
    }
  };

  return (
    <div className="ob-step-content ob-step1-layout">
      <div className="ob-step1-welcome">
        <h1 className="ob-welcome-title">Welcome to Dyad Practice Solutions</h1>
        <p className="ob-welcome-body">
          Thank you for choosing Dyad. Our enrollment process is designed with efficiency and
          transparency in mind. Each step ensures alignment and creates a strategic framework
          for meaningful collaboration and sustained success.
        </p>
      </div>

      <div className="ob-step1-info">
        <div className="ob-info-callout">
          <AlertCircle size={16} className="ob-callout-icon" />
          <span>Both sections below must be completed before you can begin enrollment. Each section will unlock sequentially as you progress.</span>
        </div>
      </div>

      <div className="ob-step1-sections-bar">
        <EnrollmentSectionsBarRow
          progressPct={overviewSectionsComplete * 50}
          sectionsComplete={overviewSectionsComplete}
          totalSections={2}
        />
      </div>

      <div className="ob-step1-sections">
      {/* Section 1 */}
      <div className={`ob-section-card${sectionAOpen ? ' ob-section-expanded' : ''}${sectionAComplete ? ' ob-section-complete' : ''}`}>
        <button
          className="ob-section-header ob-section-header-btn"
          onClick={toggleSectionA}
          disabled={!formData.sectionAContinued}
          type="button"
        >
          <div className={`ob-section-badge${sectionAComplete ? ' ob-badge-done' : ' ob-badge-inprogress'}`}>1</div>
          <div className="ob-section-meta">
            <span className="ob-section-title">Select Practice Type</span>
            <span className={`ob-section-status${sectionAComplete ? ' ob-status-done' : ' ob-status-inprogress'}`}>
              {sectionAComplete
                ? 'Completed'
                : formData.npiConfirmed
                ? 'In progress'
                : 'In progress'}
            </span>
          </div>
          <div className="ob-section-chevron">
            {sectionAComplete && !sectionAOpen
              ? <CheckCircle2 size={20} className="ob-check-green" />
              : sectionAOpen
              ? <ChevronUp size={18} />
              : <ChevronDown size={18} />}
          </div>
        </button>

        <SectionCollapse open={sectionAOpen}>
          <div className="ob-section-body">
          <p className="ob-section-desc">
              This helps us tailor the enrollment process and document requirements to your specific specialty.
              Your practice type is assigned automatically from your NPI taxonomy and determines the credentialing
              pathway, fee schedule, and operational workflows applied to your practice.
            </p>

            <div className="ob-npi-field">
              <label className="ob-label" htmlFor="ob-npi-input">
                Practice or Provider NPI <span className="ob-req">*</span>
              </label>
              <p className="ob-field-hint">
                10-digit National Provider Identifier — Type 1 (individual) or Type 2 (organization). Verified live against the CMS NPPES registry.
              </p>
              <div className="ob-npi-row">
                <input
                  id="ob-npi-input"
                  type="text"
                  inputMode="numeric"
                  className={`ob-input${formData.npiConfirmed ? ' ob-npi-success' : ''}`}
                  placeholder="Enter 10-digit NPI number"
                  maxLength={10}
                  value={formData.npi}
                  onChange={e => handleNpiInputChange(e.target.value)}
                  disabled={isNpiValidating || formData.npiConfirmed}
                />
                <button
                  type="button"
                  className="ob-npi-verify-btn"
                  onClick={handleNpiVerify}
                  disabled={isNpiValidating || formData.npiConfirmed || formData.npi.length !== 10}
                >
                  {isNpiValidating ? 'Verifying…' : 'Verify NPI'}
                </button>
              </div>
              {npiApiError && <span className="ob-field-error">{npiApiError}</span>}

              {formData.npiConfirmed && verifiedNpiData && (
                <div className="ob-npi-verified-panel">
                  <div className="ob-npi-verified-left">
                    <div className="ob-npi-verified-icon">
                      <CheckCircle2 size={18} className="ob-check-green" />
                    </div>
                    <div className="ob-npi-verified-info">
                      <div className="ob-npi-verified-title">Verified via NPPES</div>
                      <div className="ob-npi-verified-sub">
                        {verifiedNpiData.displayName}&nbsp;·&nbsp;NPI {verifiedNpiData.npi}
                        <button type="button" className="ob-npi-change-btn" onClick={handleResetNpi}>
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showNpiPanel && npiPanelData && (
                <div className="ob-npi-panel">
                  <div className="ob-npi-panel-header">
                    <div className="ob-npi-cms-badge">CMS</div>
                    <div className="ob-npi-panel-title-area">
                      <div className="ob-npi-panel-title">NPPES Registry Lookup</div>
                      <div className="ob-npi-panel-subtitle">National Plan &amp; Provider Enumeration System</div>
                    </div>
                    <div className="ob-npi-match-badge">✓ Match Found</div>
                  </div>

                  <div className="ob-npi-panel-body">
                    <h3 className="ob-npi-provider-name">{npiPanelData.displayName}</h3>
                    <div className="ob-npi-type-row">
                      <span className="ob-npi-type-badge">
                        TYPE {npiPanelData.enumType === 'NPI-1' ? '1' : '2'} · {npiPanelData.enumType === 'NPI-1' ? 'INDIVIDUAL' : 'ORGANIZATION'}
                      </span>
                      <span className="ob-npi-status-text">
                        {npiPanelData.status}{npiPanelData.lastUpdated ? ` · Last updated ${npiPanelData.lastUpdated}` : ''}
                      </span>
                    </div>

                    <div className="ob-npi-detail-grid">
                      <div className="ob-npi-detail-cell">
                        <div className="ob-npi-detail-label">PRIMARY TAXONOMY</div>
                        <div className="ob-npi-detail-value">{npiPanelData.taxonomyDesc || '—'}</div>
                      </div>
                      <div className="ob-npi-detail-cell">
                        <div className="ob-npi-detail-label">ENUMERATION DATE</div>
                        <div className="ob-npi-detail-value ob-npi-detail-value--bold">{npiPanelData.enumerationDate || '—'}</div>
                      </div>
                      {npiPanelData.addr && (
                        <div className="ob-npi-detail-cell ob-npi-detail-cell--full">
                          <div className="ob-npi-detail-label">PRACTICE LOCATION</div>
                          <div className="ob-npi-detail-value ob-npi-detail-value--bold">{npiPanelData.addr}</div>
                        </div>
                      )}
                      <div className="ob-npi-detail-cell">
                        <div className="ob-npi-detail-label">AUTHORIZED OFFICIAL</div>
                        <div className="ob-npi-detail-value">{npiPanelData.authorizedOfficial}</div>
                      </div>
                      <div className="ob-npi-detail-cell">
                        <div className="ob-npi-detail-label">NPI</div>
                        <div className="ob-npi-detail-value ob-npi-detail-value--bold">{npiPanelData.npi}</div>
                      </div>
                    </div>

                    {npiPanelData.suggestedPracticeType && (
                      <p className="ob-npi-suggest-note">
                        Practice Type:{' '}
                        <strong>{PRACTICE_TYPES.find(p => p.id === npiPanelData.suggestedPracticeType)?.title}</strong>
                      </p>
                    )}

                    <div className="ob-npi-panel-actions">
                      <button type="button" className="ob-npi-confirm-btn" onClick={handleNpiConfirm}>
                        ✓ Confirm — this is my practice
                      </button>
                      <button
                        type="button"
                        className="ob-npi-wrong-btn"
                        onClick={() => { setShowNpiPanel(false); setPreviewNpiData(null); }}
                      >
                        Not the right entity?
                      </button>
                    </div>

                    <div className="ob-npi-panel-footer">
                      <ShieldCheck size={14} />
                      <span>
                        Sourced from the public NPPES API maintained by the Centers for Medicare &amp; Medicaid Services. No PHI is retrieved or stored.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="ob-practice-auto-label">
              {formData.npiConfirmed && formData.practiceType
                ? 'Your practice type (assigned from NPI)'
                : 'Practice type (assigned automatically after NPI verification)'}
            </p>
            <div className={`ob-practice-grid ob-practice-grid-readonly${formData.practiceType ? ' ob-practice-grid-has-selection' : ''}`}>
              {PRACTICE_TYPES.map(({ id, Icon, title, desc }) => (
                <div
                  key={id}
                  className={`ob-practice-card${formData.practiceType === id ? ' ob-practice-selected' : ' ob-practice-unselected'}`}
                >
                  <Icon size={32} strokeWidth={1.5} className="ob-practice-icon" />
                  <span className="ob-practice-title">{title}</span>
                  <span className="ob-practice-desc">{desc}</span>
                  {formData.practiceType === id && (
                    <span className="ob-practice-check"><Check size={14} strokeWidth={3} /></span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {showSectionAContinue && (
            <div className="ob-section-footer ob-section-footer-fixed">
              {!formData.npiConfirmed && (
                <span className="ob-footer-hint">Verify and confirm your NPI to continue</span>
              )}
              {formData.npiConfirmed && !formData.practiceType && (
                <span className="ob-footer-hint">Practice type could not be determined — try a different NPI</span>
              )}
              <button
                className={`ob-btn-primary${!sectionAUnlocked ? ' ob-btn-disabled' : ''}`}
                onClick={handleContinueToPathway}
                disabled={!sectionAUnlocked}
                type="button"
              >
                Continue to Enrollment Pathway <ArrowRight size={16} />
              </button>
            </div>
          )}
        </SectionCollapse>
      </div>

      {/* Section 2 */}
      <div
        id="section-b"
        className={`ob-section-card${sectionBOpen ? ' ob-section-expanded' : ''}${!formData.sectionAContinued ? ' ob-section-locked' : ''}${sectionBComplete ? ' ob-section-complete' : ''}`}
      >
        <button
          className="ob-section-header ob-section-header-btn"
          onClick={toggleSectionB}
          disabled={!formData.sectionAContinued}
          type="button"
        >
          <div className={`ob-section-badge${!formData.sectionAContinued ? ' ob-badge-locked' : sectionBComplete ? ' ob-badge-done' : ' ob-badge-pending'}`}>2</div>
          <div className="ob-section-meta">
            <span className="ob-section-title">YOUR ENROLLMENT PATHWAY</span>
            {!formData.sectionAContinued
              ? <span className="ob-section-status ob-status-locked">COMPLETE SECTION 1 TO UNLOCK</span>
              : sectionBComplete
              ? <span className="ob-section-status ob-status-done">Reviewed</span>
              : <span className="ob-section-status ob-status-pending">Review your pathway to continue</span>
            }
          </div>
          {formData.sectionAContinued && (
            <div className="ob-section-chevron">
              {sectionBComplete && !sectionBOpen
                ? <CheckCircle2 size={20} className="ob-check-green" />
                : sectionBOpen
                ? <ChevronUp size={18} />
                : <ChevronDown size={18} />}
            </div>
          )}
        </button>

        <SectionCollapse open={sectionBOpen && formData.sectionAContinued}>
          <div className="ob-section-body ob-pathway-body">
            <p className="ob-pathway-intro">
              Your enrollment unfolds across six sequential steps. Each step builds on the prior,
              ensuring alignment between your practice and Dyad&apos;s operating standards. Most steps
              are asynchronous and can be completed at your own pace.
            </p>
            <div className="ob-pathway-list">
              {PATHWAY_STEPS.map(({ num, Icon, title, desc, time }) => (
                <div key={num} className="ob-pathway-row">
                  <span className="ob-pathway-num">{num}</span>
                  <div className="ob-pathway-icon-wrap">
                    <Icon size={20} strokeWidth={1.75} className="ob-pathway-icon" />
                  </div>
                  <div className="ob-pathway-content">
                    <span className="ob-pathway-title">{title}</span>
                    <span className="ob-pathway-desc">{desc}</span>
                  </div>
                  <span className="ob-pathway-time">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCollapse>

        <SectionCollapse open={showSectionBReview}>
          <div className="ob-section-footer ob-section-footer-fixed ob-pathway-footer">
            <span className="ob-pathway-footer-hint">You may proceed once you have reviewed the steps above</span>
            <button
              className="ob-btn-primary ob-pathway-review-btn"
              onClick={handlePathwayReviewed}
              type="button"
            >
              I have reviewed the Enrollment Pathway <ArrowRight size={16} />
            </button>
          </div>
        </SectionCollapse>
      </div>
      </div>

      {/* Time commitment */}
      <div className="ob-step1-time ob-time-card">
        <Clock size={18} className="ob-time-icon" />
        <div>
          <span className="ob-time-label">TOTAL TIME COMMITMENT</span>
          <p className="ob-time-title">Approximately 2 hours of active engagement, completed over 20 days</p>
          <p className="ob-time-desc">Most steps are asynchronous and can be completed at your own pace. Only the Discovery Call requires live coordination.</p>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="ob-step1-footer ob-step-footer">
        <span className="ob-footer-note">Complete both sections above to unlock the option to begin enrollment.</span>
        <button
          className={`ob-btn-cta${!(sectionAComplete && sectionBComplete) ? ' ob-btn-disabled' : ''}`}
          onClick={onBeginEnrollment}
          disabled={!(sectionAComplete && sectionBComplete) || isSubmitting}
          type="button"
        >
          {isSubmitting ? 'Starting…' : 'Begin Enrollment'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Step 2: Schedule Intro Call ──────────────────────────────────────────────

interface StepScheduleCallProps {
  formData: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const isContactSectionValid = (d: OnboardingData) =>
  d.firstName.trim().length > 0
  && d.lastName.trim().length > 0
  && d.titleRole.trim().length > 0
  && d.organizationName.trim().length > 0
  && isValidEmail(d.contactEmail)
  && isValidPhone(d.contactPhone)
  && !!d.primarySpecialty
  && d.selectedStates.length > 0;

const SCHEDULE_WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface ScheduleCalendarViewProps {
  availableDates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  disabled?: boolean;
}

const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
  availableDates, selectedDate, onSelectDate, disabled = false,
}) => {
  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);
  const months = useMemo(
    () => buildScheduleCalendarMonths(availableSet),
    [availableSet],
  );
  const [monthIndex, setMonthIndex] = useState(0);

  useEffect(() => {
    if (!selectedDate || months.length === 0) return;
    const idx = months.findIndex(m => m.cells.some(c => c?.date === selectedDate));
    if (idx >= 0) setMonthIndex(idx);
  }, [selectedDate, months]);

  useEffect(() => {
    if (monthIndex >= months.length && months.length > 0) {
      setMonthIndex(months.length - 1);
    }
  }, [monthIndex, months.length]);

  const currentMonth = months[monthIndex];
  const canGoPrev = monthIndex > 0;
  const canGoNext = monthIndex < months.length - 1;

  if (!currentMonth) return null;

  return (
    <div className={`ob-gcal-carousel${disabled ? ' ob-gcal-disabled' : ''}`}>
      <div className="ob-gcal-nav">
        <button
          type="button"
          className="ob-gcal-nav-btn"
          onClick={() => setMonthIndex(i => i - 1)}
          disabled={!canGoPrev || disabled}
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="ob-gcal-nav-center">
          <h5 className="ob-gcal-month-title">{currentMonth.label}</h5>
          <span className="ob-gcal-nav-counter">{monthIndex + 1} of {months.length}</span>
        </div>
        <button
          type="button"
          className="ob-gcal-nav-btn"
          onClick={() => setMonthIndex(i => i + 1)}
          disabled={!canGoNext || disabled}
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="ob-gcal-month">
        <div className="ob-gcal-weekdays" aria-hidden="true">
          {SCHEDULE_WEEKDAY_LABELS.map(label => (
            <span key={label} className="ob-gcal-weekday-label">{label}</span>
          ))}
        </div>
        <div className="ob-gcal-month-grid">
          {currentMonth.cells.map((cell, idx) => (
            cell === null ? (
              <span key={`${currentMonth.key}-empty-${idx}`} className="ob-gcal-day ob-gcal-day-empty" aria-hidden="true" />
            ) : (
              <button
                key={cell.date}
                type="button"
                disabled={!cell.isAvailable || disabled}
                className={[
                  'ob-gcal-day',
                  cell.isAvailable ? 'ob-gcal-day-available' : 'ob-gcal-day-disabled',
                  cell.isToday ? 'ob-gcal-day-today' : '',
                  selectedDate === cell.date ? 'ob-gcal-selected' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => !disabled && cell.isAvailable && onSelectDate(cell.date)}
                aria-label={cell.isAvailable
                  ? `Select ${new Date(`${cell.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                  : undefined}
                aria-pressed={selectedDate === cell.date}
              >
                {cell.day}
              </button>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

const StepScheduleCall: React.FC<StepScheduleCallProps> = ({
  formData, set, setFormData, onNext, onBack, isSubmitting,
}) => {
  const [sectionAOpen, setSectionAOpen] = useState(() => !formData.step2ContactContinued);
  const [sectionBOpen, setSectionBOpen] = useState(
    () => formData.step2ContactContinued && !formData.step2OrgContinued,
  );
  const [sectionCOpen, setSectionCOpen] = useState(
    () => formData.step2OrgContinued && !formData.step2FootprintContinued,
  );
  const [sectionDOpen, setSectionDOpen] = useState(
    () => formData.step2FootprintContinued && !formData.step2ScheduleContinued,
  );
  const [sectionEOpen, setSectionEOpen] = useState(
    () => formData.step2ScheduleContinued && !formData.step2PrepareComplete,
  );
  const [statesOpen, setStatesOpen] = useState(false);
  const statesRef = useRef<HTMLDivElement>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingCall, setBookingCall] = useState(false);

  const step2SectionsComplete = getStep2SectionsComplete(formData);
  const scheduleSelectionComplete = !!(formData.callDate && formData.callTime);
  const step2DisplayComplete =
    step2SectionsComplete
    + (formData.step2FootprintContinued && !formData.step2ScheduleContinued && scheduleSelectionComplete ? 1 : 0);
  const step2ProgressPct = Math.round((step2DisplayComplete / 5) * 100);

  const contactValid = isContactSectionValid(formData);
  const orgValid = !!formData.organizationType;
  const footprintValid = !!formData.billableProviders && !!formData.locationsFacilities;
  const scheduleValid = scheduleSelectionComplete;
  const prepareValid = !!formData.engagementTimeline;

  const clearScheduleBooking = () => ({
    calendlyScheduled: false,
    step2PrepareComplete: false,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statesRef.current && !statesRef.current.contains(e.target as Node)) {
        setStatesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!sectionDOpen) return;
    let cancelled = false;
    setLoadingDates(true);
    fetchAvailableDates()
      .then(dates => { if (!cancelled) setAvailableDates(dates); })
      .finally(() => { if (!cancelled) setLoadingDates(false); });
    return () => { cancelled = true; };
  }, [sectionDOpen]);

  useEffect(() => {
    if (!formData.callDate || !sectionDOpen) {
      setAvailableSlots([]);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    fetchAvailableTimeSlots(formData.callDate)
      .then(slots => { if (!cancelled) setAvailableSlots(slots); })
      .finally(() => { if (!cancelled) setLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [formData.callDate, sectionDOpen]);

  const handleScheduleDateSelect = (date: string) => {
    if (formData.step2ScheduleContinued) {
      setFormData(prev => ({
        ...prev,
        callDate: date,
        callTime: '',
        step2ScheduleContinued: false,
        ...clearScheduleBooking(),
      }));
      setSectionEOpen(false);
    } else {
      setFormData(prev => ({
        ...prev,
        callDate: date,
        callTime: '',
        ...clearScheduleBooking(),
      }));
    }
  };

  const handleScheduleTimeSelect = (time: string) => {
    if (formData.step2ScheduleContinued) {
      setFormData(prev => ({
        ...prev,
        callTime: time,
        step2ScheduleContinued: false,
        ...clearScheduleBooking(),
      }));
      setSectionEOpen(false);
    } else {
      setFormData(prev => ({
        ...prev,
        callTime: time,
        ...clearScheduleBooking(),
      }));
    }
  };

  const resetFromContact = () => {
    setFormData(prev => ({
      ...prev,
      step2ContactContinued: false,
      step2OrgContinued: false,
      step2FootprintContinued: false,
      callDate: '',
      callTime: '',
      calendlyScheduled: false,
      step2ScheduleContinued: false,
      step2PrepareComplete: false,
    }));
    setSectionAOpen(true);
    setSectionBOpen(false);
    setSectionCOpen(false);
    setSectionDOpen(false);
    setSectionEOpen(false);
  };

  const resetFromOrg = () => {
    setFormData(prev => ({
      ...prev,
      step2OrgContinued: false,
      step2FootprintContinued: false,
      callDate: '',
      callTime: '',
      calendlyScheduled: false,
      step2ScheduleContinued: false,
      step2PrepareComplete: false,
    }));
    setSectionBOpen(true);
    setSectionCOpen(false);
    setSectionDOpen(false);
    setSectionEOpen(false);
  };

  const resetFromFootprint = () => {
    setFormData(prev => ({
      ...prev,
      step2FootprintContinued: false,
      callDate: '',
      callTime: '',
      calendlyScheduled: false,
      step2ScheduleContinued: false,
      step2PrepareComplete: false,
    }));
    setSectionCOpen(true);
    setSectionDOpen(false);
    setSectionEOpen(false);
  };

  const handleContactField = <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => {
    if (formData.step2ContactContinued) resetFromContact();
    set(k, v);
  };

  const handleOrgSelect = (id: string) => {
    if (formData.step2OrgContinued && id !== formData.organizationType) resetFromOrg();
    set('organizationType', id);
  };

  const handleFootprintField = (k: 'billableProviders' | 'locationsFacilities', v: string) => {
    if (formData.step2FootprintContinued) resetFromFootprint();
    set(k, v);
  };

  const toggleState = (state: string) => {
    if (formData.step2ContactContinued) resetFromContact();
    setFormData(prev => {
      const has = prev.selectedStates.includes(state);
      return {
        ...prev,
        selectedStates: has
          ? prev.selectedStates.filter(s => s !== state)
          : [...prev.selectedStates, state],
      };
    });
  };

  const handleContinueContact = () => {
    if (!contactValid) {
      toast.error('Please complete all required contact fields');
      return;
    }
    set('callerName', `${formData.firstName} ${formData.lastName}`.trim());
    set('callerEmail', formData.contactEmail);
    set('callerPhone', formData.contactPhone);
    set('step2ContactContinued', true);
    setSectionAOpen(false);
    setSectionBOpen(true);
  };

  const handleContinueOrg = () => {
    if (!orgValid) {
      toast.error('Please select an organization type');
      return;
    }
    set('step2OrgContinued', true);
    setSectionBOpen(false);
    setSectionCOpen(true);
  };

  const handleContinueFootprint = () => {
    if (!footprintValid) {
      toast.error('Please complete both footprint fields');
      return;
    }
    set('step2FootprintContinued', true);
    setSectionCOpen(false);
    setSectionDOpen(true);
  };

  const handleContinueSchedule = () => {
    if (!scheduleValid) {
      toast.error('Please select a date and time for your call');
      return;
    }
    set('step2ScheduleContinued', true);
    setSectionDOpen(false);
    setSectionEOpen(true);
  };

  const handleMarkComplete = async () => {
    if (!prepareValid) {
      toast.error('Please select your engagement timeline');
      return;
    }
    if (!scheduleValid) {
      toast.error('Please select a call date and time in Schedule Your Call');
      return;
    }
    setBookingCall(true);
    const result = await bookIntroductionCall({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.contactEmail,
      phone: formData.contactPhone,
      organization: formData.organizationName,
      date: formData.callDate,
      time: formData.callTime,
      engagementTimeline: formData.engagementTimeline,
    });
    setBookingCall(false);
    if (!result.success) {
      toast.error(result.message || 'Could not schedule the call on Google Calendar. Please try again.');
      return;
    }
    set('calendlyScheduled', true);
    set('callerName', `${formData.firstName} ${formData.lastName}`.trim());
    set('callerEmail', formData.contactEmail);
    set('callerPhone', formData.contactPhone);
    set('step2PrepareComplete', true);
    setSectionEOpen(false);
    toast.success('Introduction call scheduled on Google Calendar!');
  };

  const handleNext = () => {
    if (!formData.step2PrepareComplete) {
      toast.error('Please complete all sections before continuing');
      return;
    }
    onNext();
  };

  const renderSectionHeader = (
    letter: string,
    title: string,
    unlocked: boolean,
    complete: boolean,
    open: boolean,
    lockedMsg: string,
    onToggle: () => void,
  ) => (
    <button
      className="ob-section-header ob-section-header-btn"
      onClick={onToggle}
      disabled={!unlocked}
      type="button"
    >
      <div className={`ob-section-badge${!unlocked ? ' ob-badge-locked' : complete ? ' ob-badge-done' : ' ob-badge-inprogress'}`}>
        {letter}
      </div>
      <div className="ob-section-meta">
        <span className="ob-section-title">{title}</span>
        <span className={`ob-section-status${complete ? ' ob-status-done' : unlocked ? ' ob-status-inprogress' : ''}`}>
          {complete
            ? 'Complete'
            : unlocked
            ? 'In progress — complete to continue'
            : lockedMsg}
        </span>
      </div>
      <div className="ob-section-chevron">
        {complete && !open
          ? <CheckCircle2 size={20} className="ob-check-green" />
          : open
          ? <ChevronUp size={18} />
          : <ChevronDown size={18} />}
      </div>
    </button>
  );

  return (
    <div className="ob-step-content ob-step2-layout">
      <div className="ob-step-header">
        <h2 className="ob-step-title">Schedule Introduction Call</h2>
        <p className="ob-step-subtitle">Book a 30-minute introduction call</p>
      </div>

      <div className="ob-step2-bar">
        <EnrollmentSectionsBarRow
          progressPct={step2ProgressPct}
          sectionsComplete={step2DisplayComplete}
          totalSections={5}
        />
      </div>

      <div className="ob-step2-sections">
        {/* Section 1 — Contact Information */}
        <div className={`ob-section-card${sectionAOpen ? ' ob-section-expanded' : ''}${statesOpen ? ' ob-states-panel-open' : ''}${formData.step2ContactContinued ? ' ob-section-complete' : ''}`}>
          {renderSectionHeader(
            '1', 'Contact Information', true, formData.step2ContactContinued, sectionAOpen,
            '', () => formData.step2ContactContinued && setSectionAOpen(!sectionAOpen),
          )}
          <SectionCollapse open={sectionAOpen}>
            <div className="ob-section-body">
              <div className="ob-form-row">
                <div className="ob-field">
                  <label className="ob-label">First Name <span className="ob-req">*</span></label>
                  <input
                    type="text"
                    className="ob-input"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={e => handleContactField('firstName', e.target.value)}
                  />
                </div>
                <div className="ob-field">
                  <label className="ob-label">Last Name <span className="ob-req">*</span></label>
                  <input
                    type="text"
                    className="ob-input"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={e => handleContactField('lastName', e.target.value)}
                  />
                </div>
              </div>
              <div className="ob-form-row">
                <div className="ob-field">
                  <label className="ob-label">Title / Role <span className="ob-req">*</span></label>
                  <input
                    type="text"
                    className="ob-input"
                    placeholder="e.g. Medical Director, Practice Administrator, COO"
                    value={formData.titleRole}
                    onChange={e => handleContactField('titleRole', e.target.value)}
                  />
                </div>
                <div className="ob-field">
                  <label className="ob-label">Practice or Organization Name <span className="ob-req">*</span></label>
                  <input
                    type="text"
                    className="ob-input"
                    placeholder="Legal or d/b/a name"
                    value={formData.organizationName}
                    onChange={e => handleContactField('organizationName', e.target.value)}
                  />
                </div>
              </div>
              <div className="ob-form-row">
                <div className="ob-field">
                  <label className="ob-label">Email Address <span className="ob-req">*</span></label>
                  <input
                    type="email"
                    className="ob-input"
                    placeholder="you@practice.com"
                    value={formData.contactEmail}
                    onChange={e => handleContactField('contactEmail', e.target.value)}
                  />
                </div>
                <div className="ob-field">
                  <label className="ob-label">Phone Number <span className="ob-req">*</span></label>
                  <input
                    type="tel"
                    className="ob-input"
                    placeholder="(555) 000-0000"
                    value={formData.contactPhone}
                    onChange={e => handleContactField('contactPhone', e.target.value)}
                  />
                </div>
              </div>
              <div className="ob-form-row">
                <div className="ob-field">
                  <label className="ob-label">Primary Specialty <span className="ob-req">*</span></label>
                  <select
                    className="ob-input ob-select"
                    value={formData.primarySpecialty}
                    onChange={e => handleContactField('primarySpecialty', e.target.value)}
                  >
                    <option value="">Select specialty</option>
                    {PRIMARY_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="ob-field">
                  <label className="ob-label">
                    State(s) <span className="ob-req">*</span>
                    <span className="ob-label-hint">Hold Ctrl or ⌘ to select multiple</span>
                  </label>
                  <div className={`ob-states-dropdown${statesOpen ? ' ob-states-open' : ''}`} ref={statesRef}>
                    <button
                      type="button"
                      className="ob-input ob-select ob-states-trigger"
                      onClick={() => setStatesOpen(!statesOpen)}
                    >
                      <span>{formData.selectedStates.length} selected</span>
                      <ChevronDown size={16} />
                    </button>
                    {statesOpen && (
                      <div className="ob-states-panel">
                        {US_STATE_NAMES.map(s => (
                          <label key={s} className="ob-states-option">
                            <input
                              type="checkbox"
                              checked={formData.selectedStates.includes(s)}
                              onChange={() => toggleState(s)}
                            />
                            <span>{s}</span>
                          </label>
                        ))}
                        <div className="ob-states-divider" aria-hidden="true" />
                        <label className="ob-states-option ob-states-multi">
                          <input
                            type="checkbox"
                            checked={formData.selectedStates.includes('multi-state')}
                            onChange={() => toggleState('multi-state')}
                          />
                          <span>Multi-State</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {sectionAOpen && !formData.step2ContactContinued && (
              <div className="ob-section-footer ob-section-footer-fixed">
                <button
                  className={`ob-btn-primary${!contactValid ? ' ob-btn-disabled' : ''}`}
                  onClick={handleContinueContact}
                  disabled={!contactValid}
                  type="button"
                >
                  Continue to Organization Profile <ArrowRight size={16} />
                </button>
              </div>
            )}
          </SectionCollapse>
        </div>

        {/* Section 2 — Organization Profile */}
        <div className={`ob-section-card${sectionBOpen ? ' ob-section-expanded' : ''}${!formData.step2ContactContinued ? ' ob-section-locked' : ''}${formData.step2OrgContinued ? ' ob-section-complete' : ''}`}>
          {renderSectionHeader(
            '2', 'Organization Profile', formData.step2ContactContinued, formData.step2OrgContinued, sectionBOpen,
            'Complete Section 1 to unlock',
            () => formData.step2OrgContinued && setSectionBOpen(!sectionBOpen),
          )}
          <SectionCollapse open={sectionBOpen}>
            <div className="ob-section-body">
              <p className="ob-section-desc">
                Which best describes the practice, group, or organization requesting support?
              </p>
              <div className="ob-org-grid">
                {ORG_PROFILE_TYPES.map(({ id, title, desc }) => (
                  <button
                    key={id}
                    type="button"
                    className={`ob-org-card${formData.organizationType === id ? ' ob-org-selected' : ''}`}
                    onClick={() => handleOrgSelect(id)}
                  >
                    <span className="ob-org-title">{title}</span>
                    <span className="ob-org-desc">{desc}</span>
                    {formData.organizationType === id && (
                      <span className="ob-practice-check"><Check size={14} strokeWidth={3} /></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            {sectionBOpen && !formData.step2OrgContinued && (
              <div className="ob-section-footer ob-section-footer-fixed">
                <button
                  className={`ob-btn-primary${!orgValid ? ' ob-btn-disabled' : ''}`}
                  onClick={handleContinueOrg}
                  disabled={!orgValid}
                  type="button"
                >
                  Continue to Organization Footprint <ArrowRight size={16} />
                </button>
              </div>
            )}
          </SectionCollapse>
        </div>

        {/* Section 3 — Organization Footprint */}
        <div className={`ob-section-card${sectionCOpen ? ' ob-section-expanded' : ''}${!formData.step2OrgContinued ? ' ob-section-locked' : ''}${formData.step2FootprintContinued ? ' ob-section-complete' : ''}`}>
          {renderSectionHeader(
            '3', 'Organization Footprint', formData.step2OrgContinued, formData.step2FootprintContinued, sectionCOpen,
            'Complete Section 2 to unlock',
            () => formData.step2FootprintContinued && setSectionCOpen(!sectionCOpen),
          )}
          <SectionCollapse open={sectionCOpen}>
            <div className="ob-section-body">
              <p className="ob-section-desc">
                Please tell us the approximate size of the practice, group, facility network, or organization included in this inquiry.
              </p>
              <div className="ob-form-row">
                <div className="ob-field">
                  <label className="ob-label">Billable Providers Included <span className="ob-req">*</span></label>
                  <p className="ob-field-hint">How many billable providers would be included in the initial Dyad engagement?</p>
                  <select
                    className="ob-input ob-select"
                    value={formData.billableProviders}
                    onChange={e => handleFootprintField('billableProviders', e.target.value)}
                  >
                    <option value="">Select provider count</option>
                    {PROVIDER_COUNT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="ob-field">
                  <label className="ob-label">Locations / Facilities Included <span className="ob-req">*</span></label>
                  <p className="ob-field-hint">How many locations, facilities, or sites of service would be included?</p>
                  <select
                    className="ob-input ob-select"
                    value={formData.locationsFacilities}
                    onChange={e => handleFootprintField('locationsFacilities', e.target.value)}
                  >
                    <option value="">Select location count</option>
                    {LOCATION_COUNT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {sectionCOpen && !formData.step2FootprintContinued && (
              <div className="ob-section-footer ob-section-footer-fixed">
                <button
                  className={`ob-btn-primary${!footprintValid ? ' ob-btn-disabled' : ''}`}
                  onClick={handleContinueFootprint}
                  disabled={!footprintValid}
                  type="button"
                >
                  Continue to Schedule Your Call <ArrowRight size={16} />
                </button>
              </div>
            )}
          </SectionCollapse>
        </div>

        {/* Section 4 — Schedule Your Call */}
        <div className={`ob-section-card${sectionDOpen ? ' ob-section-expanded' : ''}${!formData.step2FootprintContinued ? ' ob-section-locked' : ''}${formData.step2ScheduleContinued ? ' ob-section-complete' : ''}`}>
          {renderSectionHeader(
            '4', 'Schedule Your Call', formData.step2FootprintContinued, formData.step2ScheduleContinued, sectionDOpen,
            'Complete Section 3 to unlock',
            () => formData.step2ScheduleContinued && setSectionDOpen(!sectionDOpen),
          )}
          <SectionCollapse open={sectionDOpen}>
            <div className="ob-section-body">
              <p className="ob-section-desc">
                Select an available 30-minute time slot to connect with Dyad&apos;s enrollment team. All times are displayed in Pacific Time (PT).
              </p>
              <div className="ob-gcal-schedule">
                <div className="ob-gcal-section">
                  <h4 className="ob-gcal-heading">
                    <Calendar size={16} />
                    Select a Date
                  </h4>
                  <p className="ob-gcal-hint">
                    Choose any available day within the next {SCHEDULE_DAYS_AHEAD} days.
                  </p>
                  {loadingDates ? (
                    <p className="ob-gcal-loading">Loading available dates…</p>
                  ) : (
                    <ScheduleCalendarView
                      availableDates={availableDates}
                      selectedDate={formData.callDate}
                      onSelectDate={handleScheduleDateSelect}
                    />
                  )}
                </div>

                {formData.callDate && (
                  <div className="ob-gcal-section">
                    <h4 className="ob-gcal-heading">
                      <Clock size={16} />
                      Select a Time
                    </h4>
                    <p className="ob-gcal-hint">
                      Available times for {formatDateForDisplay(formData.callDate)} — Pacific Time (PT)
                    </p>
                    {loadingSlots ? (
                      <p className="ob-gcal-loading">Loading available times…</p>
                    ) : availableSlots.length === 0 ? (
                      <p className="ob-gcal-empty">No times available for this date. Please choose another day.</p>
                    ) : (
                      <div className="ob-gcal-time-grid">
                        {availableSlots.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            className={`ob-gcal-time-btn${formData.callTime === slot ? ' ob-gcal-selected' : ''}`}
                            onClick={() => handleScheduleTimeSelect(slot)}
                          >
                            {formatTimeForDisplay(slot)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <p className="ob-gcal-tz">All times displayed in Pacific Time (PT)</p>
              </div>
              {formData.calendlyScheduled && formData.step2PrepareComplete && (
                <div className="ob-confirm-box ob-confirm-box-inline">
                  <CheckCircle2 size={18} className="ob-check-green" />
                  <div>
                    <strong>Call Scheduled on Google Calendar</strong>
                    <span>
                      {' '}— {formatDateForDisplay(formData.callDate)} at {formatTimeForDisplay(formData.callTime)} PT
                    </span>
                    <p className="ob-confirm-note">You can change the date or time above anytime. Re-confirm in Prepare for Your Call after making changes.</p>
                  </div>
                </div>
              )}
              {scheduleSelectionComplete && !formData.calendlyScheduled && (
                <div className="ob-confirm-box ob-confirm-box-inline">
                  <CheckCircle2 size={18} className="ob-check-green" />
                  <div>
                    <strong>Time Selected</strong>
                    <span>
                      {' '}— {formatDateForDisplay(formData.callDate)} at {formatTimeForDisplay(formData.callTime)} PT
                    </span>
                    <p className="ob-confirm-note">Your selected time will be confirmed when you complete Prepare for Your Call.</p>
                  </div>
                </div>
              )}
            </div>
            {sectionDOpen && !formData.step2ScheduleContinued && (
              <div className="ob-section-footer ob-section-footer-fixed">
                <button
                  className={`ob-btn-primary${!scheduleValid ? ' ob-btn-disabled' : ''}`}
                  onClick={handleContinueSchedule}
                  disabled={!scheduleValid}
                  type="button"
                >
                  Continue to Prepare for Your Call <ArrowRight size={16} />
                </button>
              </div>
            )}
          </SectionCollapse>
        </div>

        {/* Section 5 — Prepare for Your Call */}
        <div className={`ob-section-card${sectionEOpen ? ' ob-section-expanded' : ''}${!formData.step2ScheduleContinued ? ' ob-section-locked' : ''}${formData.step2PrepareComplete ? ' ob-section-complete' : ''}`}>
          {renderSectionHeader(
            '5', 'Prepare for Your Call', formData.step2ScheduleContinued, formData.step2PrepareComplete, sectionEOpen,
            'Complete Section 4 to unlock',
            () => formData.step2PrepareComplete && setSectionEOpen(!sectionEOpen),
          )}
          <SectionCollapse open={sectionEOpen}>
            <div className="ob-section-body">
              <p className="ob-section-desc">
                Having the following information on hand will help us make the most of your time together.
              </p>
              <ul className="ob-prep-list">
                {STEP2_PREP_ITEMS.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="ob-prep-timeline">
                <h4 className="ob-prep-timeline-title">Engagement Timeline</h4>
                <p className="ob-section-desc">
                  Understanding your timeline helps us prepare the right resources and ensure we can support your goals effectively.
                </p>
                <select
                  className="ob-input ob-select"
                  value={formData.engagementTimeline}
                  onChange={e => {
                    if (formData.step2PrepareComplete) {
                      set('step2PrepareComplete', false);
                      set('calendlyScheduled', false);
                      setSectionEOpen(true);
                    }
                    set('engagementTimeline', e.target.value);
                  }}
                >
                  <option value="">Select the option that best reflects your timeline</option>
                  {ENGAGEMENT_TIMELINES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            {formData.calendlyScheduled && formData.step2PrepareComplete && (
              <div className="ob-section-status-bar">
                <div className="ob-confirm-box">
                  <CheckCircle2 size={18} className="ob-check-green" />
                  <div>
                    <strong>Call Scheduled on Google Calendar</strong>
                    <span>
                      {' '}— {formatDateForDisplay(formData.callDate)} at {formatTimeForDisplay(formData.callTime)} PT
                    </span>
                    <p className="ob-confirm-note">A calendar invite will be sent to {formData.contactEmail}.</p>
                  </div>
                </div>
              </div>
            )}
            {sectionEOpen && !formData.step2PrepareComplete && (
              <div className="ob-section-footer ob-section-footer-fixed">
                <button
                  className={`ob-btn-primary${!prepareValid || bookingCall ? ' ob-btn-disabled' : ''}`}
                  onClick={handleMarkComplete}
                  disabled={!prepareValid || bookingCall}
                  type="button"
                >
                  {bookingCall ? 'Scheduling on Google Calendar…' : 'Schedule Call & Mark Complete'} <Check size={16} />
                </button>
              </div>
            )}
          </SectionCollapse>
        </div>
      </div>

      <StepNavBar
        className="ob-step2-nav-footer"
        onBack={onBack}
        onNext={handleNext}
        isSubmitting={isSubmitting}
        canProceed={formData.step2PrepareComplete && formData.calendlyScheduled}
        nextLabel="Continue to Sign Confidentiality & BAA"
      />
    </div>
  );
};

// ─── Step 3: BAA ──────────────────────────────────────────────────────────────

interface StepBAAProps {
  formData: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const StepBAA: React.FC<StepBAAProps> = ({ formData, set, onNext, onBack, isSubmitting }) => {
  const canProceed = formData.confidentialityAgreed && formData.baaAgreed && formData.baaSignature.trim().length > 2;

  const handleNext = () => {
    if (!canProceed) { toast.error('Please agree to all terms and provide your signature'); return; }
    onNext();
  };

  return (
    <div className="ob-step-content">
      <div className="ob-step-header">
        <h2 className="ob-step-title">Sign Confidentiality & BAA</h2>
        <p className="ob-step-subtitle">
          Review and electronically sign the HIPAA Business Associate Agreement and
          confidentiality terms required for enrollment.
        </p>
      </div>

      <div className="ob-form-card">
        {/* Confidentiality */}
        <div className="ob-agreement-block">
          <div className="ob-agreement-title">
            <FileText size={16} />
            <span>Confidentiality Agreement</span>
          </div>
          <div className="ob-agreement-scroll">
            <p>By proceeding with enrollment, you agree that all information shared during the Dyad Practice Solutions enrollment process — including but not limited to practice financials, patient volume data, payer contracts, and operational workflows — shall be treated as confidential and proprietary.</p>
            <p>You agree not to disclose, reproduce, or use such information for any purpose other than the evaluation and execution of the proposed partnership with Dyad Practice Solutions, LLC. This obligation shall survive the termination of any agreement between the parties.</p>
            <p>Dyad Practice Solutions agrees to maintain equivalent confidentiality of all information provided by your practice during this process and will not share such information with third parties without prior written consent, except as required by law or for the purposes of executing the partnership.</p>
          </div>
          <label className="ob-checkbox-row">
            <input
              type="checkbox"
              className="ob-checkbox"
              checked={formData.confidentialityAgreed}
              onChange={e => set('confidentialityAgreed', e.target.checked)}
            />
            <span>I have read and agree to the Confidentiality Agreement</span>
          </label>
        </div>

        {/* BAA */}
        <div className="ob-agreement-block">
          <div className="ob-agreement-title">
            <FileText size={16} />
            <span>HIPAA Business Associate Agreement (BAA)</span>
          </div>
          <div className="ob-agreement-scroll">
            <p>This Business Associate Agreement ("BAA") is entered into between your practice ("Covered Entity") and Dyad Practice Solutions, LLC ("Business Associate") in connection with services provided under the Master Services Agreement.</p>
            <p>As a Business Associate under HIPAA, Dyad Practice Solutions agrees to: (1) not use or disclose Protected Health Information (PHI) other than as permitted or required by this BAA; (2) use appropriate safeguards to prevent unauthorized use or disclosure of PHI; (3) report to the Covered Entity any use or disclosure not provided for by this BAA; (4) ensure all subcontractors agree to the same restrictions; and (5) make PHI available in accordance with HIPAA requirements.</p>
            <p>This Agreement shall be effective as of the date of electronic signature below and shall remain in effect for the duration of the service relationship between the parties.</p>
          </div>
          <label className="ob-checkbox-row">
            <input
              type="checkbox"
              className="ob-checkbox"
              checked={formData.baaAgreed}
              onChange={e => set('baaAgreed', e.target.checked)}
            />
            <span>I have read and agree to the HIPAA Business Associate Agreement</span>
          </label>
        </div>

        {/* Signature */}
        <div className="ob-field" style={{ marginTop: 24 }}>
          <label className="ob-label">Electronic Signature <span className="ob-req">*</span></label>
          <p className="ob-field-hint">Type your full legal name as your electronic signature</p>
          <input
            type="text"
            className={`ob-input ob-signature-input${formData.baaSignature ? ' ob-sig-filled' : ''}`}
            placeholder="Type your full legal name"
            value={formData.baaSignature}
            onChange={e => set('baaSignature', e.target.value)}
          />
          {formData.baaSignature && (
            <p className="ob-sig-date">Signed electronically on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          )}
        </div>
      </div>

      <StepNavBar onBack={onBack} onNext={handleNext} isSubmitting={isSubmitting} canProceed={canProceed} />
    </div>
  );
};

// ─── Step 4: Due Diligence ────────────────────────────────────────────────────

interface StepDueDiligenceProps {
  formData: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const StepDueDiligence: React.FC<StepDueDiligenceProps> = ({ formData, set, onNext, onBack, isSubmitting }) => {
  const canProceed = formData.npi.length === 10 && formData.groupLegalName && formData.taxId && formData.practiceAddress && formData.city && formData.state && formData.zip;

  const handleNext = () => {
    if (!canProceed) { toast.error('Please complete all required fields'); return; }
    if (formData.npi.length !== 10) { toast.error('NPI must be exactly 10 digits'); return; }
    onNext();
  };

  return (
    <div className="ob-step-content">
      <div className="ob-step-header">
        <h2 className="ob-step-title">Due Diligence & Discovery</h2>
        <p className="ob-step-subtitle">
          Provide your practice's key identifying and operational information. This enables
          credentialing, payer enrollment, and contract preparation.
        </p>
      </div>

      <div className="ob-form-card">
        <div className="ob-form-section-label"><Hash size={16} /> Practice Identification</div>
        <div className="ob-form-row">
          <div className="ob-field">
            <label className="ob-label">NPI Number <span className="ob-req">*</span></label>
            <input
              type="text"
              className="ob-input"
              placeholder="10-digit NPI"
              maxLength={10}
              value={formData.npi}
              onChange={e => set('npi', e.target.value.replace(/\D/g, ''))}
            />
            {formData.npi && formData.npi.length !== 10 && (
              <span className="ob-field-error">NPI must be 10 digits</span>
            )}
          </div>
          <div className="ob-field">
            <label className="ob-label">Tax ID (EIN) <span className="ob-req">*</span></label>
            <input
              type="text"
              className="ob-input"
              placeholder="XX-XXXXXXX"
              value={formData.taxId}
              onChange={e => set('taxId', e.target.value)}
            />
          </div>
        </div>
        <div className="ob-form-row">
          <div className="ob-field">
            <label className="ob-label">Group / Legal Entity Name <span className="ob-req">*</span></label>
            <input
              type="text"
              className="ob-input"
              placeholder="Smith Anesthesia Group, LLC"
              value={formData.groupLegalName}
              onChange={e => set('groupLegalName', e.target.value)}
            />
          </div>
          <div className="ob-field">
            <label className="ob-label">Number of Providers</label>
            <input
              type="number"
              className="ob-input"
              placeholder="e.g. 12"
              min="1"
              value={formData.providerCount}
              onChange={e => set('providerCount', e.target.value)}
            />
          </div>
        </div>

        <div className="ob-form-section-label"><MapPin size={16} /> Practice Address</div>
        <div className="ob-form-row ob-form-row-full">
          <div className="ob-field">
            <label className="ob-label">Street Address <span className="ob-req">*</span></label>
            <input
              type="text"
              className="ob-input"
              placeholder="123 Medical Drive, Suite 400"
              value={formData.practiceAddress}
              onChange={e => set('practiceAddress', e.target.value)}
            />
          </div>
        </div>
        <div className="ob-form-row ob-form-row-three">
          <div className="ob-field">
            <label className="ob-label">City <span className="ob-req">*</span></label>
            <input
              type="text"
              className="ob-input"
              placeholder="Atlanta"
              value={formData.city}
              onChange={e => set('city', e.target.value)}
            />
          </div>
          <div className="ob-field">
            <label className="ob-label">State <span className="ob-req">*</span></label>
            <select className="ob-input ob-select" value={formData.state} onChange={e => set('state', e.target.value)}>
              <option value="">State</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="ob-field">
            <label className="ob-label">ZIP Code <span className="ob-req">*</span></label>
            <input
              type="text"
              className="ob-input"
              placeholder="30301"
              maxLength={10}
              value={formData.zip}
              onChange={e => set('zip', e.target.value)}
            />
          </div>
        </div>
        <div className="ob-form-row ob-form-row-half">
          <div className="ob-field">
            <label className="ob-label">Practice Website</label>
            <input
              type="url"
              className="ob-input"
              placeholder="https://yourpractice.com"
              value={formData.website}
              onChange={e => set('website', e.target.value)}
            />
          </div>
        </div>
      </div>

      <StepNavBar onBack={onBack} onNext={handleNext} isSubmitting={isSubmitting} canProceed={!!canProceed} />
    </div>
  );
};

// ─── Step 5: Commercial Alignment ─────────────────────────────────────────────

interface StepCommercialProps {
  formData: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const PAYER_MIXES = ['Mostly Medicare/Medicaid', 'Mostly Commercial', 'Balanced Mix', 'Primarily Self-Pay', 'Workers Comp / Auto'];

const StepCommercial: React.FC<StepCommercialProps> = ({ formData, set, onNext, onBack, isSubmitting }) => {
  const canProceed = formData.estimatedMonthlyClaims && formData.primaryPayerMix && formData.msaAgreed && formData.msaSignature.trim().length > 2;

  const handleNext = () => {
    if (!canProceed) { toast.error('Please complete all required fields and sign the MSA'); return; }
    onNext();
  };

  return (
    <div className="ob-step-content">
      <div className="ob-step-header">
        <h2 className="ob-step-title">Commercial Alignment & MSA</h2>
        <p className="ob-step-subtitle">
          Provide revenue and payer mix details, then review and execute the Master Services
          Agreement to formalize the partnership.
        </p>
      </div>

      <div className="ob-form-card">
        <div className="ob-form-section-label"><DollarSign size={16} /> Revenue Profile</div>
        <div className="ob-form-row">
          <div className="ob-field">
            <label className="ob-label">Estimated Monthly Claims Volume ($) <span className="ob-req">*</span></label>
            <input
              type="text"
              className="ob-input"
              placeholder="e.g. 250,000"
              value={formData.estimatedMonthlyClaims}
              onChange={e => set('estimatedMonthlyClaims', e.target.value)}
            />
          </div>
          <div className="ob-field">
            <label className="ob-label">Primary Payer Mix <span className="ob-req">*</span></label>
            <select className="ob-input ob-select" value={formData.primaryPayerMix} onChange={e => set('primaryPayerMix', e.target.value)}>
              <option value="">Select payer mix</option>
              {PAYER_MIXES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="ob-form-row ob-form-row-half">
          <div className="ob-field">
            <label className="ob-label">Requested Contract Start Date</label>
            <input
              type="date"
              className="ob-input"
              value={formData.contractStartDate}
              onChange={e => set('contractStartDate', e.target.value)}
            />
          </div>
        </div>

        {/* MSA */}
        <div className="ob-form-section-label" style={{ marginTop: 24 }}><FileText size={16} /> Master Services Agreement</div>
        <div className="ob-agreement-block">
          <div className="ob-agreement-scroll">
            <p>This Master Services Agreement ("Agreement") is entered into between Dyad Practice Solutions, LLC ("Dyad") and the enrolling practice entity. Dyad agrees to provide revenue cycle management, credentialing support, payer contract negotiation, and operational consulting services.</p>
            <p>Service fees are calculated as a percentage of net collections as outlined in the Schedule of Fees, which will be provided prior to execution. Initial term is 24 months with automatic renewal unless terminated with 90-day written notice.</p>
            <p>Dyad guarantees dedicated account management, transparent reporting, and contractual performance benchmarks. Either party may terminate for cause with 30-day written notice following a 15-day cure period.</p>
          </div>
          <label className="ob-checkbox-row">
            <input
              type="checkbox"
              className="ob-checkbox"
              checked={formData.msaAgreed}
              onChange={e => set('msaAgreed', e.target.checked)}
            />
            <span>I have read and agree to the Master Services Agreement</span>
          </label>
        </div>

        <div className="ob-field" style={{ marginTop: 20 }}>
          <label className="ob-label">MSA Electronic Signature <span className="ob-req">*</span></label>
          <input
            type="text"
            className={`ob-input ob-signature-input${formData.msaSignature ? ' ob-sig-filled' : ''}`}
            placeholder="Type your full legal name"
            value={formData.msaSignature}
            onChange={e => set('msaSignature', e.target.value)}
          />
          {formData.msaSignature && (
            <p className="ob-sig-date">MSA signed electronically on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          )}
        </div>
      </div>

      <StepNavBar onBack={onBack} onNext={handleNext} isSubmitting={isSubmitting} canProceed={canProceed} nextLabel="Proceed to Bank Setup" />
    </div>
  );
};

// ─── Step 6: Bank & Payment Setup ─────────────────────────────────────────────

interface StepBankSetupProps {
  formData: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  showAccNum: boolean;
  setShowAccNum: (v: boolean) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const StepBankSetup: React.FC<StepBankSetupProps> = ({
  formData, set, showAccNum, setShowAccNum, onNext, onBack, isSubmitting
}) => {
  const canProceed = formData.accountHolderName && formData.bankName && formData.routingNumber.length === 9 && formData.accountNumber && formData.accountType;

  const handleNext = () => {
    if (!canProceed) { toast.error('Please complete all required banking fields'); return; }
    if (formData.routingNumber.length !== 9) { toast.error('Routing number must be 9 digits'); return; }
    onNext();
  };

  return (
    <div className="ob-step-content">
      <div className="ob-step-header">
        <h2 className="ob-step-title">Bank & Payment Setup</h2>
        <p className="ob-step-subtitle">
          Provide your ACH banking details for claims remittance and revenue distribution.
          All data is encrypted and stored securely.
        </p>
      </div>

      <div className="ob-info-callout ob-callout-secure">
        <Landmark size={16} className="ob-callout-icon" />
        <span>Your banking information is encrypted using AES-256. Dyad will only use these details for ACH remittance as outlined in your MSA.</span>
      </div>

      <div className="ob-form-card">
        <div className="ob-form-section-label"><Landmark size={16} /> Bank Account Details</div>
        <div className="ob-form-row">
          <div className="ob-field">
            <label className="ob-label">Account Holder Name <span className="ob-req">*</span></label>
            <input
              type="text"
              className="ob-input"
              placeholder="Smith Anesthesia Group, LLC"
              value={formData.accountHolderName}
              onChange={e => set('accountHolderName', e.target.value)}
            />
          </div>
          <div className="ob-field">
            <label className="ob-label">Bank Name <span className="ob-req">*</span></label>
            <input
              type="text"
              className="ob-input"
              placeholder="e.g. Wells Fargo"
              value={formData.bankName}
              onChange={e => set('bankName', e.target.value)}
            />
          </div>
        </div>
        <div className="ob-form-row">
          <div className="ob-field">
            <label className="ob-label">Routing Number <span className="ob-req">*</span></label>
            <input
              type="text"
              className="ob-input"
              placeholder="9-digit routing number"
              maxLength={9}
              value={formData.routingNumber}
              onChange={e => set('routingNumber', e.target.value.replace(/\D/g, ''))}
            />
            {formData.routingNumber && formData.routingNumber.length !== 9 && (
              <span className="ob-field-error">Routing number must be 9 digits</span>
            )}
          </div>
          <div className="ob-field">
            <label className="ob-label">Account Number <span className="ob-req">*</span></label>
            <div className="ob-input-icon-wrap">
              <input
                type={showAccNum ? 'text' : 'password'}
                className="ob-input ob-input-with-icon"
                placeholder="Account number"
                value={formData.accountNumber}
                onChange={e => set('accountNumber', e.target.value.replace(/\D/g, ''))}
              />
              <button
                type="button"
                className="ob-input-icon-btn"
                onClick={() => setShowAccNum(!showAccNum)}
                tabIndex={-1}
              >
                {showAccNum ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
        <div className="ob-form-row ob-form-row-half">
          <div className="ob-field">
            <label className="ob-label">Account Type <span className="ob-req">*</span></label>
            <div className="ob-radio-group">
              {['Checking', 'Savings'].map(t => (
                <label key={t} className="ob-radio-label">
                  <input
                    type="radio"
                    name="accountType"
                    value={t}
                    checked={formData.accountType === t}
                    onChange={() => set('accountType', t)}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ob-step-footer ob-step-footer-final">
        <button className="ob-btn-ghost" onClick={onBack} type="button">
          <ArrowLeft size={16} /> Back
        </button>
        <button
          className={`ob-btn-cta${!canProceed ? ' ob-btn-disabled' : ''}`}
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          type="button"
        >
          {isSubmitting ? 'Submitting…' : 'Complete Enrollment'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Shared Nav Bar ───────────────────────────────────────────────────────────

interface StepNavBarProps {
  onBack: () => void;
  onNext: () => void;
  isSubmitting: boolean;
  canProceed: boolean;
  nextLabel?: string;
}

const StepNavBar: React.FC<StepNavBarProps & { className?: string }> = ({
  onBack, onNext, isSubmitting, canProceed, nextLabel = 'Save & Continue', className = '',
}) => (
  <div className={`ob-step-footer ob-step-nav-footer${className ? ` ${className}` : ''}`}>
    <button className="ob-btn-ghost" onClick={onBack} type="button">
      <ArrowLeft size={16} /> Back
    </button>
    <button
      className={`ob-btn-primary${!canProceed ? ' ob-btn-disabled' : ''}`}
      onClick={onNext}
      disabled={!canProceed || isSubmitting}
      type="button"
    >
      {isSubmitting ? 'Saving…' : nextLabel} <ArrowRight size={16} />
    </button>
  </div>
);

export default DyadOnboarding;

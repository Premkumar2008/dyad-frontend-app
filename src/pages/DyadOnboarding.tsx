import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Stethoscope, Scissors, Activity, Building2,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Clock, AlertCircle,
  CheckCircle2, Calendar, FileText, CreditCard,
  ArrowLeft,
  Phone, Mail, User, MapPin, Hash, DollarSign,
  Landmark, Check, Zap, Save, ShieldCheck, BarChart3, Briefcase, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import {
  getOnboardingClientSession,
  persistOnboardingAuthTokens,
  type OnboardingClientSession,
} from '../services/onboardingClientAuthService';
import { restoreOnboardingApiAccessToken } from '../utils/apiAuth';
import {
  fetchAvailableDates,
  fetchAvailableTimeSlots,
  bookIntroductionCall,
  buildScheduleCalendarMonths,
  SCHEDULE_DAYS_AHEAD,
  getTimeZoneDisplayLabel,
  getTimeZoneShortLabel,
  type ScheduleBookingPayload,
  type ScheduleTimeSlot,
} from '../services/onboardingCalendarService';
import {
  type NpiApiData,
  buildPrefillFromNpiData,
  clearNpiDerivedFields,
  formatNpiLookupError,
  lookupOnboardingNpiRegistry,
  resetAllowedTaxonomiesCache,
} from '../services/npiRegistryService';
import { formatDateForDisplay, formatTimeForDisplay } from '../utils/dateTimeUtils';
import { ScheduleTimeSlotTile } from '../components/onboarding/ScheduleTimeSlotTile';
import { sendOnboardingScheduleConfirmationEmail } from '../services/onboardingScheduleEmailService';
import {
  extractOnboardingId,
  hydrateOnboardingFromEmail,
} from '../services/onboardingHydrationService';
import {
  buildStepSubmitPayload,
  persistOnboardingFormState,
  processOnboardingApiResponse,
  readOnboardingStepMeta,
  readOnboardingStorageRecord,
  storageRecordToFormPartial,
  writeOnboardingStorageRecord,
} from '../services/onboardingStorageService';
import { EnrollmentSaveNotice } from '../components/onboarding/EnrollmentSaveNotice';
import { OnboardingIdleWarningModal } from '../components/onboarding/OnboardingIdleWarningModal';
import { useOnboardingSessionGuard } from '../hooks/useOnboardingSessionGuard';
import { clearAllOnboardingSessionData } from '../services/onboardingSecurityService';
import { EnrollmentSectionsBarRow } from '../components/onboarding/EnrollmentSectionsBarRow';
import { ObArrowRight, ObBackButtonLabel, ObForwardButtonLabel } from '../components/onboarding/ObBtnArrow';
import { StepSignAgreements } from '../components/onboarding/step3/StepSignAgreements';
import { StepDueDiligence } from '../components/onboarding/step4/StepDueDiligence';
import { StepCommercialAlignment } from '../components/onboarding/step5/StepCommercialAlignment';
import { StepBankingPaymentSetup } from '../components/onboarding/step6/StepBankingPaymentSetup';
import type { ZohoAchMandateResult } from '../types/zohoPayMandate';
import { buildZohoMandateFormPatch } from '../utils/zohoPayMandate';
import { emptyKycDocuments, type KycDocMeta } from '../components/onboarding/step6/bankingConstants';
import type { CommercialDecision } from '../components/onboarding/step5/commercialConstants';
import type { DueDiligenceDocMeta } from '../components/onboarding/step4/dueDiligenceConstants';
import { emptyDueDiligenceDocuments } from '../components/onboarding/step4/dueDiligenceConstants';
import './DyadOnboarding.css';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OnboardingData {
  // Step 1
  onboardingId: string;
  npi: string;
  npiConfirmed: boolean;
  npiEnumerationType: string;
  npiApiData: NpiApiData | null;
  practiceType: string;
  selectedPracticeTypes: string[];
  confirmedPracticeType: string;
  sectionAContinued: boolean;
  enrollmentPathwayViewed: boolean;
  // Step 2 - Schedule Introduction Call
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
  scheduleConfirmationEmailSent: boolean;
  step2ScheduleContinued: boolean;
  engagementTimeline: string;
  step2PrepareComplete: boolean;
  callDate: string;
  callTime: string;
  callTimeZone: string;
  callMeetingLink: string;
  googleMeetLink: string;
  meetingLink: string;
  callEventId: string;
  callCalendarId: string;
  callEventLink: string;
  /** Snapshot when create-event succeeds; used to detect edits vs booked slot */
  bookedCallDate: string;
  bookedCallTime: string;
  callerName: string;
  callerEmail: string;
  callerPhone: string;
  // Step 3 - Sign Agreements
  step3EntityComplete: boolean;
  step3NdaComplete: boolean;
  step3BaaComplete: boolean;
  signerEmailVerified: boolean;
  /** Email address that passed verification (intake or OTP); must match signerEmail to proceed */
  verifiedSignerEmail: string;
  entityLegalName: string;
  entityType: string;
  entityFormationState: string;
  entityStreet: string;
  entityCity: string;
  entityAddrState: string;
  entityZip: string;
  signerFirstName: string;
  signerLastName: string;
  signerTitle: string;
  signerEmail: string;
  ndaFields: Record<string, string>;
  baaFields: Record<string, string>;
  ndaAcceptedRecordId: string;
  ndaAcceptedAt: string;
  baaAcceptedRecordId: string;
  baaAcceptedAt: string;
  confidentialityAgreed: boolean;
  baaAgreed: boolean;
  baaSignature: string;
  // Step 4 - Due Diligence
  groupLegalName: string;
  taxId: string;
  providerCount: string;
  practiceAddress: string;
  city: string;
  state: string;
  zip: string;
  website: string;
  step4ProviderConfirmed: boolean;
  step4FinancialConfirmed: boolean;
  step4DocsConfirmed: boolean;
  ddMidLevelProviders: string;
  ddAllProvidersCredentialed: string;
  ddFacilityId: string;
  ddFacilityTin: string;
  ddOperatingRooms: string;
  ddCredentialedProviders: string;
  ddSpecialtiesPerformed: string;
  ddFacilityOwnership: string;
  annualCaseVolume: string;
  annualGrossCollections: string;
  inNetworkPayerContracts: string;
  ddPayerCommercial: string;
  ddPayerMedicare: string;
  ddPayerPI: string;
  ddPayerCash: string;
  reportAvailabilityNotes: string;
  ddDocuments: Record<string, DueDiligenceDocMeta | null>;
  // Step 5 - Commercial Alignment & MSA
  proposalReviewed: boolean;
  commercialDecision: CommercialDecision;
  discussQuestions: string;
  discussContactPref: '' | 'email' | 'call';
  step5EntityComplete: boolean;
  step5MsaComplete: boolean;
  step5CarriedExhibitAComplete: boolean;
  step5CarriedExhibitBComplete: boolean;
  step5ExhibitCComplete: boolean;
  step5FeeScheduleComplete: boolean;
  step5MsaAttested: boolean;
  step5ExhibitCAttested: boolean;
  step5FeeScheduleAttested: boolean;
  msaFields: Record<string, string>;
  exhibitCFields: Record<string, string>;
  feeScheduleFields: Record<string, string>;
  msaAttestMeta: string;
  msaAttestRecordId: string;
  exhibitCAttestMeta: string;
  exhibitCAttestRecordId: string;
  feeScheduleAttestMeta: string;
  feeScheduleAttestRecordId: string;
  msaPackageAgreed: boolean;
  msaPackageExecuted: boolean;
  msaPackageRecordId: string;
  msaPackageExecutedAt: string;
  estimatedMonthlyClaims: string;
  primaryPayerMix: string;
  msaAgreed: boolean;
  msaSignature: string;
  msaProviderSignatureImage: string;
  contractStartDate: string;
  // Step 6 - Banking & Payment Setup
  step6Sec1Attested: boolean;
  step6Sec1Complete: boolean;
  step6CipDob: string;
  step6CipSsn: string;
  step6CipCitizenship: string;
  step6CipResAddress: string;
  step6CipResCity: string;
  step6CipResState: string;
  step6CipResZip: string;
  step6Sec2Attested: boolean;
  step6Sec2Complete: boolean;
  w9Line1: string;
  w9Line2: string;
  w9TaxClass: string;
  w9LlcClass: string;
  w9OtherDesc: string;
  w9Line5: string;
  w9Line6: string;
  w9TinType: 'EIN' | 'SSN' | '';
  w9Tin: string;
  w9EsignConsent: boolean;
  w9IrsCert: boolean;
  w9AuthDist: boolean;
  w9Signature: string;
  w9Signed: boolean;
  w9SignedAt: string;
  w9SignedHash: string;
  w9Item2Flagged: boolean;
  achBankPhone: string;
  achBankAddress: string;
  achMandateActive: boolean;
  zohoCustomerId: string;
  zohoPaymentId: string;
  zohoPaymentMethodId: string;
  zohoMandateId: string;
  zohoSessionId: string;
  zohoPaymentStatus: string;
  zohoSubscriptionStatus: string;
  zohoSubscriptionNextCharge: string;
  achMandateAuthorizedAt: string;
  step6Sec4Attested: boolean;
  step6Sec4Complete: boolean;
  sweepUseSection4: boolean;
  sweepOtherBankName: string;
  sweepOtherAcctType: string;
  sweepOtherRouting: string;
  sweepOtherAccount: string;
  step6Sec5Attested: boolean;
  step6Sec5Complete: boolean;
  kycDocuments: Record<string, KycDocMeta | null>;
  step6Sec6Attested: boolean;
  step6Sec6Complete: boolean;
  step6EnrollmentComplete: boolean;
  step6ConfirmationId: string;
  accountHolderName: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: string;
}

const INITIAL_DATA: OnboardingData = {
  onboardingId: '',
  npi: '',
  npiConfirmed: false,
  npiEnumerationType: '',
  npiApiData: null,
  practiceType: '',
  selectedPracticeTypes: [],
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
  scheduleConfirmationEmailSent: false,
  step2ScheduleContinued: false,
  engagementTimeline: '',
  step2PrepareComplete: false,
  callDate: '',
  callTime: '',
  callTimeZone: '',
  callMeetingLink: '',
  googleMeetLink: '',
  meetingLink: '',
  callEventId: '',
  callCalendarId: '',
  callEventLink: '',
  bookedCallDate: '',
  bookedCallTime: '',
  callerName: '',
  callerEmail: '',
  callerPhone: '',
  step3EntityComplete: false,
  step3NdaComplete: false,
  step3BaaComplete: false,
  signerEmailVerified: false,
  verifiedSignerEmail: '',
  entityLegalName: '',
  entityType: '',
  entityFormationState: '',
  entityStreet: '',
  entityCity: '',
  entityAddrState: '',
  entityZip: '',
  signerFirstName: '',
  signerLastName: '',
  signerTitle: '',
  signerEmail: '',
  ndaFields: {},
  baaFields: {},
  ndaAcceptedRecordId: '',
  ndaAcceptedAt: '',
  baaAcceptedRecordId: '',
  baaAcceptedAt: '',
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
  step4ProviderConfirmed: false,
  step4FinancialConfirmed: false,
  step4DocsConfirmed: false,
  ddMidLevelProviders: '',
  ddAllProvidersCredentialed: '',
  ddFacilityId: '',
  ddFacilityTin: '',
  ddOperatingRooms: '',
  ddCredentialedProviders: '',
  ddSpecialtiesPerformed: '',
  ddFacilityOwnership: '',
  annualCaseVolume: '',
  annualGrossCollections: '',
  inNetworkPayerContracts: '',
  ddPayerCommercial: '',
  ddPayerMedicare: '',
  ddPayerPI: '',
  ddPayerCash: '',
  reportAvailabilityNotes: '',
  ddDocuments: emptyDueDiligenceDocuments(),
  proposalReviewed: false,
  commercialDecision: '',
  discussQuestions: '',
  discussContactPref: '',
  step5EntityComplete: false,
  step5MsaComplete: false,
  step5CarriedExhibitAComplete: false,
  step5CarriedExhibitBComplete: false,
  step5ExhibitCComplete: false,
  step5FeeScheduleComplete: false,
  step5MsaAttested: false,
  step5ExhibitCAttested: false,
  step5FeeScheduleAttested: false,
  msaFields: {},
  exhibitCFields: {},
  feeScheduleFields: {},
  msaAttestMeta: '',
  msaAttestRecordId: '',
  exhibitCAttestMeta: '',
  exhibitCAttestRecordId: '',
  feeScheduleAttestMeta: '',
  feeScheduleAttestRecordId: '',
  msaPackageAgreed: false,
  msaPackageExecuted: false,
  msaPackageRecordId: '',
  msaPackageExecutedAt: '',
  estimatedMonthlyClaims: '',
  primaryPayerMix: '',
  msaAgreed: false,
  msaSignature: '',
  msaProviderSignatureImage: '',
  contractStartDate: '',
  step6Sec1Attested: false,
  step6Sec1Complete: false,
  step6CipDob: '',
  step6CipSsn: '',
  step6CipCitizenship: '',
  step6CipResAddress: '',
  step6CipResCity: '',
  step6CipResState: '',
  step6CipResZip: '',
  step6Sec2Attested: false,
  step6Sec2Complete: false,
  w9Line1: '',
  w9Line2: '',
  w9TaxClass: '',
  w9LlcClass: '',
  w9OtherDesc: '',
  w9Line5: '',
  w9Line6: '',
  w9TinType: 'EIN',
  w9Tin: '',
  w9EsignConsent: false,
  w9IrsCert: false,
  w9AuthDist: false,
  w9Signature: '',
  w9Signed: false,
  w9SignedAt: '',
  w9SignedHash: '',
  w9Item2Flagged: false,
  achBankPhone: '',
  achBankAddress: '',
  achMandateActive: false,
  zohoCustomerId: '',
  zohoPaymentId: '',
  zohoPaymentMethodId: '',
  zohoMandateId: '',
  zohoSessionId: '',
  zohoPaymentStatus: '',
  zohoSubscriptionStatus: '',
  zohoSubscriptionNextCharge: '',
  achMandateAuthorizedAt: '',
  step6Sec4Attested: false,
  step6Sec4Complete: false,
  sweepUseSection4: true,
  sweepOtherBankName: '',
  sweepOtherAcctType: '',
  sweepOtherRouting: '',
  sweepOtherAccount: '',
  step6Sec5Attested: false,
  step6Sec5Complete: false,
  kycDocuments: emptyKycDocuments(),
  step6Sec6Attested: false,
  step6Sec6Complete: false,
  step6EnrollmentComplete: false,
  step6ConfirmationId: '',
  accountHolderName: '',
  bankName: '',
  routingNumber: '',
  accountNumber: '',
  accountType: '',
};

const ONBOARDING_BOOL_FIELDS: (keyof OnboardingData)[] = [
  'npiConfirmed', 'sectionAContinued', 'enrollmentPathwayViewed',
  'step2ContactContinued', 'step2OrgContinued', 'step2FootprintContinued',
  'calendlyScheduled', 'scheduleConfirmationEmailSent', 'step2ScheduleContinued', 'step2PrepareComplete',
  'step3EntityComplete', 'step3NdaComplete', 'step3BaaComplete', 'signerEmailVerified',
  'confidentialityAgreed', 'baaAgreed',
  'step4ProviderConfirmed', 'step4FinancialConfirmed', 'step4DocsConfirmed',
  'proposalReviewed', 'step5EntityComplete', 'step5MsaComplete', 'step5CarriedExhibitAComplete',
  'step5CarriedExhibitBComplete', 'step5ExhibitCComplete', 'step5FeeScheduleComplete',
  'step5MsaAttested', 'step5ExhibitCAttested',
  'step5FeeScheduleAttested', 'msaPackageAgreed', 'msaPackageExecuted', 'msaAgreed',
  'step6Sec1Attested', 'step6Sec1Complete', 'step6Sec2Attested', 'step6Sec2Complete',
  'w9EsignConsent', 'w9IrsCert', 'w9AuthDist',
  'w9Signed', 'w9Item2Flagged', 'achMandateActive', 'step6Sec4Attested', 'step6Sec4Complete',
  'sweepUseSection4', 'step6Sec5Attested', 'step6Sec5Complete', 'step6Sec6Attested', 'step6Sec6Complete',
  'step6EnrollmentComplete',
];

const coerceOnboardingBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
    if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === '') return false;
  }
  return Boolean(value);
};

const isEmptyOnboardingValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const PRACTICE_TYPE_ID_LIST = ['anesthesiology', 'surgical', 'pain', 'asc'] as const;
const PRACTICE_TYPE_ID_SET = new Set<string>(PRACTICE_TYPE_ID_LIST);

const PRACTICE_TYPE_TITLE_BY_ID: Record<(typeof PRACTICE_TYPE_ID_LIST)[number], string> = {
  anesthesiology: 'Anesthesiology',
  surgical: 'Surgical Specialty',
  pain: 'Pain Medicine',
  asc: 'ASC Facility',
};

const sortPracticeTypeIdsFromList = (ids: string[]) =>
  PRACTICE_TYPE_ID_LIST.filter(id => ids.includes(id));

const resolvePracticeTypeId = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (PRACTICE_TYPE_ID_SET.has(trimmed)) return trimmed;
  const lower = trimmed.toLowerCase();
  if (PRACTICE_TYPE_ID_SET.has(lower)) return lower;

  const byTitle = PRACTICE_TYPE_ID_LIST.find(
    id => PRACTICE_TYPE_TITLE_BY_ID[id].toLowerCase() === lower,
  );
  if (byTitle) return byTitle;

  if (/anesthes|crna/i.test(lower)) return 'anesthesiology';
  if (/\bpain\b|pain medicine|interventional pain/i.test(lower)) return 'pain';
  if (/asc|ambulatory surg|surgery center/i.test(lower)) return 'asc';
  if (/surg|orthop|ophthalmol|ent|urolog|gastro/i.test(lower)) return 'surgical';

  return '';
};

const hasValidPracticeTypeSelection = (ids: string[]) =>
  ids.some(id => PRACTICE_TYPE_ID_SET.has(id));

const normalizePracticeTypeSelection = (data: OnboardingData): OnboardingData => {
  const next = { ...data };

  let selected = (next.selectedPracticeTypes ?? [])
    .map(resolvePracticeTypeId)
    .filter((id): id is string => PRACTICE_TYPE_ID_SET.has(id));
  selected = sortPracticeTypeIdsFromList([...new Set(selected)]);

  const practiceId = resolvePracticeTypeId(next.practiceType || '');
  if (!hasValidPracticeTypeSelection(selected) && practiceId) {
    selected = [practiceId];
  }

  if (!hasValidPracticeTypeSelection(selected) && next.npiApiData && next.npiConfirmed) {
    const fromNpi = buildPrefillFromNpiData(next.npiApiData).selectedPracticeTypes
      .map(resolvePracticeTypeId)
      .filter((id): id is string => PRACTICE_TYPE_ID_SET.has(id));
    selected = sortPracticeTypeIdsFromList(fromNpi);
  }

  if (hasValidPracticeTypeSelection(selected)) {
    next.selectedPracticeTypes = selected;
    if (!PRACTICE_TYPE_ID_SET.has(next.practiceType)) {
      next.practiceType = selected[0];
    }
    if (next.sectionAContinued && !PRACTICE_TYPE_ID_SET.has(next.confirmedPracticeType)) {
      next.confirmedPracticeType = selected[0];
    }
    if (next.npiApiData && next.npiConfirmed && !next.npiApiData.suggestedPracticeTypes?.length) {
      next.npiApiData = {
        ...next.npiApiData,
        suggestedPracticeTypes: selected as NpiApiData['suggestedPracticeTypes'],
        suggestedPracticeType: (selected[0] || next.npiApiData.suggestedPracticeType || '') as NpiApiData['suggestedPracticeType'],
      };
    }
  }

  return next;
};

const applyNpiDerivedPrefill = (data: OnboardingData): OnboardingData => {
  if (!data.npiApiData || !data.npiConfirmed) return data;
  const prefill = buildPrefillFromNpiData(data.npiApiData);
  const next = { ...data };
  (Object.keys(prefill) as (keyof typeof prefill)[]).forEach((key) => {
    const incoming = prefill[key];
    if (isEmptyOnboardingValue(incoming)) return;
    const current = next[key as keyof OnboardingData];
    const isPracticeField = key === 'selectedPracticeTypes' || key === 'practiceType';
    if (isPracticeField && hasValidPracticeTypeSelection(
      Array.isArray(current) ? current as string[] : [],
    )) {
      return;
    }
    if (isEmptyOnboardingValue(current) || isPracticeField) {
      (next as Record<string, unknown>)[key] = incoming;
    }
  });
  return next;
};

const sanitizeLoadedOnboardingData = (parsed: Partial<OnboardingData>): OnboardingData => {
  const merged = { ...INITIAL_DATA, ...parsed };
  ONBOARDING_BOOL_FIELDS.forEach((field) => {
    (merged as Record<string, unknown>)[field] = coerceOnboardingBoolean(merged[field]);
  });
  if (!merged.sectionAContinued) {
    merged.enrollmentPathwayViewed = false;
  }
  if (!Array.isArray(merged.selectedStates)) {
    merged.selectedStates = [];
  }
  if (!merged.npiApiData) {
    merged.npiApiData = null;
  }
  if (!Array.isArray(merged.selectedPracticeTypes)) {
    merged.selectedPracticeTypes = merged.practiceType ? [merged.practiceType] : [];
  }
  if (merged.sectionAContinued && merged.practiceType && !merged.confirmedPracticeType) {
    merged.confirmedPracticeType = merged.practiceType;
  }
  merged.ddDocuments = { ...emptyDueDiligenceDocuments(), ...(merged.ddDocuments || {}) };
  merged.kycDocuments = { ...emptyKycDocuments(), ...(merged.kycDocuments || {}) };
  merged.callEventId = merged.callEventId ?? '';
  merged.callCalendarId = merged.callCalendarId ?? '';
  merged.callEventLink = merged.callEventLink ?? '';
  merged.bookedCallDate = merged.bookedCallDate ?? '';
  merged.bookedCallTime = merged.bookedCallTime ?? '';
  merged.onboardingId = merged.onboardingId ?? '';
  return normalizePracticeTypeSelection(applyNpiDerivedPrefill(merged));
};

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

const sortPracticeTypeIds = (ids: string[]) =>
  PRACTICE_TYPES.map(p => p.id).filter(id => ids.includes(id));

const formatPracticeTypeTitles = (ids: string[]) =>
  sortPracticeTypeIds(ids)
    .map(id => PRACTICE_TYPES.find(p => p.id === id)?.title)
    .filter(Boolean)
    .join(', ');

const getPracticeTypeLabel = (data: Pick<OnboardingData, 'selectedPracticeTypes' | 'practiceType' | 'confirmedPracticeType'>) =>
  data.selectedPracticeTypes.length > 1
    ? formatPracticeTypeTitles(data.selectedPracticeTypes)
    : data.practiceType || data.confirmedPracticeType;

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

const isEnrollmentStepComplete = (
  step: number,
  data: OnboardingData,
  sectionAComplete: boolean,
  sectionBComplete: boolean,
): boolean => {
  switch (step) {
    case 1: return sectionAComplete && sectionBComplete;
    case 2: return data.step2PrepareComplete;
    case 3: return data.step3NdaComplete && data.step3BaaComplete;
    case 4: return data.step4DocsConfirmed;
    case 5: return data.msaPackageExecuted
      || data.commercialDecision === 'discuss'
      || data.commercialDecision === 'decline';
    case 6: return data.step6EnrollmentComplete || (
      data.step6Sec1Complete
      && data.step6Sec2Complete
      && data.w9Signed
      && data.step6Sec4Complete
      && data.step6Sec5Complete
      && data.step6Sec6Complete
    );
    default: return false;
  }
};

const deriveHighestStepReached = (
  storedHighest: number,
  current: number,
  data: OnboardingData,
  sectionAComplete: boolean,
  sectionBComplete: boolean,
): number => {
  let highest = Math.max(storedHighest, current);
  for (const s of SIDEBAR_STEPS) {
    if (isEnrollmentStepComplete(s.id, data, sectionAComplete, sectionBComplete)) {
      highest = Math.max(highest, Math.min(s.id + 1, SIDEBAR_STEPS.length));
    }
  }
  return Math.min(highest, SIDEBAR_STEPS.length);
};

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
  { value: '1', label: '1 provider - Solo provider' },
  { value: '2-10', label: '2–10 providers - Small group' },
  { value: '11-49', label: '11–49 providers - Mid-sized group' },
  { value: '50-99', label: '50–99 providers - Large group or regional platform' },
  { value: '100-499', label: '100–499 providers - Enterprise group or specialty platform' },
  { value: '500+', label: '500+ providers - National platform or integrated enterprise' },
  { value: 'unsure', label: 'Not sure - Dyad can help determine this during intake' },
];

const LOCATION_COUNT_OPTIONS = [
  { value: '1', label: '1 location or facility - Single-site practice' },
  { value: '2-5', label: '2–5 locations - Small multi-site group' },
  { value: '6-10', label: '6–10 locations - Regional footprint' },
  { value: '11-25', label: '11–25 locations - Large regional group or platform' },
  { value: '26-50', label: '26–50 locations - Multi-market platform or portfolio' },
  { value: '51+', label: '51+ locations - National platform or enterprise' },
  { value: 'unsure', label: 'Not sure - Dyad can help determine this during intake' },
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
  'A general overview of your practice - number of providers, primary specialty, and patient volume',
  'Key challenges or goals you\'d like Dyad to address (collections, denials, credentialing, compliance, etc.)',
  'Names of any practice management or EHR systems currently in use',
  'Any relevant contracts or agreements that may be in transition (billing vendors, payer contracts, etc.)',
];

const getProgressPct = (
  phasesComplete: number,
  currentStep: number,
  sectionAComplete: boolean,
  sectionBComplete: boolean,
) => {
  if (currentStep === 1 && phasesComplete === 0) {
    if (sectionAComplete && sectionBComplete) {
      return Math.round((1 / PHASES.length) * 100);
    }
    if (sectionAComplete) {
      return Math.round((0.5 / PHASES.length) * 100);
    }
    return 0;
  }
  return Math.round((phasesComplete / PHASES.length) * 100);
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

const getEnrollmentPhasesComplete = (
  data: OnboardingData,
  sectionAComplete: boolean,
  sectionBComplete: boolean,
) => {
  let consecutive = 0;
  for (const s of SIDEBAR_STEPS) {
    if (isEnrollmentStepComplete(s.id, data, sectionAComplete, sectionBComplete)) consecutive++;
    else break;
  }
  return consecutive;
};

/** Solid line ends at the dot for the current reached step. */
const getPhaseConnectorFillPct = (
  completedPhases: number,
  currentStep: number,
  totalPhases: number,
) => {
  if (totalPhases <= 1) return 0;

  let targetDotIndex = completedPhases > 0 ? completedPhases - 1 : 0;
  if (currentStep > completedPhases && currentStep <= totalPhases) {
    targetDotIndex = currentStep - 1;
  }

  if (completedPhases >= totalPhases || targetDotIndex >= totalPhases - 1) return 100;
  if (targetDotIndex <= 0) return 0;
  return (targetDotIndex / (totalPhases - 1)) * 100;
};

interface EnrollmentProgressCardProps {
  progressPct: number;
  sectionsComplete: number;
  currentStep: number;
  totalSections: number;
  className?: string;
  showBarRow?: boolean;
}

const EnrollmentProgressCard: React.FC<EnrollmentProgressCardProps> = ({
  progressPct, sectionsComplete, currentStep, totalSections, className = '', showBarRow = true,
}) => {
  const connectorFillPct = getPhaseConnectorFillPct(sectionsComplete, currentStep, totalSections);
  const pendingIdx = sectionsComplete < totalSections ? sectionsComplete : -1;

  return (
  <div className={`ob-progress-card${className ? ` ${className}` : ''}`}>
    <div className="ob-ph-header">
      <h2 className="ob-ph-title">Enrollment Progress</h2>
    </div>

    <div className="ob-ph-divider" aria-hidden="true" />

    <div
      className="ob-phases"
      style={{ '--ob-phase-count': totalSections } as React.CSSProperties}
    >
      <div className="ob-phases-connector" aria-hidden="true">
        <div className="ob-phases-connector-bg" />
        <div
          className="ob-phases-connector-fill"
          style={{ width: `${connectorFillPct}%` }}
        />
      </div>
      {PHASES.map((ph, i) => {
        const isDone = i < sectionsComplete;
        const isPending = i === pendingIdx;
        const isUpcoming = i > sectionsComplete;

        return (
          <div
            key={ph}
            className={`ob-phase-step${isDone ? ' ob-phase-done' : ''}${isPending ? ' ob-phase-pending' : ''}${isUpcoming ? ' ob-phase-upcoming' : ''}`}
          >
            <div className="ob-phase-dot">
              {isDone
                ? <Check size={12} strokeWidth={3} />
                : <span className="ob-phase-dot-num">{i + 1}</span>}
            </div>
            <span className="ob-phase-name">{ph}</span>
          </div>
        );
      })}
    </div>

    {showBarRow && (
      <>
        <div className="ob-ph-divider ob-ph-divider-footer" aria-hidden="true" />
        <EnrollmentSectionsBarRow
          progressPct={progressPct}
          sectionsComplete={sectionsComplete}
          totalSections={totalSections}
        />
      </>
    )}
  </div>
  );
};

const BeginEnrollmentButtonLabel: React.FC<{ isSubmitting: boolean }> = ({ isSubmitting }) => (
  <ObForwardButtonLabel label="Begin Enrollment" loading={isSubmitting} keepLabelOnLoading />
);

// ─── Main Component ──────────────────────────────────────────────────────────

const DyadOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isClientOnboardingRoute = location.pathname === '/client-onboarding-process';
  const [clientSession, setClientSession] = useState<OnboardingClientSession | null>(() =>
    isClientOnboardingRoute ? getOnboardingClientSession() : null,
  );

  useEffect(() => {
    restoreOnboardingApiAccessToken();
    const session = getOnboardingClientSession();
    if (session?.accessToken) {
      persistOnboardingAuthTokens(session.accessToken, session.refreshToken);
    }
  }, []);

  useEffect(() => {
    if (isClientOnboardingRoute) {
      setClientSession(getOnboardingClientSession());
    }
  }, [isClientOnboardingRoute]);

  const [currentStep, setCurrentStep] = useState<number>(() => readOnboardingStepMeta().currentStep);

  const [highestStepReached, setHighestStepReached] = useState<number>(
    () => readOnboardingStepMeta().highestStepReached,
  );

  const [formData, setFormData] = useState<OnboardingData>(() => {
    try {
      const record = readOnboardingStorageRecord();
      return sanitizeLoadedOnboardingData(storageRecordToFormPartial(record));
    } catch { return INITIAL_DATA; }
  });

  const [sectionAOpen, setSectionAOpen] = useState(() => !formData.sectionAContinued);
  const [sectionBOpen, setSectionBOpen] = useState(
    () => formData.sectionAContinued && !formData.enrollmentPathwayViewed
  );
  const [savedBadge, setSavedBadge] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDataEpoch, setFormDataEpoch] = useState(0);
  const [isHydratingOnboarding, setIsHydratingOnboarding] = useState(isClientOnboardingRoute);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialSave = useRef(true);
  const hasPendingSaveRef = useRef(false);
  const onboardingHydratedRef = useRef(false);
  const onboardingHydratingRef = useRef(isClientOnboardingRoute);

  const applyStorageRecordToForm = useCallback((
    record: ReturnType<typeof readOnboardingStorageRecord>,
    email?: string,
  ) => {
    const next = sanitizeLoadedOnboardingData({
      ...storageRecordToFormPartial(record),
      contactEmail: record.contactEmail || email || '',
    });
    setFormData(next);
    setFormDataEpoch(epoch => epoch + 1);

    if (next.sectionAContinued) {
      setSectionAOpen(false);
      setSectionBOpen(!next.enrollmentPathwayViewed);
    }

    const step = Math.min(Math.max(record.currentStep || 1, 1), SIDEBAR_STEPS.length);
    const highest = Math.min(
      Math.max(record.highestStepReached || step, step),
      SIDEBAR_STEPS.length,
    );
    setCurrentStep(step);
    setHighestStepReached(highest);
    return next;
  }, []);

  useEffect(() => {
    if (!isClientOnboardingRoute || !clientSession?.email || onboardingHydratedRef.current) {
      onboardingHydratingRef.current = false;
      setIsHydratingOnboarding(false);
      return;
    }
    onboardingHydratedRef.current = true;

    const email = clientSession.email;

    void (async () => {
      try {
        const result = await hydrateOnboardingFromEmail(email);
        if (result) {
          applyStorageRecordToForm(result.storageRecord, email);
        } else {
          const stepMeta = readOnboardingStepMeta();
          const next = sanitizeLoadedOnboardingData({
            ...storageRecordToFormPartial(readOnboardingStorageRecord()),
            contactEmail: email,
          });
          persistOnboardingFormState(next, stepMeta);
          setFormData(next);
          setFormDataEpoch(epoch => epoch + 1);
        }
      } finally {
        onboardingHydratingRef.current = false;
        setIsHydratingOnboarding(false);
      }
    })();
  }, [isClientOnboardingRoute, clientSession?.email, applyStorageRecordToForm]);

  const sectionAUnlocked = formData.npiConfirmed && formData.selectedPracticeTypes.length > 0;
  const sectionAComplete = formData.sectionAContinued;
  const sectionBComplete = formData.enrollmentPathwayViewed;
  const canBeginEnrollment = sectionAComplete && sectionBComplete;
  const overviewSectionsComplete = getOverviewSectionsComplete(sectionAComplete, sectionBComplete);

  const effectiveHighestStep = deriveHighestStepReached(
    highestStepReached, currentStep, formData, sectionAComplete, sectionBComplete,
  );

  const flushSave = useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (onboardingHydratingRef.current) return;
    try {
      persistOnboardingFormState(formData, {
        currentStep,
        highestStepReached: effectiveHighestStep,
      });
      hasPendingSaveRef.current = false;
    } catch { /* ignore */ }
  }, [formData, currentStep, effectiveHighestStep]);

  const hasFormProgress = useCallback(() => Boolean(
    formData.npi?.trim()
    || formData.onboardingId
    || formData.sectionAContinued
    || formData.firstName?.trim()
    || currentStep > 1,
  ), [formData, currentStep]);

  const handleIdleSecurityLogout = useCallback(async () => {
    flushSave();
    try {
      if (formData.onboardingId && currentStep >= 1) {
        const body = buildStepSubmitPayload(currentStep, formData, {
          currentStep,
          highestStepReached: effectiveHighestStep,
          onboardingId: formData.onboardingId,
        });
        await api.post(`/onboarding/step/${currentStep}`, body);
      }
    } catch { /* best-effort server sync before secure logout */ }

    clearAllOnboardingSessionData();
    setClientSession(null);
    navigate('/login', { replace: true, state: { loginMode: 'code', reason: 'idle_timeout' } });
  }, [flushSave, formData, currentStep, effectiveHighestStep, navigate]);

  const {
    showIdleWarning,
    idleSecondsLeft,
    extendSession,
    markIntentionalLeave,
  } = useOnboardingSessionGuard({
    enabled: isClientOnboardingRoute && !!clientSession && !isHydratingOnboarding,
    hasUnsavedChanges: () => hasPendingSaveRef.current,
    hasFormProgress,
    flushSave,
    onIdleSecurityLogout: handleIdleSecurityLogout,
  });

  const handleClientLogout = () => {
    markIntentionalLeave();
    flushSave();
    clearAllOnboardingSessionData();
    setClientSession(null);
    toast.success('Signed out');
    navigate('/login', { replace: true, state: { loginMode: 'code' } });
  };

  useEffect(() => {
    if (effectiveHighestStep > highestStepReached) {
      setHighestStepReached(effectiveHighestStep);
    }
  }, [effectiveHighestStep, highestStepReached]);

  const enrollmentPhasesComplete = getEnrollmentPhasesComplete(
    formData, sectionAComplete, sectionBComplete,
  );
  const progressPct = getProgressPct(
    enrollmentPhasesComplete, currentStep, sectionAComplete, sectionBComplete,
  );

  // Auto-save: debounced write to localStorage
  useEffect(() => {
    if (onboardingHydratingRef.current) return;
    hasPendingSaveRef.current = true;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (onboardingHydratingRef.current) return;
      try {
        persistOnboardingFormState(formData, {
          currentStep,
          highestStepReached: effectiveHighestStep,
        });
        hasPendingSaveRef.current = false;
        if (isInitialSave.current) {
          isInitialSave.current = false;
          return;
        }
        setSavedBadge(true);
        setTimeout(() => setSavedBadge(false), 2000);
      } catch { /* ignore */ }
    }, 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [formData, currentStep, effectiveHighestStep]);

  const set = useCallback(<K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => {
    setFormData(prev => ({ ...prev, [k]: v }));
  }, []);

  const bumpHighestStep = useCallback((n: number) => {
    setHighestStepReached(prev => {
      const next = Math.max(prev, n);
      return next <= SIDEBAR_STEPS.length ? next : SIDEBAR_STEPS.length;
    });
  }, []);

  const goToStep = (n: number) => {
    const maxReach = deriveHighestStepReached(
      highestStepReached, currentStep, formData, sectionAComplete, sectionBComplete,
    );
    if (n >= 1 && n <= SIDEBAR_STEPS.length && n <= maxReach) {
      setCurrentStep(n);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const submitStep = async (
    step: number,
    meta: { currentStep: number; highestStepReached: number },
    dataSnapshot?: OnboardingData,
  ): Promise<string | null> => {
    const data = dataSnapshot ?? formData;
    const body = buildStepSubmitPayload(step, data, {
      ...meta,
      onboardingId: data.onboardingId || undefined,
    });
    try {
      const res = await api.post(`/onboarding/step/${step}`, body);
      const responseId = extractOnboardingId(res.data);

      if (res.data) {
        const mergedRecord = processOnboardingApiResponse(res.data, {
          email: formData.contactEmail || clientSession?.email,
          mergeWithLocal: true,
          persist: true,
          localRecord: readOnboardingStorageRecord(),
        });
        mergedRecord.currentStep = meta.currentStep;
        mergedRecord.highestStepReached = meta.highestStepReached;
        if (responseId) mergedRecord.onboardingId = responseId;
        writeOnboardingStorageRecord(mergedRecord);
        applyStorageRecordToForm(mergedRecord, formData.contactEmail || clientSession?.email);
      }

      if (step === 1) return responseId ?? extractOnboardingId(res.data);
      return responseId ?? data.onboardingId ?? null;
    } catch {
      // Proceed even if API unavailable; data is saved locally
      return formData.onboardingId || null;
    }
  };

  const handleZohoMandatePersist = useCallback(async (result: ZohoAchMandateResult) => {
    const patch = buildZohoMandateFormPatch(result);
    const merged: OnboardingData = { ...formData, ...patch };
    setFormData(merged);
    persistOnboardingFormState(merged, {
      currentStep: 6,
      highestStepReached: effectiveHighestStep,
    });
    await submitStep(6, {
      currentStep: 6,
      highestStepReached: effectiveHighestStep,
    }, merged);
  }, [effectiveHighestStep, formData, submitStep]);

  const handleBeginEnrollment = async () => {
    if (!canBeginEnrollment) {
      toast.error('Please complete both sections to begin enrollment');
      return;
    }
    setIsSubmitting(true);
    const newOnboardingId = await submitStep(1, {
      currentStep: 2,
      highestStepReached: Math.max(effectiveHighestStep, 2),
    });
    if (newOnboardingId) set('onboardingId', newOnboardingId);
    setIsSubmitting(false);
    bumpHighestStep(2);
    goToStep(2);
  };

  const handleNextFromStep = async (overrides?: Partial<OnboardingData>) => {
    setIsSubmitting(true);
    const merged = overrides ? { ...formData, ...overrides } : formData;
    if (overrides) setFormData(prev => ({ ...prev, ...overrides }));
    const nextStep = Math.min(currentStep + 1, SIDEBAR_STEPS.length);
    await submitStep(currentStep, {
      currentStep: currentStep < SIDEBAR_STEPS.length ? nextStep : currentStep,
      highestStepReached: Math.max(effectiveHighestStep, nextStep),
    }, merged);
    setIsSubmitting(false);
    if (currentStep < SIDEBAR_STEPS.length) {
      bumpHighestStep(currentStep + 1);
      goToStep(currentStep + 1);
    } else {
      markIntentionalLeave();
      toast.success('Enrollment complete! Welcome to Dyad Practice Solutions.');
      clearAllOnboardingSessionData();
      navigate('/');
    }
  };

  const stepLabel = SIDEBAR_STEPS.find(s => s.id === currentStep)?.label.toUpperCase() ?? 'OVERVIEW';

  const handleMobileBack = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="ob-wrapper">
      {showIdleWarning && (
        <OnboardingIdleWarningModal
          secondsLeft={idleSecondsLeft}
          onStaySignedIn={extendSession}
          onLogoutNow={handleClientLogout}
        />
      )}
      <header className="ob-mobile-header">
        <button
          className="ob-mobile-back"
          onClick={handleMobileBack}
          type="button"
          aria-label={currentStep > 1 ? 'Previous step' : 'Go back'}
        >
          <ArrowLeft size={20} />
        </button>
        <button className="ob-mobile-brand" onClick={() => navigate('/')} type="button">
          <img
            alt="Dyad Practice Solutions"
            className="ob-mobile-brand-logo"
            src="/assets/images/logo_main.png"
          />
        </button>
      </header>
      <div className="ob-mobile-subheader">
        <span>ENROLLMENT</span>
        <span className="ob-mobile-step-label">
          {stepLabel} · STEP {currentStep} OF {SIDEBAR_STEPS.length}
        </span>
        {isClientOnboardingRoute && clientSession && (
          <button type="button" className="ob-mobile-logout-btn" onClick={handleClientLogout}>
            Logout
          </button>
        )}
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
              const stepComplete = isEnrollmentStepComplete(
                s.id, formData, sectionAComplete, sectionBComplete,
              );
              const active = currentStep === s.id;
              const locked = s.id > effectiveHighestStep;
              const done = stepComplete || s.id < effectiveHighestStep;
              const clickable = !locked;
              return (
                <li
                  key={s.id}
                  className={`ob-step-item${active ? ' ob-step-active' : ''}${done ? ' ob-step-done' : ''}${locked ? ' ob-step-locked' : ''}${clickable ? ' ob-step-clickable' : ''}`}
                  onClick={() => clickable && goToStep(s.id)}
                  role="button"
                  tabIndex={clickable ? 0 : -1}
                  onKeyDown={e => e.key === 'Enter' && clickable && goToStep(s.id)}
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
          {isClientOnboardingRoute && clientSession && (
            <div className="ob-client-user-bar">
              <div className="ob-client-user-info">
                <User size={14} aria-hidden="true" />
                <span className="ob-client-user-name" title={clientSession.email}>
                  {clientSession.displayName}
                </span>
              </div>
              <button type="button" className="ob-client-logout-btn" onClick={handleClientLogout}>
                <LogOut size={14} aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
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
            sectionsComplete={enrollmentPhasesComplete}
            currentStep={currentStep}
            totalSections={PHASES.length}
          />
        </div>

        {/* Step Content */}
        <div className="ob-content">
          {isHydratingOnboarding ? (
            <div className="ob-hydration-loading" role="status" aria-live="polite">
              <div className="ob-hydration-spinner" aria-hidden="true" />
              <p>Loading your saved enrollment progress…</p>
            </div>
          ) : currentStep === 1 && (
            <StepOverview
              key={`step-1-${formDataEpoch}`}
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
          {!isHydratingOnboarding && currentStep === 2 && (
            <StepScheduleCall
              key={`step-2-${formDataEpoch}`}
              formData={formData}
              set={set}
              setFormData={setFormData}
              onNext={handleNextFromStep}
              onBack={() => goToStep(1)}
              isSubmitting={isSubmitting}
            />
          )}
          {!isHydratingOnboarding && currentStep === 3 && (
            <StepSignAgreements
              key={`step-3-${formDataEpoch}`}
              formData={formData}
              set={set}
              setFormData={setFormData}
              onNext={handleNextFromStep}
              onBack={() => goToStep(2)}
              isSubmitting={isSubmitting}
              renderNavBar={props => (
                <div className="ob-step-bottom-zone">
                  <EnrollmentSaveNotice />
                  <StepNavBar
                    className="ob-step3-nav-footer"
                    onBack={props.onBack}
                    onNext={props.onNext}
                    isSubmitting={isSubmitting}
                    canProceed={props.canProceed}
                    nextLabel={props.nextLabel}
                  />
                </div>
              )}
            />
          )}
          {!isHydratingOnboarding && currentStep === 4 && (
            <StepDueDiligence
              key={`step-4-${formDataEpoch}`}
              formData={formData}
              set={set}
              onNext={handleNextFromStep}
              onBack={() => goToStep(3)}
              isSubmitting={isSubmitting}
              practiceTypeTitle={
                formData.selectedPracticeTypes.length > 1
                  ? formatPracticeTypeTitles(formData.selectedPracticeTypes)
                  : PRACTICE_TYPES.find(p => p.id === (formData.confirmedPracticeType || formData.practiceType))?.title ?? 'Practice'
              }
              onChangePracticeType={() => {
                if (window.confirm('Changing your practice type will reset subsequent enrollment sections. Continue to Overview?')) {
                  goToStep(1);
                }
              }}
            />
          )}
          {!isHydratingOnboarding && currentStep === 5 && (
            <StepCommercialAlignment
              key={`step-5-${formDataEpoch}`}
              formData={formData}
              set={set}
              onNext={handleNextFromStep}
              onBack={() => goToStep(4)}
              isSubmitting={isSubmitting}
              practiceTypeTitle={
                formData.selectedPracticeTypes.length > 1
                  ? formatPracticeTypeTitles(formData.selectedPracticeTypes)
                  : PRACTICE_TYPES.find(p => p.id === (formData.confirmedPracticeType || formData.practiceType))?.title ?? 'Practice'
              }
              specialtyTitle={formData.primarySpecialty}
              showSpecialtyPlatform={(() => {
                const selected = formData.selectedPracticeTypes.length > 0
                  ? formData.selectedPracticeTypes
                  : [formData.confirmedPracticeType || formData.practiceType].filter(Boolean);
                return !(selected.length === 1 && selected[0] === 'asc');
              })()}
            />
          )}
          {!isHydratingOnboarding && currentStep === 6 && (
            <StepBankingPaymentSetup
              key={`step-6-${formDataEpoch}`}
              formData={formData}
              set={set}
              onNext={handleNextFromStep}
              onBack={() => goToStep(5)}
              isSubmitting={isSubmitting}
              onZohoMandatePersist={handleZohoMandatePersist}
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
            <BeginEnrollmentButtonLabel isSubmitting={isSubmitting} />
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
  const suggestedPracticeTypeIds = formData.npiApiData?.suggestedPracticeTypes ?? [];
  const isMultiPracticeTypeEditable =
    formData.npiConfirmed && suggestedPracticeTypeIds.length >= 2;

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
      const result = await lookupOnboardingNpiRegistry(formData.npi);
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
    if (prefill.selectedPracticeTypes.length > 0) {
      const label = formatPracticeTypeTitles(prefill.selectedPracticeTypes);
      toast.success(
        prefill.selectedPracticeTypes.length > 1
          ? `Practice types assigned from your NPI taxonomy: ${label}`
          : 'Practice type assigned from your NPI taxonomy',
      );
    } else {
      toast.error('We could not determine a practice type from this NPI. Please try a different NPI.');
    }
  };

  const handlePracticeTypeToggle = (id: string) => {
    if (!isMultiPracticeTypeEditable || !(suggestedPracticeTypeIds as string[]).includes(id)) return;
    const current = formData.selectedPracticeTypes;
    const isSelected = current.includes(id);
    if (isSelected && current.length <= 1) {
      toast.error('At least one practice type must remain selected');
      return;
    }
    const next = isSelected
      ? current.filter(t => t !== id)
      : sortPracticeTypeIds([...current, id]);
    set('selectedPracticeTypes', next);
    set('practiceType', next[0] || '');
  };

  const handleContinueToPathway = () => {
    if (!formData.npiConfirmed) {
      toast.error('Please verify and confirm your NPI before continuing');
      return;
    }
    if (formData.selectedPracticeTypes.length === 0) {
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

     
      <div className="ob-step-sections-bar ob-step1-sections-bar">
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
                10-digit National Provider Identifier - Type 1 (individual) or Type 2 (organization). Verified live against the CMS NPPES registry.
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
                  <ObForwardButtonLabel label="Verify NPI" loading={isNpiValidating} loadingLabel="Verifying…" showArrow={false} />
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
                        <div className="ob-npi-detail-value">{npiPanelData.taxonomyDesc || '-'}</div>
                      </div>
                      <div className="ob-npi-detail-cell">
                        <div className="ob-npi-detail-label">ENUMERATION DATE</div>
                        <div className="ob-npi-detail-value ob-npi-detail-value--bold">{npiPanelData.enumerationDate || '-'}</div>
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

                    {npiPanelData.suggestedPracticeTypes.length > 0 && (
                      <p className="ob-npi-suggest-note">
                        Practice Type{npiPanelData.suggestedPracticeTypes.length > 1 ? 's' : ''}:{' '}
                        <strong>{formatPracticeTypeTitles(npiPanelData.suggestedPracticeTypes)}</strong>
                      </p>
                    )}

                    <div className="ob-npi-panel-actions">
                      <button type="button" className="ob-npi-confirm-btn" onClick={handleNpiConfirm}>
                        Confirm - this is my practice <ObArrowRight />
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
              {formData.npiConfirmed && formData.selectedPracticeTypes.length > 0
                ? isMultiPracticeTypeEditable
                  ? 'Your practice types (assigned from NPI - uncheck any that do not apply)'
                  : 'Your practice type (assigned from NPI)'
                : 'Practice type (assigned automatically after NPI verification)'}
            </p>
            <div
              className={`ob-practice-grid${
                isMultiPracticeTypeEditable ? ' ob-practice-grid-selectable' : ' ob-practice-grid-readonly'
              }${formData.selectedPracticeTypes.length > 0 ? ' ob-practice-grid-has-selection' : ''}`}
            >
              {PRACTICE_TYPES.map(({ id, Icon, title, desc }) => {
                const isSelected = formData.selectedPracticeTypes.includes(id);
                const isToggleable =
                  isMultiPracticeTypeEditable && (suggestedPracticeTypeIds as string[]).includes(id);
                return (
                  <div
                    key={id}
                    role={isToggleable ? 'checkbox' : undefined}
                    aria-checked={isToggleable ? isSelected : undefined}
                    tabIndex={isToggleable ? 0 : undefined}
                    className={`ob-practice-card${isSelected ? ' ob-practice-selected' : ' ob-practice-unselected'}${isToggleable ? ' ob-practice-card-toggleable' : ''}`}
                    onClick={isToggleable ? () => handlePracticeTypeToggle(id) : undefined}
                    onKeyDown={
                      isToggleable
                        ? e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handlePracticeTypeToggle(id);
                            }
                          }
                        : undefined
                    }
                  >
                    <Icon size={32} strokeWidth={1.5} className="ob-practice-icon" />
                    <span className="ob-practice-title">{title}</span>
                    <span className="ob-practice-desc">{desc}</span>
                    {isSelected && (
                      <span className="ob-practice-check"><Check size={14} strokeWidth={3} /></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {showSectionAContinue && (
            <div className="ob-section-footer ob-section-footer-fixed">
              {!formData.npiConfirmed && (
                <span className="ob-footer-hint">Verify and confirm your NPI to continue</span>
              )}
              {formData.npiConfirmed && formData.selectedPracticeTypes.length === 0 && (
                <span className="ob-footer-hint">Practice type could not be determined - try a different NPI</span>
              )}
              <button
                className={`ob-btn-primary${!sectionAUnlocked ? ' ob-btn-disabled' : ''}`}
                onClick={handleContinueToPathway}
                disabled={!sectionAUnlocked}
                type="button"
              >
                <ObForwardButtonLabel label="Continue to Enrollment Pathway" />
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
            <span className="ob-pathway-footer-hint"></span>
            <button
              className="ob-btn-primary ob-pathway-review-btn"
              onClick={handlePathwayReviewed}
              type="button"
            >
              <ObForwardButtonLabel label="I have reviewed the Enrollment Pathway" />
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

      <div className="ob-step-bottom-zone ob-step-bottom-zone-step1">
        <EnrollmentSaveNotice />
        {/* Desktop Footer */}
        <div className="ob-step1-footer ob-step-footer">
          <span className="ob-footer-note"></span>
          <button
            className={`ob-btn-cta${!(sectionAComplete && sectionBComplete) ? ' ob-btn-disabled' : ''}`}
            onClick={onBeginEnrollment}
            disabled={!(sectionAComplete && sectionBComplete) || isSubmitting}
            type="button"
          >
            <BeginEnrollmentButtonLabel isSubmitting={isSubmitting} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Step 2: Schedule Intro Call ──────────────────────────────────────────────

interface StepScheduleCallProps {
  formData: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  onNext: (overrides?: Partial<OnboardingData>) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

const normalizeContactEmail = (email: string): string => email.trim().toLowerCase();

const isContactEmailVerified = (d: OnboardingData) => {
  const current = normalizeContactEmail(d.contactEmail);
  const verified = normalizeContactEmail(d.verifiedSignerEmail);
  return current.length > 0 && verified.length > 0 && current === verified;
};

const isContactSectionValid = (d: OnboardingData) =>
  d.firstName.trim().length > 0
  && d.lastName.trim().length > 0
  && d.titleRole.trim().length > 0
  && d.organizationName.trim().length > 0
  && isValidEmail(d.contactEmail)
  && isValidPhone(d.contactPhone)
  && !!d.primarySpecialty
  && d.selectedStates.length > 0
  && isContactEmailVerified(d);

const SCHEDULE_WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ScheduledCallNotes: React.FC<{ email: string; meetingLink: string }> = ({ email, meetingLink }) => (
  <>
    <p className="ob-confirm-note">A calendar invite has been sent to {email}.</p>
    {meetingLink ? (
      <p className="ob-confirm-note ob-confirm-meet-row">
        <a
          href={meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="ob-btn-primary ob-confirm-meet-btn"
        >
          Join Google Meet
        </a>
      </p>
    ) : (
      <p className="ob-confirm-note">
        Your Google Meet link is in the calendar invite from dyadcontactrequest@gmail.com.
      </p>
    )}
  </>
);

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
  const [availableSlots, setAvailableSlots] = useState<ScheduleTimeSlot[]>([]);
  const [slotsTimeZone, setSlotsTimeZone] = useState('America/Los_Angeles');
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [slotsFetchedDate, setSlotsFetchedDate] = useState('');
  const slotsRequestRef = useRef(0);
  const [bookingCall, setBookingCall] = useState(false);
  const [sendingScheduleEmail, setSendingScheduleEmail] = useState(false);
  const [scheduleRescheduleMode, setScheduleRescheduleMode] = useState(false);

  const contactEmailVerified = isContactEmailVerified(formData);

  const step2SectionsComplete = getStep2SectionsComplete(formData);
  const scheduleSelectionComplete = !!(formData.callDate && formData.callTime);
  const scheduleMatchesBooking =
    !!formData.calendlyScheduled
    && !!formData.bookedCallDate
    && !!formData.bookedCallTime
    && formData.callDate === formData.bookedCallDate
    && formData.callTime === formData.bookedCallTime;
  const showBookedCallSummary = scheduleMatchesBooking && scheduleSelectionComplete;
  const hasConfirmedSchedule =
    showBookedCallSummary
    || (scheduleSelectionComplete && formData.step2ScheduleContinued);
  const showScheduleSummaryOnly = hasConfirmedSchedule && !scheduleRescheduleMode;
  const step2DisplayComplete =
    step2SectionsComplete
    + (formData.step2FootprintContinued && !formData.step2ScheduleContinued && scheduleSelectionComplete ? 1 : 0);
  const step2ProgressPct = Math.round((step2DisplayComplete / 5) * 100);

  const contactValid = isContactSectionValid(formData);
  const orgValid = !!formData.organizationType;
  const footprintValid = !!formData.billableProviders && !!formData.locationsFacilities;
  const scheduleValid = scheduleSelectionComplete;
  const prepareValid = !!formData.engagementTimeline;
  const activeTimeZone = formData.callTimeZone || slotsTimeZone;
  const scheduleTzLabel = getTimeZoneDisplayLabel(activeTimeZone);
  const scheduleTzShort = getTimeZoneShortLabel(activeTimeZone);
  const formatScheduleTime = (time: string) =>
    formatTimeForDisplay(time, activeTimeZone || undefined);

  const clearScheduleBooking = () => ({
    calendlyScheduled: false,
    scheduleConfirmationEmailSent: false,
    callMeetingLink: '',
    googleMeetLink: '',
    meetingLink: '',
    callEventId: '',
    callCalendarId: '',
    callEventLink: '',
    bookedCallDate: '',
    bookedCallTime: '',
  });

  const buildScheduleBookingOverrides = (
    prev: OnboardingData,
    meetingLink: string,
    result: {
      eventId?: string;
      calendarId?: string;
      eventLink?: string;
    },
    wasUpdated: boolean,
  ): Partial<OnboardingData> => ({
    calendlyScheduled: true,
    callMeetingLink: meetingLink,
    googleMeetLink: meetingLink,
    meetingLink,
    callEventId: result.eventId?.trim() || prev.callEventId || '',
    callCalendarId: result.calendarId?.trim() || prev.callCalendarId || '',
    callEventLink: result.eventLink?.trim() || prev.callEventLink || '',
    bookedCallDate: prev.callDate,
    bookedCallTime: prev.callTime,
    callerName: `${prev.firstName} ${prev.lastName}`.trim(),
    callerEmail: prev.contactEmail,
    callerPhone: prev.contactPhone,
    scheduleConfirmationEmailSent: wasUpdated ? false : prev.scheduleConfirmationEmailSent,
  });

  const invalidateFromContact = () => {
    setFormData(prev => ({
      ...prev,
      step2ContactContinued: false,
      ...clearScheduleBooking(),
    }));
    setSectionAOpen(true);
    setSectionBOpen(false);
    setSectionCOpen(false);
    setSectionDOpen(false);
    setSectionEOpen(false);
    setScheduleRescheduleMode(false);
  };

  const invalidateFromOrg = () => {
    setFormData(prev => ({
      ...prev,
      step2OrgContinued: false,
      ...clearScheduleBooking(),
    }));
    setSectionBOpen(true);
    setSectionCOpen(false);
    setSectionDOpen(false);
    setSectionEOpen(false);
    setScheduleRescheduleMode(false);
  };

  const invalidateFromFootprint = () => {
    setFormData(prev => ({
      ...prev,
      step2FootprintContinued: false,
      ...clearScheduleBooking(),
    }));
    setSectionCOpen(true);
    setSectionDOpen(false);
    setSectionEOpen(false);
    setScheduleRescheduleMode(false);
  };

  const sectionBUnlocked = formData.step2ContactContinued;
  const sectionCUnlocked = formData.step2OrgContinued;
  const sectionDUnlocked = formData.step2FootprintContinued;
  const sectionEUnlocked = formData.step2ScheduleContinued;

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
    if (
      !sectionDOpen
      || scheduleRescheduleMode
      || !formData.calendlyScheduled
      || !formData.callDate
      || !formData.bookedCallDate
    ) return;
    setFormData(prev => ({
      ...prev,
      bookedCallDate: prev.callDate,
      bookedCallTime: prev.callTime,
    }));
  }, [
    sectionDOpen,
    scheduleRescheduleMode,
    formData.calendlyScheduled,
    formData.callDate,
    formData.callTime,
    formData.bookedCallDate,
    setFormData,
  ]);

  useEffect(() => {
    if (!sectionDOpen) return;
    setSlotsFetchedDate('');
    setSlotsError('');
    setAvailableSlots([]);
    setLoadingSlots(false);
    slotsRequestRef.current += 1;
    let cancelled = false;
    setLoadingDates(true);
    fetchAvailableDates()
      .then(dates => { if (!cancelled) setAvailableDates(dates); })
      .finally(() => { if (!cancelled) setLoadingDates(false); });
    return () => { cancelled = true; };
  }, [sectionDOpen]);

  const loadSlotsForDate = async (date: string) => {
    const requestId = ++slotsRequestRef.current;
    setLoadingSlots(true);
    setSlotsError('');
    setAvailableSlots([]);
    setSlotsFetchedDate(date);
    try {
      const { slots, timeZone } = await fetchAvailableTimeSlots(date);
      if (requestId !== slotsRequestRef.current) return;
      setAvailableSlots(slots);
      setSlotsTimeZone(timeZone);
      set('callTimeZone', timeZone);
    } catch (err: unknown) {
      if (requestId !== slotsRequestRef.current) return;
      setAvailableSlots([]);
      setSlotsError(
        err instanceof Error ? err.message : 'Could not load available times. Please try again.',
      );
    } finally {
      if (requestId === slotsRequestRef.current) setLoadingSlots(false);
    }
  };

  const handleScheduleDateSelect = (date: string) => {
    const dateChanged = date !== formData.callDate;
    const breaksBooking = formData.calendlyScheduled && dateChanged;
    const needsReconfirm = formData.step2ScheduleContinued || breaksBooking;

    setFormData(prev => ({
      ...prev,
      callDate: date,
      callTime: dateChanged ? '' : prev.callTime,
      callTimeZone: dateChanged ? '' : prev.callTimeZone,
      ...(needsReconfirm ? {
        step2ScheduleContinued: false,
        step2PrepareComplete: false,
      } : {}),
      ...(breaksBooking ? clearScheduleBooking() : {}),
    }));
    if (needsReconfirm) setSectionEOpen(false);
    void loadSlotsForDate(date);
  };

  const handleScheduleTimeSelect = (slot: ScheduleTimeSlot) => {
    const time = slot.id;
    const timeChanged = time !== formData.callTime;
    const breaksBooking = formData.calendlyScheduled && timeChanged;
    const needsReconfirm = formData.step2ScheduleContinued || breaksBooking;

    setFormData(prev => ({
      ...prev,
      callTime: time,
      callTimeZone: slotsTimeZone,
      ...(needsReconfirm ? {
        step2ScheduleContinued: false,
        step2PrepareComplete: false,
      } : {}),
      ...(breaksBooking ? clearScheduleBooking() : {}),
    }));
    if (needsReconfirm) setSectionEOpen(false);
  };

  const handleContactField = <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => {
    if (formData.step2ContactContinued) invalidateFromContact();
    set(k, v);
  };

  const handleContactEmailChange = (value: string) => {
    if (formData.step2ContactContinued) invalidateFromContact();
    if (normalizeContactEmail(value) !== normalizeContactEmail(formData.verifiedSignerEmail)) {
      set('verifiedSignerEmail', '');
      set('signerEmailVerified', false);
    }
    set('contactEmail', value);
  };

  const handleConfirmContactEmail = () => {
    const email = formData.contactEmail.trim();
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    set('verifiedSignerEmail', email);
    set('signerEmailVerified', true);
    toast.success('Email confirmed');
  };

  const handleOrgSelect = (id: string) => {
    if (formData.step2OrgContinued && id !== formData.organizationType) invalidateFromOrg();
    set('organizationType', id);
  };

  const handleFootprintField = (k: 'billableProviders' | 'locationsFacilities', v: string) => {
    if (formData.step2FootprintContinued) invalidateFromFootprint();
    set(k, v);
  };

  const toggleState = (state: string) => {
    if (formData.step2ContactContinued) invalidateFromContact();
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
      if (!contactEmailVerified) {
        toast.error('Please confirm your email address before continuing');
      } else {
        toast.error('Please complete all required contact fields');
      }
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

  const handleStartScheduleChange = () => {
    setScheduleRescheduleMode(true);
    setSectionDOpen(true);
    setSectionEOpen(false);
    setFormData(prev => ({
      ...prev,
      step2ScheduleContinued: false,
      step2PrepareComplete: false,
    }));
    if (formData.callDate) {
      void loadSlotsForDate(formData.callDate);
    }
  };

  const handleContinueSchedule = () => {
    if (!scheduleValid) {
      toast.error('Please select a date and time for your call');
      return;
    }
    setScheduleRescheduleMode(false);
    set('step2ScheduleContinued', true);
    setSectionDOpen(false);
    setSectionEOpen(true);
  };

  const buildScheduleBookingPayload = (): ScheduleBookingPayload => ({
    name: `${formData.firstName} ${formData.lastName}`.trim(),
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.contactEmail,
    phone: formData.contactPhone,
    organization: formData.organizationName,
    titleRole: formData.titleRole,
    primarySpecialty: formData.primarySpecialty,
    selectedStates: formData.selectedStates,
    organizationType: formData.organizationType,
    billableProviders: formData.billableProviders,
    locationsFacilities: formData.locationsFacilities,
    engagementTimeline: formData.engagementTimeline,
    engagementTimelineLabel: ENGAGEMENT_TIMELINES.find(
      t => t.value === formData.engagementTimeline,
    )?.label,
    npi: formData.npi,
    practiceType: getPracticeTypeLabel(formData),
    date: formData.callDate,
    time: formData.callTime.includes('T')
      ? formatScheduleTime(formData.callTime)
      : formData.callTime,
    slotStart: formData.callTime.includes('T') ? formData.callTime : undefined,
    timeZone: activeTimeZone,
  });

  const bookScheduleOnCalendar = async (): Promise<{
    ok: boolean;
    meetingLink: string;
    updated: boolean;
    eventId?: string;
    calendarId?: string;
    eventLink?: string;
  }> => {
    if (scheduleMatchesBooking) {
      const meetingLink = formData.callMeetingLink?.trim() || formData.googleMeetLink?.trim() || '';
      return {
        ok: true,
        meetingLink,
        updated: false,
        eventId: formData.callEventId,
        calendarId: formData.callCalendarId,
        eventLink: formData.callEventLink,
      };
    }

    const hadExistingEvent = !!formData.callEventId?.trim();
    setBookingCall(true);
    const result = await bookIntroductionCall(
      buildScheduleBookingPayload(),
      hadExistingEvent
        ? {
            existingEvent: {
              eventId: formData.callEventId ?? '',
              calendarId: formData.callCalendarId ?? '',
              eventLink: formData.callEventLink ?? '',
              meetingLink: formData.callMeetingLink ?? formData.googleMeetLink ?? '',
            },
          }
        : undefined,
    );
    setBookingCall(false);

    if (!result.success) {
      toast.error(result.message || 'Could not schedule the call on Google Calendar. Please try again.');
      return { ok: false, meetingLink: '', updated: false };
    }

    const meetingLink = result.meetingLink?.trim() || formData.callMeetingLink?.trim() || '';
    if (!meetingLink) {
      console.warn('Call booked but no meetingLink returned from calendar API', result);
    }
    if (!result.eventId?.trim() && !hadExistingEvent) {
      console.warn('Call booked but no eventId returned from /create-event', result);
    }

    const wasUpdated = !!(result.updated || hadExistingEvent);
    const bookingOverrides = buildScheduleBookingOverrides(
      formData,
      meetingLink,
      result,
      wasUpdated,
    );

    setFormData(prev => ({ ...prev, ...bookingOverrides }));

    toast.success(
      wasUpdated
        ? 'Call updated on Google Calendar.'
        : 'Call scheduled on Google Calendar.',
    );
    return {
      ok: true,
      meetingLink,
      updated: wasUpdated,
      eventId: bookingOverrides.callEventId,
      calendarId: bookingOverrides.callCalendarId,
      eventLink: bookingOverrides.callEventLink,
    };
  };

  const sendScheduleConfirmationEmail = async (meetingLink: string): Promise<boolean> => {
    try {
      const emailResult = await sendOnboardingScheduleConfirmationEmail({
        to: formData.contactEmail,
        contactName: `${formData.firstName} ${formData.lastName}`.trim(),
        dateDisplay: formatDateForDisplay(formData.callDate),
        timeDisplay: formatScheduleTime(formData.callTime),
        timezone: scheduleTzLabel,
        email: formData.contactEmail,
        phone: formData.contactPhone,
        titleRole: formData.titleRole,
        meetingLink,
      });
      if (!emailResult.success) {
        console.warn('Schedule confirmation email failed:', emailResult.error);
        toast.error(emailResult.error || 'Could not send confirmation email. Please try again.');
        return false;
      }
      set('scheduleConfirmationEmailSent', true);
      return true;
    } catch (emailErr) {
      console.warn('Schedule confirmation email failed:', emailErr);
      toast.error('Could not send confirmation email. Please try again.');
      return false;
    }
  };

  const handleMarkComplete = () => {
    if (!prepareValid) {
      toast.error('Please select your engagement timeline');
      return;
    }
    if (!scheduleValid) {
      toast.error('Please select a call date and time in Schedule Your Call');
      return;
    }
    set('step2PrepareComplete', true);
    setSectionEOpen(false);
  };

  const handleNext = async () => {
    if (!formData.step2ContactContinued) {
      toast.error('Please complete Contact Information');
      return;
    }
    if (!formData.step2OrgContinued) {
      toast.error('Please complete Organization Profile');
      return;
    }
    if (!formData.step2FootprintContinued) {
      toast.error('Please complete Organization Footprint');
      return;
    }
    if (!formData.step2ScheduleContinued) {
      toast.error('Please complete Schedule Your Call');
      return;
    }
    if (!formData.step2PrepareComplete) {
      toast.error('Please complete Prepare for Your Call');
      return;
    }
    if (!scheduleValid) {
      toast.error('Please select a call date and time in Schedule Your Call');
      return;
    }

    let meetingLink = formData.callMeetingLink?.trim() || formData.googleMeetLink?.trim() || '';
    const scheduleSlotChanged =
      !formData.calendlyScheduled
      || formData.callDate !== formData.bookedCallDate
      || formData.callTime !== formData.bookedCallTime;
    let scheduleWasUpdated = false;
    let stepSubmitOverrides: Partial<OnboardingData> | undefined;

    if (scheduleSlotChanged) {
      const booked = await bookScheduleOnCalendar();
      if (!booked.ok) return;
      meetingLink = booked.meetingLink;
      scheduleWasUpdated = booked.updated;
      stepSubmitOverrides = buildScheduleBookingOverrides(
        formData,
        meetingLink,
        booked,
        scheduleWasUpdated,
      );
    } else if (meetingLink) {
      stepSubmitOverrides = {
        callMeetingLink: meetingLink,
        googleMeetLink: meetingLink,
        meetingLink,
      };
    }

    const needsConfirmationEmail =
      scheduleSlotChanged
      || scheduleWasUpdated
      || !formData.scheduleConfirmationEmailSent;

    if (needsConfirmationEmail) {
      setSendingScheduleEmail(true);
      const emailed = await sendScheduleConfirmationEmail(meetingLink);
      setSendingScheduleEmail(false);
      if (!emailed) return;
      stepSubmitOverrides = {
        ...stepSubmitOverrides,
        scheduleConfirmationEmailSent: true,
      };
    }

    await onNext(stepSubmitOverrides);
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
            ? 'In progress - complete to continue'
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

      <div className="ob-step-sections-bar ob-step2-sections-bar">
        <EnrollmentSectionsBarRow
          progressPct={step2ProgressPct}
          sectionsComplete={step2DisplayComplete}
          totalSections={5}
        />
      </div>

      <div className="ob-step2-sections">
        {/* Section 1 - Contact Information */}
        <div className={`ob-section-card${sectionAOpen ? ' ob-section-expanded' : ''}${statesOpen ? ' ob-states-panel-open' : ''}${formData.step2ContactContinued ? ' ob-section-complete' : ''}`}>
          {renderSectionHeader(
            '1', 'Contact Information', true, formData.step2ContactContinued, sectionAOpen,
            '', () => setSectionAOpen(!sectionAOpen),
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
                    className="ob-input ob-input-readonly"
                    placeholder="Legal or d/b/a name"
                    value={formData.organizationName}
                    readOnly
                    aria-readonly="true"
                  />
                </div>
              </div>
              <div className="ob-form-row">
                <div className="ob-field">
                  <label className="ob-label">Email Address <span className="ob-req">*</span></label>
                  <div className="ob-otp-email-row">
                    <input
                      type="email"
                      className="ob-input"
                      placeholder="you@practice.com"
                      value={formData.contactEmail}
                      onChange={e => handleContactEmailChange(e.target.value)}
                      disabled={contactEmailVerified}
                    />
                    {!contactEmailVerified && (
                      <button
                        type="button"
                        className="ob-btn-primary ob-otp-send-btn"
                        onClick={handleConfirmContactEmail}
                        disabled={!isValidEmail(formData.contactEmail)}
                      >
                        <ObForwardButtonLabel
                          label="Confirm Email"
                          showArrow={false}
                        />
                      </button>
                    )}
                  </div>
                  {contactEmailVerified && (
                    <p className="ob-otp-verified">Email confirmed</p>
                  )}
                  {!contactEmailVerified && formData.contactEmail.trim() && (
                    <p className="ob-field-hint">
                      Confirm your email address before continuing to the next section.
                    </p>
                  )}
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
                  <ObForwardButtonLabel label="Continue to Organization Profile" />
                </button>
              </div>
            )}
          </SectionCollapse>
        </div>

        {/* Section 2 - Organization Profile */}
        <div className={`ob-section-card${sectionBOpen ? ' ob-section-expanded' : ''}${!sectionBUnlocked ? ' ob-section-locked' : ''}${formData.step2OrgContinued ? ' ob-section-complete' : ''}`}>
          {renderSectionHeader(
            '2', 'Organization Profile', sectionBUnlocked, formData.step2OrgContinued, sectionBOpen,
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
                  <ObForwardButtonLabel label="Continue to Organization Footprint" />
                </button>
              </div>
            )}
          </SectionCollapse>
        </div>

        {/* Section 3 - Organization Footprint */}
        <div className={`ob-section-card${sectionCOpen ? ' ob-section-expanded' : ''}${!sectionCUnlocked ? ' ob-section-locked' : ''}${formData.step2FootprintContinued ? ' ob-section-complete' : ''}`}>
          {renderSectionHeader(
            '3', 'Organization Footprint', sectionCUnlocked, formData.step2FootprintContinued, sectionCOpen,
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
                  <ObForwardButtonLabel label="Continue to Schedule Your Call" />
                </button>
              </div>
            )}
          </SectionCollapse>
        </div>

        {/* Section 4 - Schedule Your Call */}
        <div className={`ob-section-card${sectionDOpen ? ' ob-section-expanded' : ''}${!sectionDUnlocked ? ' ob-section-locked' : ''}${formData.step2ScheduleContinued ? ' ob-section-complete' : ''}`}>
          {renderSectionHeader(
            '4', 'Schedule Your Call', sectionDUnlocked, formData.step2ScheduleContinued, sectionDOpen,
            'Complete Section 3 to unlock',
            () => (formData.step2ScheduleContinued || showBookedCallSummary) && setSectionDOpen(!sectionDOpen),
          )}
          {showBookedCallSummary && !scheduleRescheduleMode && (
            <div className="ob-section-status-bar">
              <div className="ob-confirm-box ob-confirm-box-with-action">
                <CheckCircle2 size={18} className="ob-check-green" />
                <div className="ob-confirm-box-content">
                  <strong>Call Scheduled</strong>
                  <span>
                    {' '}{formatDateForDisplay(formData.callDate)} at {formatScheduleTime(formData.callTime)} {scheduleTzShort}
                  </span>
                  <ScheduledCallNotes
                    email={formData.contactEmail}
                    meetingLink={formData.callMeetingLink}
                  />
                </div>
                <button
                  type="button"
                  className="ob-schedule-change-btn"
                  onClick={handleStartScheduleChange}
                >
                  Change date and time
                </button>
              </div>
            </div>
          )}
          <SectionCollapse open={sectionDOpen}>
            <div className="ob-section-body">
              {showScheduleSummaryOnly ? (
                <>
                  <p className="ob-section-desc">
                    Your introduction call is set for the time below. You can change it anytime before continuing to the next step.
                  </p>
                  <div className="ob-confirm-box ob-confirm-box-inline ob-confirm-box-with-action">
                    <CheckCircle2 size={18} className="ob-check-green" />
                    <div className="ob-confirm-box-content">
                      <strong>{showBookedCallSummary ? 'Call Scheduled' : 'Time Selected'}</strong>
                      <span>
                        {' '}{formatDateForDisplay(formData.callDate)} at {formatScheduleTime(formData.callTime)} {scheduleTzShort}
                      </span>
                      {showBookedCallSummary && (
                        <ScheduledCallNotes
                          email={formData.contactEmail}
                          meetingLink={formData.callMeetingLink}
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      className="ob-schedule-change-btn"
                      onClick={handleStartScheduleChange}
                    >
                      Change date and time
                    </button>
                  </div>
                </>
              ) : (
                <>
              <p className="ob-section-desc">
                {scheduleRescheduleMode
                  ? 'Pick a new date and time to update your scheduled call. All times are displayed in '
                  : 'Select an available 30-minute time slot to connect with Dyad&apos;s enrollment team. All times are displayed in '}
                {scheduleTzLabel}.
              </p>
              <div className="ob-gcal-schedule">
                <div className={`ob-gcal-picker ob-gcal-picker--step2${formData.callDate ? ' ob-gcal-picker-with-times' : ''}`}>
                  <div className="ob-gcal-picker-calendar">
                    <h4 className="ob-gcal-heading">
                      <Calendar size={16} />
                      Select a Date
                    </h4>
                    <p className="ob-gcal-hint">
                      Choose any available day within the next {SCHEDULE_DAYS_AHEAD} days.
                    </p>
                    <div className="ob-gcal-picker-row">
                      <div className="ob-gcal-picker-calendar-col">
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
                        <div className="ob-gcal-picker-times">
                          <p className="ob-gcal-times-label">
                            <Clock size={14} aria-hidden="true" />
                            Available times · {formatDateForDisplay(formData.callDate)}
                          </p>
                          {slotsFetchedDate === formData.callDate && loadingSlots ? (
                            <p className="ob-gcal-loading">Loading times…</p>
                          ) : slotsFetchedDate === formData.callDate && slotsError ? (
                            <p className="ob-gcal-error">{slotsError}</p>
                          ) : slotsFetchedDate === formData.callDate && availableSlots.length === 0 ? (
                            <p className="ob-gcal-empty">No times available. Choose another day.</p>
                          ) : slotsFetchedDate === formData.callDate ? (
                            <div className="ob-gcal-time-list" role="listbox" aria-label="Available time slots">
                              {availableSlots.map(slot => (
                                <ScheduleTimeSlotTile
                                  key={slot.id}
                                  dateKey={formData.callDate}
                                  timeLabel={slot.label}
                                  selected={formData.callTime === slot.id}
                                  onClick={() => handleScheduleTimeSelect(slot)}
                                />
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
              {scheduleSelectionComplete && !showBookedCallSummary && (
                <div className="ob-confirm-box ob-confirm-box-inline">
                  <CheckCircle2 size={18} className="ob-check-green" />
                  <div>
                    <strong>Time Selected</strong>
                    <span>
                      {' '} {formatDateForDisplay(formData.callDate)} at {formatScheduleTime(formData.callTime)} {scheduleTzShort}
                    </span>
                  </div>
                </div>
              )}
                </>
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
                  <ObForwardButtonLabel label="Continue to Prepare for Your Call" />
                </button>
              </div>
            )}
          </SectionCollapse>
        </div>

        {/* Section 5 - Prepare for Your Call */}
        <div className={`ob-section-card${sectionEOpen ? ' ob-section-expanded' : ''}${!sectionEUnlocked ? ' ob-section-locked' : ''}${formData.step2PrepareComplete ? ' ob-section-complete' : ''}`}>
          {renderSectionHeader(
            '5', 'Prepare for Your Call', sectionEUnlocked, formData.step2PrepareComplete, sectionEOpen,
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
            {sectionEOpen && !formData.step2PrepareComplete && (
              <div className="ob-section-footer ob-section-footer-fixed">
                <button
                  className={`ob-btn-primary${!prepareValid ? ' ob-btn-disabled' : ''}`}
                  onClick={handleMarkComplete}
                  disabled={!prepareValid}
                  type="button"
                >
                  <ObForwardButtonLabel label="Mark Complete" />
                </button>
              </div>
            )}
          </SectionCollapse>
        </div>
      </div>

      <div className="ob-step-bottom-zone">
        <EnrollmentSaveNotice />
        <StepNavBar
          className="ob-step2-nav-footer"
          onBack={onBack}
          onNext={handleNext}
          isSubmitting={isSubmitting || bookingCall || sendingScheduleEmail}
          submittingLabel={
            sendingScheduleEmail
              ? 'Sending confirmation email…'
              : bookingCall
                ? 'Scheduling your call…'
                : undefined
          }
          canProceed={
            formData.step2ContactContinued
            && formData.step2OrgContinued
            && formData.step2FootprintContinued
            && formData.step2ScheduleContinued
            && formData.step2PrepareComplete
          }
          nextLabel="Continue to Sign Confidentiality & BAA"
        />
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
  submittingLabel?: string;
}

const StepNavBar: React.FC<StepNavBarProps & { className?: string }> = ({
  onBack, onNext, isSubmitting, canProceed, nextLabel = 'Save & Continue', submittingLabel, className = '',
}) => (
  <div className={`ob-step-footer ob-step-nav-footer${className ? ` ${className}` : ''}`}>
    <button className="ob-btn-ghost" onClick={onBack} type="button">
      <ObBackButtonLabel label="Back" />
    </button>
    <button
      className={`ob-btn-primary${!canProceed ? ' ob-btn-disabled' : ''}`}
      onClick={onNext}
      disabled={!canProceed || isSubmitting}
      type="button"
    >
      <ObForwardButtonLabel
        label={nextLabel}
        loading={isSubmitting}
        loadingLabel={submittingLabel ?? 'Saving…'}
      />
    </button>
  </div>
);

export default DyadOnboarding;

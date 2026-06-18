import type { OnboardingData } from '../pages/DyadOnboarding';
import { normalizeMeetLink } from '../utils/calendarMeetLink';

/**
 * Canonical onboarding persistence shape — matches GET /onboarding/:id API response.
 * Backend may return the same structure with step1–step6 buckets plus root metadata.
 */
export interface OnboardingStorageRecord {
  onboardingId: string;
  contactEmail: string;
  currentStep: number;
  highestStepReached: number;
  updatedAt: string;
  step1: Record<string, unknown>;
  step2: Record<string, unknown>;
  step3: Record<string, unknown>;
  step4: Record<string, unknown>;
  step5: Record<string, unknown>;
  step6: Record<string, unknown>;
}

export const ONBOARDING_STORAGE_KEY = 'dyad_onboarding_v1';
export const ONBOARDING_STEP_KEY = 'dyad_onboarding_step_v1';
export const ONBOARDING_HIGHEST_STEP_KEY = 'dyad_onboarding_highest_step_v1';

const STEP_KEYS = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'] as const;
type StepBucketKey = (typeof STEP_KEYS)[number];

export const stepNumberToBucketKey = (step: number): StepBucketKey | null => {
  if (step >= 1 && step <= STEP_KEYS.length) return `step${step}` as StepBucketKey;
  return null;
};

export interface StepSubmitMeta {
  currentStep: number;
  highestStepReached: number;
  onboardingId?: string;
}

/** Fields grouped by enrollment step (source of truth for API + localStorage). */
export const ONBOARDING_STEP_FIELD_MAP: Record<StepBucketKey, (keyof OnboardingData)[]> = {
  step1: [
    'npi', 'npiConfirmed', 'npiEnumerationType', 'npiApiData', 'practiceType',
    'selectedPracticeTypes', 'confirmedPracticeType', 'sectionAContinued', 'enrollmentPathwayViewed',
  ],
  step2: [
    'firstName', 'lastName', 'titleRole', 'organizationName', 'contactEmail', 'contactPhone',
    'primarySpecialty', 'selectedStates', 'organizationType', 'step2ContactContinued',
    'billableProviders', 'locationsFacilities', 'step2OrgContinued', 'step2FootprintContinued',
    'calendlyScheduled', 'scheduleConfirmationEmailSent', 'step2ScheduleContinued',
    'engagementTimeline', 'step2PrepareComplete', 'callDate', 'callTime', 'callTimeZone',
    'callMeetingLink', 'googleMeetLink', 'meetingLink', 'meetLink', 'joinUrl',
    'callEventId', 'callCalendarId', 'callEventLink', 'bookedCallDate',
    'bookedCallTime', 'callerName', 'callerEmail', 'callerPhone',
  ],
  step3: [
    'step3EntityComplete', 'step3NdaComplete', 'step3BaaComplete', 'signerEmailVerified',
    'verifiedSignerEmail', 'entityLegalName', 'entityType', 'entityFormationState', 'entityStreet',
    'entityCity', 'entityAddrState', 'entityZip', 'signerFirstName', 'signerLastName',
    'signerTitle', 'signerEmail', 'ndaFields', 'baaFields', 'ndaAcceptedRecordId', 'ndaAcceptedAt',
    'baaAcceptedRecordId', 'baaAcceptedAt', 'confidentialityAgreed', 'baaAgreed', 'baaSignature',
    'groupLegalName', 'practiceAddress', 'city', 'state', 'zip',
  ],
  step4: [
    'taxId', 'providerCount', 'website', 'step4ProviderConfirmed', 'step4FinancialConfirmed',
    'step4DocsConfirmed', 'ddMidLevelProviders', 'ddAllProvidersCredentialed', 'ddFacilityId',
    'ddFacilityTin', 'ddOperatingRooms', 'ddCredentialedProviders', 'ddSpecialtiesPerformed',
    'ddFacilityOwnership', 'annualCaseVolume', 'annualGrossCollections', 'inNetworkPayerContracts',
    'ddPayerCommercial', 'ddPayerMedicare', 'ddPayerPI', 'ddPayerCash', 'reportAvailabilityNotes',
    'ddDocuments',
  ],
  step5: [
    'proposalReviewed', 'commercialDecision', 'discussQuestions', 'discussContactPref',
    'step5EntityComplete', 'step5MsaComplete', 'step5CarriedExhibitAComplete',
    'step5CarriedExhibitBComplete', 'step5ExhibitCComplete', 'step5FeeScheduleComplete',
    'step5MsaAttested', 'step5ExhibitCAttested', 'step5FeeScheduleAttested',
    'msaFields', 'exhibitCFields', 'feeScheduleFields', 'msaAttestMeta', 'msaAttestRecordId',
    'exhibitCAttestMeta', 'exhibitCAttestRecordId', 'feeScheduleAttestMeta', 'feeScheduleAttestRecordId',
    'msaPackageAgreed', 'msaPackageExecuted', 'msaPackageRecordId', 'msaPackageExecutedAt',
    'estimatedMonthlyClaims', 'primaryPayerMix', 'msaAgreed', 'msaSignature',
    'msaProviderSignatureImage', 'contractStartDate',
  ],
  step6: [
    'step6Sec1Attested', 'step6Sec1Complete', 'step6CipDob', 'step6CipSsn', 'step6CipCitizenship', 'step6CipResAddress',
    'step6CipResCity', 'step6CipResState', 'step6CipResZip', 'step6Sec2Attested', 'step6Sec2Complete', 'w9Line1', 'w9Line2',
    'w9TaxClass', 'w9LlcClass', 'w9OtherDesc', 'w9Line5', 'w9Line6', 'w9TinType', 'w9Tin',
    'w9EsignConsent', 'w9IrsCert', 'w9AuthDist', 'w9Signature', 'w9Signed', 'w9SignedAt', 'w9SignedHash',
    'w9Item2Flagged', 'achBankPhone', 'achBankAddress', 'achMandateActive', 'achMandateId',
    'achMandateActivatedAt', 'achDebitAuthorized', 'zohoCustomerId', 'zohoPaymentMethodId', 'zohoPaymentMethodType',
    'step6Sec4Attested', 'step6Sec4Complete', 'sweepUseSection4', 'sweepOtherBankName',
    'sweepOtherAcctType', 'sweepOtherRouting', 'sweepOtherAccount', 'step6Sec5Attested', 'step6Sec5Complete',
    'kycDocuments', 'step6Sec6Attested', 'step6Sec6Complete', 'step6EnrollmentComplete', 'step6ConfirmationId',
    'accountHolderName', 'bankName', 'routingNumber', 'accountNumber', 'accountType',
  ],
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const snakeToCamelKey = (key: string): string =>
  key.replace(/_([a-z0-9])/gi, (_, char: string) => char.toUpperCase());

export const deepCamelizeKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(deepCamelizeKeys);
  if (!isPlainObject(value)) return value;
  const out: Record<string, unknown> = {};
  Object.entries(value).forEach(([key, child]) => {
    out[snakeToCamelKey(key)] = deepCamelizeKeys(child);
  });
  return out;
};

const ONBOARDING_BOOL_FIELD_SET = new Set<string>([
  'npiConfirmed', 'sectionAContinued', 'enrollmentPathwayViewed',
  'step2ContactContinued', 'step2OrgContinued', 'step2FootprintContinued',
  'calendlyScheduled', 'scheduleConfirmationEmailSent', 'step2ScheduleContinued', 'step2PrepareComplete',
  'step3EntityComplete', 'step3NdaComplete', 'step3BaaComplete', 'signerEmailVerified',
  'confidentialityAgreed', 'baaAgreed',
  'step4ProviderConfirmed', 'step4FinancialConfirmed', 'step4DocsConfirmed',
  'proposalReviewed', 'step5EntityComplete', 'step5MsaComplete', 'step5CarriedExhibitAComplete',
  'step5CarriedExhibitBComplete', 'step5ExhibitCComplete', 'step5FeeScheduleComplete',
  'step5MsaAttested', 'step5ExhibitCAttested', 'step5FeeScheduleAttested',
  'msaPackageAgreed', 'msaPackageExecuted', 'msaAgreed',
  'step6Sec1Attested', 'step6Sec1Complete', 'step6Sec2Attested', 'step6Sec2Complete',
  'w9EsignConsent', 'w9IrsCert', 'w9AuthDist', 'w9Signed', 'w9Item2Flagged', 'achMandateActive', 'achDebitAuthorized',
  'step6Sec4Attested', 'step6Sec4Complete', 'sweepUseSection4', 'step6Sec5Attested', 'step6Sec5Complete',
  'step6Sec6Attested', 'step6Sec6Complete', 'step6EnrollmentComplete',
]);

const ONBOARDING_ARRAY_FIELD_SET = new Set<string>(['selectedStates', 'selectedPracticeTypes']);

export const coerceOnboardingBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
    if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === '') return false;
  }
  return Boolean(value);
};

const coerceStepFieldValue = (field: string, value: unknown): unknown => {
  if (value === undefined || value === null) return value;
  if (ONBOARDING_BOOL_FIELD_SET.has(field)) return coerceOnboardingBoolean(value);
  if (ONBOARDING_ARRAY_FIELD_SET.has(field)) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim()) return [value];
    return [];
  }
  return value;
};

const coerceStepBucket = (
  step: StepBucketKey,
  bucket: Record<string, unknown>,
): Record<string, unknown> => {
  const camelized = deepCamelizeKeys(bucket) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  ONBOARDING_STEP_FIELD_MAP[step].forEach((field) => {
    const raw = camelized[field];
    if (raw !== undefined && raw !== null) {
      out[field] = coerceStepFieldValue(field, raw);
    }
  });
  return out;
};

/** Normalize any record to canonical localStorage shape with known fields only. */
export const coerceOnboardingStorageRecord = (record: OnboardingStorageRecord): OnboardingStorageRecord => {
  const coerced = emptyOnboardingStorageRecord();
  coerced.onboardingId = String(record.onboardingId ?? '');
  coerced.contactEmail = String(record.contactEmail ?? '');
  coerced.currentStep = Number(record.currentStep) || 1;
  coerced.highestStepReached = Math.max(
    Number(record.highestStepReached) || 1,
    coerced.currentStep,
  );
  coerced.updatedAt = typeof record.updatedAt === 'string' ? record.updatedAt : new Date().toISOString();
  STEP_KEYS.forEach((step) => {
    coerced[step] = coerceStepBucket(step, record[step] ?? {});
  });
  return coerced;
};

const ONBOARDING_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const pickOnboardingIdFromRecord = (record: Record<string, unknown>): string | null => {
  const candidates = [record.onboardingId, record.onboarding_id];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  if (typeof record.id === 'string' && ONBOARDING_ID_RE.test(record.id.trim())) {
    return record.id.trim();
  }
  return null;
};

export const extractOnboardingId = (data: unknown): string | null => {
  if (!data || typeof data !== 'object') return null;
  const root = data as Record<string, unknown>;
  const direct = pickOnboardingIdFromRecord(root);
  if (direct) return direct;
  const nested = root.data;
  if (nested && typeof nested === 'object') {
    const fromNested = pickOnboardingIdFromRecord(nested as Record<string, unknown>);
    if (fromNested) return fromNested;
  }
  return null;
};

/** Walk API payloads (e.g. check-email) for a UUID onboarding id. */
export const findOnboardingIdDeep = (data: unknown, depth = 0): string | null => {
  if (depth > 8 || data == null) return null;
  const direct = extractOnboardingId(data);
  if (direct) return direct;
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findOnboardingIdDeep(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (!isPlainObject(data)) return null;
  for (const value of Object.values(data)) {
    const found = findOnboardingIdDeep(value, depth + 1);
    if (found) return found;
  }
  return null;
};

/** Cross-step derivations so hydrated / stored data fully prefills downstream forms. */
export const applyOnboardingDerivations = (
  flat: Partial<OnboardingData>,
): Partial<OnboardingData> => {
  const next: Partial<OnboardingData> = { ...flat };

  if (next.step2ContactContinued && next.contactEmail?.trim() && !next.verifiedSignerEmail?.trim()) {
    next.verifiedSignerEmail = next.contactEmail.trim();
    next.signerEmailVerified = true;
  }
  if (!next.signerEmail?.trim() && next.contactEmail?.trim()) {
    next.signerEmail = next.contactEmail.trim();
  }
  if (!next.signerFirstName?.trim() && next.firstName?.trim()) next.signerFirstName = next.firstName;
  if (!next.signerLastName?.trim() && next.lastName?.trim()) next.signerLastName = next.lastName;
  if (!next.signerTitle?.trim() && next.titleRole?.trim()) next.signerTitle = next.titleRole;

  const legalName = next.entityLegalName?.trim()
    || next.groupLegalName?.trim()
    || next.organizationName?.trim()
    || '';
  if (!next.entityLegalName?.trim() && legalName) next.entityLegalName = legalName;
  if (!next.groupLegalName?.trim() && next.entityLegalName?.trim()) next.groupLegalName = next.entityLegalName;

  const street = next.entityStreet?.trim() || next.practiceAddress?.trim() || '';
  if (!next.entityStreet?.trim() && street) next.entityStreet = street;
  if (!next.practiceAddress?.trim() && next.entityStreet?.trim()) next.practiceAddress = next.entityStreet;
  if (!next.entityCity?.trim() && next.city?.trim()) next.entityCity = next.city;
  if (!next.city?.trim() && next.entityCity?.trim()) next.city = next.entityCity;
  if (!next.entityAddrState?.trim() && next.state?.trim()) next.entityAddrState = next.state;
  if (!next.state?.trim() && next.entityAddrState?.trim()) next.state = next.entityAddrState;
  if (!next.entityZip?.trim() && next.zip?.trim()) next.entityZip = next.zip;
  if (!next.zip?.trim() && next.entityZip?.trim()) next.zip = next.entityZip;

  if (!next.callerName?.trim() && next.firstName?.trim()) {
    next.callerName = `${next.firstName} ${next.lastName ?? ''}`.trim();
  }
  if (!next.callerEmail?.trim() && next.contactEmail?.trim()) next.callerEmail = next.contactEmail;
  if (!next.callerPhone?.trim() && next.contactPhone?.trim()) next.callerPhone = next.contactPhone;

  const meetLink = normalizeMeetLink(next.callMeetingLink)
    || normalizeMeetLink(next.googleMeetLink)
    || normalizeMeetLink(next.meetingLink)
    || normalizeMeetLink(next.meetLink)
    || normalizeMeetLink(next.joinUrl);
  if (meetLink) {
    next.callMeetingLink = meetLink;
    next.googleMeetLink = meetLink;
    next.meetingLink = meetLink;
  }

  return next;
};

export interface ProcessOnboardingApiOptions {
  email?: string;
  mergeWithLocal?: boolean;
  persist?: boolean;
  localRecord?: OnboardingStorageRecord;
}

/**
 * Process any API response into canonical localStorage format, merge with local,
 * persist, and return the storage record ready for form prepopulation.
 */
export const processOnboardingApiResponse = (
  apiRaw: unknown,
  options: ProcessOnboardingApiOptions = {},
): OnboardingStorageRecord => {
  const {
    email,
    mergeWithLocal = true,
    persist = true,
    localRecord,
  } = options;

  const local = coerceOnboardingStorageRecord(localRecord ?? readOnboardingStorageRecord());
  const apiRecord = coerceOnboardingStorageRecord(apiPayloadToStorageRecord(apiRaw));

  const onboardingId = extractOnboardingId(apiRaw) ?? apiRecord.onboardingId;
  if (onboardingId) apiRecord.onboardingId = onboardingId;
  if (email && !apiRecord.contactEmail) apiRecord.contactEmail = email;

  const merged = mergeWithLocal
    ? coerceOnboardingStorageRecord(mergeOnboardingStorageRecords(local, apiRecord))
    : apiRecord;

  if (email && !merged.contactEmail) merged.contactEmail = email;
  if (onboardingId) merged.onboardingId = onboardingId;

  if (apiRecord.currentStep > 0) {
    merged.currentStep = apiRecord.currentStep;
  }
  if (apiRecord.highestStepReached > 0) {
    merged.highestStepReached = Math.max(apiRecord.highestStepReached, merged.currentStep);
  }

  if (persist) writeOnboardingStorageRecord(merged);
  return merged;
};

/** Storage record → flat form partial with cross-step derivations applied. */
export const storageRecordToFormPartial = (
  record: OnboardingStorageRecord,
): Partial<OnboardingData> & { currentStep?: number; highestStepReached?: number } =>
  applyOnboardingDerivations(flattenOnboardingStorageRecord(record));

export const isEmptyStorageValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (typeof value === 'boolean') return false;
  if (typeof value === 'number') return false;
  if (Array.isArray(value)) return value.length === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return false;
};

const pickStepFields = (data: Partial<OnboardingData>, step: StepBucketKey): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  ONBOARDING_STEP_FIELD_MAP[step].forEach((field) => {
    const value = data[field];
    if (value !== undefined) out[field] = value;
  });
  return out;
};

/** Mirror Google Meet URL under aliases the admin outreach API expects. */
export const enrichStep2MeetingLinkFields = (
  bucket: Record<string, unknown>,
): Record<string, unknown> => {
  const linkKeys = ['callMeetingLink', 'googleMeetLink', 'meetingLink', 'meetLink', 'joinUrl'] as const;
  let link = '';
  for (const key of linkKeys) {
    link = normalizeMeetLink(bucket[key]);
    if (link) break;
  }
  if (!link) return bucket;
  return {
    ...bucket,
    callMeetingLink: link,
    googleMeetLink: link,
    meetingLink: link,
    meetLink: link,
    joinUrl: link,
  };
};

const mergeStorageValue = (local: unknown, remote: unknown): unknown => {
  if (isPlainObject(local) && isPlainObject(remote)) {
    const keys = new Set([...Object.keys(local), ...Object.keys(remote)]);
    const out: Record<string, unknown> = {};
    keys.forEach((key) => {
      out[key] = mergeStorageValue(local[key], remote[key]);
    });
    return out;
  }
  if (!isEmptyStorageValue(remote)) return remote;
  return local;
};

const emptyStepBuckets = (): Record<StepBucketKey, Record<string, unknown>> => ({
  step1: {}, step2: {}, step3: {}, step4: {}, step5: {}, step6: {},
});

export const emptyOnboardingStorageRecord = (): OnboardingStorageRecord => ({
  onboardingId: '',
  contactEmail: '',
  currentStep: 1,
  highestStepReached: 1,
  updatedAt: new Date().toISOString(),
  ...emptyStepBuckets(),
});

/**
 * Payload for POST /onboarding/step/:n.
 * Same shape as localStorage: root meta + single step bucket (step1–step6).
 */
export const buildStepSubmitPayload = (
  step: number,
  data: OnboardingData,
  meta: StepSubmitMeta,
): Record<string, unknown> => {
  const bucketKey = stepNumberToBucketKey(step);
  if (!bucketKey) return {};

  let stepBucket = pickStepFields(data, bucketKey);
  if (bucketKey === 'step2') {
    stepBucket = enrichStep2MeetingLinkFields(stepBucket);
  }

  return {
    onboardingId: meta.onboardingId ?? data.onboardingId ?? '',
    contactEmail: data.contactEmail ?? '',
    currentStep: meta.currentStep,
    highestStepReached: meta.highestStepReached,
    updatedAt: new Date().toISOString(),
    [bucketKey]: stepBucket,
  };
};

/** Flat OnboardingData → canonical step-bucketed JSON for localStorage / API. */
export const buildOnboardingStorageRecord = (
  data: OnboardingData,
  meta: { currentStep: number; highestStepReached: number },
): OnboardingStorageRecord => ({
  onboardingId: data.onboardingId ?? '',
  contactEmail: data.contactEmail ?? '',
  currentStep: meta.currentStep,
  highestStepReached: meta.highestStepReached,
  updatedAt: new Date().toISOString(),
  step1: pickStepFields(data, 'step1'),
  step2: pickStepFields(data, 'step2'),
  step3: pickStepFields(data, 'step3'),
  step4: pickStepFields(data, 'step4'),
  step5: pickStepFields(data, 'step5'),
  step6: pickStepFields(data, 'step6'),
});

/** Step buckets + root meta → flat partial for form state. */
export const flattenOnboardingStorageRecord = (
  record: OnboardingStorageRecord,
): Partial<OnboardingData> & {
  currentStep?: number;
  highestStepReached?: number;
} => {
  const flat: Record<string, unknown> = {
    onboardingId: record.onboardingId,
    contactEmail: record.contactEmail,
    currentStep: record.currentStep,
    highestStepReached: record.highestStepReached,
  };
  STEP_KEYS.forEach((step) => {
    Object.assign(flat, record[step]);
  });
  return flat as Partial<OnboardingData> & { currentStep?: number; highestStepReached?: number };
};

const distributeFlatFields = (flat: Record<string, unknown>): OnboardingStorageRecord => {
  const record = emptyOnboardingStorageRecord();
  STEP_KEYS.forEach((step) => {
    ONBOARDING_STEP_FIELD_MAP[step].forEach((field) => {
      if (flat[field] !== undefined) {
        record[step][field] = flat[field];
      }
    });
  });
  record.onboardingId = String(flat.onboardingId ?? record.onboardingId ?? '');
  record.contactEmail = String(flat.contactEmail ?? record.contactEmail ?? '');
  record.currentStep = Number(flat.currentStep ?? flat.lastStep ?? flat.activeStep ?? record.currentStep) || 1;
  record.highestStepReached = Number(
    flat.highestStepReached ?? flat.highestStep ?? flat.maxStepReached ?? record.highestStepReached,
  ) || record.currentStep;
  record.updatedAt = typeof flat.updatedAt === 'string' ? flat.updatedAt : record.updatedAt;
  return record;
};

/** Accept canonical buckets, legacy flat JSON, or API payloads. */
export const normalizeToStorageRecord = (raw: unknown): OnboardingStorageRecord => {
  if (!raw || typeof raw !== 'object') return emptyOnboardingStorageRecord();

  const root = raw as Record<string, unknown>;
  const hasBuckets = STEP_KEYS.some(step => isPlainObject(root[step]));

  if (hasBuckets) {
    const record = emptyOnboardingStorageRecord();
    record.onboardingId = String(root.onboardingId ?? '');
    record.contactEmail = String(root.contactEmail ?? '');
    record.currentStep = Number(root.currentStep ?? root.lastStep ?? root.activeStep ?? 1) || 1;
    record.highestStepReached = Number(
      root.highestStepReached ?? root.highestStep ?? root.maxStepReached ?? record.currentStep,
    ) || record.currentStep;
    record.updatedAt = typeof root.updatedAt === 'string' ? root.updatedAt : new Date().toISOString();
    STEP_KEYS.forEach((step) => {
      if (isPlainObject(root[step])) {
        record[step] = coerceStepBucket(step, root[step] as Record<string, unknown>);
      }
    });
    return coerceOnboardingStorageRecord(record);
  }

  const flat: Record<string, unknown> = { ...root };
  STEP_KEYS.forEach((step) => {
    if (isPlainObject(root[step])) {
      Object.assign(flat, root[step] as Record<string, unknown>);
    }
  });
  return coerceOnboardingStorageRecord(distributeFlatFields(flat));
};

/** API/local merge: remote fills empty local fields; remote wins when both have values. */
export const mergeOnboardingStorageRecords = (
  local: OnboardingStorageRecord,
  remote: OnboardingStorageRecord,
): OnboardingStorageRecord => {
  const merged = emptyOnboardingStorageRecord();
  merged.onboardingId = String(remote.onboardingId || local.onboardingId || '');
  merged.contactEmail = String(remote.contactEmail || local.contactEmail || '');
  merged.currentStep = remote.currentStep > 0 ? remote.currentStep : (local.currentStep || 1);
  if (remote.highestStepReached > 0) {
    merged.highestStepReached = Math.max(remote.highestStepReached, merged.currentStep);
  } else {
    merged.highestStepReached = Math.max(
      local.highestStepReached || 1,
      merged.currentStep,
    );
  }
  merged.updatedAt = remote.updatedAt || local.updatedAt || new Date().toISOString();

  STEP_KEYS.forEach((step) => {
    merged[step] = mergeStorageValue(local[step], remote[step]) as Record<string, unknown>;
  });

  return merged;
};

export const readOnboardingStorageRecord = (): OnboardingStorageRecord => {
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return emptyOnboardingStorageRecord();
    return normalizeToStorageRecord(JSON.parse(raw));
  } catch {
    return emptyOnboardingStorageRecord();
  }
};

export const readOnboardingStepMeta = (record?: OnboardingStorageRecord): {
  currentStep: number;
  highestStepReached: number;
} => {
  const stored = record ?? readOnboardingStorageRecord();
  let currentStep = stored.currentStep;
  let highestStepReached = stored.highestStepReached;

  try {
    const stepRaw = localStorage.getItem(ONBOARDING_STEP_KEY);
    const highestRaw = localStorage.getItem(ONBOARDING_HIGHEST_STEP_KEY);
    if (stepRaw) currentStep = parseInt(stepRaw, 10) || currentStep;
    if (highestRaw) highestStepReached = parseInt(highestRaw, 10) || highestStepReached;
  } catch { /* ignore */ }

  return {
    currentStep: currentStep || 1,
    highestStepReached: Math.max(highestStepReached || 1, currentStep || 1),
  };
};

export const writeOnboardingStorageRecord = (record: OnboardingStorageRecord): void => {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(record));
  localStorage.setItem(ONBOARDING_STEP_KEY, String(record.currentStep));
  localStorage.setItem(ONBOARDING_HIGHEST_STEP_KEY, String(record.highestStepReached));
};

export const persistOnboardingFormState = (
  data: OnboardingData,
  meta: { currentStep: number; highestStepReached: number },
): OnboardingStorageRecord => {
  const record = buildOnboardingStorageRecord(data, meta);
  writeOnboardingStorageRecord(record);
  return record;
};

const isStepPayloadBlockKey = (key: string) =>
  key === 'payload'
  || /^step\d+[_-]?payload$/i.test(key)
  || /^step_\d+_payload$/i.test(key);

const readNumericStepField = (source: Record<string, unknown>, ...keys: string[]): number => {
  for (const key of keys) {
    const value = Number(source[key]);
    if (value > 0) return value;
  }
  return 0;
};

const readCompletedSteps = (...sources: Record<string, unknown>[]): number[] => {
  const values: number[] = [];
  sources.forEach((source) => {
    const raw = source.completedSteps;
    if (!Array.isArray(raw)) return;
    raw.forEach((entry) => {
      const n = Number(entry);
      if (n > 0) values.push(n);
    });
  });
  return values;
};

/**
 * Resolve active step from API — explicit currentStep wins over completedSteps inference.
 */
const resolveApiStepMeta = (
  root: Record<string, unknown>,
  detail: Record<string, unknown>,
  payloadBlocks: Record<string, unknown>[],
): { currentStep: number; highestStepReached: number } => {
  const camelRoot = deepCamelizeKeys(root) as Record<string, unknown>;
  const camelDetail = deepCamelizeKeys(detail) as Record<string, unknown>;

  let explicitCurrent = 0;
  let explicitHighest = 0;

  const scanMeta = (source: Record<string, unknown>) => {
    explicitCurrent = Math.max(
      explicitCurrent,
      readNumericStepField(source, 'currentStep', 'lastStep', 'activeStep'),
    );
    explicitHighest = Math.max(
      explicitHighest,
      readNumericStepField(source, 'highestStepReached', 'highestStep', 'maxStepReached'),
    );
  };

  scanMeta(camelRoot);
  scanMeta(camelDetail);
  payloadBlocks.forEach(scanMeta);

  const completed = readCompletedSteps(camelRoot, camelDetail);
  const maxCompleted = completed.length > 0 ? Math.max(...completed) : 0;
  const inferredCurrent = maxCompleted > 0
    ? Math.min(maxCompleted + 1, STEP_KEYS.length)
    : 0;

  const currentStep = explicitCurrent > 0
    ? explicitCurrent
    : (inferredCurrent > 0 ? inferredCurrent : 1);

  const highestStepReached = Math.max(
    explicitHighest > 0 ? explicitHighest : 0,
    currentStep,
    maxCompleted > 0 ? maxCompleted : 0,
  );

  return {
    currentStep: Math.min(Math.max(currentStep, 1), STEP_KEYS.length),
    highestStepReached: Math.min(Math.max(highestStepReached, currentStep), STEP_KEYS.length),
  };
};

/** Merge GET /onboarding/:id detail shape (step_1_payload … step_6_payload). */
const parseOnboardingDetailApiResponse = (
  root: Record<string, unknown>,
  detail: Record<string, unknown>,
): OnboardingStorageRecord => {
  const camelDetail = deepCamelizeKeys(detail) as Record<string, unknown>;
  const record = emptyOnboardingStorageRecord();

  record.onboardingId = String(
    extractOnboardingId(root)
    ?? camelDetail.onboardingId
    ?? camelDetail.onboarding_id
    ?? '',
  );
  record.contactEmail = String(camelDetail.contactEmail ?? '');

  const payloadBlocks: Record<string, unknown>[] = [];

  const mergePayloadBlock = (block: unknown, bucketHint: StepBucketKey | null = null) => {
    if (!isPlainObject(block)) return;
    const camel = deepCamelizeKeys(block) as Record<string, unknown>;
    payloadBlocks.push(camel);

    if (!record.contactEmail && camel.contactEmail) {
      record.contactEmail = String(camel.contactEmail);
    }
    if (!record.onboardingId && camel.onboardingId) {
      record.onboardingId = String(camel.onboardingId);
    }
    if (typeof camel.updatedAt === 'string') {
      record.updatedAt = camel.updatedAt;
    }

    if (bucketHint) {
      record[bucketHint] = mergeStorageValue(
        record[bucketHint],
        coerceStepBucket(bucketHint, camel),
      ) as Record<string, unknown>;
    }

    STEP_KEYS.forEach((step) => {
      if (isPlainObject(camel[step])) {
        record[step] = mergeStorageValue(
          record[step],
          coerceStepBucket(step, camel[step] as Record<string, unknown>),
        ) as Record<string, unknown>;
      }
    });
  };

  Object.entries(camelDetail).forEach(([key, value]) => {
    if (!isStepPayloadBlockKey(key)) return;
    const bucketMatch = key.match(/^step[_-]?(\d)[_-]?payload$/i);
    const stepNum = bucketMatch ? Number(bucketMatch[1]) : 0;
    const bucketHint = stepNum >= 1 && stepNum <= STEP_KEYS.length
      ? (`step${stepNum}` as StepBucketKey)
      : null;
    mergePayloadBlock(value, key === 'payload' ? null : bucketHint);
  });

  const { currentStep, highestStepReached } = resolveApiStepMeta(root, detail, payloadBlocks);
  record.currentStep = currentStep;
  record.highestStepReached = highestStepReached;
  return coerceOnboardingStorageRecord(record);
};

const hasStepPayloadBlocks = (detail: Record<string, unknown>): boolean =>
  Object.keys(detail).some(isStepPayloadBlockKey);

/** Raw API body → canonical storage record (camelCase + step buckets). */
export const apiPayloadToStorageRecord = (apiRaw: unknown): OnboardingStorageRecord => {
  if (!apiRaw || typeof apiRaw !== 'object') return emptyOnboardingStorageRecord();

  const root = apiRaw as Record<string, unknown>;
  const unwrapped = (root.data && isPlainObject(root.data) ? root.data : root) as Record<string, unknown>;
  const camelized = deepCamelizeKeys(unwrapped) as Record<string, unknown>;

  if (hasStepPayloadBlocks(camelized)) {
    return parseOnboardingDetailApiResponse(root, unwrapped);
  }

  const record = normalizeToStorageRecord(camelized);
  const { currentStep, highestStepReached } = resolveApiStepMeta(root, unwrapped, []);
  record.currentStep = currentStep;
  record.highestStepReached = highestStepReached;

  const onboardingId = extractOnboardingId(apiRaw);
  if (onboardingId) record.onboardingId = onboardingId;
  if (!record.contactEmail && camelized.contactEmail) {
    record.contactEmail = String(camelized.contactEmail);
  }
  return coerceOnboardingStorageRecord(record);
};

import api from './api';

import type { OnboardingData } from '../pages/DyadOnboarding';

import {
  extractOnboardingId,
  findOnboardingIdDeep,
  processOnboardingApiResponse,
  readOnboardingStorageRecord,
  storageRecordToFormPartial,
  writeOnboardingStorageRecord,
  type OnboardingStorageRecord,
} from './onboardingStorageService';

import {
  getOnboardingClientSession,
  setOnboardingClientSession,
} from './onboardingClientAuthService';

export { ONBOARDING_STORAGE_KEY, extractOnboardingId } from './onboardingStorageService';

export interface OnboardingHydrationResult {
  storageRecord: OnboardingStorageRecord;
  merged: Partial<OnboardingData> & { currentStep?: number; highestStepReached?: number };
  currentStep?: number;
  highestStepReached?: number;
}

export const mergeOnboardingApiResponse = (
  localRecord: OnboardingStorageRecord,
  apiRaw: unknown,
): OnboardingHydrationResult => {
  const storageRecord = processOnboardingApiResponse(apiRaw, {
    mergeWithLocal: true,
    persist: false,
    localRecord,
  });

  const merged = storageRecordToFormPartial(storageRecord);

  return {
    storageRecord,
    merged,
    currentStep: storageRecord.currentStep,
    highestStepReached: storageRecord.highestStepReached,
  };
};

const resolveOnboardingIdForEmail = async (
  email: string,
  localRecord: OnboardingStorageRecord,
): Promise<string | null> => {
  try {
    const checkRes = await api.post('/onboarding/check-email', { email });
    const fromCheck = findOnboardingIdDeep(checkRes.data);
    if (fromCheck) return fromCheck;
  } catch {
    // Fall through to stored onboarding id
  }

  const sessionId = getOnboardingClientSession()?.onboardingId?.trim();
  if (sessionId) return sessionId;

  const storedId = localRecord.onboardingId?.trim();
  if (storedId) return storedId;

  return null;
};

const rememberOnboardingIdInSession = (onboardingId: string, email?: string): void => {
  const session = getOnboardingClientSession();
  if (!session || (email && session.email !== email)) return;
  if (session.onboardingId === onboardingId) return;
  setOnboardingClientSession({
    email: session.email,
    displayName: session.displayName,
    verifiedAt: session.verifiedAt,
    onboardingId,
  });
};

/**
 * Fetch onboarding by id, process API into canonical localStorage format,
 * persist, and return merged form data for auto-prepopulation.
 */
export const hydrateOnboardingById = async (
  onboardingId: string,
  email?: string,
): Promise<OnboardingHydrationResult | null> => {
  const trimmedId = onboardingId.trim();
  if (!trimmedId) return null;

  try {
    const localRecord = readOnboardingStorageRecord();
    const detailRes = await api.get(`/onboarding/${trimmedId}`);
    if (!detailRes.data) return null;

    const storageRecord = processOnboardingApiResponse(detailRes.data, {
      email,
      mergeWithLocal: true,
      persist: true,
      localRecord,
    });

    storageRecord.onboardingId = trimmedId;
    if (email && !storageRecord.contactEmail) storageRecord.contactEmail = email;
    writeOnboardingStorageRecord(storageRecord);
    rememberOnboardingIdInSession(trimmedId, email);

    const merged = storageRecordToFormPartial(storageRecord);

    return {
      storageRecord,
      merged: {
        ...merged,
        onboardingId: trimmedId,
        contactEmail: merged.contactEmail || email || '',
      },
      currentStep: storageRecord.currentStep,
      highestStepReached: storageRecord.highestStepReached,
    };
  } catch {
    return null;
  }
};

/**
 * Fetch onboarding by email, process API into canonical localStorage format,
 * persist, and return merged form data for auto-prepopulation.
 */
export const hydrateOnboardingFromEmail = async (
  email: string,
): Promise<OnboardingHydrationResult | null> => {
  const localRecord = readOnboardingStorageRecord();
  const onboardingId = await resolveOnboardingIdForEmail(email, localRecord);
  if (!onboardingId) return null;

  return hydrateOnboardingById(onboardingId, email);
};

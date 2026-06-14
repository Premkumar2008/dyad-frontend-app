import {
  ONBOARDING_HIGHEST_STEP_KEY,
  ONBOARDING_STEP_KEY,
  ONBOARDING_STORAGE_KEY,
} from './onboardingStorageService';
import { clearOnboardingClientSession } from './onboardingClientAuthService';
import SecureSessionStorage from '../utils/sessionStorage';

export const ONBOARDING_IDLE_TIMEOUT_MS = 10 * 60 * 1000;
export const ONBOARDING_IDLE_WARNING_MS = 9 * 60 * 1000;

export const clearOnboardingLocalData = (): void => {
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  localStorage.removeItem(ONBOARDING_STEP_KEY);
  localStorage.removeItem(ONBOARDING_HIGHEST_STEP_KEY);
};

/** Remove all client-side onboarding session and auth data. */
export const clearAllOnboardingSessionData = (): void => {
  clearOnboardingLocalData();
  clearOnboardingClientSession();
  SecureSessionStorage.clearSession();
  SecureSessionStorage.clearTokens();
};

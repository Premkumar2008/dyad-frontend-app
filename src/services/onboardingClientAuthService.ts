import api, {
  sendEmailOTP,
  verifyOTP,
  handleApiError,
} from './api';

export const ONBOARDING_CLIENT_SESSION_KEY = 'dyad_onboarding_client_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export interface OnboardingClientSession {
  email: string;
  displayName: string;
  verifiedAt: string;
  expiresAt: number;
  onboardingId?: string;
}

export interface OnboardingEmailCheckResult {
  success: boolean;
  exists: boolean;
  message?: string;
  contactName?: string;
  firstName?: string;
  lastName?: string;
}

export interface OnboardingVerifyLoginResult {
  success: boolean;
  message?: string;
  contactName?: string;
  firstName?: string;
  lastName?: string;
  accessToken?: string;
  refreshToken?: string;
  onboardingId?: string;
}

const parseCheckResult = (data: unknown): OnboardingEmailCheckResult => {
  const root = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const nested = (root.data && typeof root.data === 'object' ? root.data : root) as Record<string, unknown>;
  return {
    success: nested.success !== false,
    exists: Boolean(nested.exists),
    message: typeof nested.message === 'string' ? nested.message : undefined,
    contactName: typeof nested.contactName === 'string'
      ? nested.contactName
      : typeof nested.contact_name === 'string'
        ? nested.contact_name
        : undefined,
    firstName: typeof nested.firstName === 'string' ? nested.firstName : undefined,
    lastName: typeof nested.lastName === 'string' ? nested.lastName : undefined,
  };
};

const parseVerifyResult = (data: unknown): OnboardingVerifyLoginResult => {
  const root = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const nested = (root.data && typeof root.data === 'object' ? root.data : root) as Record<string, unknown>;
  const onboardingId = typeof nested.onboardingId === 'string'
    ? nested.onboardingId
    : typeof nested.onboarding_id === 'string'
      ? nested.onboarding_id
      : undefined;
  return {
    success: Boolean(nested.success),
    message: typeof nested.message === 'string' ? nested.message : undefined,
    contactName: typeof nested.contactName === 'string' ? nested.contactName : undefined,
    firstName: typeof nested.firstName === 'string' ? nested.firstName : undefined,
    lastName: typeof nested.lastName === 'string' ? nested.lastName : undefined,
    accessToken: typeof nested.accessToken === 'string' ? nested.accessToken : undefined,
    refreshToken: typeof nested.refreshToken === 'string' ? nested.refreshToken : undefined,
    onboardingId,
  };
};

export const buildDisplayName = (result: {
  contactName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
}): string => {
  if (result.contactName?.trim()) return result.contactName.trim();
  const full = [result.firstName, result.lastName].filter(Boolean).join(' ').trim();
  if (full) return full;
  const local = result.email.split('@')[0];
  return local || result.email;
};

export const checkOnboardingClientEmail = async (email: string): Promise<OnboardingEmailCheckResult> => {
  const res = await api.post('/api-early-access/check-email', { email });
  const result = parseCheckResult(res.data);
  if (!result.exists) {
    const err = new Error(
      result.message || 'This email is not registered for Dyad early access. Please use the email from your invitation.',
    ) as Error & { response?: { data?: { message?: string } } };
    throw err;
  }
  return result;
};

export const sendOnboardingClientOTP = async (email: string): Promise<{ success: boolean; message?: string }> => {
  const res = await sendEmailOTP(email);
  return { success: res.status === 200, message: res.data?.message };
};

export const verifyOnboardingClientOTP = async (
  email: string,
  otp: string,
): Promise<OnboardingVerifyLoginResult> => {
  try {
    const res = await api.post('/onboarding/verify-login-otp', { email, otp });
    return parseVerifyResult(res.data);
  } catch (primaryError) {
    try {
      const res = await verifyOTP({ email, otp });
      return parseVerifyResult(res.data);
    } catch (fallbackError) {
      throw primaryError ?? fallbackError;
    }
  }
};

export const setOnboardingClientSession = (session: Omit<OnboardingClientSession, 'expiresAt' | 'verifiedAt'> & Partial<Pick<OnboardingClientSession, 'verifiedAt'>>): void => {
  const existing = getOnboardingClientSession();
  const keepExistingId = existing?.email === session.email ? existing.onboardingId : undefined;
  const payload: OnboardingClientSession = {
    email: session.email,
    displayName: session.displayName,
    verifiedAt: session.verifiedAt ?? new Date().toISOString(),
    expiresAt: Date.now() + SESSION_TTL_MS,
    onboardingId: session.onboardingId ?? keepExistingId,
  };
  localStorage.setItem(ONBOARDING_CLIENT_SESSION_KEY, JSON.stringify(payload));
};

export const getOnboardingClientSession = (): OnboardingClientSession | null => {
  try {
    const raw = localStorage.getItem(ONBOARDING_CLIENT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingClientSession;
    if (!parsed.email || !parsed.expiresAt || Date.now() > parsed.expiresAt) {
      clearOnboardingClientSession();
      return null;
    }
    return parsed;
  } catch {
    clearOnboardingClientSession();
    return null;
  }
};

export const clearOnboardingClientSession = (): void => {
  localStorage.removeItem(ONBOARDING_CLIENT_SESSION_KEY);
};

export const formatOnboardingAuthError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    return handleApiError(error);
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
};

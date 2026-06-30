import SecureSessionStorage from './sessionStorage';

const ONBOARDING_CLIENT_SESSION_KEY = 'dyad_onboarding_client_session';

type OnboardingClientSessionRecord = {
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
};

const readOnboardingClientSessionRaw = (): OnboardingClientSessionRecord | null => {
  try {
    const raw = localStorage.getItem(ONBOARDING_CLIENT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingClientSessionRecord;
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
};

/** Read access token stored on the onboarding client session (localStorage, 24h). */
export const getOnboardingClientAccessToken = (): string | null => {
  const session = readOnboardingClientSessionRaw();
  const token = typeof session?.accessToken === 'string' ? session.accessToken.trim() : '';
  return token || null;
};

/** Sync onboarding OTP tokens into SecureSessionStorage for API interceptors. */
export const restoreOnboardingApiAccessToken = (): string | null => {
  const session = readOnboardingClientSessionRaw();
  const accessToken = typeof session?.accessToken === 'string' ? session.accessToken.trim() : '';
  if (!accessToken) return null;

  const refreshToken = typeof session?.refreshToken === 'string' && session.refreshToken.trim()
    ? session.refreshToken.trim()
    : accessToken;

  SecureSessionStorage.setTokens(accessToken, refreshToken);
  return accessToken;
};

/** Resolve bearer token from onboarding session, secure session, or admin login. */
export const getApiAccessToken = (): string | null => {
  const onboardingToken = getOnboardingClientAccessToken();
  if (onboardingToken) return onboardingToken;

  const secureToken = SecureSessionStorage.getAccessToken();
  if (secureToken) return secureToken;

  const adminToken = typeof localStorage !== 'undefined'
    ? localStorage.getItem('adminAccessToken')
    : null;
  return adminToken?.trim() || null;
};

export const buildAuthorizationHeader = (): Record<string, string> => {
  const token = getApiAccessToken() ?? restoreOnboardingApiAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

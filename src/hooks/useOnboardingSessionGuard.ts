import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ONBOARDING_IDLE_TIMEOUT_MS,
  ONBOARDING_IDLE_WARNING_MS,
} from '../services/onboardingSecurityService';

interface UseOnboardingSessionGuardOptions {
  enabled: boolean;
  hasUnsavedChanges: () => boolean;
  hasFormProgress: () => boolean;
  flushSave: () => void;
  onIdleSecurityLogout: () => void | Promise<void>;
}

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'input'] as const;

export const useOnboardingSessionGuard = ({
  enabled,
  hasUnsavedChanges,
  hasFormProgress,
  flushSave,
  onIdleSecurityLogout,
}: UseOnboardingSessionGuardOptions) => {
  const lastActivityRef = useRef(Date.now());
  const intentionalLeaveRef = useRef(false);
  const logoutStartedRef = useRef(false);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState(60);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowIdleWarning(false);
    setIdleSecondsLeft(60);
  }, []);

  const markIntentionalLeave = useCallback(() => {
    intentionalLeaveRef.current = true;
    flushSave();
  }, [flushSave]);

  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (intentionalLeaveRef.current) return;
      flushSave();
      if (hasUnsavedChanges() || hasFormProgress()) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, flushSave, hasFormProgress, hasUnsavedChanges]);

  useEffect(() => {
    if (!enabled) return;

    const onActivity = () => resetActivity();
    ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, onActivity, true);
    });

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        const idleMs = Date.now() - lastActivityRef.current;
        if (idleMs >= ONBOARDING_IDLE_TIMEOUT_MS && !logoutStartedRef.current) {
          logoutStartedRef.current = true;
          void onIdleSecurityLogout();
        } else if (idleMs >= ONBOARDING_IDLE_WARNING_MS) {
          setShowIdleWarning(true);
          setIdleSecondsLeft(Math.max(1, Math.ceil((ONBOARDING_IDLE_TIMEOUT_MS - idleMs) / 1000)));
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        document.removeEventListener(event, onActivity, true);
      });
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, onIdleSecurityLogout, resetActivity]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      const idleMs = Date.now() - lastActivityRef.current;

      if (idleMs >= ONBOARDING_IDLE_TIMEOUT_MS) {
        if (!logoutStartedRef.current) {
          logoutStartedRef.current = true;
          setShowIdleWarning(false);
          void onIdleSecurityLogout();
        }
        return;
      }

      if (idleMs >= ONBOARDING_IDLE_WARNING_MS) {
        setShowIdleWarning(true);
        setIdleSecondsLeft(Math.max(1, Math.ceil((ONBOARDING_IDLE_TIMEOUT_MS - idleMs) / 1000)));
      } else {
        setShowIdleWarning(false);
        setIdleSecondsLeft(60);
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [enabled, onIdleSecurityLogout]);

  return {
    showIdleWarning,
    idleSecondsLeft,
    extendSession: resetActivity,
    markIntentionalLeave,
  };
};

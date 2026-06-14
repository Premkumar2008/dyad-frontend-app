import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface OnboardingIdleWarningModalProps {
  secondsLeft: number;
  onStaySignedIn: () => void;
  onLogoutNow: () => void;
}

export const OnboardingIdleWarningModal: React.FC<OnboardingIdleWarningModalProps> = ({
  secondsLeft,
  onStaySignedIn,
  onLogoutNow,
}) => {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const countdown = mins > 0
    ? `${mins}:${secs.toString().padStart(2, '0')}`
    : `${secs}s`;

  return (
    <div className="ob-idle-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="ob-idle-modal-title">
      <div className="ob-idle-modal">
        <div className="ob-idle-modal-header">
          <ShieldAlert size={22} className="ob-idle-modal-icon" aria-hidden />
          <h2 id="ob-idle-modal-title" className="ob-idle-modal-title">Still there?</h2>
        </div>
        <p className="ob-idle-modal-text">
          For your security, you will be signed out in{' '}
          <strong>{countdown}</strong> due to inactivity. Your progress is being saved
          automatically.
        </p>
        <div className="ob-idle-modal-actions">
          <button type="button" className="ob-idle-modal-btn ob-idle-modal-btn-primary" onClick={onStaySignedIn}>
            Stay signed in
          </button>
          <button type="button" className="ob-idle-modal-btn ob-idle-modal-btn-secondary" onClick={onLogoutNow}>
            Sign out now
          </button>
        </div>
      </div>
    </div>
  );
};

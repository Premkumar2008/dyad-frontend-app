import React from 'react';
import { AlertCircle } from 'lucide-react';

export const EnrollmentSaveNotice: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`ob-save-notice-wrap${className ? ` ${className}` : ''}`}>
    <div className="ob-save-notice" role="note">
      <AlertCircle size={18} className="ob-save-notice-icon" aria-hidden />
      <p className="ob-save-notice-text">
        Your progress is saved automatically. If you leave this tab, you may be prompted
        to confirm your latest changes are saved locally. After 10 minutes of inactivity
        you will be signed out for security; sign back in to restore your progress from the server.
      </p>
    </div>
  </div>
);

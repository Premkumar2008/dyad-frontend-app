import React from 'react';
import { AlertCircle } from 'lucide-react';

export const EnrollmentSaveNotice: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`ob-save-notice-wrap${className ? ` ${className}` : ''}`}>
    <div className="ob-save-notice" role="note">
      <AlertCircle size={18} className="ob-save-notice-icon" aria-hidden />
      <p className="ob-save-notice-text">
        Your progress is saved automatically and will be retained for 20 days,
        so you can return at any time to complete your submission.
      </p>
    </div>
  </div>
);

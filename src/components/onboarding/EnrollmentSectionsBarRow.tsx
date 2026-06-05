import React from 'react';

export interface EnrollmentSectionsBarRowProps {
  progressPct: number;
  sectionsComplete: number;
  totalSections: number;
}

export const EnrollmentSectionsBarRow: React.FC<EnrollmentSectionsBarRowProps> = ({
  progressPct,
  sectionsComplete,
  totalSections,
}) => (
  <div className="ob-ph-bar-row">
    <span className="ob-ph-bar-text">
      {sectionsComplete} of {totalSections} sections completed
    </span>
    <div className="ob-ph-track">
      <div className="ob-ph-fill" style={{ width: `${progressPct}%` }} />
    </div>
    <span className="ob-ph-bar-pct">{progressPct}%</span>
  </div>
);

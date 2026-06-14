import React, { useEffect } from 'react';

export interface EarlyAccessSubmissionDetail {
  _id: string;
  npi: string;
  practiceName: string;
  contactName: string;
  phoneNumber: string;
  email: string;
  title: string;
  practiceType: string;
  providers: string;
  locations: string;
  claimVolume: string;
  createdAt: string;
  betaInvite: boolean;
  status: 'pending' | 'beta-cohort' | 'reviewed' | 'rejected';
  invitationSent: boolean;
}

interface EarlyAccessSubmissionDetailModalProps {
  submission: EarlyAccessSubmissionDetail | null;
  onClose: () => void;
  formatSubmittedAt: (iso: string) => string;
  statusLabel: (status: string) => string;
  practiceTypeBadge: (type: string) => { bg: string; color: string };
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="adm2-detail-row">
    <span className="adm2-detail-label">{label}</span>
    <span className="adm2-detail-value">{value}</span>
  </div>
);

export const EarlyAccessSubmissionDetailModal: React.FC<EarlyAccessSubmissionDetailModalProps> = ({
  submission,
  onClose,
  formatSubmittedAt,
  statusLabel,
  practiceTypeBadge,
}) => {
  useEffect(() => {
    if (!submission) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [submission, onClose]);

  if (!submission) return null;

  const badge = practiceTypeBadge(submission.practiceType);
  const submittedDisplay = formatSubmittedAt(submission.createdAt);

  return (
    <div className="adm2-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="adm2-submission-detail-title">
      <button type="button" className="adm2-modal-backdrop-hit" aria-label="Close" onClick={onClose} />
      <div className="adm2-modal adm2-modal--detail" onClick={(e) => e.stopPropagation()}>
        <div className="adm2-modal-header">
          <div>
            <h2 id="adm2-submission-detail-title" className="adm2-modal-title">{submission.practiceName}</h2>
            <p className="adm2-detail-sub">Submitted {submittedDisplay}</p>
          </div>
          <button type="button" className="adm2-modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="adm2-modal-body adm2-modal-body--detail">
          <div className="adm2-detail-grid">
            <DetailRow label="Contact Name" value={submission.contactName || '—'} />
            <DetailRow label="Title / Role" value={submission.title || '—'} />
            <DetailRow
              label="Email"
              value={
                submission.email ? (
                  <a href={`mailto:${submission.email}`} className="adm2-detail-link">{submission.email}</a>
                ) : '—'
              }
            />
            <DetailRow
              label="Phone"
              value={
                submission.phoneNumber ? (
                  <a href={`tel:${submission.phoneNumber.replace(/\D/g, '')}`} className="adm2-detail-link">
                    {submission.phoneNumber}
                  </a>
                ) : '—'
              }
            />
            <DetailRow label="NPI" value={submission.npi || '—'} />
            <DetailRow
              label="Practice Type"
              value={
                submission.practiceType ? (
                  <span className="adm2-type-badge" style={{ background: badge.bg, color: badge.color }}>
                    {submission.practiceType}
                  </span>
                ) : '—'
              }
            />
            <DetailRow label="Providers" value={submission.providers || '—'} />
            <DetailRow label="Locations" value={submission.locations || '—'} />
            <DetailRow label="Claim Volume" value={submission.claimVolume || '—'} />
            <DetailRow label="Status" value={statusLabel(submission.status)} />
            <DetailRow label="Beta Invite" value={submission.betaInvite ? 'Enabled' : 'Disabled'} />
            <DetailRow label="Invitation Sent" value={submission.invitationSent ? 'Yes' : 'No'} />
            <DetailRow label="Submitted" value={submittedDisplay} />
          </div>
        </div>
        <div className="adm2-modal-footer">
          <button type="button" className="adm2-btn adm2-btn--primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

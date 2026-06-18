import React, { useEffect } from 'react';
import {
  formatPipelineDate,
  formatPipelineDateTime,
  getRecordCurrentStep,
  isEnrollmentComplete,
  ONBOARDING_STEP_LABELS,
  type PipelineRow,
} from './onboardingPipelineData';

interface OnboardingPipelineDetailModalProps {
  row: PipelineRow | null;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="adm2-detail-row">
    <span className="adm2-detail-label">{label}</span>
    <span className="adm2-detail-value">{value}</span>
  </div>
);

export const OnboardingPipelineDetailModal: React.FC<OnboardingPipelineDetailModalProps> = ({
  row,
  onClose,
}) => {
  useEffect(() => {
    if (!row) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [row, onClose]);

  if (!row) return null;

  const step = getRecordCurrentStep(row.record);
  const complete = isEnrollmentComplete(row.record);

  return (
    <div className="adm2-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="obp-detail-title">
      <button type="button" className="adm2-modal-backdrop-hit" aria-label="Close" onClick={onClose} />
      <div className="adm2-modal adm2-modal--detail obp-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="adm2-modal-header">
          <div>
            <h2 id="obp-detail-title" className="adm2-modal-title">{row.practiceName}</h2>
            <p className="adm2-detail-sub">
              {row.stageLabel} · Updated {formatPipelineDateTime(row.updatedAt)}
            </p>
          </div>
          <button type="button" className="adm2-modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="adm2-modal-body adm2-modal-body--detail">
          <div className="obp-detail-progress">
            <div className="obp-detail-progress-head">
              <span>Enrollment progress</span>
              <strong>{row.progressPct}%</strong>
            </div>
            <div className="obp-detail-progress-track">
              <div className="obp-detail-progress-fill" style={{ width: `${row.progressPct}%` }} />
            </div>
            <div className="obp-detail-steps">
              {ONBOARDING_STEP_LABELS.map((label, idx) => {
                const stepNum = idx + 1;
                const done = complete || step > stepNum;
                const active = !complete && step === stepNum;
                return (
                  <div
                    key={label}
                    className={[
                      'obp-detail-step',
                      done ? 'obp-detail-step--done' : '',
                      active ? 'obp-detail-step--active' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <div className="obp-detail-step-dot">{done ? '✓' : stepNum}</div>
                    <div className="obp-detail-step-label">{label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="obp-detail-badges">
            <span className="obp-stage-pill" style={{ borderColor: row.stageColor, color: row.stageColor }}>
              {row.stageLabel}
            </span>
            {row.isStalled && <span className="obp-stall-pill">Stalled · {row.daysInStage}d</span>}
            {row.achMandateActive && <span className="obp-milestone-pill">ACH mandate active</span>}
            {row.callScheduled && <span className="obp-milestone-pill">Call scheduled</span>}
          </div>

          <div className="adm2-detail-grid">
            <DetailRow label="Contact" value={row.contactName || '—'} />
            <DetailRow
              label="Email"
              value={
                row.contactEmail ? (
                  <a href={`mailto:${row.contactEmail}`} className="adm2-detail-link">{row.contactEmail}</a>
                ) : '—'
              }
            />
            <DetailRow label="NPI" value={row.npi || '—'} />
            <DetailRow label="Specialty" value={row.specialty !== '-' ? row.specialty : '—'} />
            <DetailRow label="Onboarding ID" value={row.onboardingId} />
            <DetailRow label="Current step" value={row.progressLabel} />
            <DetailRow label="Days in stage" value={`${row.daysInStage} days`} />
            <DetailRow label="Days in pipeline" value={`${row.daysTotal} days`} />
            <DetailRow label="Started" value={formatPipelineDate(row.createdAt)} />
            <DetailRow label="Last activity" value={formatPipelineDateTime(row.updatedAt)} />
            <DetailRow label="API status" value={row.record.status || '—'} />
          </div>
        </div>

        <div className="adm2-modal-footer">
          <button type="button" className="adm2-btn adm2-btn--ghost" onClick={onClose}>Close</button>
          {row.contactEmail && (
            <a href={`mailto:${row.contactEmail}?subject=Dyad onboarding follow-up`} className="adm2-btn adm2-btn--primary">
              Email client
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';

const TEMPLATES = [
  { id: 'intake-confirm', name: 'Intake Confirmation', subject: 'We received your Dyad Early Access request', category: 'Intake', lastEdited: 'May 12, 2026', status: 'active' },
  { id: 'beta-invite', name: 'Beta Invitation (Email 2)', subject: "You've Been Selected for Dyad Early Access", category: 'Cohort', lastEdited: 'Jun 02, 2026', status: 'active' },
  { id: 'beta-reminder', name: 'Beta Reminder (Email 3)', subject: 'Reminder: Schedule your Dyad introduction call', category: 'Cohort', lastEdited: 'Jun 02, 2026', status: 'active' },
  { id: 'manual-invite', name: 'Manual Early Access Invite', subject: "You're Invited - Dyad Early Access Program", category: 'Manual', lastEdited: 'Apr 28, 2026', status: 'active' },
  { id: 'schedule-confirm', name: 'Schedule Confirmation', subject: 'Your Dyad introduction call is confirmed', category: 'Onboarding', lastEdited: 'May 20, 2026', status: 'active' },
  { id: 'launch-prep', name: 'Launch Preparation', subject: 'Preparing for Dyad go-live', category: 'Launch', lastEdited: 'May 01, 2026', status: 'draft' },
];

export const EmailTemplatesPanel: React.FC = () => {
  const [selected, setSelected] = useState(TEMPLATES[1]);

  return (
    <>
      <div className="adm2-split-layout">
        <div className="adm2-split-list">
          <div className="adm2-toolbar adm2-toolbar--compact">
            <div className="adm2-search-wrap adm2-search-wrap--full">
              <svg className="adm2-search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="5" stroke="#9ca3af" strokeWidth="1.5" />
                <path d="M10.5 10.5l3 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input className="adm2-search" placeholder="Search templates…" />
            </div>
          </div>
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              type="button"
              className={`adm2-template-item${selected.id === t.id ? ' adm2-template-item--active' : ''}`}
              onClick={() => setSelected(t)}
            >
              <span className="adm2-template-name">{t.name}</span>
              <span className="adm2-template-meta">{t.category} · {t.lastEdited}</span>
            </button>
          ))}
        </div>

        <div className="adm2-split-detail">
          <div className="adm2-detail-head">
            <div>
              <h2 className="adm2-detail-title">{selected.name}</h2>
              <p className="adm2-detail-sub">Subject: {selected.subject}</p>
            </div>
            <div className="adm2-toolbar-right">
              <button type="button" className="adm2-btn adm2-btn--ghost">Preview</button>
              <button type="button" className="adm2-btn adm2-btn--primary">Edit Template</button>
            </div>
          </div>
          <div className="adm2-email-preview">
            <div className="adm2-email-preview-bar">
              <span><strong>To:</strong> recipient@practice.com</span>
              <span><strong>From:</strong> onboarding@dyadmd.com</span>
            </div>
            <div className="adm2-email-preview-body">
              <img src="/assets/images/logo_main.png" alt="Dyad" className="adm2-email-preview-logo" />
              <div className="adm2-email-preview-banner">SELECTED FOR EARLY ACCESS</div>
              <p>Dear {'{{contact_name}}'},</p>
              <p>We are pleased to invite your practice to join Dyad&apos;s early access program ahead of our September 2026 launch.</p>
              <p>Your practice has been selected as one of a limited number of practices that will shape Dyad&apos;s product roadmap and implementation approach.</p>
              <div className="adm2-email-preview-cta">Schedule Your Introduction Call →</div>
              <p className="adm2-email-preview-sign">Warm regards,<br />Sroothi Jaikumar<br />Founder &amp; CEO, Dyad Practice Solutions</p>
            </div>
          </div>
          <p className="adm2-template-footnote">
            Template variables: <code className="adm2-code">{'{{contact_name}}'}</code>, <code className="adm2-code">{'{{practice_name}}'}</code>, <code className="adm2-code">{'{{schedule_url}}'}</code>
          </p>
        </div>
      </div>
    </>
  );
};

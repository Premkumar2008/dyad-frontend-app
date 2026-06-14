import React from 'react';

const REPORTS = [
  { name: 'Monthly Revenue Summary', desc: 'MRR, usage overages, and net revenue by plan tier', freq: 'Monthly', updated: 'May 01, 2026', format: 'PDF · CSV' },
  { name: 'Claims Volume by Client', desc: 'Claims processed, denial rates, and payer mix', freq: 'Weekly', updated: 'May 26, 2026', format: 'CSV' },
  { name: 'Client Health Dashboard', desc: 'Health scores, at-risk flags, and CSM workload', freq: 'Daily', updated: 'May 27, 2026', format: 'PDF' },
  { name: 'Onboarding Funnel', desc: 'Stage conversion, time-in-stage, and drop-off analysis', freq: 'Weekly', updated: 'May 25, 2026', format: 'PDF · CSV' },
  { name: 'Early Access Intake', desc: 'Submission volume, cohort designation, and invite conversion', freq: 'Weekly', updated: 'May 27, 2026', format: 'CSV' },
  { name: 'Support & Escalations', desc: 'Ticket volume, SLA compliance, and escalation trends', freq: 'Monthly', updated: 'May 15, 2026', format: 'PDF' },
];

export const ReportsPanel: React.FC = () => (
  <>
    <div className="adm2-stats-grid adm2-stats-grid--3">
      <div className="adm2-stat-card">
        <p className="adm2-stat-label">AVAILABLE REPORTS</p>
        <p className="adm2-stat-value adm2-stat-value--blue">18</p>
        <p className="adm2-stat-sub">6 featured below</p>
      </div>
      <div className="adm2-stat-card">
        <p className="adm2-stat-label">LAST EXPORT</p>
        <p className="adm2-stat-value">May 26</p>
        <p className="adm2-stat-sub">Claims Volume by Client</p>
      </div>
      <div className="adm2-stat-card">
        <p className="adm2-stat-label">SCHEDULED DELIVERY</p>
        <p className="adm2-stat-value adm2-stat-value--green">4</p>
        <p className="adm2-stat-sub">Email subscriptions active</p>
      </div>
    </div>

    <div className="adm2-report-grid">
      {REPORTS.map(r => (
        <div key={r.name} className="adm2-report-card">
          <div className="adm2-report-card-head">
            <h3 className="adm2-report-title">{r.name}</h3>
            <span className="adm2-pill adm2-pill--scheduled">{r.freq}</span>
          </div>
          <p className="adm2-report-desc">{r.desc}</p>
          <div className="adm2-report-meta">
            <span>Updated {r.updated}</span>
            <span>{r.format}</span>
          </div>
          <div className="adm2-report-actions">
            <button type="button" className="adm2-btn adm2-btn--primary">Download</button>
            <button type="button" className="adm2-btn adm2-btn--ghost">Schedule</button>
          </div>
        </div>
      ))}
    </div>
  </>
);

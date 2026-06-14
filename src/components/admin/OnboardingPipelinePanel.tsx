import React, { useState } from 'react';

const STAGES = [
  { id: 'enrollment', label: 'Enrollment', count: 4, color: '#173e7a' },
  { id: 'agreements', label: 'Agreements', count: 3, color: '#2563eb' },
  { id: 'due-diligence', label: 'Due Diligence', count: 5, color: '#7c3aed' },
  { id: 'commercial', label: 'Commercial / MSA', count: 2, color: '#0891b2' },
  { id: 'banking', label: 'Banking Setup', count: 7, color: '#0d9488' },
  { id: 'golive', label: 'Go-Live', count: 1, color: '#16a34a' },
];

const PIPELINE_ROWS = [
  { practice: 'Vanguard Eye Institute', contact: 'Maya Chen', stage: 'Banking Setup', step: 'Step 6 of 6', days: 12, csm: 'Priya A.' },
  { practice: 'Northshore Pain Medicine', contact: 'Dr. Adaeze Okafor', stage: 'Commercial / MSA', step: 'Step 5 of 6', days: 8, csm: 'Talia R.' },
  { practice: 'Summit Ortho', contact: 'Eric Tanaka, MD', stage: 'Go-Live', step: 'Final review', days: 3, csm: 'Priya A.' },
  { practice: 'Harbor ASC Group', contact: 'Kevin Walsh', stage: 'Due Diligence', step: 'Step 4 of 6', days: 5, csm: 'Jordan M.' },
  { practice: 'Clearview Anesthesia', contact: 'Dr. Samira Noor', stage: 'Agreements', step: 'Step 3 of 6', days: 2, csm: 'Jordan M.' },
];

export const OnboardingPipelinePanel: React.FC = () => {
  const [stage, setStage] = useState('all');

  return (
    <>
      <div className="adm2-stats-grid">
        <div className="adm2-stat-card">
          <p className="adm2-stat-label">IN PIPELINE</p>
          <p className="adm2-stat-value adm2-stat-value--blue">22</p>
          <p className="adm2-stat-sub">Not yet live</p>
        </div>
        <div className="adm2-stat-card">
          <p className="adm2-stat-label">AVG. DAYS TO LIVE</p>
          <p className="adm2-stat-value">34</p>
          <p className="adm2-stat-sub">Rolling 90-day avg</p>
        </div>
        <div className="adm2-stat-card">
          <p className="adm2-stat-label">STALLED (&gt; 14d)</p>
          <p className="adm2-stat-value adm2-stat-value--amber">5</p>
          <p className="adm2-stat-sub">Needs follow-up</p>
        </div>
        <div className="adm2-stat-card">
          <p className="adm2-stat-label">GO-LIVE THIS MONTH</p>
          <p className="adm2-stat-value adm2-stat-value--green">6</p>
          <p className="adm2-stat-sub">Target: 8</p>
        </div>
      </div>

      <div className="adm2-pipeline-board">
        {STAGES.map(s => (
          <button
            key={s.id}
            type="button"
            className={`adm2-pipeline-col${stage === s.id ? ' adm2-pipeline-col--active' : ''}`}
            onClick={() => setStage(s.id)}
          >
            <span className="adm2-pipeline-col-label" style={{ borderColor: s.color }}>{s.label}</span>
            <span className="adm2-pipeline-col-count">{s.count}</span>
          </button>
        ))}
      </div>

      <div className="adm2-toolbar adm2-toolbar--card">
        <div className="adm2-toolbar-left">
          <div className="adm2-search-wrap adm2-search-wrap--wide">
            <svg className="adm2-search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5" stroke="#9ca3af" strokeWidth="1.5" />
              <path d="M10.5 10.5l3 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input className="adm2-search" placeholder="Search pipeline…" />
          </div>
          <select className="adm2-filter-select" defaultValue="all">
            <option value="all">All CSMs</option>
            <option>Priya Anand</option>
            <option>Jordan Mills</option>
            <option>Talia Reyes</option>
          </select>
        </div>
        <div className="adm2-toolbar-right">
          <button type="button" className="adm2-btn adm2-btn--ghost">Export</button>
        </div>
      </div>

      <div className="adm2-table-wrap">
        <table className="adm2-table">
          <thead>
            <tr>
              <th className="adm2-th">PRACTICE</th>
              <th className="adm2-th">STAGE</th>
              <th className="adm2-th">PROGRESS</th>
              <th className="adm2-th">DAYS IN STAGE</th>
              <th className="adm2-th">CSM</th>
            </tr>
          </thead>
          <tbody>
            {PIPELINE_ROWS.map((r, i) => (
              <tr key={i} className="adm2-tr">
                <td className="adm2-td">
                  <span className="adm2-practice-name">{r.practice}</span>
                  <span className="adm2-practice-sub">{r.contact}</span>
                </td>
                <td className="adm2-td">{r.stage}</td>
                <td className="adm2-td">{r.step}</td>
                <td className="adm2-td">{r.days} days</td>
                <td className="adm2-td">{r.csm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

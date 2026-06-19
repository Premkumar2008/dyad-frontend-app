import React, { useState } from 'react';

const SECTIONS = [
  { id: 'general', label: 'General' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'team', label: 'Team Access' },
];

export const SettingsPanel: React.FC = () => {
  const [section, setSection] = useState('general');

  return (
    <div className="adm2-settings-layout">
      <div className="adm2-settings-nav">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            type="button"
            className={`adm2-settings-nav-item${section === s.id ? ' adm2-settings-nav-item--active' : ''}`}
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="adm2-settings-panel">
        {section === 'general' && (
          <>
            <h2 className="adm2-settings-heading">General</h2>
            <div className="adm2-settings-group">
              <label className="adm2-settings-label">Organization name</label>
              <input className="adm2-settings-input" defaultValue="Dyad Practice Solutions, LLC" readOnly />
            </div>
            <div className="adm2-settings-group">
              <label className="adm2-settings-label">Default timezone</label>
              <select className="adm2-settings-input" defaultValue="pt">
                <option value="pt">Pacific Time (PT)</option>
                <option value="et">Eastern Time (ET)</option>
              </select>
            </div>
            <div className="adm2-settings-group">
              <label className="adm2-settings-label">Launch target date</label>
              <input className="adm2-settings-input" type="text" defaultValue="September 2026" readOnly />
            </div>
          </>
        )}

        {section === 'notifications' && (
          <>
            <h2 className="adm2-settings-heading">Notifications</h2>
            {[
              'At-risk account alerts',
              'New early access submissions',
              'Onboarding stage stalls (> 14 days)',
              'Weekly pipeline summary',
            ].map(item => (
              <label key={item} className="adm2-settings-check">
                <input type="checkbox" defaultChecked />
                <span>{item}</span>
              </label>
            ))}
          </>
        )}

        {section === 'integrations' && (
          <>
            <h2 className="adm2-settings-heading">Integrations</h2>
            <div className="adm2-integration-list">
              {[
                { name: 'SendGrid', status: 'Connected', detail: 'Transactional email delivery' },
                { name: 'Google Calendar', status: 'Connected', detail: 'Introduction call scheduling' },
                { name: 'Live Oak Bank API', status: 'Pending', detail: 'Banking verification webhooks' },
              ].map(i => (
                <div key={i.name} className="adm2-integration-row">
                  <div>
                    <span className="adm2-practice-name">{i.name}</span>
                    <span className="adm2-practice-sub">{i.detail}</span>
                  </div>
                  <span className={`adm2-pill adm2-pill--${i.status === 'Connected' ? 'scheduled' : 'draft'}`}>{i.status}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {section === 'team' && (
          <>
            <h2 className="adm2-settings-heading">Team Access</h2>
            <div className="adm2-table-wrap">
              <table className="adm2-table">
                <thead>
                  <tr>
                    <th className="adm2-th">USER</th>
                    <th className="adm2-th">ROLE</th>
                    <th className="adm2-th">LAST LOGIN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="adm2-tr">
                    <td className="adm2-td">admin@dyadmd.com</td>
                    <td className="adm2-td">Super Admin</td>
                    <td className="adm2-td adm2-td--date">Today</td>
                  </tr>
                  <tr className="adm2-tr">
                    <td className="adm2-td">ops@dyadmd.com</td>
                    <td className="adm2-td">Operations</td>
                    <td className="adm2-td adm2-td--date">May 24, 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="adm2-settings-footer">
          <button type="button" className="adm2-btn adm2-btn--primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

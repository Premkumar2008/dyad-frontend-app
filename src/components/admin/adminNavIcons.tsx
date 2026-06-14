import React from 'react';

const stroke = { stroke: 'currentColor', strokeWidth: 1.5, fill: 'none' as const };

export const AdminNavIcons: Record<string, React.ReactNode> = {
  'early-access': (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1" y="2" width="14" height="12" rx="2" {...stroke} />
      <path d="M4 6h8M4 9h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'outreach-schedule': (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="1.5" {...stroke} />
      <path d="M5 1.5v2M11 1.5v2M2 6.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'email-templates': (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" {...stroke} />
      <path d="M1.5 4.5L8 9l6.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'active-clients': (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="1" {...stroke} />
      <rect x="5.5" y="5.5" width="5" height="5" rx="0.5" {...stroke} />
    </svg>
  ),
  'onboarding-pipeline': (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2.5 3.5h9a1.5 1.5 0 0 1 1.5 1.5v6.5H4a1.5 1.5 0 0 0-1.5 1.5V3.5z" {...stroke} />
      <path d="M4 8.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  reports: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 13V8M8 13V3M13 13V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="2" {...stroke} />
      <path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.4 3.4l.85.85M11.75 11.75l.85.85M3.4 12.6l.85-.85M11.75 4.25l.85-.85" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export const ADMIN_NAV_ITEMS = [
  { id: 'early-access' as const, label: 'Early Access Submissions', section: 'pre-launch' as const },
  { id: 'outreach-schedule' as const, label: 'Outreach Schedule', section: 'pre-launch' as const },
  { id: 'email-templates' as const, label: 'Email Templates', section: 'pre-launch' as const },
  { id: 'active-clients' as const, label: 'Active Clients', section: 'operations' as const },
  { id: 'onboarding-pipeline' as const, label: 'Onboarding Pipeline', section: 'operations' as const },
  { id: 'reports' as const, label: 'Reports', section: 'operations' as const },
  { id: 'settings' as const, label: 'Settings', section: 'system' as const },
];

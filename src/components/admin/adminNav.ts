import type { ReactNode } from 'react';

export type AdminViewId =
  | 'early-access'
  | 'outreach-schedule'
  | 'email-templates'
  | 'active-clients'
  | 'onboarding-pipeline'
  | 'reports'
  | 'settings';

/** Admin sidebar views that are currently available. All others render disabled. */
export const ADMIN_ENABLED_VIEW_IDS: AdminViewId[] = [
  'early-access',
  'outreach-schedule',
  'active-clients',
  'onboarding-pipeline',
];

export const isAdminViewEnabled = (id: AdminViewId): boolean =>
  ADMIN_ENABLED_VIEW_IDS.includes(id);

export interface AdminNavItem {
  id: AdminViewId;
  label: string;
  section: 'pre-launch' | 'operations' | 'system';
  icon: ReactNode;
}

export interface AdminBreadcrumb {
  section: string;
  page: string;
}

export const ADMIN_BREADCRUMBS: Record<AdminViewId, AdminBreadcrumb> = {
  'early-access': { section: 'Pre-Launch', page: 'Early Access Submissions' },
  'outreach-schedule': { section: 'Pre-Launch', page: 'Outreach Schedule' },
  'email-templates': { section: 'Pre-Launch', page: 'Email Templates' },
  'active-clients': { section: 'Operations', page: 'Active Clients' },
  'onboarding-pipeline': { section: 'Operations', page: 'Onboarding Pipeline' },
  'reports': { section: 'Operations', page: 'Reports' },
  'settings': { section: 'System', page: 'Settings' },
};

export const ADMIN_PAGE_META: Record<AdminViewId, { eyebrow: string; title: string; subtitle: string }> = {
  'early-access': {
    eyebrow: 'PRE-LAUNCH · COHORT DESIGNATION',
    title: 'Early Access Submissions',
    subtitle: 'Review intake submissions and designate practices for the early release cohort.',
  },
  'outreach-schedule': {
    eyebrow: 'PRE-LAUNCH · CLIENT OUTREACH',
    title: 'Outreach Schedule',
    subtitle: 'Calendar of scheduled discovery calls, product demos, and follow-ups with beta cohort practices. Calendly invites sync automatically.',
  },
  'email-templates': {
    eyebrow: 'PRE-LAUNCH · COMMUNICATIONS',
    title: 'Email Templates',
    subtitle: 'Preview and maintain transactional email templates used across intake, cohort designation, and onboarding.',
  },
  'active-clients': {
    eyebrow: 'OPERATIONS · CUSTOMER MANAGEMENT',
    title: 'Active Clients',
    subtitle: 'All practices currently live on the Dyad platform. Monitor account health, billing volume, and customer success activity.',
  },
  'onboarding-pipeline': {
    eyebrow: 'OPERATIONS · IMPLEMENTATION',
    title: 'Onboarding Pipeline',
    subtitle: 'Track practices moving through enrollment, banking setup, and go-live milestones.',
  },
  'reports': {
    eyebrow: 'OPERATIONS · ANALYTICS',
    title: 'Reports',
    subtitle: 'Operational and revenue reports across the active client portfolio.',
  },
  'settings': {
    eyebrow: 'SYSTEM · CONFIGURATION',
    title: 'Settings',
    subtitle: 'Administration preferences, notification rules, and integration configuration.',
  },
};

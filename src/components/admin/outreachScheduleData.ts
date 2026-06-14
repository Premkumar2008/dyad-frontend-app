export type CallType = 'discovery' | 'demo' | 'followup' | 'onboarding';
export type CallStatus = 'confirmed' | 'pending' | 'rescheduled';
export type AssigneeId = 'sarah' | 'marcus' | 'priya';

export interface CalendarEvent {
  date: string;
  time: string;
  label: string;
  type: CallType;
  callId?: string;
  hostId?: AssigneeId;
  status?: CallStatus;
}

export interface OutreachFilters {
  callType: 'all' | CallType;
  assignee: 'all' | AssigneeId;
  status: 'all' | CallStatus;
}

export const OUTREACH_ASSIGNEE_OPTIONS: { id: AssigneeId; label: string }[] = [
  { id: 'sarah', label: 'Sarah Klein (Sales)' },
  { id: 'marcus', label: 'Marcus Webb (Solutions)' },
  { id: 'priya', label: 'Priya Anand (Onboarding)' },
];

const HOST_NAME_TO_ASSIGNEE: Record<string, AssigneeId> = {
  'Sarah Klein': 'sarah',
  'Marcus Webb': 'marcus',
  'Priya Anand': 'priya',
};

export const resolveHostIdFromName = (hostName: string): AssigneeId | undefined =>
  HOST_NAME_TO_ASSIGNEE[hostName];

export const DEFAULT_ASSIGNEE_BY_TYPE: Record<CallType, AssigneeId> = {
  discovery: 'sarah',
  demo: 'marcus',
  followup: 'marcus',
  onboarding: 'priya',
};

export const resolveCalendarEventMeta = (event: CalendarEvent) => {
  const hostId = event.hostId ?? DEFAULT_ASSIGNEE_BY_TYPE[event.type];
  const status: CallStatus = event.status ?? 'confirmed';
  const hostName = OUTREACH_ASSIGNEE_OPTIONS.find((o) => o.id === hostId)?.label.split(' (')[0]
    ?? 'Unassigned';

  return { hostId, status, hostName };
};

export const matchesOutreachFilters = (
  event: CalendarEvent,
  filters: OutreachFilters,
): boolean => {
  const meta = resolveCalendarEventMeta(event);
  if (filters.callType !== 'all' && event.type !== filters.callType) return false;
  if (filters.assignee !== 'all' && meta.hostId !== filters.assignee) return false;
  if (filters.status !== 'all' && meta.status !== filters.status) return false;
  return true;
};

export interface AgendaItem {
  duration: string;
  title: string;
  detail: string;
}

export interface Attendee {
  initials: string;
  name: string;
  role: string;
  tag: 'Host' | 'Internal' | 'External';
  external?: boolean;
}

export interface OutreachCall {
  id: string;
  client: string;
  contact: string;
  contactEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  type: CallType;
  typeLabel: string;
  host: string;
  hostRole: string;
  platform: string;
  meetingUrl: string;
  attendeeCount: number;
  prepNotes: string;
  agenda: AgendaItem[];
  attendees: Attendee[];
}

export const CALL_TYPE_LABELS: Record<CallType, string> = {
  discovery: 'Discovery',
  demo: 'Product Demo',
  followup: 'Follow-up',
  onboarding: 'Onboarding Kickoff',
};

export const toDateKey = (year: number, month: number, day: number): string =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const formatLongDate = (dateKey: string): string => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatMonthYear = (year: number, month: number): string =>
  new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

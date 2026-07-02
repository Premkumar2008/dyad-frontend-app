import axios from 'axios';
import {
  CALL_TYPE_LABELS,
  toDateKey,
  type CalendarEvent,
  type CallType,
  type OutreachCall,
} from '../components/admin/outreachScheduleData';
import type { OutreachScheduleData } from './outreachScheduleService';
import { formatCalendarCompactTime } from './outreachScheduleService';
import { formatTimeForDisplay } from '../utils/dateTimeUtils';
import { normalizeMeetLink } from '../utils/calendarMeetLink';

const INTRO_CALL_DURATION_MIN = 30;
const ADMIN_CALL_ID_PREFIX = 'admin-scheduled-';

const VALID_CALL_TYPES = new Set<CallType>(['discovery', 'demo', 'followup', 'onboarding']);

export interface AdminScheduledCallRecord {
  id: number;
  email: string;
  contactName: string;
  eventTitle: string;
  emailSubject: string;
  callType: string;
  mailDescription: string;
  dateTime: string;
  meetingId: string | null;
  meetingLink: string | null;
  callEventId: string | null;
  reminderCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminScheduledCallsResponse {
  success: boolean;
  total?: number;
  data?: AdminScheduledCallRecord[];
  message?: string;
}

const initialsFromText = (text: string): string => {
  const parts = text.replace(/[,.\-]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
};

const resolveCallType = (raw: string): CallType => {
  const normalized = raw.trim().toLowerCase() as CallType;
  return VALID_CALL_TYPES.has(normalized) ? normalized : 'discovery';
};

const parseTimezoneFromDescription = (description: string): string => {
  const match = description.match(/timezone:\s*([^\n,]+)/i);
  return match?.[1]?.trim() || 'Local';
};

const addMinutesToIso = (iso: string, minutes: number): string => {
  const base = new Date(iso);
  if (Number.isNaN(base.getTime())) return '';
  return formatTimeForDisplay(new Date(base.getTime() + minutes * 60_000).toISOString());
};

export const buildAdminScheduledCallId = (recordId: number): string =>
  `${ADMIN_CALL_ID_PREFIX}${recordId}`;

export const parseAdminScheduledCallRecordId = (callId: string): number | null => {
  const match = callId.match(/^admin-scheduled-(\d+)$/);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isFinite(id) ? id : null;
};

export const mapAdminScheduledCallToOutreachSchedule = (
  record: AdminScheduledCallRecord,
): OutreachScheduleData | null => {
  const dateTimeRaw = record.dateTime?.trim();
  if (!dateTimeRaw) return null;

  const parsed = new Date(dateTimeRaw);
  if (Number.isNaN(parsed.getTime())) return null;

  const dateKey = toDateKey(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const callId = buildAdminScheduledCallId(record.id);
  const callType = resolveCallType(record.callType || 'discovery');
  const contactName = record.contactName?.trim() || record.email?.trim() || 'Guest';
  const clientLabel = record.eventTitle?.trim() || contactName;
  const contactEmail = record.email?.trim() || '';
  const meetingUrl = normalizeMeetLink(record.meetingLink) || record.meetingLink?.trim() || '';
  const timezone = parseTimezoneFromDescription(record.mailDescription || '');
  const startTime = formatTimeForDisplay(dateTimeRaw);
  const endTime = addMinutesToIso(dateTimeRaw, INTRO_CALL_DURATION_MIN) || startTime;
  const compactTime = formatCalendarCompactTime(dateTimeRaw);
  const status = record.callEventId ? 'confirmed' as const : 'confirmed' as const;

  const event: CalendarEvent = {
    date: dateKey,
    time: compactTime,
    label: clientLabel,
    type: callType,
    callId,
    status,
    source: 'admin',
  };

  const prepLines = [
    record.emailSubject?.trim() ? `Subject: ${record.emailSubject.trim()}` : '',
    record.mailDescription?.trim() || '',
  ].filter(Boolean);

  const call: OutreachCall = {
    id: callId,
    client: clientLabel,
    contact: contactName,
    contactEmail,
    date: dateKey,
    startTime,
    endTime,
    timezone,
    type: callType,
    typeLabel: CALL_TYPE_LABELS[callType],
    host: 'Dyad Admin',
    hostRole: 'Outreach',
    platform: meetingUrl ? 'Google Meet' : 'Video call',
    meetingUrl,
    attendeeCount: 1,
    prepNotes: prepLines.length
      ? prepLines.join('\n\n')
      : 'Scheduled via admin outreach.',
    source: 'admin',
    reminderCount: record.reminderCount ?? 0,
    adminScheduledCallId: record.id,
    callEventId: record.callEventId,
    dateTimeIso: dateTimeRaw,
    eventTitle: record.eventTitle?.trim() || clientLabel,
    agenda: [
      {
        duration: '0–10m',
        title: 'Welcome & introductions',
        detail: 'Confirm attendees and review call objectives.',
      },
      {
        duration: '10–25m',
        title: 'Discussion',
        detail: record.eventTitle?.trim() || 'Review practice needs and next steps.',
      },
      {
        duration: '25–30m',
        title: 'Wrap-up',
        detail: 'Confirm follow-up actions and scheduling.',
      },
    ],
    attendees: [
      {
        initials: initialsFromText(contactName),
        name: contactName,
        role: 'Primary contact',
        tag: 'External',
        external: true,
      },
    ],
  };

  return { events: [event], calls: [call] };
};

export const mapAdminScheduledCallsToOutreachSchedule = (
  records: AdminScheduledCallRecord[],
): OutreachScheduleData => {
  const events: CalendarEvent[] = [];
  const calls: OutreachCall[] = [];

  records.forEach((record) => {
    const mapped = mapAdminScheduledCallToOutreachSchedule(record);
    if (!mapped) return;
    events.push(...mapped.events);
    calls.push(...mapped.calls);
  });

  events.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  calls.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  return { events, calls };
};

export const fetchAdminScheduledCalls = async (
  token: string,
): Promise<OutreachScheduleData> => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';

  try {
    const res = await axios.get<AdminScheduledCallsResponse>(
      `${apiUrl}/calls-scheduled-admin`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to fetch scheduled calls');
    }

    return mapAdminScheduledCallsToOutreachSchedule(res.data.data ?? []);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = (error.response?.data as { message?: string } | undefined)?.message;
      throw new Error(message || 'Failed to fetch scheduled calls');
    }
    throw error;
  }
};

export const mergeOutreachScheduleData = (
  ...sources: OutreachScheduleData[]
): OutreachScheduleData => {
  const events: CalendarEvent[] = [];
  const calls: OutreachCall[] = [];

  sources.forEach((source) => {
    events.push(...source.events);
    calls.push(...source.calls);
  });

  events.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  calls.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  return { events, calls };
};

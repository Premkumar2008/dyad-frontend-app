import {
  CALL_TYPE_LABELS,
  toDateKey,
  type CalendarEvent,
  type CallStatus,
  type OutreachCall,
} from '../components/admin/outreachScheduleData';
import { getTimeZoneShortLabel } from './onboardingCalendarService';
import {
  fetchOnboardingRecords,
  type OnboardingListRecord,
} from './onboardingAdminService';
import { coerceOnboardingBoolean, deepCamelizeKeys } from './onboardingStorageService';
import { formatTimeForDisplay } from '../utils/dateTimeUtils';
import { normalizeMeetLink } from '../utils/calendarMeetLink';

const INTRO_CALL_DURATION_MIN = 30;

const MEETING_LINK_FIELD_KEYS = [
  'callMeetingLink',
  'meetingLink',
  'meetLink',
  'hangoutLink',
  'googleMeetLink',
  'joinUrl',
] as const;

const SCHEDULE_FIELD_KEYS = [
  'callDate',
  'callTime',
  'bookedCallDate',
  'bookedCallTime',
  'callTimeZone',
  'callMeetingLink',
  'meetingLink',
  'meetLink',
  'hangoutLink',
  'googleMeetLink',
  'joinUrl',
  'calendlyScheduled',
  'date',
  'time',
  'scheduledDate',
  'scheduledTime',
] as const;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const readString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const readFirstString = (source: Record<string, unknown>, ...keys: string[]): string => {
  for (const key of keys) {
    const value = readString(source[key]);
    if (value) return value;
  }
  return '';
};

const collectStepPayloadBlocks = (
  record: OnboardingListRecord,
  stepNum: 1 | 2,
): Record<string, unknown>[] => {
  const root = record as Record<string, unknown>;
  const payload = record.payload ?? {};
  const stepKey = `step${stepNum}`;
  const snakeKey = `step_${stepNum}_payload`;
  const camelKey = `${stepKey}Payload`;

  const candidates: unknown[] = [
    root[snakeKey],
    root[camelKey],
    root[`${stepKey}_payload`],
    payload[snakeKey],
    payload[camelKey],
    payload[`${stepKey}_payload`],
    payload[stepKey],
    payload[`step_${stepNum}`],
  ];

  return candidates.filter(isPlainObject);
};

const unwrapStepBucket = (
  block: Record<string, unknown>,
  stepKey: 'step1' | 'step2',
): Record<string, unknown> => {
  const camel = deepCamelizeKeys(block) as Record<string, unknown>;
  const nested = camel[stepKey];

  if (isPlainObject(nested)) {
    const inner = deepCamelizeKeys(nested) as Record<string, unknown>;
    const merged: Record<string, unknown> = { ...inner };

    SCHEDULE_FIELD_KEYS.forEach((field) => {
      if (!readString(merged[field]) && readString(camel[field])) {
        merged[field] = camel[field];
      }
    });

    return merged;
  }

  return camel;
};

const readStepPayloadFromRecord = (
  record: OnboardingListRecord,
  stepNum: 1 | 2,
): Record<string, unknown> => {
  const stepKey = stepNum === 1 ? 'step1' : 'step2';
  const blocks = collectStepPayloadBlocks(record, stepNum);

  for (const block of blocks) {
    const bucket = unwrapStepBucket(block, stepKey);
    if (Object.keys(bucket).length > 0) {
      return bucket;
    }
  }

  const payload = record.payload ?? {};
  const fallback = payload[stepKey] ?? payload[`step_${stepNum}`];
  if (isPlainObject(fallback)) {
    return deepCamelizeKeys(fallback) as Record<string, unknown>;
  }

  if (stepNum === 2) {
    return deepCamelizeKeys(payload) as Record<string, unknown>;
  }

  return {};
};

const initialsFromText = (text: string): string => {
  const parts = text.replace(/[,.\-]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
};

export const formatCalendarCompactTime = (timeRaw: string, timeZone?: string): string => {
  const display = formatTimeForDisplay(timeRaw, timeZone || undefined);
  const match = display.match(/^(\d{1,2}:\d{2})\s*(AM|PM)$/i);
  if (!match) return display.toLowerCase().replace(/\s+/g, '');
  const suffix = match[2].toLowerCase() === 'am' ? 'a' : 'p';
  return `${match[1]}${suffix}`;
};

const normalizeDateKey = (raw: string, timeRaw?: string): string | null => {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return toDateKey(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  if (timeRaw?.includes('T')) {
    const fromTime = new Date(timeRaw);
    if (!Number.isNaN(fromTime.getTime())) {
      return toDateKey(fromTime.getFullYear(), fromTime.getMonth(), fromTime.getDate());
    }
  }

  return null;
};

export const resolveOutreachMeetingUrl = (
  step2: Record<string, unknown>,
  record?: OnboardingListRecord,
): string => {
  for (const key of MEETING_LINK_FIELD_KEYS) {
    const normalized = normalizeMeetLink(step2[key]);
    if (normalized) return normalized;
  }

  if (record) {
    const root = record as Record<string, unknown>;
    const payload = record.payload ?? {};
    for (const source of [root, payload]) {
      for (const key of MEETING_LINK_FIELD_KEYS) {
        const normalized = normalizeMeetLink(source[key]);
        if (normalized) return normalized;
      }
    }
  }

  return '';
};

const resolveScheduleSlot = (step2: Record<string, unknown>, record?: OnboardingListRecord) => {
  const scheduled = coerceOnboardingBoolean(step2.calendlyScheduled);

  const callDate = scheduled
    ? readFirstString(step2, 'bookedCallDate', 'callDate', 'date', 'scheduledDate')
    : readFirstString(step2, 'callDate', 'date', 'scheduledDate', 'bookedCallDate');

  const callTime = scheduled
    ? readFirstString(step2, 'bookedCallTime', 'callTime', 'time', 'scheduledTime')
    : readFirstString(step2, 'callTime', 'time', 'scheduledTime', 'bookedCallTime');

  const callTimeZone = readFirstString(step2, 'callTimeZone');
  const meetingLink = resolveOutreachMeetingUrl(step2, record);

  if (!callTime) return null;

  const dateKey = normalizeDateKey(callDate, callTime) ?? normalizeDateKey('', callTime);
  if (!dateKey) return null;

  return {
    dateKey,
    callTime,
    callTimeZone,
    meetingLink,
    scheduled,
  };
};

const resolvePracticeLabel = (
  record: OnboardingListRecord,
  step1: Record<string, unknown>,
  step2: Record<string, unknown>,
): string => {
  const npiApiData = step1.npiApiData;
  const npiFullName = isPlainObject(npiApiData)
    ? readString(npiApiData.fullName)
    : '';

  const organizationName = readString(step2.organizationName);
  const contactName = record.contact_name?.trim()
    || readString(step2.callerName)
    || readString(record.payload?.contactName as string)
    || '';

  const first = readString(step2.firstName);
  const last = readString(step2.lastName);
  const personName = [first, last].filter(Boolean).join(' ');

  return npiFullName
    || organizationName
    || personName
    || contactName
    || record.onboarding_id
    || `Onboarding ${record.id}`;
};

const resolveContactName = (
  record: OnboardingListRecord,
  step2: Record<string, unknown>,
  practiceLabel: string,
): string => {
  const fromRecord = record.contact_name?.trim();
  if (fromRecord) return fromRecord;

  const callerName = readString(step2.callerName);
  if (callerName) return callerName;

  const first = readString(step2.firstName);
  const last = readString(step2.lastName);
  const combined = [first, last].filter(Boolean).join(' ');
  if (combined) return combined;

  return practiceLabel;
};

const resolveContactEmail = (
  record: OnboardingListRecord,
  step2: Record<string, unknown>,
): string =>
  record.contact_email?.trim()
  || readString(step2.callerEmail)
  || readString(step2.contactEmail)
  || readString(record.payload?.contactEmail as string)
  || '';

const addMinutesToScheduleTime = (
  dateKey: string,
  timeRaw: string,
  minutes: number,
  timeZone?: string,
): string => {
  const base = timeRaw.includes('T')
    ? new Date(timeRaw)
    : new Date(`${dateKey}T${timeRaw.length === 5 ? `${timeRaw}:00` : timeRaw}`);

  if (Number.isNaN(base.getTime())) {
    return formatTimeForDisplay(timeRaw, timeZone || undefined);
  }

  const end = new Date(base.getTime() + minutes * 60_000);
  return formatTimeForDisplay(end.toISOString(), timeZone || undefined);
};

const resolveCallStatus = (
  scheduled: boolean,
  callEventId: string | null | undefined,
): CallStatus => {
  if (scheduled || callEventId) return 'confirmed';
  return 'pending';
};

export interface OutreachScheduleData {
  events: CalendarEvent[];
  calls: OutreachCall[];
}

export const mapOnboardingRecordToOutreachSchedule = (
  record: OnboardingListRecord,
): OutreachScheduleData | null => {
  const step1 = readStepPayloadFromRecord(record, 1);
  const step2 = readStepPayloadFromRecord(record, 2);
  const slot = resolveScheduleSlot(step2, record);
  if (!slot) return null;

  const onboardingId = record.onboarding_id?.trim() || String(record.id);
  const practiceLabel = resolvePracticeLabel(record, step1, step2);
  const contactName = resolveContactName(record, step2, practiceLabel);
  const contactEmail = resolveContactEmail(record, step2);
  const status = resolveCallStatus(slot.scheduled, record.call_event_id);
  const timeZoneShort = slot.callTimeZone ? getTimeZoneShortLabel(slot.callTimeZone) : 'PT';
  const startTime = formatTimeForDisplay(slot.callTime, slot.callTimeZone || undefined);
  const endTime = addMinutesToScheduleTime(
    slot.dateKey,
    slot.callTime,
    INTRO_CALL_DURATION_MIN,
    slot.callTimeZone || undefined,
  );
  const compactTime = formatCalendarCompactTime(slot.callTime, slot.callTimeZone || undefined);
  const callType = 'onboarding' as const;

  const event: CalendarEvent = {
    date: slot.dateKey,
    time: compactTime,
    label: practiceLabel,
    type: callType,
    callId: onboardingId,
    status,
  };

  const call: OutreachCall = {
    id: onboardingId,
    client: practiceLabel,
    contact: contactName,
    contactEmail,
    date: slot.dateKey,
    startTime,
    endTime,
    timezone: timeZoneShort,
    type: callType,
    typeLabel: CALL_TYPE_LABELS[callType],
    host: 'Priya Anand',
    hostRole: 'Onboarding',
    platform: slot.meetingLink ? 'Google Meet' : 'Video call',
    meetingUrl: slot.meetingLink,
    attendeeCount: contactEmail ? 2 : 1,
    prepNotes: contactEmail
      ? `Introduction call scheduled during onboarding enrollment. Contact: ${contactName} (${contactEmail}).`
      : `Introduction call scheduled during onboarding enrollment. Contact: ${contactName}.`,
    agenda: [
      {
        duration: '0–10m',
        title: 'Welcome & introductions',
        detail: 'Confirm attendees and review the Dyad onboarding path.',
      },
      {
        duration: '10–25m',
        title: 'Practice overview',
        detail: 'Discuss workflow, billing volume, and implementation priorities.',
      },
      {
        duration: '25–30m',
        title: 'Next steps',
        detail: 'Confirm enrollment milestones and follow-up actions.',
      },
    ],
    attendees: [
      { initials: 'PA', name: 'Priya Anand', role: 'Onboarding Lead · Dyad', tag: 'Host' },
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

export const mapOnboardingRecordsToOutreachSchedule = (
  records: OnboardingListRecord[],
): OutreachScheduleData => {
  const events: CalendarEvent[] = [];
  const calls: OutreachCall[] = [];

  records.forEach((record) => {
    const mapped = mapOnboardingRecordToOutreachSchedule(record);
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

export const fetchOutreachScheduleFromOnboarding = async (
  token: string,
): Promise<OutreachScheduleData> => {
  const { records } = await fetchOnboardingRecords(token);
  return mapOnboardingRecordsToOutreachSchedule(records);
};

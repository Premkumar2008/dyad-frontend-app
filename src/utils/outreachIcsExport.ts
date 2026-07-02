import {
  CALL_TYPE_LABELS,
  resolveCalendarEventMeta,
  type CalendarEvent,
  type CallStatus,
  type OutreachCall,
} from '../components/admin/outreachScheduleData';

const DEFAULT_DURATION_MIN = 30;
const CRLF = '\r\n';

const escapeIcsText = (value: string): string =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

const foldIcsLine = (line: string): string => {
  const maxLength = 75;
  if (line.length <= maxLength) return line;

  const parts: string[] = [line.slice(0, maxLength)];
  let remainder = line.slice(maxLength);
  while (remainder.length > 0) {
    parts.push(` ${remainder.slice(0, maxLength - 1)}`);
    remainder = remainder.slice(maxLength - 1);
  }
  return parts.join(CRLF);
};

const pad2 = (value: number): string => String(value).padStart(2, '0');

const formatIcsLocalDateTime = (date: Date): string => (
  `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`
  + `T${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`
);

const formatIcsUtcDateTime = (date: Date): string => (
  date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
);

const parseMeridiemTime = (
  dateKey: string,
  timeLabel: string,
): Date | null => {
  const trimmed = timeLabel.trim();
  const meridiemMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (meridiemMatch) {
    const [y, m, d] = dateKey.split('-').map(Number);
    let hour = Number.parseInt(meridiemMatch[1], 10);
    const minute = Number.parseInt(meridiemMatch[2], 10);
    const meridiem = meridiemMatch[3].toUpperCase();
    if (meridiem === 'PM' && hour !== 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    return new Date(y, m - 1, d, hour, minute, 0);
  }

  const compactMatch = trimmed.match(/^(\d{1,2}):(\d{2})(a|p)$/i);
  if (compactMatch) {
    const [y, m, d] = dateKey.split('-').map(Number);
    let hour = Number.parseInt(compactMatch[1], 10);
    const minute = Number.parseInt(compactMatch[2], 10);
    const meridiem = compactMatch[3].toLowerCase();
    if (meridiem === 'p' && hour !== 12) hour += 12;
    if (meridiem === 'a' && hour === 12) hour = 0;
    return new Date(y, m - 1, d, hour, minute, 0);
  }

  if (trimmed.includes('T')) {
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const twentyFourHour = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (twentyFourHour) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const hour = Number.parseInt(twentyFourHour[1], 10);
    const minute = Number.parseInt(twentyFourHour[2], 10);
    const second = Number.parseInt(twentyFourHour[3] ?? '0', 10);
    return new Date(y, m - 1, d, hour, minute, second);
  }

  const fallback = new Date(`${dateKey}T${trimmed}`);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const mapIcsStatus = (status: CallStatus | undefined): string => {
  if (status === 'pending') return 'TENTATIVE';
  return 'CONFIRMED';
};

const buildDescription = (call: OutreachCall | null, event: CalendarEvent): string => {
  const lines: string[] = [];
  const typeLabel = call?.typeLabel ?? CALL_TYPE_LABELS[event.type];
  lines.push(`Call type: ${typeLabel}`);

  const meta = resolveCalendarEventMeta(event);
  lines.push(`Host: ${call?.host ?? meta.hostName}`);
  lines.push(`Status: ${meta.status}`);

  if (call?.contact) {
    lines.push(`Contact: ${call.contact}`);
  }
  if (call?.contactEmail) {
    lines.push(`Email: ${call.contactEmail}`);
  }
  if (call?.prepNotes) {
    lines.push('');
    lines.push(call.prepNotes);
  }
  if (call?.agenda?.length) {
    lines.push('');
    lines.push('Agenda:');
    call.agenda.forEach((item) => {
      lines.push(`- ${item.duration} ${item.title}: ${item.detail}`);
    });
  }

  return lines.join('\n');
};

interface IcsEventDraft {
  uid: string;
  summary: string;
  description: string;
  location: string;
  url: string;
  start: Date;
  end: Date;
  status: string;
  attendeeEmail?: string;
}

const buildEventDraft = (
  event: CalendarEvent,
  call: OutreachCall | null,
): IcsEventDraft | null => {
  const start = call
    ? parseMeridiemTime(call.date, call.startTime)
    : parseMeridiemTime(event.date, event.time);

  if (!start) return null;

  const end = call
    ? parseMeridiemTime(call.date, call.endTime)
    : new Date(start.getTime() + DEFAULT_DURATION_MIN * 60_000);

  const resolvedEnd = end && end.getTime() > start.getTime()
    ? end
    : new Date(start.getTime() + DEFAULT_DURATION_MIN * 60_000);

  const callId = call?.id ?? event.callId ?? `${event.date}-${event.time}-${event.label}`;
  const meta = resolveCalendarEventMeta(event);
  const typeLabel = call?.typeLabel ?? CALL_TYPE_LABELS[event.type];

  return {
    uid: `${callId}@dyad-outreach`,
    summary: `${typeLabel}: ${call?.client ?? event.label}`,
    description: buildDescription(call, event),
    location: call?.meetingUrl ?? '',
    url: call?.meetingUrl ?? '',
    start,
    end: resolvedEnd,
    status: mapIcsStatus(meta.status),
    attendeeEmail: call?.contactEmail,
  };
};

const buildVevent = (draft: IcsEventDraft, stamp: Date): string => {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(draft.uid)}`,
    `DTSTAMP:${formatIcsUtcDateTime(stamp)}`,
    `DTSTART:${formatIcsLocalDateTime(draft.start)}`,
    `DTEND:${formatIcsLocalDateTime(draft.end)}`,
    `SUMMARY:${escapeIcsText(draft.summary)}`,
    `DESCRIPTION:${escapeIcsText(draft.description)}`,
    `STATUS:${draft.status}`,
  ];

  if (draft.location) {
    lines.push(`LOCATION:${escapeIcsText(draft.location)}`);
  }
  if (draft.url) {
    lines.push(`URL:${escapeIcsText(draft.url)}`);
  }
  if (draft.attendeeEmail) {
    lines.push(`ATTENDEE;CN=${escapeIcsText(draft.attendeeEmail)};RSVP=TRUE:mailto:${draft.attendeeEmail}`);
  }

  lines.push('END:VEVENT');
  return lines.map(foldIcsLine).join(CRLF);
};

export const buildOutreachScheduleIcs = (
  events: CalendarEvent[],
  calls: OutreachCall[],
): string => {
  const callsById = new Map(calls.map((call) => [call.id, call]));
  const stamp = new Date();
  const vevents: string[] = [];

  events.forEach((event) => {
    const call = event.callId ? callsById.get(event.callId) ?? null : null;
    const draft = buildEventDraft(event, call);
    if (draft) {
      vevents.push(buildVevent(draft, stamp));
    }
  });

  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dyad Practice Solutions//Outreach Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Dyad Outreach Schedule',
  ];

  const footer = ['END:VCALENDAR'];

  return [...header, ...vevents, ...footer].map(foldIcsLine).join(CRLF);
};

export const downloadTextFile = (filename: string, content: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export const downloadOutreachScheduleIcs = (
  events: CalendarEvent[],
  calls: OutreachCall[],
  filenamePrefix = 'dyad-outreach-schedule',
): number => {
  if (events.length === 0) return 0;

  const content = buildOutreachScheduleIcs(events, calls);
  const stamp = new Date().toISOString().slice(0, 10);
  downloadTextFile(
    `${filenamePrefix}-${stamp}.ics`,
    content,
    'text/calendar;charset=utf-8',
  );
  return events.length;
};

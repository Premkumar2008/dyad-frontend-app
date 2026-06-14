/**
 * Onboarding schedule - Google Calendar availability & booking.
 *
 * Backend endpoints (connect to your Gmail / Google Calendar):
 *   GET  /calendar/available-dates
 *   GET  /calendar/available-slots?date=YYYY-MM-DD
 *   POST /create-event  (existing - creates event on connected calendar)
 *   POST /update-event  (patches existing event - requires eventId + calendarId; do not send date/time/createConference)
 *
 * Required server-side setup (your side):
 *   - Google Cloud project with Calendar API enabled
 *   - Service account OR OAuth credentials with access to your Gmail calendar
 *   - GOOGLE_CALENDAR_ID env var (your Gmail address or calendar ID)
 */

import api from './api';
import { CalendarService } from './calendarService';
import { ONBOARDING_CALENDAR_EMAIL } from './onboardingScheduleEmailService';
import { formatDateTimeForAPI, formatTimeForDisplay } from '../utils/dateTimeUtils';
import {
  getCreateEventMeetingLink,
  unwrapApiPayload,
} from '../utils/calendarMeetLink';

export interface ScheduleBookingPayload {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  organization: string;
  titleRole?: string;
  primarySpecialty?: string;
  selectedStates?: string[];
  organizationType?: string;
  billableProviders?: string;
  locationsFacilities?: string;
  engagementTimeline?: string;
  engagementTimelineLabel?: string;
  npi?: string;
  practiceType?: string;
  date: string;
  time: string;
  timeZone?: string;
  slotStart?: string;
  customEventTitle?: string;
  customEventDescription?: string;
  eventSource?: string;
  callType?: string;
}

const DEFAULT_MEET_LINK = (import.meta.env.VITE_ONBOARDING_MEET_LINK as string | undefined)?.trim() || '';

const DEFAULT_CALENDAR_ID =
  (import.meta.env.VITE_GOOGLE_CALENDAR_ID as string | undefined)?.trim()
  || ONBOARDING_CALENDAR_EMAIL;

export type CreateEventMeta = {
  eventId: string;
  eventLink?: string;
  calendarId: string;
  meetingLink?: string;
};

/** Read event identifiers returned by POST /create-event (for PATCH /update-event). */
export const extractCreateEventMeta = (raw: Record<string, unknown>): CreateEventMeta => {
  const body = unwrapApiPayload(raw);
  const eventId = String(body.eventId ?? raw.eventId ?? body.id ?? raw.id ?? '').trim();
  const eventLink = String(body.eventLink ?? raw.eventLink ?? '').trim() || undefined;
  const calendarId =
    String(body.calendarId ?? raw.calendarId ?? body.calendarEmail ?? raw.calendarEmail ?? '').trim()
    || DEFAULT_CALENDAR_ID;

  return {
    eventId,
    eventLink,
    calendarId,
    meetingLink: getCreateEventMeetingLink(raw) || undefined,
  };
};

export type ScheduleBookingResult = {
  success: boolean;
  message: string;
  eventId?: string;
  eventLink?: string;
  calendarId?: string;
  meetingLink?: string;
  updated?: boolean;
};

export type ScheduleBookingOptions = {
  existingEvent?: Partial<CreateEventMeta>;
};

/** Calendar event title for client onboarding intro calls */
export const buildOnboardingEventTitle = (name: string): string => {
  const displayName = name.trim() || 'Client';
  return `Onboarding Request from ${displayName}`;
};

export const resolveScheduleContactName = (payload: ScheduleBookingPayload): string => {
  const fromParts = [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim();
  return payload.name.trim() || fromParts || 'Client';
};

export const buildOnboardingEventDescription = (
  payload: ScheduleBookingPayload,
  meetingLink?: string,
): string => {
  const contactName = resolveScheduleContactName(payload);
  const link = (meetingLink || DEFAULT_MEET_LINK).trim();
  const tz = payload.timeZone || 'America/Los_Angeles';
  const timeLabel = payload.slotStart
    ? formatTimeForDisplay(payload.slotStart, tz)
    : formatTimeForDisplay(payload.time);

  const lines: string[] = [];

  if (link) {
    lines.push(
      '──────────────────────────────────',
      'JOIN GOOGLE MEET',
      link,
      'Click the link above to join your introduction call.',
      '──────────────────────────────────',
      '',
    );
  }

  lines.push(
    'Dyad Client Onboarding - Introduction Call',
    '',
    `Date: ${payload.date}`,
    `Time: ${timeLabel} (${tz})`,
    `Name: ${contactName}`,
    payload.titleRole ? `Title / Role: ${payload.titleRole}` : '',
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
  );

  if (!link) {
    lines.push('', 'A Google Meet join link will be added to this calendar event.');
  }

  return lines.filter(line => line !== '').join('\n');
};

export const buildCustomEventDescription = (
  customBody: string,
  payload: ScheduleBookingPayload,
  meetingLink?: string,
): string => {
  const contactName = resolveScheduleContactName(payload);
  const link = (meetingLink || DEFAULT_MEET_LINK).trim();
  const tz = payload.timeZone || 'America/Los_Angeles';
  const timeLabel = payload.slotStart
    ? formatTimeForDisplay(payload.slotStart, tz)
    : formatTimeForDisplay(payload.time);

  const footer: string[] = [
    '',
    '──────────────────────────────────',
    'MEETING DETAILS',
    `Date: ${payload.date}`,
    `Time: ${timeLabel} (${tz})`,
    `Name: ${contactName}`,
    `Email: ${payload.email}`,
  ];

  if (link) {
    footer.push('', 'JOIN GOOGLE MEET', link);
  }

  return `${customBody.trim()}\n${footer.join('\n')}`;
};

export const buildOnboardingCreateEventBody = (
  payload: ScheduleBookingPayload,
  meetingLink?: string,
) => {
  const contactName = resolveScheduleContactName(payload);
  const title = payload.customEventTitle?.trim() || buildOnboardingEventTitle(contactName);
  const linkForDescription = meetingLink || DEFAULT_MEET_LINK;
  const description = payload.customEventDescription?.trim()
    ? buildCustomEventDescription(payload.customEventDescription, { ...payload, name: contactName }, linkForDescription)
    : buildOnboardingEventDescription(
      { ...payload, name: contactName },
      linkForDescription,
    );
  const attendeeEmail = payload.email.trim();

  return {
    name: contactName,
    firstName: payload.firstName?.trim() ?? '',
    lastName: payload.lastName?.trim() ?? '',
    email: attendeeEmail,
    phone: payload.phone.trim(),
    phoneNumber: payload.phone.trim(),
    organization: payload.organization.trim(),
    titleRole: payload.titleRole?.trim() ?? '',
    primarySpecialty: payload.primarySpecialty?.trim() ?? '',
    selectedStates: payload.selectedStates ?? [],
    organizationType: payload.organizationType?.trim() ?? '',
    billableProviders: payload.billableProviders?.trim() ?? '',
    locationsFacilities: payload.locationsFacilities?.trim() ?? '',
    engagementTimeline: payload.engagementTimeline?.trim() ?? '',
    engagementTimelineLabel: payload.engagementTimelineLabel?.trim() ?? '',
    npi: payload.npi?.trim() ?? '',
    practiceType: payload.practiceType?.trim() ?? '',
    date: payload.date,
    time: payload.time,
    dateTime: payload.slotStart || formatDateTimeForAPI(payload.date, payload.time),
    summary: title,
    title,
    eventTitle: title,
    calendarSummary: title,
    subject: title,
    useCustomTitle: true,
    useSummaryAsTitle: true,
    description,
    durationMinutes: 30,
    timezone: payload.timeZone || 'America/Los_Angeles',
    source: payload.eventSource || 'client-onboarding',
    eventType: payload.eventSource === 'admin-outreach' ? 'outreach' : 'onboarding',
    addGoogleMeet: true,
    createGoogleMeet: true,
    createConference: true,
    conferenceType: 'hangoutsMeet',
    sendUpdates: 'all',
    inviteAttendee: true,
    guestEmail: attendeeEmail,
    attendees: [{ email: attendeeEmail, displayName: contactName }],
    includeJoinMeetingInDescription: true,
    joinMeetingLabel: 'Join Google Meet',
    ...(payload.callType ? { callType: payload.callType } : {}),
  };
};

/** Reschedule body for POST /update-event when an event already exists (requires eventId). */
export const buildOnboardingRescheduleEventBody = (
  meta: Pick<CreateEventMeta, 'eventId' | 'eventLink' | 'calendarId'>,
  payload: ScheduleBookingPayload,
  meetingLink: string,
) => {
  const contactName = resolveScheduleContactName(payload);
  const createFields = buildOnboardingCreateEventBody({ ...payload, name: contactName }, meetingLink);

  return {
    ...buildOnboardingUpdateEventBody(meta, payload, meetingLink),
    date: payload.date,
    time: payload.time,
    dateTime: createFields.dateTime,
    durationMinutes: createFields.durationMinutes,
    timezone: createFields.timezone,
    reschedule: true,
    name: contactName,
    firstName: createFields.firstName,
    lastName: createFields.lastName,
    email: createFields.email,
    phone: createFields.phone,
    phoneNumber: createFields.phoneNumber,
    organization: createFields.organization,
    titleRole: createFields.titleRole,
    primarySpecialty: createFields.primarySpecialty,
    selectedStates: createFields.selectedStates,
    organizationType: createFields.organizationType,
    billableProviders: createFields.billableProviders,
    locationsFacilities: createFields.locationsFacilities,
    engagementTimeline: createFields.engagementTimeline,
    engagementTimelineLabel: createFields.engagementTimelineLabel,
    npi: createFields.npi,
    practiceType: createFields.practiceType,
    guestEmail: createFields.guestEmail,
    attendees: createFields.attendees,
  };
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Fetch Meet link for an existing calendar event (post-create). */
export const fetchCalendarEventMeetLink = async (eventId: string): Promise<string | undefined> => {
  const attempts: Array<() => Promise<Record<string, unknown>>> = [
    async () => (await api.get(`/calendar/event/${eventId}`)).data ?? {},
    async () => (await api.get('/calendar/event', { params: { eventId } })).data ?? {},
    async () => (await api.post('/calendar/event', { eventId })).data ?? {},
  ];

  for (const load of attempts) {
    try {
      const raw = await load();
      const link = getCreateEventMeetingLink(raw);
      if (link) return link;
    } catch {
      /* try next endpoint shape */
    }
  }
  return undefined;
};

export const waitForCalendarMeetLink = async (
  eventId: string,
  attempts = 4,
  delayMs = 1000,
): Promise<string | undefined> => {
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await sleep(delayMs);
    const link = await fetchCalendarEventMeetLink(eventId);
    if (link) return link;
  }
  return undefined;
};

/** Build PATCH body for POST /update-event - must not include create-only fields (date/time/conference). */
export const buildOnboardingUpdateEventBody = (
  meta: Pick<CreateEventMeta, 'eventId' | 'eventLink' | 'calendarId'>,
  payload: ScheduleBookingPayload,
  meetingLink: string,
) => {
  const contactName = resolveScheduleContactName(payload);
  const title = buildOnboardingEventTitle(contactName);
  const description = buildOnboardingEventDescription(
    { ...payload, name: contactName },
    meetingLink,
  );
  const calendarId = meta.calendarId || DEFAULT_CALENDAR_ID;

  return {
    // Tell backend this is an update, not a new booking
    action: 'update',
    mode: 'update',
    isUpdate: true,
    updateOnly: true,
    updateExistingEvent: true,

    // Google Calendar event identifiers (backends vary on field name)
    eventId: meta.eventId,
    id: meta.eventId,
    googleEventId: meta.eventId,
    calendarEventId: meta.eventId,

    calendarId,
    calendarEmail: calendarId,

    ...(meta.eventLink ? { eventLink: meta.eventLink } : {}),

    // Patch fields only
    meetingLink,
    meetLink: meetingLink,
    hangoutLink: meetingLink,
    description,
    summary: title,
    title,
    eventTitle: title,

    joinMeetingLabel: 'Join Google Meet',
    includeJoinMeetingInDescription: true,
    sendUpdates: 'all',
    source: 'client-onboarding',
    eventType: 'onboarding',
  };
};

/** Patch calendar event description with the Meet link after /create-event returns it. */
export const updateCalendarEventMeetLink = async (
  meta: CreateEventMeta,
  payload: ScheduleBookingPayload,
  meetingLink: string,
): Promise<string | undefined> => {
  if (!meta.eventId?.trim()) {
    console.warn('update-event skipped: missing eventId from /create-event');
    return meetingLink;
  }

  const updateBody = buildOnboardingUpdateEventBody(meta, payload, meetingLink);

  try {
    const response = await api.post<Record<string, unknown>>('/update-event', updateBody);
    return getCreateEventMeetingLink(response.data ?? {}) || meetingLink;
  } catch (error) {
    console.warn('update-event failed (event may already include Meet link):', error);
    return meetingLink;
  }
};

const PT_SLOT_START_HOUR = 9;
const PT_SLOT_END_HOUR = 16;
const PT_SLOT_END_MINUTE = 30;
export const SCHEDULE_DAYS_AHEAD = 90;

export const getScheduleEndDate = (): Date => {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + SCHEDULE_DAYS_AHEAD);
  return end;
};

export const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export interface ScheduleCalendarDay {
  date: string;
  day: number;
  isAvailable: boolean;
  isToday: boolean;
}

export interface ScheduleCalendarMonth {
  key: string;
  label: string;
  cells: (ScheduleCalendarDay | null)[];
}

/** All dates from today through the next 90 days (exclusive end) */
export const getFallbackAvailableDates = (): string[] => {
  const dates: string[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  const end = getScheduleEndDate();
  end.setHours(12, 0, 0, 0);

  while (cursor < end) {
    dates.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

export const buildScheduleCalendarMonths = (
  availableSet: Set<string>,
): ScheduleCalendarMonth[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toDateKey(today);
  const scheduleEnd = getScheduleEndDate();
  const endKey = toDateKey(scheduleEnd);

  const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastInRange = new Date(scheduleEnd);
  lastInRange.setDate(lastInRange.getDate() - 1);
  const endMonth = new Date(lastInRange.getFullYear(), lastInRange.getMonth(), 1);

  const months: ScheduleCalendarMonth[] = [];
  const cursor = new Date(startMonth);

  while (cursor <= endMonth) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow = cursor.getDay();
    const cells: (ScheduleCalendarDay | null)[] = [];

    for (let i = 0; i < firstDow; i++) cells.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(year, month, d);
      cellDate.setHours(0, 0, 0, 0);
      const dateKey = toDateKey(cellDate);
      const inRange = dateKey >= todayKey && dateKey < endKey;
      cells.push({
        date: dateKey,
        day: d,
        isAvailable: inRange && availableSet.has(dateKey),
        isToday: dateKey === todayKey,
      });
    }

    months.push({
      key: `${year}-${month + 1}`,
      label: cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      cells,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
};

export const filterDatesWithinRange = (dates: string[]): string[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toDateKey(today);
  const endKey = toDateKey(getScheduleEndDate());

  return dates.filter(d => d >= todayKey && d < endKey);
};

export interface ScheduleTimeSlot {
  id: string;
  start: string;
  end: string;
  label: string;
}

export interface AvailableSlotsApiResponse {
  success?: boolean;
  date?: string;
  calendarId?: string;
  timeZone?: string;
  slotDurationMinutes?: number;
  availableSlots?: Array<{ start: string; end: string }>;
  slots?: string[];
}

export interface FetchAvailableSlotsResult {
  slots: ScheduleTimeSlot[];
  timeZone: string;
}

const FALLBACK_TIME_ZONE = 'America/Los_Angeles';

export const getTimeZoneShortLabel = (timeZone: string): string => {
  if (timeZone === 'Asia/Kolkata') return 'IST';
  if (timeZone === 'America/Los_Angeles') return 'PT';
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    }).formatToParts(new Date());
    return parts.find(p => p.type === 'timeZoneName')?.value || timeZone;
  } catch {
    return timeZone;
  }
};

export const getTimeZoneDisplayLabel = (timeZone: string): string => {
  if (timeZone === 'Asia/Kolkata') return 'India Standard Time (IST)';
  if (timeZone === 'America/Los_Angeles') return 'Pacific Time (PT)';
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'long',
    }).formatToParts(new Date());
    const name = parts.find(p => p.type === 'timeZoneName')?.value;
    return name || timeZone;
  } catch {
    return timeZone;
  }
};

const formatSlotLabel = (isoStart: string, timeZone: string): string =>
  formatTimeForDisplay(isoStart, timeZone);

export const parseAvailableSlotsResponse = (
  data: AvailableSlotsApiResponse | undefined,
  date: string,
): FetchAvailableSlotsResult => {
  const timeZone = data?.timeZone || FALLBACK_TIME_ZONE;

  if (Array.isArray(data?.availableSlots) && data.availableSlots.length > 0) {
    return {
      timeZone,
      slots: data.availableSlots.map(slot => ({
        id: slot.start,
        start: slot.start,
        end: slot.end,
        label: formatSlotLabel(slot.start, timeZone),
      })),
    };
  }

  if (Array.isArray(data?.slots) && data.slots.length > 0) {
    return {
      timeZone,
      slots: data.slots.map(time => ({
        id: time,
        start: '',
        end: '',
        label: formatTimeForDisplay(time),
      })),
    };
  }

  return { slots: [], timeZone };
};

/** 30-minute slots 9:00 AM – 4:30 PM PT (fallback when API unavailable) */
export const getFallbackTimeSlots = (date: string): ScheduleTimeSlot[] => {
  const slots: ScheduleTimeSlot[] = [];
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = date === todayStr;

  for (let hour = PT_SLOT_START_HOUR; hour <= PT_SLOT_END_HOUR; hour++) {
    for (const minute of [0, 30]) {
      if (hour === PT_SLOT_END_HOUR && minute > PT_SLOT_END_MINUTE) break;
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      if (isToday) {
        const slotDate = new Date(`${date}T${time}:00`);
        if (slotDate <= now) continue;
      }
      slots.push({
        id: time,
        start: '',
        end: '',
        label: formatTimeForDisplay(time),
      });
    }
  }
  return slots;
};

export const fetchAvailableDates = async (): Promise<string[]> => {
  try {
    const res = await api.get<{ dates: string[] }>('/calendar/available-dates');
    if (Array.isArray(res.data?.dates) && res.data.dates.length > 0) {
      return filterDatesWithinRange(res.data.dates);
    }
  } catch {
    /* use fallback */
  }
  return getFallbackAvailableDates();
};

export const fetchAvailableTimeSlots = async (date: string): Promise<FetchAvailableSlotsResult> => {
  try {
    const res = await api.get<AvailableSlotsApiResponse>('/calendar/available-slots', { params: { date } });
    return parseAvailableSlotsResponse(res.data, date);
  } catch (err: unknown) {
    const apiMessage = err && typeof err === 'object' && 'response' in err
      ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
      : undefined;
    throw new Error(apiMessage || 'Could not load available times. Please try again.');
  }
};

/** Update an existing calendar event (reschedule / contact changes) via POST /update-event. */
export const updateIntroductionCall = async (
  payload: ScheduleBookingPayload,
  meta: CreateEventMeta,
): Promise<ScheduleBookingResult> => {
  if (!meta.eventId?.trim()) {
    return { success: false, message: 'Missing calendar event ID for update.' };
  }

  let meetingLink =
    meta.meetingLink?.trim()
    || DEFAULT_MEET_LINK
    || (await waitForCalendarMeetLink(meta.eventId))
    || '';

  const updateBody = buildOnboardingRescheduleEventBody(meta, payload, meetingLink);

  try {
    const response = await api.post<Record<string, unknown>>('/update-event', updateBody);
    const raw = response.data ?? {};
    const body = unwrapApiPayload(raw);
    const resolvedLink = getCreateEventMeetingLink(raw) || meetingLink || undefined;
    const updatedMeta = extractCreateEventMeta({
      ...raw,
      eventId: meta.eventId,
      calendarId: meta.calendarId,
      eventLink: meta.eventLink ?? raw.eventLink,
      meetingLink: resolvedLink,
    });

    return {
      success: (raw.success as boolean | undefined) ?? (body.success as boolean | undefined) ?? true,
      message: String(raw.message || body.message || '') || 'Introduction call updated',
      eventId: updatedMeta.eventId || meta.eventId,
      eventLink: updatedMeta.eventLink || meta.eventLink,
      calendarId: updatedMeta.calendarId || meta.calendarId,
      meetingLink: resolvedLink,
      updated: true,
    };
  } catch {
    return { success: false, message: 'Could not update the call on Google Calendar. Please try again.' };
  }
};

export const bookIntroductionCall = async (
  payload: ScheduleBookingPayload,
  options?: ScheduleBookingOptions,
): Promise<ScheduleBookingResult> => {
  const existingEventId = options?.existingEvent?.eventId?.trim();
  if (existingEventId) {
    return updateIntroductionCall(payload, {
      eventId: existingEventId,
      eventLink: options?.existingEvent?.eventLink,
      calendarId: options?.existingEvent?.calendarId || DEFAULT_CALENDAR_ID,
      meetingLink: options?.existingEvent?.meetingLink,
    });
  }

  const contactName = resolveScheduleContactName(payload);
  const eventBody = buildOnboardingCreateEventBody({ ...payload, name: contactName });

  try {
    const response = await api.post<Record<string, unknown>>('/create-event', eventBody);
    const raw = response.data ?? {};
    const meta = extractCreateEventMeta(raw);
    const meetingLink = meta.meetingLink || getCreateEventMeetingLink(raw) || DEFAULT_MEET_LINK || undefined;
    const body = unwrapApiPayload(raw);

    if (meta.eventId && meetingLink) {
      void updateCalendarEventMeetLink(
        { ...meta, meetingLink },
        { ...payload, name: contactName },
        meetingLink,
      );
    }

    return {
      success: (raw.success as boolean | undefined) ?? (body.success as boolean | undefined) ?? true,
      message: String(raw.message || body.message || '') || 'Introduction call scheduled',
      eventId: meta.eventId || undefined,
      eventLink: meta.eventLink,
      calendarId: meta.calendarId,
      meetingLink,
    };
  } catch (error) {
    const validation = CalendarService.validateData({
      name: contactName,
      date: payload.date,
      time: payload.time,
    });
    if (!validation.isValid) {
      return { success: false, message: (Object.values(validation.errors) as string[])[0] || 'Invalid schedule' };
    }
    const fallback = await CalendarService.createEvent({
      name: contactName,
      date: payload.date,
      time: payload.slotStart || payload.time,
      email: payload.email,
      phone: payload.phone,
      organization: payload.organization,
      summary: eventBody.summary as string,
      title: eventBody.title as string,
      description: eventBody.description as string,
      addGoogleMeet: true,
      isOnboarding: true,
      attendees: eventBody.attendees as Array<{ email: string; displayName?: string }>,
      guestEmail: eventBody.guestEmail as string,
    });
    const meetingLink =
      getCreateEventMeetingLink({
        meetingLink: fallback.meetingLink,
        eventId: fallback.eventId,
      }) || fallback.meetingLink || DEFAULT_MEET_LINK || undefined;

    const fallbackMeta: CreateEventMeta = {
      eventId: fallback.eventId?.trim() || '',
      calendarId: DEFAULT_CALENDAR_ID,
      meetingLink,
    };

    if (fallbackMeta.eventId && meetingLink) {
      void updateCalendarEventMeetLink(
        fallbackMeta,
        { ...payload, name: contactName },
        meetingLink,
      );
    }

    return {
      ...fallback,
      meetingLink,
    };
  }
};

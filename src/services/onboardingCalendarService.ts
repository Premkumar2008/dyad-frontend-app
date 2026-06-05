/**
 * Onboarding schedule — Google Calendar availability & booking.
 *
 * Backend endpoints (connect to your Gmail / Google Calendar):
 *   GET  /calendar/available-dates
 *   GET  /calendar/available-slots?date=YYYY-MM-DD
 *   POST /create-event  (existing — creates event on connected calendar)
 *
 * Required server-side setup (your side):
 *   - Google Cloud project with Calendar API enabled
 *   - Service account OR OAuth credentials with access to your Gmail calendar
 *   - GOOGLE_CALENDAR_ID env var (your Gmail address or calendar ID)
 */

import api from './api';
import { CalendarService } from './calendarService';
import { formatDateTimeForAPI } from '../utils/dateTimeUtils';
import { extractMeetingLinkFromResponse } from '../utils/calendarMeetLink';

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
}

const DEFAULT_MEET_LINK = (import.meta.env.VITE_ONBOARDING_MEET_LINK as string | undefined)?.trim() || '';

export type ScheduleBookingResult = {
  success: boolean;
  message: string;
  eventId?: string;
  meetingLink?: string;
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
  const lines = [
    'Dyad Client Onboarding — Introduction Call',
    '',
    `Name: ${contactName}`,
    payload.titleRole ? `Title / Role: ${payload.titleRole}` : '',
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Organization: ${payload.organization}`,
    payload.primarySpecialty ? `Primary Specialty: ${payload.primarySpecialty}` : '',
    payload.npi ? `NPI: ${payload.npi}` : '',
    payload.practiceType ? `Practice Type: ${payload.practiceType}` : '',
    payload.organizationType ? `Organization Type: ${payload.organizationType}` : '',
    payload.billableProviders ? `Billable Providers: ${payload.billableProviders}` : '',
    payload.locationsFacilities ? `Locations / Facilities: ${payload.locationsFacilities}` : '',
    payload.selectedStates?.length
      ? `States of Operation: ${payload.selectedStates.join(', ')}`
      : '',
    payload.engagementTimelineLabel || payload.engagementTimeline
      ? `Engagement Timeline: ${payload.engagementTimelineLabel || payload.engagementTimeline}`
      : '',
    '',
    `Scheduled: ${payload.date} at ${payload.time} PT`,
    '',
    link
      ? `Meeting link: ${link}`
      : 'A Google Meet link will be included in your calendar invite.',
  ];
  return lines.filter(line => line !== '').join('\n');
};

export const buildOnboardingCreateEventBody = (
  payload: ScheduleBookingPayload,
  meetingLink?: string,
) => {
  const contactName = resolveScheduleContactName(payload);
  const title = buildOnboardingEventTitle(contactName);
  const linkForDescription = meetingLink || DEFAULT_MEET_LINK;
  const description = buildOnboardingEventDescription(
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
    dateTime: formatDateTimeForAPI(payload.date, payload.time),
    summary: title,
    title,
    eventTitle: title,
    calendarSummary: title,
    subject: title,
    useCustomTitle: true,
    useSummaryAsTitle: true,
    description,
    durationMinutes: 30,
    timezone: 'America/Los_Angeles',
    source: 'client-onboarding',
    eventType: 'onboarding',
    addGoogleMeet: true,
    createGoogleMeet: true,
    createConference: true,
    conferenceType: 'hangoutsMeet',
    sendUpdates: 'all',
    inviteAttendee: true,
    guestEmail: attendeeEmail,
    attendees: [{ email: attendeeEmail, displayName: contactName }],
    ...(linkForDescription ? { meetingLink: linkForDescription } : {}),
  };
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

/** 30-minute slots 9:00 AM – 4:30 PM PT (fallback when API unavailable) */
export const getFallbackTimeSlots = (date: string): string[] => {
  const slots: string[] = [];
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
      slots.push(time);
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

export const fetchAvailableTimeSlots = async (date: string): Promise<string[]> => {
  try {
    const res = await api.get<{ slots: string[] }>('/calendar/available-slots', { params: { date } });
    if (Array.isArray(res.data?.slots) && res.data.slots.length > 0) {
      return res.data.slots;
    }
  } catch {
    /* use fallback */
  }
  return getFallbackTimeSlots(date);
};

export const bookIntroductionCall = async (
  payload: ScheduleBookingPayload,
): Promise<ScheduleBookingResult> => {
  const contactName = resolveScheduleContactName(payload);
  const eventBody = buildOnboardingCreateEventBody({ ...payload, name: contactName });

  try {
    const response = await api.post<Record<string, unknown>>('/create-event', eventBody);
    const data = response.data ?? {};
    const meetingLink =
      extractMeetingLinkFromResponse(data) || DEFAULT_MEET_LINK || undefined;

    return {
      success: (data.success as boolean | undefined) ?? true,
      message: (data.message as string) || 'Introduction call scheduled',
      eventId: data.eventId as string | undefined,
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
      time: payload.time,
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
    return {
      ...fallback,
      meetingLink: fallback.meetingLink || DEFAULT_MEET_LINK || undefined,
    };
  }
};

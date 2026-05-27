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

import api, { handleApiError } from './api';
import { CalendarService } from './calendarService';
import { formatDateTimeForAPI } from '../utils/dateTimeUtils';

export interface ScheduleBookingPayload {
  name: string;
  email: string;
  phone: string;
  organization: string;
  date: string;
  time: string;
  engagementTimeline?: string;
}

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
): Promise<{ success: boolean; message: string; eventId?: string }> => {
  try {
    const dateTime = formatDateTimeForAPI(payload.date, payload.time);
    const response = await api.post<{ success: boolean; message: string; eventId?: string }>(
      '/create-event',
      {
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone.trim(),
        organization: payload.organization.trim(),
        date: payload.date,
        time: payload.time,
        dateTime,
        summary: 'Dyad Introduction Call — Enrollment',
        description: [
          `Contact: ${payload.name}`,
          `Email: ${payload.email}`,
          `Phone: ${payload.phone}`,
          `Organization: ${payload.organization}`,
          payload.engagementTimeline ? `Engagement timeline: ${payload.engagementTimeline}` : '',
        ].filter(Boolean).join('\n'),
        durationMinutes: 30,
        timezone: 'America/Los_Angeles',
      },
    );
    return {
      success: response.data.success ?? true,
      message: response.data.message || 'Introduction call scheduled',
      eventId: response.data.eventId,
    };
  } catch (error) {
    const validation = CalendarService.validateData({
      name: payload.name,
      date: payload.date,
      time: payload.time,
    });
    if (!validation.isValid) {
      return { success: false, message: (Object.values(validation.errors) as string[])[0] || 'Invalid schedule' };
    }
    return CalendarService.createEvent({
      name: payload.name,
      date: payload.date,
      time: payload.time,
    });
  }
};

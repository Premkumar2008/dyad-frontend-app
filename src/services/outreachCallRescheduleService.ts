import axios from 'axios';
import {
  getTimeZoneShortLabel,
  updateIntroductionCall,
  type ScheduleBookingPayload,
} from './onboardingCalendarService';
import { parseAdminScheduledCallRecordId } from './adminScheduledCallsService';
import { sendOutreachScheduleEmail } from './outreachScheduleEmailService';
import { formatCalendarCompactTime } from './outreachScheduleService';
import {
  formatLongDate,
  toDateKey,
  type CallType,
  type OutreachCall,
  type OutreachEventSource,
} from '../components/admin/outreachScheduleData';
import { formatDateForDisplay, formatTimeForDisplay } from '../utils/dateTimeUtils';
import { normalizeMeetLink } from '../utils/calendarMeetLink';

const INTRO_CALL_DURATION_MIN = 30;

export interface RescheduleOutreachCallInput {
  call: OutreachCall;
  source: OutreachEventSource;
  newDate: string;
  newTimeSlot: string;
  newTimeZone: string;
  previousDateKey: string;
  previousTimeLabel: string;
  subject?: string;
  messageBody?: string;
}

export interface RescheduleOutreachCallPayload {
  source: OutreachEventSource;
  scheduledCallId?: number;
  onboardingId?: string;
  callEventId?: string | null;
  to: string;
  contactName: string;
  eventTitle: string;
  callType: CallType;
  previousDateTime?: string;
  previousDateDisplay: string;
  previousTimeDisplay: string;
  date: string;
  time: string;
  dateTime: string;
  timeZone: string;
  meetingLink?: string;
  subject: string;
  messageBody: string;
  dateDisplay: string;
  timeDisplay: string;
}

export interface RescheduleOutreachCallResponse {
  success: boolean;
  message?: string;
  dateTime?: string;
  meetingLink?: string;
  callEventId?: string | null;
}

export interface RescheduleOutreachCallResult {
  dateKey: string;
  compactTime: string;
  startTime: string;
  endTime: string;
  timezone: string;
  meetingUrl: string;
  dateTimeIso: string;
}

const addMinutesToSchedule = (
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

const resolveDateTimeIso = (dateKey: string, timeSlot: string): string => {
  if (timeSlot.includes('T')) return timeSlot;
  return `${dateKey}T${timeSlot.length === 5 ? `${timeSlot}:00` : timeSlot}`;
};

export const buildDefaultRescheduleSubject = (eventTitle: string): string =>
  `Your Dyad call has been rescheduled – ${eventTitle.trim() || 'Introduction Call'}`;

export const buildDefaultRescheduleMessage = (input: {
  contactName: string;
  eventTitle: string;
  previousDateDisplay: string;
  previousTimeDisplay: string;
  newDateDisplay: string;
  newTimeDisplay: string;
  timezone: string;
  meetingUrl?: string;
}): string => {
  const greetingName = input.contactName.trim() || 'there';
  const meetBlock = input.meetingUrl?.trim()
    ? `\nJoin Google Meet: ${input.meetingUrl.trim()}\n`
    : '\nYour updated Google Meet link is included in the calendar invite.\n';

  return `Hi ${greetingName},

Your Dyad call has been rescheduled.

Previous schedule:
${input.previousDateDisplay} · ${input.previousTimeDisplay}

New schedule:
${input.newDateDisplay} · ${input.newTimeDisplay} (${input.timezone})
${meetBlock}
If you have any questions, reply to this email and our team will assist you.

Thank you,
Dyad Practice Solutions`;
};

const persistRescheduleOnBackend = async (
  token: string,
  payload: RescheduleOutreachCallPayload,
): Promise<RescheduleOutreachCallResponse> => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';

  try {
    const res = await axios.post<RescheduleOutreachCallResponse>(
      `${apiUrl}/calls-scheduled-admin/reschedule`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to reschedule call');
    }

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = (error.response?.data as { message?: string } | undefined)?.message;
      throw new Error(message || 'Failed to reschedule call');
    }
    throw error;
  }
};

export const rescheduleOutreachCall = async (
  token: string,
  input: RescheduleOutreachCallInput,
): Promise<RescheduleOutreachCallResult> => {
  const email = input.call.contactEmail?.trim();
  if (!email) {
    throw new Error('No contact email on file for this call.');
  }
  if (!input.newDate || !input.newTimeSlot) {
    throw new Error('Please select a new date and time slot.');
  }

  const source: OutreachEventSource = input.source === 'admin' ? 'admin' : 'onboarding';
  const scheduledCallId = input.call.adminScheduledCallId
    ?? (source === 'admin' ? parseAdminScheduledCallRecordId(input.call.id) : null);
  const onboardingId = input.call.onboardingId
    ?? (source === 'onboarding' ? input.call.id : undefined);

  if (source === 'admin' && scheduledCallId == null) {
    throw new Error('Could not resolve admin scheduled call id.');
  }
  if (source === 'onboarding' && !onboardingId) {
    throw new Error('Could not resolve onboarding id for this call.');
  }

  const dateTimeIso = resolveDateTimeIso(input.newDate, input.newTimeSlot);
  const parsed = new Date(dateTimeIso);
  const dateKey = Number.isNaN(parsed.getTime())
    ? input.newDate
    : toDateKey(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());

  const timeDisplay = formatTimeForDisplay(input.newTimeSlot, input.newTimeZone || undefined);
  const startTime = timeDisplay;
  const endTime = addMinutesToSchedule(
    dateKey,
    input.newTimeSlot,
    INTRO_CALL_DURATION_MIN,
    input.newTimeZone || undefined,
  );
  const timezone = getTimeZoneShortLabel(input.newTimeZone);
  const dateDisplay = formatDateForDisplay(dateKey);
  const previousDateDisplay = formatLongDate(input.previousDateKey);
  const previousTimeDisplay = input.previousTimeLabel;
  const eventTitle = input.call.eventTitle?.trim() || input.call.client;
  const meetingUrlInitial = normalizeMeetLink(input.call.meetingUrl) || input.call.meetingUrl || '';

  let meetingUrl = meetingUrlInitial;
  const callEventId = input.call.callEventId?.trim() || '';

  if (callEventId) {
    const bookingPayload: ScheduleBookingPayload = {
      name: input.call.contact,
      email,
      phone: 'N/A',
      organization: input.call.client,
      date: dateKey,
      time: input.newTimeSlot.includes('T') ? timeDisplay : input.newTimeSlot,
      slotStart: input.newTimeSlot.includes('T') ? input.newTimeSlot : undefined,
      timeZone: input.newTimeZone,
      customEventTitle: eventTitle,
      customEventDescription: `Rescheduled Dyad outreach call with ${input.call.contact}.`,
      source,
      eventSource: source === 'admin' ? 'admin-outreach' : 'client-onboarding',
      callType: input.call.type,
    };

    const calendarResult = await updateIntroductionCall(bookingPayload, {
      eventId: callEventId,
      calendarId: undefined,
      meetingLink: meetingUrlInitial || undefined,
    });

    if (!calendarResult.success) {
      throw new Error(calendarResult.message || 'Could not update the call on Google Calendar.');
    }

    meetingUrl = normalizeMeetLink(calendarResult.meetingLink) || calendarResult.meetingLink || meetingUrl;
  }

  const subject = input.subject?.trim() || buildDefaultRescheduleSubject(eventTitle);
  const messageBody = input.messageBody?.trim() || buildDefaultRescheduleMessage({
    contactName: input.call.contact,
    eventTitle,
    previousDateDisplay,
    previousTimeDisplay,
    newDateDisplay: dateDisplay,
    newTimeDisplay: `${startTime} – ${endTime}`,
    timezone,
    meetingUrl,
  });

  const apiPayload: RescheduleOutreachCallPayload = {
    source,
    scheduledCallId: scheduledCallId ?? undefined,
    onboardingId,
    callEventId: callEventId || null,
    to: email,
    contactName: input.call.contact,
    eventTitle,
    callType: input.call.type,
    previousDateTime: input.call.dateTimeIso,
    previousDateDisplay,
    previousTimeDisplay,
    date: dateKey,
    time: input.newTimeSlot.includes('T') ? timeDisplay : input.newTimeSlot,
    dateTime: dateTimeIso,
    timeZone: input.newTimeZone,
    meetingLink: meetingUrl || undefined,
    subject,
    messageBody,
    dateDisplay,
    timeDisplay: `${startTime} – ${endTime} ${timezone}`,
  };

  try {
    await persistRescheduleOnBackend(token, apiPayload);
  } catch (err) {
    if (axios.isAxiosError(err) && (err.response?.status === 404 || !err.response)) {
      console.warn('Reschedule persistence API unavailable; calendar/email update will still be attempted.');
    } else {
      throw err;
    }
  }

  const emailResult = await sendOutreachScheduleEmail({
    to: email,
    contactName: input.call.contact,
    subject,
    messageBody,
    eventTitle,
    dateDisplay,
    timeDisplay: `${startTime} – ${endTime}`,
    timezone,
    meetingLink: meetingUrl,
    source,
    action: 'reschedule',
  });

  if (!emailResult.success) {
    throw new Error(emailResult.error || 'Call updated, but the reschedule email could not be sent.');
  }

  return {
    dateKey,
    compactTime: formatCalendarCompactTime(input.newTimeSlot, input.newTimeZone || undefined),
    startTime,
    endTime,
    timezone,
    meetingUrl,
    dateTimeIso,
  };
};

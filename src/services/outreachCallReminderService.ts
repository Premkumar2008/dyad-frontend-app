import axios from 'axios';
import type { CallType, OutreachEventSource } from '../components/admin/outreachScheduleData';
import { formatLongDate } from '../components/admin/outreachScheduleData';

export interface SendOutreachCallReminderPayload {
  source: OutreachEventSource;
  scheduledCallId?: number;
  onboardingId?: string;
  callEventId?: string | null;
  to: string;
  contactName: string;
  subject: string;
  messageBody: string;
  eventTitle: string;
  dateTime: string;
  meetingLink?: string;
  callType: CallType;
  reminderNumber: number;
}

export interface SendOutreachCallReminderResponse {
  success: boolean;
  message?: string;
  reminderCount?: number;
}

export interface OutreachReminderTemplateInput {
  contactName: string;
  clientLabel: string;
  eventTitle?: string;
  dateKey: string;
  startTime: string;
  endTime: string;
  timezone: string;
  meetingUrl?: string;
  reminderNumber: number;
}

export const buildDefaultReminderSubject = (
  input: Pick<OutreachReminderTemplateInput, 'eventTitle' | 'clientLabel' | 'reminderNumber'>,
): string => {
  const title = input.eventTitle?.trim() || input.clientLabel.trim() || 'Dyad call';
  return `Reminder #${input.reminderNumber}: ${title}`;
};

export const buildDefaultReminderMessage = (input: OutreachReminderTemplateInput): string => {
  const greetingName = input.contactName.trim() || 'there';
  const title = input.eventTitle?.trim() || input.clientLabel.trim() || 'your Dyad call';
  const dateLabel = formatLongDate(input.dateKey);
  const timeLabel = `${input.startTime} – ${input.endTime} ${input.timezone}`.trim();
  const meetBlock = input.meetingUrl?.trim()
    ? `\nJoin Google Meet: ${input.meetingUrl.trim()}\n`
    : '\nYour Google Meet link is included in the original calendar invite.\n';

  return `Hi ${greetingName},

This is reminder #${input.reminderNumber} for your scheduled Dyad call.

Meeting: ${title}
Date: ${dateLabel}
Time: ${timeLabel}
${meetBlock}
If you need to reschedule, please reply to this email and our team will assist you.

Thank you,
Dyad Practice Solutions`;
};

export const sendOutreachCallReminder = async (
  token: string,
  payload: SendOutreachCallReminderPayload,
): Promise<SendOutreachCallReminderResponse> => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';

  try {
    const res = await axios.post<SendOutreachCallReminderResponse>(
      `${apiUrl}/calls-scheduled-admin/reminder`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to send reminder');
    }

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = (error.response?.data as { message?: string } | undefined)?.message;
      throw new Error(message || 'Failed to send reminder');
    }
    throw error;
  }
};

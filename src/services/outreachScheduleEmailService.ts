import api from './api';
import type { EmailTemplate } from './emailService';
import { ONBOARDING_CALENDAR_EMAIL } from './onboardingScheduleEmailService';

export interface OutreachScheduleEmailDetails {
  to: string;
  contactName: string;
  subject: string;
  messageBody: string;
  eventTitle: string;
  dateDisplay: string;
  timeDisplay: string;
  timezone?: string;
  meetingLink?: string;
  /** `admin` or `onboarding` — included on reschedule/schedule API payloads. */
  source?: 'admin' | 'onboarding';
  action?: 'schedule' | 'reschedule';
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const messageBodyToHtml = (body: string): string =>
  escapeHtml(body.trim()).replace(/\n/g, '<br/>');

export const buildOutreachScheduleEmail = (
  details: OutreachScheduleEmailDetails,
  logoUrl: string,
  baseUrl: string,
): EmailTemplate => {
  const tz = details.timezone?.trim() || 'Pacific Time (PT)';
  const meetLink = details.meetingLink?.trim() || '';
  const calendarEmail = ONBOARDING_CALENDAR_EMAIL;
  const greetingName = details.contactName.trim() || 'there';

  const meetingHtml = meetLink
    ? `
      <div style="margin:24px 0 0;padding:22px 20px;background:#eef6fb;border:1px solid #c5d4ea;border-radius:8px;text-align:center;">
        <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#0a2d6e;letter-spacing:0.02em;">GOOGLE MEET</p>
        <a href="${escapeHtml(meetLink)}" style="display:inline-block;padding:12px 28px;background:#0a2d6e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:7px;">Join Google Meet</a>
        <p style="margin:14px 0 0;font-size:13px;color:#546e7a;word-break:break-all;">
          <a href="${escapeHtml(meetLink)}" style="color:#0a2d6e;font-weight:600;">${escapeHtml(meetLink)}</a>
        </p>
        <p style="margin:12px 0 0;font-size:13px;color:#546e7a;">
          Calendar invite from <strong>${escapeHtml(calendarEmail)}</strong>
        </p>
      </div>`
    : `
      <div style="margin:24px 0 0;padding:22px 20px;background:#eef6fb;border:1px solid #c5d4ea;border-radius:8px;text-align:center;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0a2d6e;">Google Calendar Invite</p>
        <p style="margin:0;font-size:14px;color:#444;">
          Your Google Meet link is in the calendar invite from
          <strong>${escapeHtml(calendarEmail)}</strong>.
        </p>
      </div>`;

  const subject = details.subject.trim() || details.eventTitle.trim() || 'Your Dyad call is scheduled';

  const textLines = [
    `Dear ${greetingName},`,
    '',
    details.messageBody.trim(),
    '',
    'MEETING DETAILS',
    `Title: ${details.eventTitle.trim() || subject}`,
    `Date: ${details.dateDisplay}`,
    `Time: ${details.timeDisplay} (${tz})`,
    '',
    meetLink
      ? `Join Google Meet: ${meetLink}`
      : `Your Google Meet link is in the calendar invite from ${calendarEmail}.`,
    '',
    'Dyad Practice Solutions',
    baseUrl,
  ].filter(Boolean);

  return {
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(subject)}</title>
      </head>
      <body style="font-family:Arial,sans-serif;line-height:1.7;color:#333;margin:0;padding:0;background:#f4f4f4;">
        <div style="background:#f4f4f4;padding:30px 0;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <div style="padding:24px 32px;border-bottom:2px solid #0a2d6e;">
              <img src="${escapeHtml(logoUrl)}" alt="Dyad Practice Solutions" style="height:72px;width:auto;" />
            </div>
            <div style="padding:32px 32px 24px;">
              <p style="margin:0 0 16px;font-size:15px;color:#444;">Dear ${escapeHtml(greetingName)},</p>
              <div style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.7;">
                ${messageBodyToHtml(details.messageBody)}
              </div>
              <table style="width:100%;border-collapse:collapse;margin:8px 0 0;font-size:14px;background:#fafbfd;border:1px solid #e8ecf2;border-radius:8px;overflow:hidden;">
                <tbody>
                  <tr>
                    <td style="padding:10px 14px;border-bottom:1px solid #e8ecf2;font-weight:600;color:#0a2d6e;width:38%;">Title</td>
                    <td style="padding:10px 14px;border-bottom:1px solid #e8ecf2;color:#444;">${escapeHtml(details.eventTitle.trim() || subject)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 14px;border-bottom:1px solid #e8ecf2;font-weight:600;color:#0a2d6e;">Date</td>
                    <td style="padding:10px 14px;border-bottom:1px solid #e8ecf2;color:#444;">${escapeHtml(details.dateDisplay)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 14px;font-weight:600;color:#0a2d6e;">Time</td>
                    <td style="padding:10px 14px;color:#444;">${escapeHtml(details.timeDisplay)} (${escapeHtml(tz)})</td>
                  </tr>
                </tbody>
              </table>
              ${meetingHtml}
              <p style="margin:24px 0 0;font-size:15px;color:#444;">Regards,<br/><strong style="color:#0a2d6e;">The Dyad Team</strong><br/>Dyad Practice Solutions</p>
            </div>
            <div style="background:#f9f9f9;border-top:1px solid #e8e8e8;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;">Dyad Practice Solutions, LLC &middot; <a href="${escapeHtml(baseUrl)}" style="color:#0a2d6e;">dyadmd.com</a></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: textLines.join('\n'),
  };
};

export const sendOutreachScheduleEmail = async (
  details: OutreachScheduleEmailDetails,
): Promise<{ success: boolean; error?: string }> => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dyadmd.com';
  const logoUrl = `${baseUrl}/assets/images/logo_main.png`;
  const meetingLink = details.meetingLink?.trim() || '';
  const template = buildOutreachScheduleEmail({ ...details, meetingLink }, logoUrl, baseUrl);

  try {
    const response = await api.post<{ success?: boolean; message?: string }>(
      '/send-onboarding-schedule-confirmation',
      {
        to: details.to,
        contactName: details.contactName,
        subject: template.subject,
        html: template.html,
        text: template.text,
        htmlBody: template.html,
        bodyHtml: template.html,
        useProvidedHtml: true,
        useClientHtml: true,
        meetingLink,
        meetLink: meetingLink,
        googleMeetLink: meetingLink,
        joinUrl: meetingLink,
        joinMeetingLabel: 'Join Google Meet',
        dateDisplay: details.dateDisplay,
        timeDisplay: details.timeDisplay,
        timezone: details.timezone || '',
        email: details.to,
        calendarEmail: ONBOARDING_CALENDAR_EMAIL,
        eventTitle: details.eventTitle,
        messageBody: details.messageBody,
        source: details.source ?? 'admin-outreach-schedule',
        action: details.action,
      },
    );

    if (response.data?.success !== false) {
      return { success: true };
    }
    return {
      success: false,
      error: response.data?.message || 'Failed to send schedule email',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send schedule email',
    };
  }
};

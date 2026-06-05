/**
 * Confirmation email after onboarding intro call is scheduled on Google Calendar.
 */

import api from './api';
import { createEmailService, type EmailTemplate } from './emailService';

export const ONBOARDING_SCHEDULE_EMAIL_SUBJECT =
  'You have scheduled Meeting with Dyad Practice Solutions';

export interface OnboardingScheduleEmailDetails {
  to: string;
  contactName: string;
  dateDisplay: string;
  timeDisplay: string;
  timezone?: string;
  email: string;
  phone: string;
  organization: string;
  titleRole?: string;
  primarySpecialty?: string;
  organizationType?: string;
  billableProviders?: string;
  locationsFacilities?: string;
  states?: string[];
  engagementTimeline?: string;
  npi?: string;
  practiceType?: string;
  meetingLink?: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const detailRow = (label: string, value?: string): string => {
  const trimmed = value?.trim();
  if (!trimmed) return '';
  return `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #e8ecf2;font-weight:600;color:#0a2d6e;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e8ecf2;color:#444;vertical-align:top;">${escapeHtml(trimmed)}</td>
    </tr>`;
};

export const buildOnboardingScheduleConfirmationEmail = (
  details: OnboardingScheduleEmailDetails,
  logoUrl: string,
  baseUrl: string,
): EmailTemplate => {
  const tz = details.timezone?.trim() || 'Pacific Time (PT)';
  const states = details.states?.filter(Boolean).join(', ');
  const meetingHtml = details.meetingLink?.trim()
    ? `<p style="margin:16px 0 0;font-size:15px;color:#444;"><strong>Join your call:</strong> <a href="${escapeHtml(details.meetingLink.trim())}" style="color:#0a2d6e;font-weight:600;">${escapeHtml(details.meetingLink.trim())}</a></p>`
    : '<p style="margin:16px 0 0;font-size:15px;color:#444;">Your Google Meet link is included in your calendar invite.</p>';

  const tableRows = [
    detailRow('Date', details.dateDisplay),
    detailRow('Time', `${details.timeDisplay} (${tz})`),
    detailRow('Name', details.contactName),
    detailRow('Title / Role', details.titleRole),
    detailRow('Email', details.email),
    detailRow('Phone', details.phone),
    detailRow('Organization', details.organization),
    detailRow('Primary Specialty', details.primarySpecialty),
    detailRow('NPI', details.npi),
    detailRow('Practice Type', details.practiceType),
    detailRow('Organization Type', details.organizationType),
    detailRow('Billable Providers', details.billableProviders),
    detailRow('Locations / Facilities', details.locationsFacilities),
    detailRow('States of Operation', states),
    detailRow('Engagement Timeline', details.engagementTimeline),
  ].join('');

  const textLines = [
    `Dear ${details.contactName},`,
    '',
    'Thank you for scheduling your introduction call with Dyad Practice Solutions.',
    '',
    'MEETING DETAILS',
    `Date: ${details.dateDisplay}`,
    `Time: ${details.timeDisplay} (${tz})`,
    `Name: ${details.contactName}`,
    details.titleRole ? `Title / Role: ${details.titleRole}` : '',
    `Email: ${details.email}`,
    `Phone: ${details.phone}`,
    `Organization: ${details.organization}`,
    details.primarySpecialty ? `Primary Specialty: ${details.primarySpecialty}` : '',
    details.npi ? `NPI: ${details.npi}` : '',
    details.practiceType ? `Practice Type: ${details.practiceType}` : '',
    details.organizationType ? `Organization Type: ${details.organizationType}` : '',
    details.billableProviders ? `Billable Providers: ${details.billableProviders}` : '',
    details.locationsFacilities ? `Locations / Facilities: ${details.locationsFacilities}` : '',
    states ? `States of Operation: ${states}` : '',
    details.engagementTimeline ? `Engagement Timeline: ${details.engagementTimeline}` : '',
    '',
    details.meetingLink?.trim()
      ? `Meeting link: ${details.meetingLink.trim()}`
      : 'Your Google Meet link is included in your calendar invite.',
    '',
    'We look forward to speaking with you.',
    '',
    'Dyad Practice Solutions',
    `${baseUrl}`,
  ].filter(Boolean);

  return {
    subject: ONBOARDING_SCHEDULE_EMAIL_SUBJECT,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(ONBOARDING_SCHEDULE_EMAIL_SUBJECT)}</title>
      </head>
      <body style="font-family:Arial,sans-serif;line-height:1.7;color:#333;margin:0;padding:0;background:#f4f4f4;">
        <div style="background:#f4f4f4;padding:30px 0;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <div style="padding:24px 32px;border-bottom:2px solid #0a2d6e;">
              <img src="${escapeHtml(logoUrl)}" alt="Dyad Practice Solutions" style="height:72px;width:auto;" />
            </div>
            <div style="padding:32px 32px 24px;">
              <p style="margin:0 0 16px;font-size:15px;color:#444;">Dear ${escapeHtml(details.contactName)},</p>
              <p style="margin:0 0 16px;font-size:15px;color:#444;">Thank you for scheduling your introduction call with <strong>Dyad Practice Solutions</strong>. Below are your confirmed meeting details.</p>
              <table style="width:100%;border-collapse:collapse;margin:20px 0 0;font-size:14px;background:#fafbfd;border:1px solid #e8ecf2;border-radius:8px;overflow:hidden;">
                <tbody>${tableRows}</tbody>
              </table>
              ${meetingHtml}
              <p style="margin:24px 0 0;font-size:15px;color:#444;">A calendar invite has also been sent to <strong>${escapeHtml(details.email)}</strong>. Please add this meeting to your calendar.</p>
              <p style="margin:16px 0 0;font-size:15px;color:#444;">We look forward to speaking with you.</p>
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

export const sendOnboardingScheduleConfirmationEmail = async (
  details: OnboardingScheduleEmailDetails,
): Promise<{ success: boolean; error?: string }> => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dyadmd.com';
  const logoUrl = `${baseUrl}/assets/images/logo_main.png`;
  const template = buildOnboardingScheduleConfirmationEmail(details, logoUrl, baseUrl);

  try {
    const response = await api.post<{ success?: boolean; message?: string }>(
      '/send-onboarding-schedule-confirmation',
      {
        to: details.to,
        contactName: details.contactName,
        subject: template.subject,
        html: template.html,
        text: template.text,
      },
    );
    if (response.data?.success !== false) {
      return { success: true };
    }
  } catch {
    /* fall through to configured email provider */
  }

  try {
    const emailService = createEmailService();
    return await emailService.sendCustomEmail(details.to, template);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send confirmation email',
    };
  }
};

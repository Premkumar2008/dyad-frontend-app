/**

 * Confirmation email after onboarding intro call is scheduled on Google Calendar.

 */



import api from './api';

import type { EmailTemplate } from './emailService';



export const ONBOARDING_SCHEDULE_EMAIL_SUBJECT =

  'You have scheduled Meeting with Dyad Practice Solutions';



export const ONBOARDING_CALENDAR_EMAIL = 'dyadcontactrequest@gmail.com';



export interface OnboardingScheduleEmailDetails {

  to: string;

  contactName: string;

  dateDisplay: string;

  timeDisplay: string;

  timezone?: string;

  email: string;

  phone: string;

  titleRole?: string;

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

  const meetLink = details.meetingLink?.trim() || '';

  const calendarEmail = ONBOARDING_CALENDAR_EMAIL;



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



  const tableRows = [

    detailRow('Date', details.dateDisplay),

    detailRow('Time', `${details.timeDisplay} (${tz})`),

    detailRow('Name', details.contactName),

    detailRow('Title / Role', details.titleRole),

    detailRow('Email', details.email),

    detailRow('Phone', details.phone),

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

    '',

    meetLink

      ? `Join Google Meet: ${meetLink}`

      : `Your Google Meet link is in the calendar invite from ${calendarEmail}.`,

    meetLink ? `Calendar invite from: ${calendarEmail}` : '',

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



/** Send via backend only - does not call /send-email/sendgrid or other client providers. */

export const sendOnboardingScheduleConfirmationEmail = async (

  details: OnboardingScheduleEmailDetails,

): Promise<{ success: boolean; error?: string }> => {

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dyadmd.com';

  const logoUrl = `${baseUrl}/assets/images/logo_main.png`;

  const meetingLink = details.meetingLink?.trim() || '';

  const template = buildOnboardingScheduleConfirmationEmail(

    { ...details, meetingLink },

    logoUrl,

    baseUrl,

  );



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

        email: details.email,

        phone: details.phone,

        titleRole: details.titleRole || '',

        calendarEmail: ONBOARDING_CALENDAR_EMAIL,

      },

    );

    if (response.data?.success !== false) {

      return { success: true };

    }

    return {

      success: false,

      error: response.data?.message || 'Failed to send confirmation email',

    };

  } catch (error) {

    return {

      success: false,

      error: error instanceof Error ? error.message : 'Failed to send confirmation email',

    };

  }

};



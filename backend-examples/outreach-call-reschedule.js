/**
 * Backend spec: Reschedule outreach / admin scheduled call
 *
 * POST /api/calls-scheduled-admin/reschedule
 * Authorization: Bearer <adminAccessToken>
 */

const rescheduleRequestExample = {
  source: 'admin', // required: 'admin' | 'onboarding'
  scheduledCallId: 2, // required when source === 'admin'
  onboardingId: 'ONB-12345', // required when source === 'onboarding'
  callEventId: 'google-calendar-event-id-or-null',
  to: 'premkumar.jaguar@gmail.com',
  contactName: 'Prem',
  eventTitle: 'Dyad Introduction Call',
  callType: 'onboarding',
  previousDateTime: '2026-07-01T04:00:00.000Z',
  previousDateDisplay: 'Tuesday, July 1, 2026',
  previousTimeDisplay: '9:30 AM – 10:00 AM IST',
  date: '2026-07-02',
  time: '10:00 AM',
  dateTime: '2026-07-02T04:30:00.000Z',
  timeZone: 'Asia/Kolkata',
  meetingLink: 'https://meet.google.com/rpw-cahs-wst',
  subject: 'Your Dyad call has been rescheduled – Dyad Introduction Call',
  messageBody: 'Hi Prem,\n\nYour Dyad call has been rescheduled.\n...',
  dateDisplay: 'Wednesday, July 2, 2026',
  timeDisplay: '10:00 AM – 10:30 AM IST',
};

const rescheduleSuccessExample = {
  success: true,
  message: 'Call rescheduled',
  dateTime: '2026-07-02T04:30:00.000Z',
  meetingLink: 'https://meet.google.com/rpw-cahs-wst',
  callEventId: 'google-calendar-event-id-or-null',
};

const rescheduleErrorExample = {
  success: false,
  message: 'Failed to reschedule call',
};

/**
 * Backend should:
 * 1. Update calls_scheduled_admin row (date_time, meeting_link, call_event_id) when source=admin
 * 2. Update onboarding step_2 schedule fields when source=onboarding
 * 3. Optionally update Google Calendar if not already updated by frontend
 * 4. Send reschedule email to `to` using subject + messageBody
 */

module.exports = {
  rescheduleRequestExample,
  rescheduleSuccessExample,
  rescheduleErrorExample,
};

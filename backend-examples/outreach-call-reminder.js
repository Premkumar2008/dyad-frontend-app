/**
 * Backend spec: Outreach call reminder (admin)
 *
 * POST /api/calls-scheduled-admin/reminder
 * Authorization: Bearer <adminAccessToken>
 */

// --- Request body ---
const reminderRequestExample = {
  source: 'admin', // 'admin' | 'onboarding'
  scheduledCallId: 2, // required when source === 'admin' (calls_scheduled_admin.id)
  onboardingId: 'ONB-12345', // required when source === 'onboarding'
  callEventId: 'google-calendar-event-id-or-null',
  to: 'premkumar.jaguar@gmail.com',
  contactName: 'Prem',
  subject: 'Reminder #1: Dyad Introduction Call',
  messageBody: 'Hi Prem,\n\nThis is reminder #1 for your scheduled Dyad call.\n...',
  eventTitle: 'Dyad Introduction Call',
  dateTime: '2026-07-02T04:00:00.000Z',
  meetingLink: 'https://meet.google.com/rpw-cahs-wst',
  callType: 'onboarding', // discovery | demo | followup | onboarding
  reminderNumber: 1, // 1 for first reminder, 2 for second, etc.
};

// --- Success response ---
const reminderSuccessExample = {
  success: true,
  message: 'Reminder sent',
  reminderCount: 1, // updated total stored in DB after send
};

// --- Error response ---
const reminderErrorExample = {
  success: false,
  message: 'Failed to send reminder',
};

/**
 * GET /api/calls-scheduled-admin — add column to each row:
 *   reminderCount: number  (default 0)
 *
 * Suggested table: calls_scheduled_admin
 *   id, email, contact_name, event_title, email_subject, call_type,
 *   mail_description, date_time, meeting_id, meeting_link, call_event_id,
 *   reminder_count (INT DEFAULT 0), created_at, updated_at
 *
 * Backend should:
 * 1. Validate reminderNumber === current reminder_count + 1 (optional but recommended)
 * 2. Send email to `to` with subject + messageBody (HTML optional)
 * 3. Increment reminder_count on the matching row
 * 4. Return success + new reminderCount
 *
 * For source === 'onboarding', update reminder_count on onboarding record
 * (or a related outreach_reminders table keyed by onboarding_id).
 */

module.exports = {
  reminderRequestExample,
  reminderSuccessExample,
  reminderErrorExample,
};

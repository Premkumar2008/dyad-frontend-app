import React, { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { ScheduleCalendarPicker } from '../onboarding/ScheduleCalendarPicker';
import {
  bookIntroductionCall,
  getTimeZoneShortLabel,
  type ScheduleTimeSlot,
} from '../../services/onboardingCalendarService';
import { sendOutreachScheduleEmail } from '../../services/outreachScheduleEmailService';
import { formatDateForDisplay, formatTimeForDisplay } from '../../utils/dateTimeUtils';
import { CALL_TYPE_LABELS, type CallType } from './outreachScheduleData';
import '../../pages/DyadOnboarding.css';

const CALL_TYPE_OPTIONS = (Object.entries(CALL_TYPE_LABELS) as [CallType, string][]).map(
  ([id, label]) => ({ id, label }),
);

const DEFAULT_EVENT_TITLE = 'Dyad Introduction Call';
const DEFAULT_EMAIL_SUBJECT = 'Your Dyad introduction call is scheduled';
const DEFAULT_MESSAGE = `Thank you for scheduling time with Dyad Practice Solutions.

We look forward to discussing your practice and how Dyad can support your revenue cycle goals. Please use the Google Meet link below to join at your scheduled time.

If you need to reschedule, reply to this email and our team will assist you.`;

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export interface AdminScheduleCallModalProps {
  open: boolean;
  onClose: () => void;
  onScheduled?: () => void;
}

export const AdminScheduleCallModal: React.FC<AdminScheduleCallModalProps> = ({
  open,
  onClose,
  onScheduled,
}) => {
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [emailSubject, setEmailSubject] = useState(DEFAULT_EMAIL_SUBJECT);
  const [eventTitle, setEventTitle] = useState(DEFAULT_EVENT_TITLE);
  const [messageBody, setMessageBody] = useState(DEFAULT_MESSAGE);
  const [callDate, setCallDate] = useState('');
  const [callTime, setCallTime] = useState('');
  const [callTimeZone, setCallTimeZone] = useState('America/Los_Angeles');
  const [callType, setCallType] = useState<CallType>('discovery');
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (!open) return;
    setContactEmail('');
    setContactName('');
    setEmailSubject(DEFAULT_EMAIL_SUBJECT);
    setEventTitle(DEFAULT_EVENT_TITLE);
    setMessageBody(DEFAULT_MESSAGE);
    setCallDate('');
    setCallTime('');
    setCallTimeZone('America/Los_Angeles');
    setCallType('discovery');
    setSending(false);
    setEmailError('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !sending) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, sending]);

  if (!open) return null;

  const scheduleComplete = !!(callDate && callTime);
  const formatScheduleTime = (time: string) =>
    formatTimeForDisplay(time, callTimeZone || undefined);

  const handleTimeSelect = (slot: ScheduleTimeSlot, timeZone: string) => {
    setCallTime(slot.id);
    setCallTimeZone(timeZone);
  };

  const handleSendEmail = async () => {
    const email = contactEmail.trim();
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      toast.error('Please enter a valid recipient email address.');
      return;
    }
    setEmailError('');

    if (!eventTitle.trim()) {
      toast.error('Please enter a calendar event title.');
      return;
    }
    if (!emailSubject.trim()) {
      toast.error('Please enter an email subject.');
      return;
    }
    if (!messageBody.trim()) {
      toast.error('Please enter a message description for the email.');
      return;
    }
    if (!scheduleComplete) {
      toast.error('Please select a date and time slot.');
      return;
    }

    const displayName = contactName.trim() || email.split('@')[0] || 'Guest';
    const timeDisplay = callTime.includes('T')
      ? formatScheduleTime(callTime)
      : formatScheduleTime(callTime);
    const dateDisplay = formatDateForDisplay(callDate);
    const tzShort = getTimeZoneShortLabel(callTimeZone);

    setSending(true);
    try {
      const bookingResult = await bookIntroductionCall({
        name: displayName,
        email,
        phone: 'N/A',
        organization: displayName,
        date: callDate,
        time: callTime.includes('T') ? timeDisplay : callTime,
        slotStart: callTime.includes('T') ? callTime : undefined,
        timeZone: callTimeZone,
        customEventTitle: eventTitle.trim(),
        customEventDescription: messageBody.trim(),
        eventSource: 'admin-outreach',
        callType,
      });

      if (!bookingResult.success) {
        toast.error(bookingResult.message || 'Could not create the calendar event.');
        return;
      }

      const meetingLink = bookingResult.meetingLink?.trim() || '';
      const emailResult = await sendOutreachScheduleEmail({
        to: email,
        contactName: displayName,
        subject: emailSubject.trim(),
        messageBody: messageBody.trim(),
        eventTitle: eventTitle.trim(),
        dateDisplay,
        timeDisplay,
        timezone: tzShort,
        meetingLink,
      });

      if (!emailResult.success) {
        toast.error(emailResult.error || 'Calendar event created, but the email could not be sent.');
        return;
      }

      toast.success(`Call scheduled and confirmation email sent to ${email}.`);
      onScheduled?.();
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="adm2-modal-backdrop ors-schedule-modal-backdrop">
      <button type="button" className="adm2-modal-backdrop-hit" aria-label="Close" onClick={onClose} disabled={sending} />
      <div
        className="adm2-modal adm2-modal--wide ors-schedule-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ors-schedule-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adm2-modal-header">
          <h2 id="ors-schedule-modal-title" className="adm2-modal-title">Schedule Call</h2>
          <button type="button" className="adm2-modal-close" onClick={onClose} disabled={sending} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="adm2-modal-body ors-schedule-modal-body">
          <p className="adm2-modal-desc">
            Enter the recipient details, customize the calendar event and email, then pick an available time slot.
          </p>

          <div className="adm2-modal-form-grid">
            <div className="adm2-modal-field">
              <label className="adm2-modal-label" htmlFor="ors-schedule-email">
                Recipient Email <span className="ob-req">*</span>
              </label>
              <input
                id="ors-schedule-email"
                type="email"
                className={`adm2-modal-input${emailError ? ' adm2-modal-input--error' : ''}`}
                value={contactEmail}
                onChange={(e) => {
                  setContactEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="contact@practice.com"
                disabled={sending}
              />
              {emailError && <p className="adm2-modal-error">{emailError}</p>}
            </div>

            <div className="adm2-modal-field">
              <label className="adm2-modal-label" htmlFor="ors-schedule-name">Contact Name</label>
              <input
                id="ors-schedule-name"
                type="text"
                className="adm2-modal-input"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Dr. Jane Smith"
                disabled={sending}
              />
            </div>

            <div className="adm2-modal-field">
              <label className="adm2-modal-label" htmlFor="ors-schedule-event-title">
                Calendar Event Title <span className="ob-req">*</span>
              </label>
              <input
                id="ors-schedule-event-title"
                type="text"
                className="adm2-modal-input"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                disabled={sending}
              />
            </div>

            <div className="adm2-modal-field">
              <label className="adm2-modal-label" htmlFor="ors-schedule-subject">
                Email Subject <span className="ob-req">*</span>
              </label>
              <input
                id="ors-schedule-subject"
                type="text"
                className="adm2-modal-input"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                disabled={sending}
              />
            </div>

            <div className="adm2-modal-field">
              <label className="adm2-modal-label" htmlFor="ors-schedule-call-type">
                Call Type
              </label>
              <select
                id="ors-schedule-call-type"
                className="adm2-modal-input ors-schedule-select"
                value={callType}
                onChange={(e) => setCallType(e.target.value as CallType)}
                disabled={sending}
              >
                {CALL_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <p className="ors-schedule-field-hint">
                Internal classification only not included in the confirmation email.
              </p>
            </div>
          </div>

          <div className="adm2-modal-field ors-schedule-message-field">
            <label className="adm2-modal-label" htmlFor="ors-schedule-message">
              Email Message / Description <span className="ob-req">*</span>
            </label>
            <textarea
              id="ors-schedule-message"
              className="adm2-modal-input adm2-modal-textarea"
              rows={5}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              disabled={sending}
            />
            <p className="ors-schedule-field-hint">
              This text appears in the confirmation email and is included in the Google Calendar event description.
            </p>
          </div>

          <div className="ors-schedule-picker-wrap">
            <h3 className="ors-schedule-section-title">Date &amp; Time</h3>
            <ScheduleCalendarPicker
              selectedDate={callDate}
              selectedTime={callTime}
              onDateSelect={(date) => {
                setCallDate(date);
                setCallTime('');
              }}
              onTimeSelect={handleTimeSelect}
              disabled={sending}
            />
          </div>
        </div>

        <div className="adm2-modal-footer">
          <button type="button" className="ors-btn ors-btn-secondary" onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button
            type="button"
            className="ors-btn ors-btn-primary"
            onClick={() => void handleSendEmail()}
            disabled={sending}
          >
            <Mail size={16} />
            {sending ? 'Sending…' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
};

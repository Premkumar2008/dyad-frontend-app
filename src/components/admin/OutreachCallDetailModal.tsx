import React, { useEffect, useState } from 'react';
import { CalendarClock, CalendarX2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ScheduleCalendarPicker } from '../onboarding/ScheduleCalendarPicker';
import {
  CALL_TYPE_LABELS,
  formatLongDate,
  type CalendarEvent,
  type OutreachCall,
} from './outreachScheduleData';
import {
  buildDefaultRescheduleMessage,
  buildDefaultRescheduleSubject,
  rescheduleOutreachCall,
} from '../../services/outreachCallRescheduleService';
import {
  getTimeZoneShortLabel,
  type ScheduleTimeSlot,
} from '../../services/onboardingCalendarService';
import { formatDateForDisplay, formatTimeForDisplay } from '../../utils/dateTimeUtils';
import { normalizeMeetLink } from '../../utils/calendarMeetLink';
import '../../pages/DyadOnboarding.css';

export interface CallDetailModalState {
  event: CalendarEvent;
  fullCall: OutreachCall | null;
}

interface OutreachCallDetailModalProps {
  detail: CallDetailModalState | null;
  onClose: () => void;
  onRescheduled?: () => void;
  onCancelMeeting?: (event: CalendarEvent, notifyAttendees: boolean) => void;
}

export const OutreachCallDetailModal: React.FC<OutreachCallDetailModalProps> = ({
  detail,
  onClose,
  onRescheduled,
  onCancelMeeting,
}) => {
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [notifyOnCancel, setNotifyOnCancel] = useState(true);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleTimeZone, setRescheduleTimeZone] = useState('America/Los_Angeles');
  const [rescheduleSubject, setRescheduleSubject] = useState('');
  const [rescheduleMessage, setRescheduleMessage] = useState('');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!detail) {
      setShowReschedule(false);
      setShowCancelConfirm(false);
      return;
    }
    setRescheduleDate('');
    setRescheduleTime('');
    setRescheduleTimeZone('America/Los_Angeles');
    setRescheduleSubject('');
    setRescheduleMessage('');
    setShowReschedule(false);
    setShowCancelConfirm(false);
    setNotifyOnCancel(true);
  }, [detail]);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submittingReschedule) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detail, onClose, submittingReschedule]);

  if (!detail) return null;

  const { event, fullCall } = detail;
  const client = fullCall?.client ?? event.label;
  const typeLabel = fullCall?.typeLabel ?? CALL_TYPE_LABELS[event.type];
  const meetingUrl = fullCall?.meetingUrl ? (normalizeMeetLink(fullCall.meetingUrl) || fullCall.meetingUrl) : '';
  const source = fullCall?.source ?? event.source ?? 'onboarding';
  const previousTimeLabel = fullCall
    ? `${fullCall.startTime} – ${fullCall.endTime} ${fullCall.timezone}`
    : event.time;

  const metaRows: { label: string; value: string; href?: string }[] = [
    { label: 'Practice / Client', value: client },
    { label: 'Call Type', value: typeLabel },
    { label: 'Date', value: formatLongDate(fullCall?.date ?? event.date) },
    {
      label: 'Time',
      value: previousTimeLabel,
    },
    { label: 'Host', value: fullCall?.host ? `${fullCall.host} (${fullCall.hostRole})` : 'Unassigned' },
    { label: 'Platform', value: fullCall?.platform ?? 'TBD' },
    { label: 'Primary Contact', value: fullCall?.contact ?? '-' },
    { label: 'Contact Email', value: fullCall?.contactEmail ?? '-' },
    {
      label: 'Google Meet Link',
      value: meetingUrl || '-',
      href: meetingUrl || undefined,
    },
    { label: 'Attendees', value: fullCall ? String(fullCall.attendeeCount) : '-' },
    { label: 'Status', value: fullCall ? (event.status === 'pending' ? 'Pending' : 'Confirmed') : 'Scheduled' },
    {
      label: 'Source',
      value: source === 'admin'
        ? 'Admin outreach schedule'
        : 'Onboarding step 2 schedule',
    },
  ];

  const buildRescheduleDefaults = (date: string, timeSlot: string, timeZone: string) => {
    if (!fullCall || !date || !timeSlot) return { subject: '', message: '' };

    const eventTitle = fullCall.eventTitle?.trim() || fullCall.client;
    const startTime = formatTimeForDisplay(timeSlot, timeZone || undefined);
    const tz = getTimeZoneShortLabel(timeZone);
    const endDate = timeSlot.includes('T')
      ? new Date(new Date(timeSlot).getTime() + 30 * 60_000).toISOString()
      : timeSlot;
    const endTime = formatTimeForDisplay(endDate, timeZone || undefined);

    const subject = buildDefaultRescheduleSubject(eventTitle);
    const message = buildDefaultRescheduleMessage({
      contactName: fullCall.contact,
      eventTitle,
      previousDateDisplay: formatLongDate(fullCall.date),
      previousTimeDisplay: `${fullCall.startTime} – ${fullCall.endTime} ${fullCall.timezone}`,
      newDateDisplay: formatDateForDisplay(date),
      newTimeDisplay: `${startTime} – ${endTime}`,
      timezone: tz,
      meetingUrl: meetingUrl || undefined,
    });

    return { subject, message };
  };

  const openReschedulePanel = () => {
    if (!fullCall?.contactEmail?.trim()) {
      toast.error('No contact email on file for this call.');
      return;
    }
    setShowCancelConfirm(false);
    setRescheduleDate('');
    setRescheduleTime('');
    setRescheduleSubject('');
    setRescheduleMessage('');
    setShowReschedule(true);
  };

  const handleDateSelect = (date: string) => {
    setRescheduleDate(date);
    setRescheduleTime('');
    setRescheduleSubject('');
    setRescheduleMessage('');
  };

  const handleTimeSelect = (slot: ScheduleTimeSlot, timeZone: string) => {
    const activeDate = rescheduleDate || (slot.id.includes('T') ? slot.id.split('T')[0] : '');
    setRescheduleTime(slot.id);
    setRescheduleTimeZone(timeZone);
    const defaults = buildRescheduleDefaults(activeDate, slot.id, timeZone);
    setRescheduleSubject(defaults.subject);
    setRescheduleMessage(defaults.message);
  };

  const handleConfirmReschedule = async () => {
    if (!fullCall) {
      toast.error('Call details are unavailable for reschedule.');
      return;
    }
    if (!rescheduleDate || !rescheduleTime) {
      toast.error('Please select a new date and time slot.');
      return;
    }
    if (!rescheduleSubject.trim() || !rescheduleMessage.trim()) {
      toast.error('Please enter the reschedule email subject and message.');
      return;
    }

    const token = localStorage.getItem('adminAccessToken');
    if (!token) {
      toast.error('Admin session expired. Please sign in again.');
      return;
    }

    setSubmittingReschedule(true);
    try {
      await rescheduleOutreachCall(token, {
        call: fullCall,
        source,
        newDate: rescheduleDate,
        newTimeSlot: rescheduleTime,
        newTimeZone: rescheduleTimeZone,
        previousDateKey: fullCall.date,
        previousTimeLabel,
        subject: rescheduleSubject.trim(),
        messageBody: rescheduleMessage.trim(),
      });

      toast.success(`Call rescheduled. Confirmation email sent to ${fullCall.contactEmail}.`);
      setShowReschedule(false);
      onRescheduled?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reschedule call.');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      onCancelMeeting?.(event, notifyOnCancel);
      toast.success(
        notifyOnCancel && fullCall?.contactEmail
          ? `Meeting cancelled. Cancellation notice sent to ${fullCall.contactEmail}.`
          : 'Meeting cancelled.',
      );
      onClose();
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="ors-call-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="ors-call-modal-title">
      <button type="button" className="ors-call-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className={`ors-call-modal${showReschedule ? ' ors-call-modal--wide' : ''}`}>
        <div className="ors-call-modal-header">
          <div>
            <span className={`ors-type-pill ors-type-pill--${event.type}`}>{typeLabel}</span>
            {event.source === 'admin' && (
              <span className="ors-admin-tag ors-admin-tag--modal">Admin</span>
            )}
            <h2 id="ors-call-modal-title" className="ors-call-modal-title">{client}</h2>
            <p className="ors-call-modal-subtitle">
              {formatLongDate(fullCall?.date ?? event.date)}
              {' · '}
              {previousTimeLabel}
            </p>
          </div>
          <button type="button" className="ors-call-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="ors-call-modal-body">
          {!showReschedule && (
            <>
              <div className="ors-call-meta-grid">
                {metaRows.map((row) => (
                  <div key={row.label} className="ors-call-meta-row">
                    <span className="ors-call-meta-label">{row.label}</span>
                    <span className="ors-call-meta-value">
                      {row.href ? (
                        <a href={row.href} target="_blank" rel="noopener noreferrer" className="ors-call-meet-link">
                          {row.value}
                        </a>
                      ) : row.value}
                    </span>
                  </div>
                ))}
              </div>

              {fullCall?.prepNotes && (
                <div className="ors-call-modal-section">
                  <h3 className="ors-call-modal-section-title">Prep Notes</h3>
                  <p className="ors-prep-notes">{fullCall.prepNotes}</p>
                </div>
              )}

              {fullCall && fullCall.attendees.filter((a) => a.tag !== 'Host').length > 0 && (
                <div className="ors-call-modal-section">
                  <h3 className="ors-call-modal-section-title">Attendees</h3>
                  <div className="ors-attendees">
                    {fullCall.attendees.filter((a) => a.tag !== 'Host').map((a) => (
                      <div key={a.initials} className="ors-attendee-row">
                        <span className={`ors-attendee-avatar${a.external ? ' ors-attendee-avatar--external' : ''}`}>
                          {a.initials}
                        </span>
                        <div>
                          <div className="ors-attendee-name">{a.name}</div>
                          <div className="ors-attendee-role">{a.role}</div>
                        </div>
                        <span className={`ors-attendee-tag${a.tag === 'External' ? ' ors-attendee-tag--external' : ''}`}>
                          {a.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {showCancelConfirm && (
            <div className="ors-call-cancel-panel">
              <h3 className="ors-call-modal-section-title">Cancel Meeting</h3>
              <p className="ors-call-cancel-text">
                Cancel the scheduled call with <strong>{client}</strong> on{' '}
                {formatLongDate(fullCall?.date ?? event.date)}? This cannot be undone.
              </p>
              <label className="ors-call-cancel-notify">
                <input
                  type="checkbox"
                  checked={notifyOnCancel}
                  onChange={(e) => setNotifyOnCancel(e.target.checked)}
                />
                <span>
                  Send cancellation email to attendees
                  {fullCall?.contactEmail ? ` (${fullCall.contactEmail})` : ''}
                </span>
              </label>
              <div className="ors-call-reschedule-actions">
                <button type="button" className="ors-btn ors-btn-text" onClick={() => setShowCancelConfirm(false)}>
                  Keep Meeting
                </button>
                <button
                  type="button"
                  className="ors-btn ors-btn-danger"
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          )}

          {showReschedule && (
            <div className="ors-call-reschedule-panel">
              <h3 className="ors-call-modal-section-title">Reschedule Call</h3>
              <p className="ors-call-reminder-text">
                Select a new date and time. A confirmation email will be sent to{' '}
                <strong>{fullCall?.contactEmail}</strong>.
              </p>

              <div className="ors-schedule-picker-wrap">
                <ScheduleCalendarPicker
                  selectedDate={rescheduleDate}
                  selectedTime={rescheduleTime}
                  onDateSelect={handleDateSelect}
                  onTimeSelect={handleTimeSelect}
                  disabled={submittingReschedule}
                />
              </div>

              {rescheduleDate && rescheduleTime && (
                <>
                  <label className="ors-call-field" htmlFor="ors-reschedule-subject">
                    <span>Email Subject</span>
                    <input
                      id="ors-reschedule-subject"
                      type="text"
                      value={rescheduleSubject}
                      onChange={(e) => setRescheduleSubject(e.target.value)}
                      disabled={submittingReschedule}
                    />
                  </label>

                  <label className="ors-call-field" htmlFor="ors-reschedule-message">
                    <span>Email Message</span>
                    <textarea
                      id="ors-reschedule-message"
                      rows={8}
                      value={rescheduleMessage}
                      onChange={(e) => setRescheduleMessage(e.target.value)}
                      disabled={submittingReschedule}
                    />
                  </label>
                </>
              )}

              <div className="ors-call-reschedule-actions">
                <button
                  type="button"
                  className="ors-btn ors-btn-text"
                  onClick={() => setShowReschedule(false)}
                  disabled={submittingReschedule}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="ors-btn ors-btn-primary"
                  onClick={() => void handleConfirmReschedule()}
                  disabled={submittingReschedule || !rescheduleDate || !rescheduleTime}
                >
                  {submittingReschedule ? 'Sending…' : 'Send Reschedule'}
                </button>
              </div>
            </div>
          )}
        </div>

        {!showReschedule && (
          <div className="ors-call-modal-footer">
            {meetingUrl && (
              <button
                type="button"
                className="ors-btn ors-btn-primary"
                onClick={() => window.open(meetingUrl, '_blank', 'noopener,noreferrer')}
              >
                Join
              </button>
            )}
            <button
              type="button"
              className="ors-btn ors-btn-secondary"
              onClick={openReschedulePanel}
            >
              <CalendarClock size={15} />
              Reschedule
            </button>
            <button
              type="button"
              className="ors-btn ors-btn-danger-outline"
              onClick={() => {
                setShowReschedule(false);
                setShowCancelConfirm((v) => !v);
              }}
            >
              <CalendarX2 size={15} />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

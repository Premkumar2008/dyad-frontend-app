import React, { useEffect, useState } from 'react';
import { CalendarClock, CalendarX2, Mail, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  CALL_TYPE_LABELS,
  formatLongDate,
  type CalendarEvent,
  type OutreachCall,
} from './outreachScheduleData';
import { normalizeMeetLink } from '../../utils/calendarMeetLink';

export interface CallDetailModalState {
  event: CalendarEvent;
  fullCall: OutreachCall | null;
}

interface OutreachCallDetailModalProps {
  detail: CallDetailModalState | null;
  onClose: () => void;
  onReschedule?: (event: CalendarEvent, next: { date: string; time: string }) => void;
  onCancelMeeting?: (event: CalendarEvent, notifyAttendees: boolean) => void;
}

export const OutreachCallDetailModal: React.FC<OutreachCallDetailModalProps> = ({
  detail,
  onClose,
  onReschedule,
  onCancelMeeting,
}) => {
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [notifyOnCancel, setNotifyOnCancel] = useState(true);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [sendingReminder, setSendingReminder] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!detail) {
      setShowReschedule(false);
      setShowCancelConfirm(false);
      return;
    }
    setRescheduleDate(detail.event.date);
    setRescheduleTime(detail.event.time);
    setShowReschedule(false);
    setShowCancelConfirm(false);
    setNotifyOnCancel(true);
  }, [detail]);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detail, onClose]);

  if (!detail) return null;

  const { event, fullCall } = detail;
  const client = fullCall?.client ?? event.label;
  const typeLabel = fullCall?.typeLabel ?? CALL_TYPE_LABELS[event.type];
  const meetingUrl = fullCall?.meetingUrl ? (normalizeMeetLink(fullCall.meetingUrl) || fullCall.meetingUrl) : '';

  const metaRows: { label: string; value: string; href?: string }[] = [
    { label: 'Practice / Client', value: client },
    { label: 'Call Type', value: typeLabel },
    { label: 'Date', value: formatLongDate(fullCall?.date ?? event.date) },
    {
      label: 'Time',
      value: fullCall
        ? `${fullCall.startTime} – ${fullCall.endTime} ${fullCall.timezone}`
        : event.time,
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
    { label: 'Source', value: 'Onboarding step 2 schedule' },
  ];

  const handleSendReminder = async () => {
    const email = fullCall?.contactEmail;
    if (!email) {
      toast.error('No contact email on file for this call.');
      return;
    }
    setSendingReminder(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      toast.success(`Reminder email sent to ${email}`);
    } finally {
      setSendingReminder(false);
    }
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleDate || !rescheduleTime) {
      toast.error('Please select a new date and time.');
      return;
    }
    onReschedule?.(event, { date: rescheduleDate, time: rescheduleTime });
    toast.success('Call rescheduled successfully.');
    setShowReschedule(false);
    onClose();
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
      <div className="ors-call-modal">
        <div className="ors-call-modal-header">
          <div>
            <span className={`ors-type-pill ors-type-pill--${event.type}`}>{typeLabel}</span>
            <h2 id="ors-call-modal-title" className="ors-call-modal-title">{client}</h2>
            <p className="ors-call-modal-subtitle">
              {formatLongDate(fullCall?.date ?? event.date)}
              {' · '}
              {fullCall ? `${fullCall.startTime} – ${fullCall.endTime} ${fullCall.timezone}` : event.time}
            </p>
          </div>
          <button type="button" className="ors-call-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="ors-call-modal-body">
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

          {fullCall && fullCall.attendees.length > 0 && (
            <div className="ors-call-modal-section">
              <h3 className="ors-call-modal-section-title">Attendees</h3>
              <div className="ors-attendees">
                {fullCall.attendees.map((a) => (
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
              <div className="ors-call-reschedule-fields">
                <label className="ors-call-field">
                  <span>New date</span>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                  />
                </label>
                <label className="ors-call-field">
                  <span>New time</span>
                  <input
                    type="text"
                    placeholder="e.g. 10:00a"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                  />
                </label>
              </div>
              <div className="ors-call-reschedule-actions">
                <button type="button" className="ors-btn ors-btn-text" onClick={() => setShowReschedule(false)}>
                  Cancel
                </button>
                <button type="button" className="ors-btn ors-btn-primary" onClick={handleConfirmReschedule}>
                  Confirm Reschedule
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="ors-call-modal-footer">
          {meetingUrl && (
            <button
              type="button"
              className="ors-btn ors-btn-primary"
              onClick={() => window.open(meetingUrl, '_blank', 'noopener,noreferrer')}
            >
              Join Google Meet
            </button>
          )}
          <button
            type="button"
            className="ors-btn ors-btn-secondary"
            onClick={handleSendReminder}
            disabled={sendingReminder}
          >
            <Mail size={15} />
            {sendingReminder ? 'Sending…' : 'Send Reminder Email'}
          </button>
          <button
            type="button"
            className="ors-btn ors-btn-secondary"
            onClick={() => {
              setShowCancelConfirm(false);
              setShowReschedule((v) => !v);
            }}
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
            Cancel Meeting
          </button>
          <button type="button" className="ors-btn ors-btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

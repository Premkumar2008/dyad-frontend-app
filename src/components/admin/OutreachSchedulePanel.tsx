import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  CALL_TYPE_LABELS,
  formatLongDate,
  formatMonthYear,
  matchesOutreachFilters,
  OUTREACH_ASSIGNEE_OPTIONS,
  resolveCalendarEventMeta,
  toDateKey,
  type CallType,
  type CalendarEvent,
  type OutreachCall,
  type OutreachFilters,
} from './outreachScheduleData';
import { OutreachCallDetailModal, type CallDetailModalState } from './OutreachCallDetailModal';
import { AdminScheduleCallModal } from './AdminScheduleCallModal';
import { fetchOutreachScheduleFromOnboarding } from '../../services/outreachScheduleService';
import {
  fetchAdminScheduledCalls,
  mergeOutreachScheduleData,
} from '../../services/adminScheduledCallsService';
import { normalizeMeetLink } from '../../utils/calendarMeetLink';
import { downloadOutreachScheduleIcs } from '../../utils/outreachIcsExport';
import './OutreachSchedulePanel.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const VIEW_MODES = ['Day', 'Week', 'Month', 'Agenda'] as const;
type ViewMode = (typeof VIEW_MODES)[number];

const getTodayCalendarState = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    dateKey: toDateKey(now.getFullYear(), now.getMonth(), now.getDate()),
  };
};

interface SidebarCallItem {
  id: string;
  type: CallType;
  timeLabel: string;
  client: string;
  contact?: string;
  contactEmail?: string;
  host?: string;
  attendeeCount?: number;
  meetingUrl?: string;
  fullCallId?: string;
  event: CalendarEvent;
}

const buildSidebarCallsForDate = (
  dateKey: string,
  eventsByDate: Map<string, CalendarEvent[]>,
  outreachCalls: OutreachCall[],
): SidebarCallItem[] => {
  const events = eventsByDate.get(dateKey) ?? [];
  const fullById = new Map(outreachCalls.map((c) => [c.id, c]));

  return events.map((ev) => {
    const full = ev.callId ? fullById.get(ev.callId) : undefined;
    if (full) {
      return {
        id: full.id,
        type: full.type,
        timeLabel: `${full.startTime} – ${full.endTime} ${full.timezone} · ${CALL_TYPE_LABELS[full.type]}`,
        client: full.client,
        contact: full.contact,
        contactEmail: full.contactEmail,
        host: full.host,
        attendeeCount: full.attendeeCount,
        meetingUrl: full.meetingUrl,
        fullCallId: full.id,
        event: ev,
      };
    }
    return {
      id: `${ev.date}-${ev.time}-${ev.label}`,
      type: ev.type,
      timeLabel: `${ev.time} · ${CALL_TYPE_LABELS[ev.type]}`,
      client: ev.label,
      fullCallId: ev.callId,
      event: ev,
    };
  });
};

interface CalendarCell {
  day: number;
  dateKey: string;
  inMonth: boolean;
  isWeekend: boolean;
  isToday: boolean;
}

const buildMonthGrid = (year: number, month: number, todayKey: string): CalendarCell[] => {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let i = startPad - 1; i >= 0; i -= 1) {
    const day = prevMonthDays - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateKey = toDateKey(prevYear, prevMonth, day);
    const dow = new Date(prevYear, prevMonth, day).getDay();
    cells.push({ day, dateKey, inMonth: false, isWeekend: dow === 0 || dow === 6, isToday: dateKey === todayKey });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = toDateKey(year, month, day);
    const dow = new Date(year, month, day).getDay();
    cells.push({ day, dateKey, inMonth: true, isWeekend: dow === 0 || dow === 6, isToday: dateKey === todayKey });
  }

  while (cells.length < 42) {
    const nextIndex = cells.length - (startPad + daysInMonth) + 1;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateKey = toDateKey(nextYear, nextMonth, nextIndex);
    const dow = new Date(nextYear, nextMonth, nextIndex).getDay();
    cells.push({
      day: nextIndex,
      dateKey,
      inMonth: false,
      isWeekend: dow === 0 || dow === 6,
      isToday: dateKey === todayKey,
    });
  }

  return cells;
};

const getWeekBounds = (ref: Date) => {
  const start = new Date(ref);
  start.setDate(ref.getDate() - ref.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const formatWeekRangeLabel = (start: Date, end: Date) => {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
};

const dateKeyToDate = (dateKey: string) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const VideoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const AgendaDocIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

export const OutreachSchedulePanel: React.FC = () => {
  const realTodayKey = toDateKey(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );

  const [viewYear, setViewYear] = useState(() => getTodayCalendarState().year);
  const [viewMonth, setViewMonth] = useState(() => getTodayCalendarState().month);
  const [selectedDate, setSelectedDate] = useState(() => getTodayCalendarState().dateKey);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [outreachCalls, setOutreachCalls] = useState<OutreachCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [callDetailModal, setCallDetailModal] = useState<CallDetailModalState | null>(null);
  const [filters, setFilters] = useState<OutreachFilters>({
    callType: 'all',
    assignee: 'all',
    status: 'all',
  });
  const [viewMode, setViewMode] = useState<ViewMode>('Month');
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const loadSchedule = useCallback(async () => {
    const token = localStorage.getItem('adminAccessToken');
    if (!token) {
      setLoadError('Admin session expired. Please sign in again.');
      setCalendarEvents([]);
      setOutreachCalls([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError('');
    try {
      const [onboardingResult, adminResult] = await Promise.allSettled([
        fetchOutreachScheduleFromOnboarding(token),
        fetchAdminScheduledCalls(token),
      ]);

      const sources = [];
      const errors: string[] = [];

      if (onboardingResult.status === 'fulfilled') {
        sources.push(onboardingResult.value);
      } else {
        errors.push('onboarding enrollments');
      }

      if (adminResult.status === 'fulfilled') {
        sources.push(adminResult.value);
      } else {
        const adminMessage = adminResult.reason instanceof Error
          ? adminResult.reason.message
          : 'admin scheduled calls';
        errors.push(adminMessage);
      }

      if (sources.length === 0) {
        const message = adminResult.status === 'rejected' && adminResult.reason instanceof Error
          ? adminResult.reason.message
          : onboardingResult.status === 'rejected' && onboardingResult.reason instanceof Error
            ? onboardingResult.reason.message
            : undefined;
        setLoadError(message || 'Could not load scheduled calls.');
        setCalendarEvents([]);
        setOutreachCalls([]);
        return;
      }

      const merged = mergeOutreachScheduleData(...sources);
      setCalendarEvents(merged.events);
      setOutreachCalls(merged.calls);

      if (errors.length > 0) {
        toast.error(`Some schedule data could not be loaded (${errors.join('; ')}).`);
      }
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setLoadError(message || 'Could not load scheduled calls.');
      setCalendarEvents([]);
      setOutreachCalls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const outreachCallsById = useMemo(
    () => new Map(outreachCalls.map((call) => [call.id, call])),
    [outreachCalls],
  );

  const selectedCall = useMemo(
    () => (selectedCallId ? outreachCallsById.get(selectedCallId) ?? null : null),
    [selectedCallId, outreachCallsById],
  );

  const filteredEvents = useMemo(
    () => calendarEvents.filter((event) => matchesOutreachFilters(event, filters)),
    [calendarEvents, filters],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    filteredEvents.forEach((event) => {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    });
    return map;
  }, [filteredEvents]);

  const hasActiveFilters = filters.callType !== 'all'
    || filters.assignee !== 'all'
    || filters.status !== 'all';

  const filterMonthStats = useMemo(() => {
    const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
    const inMonth = filteredEvents.filter((e) => e.date.startsWith(monthPrefix));
    const pending = inMonth.filter((e) => resolveCalendarEventMeta(e).status === 'pending').length;
    return { monthTotal: inMonth.length, pending };
  }, [filteredEvents, viewYear, viewMonth]);

  const scheduleStats = useMemo(() => {
    const now = new Date();
    const todayKey = realTodayKey;
    const { start, end } = getWeekBounds(now);
    const thisWeek = filteredEvents.filter((event) => {
      const eventDate = dateKeyToDate(event.date);
      return eventDate >= start && eventDate <= end;
    }).length;

    const completed = filteredEvents.filter((event) => {
      const meta = resolveCalendarEventMeta(event);
      return event.date < todayKey && meta.status === 'confirmed';
    }).length;

    return {
      thisWeek,
      weekRangeLabel: formatWeekRangeLabel(start, end),
      completed,
    };
  }, [filteredEvents, realTodayKey]);

  const selectedDateCalls = useMemo(
    () => buildSidebarCallsForDate(selectedDate, eventsByDate, outreachCalls),
    [selectedDate, eventsByDate, outreachCalls],
  );

  const isSelectedToday = selectedDate === realTodayKey;

  const grid = useMemo(
    () => buildMonthGrid(viewYear, viewMonth, realTodayKey),
    [viewYear, viewMonth, realTodayKey],
  );

  const openCallDetail = useCallback((event: CalendarEvent) => {
    const fullCall = event.callId
      ? outreachCallsById.get(event.callId) ?? null
      : null;
    setCallDetailModal({ event, fullCall });
  }, [outreachCallsById]);

  const showAgenda = useCallback((callId: string) => {
    setSelectedCallId(callId);
    setAgendaOpen(true);
  }, []);

  const isSameCalendarEvent = (a: CalendarEvent, b: CalendarEvent) =>
    a.date === b.date && a.time === b.time && a.label === b.label;

  const handleCancelMeeting = useCallback((event: CalendarEvent) => {
    setCalendarEvents((prev) => prev.filter((ev) => !isSameCalendarEvent(ev, event)));
    if (event.callId) {
      setOutreachCalls((prev) => prev.filter((call) => call.id !== event.callId));
    }
    if (event.callId && selectedCallId === event.callId) {
      setSelectedCallId(null);
      setAgendaOpen(false);
    }
  }, [selectedCallId]);

  const closeAgenda = useCallback(() => {
    setAgendaOpen(false);
    setSelectedCallId(null);
  }, []);

  const copyMeetingLink = async (url: string) => {
    const href = normalizeMeetLink(url) || url.trim();
    if (!href) {
      toast.error('No meeting link available.');
      return;
    }
    try {
      await navigator.clipboard.writeText(href);
      toast.success('Meeting link copied');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const openMeetingLink = (url: string) => {
    const href = normalizeMeetLink(url) || url.trim();
    if (!href) {
      toast.error('No meeting link available.');
      return;
    }
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const joinMeeting = useCallback((callId: string) => {
    const call = outreachCallsById.get(callId);
    if (!call?.meetingUrl) {
      toast.error('No Google Meet link available for this call.');
      return;
    }
    openMeetingLink(call.meetingUrl);
  }, [outreachCallsById]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectDate = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
    setAgendaOpen(false);
    setSelectedCallId(null);
  }, []);

  const goToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(realTodayKey);
  };

  const handleExportIcs = useCallback(() => {
    if (loading) return;

    if (filteredEvents.length === 0) {
      toast.error(hasActiveFilters
        ? 'No calls match the current filters to export.'
        : 'No scheduled calls to export.');
      return;
    }

    const exportedCount = downloadOutreachScheduleIcs(
      filteredEvents,
      outreachCalls,
      `dyad-outreach-${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`,
    );
    toast.success(`Exported ${exportedCount} call${exportedCount === 1 ? '' : 's'} to .ics`);
  }, [filteredEvents, hasActiveFilters, loading, outreachCalls, viewMonth, viewYear]);

  const layoutClass = [
    'ors-calendar-layout',
    agendaOpen ? 'ors-calendar-layout--agenda-open' : '',
  ].filter(Boolean).join(' ');

  const renderAgendaPanel = (call: OutreachCall) => (
    <div key={call.id} className="ors-agenda-panel">
      <div className="ors-agenda-header">
        <div>
          <div className="ors-panel-title">Meeting Agenda</div>
          <div className="ors-panel-subtitle">{call.client}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="ors-agenda-close" onClick={closeAgenda} aria-label="Close agenda">
            ×
          </button>
        </div>
      </div>
      <div className="ors-agenda-meta">
        <span className={`ors-type-pill ors-type-pill--${call.type}`}>{call.typeLabel}</span>
        <div>
          <strong>{formatLongDate(call.date).replace(/, \d{4}$/, '')}</strong>
          {' · '}
          {call.startTime} – {call.endTime} {call.timezone}
        </div>
        <div>
          Host: <strong>{call.host}</strong> ({call.hostRole}) · {call.platform}
        </div>
        {call.meetingUrl && (
          <div className="ors-agenda-meet-link">
            <span className="ors-agenda-meet-label">Google Meet</span>
            <a
              href={normalizeMeetLink(call.meetingUrl) || call.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ors-agenda-meet-url"
            >
              {call.meetingUrl}
            </a>
            <button
              type="button"
              className="ors-copy-btn"
              title="Copy Google Meet link"
              onClick={() => copyMeetingLink(call.meetingUrl)}
            >
              <CopyIcon />
            </button>
          </div>
        )}
      </div>
      <div className="ors-agenda-body">
        <div className="ors-section-title">Talking Points</div>
        <ul className="ors-agenda-items">
          {call.agenda.map((item) => (
            <li key={`${call.id}-${item.duration}`}>
              <span className="ors-agenda-time">{item.duration}</span>
              <div>
                <div className="ors-agenda-topic-title">{item.title}</div>
                <div className="ors-agenda-topic-detail">{item.detail}</div>
              </div>
            </li>
          ))}
        </ul>
        <div className="ors-section-title">Attendees</div>
        <div className="ors-attendees">
          {call.attendees.filter((a) => a.tag !== 'Host').map((a) => (
            <div key={`${call.id}-${a.initials}`} className="ors-attendee-row">
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
        <div className="ors-section-title">Prep Notes</div>
        <div className="ors-prep-notes">{call.prepNotes}</div>
      </div>
      <div className="ors-agenda-footer">
        {call.meetingUrl && (
          <button
            type="button"
            className="ors-btn ors-btn-primary ors-btn-sm"
            onClick={() => openMeetingLink(call.meetingUrl)}
          >
            <VideoIcon />
            Join Google Meet
          </button>
        )}
        <button type="button" className="ors-btn ors-btn-secondary ors-btn-sm">Edit Agenda</button>
        <button type="button" className="ors-btn ors-btn-secondary ors-btn-sm">Send to Attendees</button>
      </div>
    </div>
  );

  return (
    <div className="ors-root">
      {loadError && (
        <div className="adm2-alert-banner">
          <div className="adm2-alert-icon">!</div>
          <div className="adm2-alert-body">
            <p className="adm2-alert-title">Could not load scheduled calls</p>
            <p className="adm2-alert-text">{loadError}</p>
          </div>
          <button type="button" className="adm2-btn adm2-btn--outline" onClick={() => void loadSchedule()}>
            Retry
          </button>
        </div>
      )}

      <div className="ors-stats-strip">
        <div className="ors-stat-card ors-stat-card--accent">
          <div className="ors-stat-label">Scheduled This Week</div>
          <div className="ors-stat-value">{loading ? '-' : scheduleStats.thisWeek}</div>
          <div className="ors-stat-trend">{scheduleStats.weekRangeLabel}</div>
        </div>
        <div className="ors-stat-card">
          <div className="ors-stat-label">This Month Total</div>
          <div className="ors-stat-value">{loading ? '-' : filterMonthStats.monthTotal}</div>
          <div className="ors-stat-trend">
            {hasActiveFilters ? 'Matching current filters' : formatMonthYear(viewYear, viewMonth)}
          </div>
        </div>
        <div className="ors-stat-card ors-stat-card--success">
          <div className="ors-stat-label">Completed</div>
          <div className="ors-stat-value">{loading ? '-' : scheduleStats.completed}</div>
          <div className="ors-stat-trend">Confirmed calls in the past</div>
        </div>
        <div className="ors-stat-card ors-stat-card--warning">
          <div className="ors-stat-label">Needs Confirmation</div>
          <div className="ors-stat-value">{loading ? '-' : filterMonthStats.pending}</div>
          <div className="ors-stat-trend">Awaiting calendar booking</div>
        </div>
      </div>

      <div className="ors-action-bar">
        <div className="ors-filters">
          <select
            className="ors-filter-select"
            value={filters.callType}
            onChange={(e) => setFilters((prev) => ({
              ...prev,
              callType: e.target.value as OutreachFilters['callType'],
            }))}
            aria-label="Filter by call type"
          >
            <option value="all">All call types</option>
            <option value="discovery">Discovery</option>
            <option value="demo">Product demo</option>
            <option value="followup">Follow-up</option>
            <option value="onboarding">Onboarding kickoff</option>
          </select>
          <select
            className="ors-filter-select"
            value={filters.assignee}
            onChange={(e) => setFilters((prev) => ({
              ...prev,
              assignee: e.target.value as OutreachFilters['assignee'],
            }))}
            aria-label="Filter by assignee"
          >
            <option value="all">All assignees</option>
            {OUTREACH_ASSIGNEE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
          <select
            className="ors-filter-select"
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({
              ...prev,
              status: e.target.value as OutreachFilters['status'],
            }))}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending RSVP</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              className="ors-btn ors-btn-text"
              onClick={() => setFilters({ callType: 'all', assignee: 'all', status: 'all' })}
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="ors-actions">
          <button
            type="button"
            className="ors-btn ors-btn-text"
            onClick={handleExportIcs}
            disabled={loading || filteredEvents.length === 0}
          >
            Export .ics
          </button>
          <button
            type="button"
            className="ors-btn ors-btn-secondary"
            onClick={() => void loadSchedule()}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh Schedule'}
          </button>
          <button
            type="button"
            className="ors-btn ors-btn-primary"
            onClick={() => setScheduleModalOpen(true)}
          >
            + Schedule Call
          </button>
        </div>
      </div>

      <div className="ors-legend">
        <div className="ors-legend-label">Call Types:</div>
        <div className="ors-legend-item"><span className="ors-legend-swatch ors-legend-swatch--discovery" />Discovery</div>
        <div className="ors-legend-item"><span className="ors-legend-swatch ors-legend-swatch--demo" />Product Demo</div>
        <div className="ors-legend-item"><span className="ors-legend-swatch ors-legend-swatch--followup" />Follow-up</div>
        <div className="ors-legend-item"><span className="ors-legend-swatch ors-legend-swatch--onboarding" />Onboarding Kickoff</div>
        <div className="ors-legend-item"><span className="ors-legend-tag ors-legend-tag--admin">Admin</span>Admin scheduled</div>
      </div>

      <div className={layoutClass}>
        <div className="ors-side-panel">
          <div className="ors-panel-header">
            <div className="ors-panel-title">
              {isSelectedToday ? "Today's Calls" : 'Scheduled Calls'}
            </div>
            <div className="ors-panel-subtitle">
              {formatLongDate(selectedDate)} · {selectedDateCalls.length} scheduled
            </div>
          </div>
          <div className="ors-upcoming-list">
            {loading && (
              <div className="ors-empty-day">Loading scheduled calls…</div>
            )}
            {!loading && selectedDateCalls.length === 0 && (
              <div className="ors-empty-day">
                {hasActiveFilters
                  ? 'No calls match the current filters on this date.'
                  : 'No calls scheduled for this date.'}
              </div>
            )}
            {!loading && selectedDateCalls.map((call) => (
              <div
                key={call.id}
                role="button"
                tabIndex={0}
                className={`ors-upcoming-item ors-upcoming-item--clickable${selectedCallId === call.fullCallId ? ' ors-upcoming-item--active' : ''}`}
                onClick={() => openCallDetail(call.event)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openCallDetail(call.event);
                  }
                }}
              >
                <div className="ors-upcoming-date">
                  <span className={`ors-upcoming-dot ors-upcoming-dot--${call.type}`} />
                  {call.timeLabel}
                </div>
                <div className="ors-upcoming-client">
                  {call.client}
                  {call.event.source === 'admin' && (
                    <span className="ors-admin-tag">Admin</span>
                  )}
                </div>
                {call.contact && (
                  <div className="ors-upcoming-contact">
                    {call.contact}
                    {call.contactEmail ? ` · ${call.contactEmail}` : ''}
                  </div>
                )}
                {call.fullCallId && (
                  <div className="ors-item-actions">
                    {call.meetingUrl && (
                      <button
                        type="button"
                        className="ors-join-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          joinMeeting(call.fullCallId!);
                        }}
                      >
                        <VideoIcon />
                        Join Meeting
                      </button>
                    )}
                    <button
                      type="button"
                      className="ors-agenda-btn"
                      onClick={(e) => { e.stopPropagation(); showAgenda(call.fullCallId!); }}
                    >
                      <AgendaDocIcon />
                      Agenda
                    </button>
                  </div>
                )}
                {call.meetingUrl && (
                  <div className="ors-meeting-link-row">
                    <a
                      href={normalizeMeetLink(call.meetingUrl) || call.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ors-meeting-link-anchor"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {call.meetingUrl}
                    </a>
                    <button
                      type="button"
                      className="ors-copy-btn"
                      title="Copy Google Meet link"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyMeetingLink(call.meetingUrl!);
                      }}
                    >
                      <CopyIcon />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="ors-calendar-wrapper">
          <div className="ors-calendar-toolbar">
            <div className="ors-calendar-nav">
              <button type="button" className="ors-nav-arrow" onClick={goPrevMonth} aria-label="Previous month">‹</button>
              <button type="button" className="ors-nav-arrow" onClick={goNextMonth} aria-label="Next month">›</button>
              <button type="button" className="ors-today-btn" onClick={goToday}>Today</button>
              <div className="ors-calendar-title">{formatMonthYear(viewYear, viewMonth)}</div>
            </div>
            <div className="ors-view-toggle">
              {VIEW_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`ors-view-toggle-btn${viewMode === mode ? ' ors-view-toggle-btn--active' : ''}`}
                  onClick={() => setViewMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="ors-calendar-card">
            <div className="ors-calendar-weekdays">
              {WEEKDAYS.map((d) => (
                <div key={d} className="ors-weekday">{d}</div>
              ))}
            </div>
            <div className="ors-calendar-grid">
              {loading && (
                <div className="ors-empty-day" style={{ gridColumn: '1 / -1', padding: '2rem' }}>
                  Loading scheduled calls…
                </div>
              )}
              {!loading && grid.map((cell) => {
                const events = eventsByDate.get(cell.dateKey) ?? [];
                const visible = events.slice(0, 2);
                const extra = events.length - visible.length;
                const isSelected = cell.dateKey === selectedDate;
                return (
                  <div
                    key={cell.dateKey}
                    role="button"
                    tabIndex={0}
                    className={[
                      'ors-day-cell',
                      !cell.inMonth ? 'ors-day-cell--other' : '',
                      cell.isWeekend ? 'ors-day-cell--weekend' : '',
                      cell.isToday ? 'ors-day-cell--today' : '',
                      isSelected ? 'ors-day-cell--selected' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => selectDate(cell.dateKey)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectDate(cell.dateKey);
                      }
                    }}
                  >
                    <div className="ors-day-number">{cell.day}</div>
                    {visible.map((ev) => (
                      <button
                        key={`${ev.source ?? 'onboarding'}-${ev.callId ?? ''}-${ev.date}-${ev.time}-${ev.label}`}
                        type="button"
                        className={`ors-event-pill ors-event-pill--${ev.type}${ev.source === 'admin' ? ' ors-event-pill--admin' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectDate(cell.dateKey);
                          openCallDetail(ev);
                        }}
                      >
                        {ev.source === 'admin' && (
                          <span className="ors-event-admin-tag">Admin</span>
                        )}
                        <span className="ors-event-time">{ev.time}</span>
                        {ev.label}
                      </button>
                    ))}
                    {extra > 0 && (
                      <button
                        type="button"
                        className="ors-more-events"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectDate(cell.dateKey);
                        }}
                      >
                        +{extra} more
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {selectedCall && agendaOpen && renderAgendaPanel(selectedCall)}
      </div>

      <OutreachCallDetailModal
        detail={callDetailModal}
        onClose={() => setCallDetailModal(null)}
        onRescheduled={() => void loadSchedule()}
        onCancelMeeting={handleCancelMeeting}
      />

      <AdminScheduleCallModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onScheduled={() => void loadSchedule()}
      />

      <div className="ors-system-info">
        <strong>Calendar sync logic:</strong>
        {' '}Events are merged from{' '}
        <code>GET /api/onboarding</code> (enrollment step 2 schedule fields) and{' '}
        <code>GET /api/calls-scheduled-admin</code> (admin-scheduled outreach calls).
        Admin-scheduled events are tagged <strong>Admin</strong> on the calendar.
      </div>
    </div>
  );
};

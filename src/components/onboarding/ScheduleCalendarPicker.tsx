import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import {
  SCHEDULE_DAYS_AHEAD,
  buildScheduleCalendarMonths,
  fetchAvailableDates,
  fetchAvailableTimeSlots,
  getTimeZoneDisplayLabel,
  getTimeZoneShortLabel,
  type ScheduleTimeSlot,
} from '../../services/onboardingCalendarService';
import { formatDateForDisplay, formatTimeForDisplay } from '../../utils/dateTimeUtils';

const SCHEDULE_WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface ScheduleCalendarViewProps {
  availableDates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  disabled?: boolean;
}

const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
  availableDates, selectedDate, onSelectDate, disabled = false,
}) => {
  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);
  const months = useMemo(
    () => buildScheduleCalendarMonths(availableSet),
    [availableSet],
  );
  const [monthIndex, setMonthIndex] = useState(0);

  useEffect(() => {
    if (!selectedDate || months.length === 0) return;
    const idx = months.findIndex(m => m.cells.some(c => c?.date === selectedDate));
    if (idx >= 0) setMonthIndex(idx);
  }, [selectedDate, months]);

  useEffect(() => {
    if (monthIndex >= months.length && months.length > 0) {
      setMonthIndex(months.length - 1);
    }
  }, [monthIndex, months.length]);

  const currentMonth = months[monthIndex];
  const canGoPrev = monthIndex > 0;
  const canGoNext = monthIndex < months.length - 1;

  if (!currentMonth) return null;

  return (
    <div className={`ob-gcal-carousel${disabled ? ' ob-gcal-disabled' : ''}`}>
      <div className="ob-gcal-nav">
        <button
          type="button"
          className="ob-gcal-nav-btn"
          onClick={() => setMonthIndex(i => i - 1)}
          disabled={!canGoPrev || disabled}
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="ob-gcal-nav-center">
          <h5 className="ob-gcal-month-title">{currentMonth.label}</h5>
          <span className="ob-gcal-nav-counter">{monthIndex + 1} of {months.length}</span>
        </div>
        <button
          type="button"
          className="ob-gcal-nav-btn"
          onClick={() => setMonthIndex(i => i + 1)}
          disabled={!canGoNext || disabled}
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="ob-gcal-month">
        <div className="ob-gcal-weekdays" aria-hidden="true">
          {SCHEDULE_WEEKDAY_LABELS.map(label => (
            <span key={label} className="ob-gcal-weekday-label">{label}</span>
          ))}
        </div>
        <div className="ob-gcal-month-grid">
          {currentMonth.cells.map((cell, idx) => (
            cell === null ? (
              <span key={`${currentMonth.key}-empty-${idx}`} className="ob-gcal-day ob-gcal-day-empty" aria-hidden="true" />
            ) : (
              <button
                key={cell.date}
                type="button"
                disabled={!cell.isAvailable || disabled}
                className={[
                  'ob-gcal-day',
                  cell.isAvailable ? 'ob-gcal-day-available' : 'ob-gcal-day-disabled',
                  cell.isToday ? 'ob-gcal-day-today' : '',
                  selectedDate === cell.date ? 'ob-gcal-selected' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => !disabled && cell.isAvailable && onSelectDate(cell.date)}
                aria-label={cell.isAvailable
                  ? `Select ${new Date(`${cell.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                  : undefined}
                aria-pressed={selectedDate === cell.date}
              >
                {cell.day}
              </button>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export interface ScheduleCalendarPickerProps {
  selectedDate: string;
  selectedTime: string;
  onDateSelect: (date: string) => void;
  onTimeSelect: (slot: ScheduleTimeSlot, timeZone: string) => void;
  disabled?: boolean;
}

export const ScheduleCalendarPicker: React.FC<ScheduleCalendarPickerProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  disabled = false,
}) => {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<ScheduleTimeSlot[]>([]);
  const [slotsTimeZone, setSlotsTimeZone] = useState('America/Los_Angeles');
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [slotsFetchedDate, setSlotsFetchedDate] = useState('');
  const slotsRequestRef = useRef(0);

  const scheduleTzLabel = getTimeZoneDisplayLabel(slotsTimeZone);
  const scheduleTzShort = getTimeZoneShortLabel(slotsTimeZone);
  const formatScheduleTime = (time: string) =>
    formatTimeForDisplay(time, slotsTimeZone || undefined);

  useEffect(() => {
    let cancelled = false;
    setLoadingDates(true);
    fetchAvailableDates()
      .then(dates => { if (!cancelled) setAvailableDates(dates); })
      .finally(() => { if (!cancelled) setLoadingDates(false); });
    return () => { cancelled = true; };
  }, []);

  const loadSlotsForDate = async (date: string) => {
    const requestId = ++slotsRequestRef.current;
    setLoadingSlots(true);
    setSlotsError('');
    setAvailableSlots([]);
    setSlotsFetchedDate(date);
    try {
      const { slots, timeZone } = await fetchAvailableTimeSlots(date);
      if (requestId !== slotsRequestRef.current) return;
      setAvailableSlots(slots);
      setSlotsTimeZone(timeZone);
    } catch (err: unknown) {
      if (requestId !== slotsRequestRef.current) return;
      setAvailableSlots([]);
      setSlotsError(
        err instanceof Error ? err.message : 'Could not load available times. Please try again.',
      );
    } finally {
      if (requestId === slotsRequestRef.current) setLoadingSlots(false);
    }
  };

  const handleDateSelect = (date: string) => {
    onDateSelect(date);
    void loadSlotsForDate(date);
  };

  useEffect(() => {
    if (!selectedDate) return;
    if (slotsFetchedDate === selectedDate && (availableSlots.length > 0 || loadingSlots)) return;
    void loadSlotsForDate(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ob-gcal-schedule">
      <p className="ob-section-desc ors-schedule-picker-desc">
        Select an available 30-minute time slot. All times are displayed in {scheduleTzLabel}.
      </p>
      <div className={`ob-gcal-picker${selectedDate ? ' ob-gcal-picker-with-times' : ''}`}>
        <div className="ob-gcal-picker-calendar">
          <h4 className="ob-gcal-heading">
            <Calendar size={16} />
            Select a Date
          </h4>
          <p className="ob-gcal-hint">
            Choose any available day within the next {SCHEDULE_DAYS_AHEAD} days.
          </p>
          <div className="ob-gcal-picker-row">
            {loadingDates ? (
              <p className="ob-gcal-loading">Loading available dates…</p>
            ) : (
              <ScheduleCalendarView
                availableDates={availableDates}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                disabled={disabled}
              />
            )}
          </div>

          {selectedDate && (
            <div className="ob-gcal-picker-times">
              <p className="ob-gcal-times-label">
                <Clock size={14} aria-hidden="true" />
                {formatDateForDisplay(selectedDate)}
              </p>
              {slotsFetchedDate === selectedDate && loadingSlots ? (
                <p className="ob-gcal-loading">Loading times…</p>
              ) : slotsFetchedDate === selectedDate && slotsError ? (
                <p className="ob-gcal-error">{slotsError}</p>
              ) : slotsFetchedDate === selectedDate && availableSlots.length === 0 ? (
                <p className="ob-gcal-empty">No times available. Choose another day.</p>
              ) : slotsFetchedDate === selectedDate ? (
                <div className="ob-gcal-time-list" role="listbox" aria-label="Available time slots">
                  {availableSlots.map(slot => (
                    <button
                      key={slot.id}
                      type="button"
                      role="option"
                      aria-selected={selectedTime === slot.id}
                      className={`ob-gcal-time-btn${selectedTime === slot.id ? ' ob-gcal-selected' : ''}`}
                      disabled={disabled}
                      onClick={() => onTimeSelect(slot, slotsTimeZone)}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {selectedDate && selectedTime && (
        <div className="ors-schedule-selected">
          <strong>Selected:</strong>
          {' '}
          {formatDateForDisplay(selectedDate)} at {formatScheduleTime(selectedTime)} {scheduleTzShort}
        </div>
      )}
    </div>
  );
};

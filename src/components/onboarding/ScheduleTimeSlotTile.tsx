import React from 'react';
import { formatSlotTileDateParts } from '../../utils/dateTimeUtils';

export interface ScheduleTimeSlotTileProps {
  dateKey: string;
  timeLabel: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const ScheduleTimeSlotTile: React.FC<ScheduleTimeSlotTileProps> = ({
  dateKey,
  timeLabel,
  selected,
  onClick,
  disabled = false,
}) => {
  const { month, day, weekday } = formatSlotTileDateParts(dateKey);

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      aria-label={`${month} ${day}, ${weekday} at ${timeLabel}`}
      className={`ob-gcal-time-btn ob-gcal-time-tile${selected ? ' ob-gcal-selected' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="ob-gcal-time-tile-date-badge" aria-hidden="true">
        <span className="ob-gcal-time-tile-day">{day}</span>
        <span className="ob-gcal-time-tile-meta">
          {month} · {weekday}
        </span>
      </span>
      <span className="ob-gcal-time-tile-time">{timeLabel}</span>
    </button>
  );
};

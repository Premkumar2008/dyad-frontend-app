import React from 'react';

export type SegmentStatus = 'completed' | 'active' | 'locked';

export interface ProgressSegment {
  id: string;
  label: string;
  status: SegmentStatus;
}

interface SectionProgressStripProps {
  segments: ProgressSegment[];
  onJump: (id: string) => void;
  completeCount: number;
  total: number;
}

export const SectionProgressStrip: React.FC<SectionProgressStripProps> = ({
  segments, onJump, completeCount, total,
}) => {
  const allDone = completeCount === total;

  return (
    <div className="ob-sec-prog">
      <div className="ob-sec-prog-segments">
        {segments.map(seg => (
          <button
            key={seg.id}
            type="button"
            className={`ob-sec-prog-seg${seg.status === 'completed' ? ' ob-sec-prog-seg-done' : ''}${seg.status === 'active' ? ' ob-sec-prog-seg-active' : ''}${seg.status === 'locked' ? ' ob-sec-prog-seg-locked' : ''}`}
            title={seg.label}
            disabled={seg.status === 'locked'}
            onClick={() => seg.status !== 'locked' && onJump(seg.id)}
          />
        ))}
      </div>
      <div className={`ob-sec-prog-meta${allDone ? ' ob-sec-prog-all' : ''}`}>
        {allDone ? `All ${total} sections complete` : `${completeCount} of ${total} sections complete`}
      </div>
    </div>
  );
};

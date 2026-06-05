import React, { useCallback, useEffect, useState } from 'react';

interface InfoTooltipProps {
  text: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const show = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    let top = r.top - 120;
    if (top < 8) top = r.bottom + 12;
    let left = r.left + r.width / 2 - 150;
    if (left < 8) left = 8;
    if (left + 300 > window.innerWidth) left = window.innerWidth - 308;
    setPos({ top, left });
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [open]);

  return (
    <>
      <button type="button" className="ob-ca-info-btn" onClick={show} aria-label="More information">
        i
      </button>
      {open && (
        <>
          <div className="ob-ca-tip-overlay" onClick={() => setOpen(false)} role="presentation" />
          <div className="ob-ca-tip-box" style={{ top: pos.top, left: pos.left }}>
            <button type="button" className="ob-ca-tip-close" onClick={() => setOpen(false)} aria-label="Close">
              ✕
            </button>
            {text}
          </div>
        </>
      )}
    </>
  );
};

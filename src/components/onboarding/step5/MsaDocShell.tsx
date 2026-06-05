import React, { useCallback } from 'react';
import { ObArrowRight, trimBtnArrow } from '../ObBtnArrow';

const PRINT_STYLES = `
body{font-family:Georgia,serif;padding:40px 60px;font-size:13px;line-height:1.8;color:#222}
h2{font-size:18px;color:#0a2d6e;margin:24px 0 12px;text-align:center}
h3{font-size:14px;color:#1A1A1A;margin:18px 0 8px}
p{margin-bottom:12px;text-align:justify}
.sub{margin-left:24px}.snum{font-weight:700}.caps{text-transform:uppercase;font-weight:700}
.ack{font-size:15px;font-weight:700;margin:24px 0 10px}
.sigtbl{width:100%;border-collapse:collapse;margin-top:24px}
.sigtbl td{width:50%;vertical-align:top;padding:12px 16px;border-top:1px solid #ccc}
.ff{border:none;border-bottom:1px solid #333;font-family:Georgia,serif;font-size:13px;color:#000;padding:2px 4px}
table.tbl{width:100%;border-collapse:collapse;margin:14px 0;font-size:11px}
table.tbl th,table.tbl td{border:1px solid #888;padding:6px 10px;text-align:left}
table.tbl th{background:#EEE}
table.tbl tr.cur td{background:#EEF6FB;font-weight:600}
`;

export interface MsaDocShellProps {
  docId: string;
  title: string;
  scrollId: string;
  children: React.ReactNode;
  executed: boolean;
  attested: boolean;
  attestedMeta: string | null;
  onAttestChange: (checked: boolean) => void;
  attestLabel: string;
  continueLabel: string;
  onContinue: () => void;
  continueDisabled: boolean;
  downloadFilename: string;
  hideDraftWatermark?: boolean;
}

export const MsaDocShell: React.FC<MsaDocShellProps> = ({
  docId, title, scrollId, children, executed, attested, attestedMeta,
  onAttestChange, attestLabel, continueLabel, onContinue, continueDisabled,
  downloadFilename, hideDraftWatermark,
}) => {
  const handlePrint = useCallback(() => {
    const el = document.getElementById(scrollId);
    if (!el) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>${title}</title><style>${PRINT_STYLES}</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 350);
  }, [scrollId, title]);

  const handleDownload = useCallback(() => {
    const el = document.getElementById(scrollId);
    if (!el) return;
    const header = `${'='.repeat(72)}\nDYAD PRACTICE SOLUTIONS, LLC — EXECUTED AGREEMENT COPY\n${'='.repeat(72)}\nGenerated: ${new Date().toLocaleString('en-US')}\n\n`;
    const blob = new Blob([header + el.innerText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFilename;
    a.click();
    URL.revokeObjectURL(url);
  }, [scrollId, downloadFilename]);

  return (
    <div className="ob-agreement-ao" id={`${docId}-ao`}>
      <div className="ob-agreement-at2">
        <div className="ob-agreement-att">{title}</div>
        <div className="ob-agreement-ata">
          <button type="button" className="ob-agreement-tb" disabled={!attested && !executed} onClick={handlePrint}>
            🖨️ Print{executed ? ' Executed Copy' : ''}
          </button>
          <button type="button" className="ob-agreement-tb" disabled={!attested && !executed} onClick={handleDownload}>
            ⬇️ Download{executed ? ' Executed Copy' : ''}
          </button>
        </div>
      </div>
      <div className={`ob-agreement-secn${executed || attested ? ' ob-agreement-secn-exec' : ''}`}>
        {executed ? (
          <>
            <span className="ob-agreement-secn-icon" aria-hidden>✅</span>
            <span>This document has been <strong>fully executed</strong> via the unified Master Services Agreement signature.</span>
          </>
        ) : (
          <>
            <span className="ob-agreement-secn-icon" aria-hidden>⚠️</span>
            <span>This document has <strong>not been executed</strong>. Complete all attestations and apply the unified signature below.</span>
          </>
        )}
      </div>
      <div className="ob-agreement-asw">
        {!executed && !hideDraftWatermark && (
          <div className="ob-agreement-dwm">DRAFT</div>
        )}
        <div id={scrollId}>{children}</div>
      </div>
      <div className={`ob-ca-dat${attested ? ' ob-ca-dat-checked' : ''}`}>
        <label className="ob-ca-dat-label">
          <input
            type="checkbox"
            checked={attested}
            onChange={e => onAttestChange(e.target.checked)}
          />
          <div>
            <div className="ob-ca-dat-text">{attestLabel}</div>
            {attestedMeta && <div className="ob-ca-dat-meta">{attestedMeta}</div>}
          </div>
        </label>
      </div>
      <div className="ob-agreement-sc2">
        <button type="button" className="ob-agreement-bc2" disabled={continueDisabled} onClick={onContinue}>
          {trimBtnArrow(continueLabel)} <ObArrowRight />
        </button>
      </div>
    </div>
  );
};

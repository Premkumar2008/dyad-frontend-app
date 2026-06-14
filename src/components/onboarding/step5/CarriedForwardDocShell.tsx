import React, { useCallback } from 'react';

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
.ob-agreement-dyad-sig-img,img.ob-agreement-dyad-sig-img{width:220px;max-width:220px;height:auto;max-height:56px;object-fit:contain;display:block}
img[src*="dyad-officer-signature"]{width:220px!important;max-width:220px!important;height:auto!important;max-height:56px!important;object-fit:contain;display:block}
`;

export interface CarriedForwardDocShellProps {
  title: string;
  scrollId: string;
  children: React.ReactNode;
}

export const CarriedForwardDocShell: React.FC<CarriedForwardDocShellProps> = ({
  title,
  scrollId,
  children,
}) => {
  const handlePrint = useCallback(() => {
    const el = document.getElementById(scrollId);
    if (!el) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(
      `<html><head><title>${title}</title><style>${PRINT_STYLES}</style></head><body>${el.innerHTML}</body></html>`,
    );
    w.document.close();
    setTimeout(() => w.print(), 350);
  }, [scrollId, title]);

  return (
    <div className="ob-agreement-ao">
      <div className="ob-agreement-at2">
        <div className="ob-agreement-att">{title}</div>
        <div className="ob-agreement-ata">
          <button type="button" className="ob-agreement-tb" onClick={handlePrint}>
            🖨️ Print / Download
          </button>
        </div>
      </div>
      <div className="ob-agreement-secn ob-agreement-secn-exec">
        <span className="ob-agreement-secn-icon" aria-hidden>✅</span>
        <span>
          This document was <strong>previously executed</strong> in Section 3 and remains binding under
          this Master Services Agreement package.
        </span>
      </div>
      <div className="ob-agreement-asw">
        <div id={scrollId}>{children}</div>
      </div>
    </div>
  );
};

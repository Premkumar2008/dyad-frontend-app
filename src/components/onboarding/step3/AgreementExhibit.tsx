import React, { useCallback } from 'react';
import { ObArrowRight, trimBtnArrow } from '../ObBtnArrow';

const PRINT_STYLES = `
body{font-family:Georgia,serif;padding:40px 60px;font-size:13px;line-height:1.8;color:#222}
h2{font-size:18px;color:#003F7F;margin:24px 0 12px;text-align:center}
p{margin-bottom:12px;text-align:justify}
.ob-agreement-sub,.sub{margin-left:24px}
.ob-agreement-snum,.snum{font-weight:700}
.ob-agreement-caps,.caps{text-transform:uppercase;font-weight:700}
.ob-agreement-ack,.ack{font-size:15px;font-weight:700;margin:24px 0 10px}
.ob-agreement-sigtbl,.sigtbl{width:100%;border-collapse:collapse;margin-top:24px}
.ob-agreement-sigtbl td,.sigtbl td{width:50%;vertical-align:top;padding:12px 16px;border-top:1px solid #ccc}
.ob-agreement-sigtbl td:first-child,.sigtbl td:first-child{border-right:1px solid #ccc}
.ob-agreement-sigp,.sigp{font-weight:700;margin-bottom:8px}
.ob-agreement-sigl,.sigl{border-bottom:1px solid #666;height:36px;margin-bottom:4px}
.ob-agreement-sigll,.sigll{font-size:10px;color:#666}
.ob-agreement-sign,.sign{font-size:12px;margin-top:3px}
.ob-agreement-ff,.ff{border:none;border-bottom:1px solid #333;font-family:Georgia,serif;font-size:13px;color:#000;padding:2px 4px}
.ob-agreement-sigl-dyad,.ob-agreement-sigl.ob-agreement-sigl-dyad{height:auto;min-height:52px;border-bottom:none}
.ob-agreement-dyad-sig-img,img.ob-agreement-dyad-sig-img{width:220px;max-width:220px;height:auto;max-height:56px;object-fit:contain;display:block}
img[src*="dyad-officer-signature"]{width:220px!important;max-width:220px!important;height:auto!important;max-height:56px!important;object-fit:contain;display:block}
`;

const DRAFT_BANNER = (
  <>
    <span className="ob-agreement-secn-icon" aria-hidden>
      ⚠️
    </span>
    <span>
      This document has <strong>not been countersigned</strong> by Dyad Practice Solutions. It is not
      binding until both parties have executed the agreement. The DRAFT watermark will be removed upon
      full execution.
    </span>
  </>
);

const EXECUTED_BANNER = (
  <>
    <span className="ob-agreement-secn-icon" aria-hidden>
      ✅
    </span>
    <span>
      This document has been <strong>fully executed</strong> by both parties. It is now a binding
      agreement.
    </span>
  </>
);

export interface AgreementExhibitProps {
  exhibitId: 'nda' | 'baa';
  title: string;
  scrollId: string;
  children: React.ReactNode;
  accepted: boolean;
  acceptedAt: string | null;
  recordId: string | null;
  onAcceptChange: (accepted: boolean) => void;
  checkboxLabel: string;
  continueLabel: string;
  onContinue: () => void;
  continueDisabled: boolean;
  providerName: string;
}

export const AgreementExhibit: React.FC<AgreementExhibitProps> = ({
  exhibitId,
  title,
  scrollId,
  children,
  accepted,
  acceptedAt,
  recordId,
  onAcceptChange,
  checkboxLabel,
  continueLabel,
  onContinue,
  continueDisabled,
  providerName,
}) => {
  const handlePrint = useCallback(() => {
    const el = document.getElementById(scrollId);
    if (!el) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(
      `<html><head><title>Dyad Practice Solutions - Agreement</title>` +
        `<style>${PRINT_STYLES}</style></head><body>${el.innerHTML}</body></html>`,
    );
    w.document.close();
    w.print();
  }, [scrollId]);

  const timestampText =
    accepted && acceptedAt
      ? `Accepted ${acceptedAt}`
      : null;

  return (
    <div
      className="ob-agreement-ao"
      id={`${exhibitId}-ao`}
      data-provider-name={providerName || undefined}
    >
      <div className="ob-agreement-at2">
        <div className="ob-agreement-att">{title}</div>
        <div className="ob-agreement-ata">
          <button
            type="button"
            className="ob-agreement-tb"
            id={`${exhibitId}-print`}
            disabled={!accepted}
            onClick={handlePrint}
          >
            🖨️ Print / Download
          </button>
        </div>
      </div>

      <div
        className={`ob-agreement-secn${accepted ? ' ob-agreement-secn-exec' : ''}`}
        id={`${exhibitId}-secn`}
      >
        {accepted ? EXECUTED_BANNER : DRAFT_BANNER}
      </div>

      <div className="ob-agreement-asw">
        {!accepted && (
          <div className="ob-agreement-dwm" id={`${exhibitId}-wm`}>
            DRAFT
          </div>
        )}
        <div id={scrollId}>{children}</div>
      </div>

      <div className="ob-agreement-cws">
        <div className="ob-agreement-cwl">
          <strong>Electronic Signature Disclosure</strong> - By checking the box below, you consent to
          use electronic signatures pursuant to the ESIGN Act (15 U.S.C. § 7001 et seq.) and UETA. You
          acknowledge that: (1) you have reviewed the full text of {exhibitId === 'nda' ? 'Exhibit A' : 'Exhibit B'}{' '}
          displayed above; (2) you agree to be legally bound by its terms
          {exhibitId === 'baa' ? ', including all HIPAA obligations' : ''}; (3) your electronic
          acceptance has the same legal effect as a handwritten signature; and (4) you may withdraw
          consent by contacting Dyad in writing
          {exhibitId === 'nda'
            ? ', though withdrawal will not affect agreements already executed'
            : ''}
          .
        </div>
        <label className="ob-agreement-cwcb">
          <input
            type="checkbox"
            id={`${exhibitId}-cb`}
            checked={accepted}
            onChange={(e) => onAcceptChange(e.target.checked)}
          />
          <span className="ob-agreement-cwlab">{checkboxLabel}</span>
        </label>
        {timestampText && (
          <div className="ob-agreement-cwts ob-agreement-cwts-visible" id={`${exhibitId}-ts`}>
            {timestampText}
          </div>
        )}
      </div>

      <div className="ob-agreement-sc2">
        <button
          type="button"
          className="ob-agreement-bc2"
          id={`${exhibitId}-btn`}
          disabled={continueDisabled}
          onClick={onContinue}
        >
          {trimBtnArrow(continueLabel)} <ObArrowRight />
        </button>
      </div>
    </div>
  );
};

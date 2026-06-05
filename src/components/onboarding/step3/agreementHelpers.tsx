import React from 'react';

export const DYAD_OFFICER = {
  name: 'Sroothi Jaikumar',
  title: 'Chief Operating Officer',
} as const;

export const DYAD_SIGNATURE_SRC = '/assets/images/dyad-officer-signature.jpeg';

export interface DyadSignatureBlockProps {
  label?: string;
  showSignature: boolean;
}

export const DyadSignatureBlock: React.FC<DyadSignatureBlockProps> = ({
  label = 'Dyad Practice Solutions, LLC:',
  showSignature,
}) => (
  <>
    <div className="ob-agreement-sigp">{label}</div>
    <div className="ob-agreement-sigl ob-agreement-sigl-dyad">
      {showSignature ? (
        <img
          src={DYAD_SIGNATURE_SRC}
          alt={`Signature of ${DYAD_OFFICER.name}`}
          className="ob-agreement-dyad-sig-img"
        />
      ) : (
        <span className="ob-agreement-dpend">Pending countersignature upon your acceptance</span>
      )}
    </div>
    {showSignature && (
      <>
        <div className="ob-agreement-sigll">By:</div>
        <div className="ob-agreement-sign">Name: {DYAD_OFFICER.name}</div>
        <div className="ob-agreement-sign" style={{ marginTop: 3 }}>
          Title: {DYAD_OFFICER.title}
        </div>
      </>
    )}
  </>
);

export interface AgreementAcceptance {
  text: string;
  recordId: string;
  acceptedAt: Date;
}

export function formatAgreementAcceptance(now: Date = new Date()): AgreementAcceptance {
  const recordId = Math.random().toString(36).slice(2, 11).toUpperCase();
  const text =
    `Accepted ${now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` +
    ` at ${now.toLocaleTimeString('en-US')} — Record ID: ${recordId}`;
  return { text, recordId, acceptedAt: now };
}

export interface AgreementFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: 's' | 'm' | 'l';
  required?: boolean;
}

export const AgreementField: React.FC<AgreementFieldProps> = ({
  id,
  value,
  onChange,
  placeholder,
  className = 'm',
  required,
}) => (
  <input
    type="text"
    id={id}
    className={`ob-agreement-ff ob-agreement-ff-${className}`}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    required={required}
  />
);

export const AgreementSub: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="ob-agreement-sub">{children}</p>
);

export const AgreementSnum: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="ob-agreement-snum">{children}</span>
);

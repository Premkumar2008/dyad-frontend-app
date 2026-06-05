import React from 'react';
import { AgreementField, AgreementSub, AgreementSnum, DyadSignatureBlock } from '../step3/agreementHelpers';
import { FEE_SCHEDULE_TIERS } from './commercialConstants';

const field = (
  id: string,
  value: string,
  onChange: (v: string) => void,
  placeholder: string,
  size: 's' | 'm' | 'l' = 'm',
) => (
  <AgreementField id={id} value={value} onChange={onChange} placeholder={placeholder} className={size} />
);

export interface MsaFieldsProps {
  fields: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
}

export const MsaAgreementBody: React.FC<MsaFieldsProps> = ({ fields, onFieldChange }) => {
  const f = (k: string, ph: string, sz: 's' | 'm' | 'l' = 'm') =>
    field(`msa-${k}`, fields[k] ?? '', v => onFieldChange(k, v), ph, sz);

  return (
    <div className="ob-agreement-asc">
      <h2>MASTER SERVICES AGREEMENT</h2>
      <p>
        This Master Services Agreement (the &ldquo;Agreement&rdquo; or &ldquo;MSA&rdquo;), dated as of{' '}
        {f('edate', 'Effective Date')}, is entered into by and between <strong>Dyad Practice Solutions, LLC</strong>,
        a Delaware limited liability company with principal offices at 2573 Pacific Coast Hwy, Suite A277, Torrance,
        CA 90505 (&ldquo;Dyad&rdquo; or the &ldquo;MSO&rdquo;), and {f('pentity', 'Provider Legal Entity Name', 'l')},
        a {f('ptype', 'entity type', 'm')} organized under the laws of {f('pstate', 'State', 's')}, with a principal
        place of business at {f('paddr', 'Provider Address', 'l')} (the &ldquo;Provider&rdquo;).
      </p>
      <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700, margin: '18px 0 8px' }}>RECITALS</h3>
      <p><strong>WHEREAS</strong>, Dyad is a physician enablement company that provides administrative, revenue cycle, credentialing, payer enrollment, contracting, technology enablement, and related non-clinical management services to medical practices;</p>
      <p><strong>WHEREAS</strong>, the Provider operates a medical practice and wishes to engage Dyad to provide the services described in Exhibit C (Scope of Services) in accordance with the fees set forth in Exhibit D (Fee Schedule);</p>
      <p><strong>WHEREAS</strong>, the Parties have previously executed Exhibit A (Confidentiality Agreement) and Exhibit B (Business Associate Agreement), each incorporated by reference; and</p>
      <p><strong>NOW, THEREFORE</strong>, in consideration of the mutual covenants herein, the Parties agree as follows:</p>

      <AgreementSub><AgreementSnum>1. Engagement and Scope of Services.</AgreementSnum></AgreementSub>
      <AgreementSub>(a) <strong>Engagement.</strong> The Provider engages Dyad to perform the services in <em>Exhibit C</em> on the terms of this Agreement and Exhibits.</AgreementSub>
      <AgreementSub>(b) <strong>Non-Clinical Nature.</strong> The Services are administrative and operational and do not include the practice of medicine. The Provider retains exclusive control over all clinical decisions.</AgreementSub>
      <AgreementSub>(c) <strong>Independent Contractor.</strong> Dyad performs the Services as an independent contractor.</AgreementSub>

      <AgreementSub><AgreementSnum>2. Term and Termination.</AgreementSnum></AgreementSub>
      <AgreementSub>(a) <strong>Initial Term.</strong> Three (3) years from the Effective Date unless earlier terminated.</AgreementSub>
      <AgreementSub>(b) <strong>Renewal.</strong> Automatic one (1) year renewals unless either Party provides ninety (90) days&apos; notice of non-renewal.</AgreementSub>
      <AgreementSub>(c) <strong>Termination for Convenience.</strong> Either Party may terminate upon one hundred eighty (180) days&apos; prior written notice.</AgreementSub>
      <AgreementSub>(d) <strong>Termination for Cause.</strong> Immediate termination for material breach uncured within thirty (30) days, insolvency, or program exclusion.</AgreementSub>

      <AgreementSub><AgreementSnum>3. Fees and Payment.</AgreementSnum></AgreementSub>
      <AgreementSub>(a) Fees are set forth in <em>Exhibit D (Fee Schedule)</em>. (b) Onboarding fee invoiced upon execution. (c) Monthly fees deducted from lockbox prior to weekly sweep. (d) Minimum monthly fees apply by claims volume tier. (e) Pre-approved pass-through expenses reimbursed at cost.</AgreementSub>

      <AgreementSub><AgreementSnum>4. Provider Responsibilities.</AgreementSnum></AgreementSub>
      <AgreementSub>The Provider will furnish timely documentation, maintain licenses and enrollments, comply with applicable law, and provide reasonable access to personnel and systems.</AgreementSub>

      <AgreementSub><AgreementSnum>5. Confidentiality and PHI.</AgreementSnum></AgreementSub>
      <AgreementSub>Exhibits A and B remain in full force. Exhibit B controls with respect to PHI.</AgreementSub>

      <AgreementSub><AgreementSnum>6–11. Intellectual Property; Liability; Indemnification; Compliance; Governing Law; Miscellaneous.</AgreementSnum></AgreementSub>
      <AgreementSub>Standard mutual provisions including California governing law, AAA arbitration in Los Angeles, limitation of liability cap equal to twelve (12) months of fees, and entire agreement clause with Exhibit precedence.</AgreementSub>

      <p className="ob-agreement-ack"><strong>Acknowledgment and Incorporation</strong></p>
      <p>By executing this Agreement, the Parties acknowledge review of the MSA and all incorporated Exhibits, including Exhibit A, Exhibit B, Exhibit C, and Exhibit D (Fee Schedule).</p>
      <p style={{ marginTop: 24, fontWeight: 600 }}>
        IN WITNESS WHEREOF, the Parties execute this Agreement through the unified electronic signature at the bottom of this enrollment screen.
      </p>
    </div>
  );
};

export const ExhibitCBody: React.FC<MsaFieldsProps> = ({ fields, onFieldChange }) => {
  const f = (k: string, ph: string, sz: 's' | 'm' | 'l' = 'm') =>
    field(`exc-${k}`, fields[k] ?? '', v => onFieldChange(k, v), ph, sz);

  return (
    <div className="ob-agreement-asc">
      <h2>EXHIBIT C: SCOPE OF SERVICES</h2>
      <p>
        This Exhibit C is attached to the MSA between <strong>Dyad Practice Solutions, LLC</strong> and{' '}
        {f('pentity', 'Provider Legal Entity Name', 'l')}, effective as of {f('edate', 'Effective Date')}.
      </p>
      <p>The Services are administrative and operational in nature and do not include the practice of medicine.</p>
      <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700 }}>Article 1. Core Service Categories</h3>
      <AgreementSub><AgreementSnum>1.1 Provider Credentialing &amp; Payer Enrollment.</AgreementSnum> NCQA-certified credentialing, CAQH management, and payer enrollment/revalidation.</AgreementSub>
      <AgreementSub><AgreementSnum>1.2 Revenue Cycle Management.</AgreementSnum> Charge capture, claims submission, payment posting, denials, AR follow-up, patient billing, refunds, and write-off management.</AgreementSub>
      <AgreementSub><AgreementSnum>1.3 Payer Contracting Support.</AgreementSnum> Contract analysis, fee schedule management, underpayment identification, and value-based reporting.</AgreementSub>
      <AgreementSub><AgreementSnum>1.4 Technology &amp; Reporting.</AgreementSnum> Analytics platform access, monthly reporting, ad-hoc reports, and quarterly business reviews.</AgreementSub>
      <AgreementSub><AgreementSnum>1.5 Banking &amp; Lockbox Operations.</AgreementSnum> Lockbox administration, remittance processing, weekly ACH sweeps, and real-time visibility.</AgreementSub>
      <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700 }}>Article 2. Service Levels</h3>
      <AgreementSub>Claims within one (1) business day; payment posting within one (1) business day for ERA; denial work within five (5) business days; credentialing within ten (10) business days.</AgreementSub>
      <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700 }}>Article 3. Excluded Services</h3>
      <AgreementSub>EHR implementation, legal services, marketing, HR/payroll, tax preparation, and any service constituting the practice of medicine are excluded unless separately agreed.</AgreementSub>
      <p className="ob-agreement-ack"><strong>Acknowledgment.</strong> The Scope of Services is consistent with the Commercial Alignment package reviewed in Section 5.</p>
    </div>
  );
};

export const FeeScheduleBody: React.FC<MsaFieldsProps> = ({ fields, onFieldChange }) => {
  const f = (k: string, ph: string, sz: 's' | 'm' | 'l' = 'm') =>
    field(`exd-${k}`, fields[k] ?? '', v => onFieldChange(k, v), ph, sz);

  return (
    <div className="ob-agreement-asc">
      <h2>FEE SCHEDULE</h2>
      <p>
        This Fee Schedule is incorporated into the MSA between <strong>Dyad Practice Solutions, LLC</strong> and{' '}
        {f('pentity', 'Provider Legal Entity Name', 'l')}, effective as of {f('edate', 'Effective Date')}.
      </p>
      <AgreementSub><AgreementSnum>1.1 Onboarding Fee.</AgreementSnum> One-time onboarding fee of <strong>$8,000.00 USD</strong>, due within fifteen (15) business days of invoice.</AgreementSub>
      <AgreementSub><AgreementSnum>2.1 Collections Fee.</AgreementSnum> Monthly service fee equal to <strong>4.5%</strong> of net collections processed through the Dyad lockbox.</AgreementSub>
      <AgreementSub><AgreementSnum>2.2 Minimum Monthly Fee.</AgreementSnum> Minimum monthly fee based on claims volume tier:</AgreementSub>
      <table className="ob-ca-fee-tbl">
        <thead>
          <tr><th>Tier</th><th>Average Monthly Claims Volume</th><th>Minimum Monthly Fee</th></tr>
        </thead>
        <tbody>
          {FEE_SCHEDULE_TIERS.map(row => (
            <tr key={row.tier} className={row.current ? 'ob-ca-fee-tbl-cur' : ''}>
              <td>{row.current ? `${row.tier === 2 ? 'Tier 2 — Provider\'s Current Tier' : `Tier ${row.tier}`}` : `Tier ${row.tier}`}</td>
              <td>{row.range}</td>
              <td><strong>{row.minFee}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
      <AgreementSub><AgreementSnum>3. Pass-Through Costs.</AgreementSnum> Payer enrollment fees, credentialing fees, and pre-approved third-party costs at actual cost without markup.</AgreementSub>
      <AgreementSub><AgreementSnum>5. CPI Adjustment.</AgreementSnum> Annual adjustment capped at the lesser of CPI-U change or three percent (3%).</AgreementSub>
      <p className="ob-agreement-ack"><strong>Acknowledgment.</strong> This Fee Schedule reflects the Tier 2 minimum, 4.5% collections rate, and $8,000 onboarding fee reviewed during Commercial Alignment.</p>
    </div>
  );
};

export interface CarriedExhibitProps {
  exhibit: 'A' | 'B';
  entityName: string;
  signerName: string;
  signerTitle: string;
  recordId: string;
  acceptedAt: string;
  showDyadSignature: boolean;
  ndaFields?: Record<string, string>;
}

export const CarriedForwardExhibit: React.FC<CarriedExhibitProps> = ({
  exhibit, entityName, signerName, signerTitle, recordId, acceptedAt, showDyadSignature, ndaFields,
}) => {
  const isA = exhibit === 'A';
  const title = isA ? 'EXHIBIT A: CONFIDENTIALITY AGREEMENT' : 'EXHIBIT B: BUSINESS ASSOCIATE AGREEMENT (BAA)';
  const edate = ndaFields?.edate || acceptedAt.split(' at ')[0] || '—';

  return (
    <div className="ob-agreement-asc ob-ca-carried-scroll">
      <h2>{title}</h2>
      <div className="ob-ca-carried-badge">— Previously Executed in Section 3 —</div>
      <p>
        {isA ? (
          <>This Confidentiality Agreement was executed between Dyad Practice Solutions LLC and <strong>{entityName}</strong>, effective {edate}.</>
        ) : (
          <>This Business Associate Agreement was executed between Dyad Practice Solutions, LLC and <strong>{entityName}</strong>, effective {edate}.</>
        )}
      </p>
      <p style={{ fontStyle: 'italic', color: '#666', textAlign: 'center' }}>
        Full agreement text is preserved in the executed copy from Section 3 and available for download.
      </p>
      <table className="ob-agreement-sigtbl">
        <tbody>
          <tr>
            <td>
              <div className="ob-agreement-sigp">{isA ? 'Provider' : 'Covered Entity'}: {entityName}</div>
              <div className="ob-agreement-sigl" style={{ borderBottomColor: '#2E7D32' }}>
                <span className="ob-ca-sig-cursive">{signerName}</span>
              </div>
              <div className="ob-agreement-sigll">By: Authorized Signatory</div>
              <div className="ob-agreement-sign">Name: {signerName}</div>
              <div className="ob-agreement-sign">Title: {signerTitle}</div>
              <div className="ob-ca-exec-ts">Executed electronically — Record ID: {recordId}</div>
            </td>
            <td>
              <DyadSignatureBlock
                label={isA ? 'Dyad Practice Solutions, LLC:' : 'Business Associate: Dyad Practice Solutions, LLC'}
                showSignature={showDyadSignature}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

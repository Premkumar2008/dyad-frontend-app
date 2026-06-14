import React from 'react';
import { AgreementField, AgreementSub, AgreementSnum } from '../step3/agreementHelpers';
import { NdaExhibitA } from '../step3/NdaExhibitA';
import { BaaExhibitB } from '../step3/BaaExhibitB';
import { CarriedForwardDocShell } from './CarriedForwardDocShell';
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
        place of business at {f('paddr', 'Provider Address', 'l')} (the &ldquo;Provider&rdquo;) (each a &ldquo;Party&rdquo; and collectively the &ldquo;Parties&rdquo;).
      </p>
      <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700, margin: '18px 0 8px' }}>RECITALS</h3>
      <p><strong>WHEREAS</strong>, Dyad is a physician enablement company that provides administrative, revenue cycle, credentialing, payer enrollment, contracting, technology enablement, and related non-clinical management services to medical practices and other health care providers;</p>
      <p><strong>WHEREAS</strong>, the Provider operates a medical practice and wishes to engage Dyad to provide the services described in Exhibit C (Scope of Services) in accordance with the fees set forth in Exhibit D (Fee Schedule);</p>
      <p><strong>WHEREAS</strong>, the Parties have previously executed Exhibit A (Confidentiality Agreement) and Exhibit B (Business Associate Agreement), each of which is incorporated by reference into this Agreement and continues in full force and effect; and</p>
      <p><strong>WHEREAS</strong>, the Parties intend that this Agreement, together with all Exhibits attached hereto, will constitute the complete and exclusive understanding of the Parties with respect to the services contemplated herein.</p>
      <p><strong>NOW, THEREFORE</strong>, in consideration of the mutual covenants and agreements set forth herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:</p>

      <AgreementSub><AgreementSnum>1. Engagement and Scope of Services.</AgreementSnum></AgreementSub>
      <AgreementSub>(a) <strong>Engagement.</strong> The Provider hereby engages Dyad, and Dyad hereby accepts such engagement, to perform the services described in <em>Exhibit C (Scope of Services)</em> attached hereto (the &ldquo;Services&rdquo;), on the terms and conditions set forth in this Agreement and the Exhibits.</AgreementSub>
      <AgreementSub>(b) <strong>Non-Clinical Nature.</strong> The Services are administrative and operational in nature and do not include the practice of medicine, the exercise of clinical judgment, or any activity that would constitute the corporate practice of medicine under applicable state law. The Provider retains exclusive control over all clinical, professional, and medical decisions affecting patient care.</AgreementSub>
      <AgreementSub>(c) <strong>Independent Contractor Relationship.</strong> Dyad performs the Services as an independent contractor. Nothing in this Agreement creates an employer-employee, partnership, joint venture, or agency relationship between the Parties, except as expressly set forth in a Limited Power of Attorney executed in connection with banking and lockbox operations.</AgreementSub>

      <AgreementSub><AgreementSnum>2. Term and Termination.</AgreementSnum></AgreementSub>
      <AgreementSub>(a) <strong>Initial Term.</strong> This Agreement commences on the Effective Date and continues for an initial term of three (3) years (the &ldquo;Initial Term&rdquo;), unless earlier terminated in accordance with this Section.</AgreementSub>
      <AgreementSub>(b) <strong>Renewal.</strong> Following the Initial Term, this Agreement automatically renews for successive one (1) year periods (each, a &ldquo;Renewal Term&rdquo;) unless either Party provides written notice of non-renewal at least ninety (90) days prior to the end of the then-current term.</AgreementSub>
      <AgreementSub>(c) <strong>Termination for Convenience.</strong> Either Party may terminate this Agreement for convenience upon one hundred eighty (180) days&apos; prior written notice to the other Party.</AgreementSub>
      <AgreementSub>(d) <strong>Termination for Cause.</strong> Either Party may terminate this Agreement immediately upon written notice if the other Party (i) materially breaches this Agreement and fails to cure such breach within thirty (30) days of written notice; (ii) becomes insolvent, files for bankruptcy, or makes an assignment for the benefit of creditors; or (iii) is excluded, debarred, or suspended from participation in any federal or state health care program.</AgreementSub>
      <AgreementSub>(e) <strong>Effect of Termination.</strong> Upon termination, Dyad will (i) cooperate with the Provider in transitioning Services to a successor provider; (ii) deliver to the Provider all data, records, and materials owned by the Provider; and (iii) settle any outstanding amounts due in accordance with Exhibit D.</AgreementSub>

      <AgreementSub><AgreementSnum>3. Fees and Payment.</AgreementSnum></AgreementSub>
      <AgreementSub>(a) <strong>Fee Schedule.</strong> The Provider will pay Dyad the fees set forth in <em>Exhibit D (Fee Schedule)</em>, which is incorporated by reference and forms a material part of this Agreement.</AgreementSub>
      <AgreementSub>(b) <strong>Onboarding Fee.</strong> A one-time onboarding fee, as specified in Exhibit D, is invoiced upon execution of this Agreement and is due within fifteen (15) business days of invoice issuance.</AgreementSub>
      <AgreementSub>(c) <strong>Monthly Service Fees.</strong> Monthly service fees are calculated as set forth in Exhibit D and are deducted from collected revenue in the Dyad-administered lockbox account prior to the weekly sweep to the Provider&apos;s Designated Operating Account, in accordance with the Limited Power of Attorney executed in Section 7 (Banking and Payment Setup).</AgreementSub>
      <AgreementSub>(d) <strong>Minimum Monthly Fees.</strong> The Provider acknowledges that minimum monthly fees apply based on the Provider&apos;s claims volume tier as set forth in Exhibit D, regardless of actual collections in any given month.</AgreementSub>
      <AgreementSub>(e) <strong>Expense Reimbursement.</strong> Dyad will be reimbursed for pre-approved out-of-pocket expenses, including but not limited to payer-imposed enrollment fees, credentialing application fees, and third-party software licenses procured on the Provider&apos;s behalf.</AgreementSub>
      <AgreementSub>(f) <strong>Disputes.</strong> The Provider may dispute any invoice in writing within five (5) business days of receipt. Disputed amounts will not be debited until resolved; undisputed amounts will be processed in accordance with the ACH Authorization Agreement executed in Section 7.</AgreementSub>

      <AgreementSub><AgreementSnum>4. Provider Responsibilities.</AgreementSnum></AgreementSub>
      <AgreementSub>(a) The Provider will (i) timely furnish to Dyad all clinical documentation, encounter data, and other information necessary for Dyad to perform the Services; (ii) maintain all licenses, certifications, accreditations, and payer enrollments required to operate the practice; (iii) comply with all applicable laws and professional standards governing the practice of medicine; and (iv) provide reasonable access to Provider personnel, systems, and facilities as needed for Dyad to perform the Services.</AgreementSub>
      <AgreementSub>(b) The Provider acknowledges that the quality and timeliness of the Services depend in material part on the quality and timeliness of the documentation and information furnished by the Provider.</AgreementSub>

      <AgreementSub><AgreementSnum>5. Confidentiality and PHI.</AgreementSnum></AgreementSub>
      <AgreementSub>(a) The Confidentiality Agreement set forth in <em>Exhibit A</em> and the Business Associate Agreement set forth in <em>Exhibit B</em> are each incorporated into this Agreement by reference and continue in full force and effect for the duration of this Agreement and any survival period specified therein.</AgreementSub>
      <AgreementSub>(b) In the event of any conflict between this Agreement and Exhibit B with respect to the handling of Protected Health Information, Exhibit B controls.</AgreementSub>

      <AgreementSub><AgreementSnum>6. Intellectual Property.</AgreementSnum></AgreementSub>
      <AgreementSub>(a) <strong>Provider Data.</strong> All clinical records, patient data, financial data of the Provider, and business records owned by the Provider prior to or during the Term remain the sole property of the Provider.</AgreementSub>
      <AgreementSub>(b) <strong>Dyad IP.</strong> All methodologies, workflows, software, tools, reports, dashboards, analytics, and other materials developed by Dyad in connection with the Services, including any derivative works, remain the exclusive property of Dyad, subject to the limited license granted to the Provider in Section 6(c).</AgreementSub>
      <AgreementSub>(c) <strong>License to Provider.</strong> Dyad grants the Provider a non-exclusive, non-transferable, royalty-free license to use the Dyad reports, dashboards, and analytics provided in connection with the Services solely for the Provider&apos;s internal business purposes during the Term.</AgreementSub>

      <AgreementSub><AgreementSnum>7. Limitation of Liability.</AgreementSnum></AgreementSub>
      <AgreementSub>(a) <strong>Exclusion of Consequential Damages.</strong> Except in connection with a breach of confidentiality or HIPAA obligations or a Party&apos;s indemnification obligations under Section 8, in no event will either Party be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages.</AgreementSub>
      <AgreementSub>(b) <strong>Cap on Liability.</strong> Except in connection with a breach of confidentiality or HIPAA obligations, a Party&apos;s gross negligence or willful misconduct, or a Party&apos;s indemnification obligations under Section 8, each Party&apos;s aggregate liability under this Agreement will not exceed the total fees paid by the Provider to Dyad in the twelve (12) months immediately preceding the event giving rise to the claim.</AgreementSub>

      <AgreementSub><AgreementSnum>8. Indemnification.</AgreementSnum></AgreementSub>
      <AgreementSub>(a) <strong>By Dyad.</strong> Dyad will indemnify, defend, and hold harmless the Provider from and against any third-party claims arising out of (i) Dyad&apos;s gross negligence or willful misconduct in performing the Services; (ii) Dyad&apos;s breach of Exhibit B (BAA); or (iii) Dyad&apos;s infringement of any third-party intellectual property right.</AgreementSub>
      <AgreementSub>(b) <strong>By Provider.</strong> The Provider will indemnify, defend, and hold harmless Dyad from and against any third-party claims arising out of (i) the practice of medicine or clinical care delivered by the Provider; (ii) the Provider&apos;s breach of this Agreement; or (iii) any inaccuracy in clinical documentation furnished by the Provider.</AgreementSub>

      <AgreementSub><AgreementSnum>9. Compliance with Laws.</AgreementSnum></AgreementSub>
      <AgreementSub>The Parties will each comply with all applicable federal, state, and local laws and regulations in performing their respective obligations under this Agreement, including but not limited to the Stark Law (42 U.S.C. § 1395nn), the Anti-Kickback Statute (42 U.S.C. § 1320a-7b(b)), the False Claims Act (31 U.S.C. §§ 3729-3733), HIPAA, the Electronic Fund Transfer Act, NACHA Operating Rules, and applicable state corporate practice of medicine and fee-splitting laws.</AgreementSub>

      <AgreementSub><AgreementSnum>10. Governing Law and Dispute Resolution.</AgreementSnum></AgreementSub>
      <AgreementSub>This Agreement is governed by the laws of the State of California, without regard to its conflict of laws principles. Any dispute arising out of or relating to this Agreement that cannot be resolved through good-faith negotiation within thirty (30) days will be submitted to binding arbitration in Los Angeles, California under the Commercial Arbitration Rules of the American Arbitration Association. <span className="ob-agreement-caps">Each Party hereby irrevocably waives its right to a trial by jury in any action arising out of or relating to this Agreement.</span></AgreementSub>

      <AgreementSub><AgreementSnum>11. Miscellaneous.</AgreementSnum></AgreementSub>
      <AgreementSub>(a) <strong>Entire Agreement.</strong> This Agreement, together with all Exhibits, constitutes the entire understanding of the Parties with respect to the subject matter and supersedes all prior agreements, written or oral. (b) <strong>Amendment.</strong> No amendment is effective unless in writing and signed by both Parties. (c) <strong>Assignment.</strong> Neither Party may assign this Agreement without the other Party&apos;s prior written consent, except in connection with a merger, acquisition, or sale of substantially all assets. (d) <strong>Notices.</strong> Notices must be in writing and delivered to the addresses in the preamble by personal delivery, nationally recognized overnight courier, or certified mail. (e) <strong>Severability.</strong> If any provision is held invalid, the remaining provisions will continue in full force. (f) <strong>Counterparts.</strong> This Agreement may be executed in counterparts, including electronic counterparts, each of which is deemed an original. (g) <strong>Order of Precedence.</strong> In the event of conflict between this Agreement and any Exhibit, the Exhibit controls with respect to its specific subject matter, except that Exhibit B controls with respect to PHI.</AgreementSub>

      <p className="ob-agreement-ack"><strong>Acknowledgment and Incorporation</strong></p>
      <p>By executing this Agreement, the Parties acknowledge that they have reviewed, understood, and agreed to the terms of the Master Services Agreement and all Exhibits incorporated by reference, including Exhibit A (Confidentiality Agreement), Exhibit B (Business Associate Agreement), Exhibit C (Scope of Services), and Exhibit D (Fee Schedule).</p>
      <p style={{ marginTop: 24, fontWeight: 600 }}>
        IN WITNESS WHEREOF, the Parties hereto have executed this Agreement as of the Effective Date through the unified electronic signature applied at the bottom of this enrollment screen.
      </p>
    </div>
  );
};

const exhibitHeading = { fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700, margin: '18px 0 8px' } as const;

export const ExhibitCBody: React.FC<MsaFieldsProps> = ({ fields, onFieldChange }) => {
  const f = (k: string, ph: string, sz: 's' | 'm' | 'l' = 'm') =>
    field(`exc-${k}`, fields[k] ?? '', v => onFieldChange(k, v), ph, sz);

  return (
    <div className="ob-agreement-asc">
      <h2>EXHIBIT C: SCOPE OF SERVICES</h2>
      <p>
        This Exhibit C (Scope of Services) is attached to and incorporated by reference into the Master Services Agreement (the &ldquo;MSA&rdquo;) between{' '}
        <strong>Dyad Practice Solutions, LLC</strong> (&ldquo;Dyad&rdquo; or the &ldquo;MSO&rdquo;) and{' '}
        {f('pentity', 'Provider Legal Entity Name', 'l')} (the &ldquo;Provider&rdquo;), effective as of{' '}
        {f('edate', 'Effective Date')} (the &ldquo;Effective Date&rdquo;).
      </p>
      <p>
        The Services described herein are administrative and operational in nature and do not include the practice of medicine or the exercise of clinical judgment. All Services are performed in accordance with the terms of the MSA and applicable law.
      </p>

      <h3 style={exhibitHeading}>Article 1. Core Service Categories</h3>
      <AgreementSub><AgreementSnum>1.1 Provider Credentialing &amp; Payer Enrollment.</AgreementSnum></AgreementSub>
      <AgreementSub>
        Dyad will perform NCQA-certified provider credentialing, including primary-source verification, CAQH roster management, enrollment packet generation, and submission to payers. Services include initial payer enrollment, periodic revalidation, and roster updates across all contracted commercial, Medicare, and Medicaid payers.
      </AgreementSub>

      <AgreementSub><AgreementSnum>1.2 Revenue Cycle Management.</AgreementSnum></AgreementSub>
      <AgreementSub>Dyad will manage the end-to-end revenue cycle for the Provider, including:</AgreementSub>
      <AgreementSub>(a) <strong>Charge Capture &amp; Coding Review.</strong> Specialty-specific coding validation, including units, modifiers, concurrency review, and documentation checks. Fully digital case intake with no paper, scanning, or re-keying.</AgreementSub>
      <AgreementSub>(b) <strong>Claims Submission &amp; Clearinghouse Management.</strong> Same-day electronic submission with payer-specific clean-claim edits. End-to-end status visibility from submission through adjudication.</AgreementSub>
      <AgreementSub>(c) <strong>Payment Posting &amp; Reconciliation.</strong> Electronic remittance advice (ERA) processing, automated payment posting, and bank-to-book reconciliation against the Dyad lockbox account.</AgreementSub>
      <AgreementSub>(d) <strong>Denials Management &amp; Appeals.</strong> Root-cause analysis of denials, payer-specific appeals workflows, and tracking through resolution.</AgreementSub>
      <AgreementSub>(e) <strong>Accounts Receivable Follow-Up.</strong> Aged AR work-down with payer-specific outreach cadences and escalation paths.</AgreementSub>
      <AgreementSub>(f) <strong>Patient Billing &amp; Statements.</strong> Patient statement generation, balance reconciliation, and integration with patient payment portals.</AgreementSub>
      <AgreementSub>(g) <strong>Refunds &amp; Adjustments.</strong> Processing of payer-driven and patient-driven refunds in accordance with applicable law.</AgreementSub>
      <AgreementSub>(h) <strong>Bad Debt &amp; Write-Off Management.</strong> Documented write-off workflows with Provider approval thresholds.</AgreementSub>

      <AgreementSub><AgreementSnum>1.3 Payer Contracting Support.</AgreementSnum></AgreementSub>
      <AgreementSub>Dyad will provide:</AgreementSub>
      <AgreementSub>(a) <strong>Contract Analysis &amp; Negotiation Support.</strong> Payer and contract-level performance analysis with data-driven benchmarks to support renegotiation of underperforming agreements.</AgreementSub>
      <AgreementSub>(b) <strong>Fee Schedule Management.</strong> Loading and maintenance of payer-specific fee schedules in the Provider&apos;s practice management system.</AgreementSub>
      <AgreementSub>(c) <strong>Underpayment Identification.</strong> Systematic identification of underpayments against contracted rates with payer recovery workflows.</AgreementSub>
      <AgreementSub>(d) <strong>Value-Based Care Reporting.</strong> Where applicable, support for value-based care contract reporting and performance tracking.</AgreementSub>

      <AgreementSub><AgreementSnum>1.4 Technology &amp; Reporting.</AgreementSnum></AgreementSub>
      <AgreementSub>Dyad will provide:</AgreementSub>
      <AgreementSub>(a) Access to the Dyad analytics platform with role-based dashboards for the Provider&apos;s administrators, providers, and ownership.</AgreementSub>
      <AgreementSub>(b) Standard monthly financial and operational reporting packages, including collections by payer, days in AR, denial rate, clean claim rate, and net collection rate.</AgreementSub>
      <AgreementSub>(c) On-demand ad-hoc reporting for Provider-specific business questions, up to four (4) reports per quarter at no additional charge.</AgreementSub>
      <AgreementSub>(d) Quarterly business reviews with the Provider&apos;s leadership to review performance, identify opportunities, and align on priorities.</AgreementSub>

      <AgreementSub><AgreementSnum>1.5 Banking &amp; Lockbox Operations.</AgreementSnum></AgreementSub>
      <AgreementSub>Pursuant to the Limited Power of Attorney executed under Section 7 of enrollment, Dyad will:</AgreementSub>
      <AgreementSub>(a) Open, establish, and administer a dedicated lockbox deposit account at Live Oak Banking Company, N.A. through the Anatomy Financial platform in the name of the Provider.</AgreementSub>
      <AgreementSub>(b) Receive and process payer remittances, patient payments, and other deposits into the Lockbox Account.</AgreementSub>
      <AgreementSub>(c) Initiate weekly ACH sweeps of collected funds, net of Dyad service fees, to the Provider&apos;s Designated Operating Account.</AgreementSub>
      <AgreementSub>(d) Maintain real-time visibility into the Lockbox Account through the Dyad reporting platform.</AgreementSub>

      <h3 style={exhibitHeading}>Article 2. Service Levels &amp; Performance Standards</h3>
      <AgreementSub><AgreementSnum>2.1 Claims Submission.</AgreementSnum> Dyad will submit clean claims within one (1) business day of receipt of complete charge documentation from the Provider, subject to payer-specific submission windows.</AgreementSub>
      <AgreementSub><AgreementSnum>2.2 Payment Posting.</AgreementSnum> Dyad will post ERA-based payments within one (1) business day of receipt of the remittance file. Manual payments (non-ERA) will be posted within three (3) business days.</AgreementSub>
      <AgreementSub><AgreementSnum>2.3 Denials Work.</AgreementSnum> Dyad will initiate denial root-cause analysis within five (5) business days of denial receipt and submit first-level appeals within fifteen (15) business days where appeals are warranted.</AgreementSub>
      <AgreementSub><AgreementSnum>2.4 Aged AR.</AgreementSnum> Dyad will work all AR aged greater than thirty (30) days on a rolling basis with payer-specific outreach cadences. Target days-in-AR for commercial claims is forty (40) days.</AgreementSub>
      <AgreementSub><AgreementSnum>2.5 Credentialing Turnaround.</AgreementSnum> Dyad will submit initial credentialing applications to payers within ten (10) business days of receipt of complete provider data and supporting documentation from the Provider.</AgreementSub>
      <AgreementSub><AgreementSnum>2.6 Performance Reviews.</AgreementSnum> Service-level performance will be reviewed quarterly with the Provider as part of the business review process. Failure to meet a service level for two (2) consecutive quarters constitutes a material breach subject to the cure provisions of Section 2(d) of the MSA.</AgreementSub>

      <h3 style={exhibitHeading}>Article 3. Excluded Services</h3>
      <AgreementSub>The following are <em>not</em> included in the Scope of Services and, if requested, will be subject to a separate written addendum and additional fees:</AgreementSub>
      <AgreementSub>(a) Practice management software implementation, replacement, or major customization beyond standard onboarding.</AgreementSub>
      <AgreementSub>(b) Electronic Health Record (EHR) implementation, replacement, or migration.</AgreementSub>
      <AgreementSub>(c) Clinical documentation improvement (CDI) services other than routine coding feedback.</AgreementSub>
      <AgreementSub>(d) Legal services, including but not limited to payer dispute litigation, contract drafting, or regulatory representation.</AgreementSub>
      <AgreementSub>(e) Marketing, patient acquisition, or business development services.</AgreementSub>
      <AgreementSub>(f) Real estate, leasing, or facility management services.</AgreementSub>
      <AgreementSub>(g) Human resources, payroll, or benefits administration.</AgreementSub>
      <AgreementSub>(h) Tax preparation, accounting, or audit services.</AgreementSub>
      <AgreementSub>(i) Any service that would constitute the practice of medicine or the exercise of clinical judgment.</AgreementSub>

      <h3 style={exhibitHeading}>Article 4. Provider Responsibilities Specific to Services</h3>
      <AgreementSub>In addition to the responsibilities set forth in Section 4 of the MSA, the Provider will:</AgreementSub>
      <AgreementSub>(a) Furnish complete and accurate charge documentation, encounter forms, and clinical notes within two (2) business days of the date of service.</AgreementSub>
      <AgreementSub>(b) Maintain current and complete provider rosters, including CAQH profiles, NPI registrations, and state licensure.</AgreementSub>
      <AgreementSub>(c) Provide Dyad with electronic access to the practice management system, the EHR, the clearinghouse portal, and payer portals as needed to perform the Services.</AgreementSub>
      <AgreementSub>(d) Designate a single point of contact at the practice for day-to-day coordination with Dyad operations.</AgreementSub>
      <AgreementSub>(e) Respond to Dyad requests for clinical documentation clarification within three (3) business days.</AgreementSub>
      <AgreementSub>(f) Notify Dyad in advance of any change in practice structure, ownership, locations, providers, or service lines that may affect the Services.</AgreementSub>

      <p className="ob-agreement-ack" style={{ marginTop: 24 }}>
        <strong>Acknowledgment.</strong> The Scope of Services described in this Exhibit C is consistent with the services reviewed and agreed to during the Commercial Alignment phase of enrollment (Section 5). This Exhibit C is incorporated by reference into the Master Services Agreement and will be executed via the unified signature at the bottom of this enrollment screen.
      </p>
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
        This Fee Schedule is attached to and incorporated by reference into the Master Services Agreement (the &ldquo;MSA&rdquo;) between{' '}
        <strong>Dyad Practice Solutions, LLC</strong> (&ldquo;Dyad&rdquo;) and{' '}
        {f('pentity', 'Provider Legal Entity Name', 'l')} (the &ldquo;Provider&rdquo;), effective as of {f('edate', 'Effective Date')}.
      </p>
      <p>
        The fees set forth below are based on the Provider&apos;s claims volume tier and the package of Services described in Exhibit C. All fees are stated in U.S. dollars and exclude applicable taxes. Capitalized terms used but not defined herein have the meanings set forth in the MSA.
      </p>

      <h3 style={exhibitHeading}>Article 1. Onboarding Fee</h3>
      <AgreementSub>
        <AgreementSnum>1.1 One-Time Onboarding Fee.</AgreementSnum> The Provider will pay Dyad a one-time onboarding fee of <strong>$8,000.00 USD</strong> (the &ldquo;Onboarding Fee&rdquo;). The Onboarding Fee is invoiced upon execution of the MSA and is due within fifteen (15) business days of invoice issuance, payable via the ACH Authorization Agreement executed in connection with Section 7 (Banking and Payment Setup).
      </AgreementSub>
      <AgreementSub><AgreementSnum>1.2 Onboarding Activities.</AgreementSnum> The Onboarding Fee covers:</AgreementSub>
      <AgreementSub>(a) Practice management system integration and data migration setup;</AgreementSub>
      <AgreementSub>(b) Initial credentialing and payer enrollment for up to ten (10) providers;</AgreementSub>
      <AgreementSub>(c) Lockbox account establishment at Live Oak Banking Company, N.A. through the Anatomy Financial platform;</AgreementSub>
      <AgreementSub>(d) Configuration of the Dyad analytics platform with role-based access for the Provider&apos;s users;</AgreementSub>
      <AgreementSub>(e) Workflow design, standard operating procedure documentation, and training for the Provider&apos;s point of contact; and</AgreementSub>
      <AgreementSub>(f) Go-live support during the first thirty (30) days of operations.</AgreementSub>

      <h3 style={exhibitHeading}>Article 2. Monthly Service Fees</h3>
      <AgreementSub>
        <AgreementSnum>2.1 Percentage-of-Collections Fee.</AgreementSnum> The Provider will pay Dyad a monthly service fee equal to <strong>4.5%</strong> of net collections processed through the Dyad lockbox account during the calendar month (the &ldquo;Collections Fee&rdquo;). The Collections Fee is deducted from collected funds prior to the weekly sweep to the Provider&apos;s Designated Operating Account.
      </AgreementSub>
      <AgreementSub>
        <AgreementSnum>2.2 Minimum Monthly Fee.</AgreementSnum> Regardless of actual collections in any given month, the Provider will pay a minimum monthly fee based on its claims volume tier as set forth in the table below. If the Collections Fee for a month is less than the applicable Minimum Monthly Fee, the difference will be debited via ACH in accordance with the ACH Authorization Agreement.
      </AgreementSub>
      <AgreementSub><AgreementSnum>2.3 Claims Volume Tier - Current Tier Highlighted.</AgreementSnum></AgreementSub>
      <div className="ob-ca-fee-tbl-wrap">
      <table className="ob-ca-fee-tbl">
        <thead>
          <tr><th>Tier</th><th>Average Monthly Claims Volume</th><th>Minimum Monthly Fee</th></tr>
        </thead>
        <tbody>
          {FEE_SCHEDULE_TIERS.map(row => (
            <tr key={row.tier} className={row.current ? 'ob-ca-fee-tbl-cur' : ''}>
              <td>{row.current && row.tier === 2 ? 'Tier 2 - Provider\u2019s Current Tier' : `Tier ${row.tier}`}</td>
              <td>{row.range}</td>
              <td><strong>{row.minFee}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <AgreementSub>
        <AgreementSnum>2.4 Tier Reassignment.</AgreementSnum> Volume tier is reviewed quarterly. If the Provider&apos;s trailing-three-month average claims volume crosses a tier boundary in either direction for two (2) consecutive quarters, the applicable Minimum Monthly Fee and any volume-based pricing will be adjusted prospectively beginning the first day of the following month. Dyad will provide the Provider with at least thirty (30) days&apos; written notice of any tier reassignment.
      </AgreementSub>
      <AgreementSub>
        <AgreementSnum>2.5 Billing &amp; Reconciliation Timing.</AgreementSnum> Dyad will issue a monthly reconciliation statement and invoice on the last business day of each calendar month. The Provider will have five (5) business days to review and dispute any line item in writing. Undisputed amounts are debited or netted from collections on the fifth (5th) business day following invoice issuance.
      </AgreementSub>

      <h3 style={exhibitHeading}>Article 3. Pass-Through Costs</h3>
      <AgreementSub>
        <AgreementSnum>3.1 Reimbursable Costs.</AgreementSnum> The following costs are pass-through and reimbursable at actual cost without markup, subject to pre-approval by the Provider for any single item exceeding $500:
      </AgreementSub>
      <AgreementSub>(a) Payer enrollment application fees imposed by Medicare, Medicaid, or commercial payers;</AgreementSub>
      <AgreementSub>(b) Credentialing application fees imposed by CAQH or other primary-source verification services;</AgreementSub>
      <AgreementSub>(c) Third-party software licenses procured on the Provider&apos;s behalf with the Provider&apos;s prior written consent;</AgreementSub>
      <AgreementSub>(d) Bank-imposed returned ACH fees, payer-imposed refund processing fees, and similar third-party transactional costs incurred by Dyad on the Provider&apos;s behalf; and</AgreementSub>
      <AgreementSub>(e) State-mandated regulatory or licensing fees passed through by Dyad on the Provider&apos;s behalf.</AgreementSub>
      <AgreementSub><AgreementSnum>3.2 Reporting.</AgreementSnum> Pass-through costs will be itemized on the monthly reconciliation statement with supporting receipts available upon request.</AgreementSub>

      <h3 style={exhibitHeading}>Article 4. Additional &amp; Optional Services</h3>
      <AgreementSub><AgreementSnum>4.1 Additional Provider Credentialing.</AgreementSnum> Credentialing of additional providers beyond the ten (10) included in the Onboarding Fee is billed at <strong>$750 per provider per payer</strong> for initial enrollment and <strong>$250 per provider per payer</strong> for revalidation.</AgreementSub>
      <AgreementSub><AgreementSnum>4.2 Ad-Hoc Reporting.</AgreementSnum> Custom reports beyond the four (4) included per quarter are billed at <strong>$250 per report</strong>.</AgreementSub>
      <AgreementSub><AgreementSnum>4.3 Payer Contract Negotiation Engagements.</AgreementSnum> Standalone payer contract negotiation engagements (i.e., engagements outside the routine analysis included in the monthly service) are scoped on a per-engagement basis and billed at a project rate to be agreed in writing in advance.</AgreementSub>
      <AgreementSub><AgreementSnum>4.4 Custom Integrations.</AgreementSnum> Custom system integrations (e.g., a non-standard EHR, a custom payer portal, a bespoke reporting feed) are scoped on a time-and-materials basis at <strong>$225 per hour</strong>, subject to a written statement of work agreed in advance.</AgreementSub>

      <h3 style={exhibitHeading}>Article 5. Annual Adjustment</h3>
      <AgreementSub>
        <AgreementSnum>5.1 CPI Adjustment.</AgreementSnum> Effective on the anniversary of the Effective Date in each year of the Term, the Minimum Monthly Fees set forth in Section 2.3 and the per-unit rates set forth in Article 4 will be adjusted by the lesser of (i) the percentage change in the U.S. Consumer Price Index for All Urban Consumers (CPI-U), All Items, for the twelve (12) months ending on the most recent December 31, or (ii) three percent (3%). The percentage-of-collections rate in Section 2.1 is not subject to CPI adjustment during the Initial Term.
      </AgreementSub>
      <AgreementSub><AgreementSnum>5.2 Notice.</AgreementSnum> Dyad will provide the Provider with written notice of the CPI adjustment at least thirty (30) days prior to the effective date of the adjustment.</AgreementSub>

      <h3 style={exhibitHeading}>Article 6. Payment Mechanics</h3>
      <AgreementSub>
        <AgreementSnum>6.1 Lockbox Deduction.</AgreementSnum> Subject to the Limited Power of Attorney executed in Section 7, Dyad is authorized to deduct the Collections Fee from collected funds in the lockbox account prior to the weekly sweep.
      </AgreementSub>
      <AgreementSub>
        <AgreementSnum>6.2 ACH Debit for Shortfall.</AgreementSnum> If the Collections Fee for a month is less than the applicable Minimum Monthly Fee, or if any pass-through cost or additional service fee is due, Dyad is authorized to initiate an ACH debit from the Provider&apos;s Designated Operating Account in accordance with the ACH Authorization Agreement executed in connection with Section 7.
      </AgreementSub>
      <AgreementSub>
        <AgreementSnum>6.3 Disputes.</AgreementSnum> The Provider&apos;s right to dispute any invoice and Dyad&apos;s obligation to defer debit pending resolution are governed by Section 3(f) of the MSA and Section 2.5 of this Fee Schedule.
      </AgreementSub>

      <p className="ob-agreement-ack" style={{ marginTop: 24 }}>
        <strong>Acknowledgment.</strong> This Fee Schedule reflects the pricing reviewed and agreed to during the Commercial Alignment phase of enrollment (Section 5), including the Tier 2 minimum monthly fee, the 4.5% collections rate, and the $8,000 onboarding fee. This Fee Schedule is incorporated by reference into the Master Services Agreement and will be executed via the unified signature at the bottom of this enrollment screen.
      </p>
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
  baaFields?: Record<string, string>;
}

export const CarriedForwardExhibit: React.FC<CarriedExhibitProps> = ({
  exhibit,
  entityName,
  signerName,
  signerTitle,
  acceptedAt,
  showDyadSignature,
  ndaFields,
  baaFields,
}) => {
  const isA = exhibit === 'A';
  const scrollId = isA ? 'exa-scroll' : 'exb-scroll';
  const title = isA
    ? 'Exhibit A - Confidentiality Agreement (Executed)'
    : 'Exhibit B - Business Associate Agreement (Executed)';
  const fields = isA ? (ndaFields ?? {}) : (baaFields ?? {});
  const mergedFields = {
    ...fields,
    pentity: fields.pentity || entityName,
    pname: fields.pname || entityName,
    signame: fields.signame || signerName,
    sigtitle: fields.sigtitle || signerTitle,
  };

  return (
    <>
      <div className="ob-ca-carried-badge">Previously Executed in Section 3</div>
      <CarriedForwardDocShell title={title} scrollId={scrollId}>
        <div className="ob-agreement-asc ob-ca-carried-scroll">
          {isA ? (
            <NdaExhibitA
              fields={mergedFields}
              onFieldChange={() => {}}
              providerDisplayName={entityName}
              showDyadSignature={showDyadSignature}
              readOnly
              executed
            />
          ) : (
            <BaaExhibitB
              fields={mergedFields}
              onFieldChange={() => {}}
              providerDisplayName={entityName}
              showDyadSignature={showDyadSignature}
              readOnly
              executed
            />
          )}
          {acceptedAt && (
            <div className="ob-ca-exec-ts">Executed electronically - {acceptedAt}</div>
          )}
        </div>
      </CarriedForwardDocShell>
    </>
  );
};

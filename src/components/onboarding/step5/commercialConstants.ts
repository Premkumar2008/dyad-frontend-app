export const CLAIM_TIERS = [
  { tier: 1, label: 'Tier 1', range: '1–200 claims', minFee: 'See MSA Schedule' },
  { tier: 2, label: 'Tier 2', range: '201–500 claims', minFee: 'See MSA Schedule', current: true },
  { tier: 3, label: 'Tier 3', range: '501–1,000 claims', minFee: 'See MSA Schedule' },
  { tier: 4, label: 'Tier 4', range: '1,001–2,500 claims', minFee: 'See MSA Schedule' },
  { tier: 5, label: 'Tier 5', range: '2,501–5,000 claims', minFee: 'See MSA Schedule' },
  { tier: 6, label: 'Tier 6', range: '5,001+ claims', minFee: 'See MSA Schedule' },
];

export const FEE_SCHEDULE_TIERS = [
  { tier: 1, range: '1 – 200 claims', minFee: '$2,500' },
  { tier: 2, range: '201 – 500 claims', minFee: '$4,500', current: true },
  { tier: 3, range: '501 – 1,000 claims', minFee: '$8,500' },
  { tier: 4, range: '1,001 – 2,500 claims', minFee: '$18,000' },
  { tier: 5, range: '2,501 – 5,000 claims', minFee: '$32,000' },
  { tier: 6, range: '5,001+ claims', minFee: '$55,000 (custom quote)' },
];

export interface ServiceLine {
  name: string;
  tip?: string;
  value?: string;
  included?: boolean;
}

export interface ServiceCategory {
  id: string;
  title: string;
  dotColor?: string;
  note?: string;
  specialtyOnly?: boolean;
  items: ServiceLine[];
}

export const INCLUDED_SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'credentialing',
    title: 'Credentialing & Enrollment',
    items: [
      { name: 'Provider Credentialing (NCQA)', tip: 'NCQA-certified credentialing: primary-source verification, CAQH roster management, enrollment packet generation and submission.', included: true },
      { name: 'Payer Enrollment & Revalidation', tip: 'Initial enrollment, periodic revalidation, and roster updates across all contracted payers.', included: true },
    ],
  },
  {
    id: 'rcm',
    title: 'Revenue Cycle Operations',
    items: [
      { name: 'Charge Capture & Coding Review', tip: 'Fully digital case intake — specialty-specific coding validation including units, modifiers, concurrency, and documentation checks.', included: true },
      { name: 'Claims Submission & Clearinghouse Management', tip: 'Same-day electronic submission with payer-specific clean-claim edits and end-to-end status visibility.', included: true },
      { name: 'Payment Posting & Reconciliation', tip: 'ERA/EFT enrollment, automated posting, expected-allowed logic, and bank reconciliation.', included: true },
      { name: 'Denial Management & Appeals', tip: 'Denial prevention, root-cause analysis, structured appeals, and full audit trail.', included: true },
      { name: 'Patient Responsibility Estimates', tip: 'Case-level estimates based on verified eligibility and contracted rates.', included: true },
      { name: 'Accounts Receivable Follow-Up', tip: 'Systematic follow-up by aging bucket and payer with prioritized worklists.', included: true },
      { name: 'Good Faith Estimates (NSA)', tip: 'Automated Good Faith Estimates as required by the No Surprises Act.', included: true },
      { name: 'Underpayment Detection & Recovery', tip: 'Systematic variance checks against contracted rates with recovery workflows.', included: true },
    ],
  },
  {
    id: 'payer',
    title: 'Payer Strategy & Contract Intelligence',
    items: [
      { name: 'Payer Contract Analysis & Negotiation Support', tip: 'Payer and contract-level performance analysis with data-driven benchmarks.', included: true },
      { name: 'Contract Management', tip: 'Centralized tracking of terms, effective dates, fee schedules, and renewal timelines.', included: true },
      { name: 'Transparency in Coverage Benchmarking', tip: 'Leverages publicly available TiC data to benchmark contracted rates.', included: true },
      { name: 'Market Analytics', tip: 'Specialty-specific market intelligence and reimbursement benchmarks.', included: true },
    ],
  },
  {
    id: 'specialty-claims',
    title: 'Specialty Claims',
    items: [
      { name: 'Personal Injury (PI) Claims Management', tip: 'Lien-based billing, attorney correspondence, settlement tracking, and negotiation support.', included: true },
      { name: "Workers' Compensation Claims", tip: 'State-specific billing, authorization tracking, and jurisdictional fee schedule compliance.', included: true },
    ],
  },
  {
    id: 'reporting',
    title: 'Reporting & Analytics',
    items: [
      { name: 'Real-Time Performance Dashboards', tip: 'Live dashboards: charges, claims status, cash, denials, payer latency, and provider-level production.', included: true },
    ],
  },
  {
    id: 'specialty-platform',
    title: 'Integrated Paperless Anesthesia & Pain Management Platform',
    dotColor: '#1565C0',
    specialtyOnly: true,
    note: 'End-to-end digital encounter documentation with immediate claim qualification and submission at close of case.',
    items: [
      { name: 'Real-Time Clinical Data Capture & Encounter-to-Claim Workflow', tip: 'Purpose-built mobile and in-facility platform deployed at point of service with same-day claim submission.', included: true },
      { name: 'CMS Certified ONC Health IT — FHIR Connectivity', tip: 'Standards-based FHIR interoperability for demographics, scheduling, documentation, and charge capture.', included: true },
    ],
  },
  {
    id: 'idr',
    title: 'State & Federal IDR Services',
    dotColor: '#E65100',
    items: [
      { name: 'Independent Dispute Resolution (IDR)', tip: 'Dyad identifies qualifying out-of-network claims, prepares IDR packages, and monitors cases through resolution.', value: '10% of recovery' },
    ],
  },
  {
    id: 'banking',
    title: 'Banking Infrastructure, Security & Compliance',
    dotColor: '#546E7A',
    items: [
      { name: 'Banking & Lockbox Infrastructure', tip: 'FDIC-insured deposit accounts through Live Oak Bank, powered by Anatomy.', included: true },
      { name: 'HIPAA Compliance Program', tip: 'Comprehensive HIPAA framework covering Privacy, Security, and Breach Notification rules.', included: true },
      { name: 'SOC 2 Type II Certification', tip: 'Independent third-party audit of security controls.', included: true },
      { name: 'NIST Cybersecurity Framework', tip: 'Information security program aligned with NIST CSF.', included: true },
      { name: 'NCQA Accreditation (Credentialing)', tip: 'Credentialing operations adhere to NCQA CVO standards.', included: true },
    ],
  },
];

export type CommercialDecision = '' | 'accept' | 'discuss' | 'decline';

export type MsaSectionId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export const MSA_SECTION_ORDER: MsaSectionId[] = ['A', 'B', 'C', 'D', 'E', 'F'];

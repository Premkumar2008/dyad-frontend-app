export type DueDiligenceDocId =
  | 'claimsSummary'
  | 'payerMixReport'
  | 'arAging'
  | 'paymentsAdjustments'
  | 'encounterVolume';

export interface DueDiligenceDocMeta {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  mimeType?: string;
  /** Set after POST /onboarding/step/4/documents succeeds */
  documentId?: string;
  storagePath?: string;
}

export const DUE_DILIGENCE_DOCS: {
  id: DueDiligenceDocId;
  label: string;
  period: string;
}[] = [
  { id: 'claimsSummary', label: '1. Claims Summary Report', period: 'Last 12 months' },
  { id: 'payerMixReport', label: '2. Payer Mix Report', period: 'Last 12 months' },
  { id: 'arAging', label: '3. Accounts Receivable Aging by Payer Report', period: 'Last 12 months' },
  { id: 'paymentsAdjustments', label: '4. Payments and Adjustments by Payer Report', period: 'Last 12 months' },
  { id: 'encounterVolume', label: '5. Encounter / Case Volume and Production Report', period: 'Last 12 months' },
];

export const DD_ACCEPTED_FILE_TYPES = '.xlsx,.csv,.pdf';
export const DD_MAX_FILE_BYTES = 10 * 1024 * 1024;

export const FACILITY_OWNERSHIP_OPTIONS = [
  'Physician-owned (independent)',
  'Joint venture with health system',
  'Hospital-affiliated',
  'Corporate / PE-owned',
];

export const emptyDueDiligenceDocuments = (): Record<DueDiligenceDocId, DueDiligenceDocMeta | null> => ({
  claimsSummary: null,
  payerMixReport: null,
  arAging: null,
  paymentsAdjustments: null,
  encounterVolume: null,
});

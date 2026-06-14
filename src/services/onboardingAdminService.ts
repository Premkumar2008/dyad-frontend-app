import axios from 'axios';
import type { CSSProperties } from 'react';

export interface OnboardingListRecord {
  id: number;
  onboarding_id: string;
  step: number;
  payload: Record<string, unknown>;
  step_1_payload?: Record<string, unknown> | null;
  step_2_payload?: Record<string, unknown> | null;
  step_3_payload?: Record<string, unknown> | null;
  step_4_payload?: Record<string, unknown> | null;
  step_5_payload?: Record<string, unknown> | null;
  step_6_payload?: Record<string, unknown> | null;
  npi: string | null;
  contact_email: string | null;
  contact_name: string | null;
  call_event_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  completedSteps?: number[];
}

export interface OnboardingListResponse {
  success: boolean;
  total: number;
  data: OnboardingListRecord[];
}

const PRACTICE_TYPE_LABELS: Record<string, string> = {
  anesthesiology: 'Anesthesia',
  surgical: 'Surgical',
  pain: 'Pain Mgmt.',
  asc: 'ASC',
  ophthalmology: 'Ophthalmology',
  orthopedic: 'Orthopedic Surg.',
  spine: 'Spine Surgery',
  endoscopy: 'Endoscopy',
};

const formatPracticeType = (raw: string | undefined): string => {
  if (!raw?.trim()) return '-';
  const key = raw.trim().toLowerCase();
  return PRACTICE_TYPE_LABELS[key]
    ?? key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');
};

const initialsFromText = (text: string): string => {
  const parts = text.replace(/[,.\-]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '-';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
};

const readStep1Payload = (payload: Record<string, unknown> | undefined) => {
  const step1 = payload?.step1;
  if (!step1 || typeof step1 !== 'object') return undefined;
  return step1 as Record<string, unknown>;
};

const readNpiApiData = (step1: Record<string, unknown> | undefined) => {
  const npiApiData = step1?.npiApiData;
  if (!npiApiData || typeof npiApiData !== 'object') return undefined;
  return npiApiData as Record<string, unknown>;
};

export interface ActiveClientRow {
  id: string;
  initials: string;
  avatarStyle?: CSSProperties;
  name: string;
  contact: string;
  accountId: string;
  specialty: string;
  plan: string;
  mrr: string;
  claims: string;
  health: string;
  healthTier?: 'excellent' | 'good' | 'fair' | 'poor';
  csmInitials: string;
  csmName: string;
  csmStyle?: CSSProperties;
  renewal: string;
  status: 'active' | 'onboarding' | 'at-risk' | 'paused';
  npi?: string;
  contactEmail?: string;
  currentStep?: number;
  createdAt?: string;
  mrrNumeric?: number | null;
  claimsNumeric?: number | null;
}

const mapApiStatus = (status: string): ActiveClientRow['status'] => {
  const normalized = status.trim().toLowerCase();
  if (normalized === 'onboarding') return 'onboarding';
  if (normalized === 'at-risk' || normalized === 'at risk') return 'at-risk';
  if (normalized === 'paused') return 'paused';
  if (normalized === 'active') return 'active';
  return 'onboarding';
};

const parseNumericField = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,\s]/g, '');
    const n = Number(cleaned);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

const readNumericFromPayload = (
  payload: Record<string, unknown>,
  ...keys: string[]
): number | null => {
  for (const key of keys) {
    const n = parseNumericField(payload[key]);
    if (n != null) return n;
  }
  return null;
};

export interface ActiveClientsFetchResult {
  clients: ActiveClientRow[];
  total: number | null;
}

export const mapOnboardingRecordToClientRow = (record: OnboardingListRecord): ActiveClientRow => {
  const payload = record.payload ?? {};
  const step1 = readStep1Payload(payload);
  const npiApiData = readNpiApiData(step1);

  const providerName = typeof npiApiData?.fullName === 'string' ? npiApiData.fullName.trim() : '';
  const practiceTypeRaw = typeof step1?.confirmedPracticeType === 'string'
    ? step1.confirmedPracticeType
    : typeof step1?.practiceType === 'string'
      ? step1.practiceType
      : Array.isArray(step1?.selectedPracticeTypes) && step1.selectedPracticeTypes[0]
        ? String(step1.selectedPracticeTypes[0])
        : '';

  const contactName = record.contact_name?.trim()
    || (typeof payload.contactName === 'string' ? payload.contactName.trim() : '')
    || providerName
    || '-';

  const contactEmail = record.contact_email?.trim()
    || (typeof payload.contactEmail === 'string' ? payload.contactEmail.trim() : '')
    || '-';

  const practiceName = providerName || contactName || contactEmail;
  const accountId = record.onboarding_id?.trim() || String(record.id);
  const npi = record.npi?.trim()
    || (typeof step1?.npi === 'string' ? step1.npi.trim() : '')
    || (typeof npiApiData?.npi === 'string' ? npiApiData.npi.trim() : '');

  const currentStep = typeof payload.currentStep === 'number'
    ? payload.currentStep
    : record.step;

  const mrrNumeric = readNumericFromPayload(payload, 'mrr', 'monthlyRecurringRevenue', 'monthly_recurring_revenue');
  const claimsNumeric = readNumericFromPayload(payload, 'claims', 'claimsProcessed', 'claims_processed', 'monthlyClaims');

  return {
    id: accountId,
    initials: initialsFromText(practiceName),
    name: practiceName,
    contact: contactName !== '-' ? contactName : contactEmail,
    accountId: accountId.length > 12 ? `${accountId.slice(0, 8)}…` : accountId,
    specialty: formatPracticeType(practiceTypeRaw),
    plan: '-',
    mrr: mrrNumeric != null ? String(mrrNumeric) : '-',
    claims: claimsNumeric != null ? String(claimsNumeric) : '-',
    health: '-',
    csmInitials: '-',
    csmName: '-',
    renewal: '-',
    status: mapApiStatus(record.status),
    npi: npi || undefined,
    contactEmail: contactEmail !== '-' ? contactEmail : undefined,
    currentStep,
    createdAt: record.created_at || undefined,
    mrrNumeric,
    claimsNumeric,
  };
};

export interface OnboardingRecordsFetchResult {
  records: OnboardingListRecord[];
  total: number | null;
}

export const fetchOnboardingRecords = async (
  token: string,
): Promise<OnboardingRecordsFetchResult> => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const res = await axios.get<OnboardingListResponse>(`${apiUrl}/onboarding`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = res.data;

  const records = Array.isArray(body?.data)
    ? body.data
    : Array.isArray(body)
      ? (body as unknown as OnboardingListRecord[])
      : [];

  const total = typeof body?.total === 'number' ? body.total : (records.length > 0 ? records.length : null);

  return { records, total };
};

export const fetchOnboardingList = async (token: string): Promise<ActiveClientsFetchResult> => {
  const { records, total } = await fetchOnboardingRecords(token);
  return {
    clients: records.map(mapOnboardingRecordToClientRow),
    total,
  };
};

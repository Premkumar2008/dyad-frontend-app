import type { OnboardingListRecord } from '../../services/onboardingAdminService';
import { mapOnboardingRecordToClientRow } from '../../services/onboardingAdminService';

export type PipelineStageId =
  | 'all'
  | 'enrollment'
  | 'scheduling'
  | 'agreements'
  | 'due-diligence'
  | 'commercial'
  | 'banking'
  | 'golive';

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  color: string;
  step: number;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'enrollment', label: 'Enrollment', step: 1, color: '#173e7a' },
  { id: 'scheduling', label: 'Scheduling', step: 2, color: '#2563eb' },
  { id: 'agreements', label: 'Agreements', step: 3, color: '#7c3aed' },
  { id: 'due-diligence', label: 'Due Diligence', step: 4, color: '#9333ea' },
  { id: 'commercial', label: 'Commercial / MSA', step: 5, color: '#0891b2' },
  { id: 'banking', label: 'Banking Setup', step: 6, color: '#0d9488' },
  { id: 'golive', label: 'Go-Live Ready', step: 7, color: '#16a34a' },
];

const MS_PER_DAY = 86_400_000;
const STALLED_DAYS = 14;

const readPayload = (record: OnboardingListRecord): Record<string, unknown> => (
  record.payload && typeof record.payload === 'object' ? record.payload : {}
);

const readStepBucket = (record: OnboardingListRecord, step: number): Record<string, unknown> => {
  const stepKey = `step${step}`;
  const snakeKey = `step_${step}_payload` as keyof OnboardingListRecord;
  const root = record as unknown as Record<string, unknown>;
  const payload = readPayload(record);

  const candidates: unknown[] = [
    record[snakeKey],
    root[`${stepKey}Payload`],
    payload[stepKey],
    payload[`step_${step}`],
    payload[`${stepKey}Payload`],
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) continue;
    const bucket = candidate as Record<string, unknown>;
    const nested = bucket[stepKey];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return nested as Record<string, unknown>;
    }
    return bucket;
  }

  return {};
};

export const getRecordCurrentStep = (record: OnboardingListRecord): number => {
  const payload = readPayload(record);
  const fromPayload = typeof payload.currentStep === 'number' ? payload.currentStep : null;
  const step = fromPayload ?? record.step ?? 1;
  return Math.min(Math.max(step, 1), 6);
};

export const isEnrollmentComplete = (record: OnboardingListRecord): boolean => {
  const payload = readPayload(record);
  const step6 = readStepBucket(record, 6);
  return Boolean(payload.step6EnrollmentComplete ?? step6.step6EnrollmentComplete);
};

export const isPipelineRecord = (record: OnboardingListRecord): boolean => {
  const status = record.status?.trim().toLowerCase() ?? '';
  if (isEnrollmentComplete(record)) return false;
  if (status === 'active' || status === 'live' || status === 'completed') return false;
  return true;
};

export const resolvePipelineStageId = (record: OnboardingListRecord): PipelineStageId => {
  if (isEnrollmentComplete(record)) return 'golive';
  const step = getRecordCurrentStep(record);
  if (step <= 1) return 'enrollment';
  if (step === 2) return 'scheduling';
  if (step === 3) return 'agreements';
  if (step === 4) return 'due-diligence';
  if (step === 5) return 'commercial';
  return 'banking';
};

export const getStageMeta = (stageId: PipelineStageId): PipelineStage | undefined =>
  PIPELINE_STAGES.find(s => s.id === stageId);

const daysBetween = (fromIso: string, toDate = new Date()): number => {
  const from = new Date(fromIso);
  if (Number.isNaN(from.getTime())) return 0;
  return Math.max(0, Math.floor((toDate.getTime() - from.getTime()) / MS_PER_DAY));
};

export const buildProgressLabel = (record: OnboardingListRecord): string => {
  const step = getRecordCurrentStep(record);
  if (isEnrollmentComplete(record)) return 'Enrollment complete · final review';
  if (step === 6) {
    const step6 = readStepBucket(record, 6);
    if (step6.step6Sec6Complete) return 'Step 6 · KYC complete';
    if (step6.step6Sec5Complete) return 'Step 6 · Sweep setup';
    if (step6.step6Sec4Complete) return 'Step 6 · ACH mandate';
    if (step6.w9Signed) return 'Step 6 · W-9 signed';
    if (step6.step6Sec2Complete) return 'Step 6 · CIP in progress';
    return 'Step 6 · Banking & payment';
  }
  return `Step ${step} of 6`;
};

export const buildProgressPct = (record: OnboardingListRecord): number => {
  if (isEnrollmentComplete(record)) return 100;
  const step = getRecordCurrentStep(record);
  const base = ((step - 1) / 6) * 100;
  if (step !== 6) return Math.round(base + (100 / 6) * 0.35);
  const step6 = readStepBucket(record, 6);
  const sections = [
    step6.step6Sec1Complete,
    step6.step6Sec2Complete,
    step6.w9Signed,
    step6.step6Sec4Complete,
    step6.step6Sec5Complete,
    step6.step6Sec6Complete,
  ].filter(Boolean).length;
  return Math.round(((5 / 6) + (sections / 6) * (1 / 6)) * 100);
};

export interface PipelineRow {
  id: string;
  onboardingId: string;
  practiceName: string;
  contactName: string;
  contactEmail: string;
  npi: string;
  specialty: string;
  stageId: PipelineStageId;
  stageLabel: string;
  stageColor: string;
  currentStep: number;
  progressLabel: string;
  progressPct: number;
  daysInStage: number;
  daysTotal: number;
  isStalled: boolean;
  updatedAt: string;
  createdAt: string;
  achMandateActive: boolean;
  callScheduled: boolean;
  record: OnboardingListRecord;
}

export const mapRecordToPipelineRow = (record: OnboardingListRecord): PipelineRow => {
  const client = mapOnboardingRecordToClientRow(record);
  const payload = readPayload(record);
  const step2 = readStepBucket(record, 2);
  const step6 = readStepBucket(record, 6);
  const stageId = resolvePipelineStageId(record);
  const stage = getStageMeta(stageId);

  const updatedAt = record.updated_at || record.created_at || '';
  const createdAt = record.created_at || '';
  const daysInStage = daysBetween(updatedAt);
  const daysTotal = daysBetween(createdAt);

  return {
    id: client.id,
    onboardingId: record.onboarding_id || client.id,
    practiceName: client.name,
    contactName: client.contact,
    contactEmail: client.contactEmail ?? '',
    npi: client.npi ?? '',
    specialty: client.specialty,
    stageId,
    stageLabel: stage?.label ?? 'Unknown',
    stageColor: stage?.color ?? '#173e7a',
    currentStep: getRecordCurrentStep(record),
    progressLabel: buildProgressLabel(record),
    progressPct: buildProgressPct(record),
    daysInStage,
    daysTotal,
    isStalled: daysInStage >= STALLED_DAYS,
    updatedAt,
    createdAt,
    achMandateActive: Boolean(payload.achMandateActive ?? step6.achMandateActive),
    callScheduled: Boolean(payload.calendlyScheduled ?? step2.calendlyScheduled),
    record,
  };
};

export interface PipelineStats {
  inPipeline: number;
  avgDaysToLive: number | null;
  stalled: number;
  goLiveReady: number;
  byStage: Record<PipelineStageId, number>;
}

export const computePipelineStats = (rows: PipelineRow[]): PipelineStats => {
  const byStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = rows.filter(r => r.stageId === stage.id).length;
    return acc;
  }, {} as Record<PipelineStageId, number>);

  const completedRows = rows.filter(r => r.stageId === 'golive');
  const avgDaysToLive = completedRows.length
    ? Math.round(completedRows.reduce((sum, r) => sum + r.daysTotal, 0) / completedRows.length)
    : rows.length
      ? Math.round(rows.reduce((sum, r) => sum + r.daysTotal, 0) / rows.length)
      : null;

  return {
    inPipeline: rows.length,
    avgDaysToLive,
    stalled: rows.filter(r => r.isStalled).length,
    goLiveReady: byStage.golive ?? 0,
    byStage,
  };
};

export const formatPipelineDate = (iso: string): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
};

export const formatPipelineDateTime = (iso: string): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export const ONBOARDING_STEP_LABELS = [
  'Practice enrollment',
  'Schedule & contact',
  'Sign agreements',
  'Due diligence',
  'Commercial / MSA',
  'Banking & payment',
] as const;

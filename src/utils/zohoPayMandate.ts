import type { ZohoAchMandateResult } from '../types/zohoPayMandate';

export type ZohoPaymentLifecycleStatus =
  | 'succeeded'
  | 'success'
  | 'pending'
  | 'processing'
  | 'authorized'
  | 'failed'
  | 'cancelled'
  | string;

export const normalizeZohoPaymentStatus = (status: string | undefined): string =>
  (status ?? '').trim().toLowerCase();

export const isAcceptableZohoPaymentStatus = (status: string | undefined): boolean => {
  const normalized = normalizeZohoPaymentStatus(status);
  return ['succeeded', 'success', 'pending', 'processing', 'authorized'].includes(normalized);
};

export const isFailedZohoPaymentStatus = (status: string | undefined): boolean => {
  const normalized = normalizeZohoPaymentStatus(status);
  return normalized === 'failed'
    || normalized === 'cancelled'
    || normalized === 'canceled'
    || normalized.includes('fail');
};

export const isZohoPaymentSettled = (status: string | undefined): boolean => {
  const normalized = normalizeZohoPaymentStatus(status);
  return normalized === 'succeeded' || normalized === 'success';
};

export const deriveZohoSubscriptionStatus = (
  paymentStatus: string | undefined,
  savedStatus?: string,
): string => {
  if (savedStatus?.trim()) return savedStatus.trim();
  return isZohoPaymentSettled(paymentStatus) ? 'active' : 'pending';
};

export interface ZohoMandateFormPatch {
  achMandateActive: boolean;
  zohoCustomerId: string;
  zohoPaymentId: string;
  zohoPaymentMethodId: string;
  zohoMandateId: string;
  zohoSessionId: string;
  zohoPaymentStatus: string;
  zohoSubscriptionStatus: string;
  zohoSubscriptionNextCharge: string;
  achMandateAuthorizedAt: string;
}

export const buildZohoMandateFormPatch = (
  result: ZohoAchMandateResult,
  authorizedAt = new Date().toISOString(),
): ZohoMandateFormPatch => ({
  achMandateActive: true,
  zohoCustomerId: result.customerId,
  zohoPaymentId: result.paymentId,
  zohoPaymentMethodId: result.paymentMethodId,
  zohoMandateId: result.mandateId,
  zohoSessionId: result.sessionId,
  zohoPaymentStatus: result.paymentStatus ?? 'succeeded',
  zohoSubscriptionStatus: deriveZohoSubscriptionStatus(
    result.paymentStatus,
    result.subscriptionStatus,
  ),
  zohoSubscriptionNextCharge: result.subscriptionNextCharge ?? '',
  achMandateAuthorizedAt: authorizedAt,
});

export const getZohoMandateSuccessMessage = (
  paymentStatus?: string,
  subscriptionStatus?: string,
): string => {
  const payment = normalizeZohoPaymentStatus(paymentStatus);
  const subscription = (subscriptionStatus ?? '').trim().toLowerCase();

  if (payment === 'pending' || payment === 'processing' || subscription === 'pending') {
    return 'ACH authorization submitted. Confirmation may take a few business days.';
  }
  return 'Recurring ACH authorized';
};

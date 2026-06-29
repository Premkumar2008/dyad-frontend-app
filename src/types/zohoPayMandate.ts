export interface ZohoAchMandateResult {
  customerId: string;
  paymentId: string;
  paymentMethodId: string;
  mandateId: string;
  sessionId: string;
  paymentStatus?: string;
  subscriptionStatus?: string;
  subscriptionNextCharge?: string;
  plan?: string;
  amount?: string;
  currency?: string;
}

export interface ZohoPayFailureLogRequest {
  onboardingId?: string;
  stage: string;
  error: string;
  customerId?: string;
  sessionId?: string;
  paymentId?: string;
}

/** Shapes from Zoho Payments OpenAPI (US) — customers, payment-method-session, payment-session. */

export interface ZohoApiEnvelope {
  code?: number;
  message?: string;
}

export interface ZohoCustomer {
  customer_id: string;
  name?: string;
  email?: string;
  phone?: string;
  created_time?: number;
  last_modified_time?: number;
}

export interface ZohoCustomerCreateRequest {
  name: string;
  email: string;
  phone?: string;
  meta_data?: Array<{ key: string; value: string }>;
}

export interface ZohoCustomerCreateResponse extends ZohoApiEnvelope {
  customer?: ZohoCustomer;
}

export interface ZohoPaymentMethodSession {
  payment_method_session_id: string;
  customer_id: string;
  description?: string;
  created_time?: number;
  status?: 'failed' | 'created' | 'in_progress' | 'succeeded';
  payment_method?: ZohoPaymentMethodSummary;
}

export interface ZohoPaymentMethodSummary {
  payment_method_id: string;
  type?: 'card' | 'ach_debit';
  status?: string;
  created_time?: number;
}

export interface ZohoPaymentMethodSessionCreateRequest {
  customer_id: string;
  description?: string;
}

export interface ZohoPaymentMethodSessionCreateResponse extends ZohoApiEnvelope {
  payment_method_session?: ZohoPaymentMethodSession;
}

export interface ZohoPaymentMethodSessionRetrieveResponse extends ZohoApiEnvelope {
  payment_method_session?: ZohoPaymentMethodSession;
}

export interface ZohoPaymentSessionCreateRequest {
  amount: number;
  currency: string;
  description: string;
  invoice_number?: string;
  reference_number?: string;
  expires_in?: number;
  max_retry_count?: number;
  configurations?: {
    allowed_payment_methods?: Array<'card' | 'ach_debit'>;
    hosted_page_parameters?: {
      name?: string;
      email?: string;
      phone?: string;
      phone_country_code?: string;
      description?: string;
      success_url?: string;
      failure_url?: string;
    };
  };
}

export interface ZohoPaymentSession {
  payments_session_id: string;
  currency?: string;
  amount?: string;
  description?: string;
  invoice_number?: string;
  reference_number?: string;
  access_key?: string;
  created_time?: number;
  expiry_time?: number;
}

export interface ZohoPaymentSessionCreateResponse extends ZohoApiEnvelope {
  payments_session?: ZohoPaymentSession;
}

export const ZOHO_PAYMENTS_API_BASE = 'https://payments.zoho.com/api/v1';

export const ZOHO_PAYMENTS_OAUTH_SCOPES = {
  customersCreate: 'ZohoPay.customers.CREATE',
  customersRead: 'ZohoPay.customers.READ',
  paymentMethodsCreate: 'ZohoPay.paymentmethods.CREATE',
  paymentMethodsRead: 'ZohoPay.paymentmethods.READ',
  paymentsCreate: 'ZohoPay.payments.CREATE',
  paymentsRead: 'ZohoPay.payments.READ',
} as const;

export type ZohoPayDomain = 'US' | 'IN' | string;

export interface ZohoPayInitConfig {
  account_id: string;
  domain: ZohoPayDomain;
  otherOptions: {
    api_key: string;
  };
}

export interface ZohoPayMandateOptions {
  type: 'recurring' | string;
  description?: string;
}

export interface ZohoPayRequestPaymentMethodOptions {
  amount?: string;
  currency_code?: string;
  payments_session_id?: string;
  payment_methods?: string[];
  mandate?: ZohoPayMandateOptions;
  currency_symbol?: string;
  business?: string;
  description?: string;
  invoice_number?: string;
  reference_number?: string;
  address?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface ZohoPayWidgetSuccess {
  payment_id?: string;
  payment_method_id?: string;
  mandate_id?: string;
  customer_id?: string;
  [key: string]: unknown;
}

export interface ZPaymentsInstance {
  requestPaymentMethod: (options: ZohoPayRequestPaymentMethodOptions) => Promise<ZohoPayWidgetSuccess>;
  close: () => Promise<void>;
}

declare global {
  interface Window {
    ZPayments?: new (config: ZohoPayInitConfig) => ZPaymentsInstance;
  }
}

export {};

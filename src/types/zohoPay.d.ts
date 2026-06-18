export type ZohoPayDomain = 'US' | 'IN' | string;

export interface ZohoPayInitConfig {
  account_id: string;
  domain: ZohoPayDomain;
  otherOptions: {
    api_key: string;
  };
}

export interface ZohoPayAddress {
  name?: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export interface ZohoPayRequestPaymentMethodOptions {
  payment_method?: 'card' | 'ach_debit';
  transaction_type: 'payment' | 'add';
  payments_session_id?: string;
  payment_method_session_id?: string;
  customer_id?: string;
  amount?: string;
  currency_code?: string;
  currency_symbol?: string;
  business?: string;
  description?: string;
  invoice_number?: string;
  address?: ZohoPayAddress;
}

export interface ZohoPayWidgetSuccess {
  payment_id?: string;
  payment_method_id?: string;
  mandate_id?: string;
  customer_id?: string;
  [key: string]: unknown;
}

export interface ZohoPayWidgetError {
  code?: string;
  message?: string;
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

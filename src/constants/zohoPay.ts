export const ZOHO_PAY_MERCHANT_NAME = 'Dyad Practice Solutions LLC';

export const ZOHO_PAY_SUPPORT_EMAIL = 'billing@dyadpracticesolutions.com';

/** Required ACH debit authorization copy per Zoho Payments widget integration guide. */
export const ZOHO_ACH_DEBIT_AUTHORIZATION = `By proceeding, you authorize ${ZOHO_PAY_MERCHANT_NAME} to debit funds from your account for recurring service fees and other transactions made under your Master Services Agreement, and to credit your account to correct erroneous transactions. This authorization remains in effect until you revoke it by contacting ${ZOHO_PAY_SUPPORT_EMAIL}.`;

export const ZOHO_PAY_SCRIPT_URL = 'https://static.zohocdn.com/zpay/zpay-js/v1/zpayments.js';

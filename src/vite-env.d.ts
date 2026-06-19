/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly VITE_ENABLE_DEMO_MODE?: string
  readonly VITE_API_URL?: string
  readonly VITE_ZOHO_PAY_ACCOUNT_ID?: string
  readonly VITE_ZOHO_PAY_API_KEY?: string
  readonly VITE_ZOHO_PAY_DOMAIN?: string
  readonly VITE_ZOHO_PAY_USE_MOCK?: string
  readonly VITE_ZOHO_PAY_SETUP_AMOUNT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

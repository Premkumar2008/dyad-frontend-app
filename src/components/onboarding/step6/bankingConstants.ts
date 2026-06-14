export type BankingSectionId = 1 | 2 | 3 | 4 | 5 | 6;

export const BANKING_SECTION_ORDER: BankingSectionId[] = [1, 2, 3, 4, 5, 6];

export const BANKING_SECTION_LABELS: Record<BankingSectionId, string> = {
  1: '1. Limited Power of Attorney',
  2: '2. Authorized Signatory & CIP',
  3: '3. Form W-9',
  4: '4. ACH Authorization',
  5: '5. Sweep Schedule',
  6: '6. KYC Documents',
};

export const BANKING_SECTION_TITLES: Record<BankingSectionId, string> = {
  1: 'Limited Power of Attorney',
  2: 'Authorized Signatory & Account Opening Information',
  3: 'Form W-9 - Request for Taxpayer Identification Number and Certification',
  4: 'Exhibit E - ACH Authorization Agreement',
  5: 'Weekly Sweep Schedule & Destination Authorization',
  6: 'Know Your Customer (KYC) Documentation',
};

export const CITIZENSHIP_OPTIONS = [
  'U.S. Citizen',
  'U.S. Permanent Resident',
  'Non-Resident Alien',
];

export const W9_TAX_CLASSES = [
  { id: '1', label: 'Individual / sole proprietor' },
  { id: '2', label: 'C corporation' },
  { id: '3', label: 'S corporation' },
  { id: '4', label: 'Partnership' },
  { id: '5', label: 'Trust / estate' },
  { id: '6', label: 'Limited Liability Co. (LLC)' },
  { id: '7', label: 'Other (see Form W-9 instructions)' },
];

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
];

export type KycDocId =
  | 'photoId'
  | 'articles'
  | 'goodStanding'
  | 'einLetter'
  | 'beneficialOwnership';

export interface KycDocMeta {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export const KYC_DOCUMENTS: { id: KycDocId; name: string; desc: string; accept: string }[] = [
  {
    id: 'photoId',
    name: 'Government-Issued Photo ID (Front & Back)',
    desc: "Driver's License, State ID, or U.S. Passport - must be current and unexpired",
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    id: 'articles',
    name: 'Articles of Incorporation / Organization',
    desc: 'Articles of Incorporation (Corp) or Articles of Organization (LLC)',
    accept: '.pdf',
  },
  {
    id: 'goodStanding',
    name: 'Certificate of Good Standing',
    desc: 'Issued within the past 90 days by the Secretary of State',
    accept: '.pdf',
  },
  {
    id: 'einLetter',
    name: 'IRS EIN Confirmation Letter',
    desc: 'Form CP-575, SS-4 confirmation, or Letter 147C',
    accept: '.pdf',
  },
  {
    id: 'beneficialOwnership',
    name: 'Beneficial Ownership Certification',
    desc: 'FinCEN Beneficial Ownership Form - required for any individual owning 25% or more',
    accept: '.pdf',
  },
];

export const KYC_MAX_FILE_BYTES = 10 * 1024 * 1024;

export const emptyKycDocuments = (): Record<KycDocId, KycDocMeta | null> => ({
  photoId: null,
  articles: null,
  goodStanding: null,
  einLetter: null,
  beneficialOwnership: null,
});

export const DYAD_REQUESTER_ADDRESS =
  'Dyad Practice Solutions, LLC | 2573 Pacific Coast Hwy, Suite A277, Torrance, CA 90505';

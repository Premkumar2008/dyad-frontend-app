import axios, { isAxiosError } from 'axios';

export const NPI_LOOKUP_GENERIC_ERROR = 'Something went wrong. Please try again later.';

export const formatNpiLookupError = (error: unknown): string => {
  if (isAxiosError(error)) {
    if (!error.response || error.response.status >= 500) {
      return NPI_LOOKUP_GENERIC_ERROR;
    }
    const message = (error.response.data as { message?: string } | undefined)?.message;
    if (message) return message;
    return NPI_LOOKUP_GENERIC_ERROR;
  }

  if (error instanceof Error) {
    if (/network error/i.test(error.message)) {
      return NPI_LOOKUP_GENERIC_ERROR;
    }
    return error.message;
  }

  return NPI_LOOKUP_GENERIC_ERROR;
};

export type OnboardingPracticeTypeId = 'anesthesiology' | 'surgical' | 'pain' | 'asc' | '';

export interface NpiTaxonomy {
  code?: string;
  desc?: string;
  primary?: boolean;
  state?: string;
  license?: string;
}

export interface NpiApiData {
  enumType: string;
  orgName: string;
  contactName: string;
  title: string;
  phone: string;
  fullName: string;
  credential: string;
  firstName: string;
  lastName: string;
  displayName: string;
  taxonomyDesc: string;
  primaryTaxonomyCode: string;
  primaryTaxonomyDesc: string;
  taxonomies: NpiTaxonomy[];
  enumerationDate: string;
  lastUpdated: string;
  addr: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  npi: string;
  status: string;
  authorizedOfficial: string;
  suggestedPracticeType: OnboardingPracticeTypeId;
  suggestedPracticeTypes: OnboardingPracticeTypeId[];
  suggestedPrimarySpecialty: string;
}

let allowedTaxonomiesCache: string[] | null = null;

const stripDashes = (v: string) => v.replace(/^-+\s*/, '').trim();

const ANESTHESIA_CODE_PREFIXES = ['207L', '367H'];
const PAIN_CODE_PREFIXES = ['208VP', '163WP', '204C', '208X'];
const ASC_CODE_PREFIXES = ['261QA1903X', '261QR0400X', '282NC2000X'];

export const mapTaxonomyToPracticeType = (
  taxonomies: NpiTaxonomy[],
  enumType = '',
): OnboardingPracticeTypeId => {
  const codes = taxonomies.map(t => (t.code || '').toUpperCase());
  const descBlob = taxonomies.map(t => (t.desc || '').toLowerCase()).join(' ');

  const matchesAsc = codes.some(c =>
    ASC_CODE_PREFIXES.some(p => c.startsWith(p) || c.includes('261Q'))
  ) || /ambulatory surgical|surgery center|surgical center/.test(descBlob);

  const matchesAnesthesia = codes.some(c =>
    ANESTHESIA_CODE_PREFIXES.some(p => c.startsWith(p))
  ) || /anesthesi|nurse anesthetist|crna/.test(descBlob);

  const matchesPain = codes.some(c =>
    PAIN_CODE_PREFIXES.some(p => c.startsWith(p))
  ) || /pain medicine|interventional pain|pain management|pain clinic/.test(descBlob);

  const matchesSurgical = /surgeon|surgery|surgical|ophthalmol|otolaryngol|urolog|orthop|gastroenterol|cardiol|podiatr|plastic surgery|vascular/.test(descBlob);

  if (matchesAsc) return 'asc';
  if (matchesAnesthesia) return 'anesthesiology';
  if (matchesPain) return 'pain';
  if (matchesSurgical) return 'surgical';
  if (enumType === 'NPI-2' && /clinic|center|facility|hospital/.test(descBlob)) return 'asc';

  return '';
};

const mapDescSegmentToPracticeType = (segment: string): OnboardingPracticeTypeId => {
  const d = segment.toLowerCase().trim();
  if (!d) return '';
  if (/ambulatory surgical|surgery center|surgical center/.test(d)) return 'asc';
  if (/anesthesi|nurse anesthetist|crna/.test(d)) return 'anesthesiology';
  if (/pain medicine|interventional pain|pain management|pain clinic|\bpain\b/.test(d)) return 'pain';
  if (/surgeon|surgery|surgical|ophthalmol|otolaryngol|urolog|orthop|gastroenterol|cardiol|podiatr|plastic surgery|vascular/.test(d)) {
    return 'surgical';
  }
  return '';
};

/** Maps one taxonomy — splits comma-separated descriptions (e.g. "Anesthesiology, Pain Medicine"). */
export const mapSingleTaxonomyToPracticeTypes = (
  taxonomy: NpiTaxonomy,
  enumType = '',
): OnboardingPracticeTypeId[] => {
  const desc = taxonomy.desc || '';
  const segments = desc.split(',').map(s => s.trim()).filter(Boolean);

  if (segments.length >= 2) {
    const segmentTypes = segments
      .map(seg => mapDescSegmentToPracticeType(seg))
      .filter((t): t is OnboardingPracticeTypeId => t !== '');
    if (segmentTypes.length > 0) {
      return [...new Set(segmentTypes)];
    }
  }

  const single = mapTaxonomyToPracticeType([taxonomy], enumType);
  return single ? [single] : [];
};

export const mapTaxonomiesToPracticeTypes = (
  taxonomies: NpiTaxonomy[],
  enumType = '',
): OnboardingPracticeTypeId[] => {
  const types = taxonomies.flatMap(t => mapSingleTaxonomyToPracticeTypes(t, enumType));
  return [...new Set(types)];
};

export const getSuggestedPracticeTypes = (
  taxonomies: NpiTaxonomy[],
  enumType = '',
): OnboardingPracticeTypeId[] => {
  const fromEach = mapTaxonomiesToPracticeTypes(taxonomies, enumType);
  if (fromEach.length > 0) return fromEach;
  const combined = mapTaxonomyToPracticeType(taxonomies, enumType);
  return combined ? [combined] : [];
};

export const mapTaxonomyToPrimarySpecialty = (taxonomyDesc: string): string => {
  const d = taxonomyDesc.toLowerCase();
  if (d.includes('anesthes')) return 'Anesthesiology';
  if (d.includes('ambulatory surgical') || d.includes('surgery center')) return 'Ambulatory Surgery Center (ASC)';
  if (d.includes('pain')) return 'Pain Medicine / Interventional Pain';
  if (d.includes('orthop')) return 'Orthopedics';
  if (d.includes('otolaryngol') || d.includes('ent')) return 'ENT / Otolaryngology';
  if (d.includes('ophthalmol')) return 'Ophthalmology';
  if (d.includes('urolog')) return 'Urology';
  if (d.includes('general surgery') || d.includes('surgeon')) return 'General Surgery';
  if (d.includes('gastroenterol')) return 'Gastroenterology';
  if (d.includes('cardiol')) return 'Cardiology';
  return '';
};

const parseRegistryResponse = (npi: string, data: Record<string, unknown>): NpiApiData => {
  const basic = (data.basic || data) as Record<string, string>;
  const enumType = String(data.enumeration_type || basic.enumeration_type || '');
  const addressParts = (data.addresses as Record<string, string>[] | undefined)?.[0];
  const rawPhone = addressParts?.telephone_number || basic.telephone_number || String(data.telephone_number || '');
  const phone = rawPhone.replace(/\D/g, '').slice(0, 10);

  const addressLine1 = addressParts?.address_1 || '';
  const addressLine2 = addressParts?.address_2 || '';
  const city = addressParts?.city || '';
  const state = addressParts?.state || '';
  const zip = (addressParts?.postal_code || '').replace(/\D/g, '').slice(0, 5);
  const addr = addressLine1
    ? [
        addressLine1,
        addressLine2,
        [city, state, zip].filter(Boolean).join(', '),
      ].filter(Boolean).join(', ')
    : '';

  const taxonomies = (data.taxonomies as NpiTaxonomy[] | undefined) || [];
  const primaryTaxonomy = taxonomies.find(t => t.primary) || taxonomies[0];
  const primaryTaxonomyCode = primaryTaxonomy?.code || '';
  const primaryTaxonomyDesc = primaryTaxonomy?.desc || '';
  const taxonomyDesc = primaryTaxonomy
    ? `${primaryTaxonomyDesc}${primaryTaxonomyCode ? ` (${primaryTaxonomyCode})` : ''}`
    : '';

  const enumerationDate = basic.enumeration_date
    ? new Date(basic.enumeration_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const lastUpdated = basic.last_updated
    ? new Date(basic.last_updated).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  let orgName = '';
  let contactName = '';
  let title = '';
  let credential = '';
  let fullName = '';
  let firstName = '';
  let lastName = '';
  let displayName = '';

  if (enumType === 'NPI-2') {
    orgName = basic.organization_name || String(data.organization_name || '');
    const aoPrefix = stripDashes(basic.authorized_official_name_prefix || '');
    const aoFirst = stripDashes(basic.authorized_official_first_name || '');
    const aoLast = stripDashes(basic.authorized_official_last_name || '');
    title = basic.authorized_official_title_or_position || '';
    contactName = [aoPrefix, aoFirst, aoLast].filter(Boolean).join(' ').trim();
    displayName = orgName;
  } else if (enumType === 'NPI-1') {
    const prefix = basic.name_prefix && basic.name_prefix !== '--' ? basic.name_prefix : '';
    firstName = basic.first_name || '';
    const middle = basic.middle_name || '';
    lastName = basic.last_name || '';
    const suffix = basic.name_suffix && basic.name_suffix !== '--' ? basic.name_suffix : '';
    credential = basic.credential || '';
    const nameParts = [prefix, firstName, middle, lastName, suffix].filter(Boolean);
    fullName = credential ? `${nameParts.join(' ').trim()}, ${credential}` : nameParts.join(' ').trim();
    displayName = fullName;
    contactName = fullName;
    title = credential;
  }

  const suggestedPracticeTypes = getSuggestedPracticeTypes(taxonomies, enumType);
  const suggestedPracticeType = suggestedPracticeTypes[0] || '';
  const suggestedPrimarySpecialty = mapTaxonomyToPrimarySpecialty(taxonomyDesc);

  return {
    enumType,
    orgName,
    contactName,
    title,
    phone,
    fullName,
    credential,
    firstName,
    lastName,
    displayName,
    taxonomyDesc,
    primaryTaxonomyCode,
    primaryTaxonomyDesc,
    taxonomies,
    enumerationDate,
    lastUpdated,
    addr,
    addressLine1,
    addressLine2,
    city,
    state,
    zip,
    npi,
    status: basic.status || 'Active',
    authorizedOfficial: enumType === 'NPI-2' ? (contactName || '—') : '— (Type 1 NPI)',
    suggestedPracticeType,
    suggestedPracticeTypes,
    suggestedPrimarySpecialty,
  };
};

export const buildPrefillFromNpiData = (npiData: NpiApiData) => {
  const isOrg = npiData.enumType === 'NPI-2';
  const organizationName = isOrg ? npiData.orgName : npiData.fullName;
  const groupLegalName = isOrg ? npiData.orgName : npiData.fullName;

  let organizationType = '';
  if (isOrg) {
    organizationType = npiData.suggestedPracticeType === 'asc' ? 'asc' : 'provider-group';
  } else {
    organizationType = 'solo';
  }

  return {
    npi: npiData.npi,
    npiEnumerationType: npiData.enumType,
    npiConfirmed: true,
    npiApiData: npiData,
    practiceType: npiData.suggestedPracticeTypes[0] || npiData.suggestedPracticeType || '',
    selectedPracticeTypes: npiData.suggestedPracticeTypes.length > 0
      ? npiData.suggestedPracticeTypes
      : npiData.suggestedPracticeType
        ? [npiData.suggestedPracticeType]
        : [],
    firstName: npiData.firstName,
    lastName: npiData.lastName,
    titleRole: npiData.title,
    organizationName,
    contactPhone: npiData.phone,
    primarySpecialty: npiData.suggestedPrimarySpecialty,
    groupLegalName,
    practiceAddress: [npiData.addressLine1, npiData.addressLine2].filter(Boolean).join(', '),
    city: npiData.city,
    state: npiData.state,
    zip: npiData.zip,
    organizationType,
  };
};

export const clearNpiDerivedFields = () => ({
  npi: '',
  npiConfirmed: false,
  npiEnumerationType: '',
  npiApiData: null as NpiApiData | null,
  practiceType: '',
  selectedPracticeTypes: [] as OnboardingPracticeTypeId[],
  confirmedPracticeType: '',
  sectionAContinued: false,
  enrollmentPathwayViewed: false,
  firstName: '',
  lastName: '',
  titleRole: '',
  organizationName: '',
  contactPhone: '',
  primarySpecialty: '',
  organizationType: '',
  groupLegalName: '',
  practiceAddress: '',
  city: '',
  state: '',
  zip: '',
});

export const lookupNpiRegistry = async (npi: string): Promise<NpiApiData> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || '';

    const checkRes = await axios.post(`${apiUrl}/api-early-access/check-npi`, { npi });
    if (!checkRes.data?.success || checkRes.data?.exists === true) {
      throw new Error(checkRes.data?.message || 'This NPI could not be validated. Please check the number and try again.');
    }

    if (allowedTaxonomiesCache === null) {
      const taxRes = await axios.get(`${apiUrl}/taxonomies`);
      if (!taxRes.data?.success || !Array.isArray(taxRes.data.data)) {
        throw new Error('Unable to load eligible specialty list. Please try again.');
      }
      allowedTaxonomiesCache = taxRes.data.data as string[];
    }

    const response = await axios.post(`${apiUrl}/npi/registry`, { npi });
    if (!response.data?.success) {
      throw new Error('NPI not found. Please check the number and try again.');
    }

    const data = (response.data.data || response.data) as Record<string, unknown>;
    const parsed = parseRegistryResponse(npi, data);

    const allowedCodes = allowedTaxonomiesCache || [];
    if (allowedCodes.length > 0) {
      const npiCodes = parsed.taxonomies.map(t => t.code).filter(Boolean) as string[];
      const isEligible = npiCodes.some(code => allowedCodes.includes(code));
      if (!isEligible) {
        throw new Error('The specialty associated with this NPI is not currently included as part of this phase.');
      }
    }

    return parsed;
  } catch (error) {
    throw new Error(formatNpiLookupError(error));
  }
};

export const resetAllowedTaxonomiesCache = () => {
  allowedTaxonomiesCache = null;
};

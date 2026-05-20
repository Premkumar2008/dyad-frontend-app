import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import './EarlyAccess.css';
import LandingHeader from '../components/common/LandingHeader/LandingHeader';
import LandingFooter from '../components/common/LandingFooter/LandingFooter';
import { sendEmailOTP, verifyOTP } from '../services/api';
import { createEmailService } from '../services/emailService';

// ── Validation Schema ───────────────────────────────────────────────────────
const earlyAccessSchema = yup.object({
  npi: yup.string()
    .matches(/^\d{10}$/, 'Invalid NPI Number')
    .required('NPI is required'),
  practiceName: yup.string().required('Practice/Facility name is required'),
  contactName: yup.string().required('Primary contact name is required'),
  phoneNumber: yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
    .required('Phone number is required'),
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'),
  title: yup.string().required('Title/Role is required'),
  practiceType: yup.string().required('Practice type is required'),
  providers: yup.string().required('Number of rendering providers is required'),
  locations: yup.string().required('Number of locations is required'),
  claimVolume: yup.string().required('Estimated monthly claim volume is required'),
});

type EarlyAccessFormData = yup.InferType<typeof earlyAccessSchema>;

// ── Practice Type Options ───────────────────────────────────────────────────
const practiceTypeOptions = [
  { value: '', label: 'Select practice type', group: '' },
  { value: 'anesthesiologist', label: 'Anesthesiologist', group: 'Anesthesia & Perioperative Providers' },
  { value: 'crna', label: 'Certified Registered Nurse Anesthetist', group: 'Anesthesia & Perioperative Providers' },
  { value: 'pain-mgmt-anesthesiologist', label: 'Pain Management Anesthesiologist', group: 'Anesthesia & Perioperative Providers' },
  { value: 'pediatric-anesthesiologist', label: 'Pediatric Anesthesiologist', group: 'Anesthesia & Perioperative Providers' },
  { value: 'orthopedic-surgeon', label: 'Orthopedic Surgeon', group: 'Surgical & Procedural Physicians' },
  { value: 'spine-surgeon', label: 'Spine Surgeon', group: 'Surgical & Procedural Physicians' },
  { value: 'hand-surgeon', label: 'Hand Surgeon', group: 'Surgical & Procedural Physicians' },
  { value: 'sports-medicine-surgeon', label: 'Sports Medicine Surgeon', group: 'Surgical & Procedural Physicians' },
  { value: 'ophthalmologist', label: 'Ophthalmologist', group: 'Surgical & Procedural Physicians' },
  { value: 'retinal-surgeon', label: 'Retinal Surgeon', group: 'Surgical & Procedural Physicians' },
  { value: 'oculoplastic-surgeon', label: 'Oculoplastic Surgeon', group: 'Surgical & Procedural Physicians' },
  { value: 'ent', label: 'Otolaryngologist (ENT)', group: 'Surgical & Procedural Physicians' },
  { value: 'plastic-surgeon', label: 'Plastic Surgeon', group: 'Surgical & Procedural Physicians' },
  { value: 'oral-maxillofacial-surgeon', label: 'Oral & Maxillofacial Surgeon', group: 'Surgical & Procedural Physicians' },
  { value: 'urologist', label: 'Urologist', group: 'Surgical & Procedural Physicians' },
  { value: 'podiatric-surgeon', label: 'Podiatric Surgeon', group: 'Surgical & Procedural Physicians' },
  { value: 'general-surgeon', label: 'General Surgeon', group: 'Surgical & Procedural Physicians' },
  { value: 'colorectal-surgeon', label: 'Colorectal Surgeon', group: 'Surgical & Procedural Physicians' },
  { value: 'bariatric-surgeon', label: 'Bariatric Surgeon', group: 'Surgical & Procedural Physicians' },
  { value: 'vascular-surgeon', label: 'Vascular Surgeon', group: 'Surgical & Procedural Physicians' },
  { value: 'gastroenterologist', label: 'Gastroenterologist (Endoscopy)', group: 'Interventional & Diagnostic Physicians' },
  { value: 'interventional-pain', label: 'Interventional Pain Management Physician', group: 'Interventional & Diagnostic Physicians' },
  { value: 'interventional-radiologist', label: 'Interventional Radiologist', group: 'Interventional & Diagnostic Physicians' },
  { value: 'interventional-cardiologist', label: 'Interventional Cardiologist', group: 'Interventional & Diagnostic Physicians' },
  { value: 'anesthesia-group', label: 'Anesthesia Group', group: 'Specialty Groups' },
  { value: 'pain-mgmt-group', label: 'Pain Management Group', group: 'Specialty Groups' },
  { value: 'orthopedic-group', label: 'Orthopedic Surgery Group', group: 'Specialty Groups' },
  { value: 'spine-group', label: 'Spine Surgery Group', group: 'Specialty Groups' },
  { value: 'ophthalmology-group', label: 'Ophthalmology Group', group: 'Specialty Groups' },
  { value: 'ent-group', label: 'ENT Group', group: 'Specialty Groups' },
  { value: 'plastic-surgery-group', label: 'Plastic Surgery Group', group: 'Specialty Groups' },
  { value: 'gastroenterology-group', label: 'Gastroenterology Group', group: 'Specialty Groups' },
  { value: 'urology-group', label: 'Urology Group', group: 'Specialty Groups' },
  { value: 'podiatry-group', label: 'Podiatry Group', group: 'Specialty Groups' },
  { value: 'general-surgery-group', label: 'General Surgery Group', group: 'Specialty Groups' },
  { value: 'multi-specialty-group', label: 'Multi-Specialty Surgical Group', group: 'Specialty Groups' },
  { value: 'oral-surgery-group', label: 'Oral & Maxillofacial Surgery Group', group: 'Specialty Groups' },
  { value: 'asc', label: 'Ambulatory Surgical Centers', group: 'Facilities' },
  { value: 'outpatient-facility', label: 'Outpatient Specialty Facilities', group: 'Facilities' },
  { value: 'pain-clinic', label: 'Pain Management Clinic/Center', group: 'Facilities' },
  { value: 'interventional-pain-center', label: 'Interventional Pain Center', group: 'Facilities' },
  { value: 'spine-orthopedic-center', label: 'Spine & Orthopedic Center', group: 'Facilities' },
  { value: 'sports-medicine-clinic', label: 'Sports Medicine Clinic', group: 'Facilities' },
  { value: 'endoscopy-center', label: 'Endoscopy Center', group: 'Facilities' },
  { value: 'ophthalmology-center', label: 'Ophthalmology Surgery Center', group: 'Facilities' },
  { value: 'podiatry-center', label: 'Podiatry Surgical Center', group: 'Facilities' },
  { value: 'oral-surgery-center', label: 'Oral Surgery Center', group: 'Facilities' },
  { value: 'cosmetic-surgery-center', label: 'Cosmetic Surgery Center', group: 'Facilities' },
];

const providersOptions = [
  { value: '', label: 'Select number of providers' },
  { value: '1', label: '1' },
  { value: '2-5', label: '2 to 5' },
  { value: '6-10', label: '6 to 10' },
  { value: '11-20', label: '11 to 20' },
  { value: '21-50', label: '21 to 50' },
  { value: '51-100', label: '51 to 100' },
  { value: '100+', label: '100+' },
];

const locationsOptions = [
  { value: '', label: 'Select number of locations' },
  { value: 'single', label: 'Single location' },
  { value: 'multi-2-5', label: 'Multi-site (2–5)' },
  { value: 'multi-5+', label: 'Multi-site (5+)' },
];

const claimVolumeOptions = [
  { value: '', label: 'Select monthly claim volume' },
  { value: '<200', label: '< 200' },
  { value: '200-500', label: '200 to 500' },
  { value: '500-1000', label: '500 to 1,000' },
  { value: '1000+', label: '1,000+' },
];

// ── Group options for dropdown ──────────────────────────────────────────────
const groupedPracticeTypes = practiceTypeOptions.reduce<Record<string, typeof practiceTypeOptions>>((acc, option) => {
  if (option.group) {
    if (!acc[option.group]) acc[option.group] = [];
    acc[option.group].push(option);
  }
  return acc;
}, {});

const groupOrder = [
  'Anesthesia & Perioperative Providers',
  'Surgical & Procedural Physicians',
  'Interventional & Diagnostic Physicians',
  'Specialty Groups',
  'Facilities',
];

// ── Section config ──────────────────────────────────────────────────────────
const SECTION_TITLES: Record<number, string> = {
  1: 'Practice & Facility Details',
  2: 'Practice Type',
  3: 'Operational Profile',
  4: 'Early Release Cohort Acknowledgement',
};

const SECTION_DESCRIPTIONS: Record<number, string> = {
  1: 'Tell us about your practice or facility and the primary point of contact for this request.',
  2: 'Select the option that best describes your organization. Categories are grouped by clinical specialty and facility type.',
  3: 'Help us understand the scale and footprint of your operations.',
  4: '',
};

const SECTION_FIELDS: Record<number, (keyof EarlyAccessFormData)[]> = {
  1: ['npi', 'practiceName', 'contactName', 'phoneNumber', 'email', 'title'],
  2: ['practiceType'],
  3: ['providers', 'locations', 'claimVolume'],
  4: [],
};

// ── Sidebar cohort terms ────────────────────────────────────────────────────
const cohortTermRows: { label: string; value: React.ReactNode }[] = [
  {
    label: 'MONTHS 1–6',
    value: <><strong className="ea-sidebar-row-highlight">No platform fees.</strong> Full access to all integrated services described in your commercial proposal.</>,
  },
  {
    label: 'MONTHS 7–12',
    value: <><strong className="ea-sidebar-row-highlight">Preferred rate</strong> reflecting your contribution as an Early Release Cohort partner. Specific terms set forth in the Master Services Agreement.</>,
  },
  {
    label: 'MONTH 13 +',
    value: 'Standard commercial terms apply, at the Tier-based pricing established in your proposal. The preferred rate does not extend beyond the first twelve months.',
  },
  {
    label: 'FEEDBACK',
    value: 'Feedback will be gathered weekly in an organized and coordinated manner; this may require written feedback or feedback in a collaborative virtual feedback session.',
  },
  {
    label: 'COHORT OPT-OUT',
    value: 'Participation in the Early Release Cohort feedback program is voluntary. A cohort partner electing to discontinue cohort participation will have the option to convert to standard commercial terms in accordance with the Master Services Agreement, including any applicable rate adjustments and provisions set forth therein.',
  },
];

// ── Component ───────────────────────────────────────────────────────────────
const EarlyAccess: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedCompleted, setExpandedCompleted] = useState<number | null>(null);
  const [acknowledgementAccepted, setAcknowledgementAccepted] = useState(false);
  const [mobileStickyBar, setMobileStickyBar] = useState(false);
  const subHeaderRef = useRef<HTMLDivElement>(null);
  const mobileProgressRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // ── NPI state ──────────────────────────────────────────
  const [isNpiValidating, setIsNpiValidating] = useState(false);
  const [npiValidated, setNpiValidated] = useState(false);
  const [npiEnumerationType, setNpiEnumerationType] = useState('');
  const [npiApiError, setNpiApiError] = useState('');
  const [npiApiData, setNpiApiData] = useState<any>(null);
  const [npiConfirmed, setNpiConfirmed] = useState(false);
  const [showNpiPanel, setShowNpiPanel] = useState(false);

  // ── OTP state ──────────────────────────────────────────
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpExpireTimer, setOtpExpireTimer] = useState(0);
  const verifiedEmailRef = useRef<string>('');
  const allowedTaxonomiesRef = useRef<string[] | null>(null);
  const [emailRegistered, setEmailRegistered] = useState(false);
  const [emailRegisteredMsg, setEmailRegisteredMsg] = useState('');

  const { register, handleSubmit, trigger, watch, getValues, setValue, clearErrors, formState: { errors } } = useForm({
    resolver: yupResolver(earlyAccessSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Measure header heights and expose as CSS variables so fixed sub-header
  // and scroll offsets stay accurate across breakpoints.
  useEffect(() => {
    const measure = () => {
      const headerEl = document.querySelector('.dyad-header') as HTMLElement;
      const subEl = subHeaderRef.current;
      const hh = headerEl ? headerEl.offsetHeight : 72;
      const sh = subEl ? subEl.offsetHeight : 68;
      document.documentElement.style.setProperty('--dyad-header-h', `${hh}px`);
      document.documentElement.style.setProperty('--ea-subheader-h', `${sh}px`);
    };
    measure();
    // Re-measure after paint so mobile layout (subtitle visible, stacked) is reflected
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);

    // Watch the sub-header element itself for size changes (e.g. layout shifts)
    let ro: ResizeObserver | null = null;
    if (subHeaderRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      ro.observe(subHeaderRef.current);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, []);

  // Show fixed progress bar on mobile only after the in-flow progress bar scrolls away
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const el = mobileProgressRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setMobileStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (formSubmitted) {
      setTimeout(() => {
        const el = document.getElementById('ea-success-block');
        if (el) {
          const hh = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--dyad-header-h') || '72', 10);
          const sh = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ea-subheader-h') || '68', 10);
          const top = el.getBoundingClientRect().top + window.pageYOffset - hh - sh - 16;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 150);
    }
  }, [formSubmitted]);

  // Countdown timers
  useEffect(() => {
    if (otpTimer <= 0) return;
    const id = setTimeout(() => setOtpTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [otpTimer]);

  useEffect(() => {
    if (otpExpireTimer <= 0) return;
    const id = setTimeout(() => setOtpExpireTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [otpExpireTimer]);

  // Reset OTP + email-check state whenever email field changes
  const watchedEmail = watch('email');
  const watchedNpi = watch('npi');
  const watchedPracticeName = watch('practiceName');
  const watchedContactName = watch('contactName');
  const watchedPhoneNumber = watch('phoneNumber');
  const watchedTitle = watch('title');
  const watchedPracticeType = watch('practiceType');
  const watchedProviders = watch('providers');
  const watchedLocations = watch('locations');
  const watchedClaimVolume = watch('claimVolume');
  useEffect(() => {
    if (otpVerified && watchedEmail !== verifiedEmailRef.current) {
      setOtpVerified(false);
      setOtpSent(false);
      setOtpDigits(['', '', '', '', '', '']);
    }
    setEmailRegistered(false);
    setEmailRegisteredMsg('');
  }, [watchedEmail]);

  const progress = Math.round((completedSteps.size / 4) * 100);

  const isSectionReady = (step: number): boolean => {
    switch (step) {
      case 1: return !!(watchedPracticeName && watchedContactName && watchedPhoneNumber?.length === 10 && watchedTitle && otpVerified);
      case 2: return !!watchedPracticeType;
      case 3: return !!(watchedProviders && watchedLocations && watchedClaimVolume);
      case 4: return acknowledgementAccepted;
      default: return false;
    }
  };

  // ── Sidebar scroll + highlight ─────────────────────────
  const scrollToSidebar = () => {
    const el = sidebarRef.current;
    if (!el) return;
    if (window.innerWidth <= 900) {
      const hh = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--dyad-header-h') || '72', 10);
      const sh = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ea-subheader-h') || '68', 10);
      const top = el.getBoundingClientRect().top + window.pageYOffset - hh - sh - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    el.classList.remove('ea-sidebar-box--highlight');
    void el.offsetWidth;
    el.classList.add('ea-sidebar-box--highlight');
  };

  // ── Scroll helper ──────────────────────────────────────
  const scrollToSection = (step: number) => {
    const el = document.getElementById(`ea-section-${step}`);
    if (el) {
      const hh = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--dyad-header-h') || '72', 10);
      const sh = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ea-subheader-h') || '68', 10);
      // Match sidebar sticky top (hh + sh + 2rem) so section aligns with sidebar top
      const offset = hh + sh + 32;
      const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // ── NPI lookup ─────────────────────────────────────────
  const validateNPI = async (npi: string) => {
    if (npi.length !== 10) return;
    setIsNpiValidating(true);
    setNpiValidated(false);
    setNpiApiError('');
    setShowNpiPanel(false);
    setNpiConfirmed(false);
    setNpiApiData(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';

      // Step 1: pre-validate NPI against internal registry — hard stop if rejected or already submitted
      const checkRes = await axios.post(`${apiUrl}/api-early-access/check-npi`, { npi });
      if (!checkRes.data?.success || checkRes.data?.exists === true) {
        throw new Error(checkRes.data?.message || 'This NPI could not be validated. Please check the number and try again.');
      }

      // Fetch allowed taxonomy codes once and cache them — hard stop if unavailable
      if (allowedTaxonomiesRef.current === null) {
        const taxRes = await axios.get(`${apiUrl}/taxonomies`);
        if (!taxRes.data?.success || !Array.isArray(taxRes.data.data)) {
          throw new Error('Unable to load eligible specialty list. Please try again.');
        }
        allowedTaxonomiesRef.current = taxRes.data.data as string[];
      }

      const response = await axios.post(`${apiUrl}/npi/registry`, { npi });
      if (response.data.success) {
        const data = response.data.data || response.data;
        const basic = data.basic || data;
        const enumType: string = data.enumeration_type || basic.enumeration_type || '';
        const rawPhone: string = data?.addresses?.[0]?.telephone_number || basic.telephone_number || '';
        const phone = rawPhone.replace(/\D/g, '').slice(0, 10);

        const addressParts = data?.addresses?.[0];
        const addr = addressParts
          ? [
              addressParts.address_1,
              addressParts.address_2,
              [addressParts.city, addressParts.state, addressParts.postal_code].filter(Boolean).join(', '),
            ].filter(Boolean).join(', ')
          : '';

        const taxonomies = data?.taxonomies || [];
        const primaryTaxonomy = taxonomies.find((t: any) => t.primary) || taxonomies[0];
        const taxonomyDesc = primaryTaxonomy
          ? `${primaryTaxonomy.desc || ''}${primaryTaxonomy.code ? ` (${primaryTaxonomy.code})` : ''}`
          : '';

        const enumerationDate = basic.enumeration_date
          ? new Date(basic.enumeration_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : '';
        const lastUpdated = basic.last_updated
          ? new Date(basic.last_updated).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          : '';

        let displayName = '';
        let orgName = '';
        let contactName = '';
        let title = '';
        let credential = '';
        let fullName = '';

        if (enumType === 'NPI-2') {
          orgName = basic.organization_name || data.organization_name || '';
          const stripDashes = (v: string) => v.replace(/^-+\s*/, '').trim();
          const aoPrefix = stripDashes(basic.authorized_official_name_prefix || '');
          const aoFirst = stripDashes(basic.authorized_official_first_name || '');
          const aoLast = stripDashes(basic.authorized_official_last_name || '');
          title = basic.authorized_official_title_or_position || '';
          contactName = [aoPrefix, aoFirst, aoLast].filter(Boolean).join(' ').trim();
          displayName = orgName;
        } else if (enumType === 'NPI-1') {
          const prefix = basic.name_prefix && basic.name_prefix !== '--' ? basic.name_prefix : '';
          const first = basic.first_name || '';
          const middle = basic.middle_name || '';
          const last = basic.last_name || '';
          const suffix = basic.name_suffix && basic.name_suffix !== '--' ? basic.name_suffix : '';
          credential = basic.credential || '';
          const nameParts = [prefix, first, middle, last, suffix].filter(Boolean);
          fullName = credential ? `${nameParts.join(' ').trim()}, ${credential}` : nameParts.join(' ').trim();
          displayName = fullName;
          contactName = fullName;
        }

        // Taxonomy eligibility check
        const allowedCodes = allowedTaxonomiesRef.current || [];
        if (allowedCodes.length > 0) {
          const npiCodes: string[] = (taxonomies as any[]).map((t: any) => t.code).filter(Boolean);
          const isEligible = npiCodes.some(code => allowedCodes.includes(code));
          if (!isEligible) {
            setNpiApiError(
              'The specialty associated with this NPI is not currently included as part of this phase.'
            );
            return;
          }
        }

        setNpiApiData({
          enumType, orgName, contactName, title, phone, fullName, credential,
          displayName, taxonomyDesc, enumerationDate, lastUpdated, addr, npi,
          status: basic.status || 'Active',
          authorizedOfficial: enumType === 'NPI-2' ? (contactName || '—') : '— (Type 1 NPI)',
        });
        setNpiEnumerationType(enumType);
        setShowNpiPanel(true);
      } else {
        setNpiApiError('NPI not found. Please check the number and try again.');
      }
    } catch (err: any) {
      allowedTaxonomiesRef.current = null; // reset so next attempt re-fetches
      setNpiApiError(err?.message || 'Something went wrong. Please try again later.');
    } finally {
      setIsNpiValidating(false);
    }
  };

  const handleNpiVerify = async () => {
    const isValid = await trigger('npi' as any);
    if (!isValid) return;
    const npi = getValues('npi' as any);
    await validateNPI(npi);
  };

  const handleNpiConfirm = () => {
    if (!npiApiData) return;
    const { enumType, orgName, contactName, title, phone, fullName, credential } = npiApiData;
    if (enumType === 'NPI-2') {
      setValue('practiceName' as any, orgName);
      setValue('contactName' as any, contactName);
      setValue('title' as any, title);
    } else if (enumType === 'NPI-1') {
      setValue('practiceName' as any, fullName);
      setValue('contactName' as any, fullName);
      setValue('title' as any, credential);
    }
    if (phone) setValue('phoneNumber' as any, phone);
    clearErrors(['npi', 'practiceName', 'contactName', 'title', 'phoneNumber'] as any);
    setNpiValidated(true);
    setNpiConfirmed(true);
    setShowNpiPanel(false);
  };

  // ── OTP digit handlers ─────────────────────────────────
  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    pasted.split('').forEach((ch, i) => { newDigits[i] = ch; });
    setOtpDigits(newDigits);
    const nextEmpty = pasted.length < 6 ? pasted.length : 5;
    otpInputRefs.current[nextEmpty]?.focus();
  };

  const handleSendOTP = async () => {
    const isEmailValid = await trigger('email' as any);
    if (!isEmailValid) return;

    const email = getValues('email' as any);
    setOtpLoading(true);
    setEmailRegistered(false);
    setEmailRegisteredMsg('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const checkRes = await axios.post(`${apiUrl}/api-early-access/check-email`, { email });

      if (checkRes.data.exists) {
        setEmailRegistered(true);
        setEmailRegisteredMsg(checkRes.data.message);
        return;
      }

      await sendEmailOTP(email);
      setOtpSent(true);
      setOtpTimer(60);
      setOtpExpireTimer(600);
      toast.success('OTP sent to your email!');
    } catch (error: any) {
      const msg = error.response?.data?.message;
      if (error.response?.data?.exists === null) {
        toast.error(msg || 'Please provide a valid email address.');
      } else {
        toast.error(msg || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otpDigits.join('');
    if (otpValue.length !== 6) return;
    setOtpLoading(true);
    try {
      await verifyOTP({ email: getValues('email' as any), otp: otpValue });
      verifiedEmailRef.current = getValues('email' as any);
      setOtpVerified(true);
      setOtpSent(false);
      toast.success('Email verified successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const toggleCompleted = (step: number) => {
    if (formSubmitted) return;
    setExpandedCompleted(prev => prev === step ? null : step);
  };

  const handleContinue = async (step: number) => {
    // Step 1 (Practice Details): requires OTP verification
    if (step === 1 && !otpVerified) {
      toast.error('Please verify your email before continuing.');
      return;
    }

    // Step 4 (Acknowledgement): requires checkbox
    if (step === 4 && !acknowledgementAccepted) {
      toast.error('Please acknowledge the cohort terms to continue.');
      return;
    }

    const isValid = await trigger(SECTION_FIELDS[step] as any);
    if (!isValid) return;

    setCompletedSteps(prev => new Set([...prev, step]));
    setExpandedCompleted(null);

    if (step < 4) {
      const nextStep = step + 1;
      if (completedSteps.has(nextStep)) {
        setExpandedCompleted(nextStep);
      } else {
        setCurrentStep(nextStep);
      }
      setTimeout(() => scrollToSection(nextStep), 420);
    } else {
      if (currentStep <= 4) setCurrentStep(5);
    }
  };

  const onSubmit = async (data: EarlyAccessFormData) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Submitting intake form...', { duration: 7000 });

    const payload = {
      npi: data.npi || '',
      practiceName: data.practiceName,
      contactName: data.contactName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      title: data.title,
      practiceType: data.practiceType,
      providers: data.providers,
      locations: data.locations,
      claimVolume: String(data.claimVolume),
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      await axios.post(`${apiUrl}/api-early-access`, payload);

      toast.dismiss(toastId);
      toast.success('Intake submitted successfully!', { duration: 7000, icon: '✅' });

      setFormSubmitted(true);
      localStorage.setItem('earlyAccessSubmitted', new Date().toISOString());

      try {
        const emailService = createEmailService();
        const logoUrl = `${window.location.origin}/assets/images/logo_main.png`;
        await emailService.sendEarlyAccessConfirmation(data.email, data.contactName, data.practiceName, logoUrl);
      } catch (emailError) {
        console.error('Confirmation email failed:', emailError);
      }
    } catch (error: any) {
      toast.dismiss(toastId);

      if (error.response?.status === 429) {
        toast.error('Please wait a moment before submitting again.', { duration: 7000, icon: '⚠️' });
      } else {
        toast.error(
          error.response?.data?.message || 'Failed to submit intake. Please try again.',
          { duration: 7000, icon: '❌' }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepStatus = (step: number): 'completed' | 'active' | 'locked' => {
    if (completedSteps.has(step)) return 'completed';
    if (step <= currentStep) return 'active';
    return 'locked';
  };

  const renderStepIcon = (step: number) => {
    const status = getStepStatus(step);
    if (status === 'completed') {
      return (
        <div className="ea-step-icon ea-step-icon--completed">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 9l3.5 3.5L14 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );
    }
    return (
      <div className={`ea-step-icon ea-step-icon--${status}`}>
        {step}
      </div>
    );
  };

  const formatExpireTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="early-access-container">
      <LandingHeader hideEarlyAccess />

      {/* ── Sticky sub-header (mobile: hidden until in-flow bar scrolls away) ── */}
      <div className={`ea-sub-header${mobileStickyBar ? '' : ' ea-sub-header--mobile-hidden'}`} ref={subHeaderRef}>
        <div className="ea-sub-header-inner">
          <div className="ea-sub-header-left">
            <h1 className="ea-sub-header-title">Request Early Access</h1>
            <p className="ea-sub-header-subtitle">Dyad's platform launches Q3 2026. A limited number of practices and facilities will be invited to participate as an early release cohort partner.</p>
          </div>
          <div className="ea-sub-header-right">
            <div className="ea-progress-top-row">
              <span className="ea-progress-label">SECTION {completedSteps.size} OF 4</span>
              <span className="ea-progress-pct-right">{progress}%</span>
            </div>
            <div className="ea-progress-track">
              <div className="ea-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <main className="early-access-main">
        {/* ── Mobile-only intro (title + subtitle + progress bar, scrolls away) ── */}
        <div className="ea-mobile-intro">
          
          <h1 className="ea-mobile-intro-title">Request Early Access</h1>
          <p className="ea-mobile-intro-subtitle  ea-mobile-intro-container">Dyad's platform launches Q3 2026. A limited number of practices and facilities will be invited to participate as an early release cohort partner.</p>
          <div ref={mobileProgressRef} className="ea-mobile-progress-row">
            <span className="ea-progress-label">SECTION {completedSteps.size} OF 4</span>
            <div className="ea-progress-track">
              <div className="ea-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="ea-progress-pct-right">{progress}%</span>
          </div>
        </div>

        <div className="early-access-content">
          <div className="ea-two-col">

            {/* ── Left Sidebar ── */}
            <aside className="ea-sidebar">
              <div className="ea-sidebar-box" ref={sidebarRef}>
                <div className="ea-sidebar-header">
                  <h2 className="ea-sidebar-title">Join Our Early Release Cohort</h2>
                  {acknowledgementAccepted ? (
                    <span className="ea-sidebar-badge ea-sidebar-badge--acked">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <circle cx="6" cy="6" r="6" fill="#00a7d8" />
                        <path d="M3 6l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      ACKNOWLEDGED
                    </span>
                  ) : (
                    <span className="ea-sidebar-badge ea-sidebar-badge--pending">Please Acknowledge</span>
                  )}
                </div>
                <p className="ea-sidebar-desc">
                 Selected providers will receive Dyad's full platform and services <span className='ea-sidebar-desc-highlight'> at no cost for the first six months </span>. As an Early Release Cohort Partner, you have an opportunity to shape how the platform works for you.
                </p>
                <div className="ea-sidebar-table">
                  {cohortTermRows.map((row) => (
                    <div key={row.label} className="ea-sidebar-row">
                      <span className="ea-sidebar-row-label">{row.label}</span>
                      <span className="ea-sidebar-row-value">{row.value}</span>
                    </div>
                  ))}
                </div>
             
              </div>
            </aside>

            {/* ── Right Form Column ── */}
            <div className="ea-form-col">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>

                {/* ── Accordion sections ── */}
                {([1, 2, 3, 4] as const).map(step => {
                  const status = getStepStatus(step);
                  const isExpanded = status === 'active' || (status === 'completed' && expandedCompleted === step);

                  return (
                    <div
                      key={step}
                      id={`ea-section-${step}`}
                      className={`ea-section ea-section--${status}`}
                    >
                      <div
                        className={`ea-section-header${status === 'completed' ? ' ea-section-header--clickable' : ''}${isExpanded ? ' ea-section-header--has-border' : ''}`}
                        onClick={status === 'completed' ? () => toggleCompleted(step) : undefined}
                        aria-expanded={isExpanded}
                      >
                        {renderStepIcon(step)}
                        <div className="ea-section-info">
                          <span className="ea-section-title">{SECTION_TITLES[step]}</span>
                          {status === 'completed' && (
                            <span className="ea-section-status ea-section-status--completed">Complete ✓</span>
                          )}
                          {status === 'active' && (
                            <span className="ea-section-status ea-section-status--active">In progress — complete to continue</span>
                          )}
                          {status === 'locked' && (
                            <span className="ea-section-status ea-section-status--locked">Complete previous section to unlock</span>
                          )}
                        </div>
                        <svg
                          className={`ea-section-chevron${isExpanded ? ' ea-section-chevron--open' : ''}`}
                          width="20" height="20" viewBox="0 0 20 20" fill="none"
                          aria-hidden="true"
                        >
                          <path d="M5 8l5 5 5-5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>

                      {/* Animated body */}
                      <div className={`ea-section-body${isExpanded ? ' ea-section-body--open' : ''}`}>
                        <div className="ea-section-body-inner">
                          <div className="ea-section-body-content">

                            {/* Section description */}
                            <p className="ea-section-desc">{SECTION_DESCRIPTIONS[step]}</p>

                            {/* ── Section 4: Acknowledgement ── */}
                            {step === 4 && (
                              <div className="ea-ack-section">
                                <div className="ea-ack-card">
                                  <label className={`ea-ack-checkbox-label${formSubmitted ? ' ea-ack-checkbox-label--disabled' : ''}`}>
                                    <input
                                      type="checkbox"
                                      className="ea-ack-checkbox"
                                      checked={acknowledgementAccepted}
                                      onChange={e => !formSubmitted && setAcknowledgementAccepted(e.target.checked)}
                                      disabled={formSubmitted}
                                    />
                                    <span>
                                      I have read and understand the <a href="#ea-sidebar" className="ea-ack-sidebar-link" onClick={e => { e.preventDefault(); e.stopPropagation(); scrollToSidebar(); }}>purpose, terms, and feedback expectations of the Early Release Cohort</a> set forth above, and I am willing to <span className='ea-sidebar-desc-highlight'>proceed</span> on that basis.
                                    </span>
                                  </label>
                                  <hr className='sperator-ack-section' />
                                  <small className='ea-ack-section-small'>No engagement will commence until all operationally required documents including the Master Services Agreement, Confidentiality Agreement, Business Associate Agreement, and a defined fee schedule have been formally executed by both parties. This acknowledgment does not constitute a binding commercial agreement.</small>
                                </div>
                               
                              </div>
                            )}

                            {/* ── Section 1: Practice & Facility Details ── */}
                            {step === 1 && (
                              <div className="form-grid">

                                {/* NPI field + verify button */}
                                <div className="form-field form-field--full">
                                  <label htmlFor="npi">Practice or Provider NPI <span className="ea-required">*</span></label>
                                  <p className="ea-field-hint">10-digit National Provider Identifier — Type 1 (individual) or Type 2 (organization). Verified live against the CMS NPPES registry.</p>
                                  <div className="ea-npi-row">
                                    <input
                                      id="npi"
                                      type="text"
                                      inputMode="numeric"
                                      {...register('npi')}
                                      className={`${errors.npi ? 'error' : ''} ${npiValidated ? 'ea-npi-success' : ''}`}
                                      placeholder="Enter 10-digit NPI number"
                                      maxLength={10}
                                      onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        e.target.value = val;
                                        register('npi').onChange(e);
                                        if (val.length < 10) {
                                          setNpiValidated(false);
                                          setNpiEnumerationType('');
                                          setNpiApiError('');
                                          setShowNpiPanel(false);
                                          setNpiApiData(null);
                                        }
                                      }}
                                      disabled={isNpiValidating || npiConfirmed || formSubmitted}
                                    />
                                    <button
                                      type="button"
                                      className="ea-npi-verify-btn"
                                      onClick={handleNpiVerify}
                                      disabled={isNpiValidating || npiConfirmed || formSubmitted || !watchedNpi || watchedNpi.length !== 10}
                                    >
                                      {isNpiValidating
                                        ? <><span className="spinner spinner--blue ea-spinner-sm" /> Verifying…</>
                                        : 'Verify NPI'
                                      }
                                    </button>
                                  </div>
                                  {errors.npi && <span className="error-message">{errors.npi.message}</span>}
                                  {!errors.npi && npiApiError && <span className="error-message">{npiApiError}</span>}

                                  {/* Verified success panel */}
                                  {npiConfirmed && npiApiData && (
                                    <div className="ea-npi-verified-panel" style={{ marginTop: '0.75rem' }}>
                                      <div className="ea-npi-verified-left">
                                        <div className="ea-npi-verified-icon">
                                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                            <circle cx="9" cy="9" r="9" fill="#22c55e" />
                                            <path d="M4.5 9l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        </div>
                                        <div className="ea-npi-verified-info">
                                          <div className="ea-npi-verified-title">Verified via NPPES</div>
                                          <div className="ea-npi-verified-sub">
                                            {npiApiData.displayName}&nbsp;·&nbsp;NPI {npiApiData.npi}
                                            {!formSubmitted && (
                                              <button
                                                type="button"
                                                className="ea-npi-change-btn"
                                                onClick={() => {
                                                  setNpiConfirmed(false);
                                                  setNpiValidated(false);
                                                  setShowNpiPanel(false);
                                                  setNpiApiData(null);
                                                  setValue('npi' as any, '');
                                                }}
                                              >
                                                Change
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* NPPES confirmation panel */}
                                  {showNpiPanel && npiApiData && (
                                    <div className="ea-npi-panel">
                                      <div className="ea-npi-panel-header">
                                        <div className="ea-npi-cms-badge">CMS</div>
                                        <div className="ea-npi-panel-title-area">
                                          <div className="ea-npi-panel-title">NPPES Registry Lookup</div>
                                          <div className="ea-npi-panel-subtitle">National Plan &amp; Provider Enumeration System</div>
                                        </div>
                                        <div className="ea-npi-match-badge">✓ Match Found</div>
                                      </div>

                                      <div className="ea-npi-panel-body">
                                        <h3 className="ea-npi-provider-name">{npiApiData.displayName}</h3>
                                        <div className="ea-npi-type-row">
                                          <span className="ea-npi-type-badge">
                                            TYPE {npiApiData.enumType === 'NPI-1' ? '1' : '2'} · {npiApiData.enumType === 'NPI-1' ? 'INDIVIDUAL' : 'ORGANIZATION'}
                                          </span>
                                          <span className="ea-npi-status-text">
                                            {npiApiData.status}{npiApiData.lastUpdated ? ` · Last updated ${npiApiData.lastUpdated}` : ''}
                                          </span>
                                        </div>

                                        <div className="ea-npi-detail-grid">
                                          <div className="ea-npi-detail-cell">
                                            <div className="ea-npi-detail-label">PRIMARY TAXONOMY</div>
                                            <div className="ea-npi-detail-value">{npiApiData.taxonomyDesc || '—'}</div>
                                          </div>
                                          <div className="ea-npi-detail-cell">
                                            <div className="ea-npi-detail-label">ENUMERATION DATE</div>
                                            <div className="ea-npi-detail-value ea-npi-detail-value--bold">{npiApiData.enumerationDate || '—'}</div>
                                          </div>
                                          {npiApiData.addr && (
                                            <div className="ea-npi-detail-cell ea-npi-detail-cell--full">
                                              <div className="ea-npi-detail-label">PRACTICE LOCATION</div>
                                              <div className="ea-npi-detail-value ea-npi-detail-value--bold">{npiApiData.addr}</div>
                                            </div>
                                          )}
                                          <div className="ea-npi-detail-cell">
                                            <div className="ea-npi-detail-label">AUTHORIZED OFFICIAL</div>
                                            <div className="ea-npi-detail-value">{npiApiData.authorizedOfficial}</div>
                                          </div>
                                          <div className="ea-npi-detail-cell">
                                            <div className="ea-npi-detail-label">NPI</div>
                                            <div className="ea-npi-detail-value ea-npi-detail-value--bold">{npiApiData.npi}</div>
                                          </div>
                                        </div>

                                        <div className="ea-npi-panel-actions">
                                          <button type="button" className="ea-npi-confirm-btn" onClick={handleNpiConfirm}>
                                            ✓ Confirm — this is my practice
                                          </button>
                                          <button
                                            type="button"
                                            className="ea-npi-wrong-btn"
                                            onClick={() => { setShowNpiPanel(false); setNpiApiData(null); }}
                                          >
                                            Not the right entity?
                                          </button>
                                        </div>

                                        <div className="ea-npi-panel-footer">
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.5 }}>
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                          </svg>
                                          <span>
                                            Sourced from the public NPPES API maintained by the Centers for Medicare &amp; Medicaid Services. No PHI is retrieved or stored.
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="form-field">
                                  <label htmlFor="practiceName">Practice/Facility Name <span className="ea-required">*</span></label>
                                  <input
                                    id="practiceName"
                                    type="text"
                                    {...register('practiceName')}
                                    className={errors.practiceName ? 'error' : ''}
                                    placeholder="Enter practice or facility name"
                                    disabled={npiConfirmed || formSubmitted}
                                  />
                                  {errors.practiceName && (
                                    <span className="error-message">{errors.practiceName.message}</span>
                                  )}
                                </div>

                                <div className="form-field">
                                  <label htmlFor="contactName">Primary Contact Name <span className="ea-required">*</span></label>
                                  <input
                                    id="contactName"
                                    type="text"
                                    {...register('contactName')}
                                    className={errors.contactName ? 'error' : ''}
                                    placeholder="Enter primary contact name"
                                    disabled={formSubmitted}
                                  />
                                  {errors.contactName && (
                                    <span className="error-message">{errors.contactName.message}</span>
                                  )}
                                </div>

                                <div className="form-field">
                                  <label htmlFor="phoneNumber">Phone Number <span className="ea-required">*</span></label>
                                  <input
                                    id="phoneNumber"
                                    type="tel"
                                    {...register('phoneNumber')}
                                    className={errors.phoneNumber ? 'error' : ''}
                                    placeholder="10-digit phone number"
                                    maxLength={10}
                                    disabled={formSubmitted}
                                  />
                                  {errors.phoneNumber && (
                                    <span className="error-message">{errors.phoneNumber.message}</span>
                                  )}
                                </div>

                                <div className="form-field">
                                  <label htmlFor="title">Title / Role <span className="ea-required">*</span></label>
                                  <input
                                    id="title"
                                    type="text"
                                    {...register('title')}
                                    className={errors.title ? 'error' : ''}
                                    placeholder="e.g., Practice Administrator, CEO, Medical Director"
                                    disabled={formSubmitted}
                                  />
                                  {errors.title && (
                                    <span className="error-message">{errors.title.message}</span>
                                  )}
                                </div>

                                <div className="form-field form-field--full">
                                  <label htmlFor="email">Email <span className="ea-required">*</span></label>
                                  <p className="ea-field-hint">A 6-digit one-time passcode will be sent to confirm this address.</p>

                                  <div className="ea-email-row">
                                    <input
                                      id="email"
                                      type="email"
                                      {...register('email')}
                                      className={errors.email ? 'error' : ''}
                                      placeholder="Enter email address"
                                      disabled={otpVerified || formSubmitted}
                                    />
                                    <button
                                      type="button"
                                      className="ea-otp-send-btn"
                                      onClick={handleSendOTP}
                                      disabled={otpVerified || otpLoading || formSubmitted || !watchedEmail || !!errors.email}
                                    >
                                      {otpLoading && !otpSent ? <span className="spinner spinner--blue ea-spinner-sm" /> : null}
                                      {otpSent ? 'Resend OTP' : 'Send OTP'}
                                    </button>
                                  </div>
                                  {errors.email && (
                                    <span className="error-message">{errors.email.message}</span>
                                  )}

                                  {/* Email verified success panel */}
                                  {otpVerified && (
                                    <div className="ea-npi-verified-panel" style={{ marginTop: '0.75rem' }}>
                                      <div className="ea-npi-verified-left">
                                        <div className="ea-npi-verified-icon">
                                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                            <circle cx="9" cy="9" r="9" fill="#22c55e" />
                                            <path d="M4.5 9l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        </div>
                                        <div className="ea-npi-verified-info">
                                          <div className="ea-npi-verified-title">Verified via Email</div>
                                          <div className="ea-npi-verified-sub">
                                            {verifiedEmailRef.current}
                                            {!formSubmitted && (
                                              <button
                                                type="button"
                                                className="ea-npi-change-btn"
                                                onClick={() => {
                                                  setOtpVerified(false);
                                                  setOtpSent(false);
                                                  setOtpDigits(['', '', '', '', '', '']);
                                                }}
                                              >
                                                Change
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <span className="ea-npi-verified-time">just now</span>
                                    </div>
                                  )}

                                  {emailRegistered && (
                                    <div className="ea-email-registered">
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }}>
                                        <circle cx="8" cy="8" r="7" stroke="#d97706" strokeWidth="1.5" />
                                        <path d="M8 5v3.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
                                        <circle cx="8" cy="11" r="0.75" fill="#d97706" />
                                      </svg>
                                      <span>{emailRegisteredMsg}</span>
                                    </div>
                                  )}

                                  {/* ── OTP card ── */}
                                  {otpSent && !otpVerified && (
                                    <div className="ea-otp-card">
                                      <div className="ea-otp-card-header">
                                        <div className="ea-otp-card-icon">
                                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                          </svg>
                                        </div>
                                        <div className="ea-otp-card-titles">
                                          <div className="ea-otp-card-title">Confirm Primary Contact Email</div>
                                          <div className="ea-otp-card-subtitle">One-time passcode dispatched</div>
                                        </div>
                                        <span className="ea-otp-awaiting-badge">
                                          <span className="ea-otp-awaiting-dot" />
                                          Awaiting code
                                        </span>
                                      </div>

                                      <div className="ea-otp-card-body">
                                        <p className="ea-otp-card-desc">
                                          A 6-digit code has been sent to <span className="ea-otp-email-highlight">{watchedEmail}</span>. The code expires in <strong>10 minutes</strong>.
                                        </p>

                                        <div className="ea-otp-boxes">
                                          {otpDigits.map((digit, i) => (
                                            <input
                                              key={i}
                                              ref={el => { otpInputRefs.current[i] = el; }}
                                              type="text"
                                              inputMode="numeric"
                                              className="ea-otp-box"
                                              maxLength={1}
                                              value={digit}
                                              onChange={e => handleOtpDigitChange(i, e.target.value)}
                                              onKeyDown={e => handleOtpKeyDown(i, e)}
                                              onPaste={i === 0 ? handleOtpPaste : undefined}
                                            />
                                          ))}
                                        </div>

                                        <div className="ea-otp-card-footer">
                                          <span className="ea-otp-expires-text">
                                            <span className="ea-otp-expires-dot" />
                                            {otpExpireTimer > 0 ? `Expires in ${formatExpireTime(otpExpireTimer)}` : 'Code expired'}
                                          </span>
                                          <div className="ea-otp-resend-row">
                                            Didn&apos;t receive it?&nbsp;
                                            {otpTimer > 0 ? (
                                              <span className="ea-otp-resend-wait">Resend code ({otpTimer}s)</span>
                                            ) : (
                                              <button type="button" className="ea-otp-resend-link" onClick={handleSendOTP}>
                                                Resend code
                                              </button>
                                            )}
                                          </div>
                                          <div className="ea-otp-spam-note">
                                            Can't find it? Check your <strong className="ea-otp-spam-highlight">spam or junk folder</strong>.
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          className="ea-otp-verify-card-btn"
                                          onClick={handleVerifyOTP}
                                          disabled={otpDigits.join('').length !== 6 || otpLoading}
                                        >
                                          {otpLoading ? <span className="spinner spinner--white ea-spinner-sm" /> : 'Verify Code'}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* ── Section 2: Practice Type ── */}
                            {step === 2 && (
                              <div className="form-field">
                                <label htmlFor="practiceType">Practice Type <span className="ea-required">*</span></label>
                                <select
                                  id="practiceType"
                                  {...register('practiceType')}
                                  className={errors.practiceType ? 'error' : ''}
                                  disabled={formSubmitted}
                                >
                                  {practiceTypeOptions.filter(o => !o.group).map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                  {groupOrder.map(group => (
                                    <optgroup key={group} label={group}>
                                      {groupedPracticeTypes[group]?.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>
                                {errors.practiceType && (
                                  <span className="error-message">{errors.practiceType.message}</span>
                                )}
                                <p className="ea-field-note">Note: If your organization spans multiple categories or doesn't fit cleanly, select the closest match — we'll refine during the introduction call.</p>
                              </div>
                            )}

                            {/* ── Section 3: Operational Profile ── */}
                            {step === 3 && (
                              <>
                                <div className="form-grid">
                                  <div className="form-field">
                                    <label htmlFor="providers">Number of Rendering Providers <span className="ea-required">*</span></label>
                                    <p className="ea-field-hint">Total clinicians who render billable services.</p>
                                    <select
                                      id="providers"
                                      {...register('providers')}
                                      className={errors.providers ? 'error' : ''}
                                      disabled={formSubmitted}
                                    >
                                      {providersOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </select>
                                    {errors.providers && (
                                      <span className="error-message">{errors.providers.message}</span>
                                    )}
                                  </div>

                                  <div className="form-field">
                                    <label htmlFor="locations">Number of Locations <span className="ea-required">*</span></label>
                                    <p className="ea-field-hint">Site footprint across all clinical operations.</p>
                                    <select
                                      id="locations"
                                      {...register('locations')}
                                      className={errors.locations ? 'error' : ''}
                                      disabled={formSubmitted}
                                    >
                                      {locationsOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </select>
                                    {errors.locations && (
                                      <span className="error-message">{errors.locations.message}</span>
                                    )}
                                  </div>
                                </div>

                                <div className="form-field form-field--full">
                                  <label htmlFor="claimVolume">Estimated Monthly Claim Volume <span className="ea-required">*</span></label>
                                  <p className="ea-field-hint">Approximate count of submitted claims across all payer categories per month.</p>
                                  <select
                                    id="claimVolume"
                                    {...register('claimVolume')}
                                    className={errors.claimVolume ? 'error' : ''}
                                    disabled={formSubmitted}
                                  >
                                    {claimVolumeOptions.map(option => (
                                      <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                  </select>
                                  {errors.claimVolume && (
                                    <span className="error-message">{errors.claimVolume.message}</span>
                                  )}
                                </div>
                              </>
                            )}

                            {/* Continue / Mark Complete button */}
                            {!formSubmitted && (
                              <div className="ea-section-actions">
                                <button
                                  type="button"
                                  className="btn btn-primary ea-continue-btn"
                                  onClick={() => handleContinue(step)}
                                  disabled={!isSectionReady(step)}
                                >
                                  {step === 1 && 'Continue to Practice Type →'}
                                  {step === 2 && 'Continue to Operational Profile →'}
                                  {step === 3 && 'Continue to Acknowledgement →'}
                                  {step === 4 && 'Mark Complete ✓'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}


                {/* ── Footer: consent + submit ── */}
                <div className="ea-form-footer">
                  <p className="ea-consent-text">
                    By submitting, you consent to email contact regarding your early access request. Your information will not be shared with third parties.
                  </p>
                  <button
                    type="submit"
                    className={`btn ea-submit-btn${completedSteps.size >= 4 ? ' ea-submit-btn--enabled' : ''}`}
                    disabled={completedSteps.size < 4 || isSubmitting || formSubmitted}
                  >
                    {formSubmitted ? (
                      '✓ Submitted'
                    ) : isSubmitting ? (
                      <><span className="spinner" />Submitting...</>
                    ) : (
                      'Submit Request for Early Access'
                    )}
                  </button>
                </div>

                {/* ── Inline success block ── */}
                {formSubmitted && (
                  <div id="ea-success-block" className="sc-wrapper">
                    <div className="sc-icon">
                      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                        <circle cx="32" cy="32" r="30" fill="#00a7d8" stroke="white" strokeWidth="2" />
                        <path d="M20 32l9 9 15-15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="sc-label">Submission Received</p>
                    <p className="sc-subtitle">
                      Your early access request has been received. A confirmation email has been sent to the address verified above. Practices selected for the Early Release Cohort will be contacted approximately six weeks before the Q3 2026 launch.
                    </p>
                  </div>
                )}

              </form>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default EarlyAccess;

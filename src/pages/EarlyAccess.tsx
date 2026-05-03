import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
};

const SECTION_DESCRIPTIONS: Record<number, string> = {
  1: 'Tell us about your practice or facility and the primary point of contact for this request. The NPI and email below will be verified before you proceed.',
  2: 'Select the option that best describes your organization. Categories are grouped by clinical specialty and facility type.',
  3: 'Help us understand the scale and footprint of your operations.',
};

const SECTION_FIELDS: Record<number, (keyof EarlyAccessFormData)[]> = {
  1: ['npi', 'practiceName', 'contactName', 'phoneNumber', 'email', 'title'],
  2: ['practiceType'],
  3: ['providers', 'locations', 'claimVolume'],
};

// ── Component ───────────────────────────────────────────────────────────────
const EarlyAccess: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedCompleted, setExpandedCompleted] = useState<number | null>(null);

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
  const [emailRegistered, setEmailRegistered] = useState(false);
  const [emailRegisteredMsg, setEmailRegisteredMsg] = useState('');

  const { register, handleSubmit, trigger, watch, getValues, setValue, clearErrors, formState: { errors } } = useForm({
    resolver: yupResolver(earlyAccessSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
  useEffect(() => {
    if (otpVerified && watchedEmail !== verifiedEmailRef.current) {
      setOtpVerified(false);
      setOtpSent(false);
      setOtpDigits(['', '', '', '', '', '']);
    }
    setEmailRegistered(false);
    setEmailRegisteredMsg('');
  }, [watchedEmail]);

  const progress = Math.round((completedSteps.size / 3) * 100);

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
          const aoPrefix = basic.authorized_official_name_prefix || '';
          const aoFirst = basic.authorized_official_first_name || '';
          const aoLast = basic.authorized_official_last_name || '';
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
    } catch {
      setNpiApiError('NPI not found. Please check the number and try again.');
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
    setExpandedCompleted(prev => prev === step ? null : step);
  };

  const handleContinue = async (step: number) => {
    if (step === 1 && !otpVerified) {
      toast.error('Please Fill Required Fields and verify your email before continuing.');
      return;
    }
    const isValid = await trigger(SECTION_FIELDS[step] as any);
    if (!isValid) return;

    setCompletedSteps(prev => new Set([...prev, step]));
    setExpandedCompleted(null);

    if (step < 3) {
      const nextStep = step + 1;
      if (completedSteps.has(nextStep)) {
        setExpandedCompleted(nextStep);
      } else {
        setCurrentStep(nextStep);
      }
      setTimeout(() => {
        document.getElementById(`ea-section-${nextStep}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    } else {
      if (currentStep <= 3) setCurrentStep(4);
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
        await emailService.sendEarlyAccessConfirmation(data.email, data.contactName, logoUrl);
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

      <main className="early-access-main">
        <div className="early-access-content">
          {!formSubmitted && <div className="early-access-header">
            <h1 className="early-access-title">Request Early Access</h1>
            <div className="early-access-intro">
              <p>
                Dyad&apos;s platform launches Q3 2026. A limited number of practices and facilities will be invited to join our early release cohort.
              </p>
              <p>
                Early access provides priority onboarding to institutional-grade practice infrastructure and fiduciary-level financial governance with direct input on roadmap development.
              </p>
              <p className="early-access-note">
                The intake below is used to assess operational scope, encounter volume, and to ensure strategic alignment.
              </p>
             <hr className="header-divider" />
              <div className="protocol-callout">
                <div className="protocol-callout-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <path d="M9 12l2 2 4-4"></path>
                  </svg>
                </div>
                <div>
                  <div className="protocol-callout-title">Verification Protocol</div>
                  <div className="protocol-callout-body">
                    To preserve the integrity of the early release cohort, every intake is verified against the <strong>NPPES National Provider Identifier registry</strong> and authenticated via <strong>email one-time passcode</strong>. This is part of Dyad's standard institutional onboarding — your information is not shared, and verification typically completes in under thirty seconds.
                  </div>
                </div>
              </div>
            </div>
          </div>}

          {formSubmitted ? (
            <div className="sc-wrapper">
              <div className="sc-icon">
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
                  <circle cx="26" cy="26" r="24" fill="#1d6dd8" />
                  <path d="M16 26l7 7 13-13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <p className="sc-label">Submission Received</p>
              <h2 className="sc-title">Thank you for your interest in Dyad</h2>
              <p className="sc-subtitle">
                If selected, early access invitations will be extended via email in advance of platform release.
              </p>

              <div className="sc-next-card">
                <p className="sc-next-heading">What Happens Next</p>
                <ol className="sc-steps">
                  <li className="sc-step">
                    <span className="sc-step-num">1</span>
                    <div>
                      <strong>Confirmation email</strong>
                      <p>A confirmation has been sent to your verified email address. Check your inbox momentarily.</p>
                    </div>
                  </li>
                  <li className="sc-step">
                    <span className="sc-step-num">2</span>
                    <div>
                      <strong>Cohort review</strong>
                      <p>Dyad reviews each submission to assess operational scope and strategic alignment for the early release cohort.</p>
                    </div>
                  </li>
                  <li className="sc-step">
                    <span className="sc-step-num">3</span>
                    <div>
                      <strong>Invitation (if selected)</strong>
                      <p>Selected practices will receive an invitation approximately six weeks before launch with a link to schedule an onboarding discussion.</p>
                    </div>
                  </li>
                </ol>
              </div>

              <button className="btn sc-home-btn" onClick={() => navigate('/')}>
                Back to Dyad Homepage
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              {/* ── Progress bar ── */}
              <div className="ea-progress">
                   <span className="ea-progress-pct">Section {completedSteps.size}/3</span>
                <div className="ea-progress-track">
                  <div className="ea-progress-fill" style={{ width: `${progress}%` }} />
                </div>
             
              </div>

              {/* ── Accordion sections ── */}
              {([1, 2, 3] as const).map(step => {
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

                          {/* ── Section 1: Practice & Facility Details ── */}
                          {step === 1 && (
                            <div className="form-grid">

                              {/* NPI field + verify button */}
                              <div className="form-field form-field--full">
                                <label htmlFor="npi">Practice or Provider NPI *</label>
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
                                    disabled={isNpiValidating || npiConfirmed}
                                  />
                                  <button
                                    type="button"
                                    className="ea-npi-verify-btn"
                                    onClick={handleNpiVerify}
                                    disabled={isNpiValidating || npiConfirmed}
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
                                        </div>
                                      </div>
                                    </div>
                                    <span className="ea-npi-verified-time">just now</span>
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
                                <label htmlFor="practiceName">Practice/Facility Name *</label>
                                <input
                                  id="practiceName"
                                  type="text"
                                  {...register('practiceName')}
                                  className={errors.practiceName ? 'error' : ''}
                                  placeholder="Enter practice or facility name"
                                  disabled={npiConfirmed}
                                />
                                {errors.practiceName && (
                                  <span className="error-message">{errors.practiceName.message}</span>
                                )}
                              </div>

                              <div className="form-field">
                                <label htmlFor="contactName">Primary Contact Name *</label>
                                <input
                                  id="contactName"
                                  type="text"
                                  {...register('contactName')}
                                  className={errors.contactName ? 'error' : ''}
                                  placeholder="Enter primary contact name"
                                />
                                {errors.contactName && (
                                  <span className="error-message">{errors.contactName.message}</span>
                                )}
                              </div>

                              <div className="form-field">
                                <label htmlFor="phoneNumber">Phone Number *</label>
                                <input
                                  id="phoneNumber"
                                  type="tel"
                                  {...register('phoneNumber')}
                                  className={errors.phoneNumber ? 'error' : ''}
                                  placeholder="10-digit phone number"
                                  maxLength={10}
                                />
                                {errors.phoneNumber && (
                                  <span className="error-message">{errors.phoneNumber.message}</span>
                                )}
                              </div>

                              <div className="form-field">
                                <label htmlFor="title">Title / Role *</label>
                                <input
                                  id="title"
                                  type="text"
                                  {...register('title')}
                                  className={errors.title ? 'error' : ''}
                                  placeholder="e.g., Practice Administrator, CEO, Medical Director"
                                />
                                {errors.title && (
                                  <span className="error-message">{errors.title.message}</span>
                                )}
                              </div>

                              <div className="form-field form-field--full">
                                <label htmlFor="email">Email *</label>
                                <div className="ea-email-row">
                                  <input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    className={errors.email ? 'error' : ''}
                                    placeholder="Enter email address"
                                    disabled={otpVerified}
                                  />
                                  <button
                                    type="button"
                                    className="ea-otp-send-btn"
                                    onClick={handleSendOTP}
                                    disabled={otpVerified || otpLoading}
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
                              <label htmlFor="practiceType">Practice Type *</label>
                              <select
                                id="practiceType"
                                {...register('practiceType')}
                                className={errors.practiceType ? 'error' : ''}
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
                            </div>
                          )}

                          {/* ── Section 3: Operational Profile ── */}
                          {step === 3 && (
                            <>
                              <div className="form-grid">
                                <div className="form-field">
                                  <label htmlFor="providers">Number of Rendering Providers *</label>
                                  <select
                                    id="providers"
                                    {...register('providers')}
                                    className={errors.providers ? 'error' : ''}
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
                                  <label htmlFor="locations">Number of Locations *</label>
                                  <select
                                    id="locations"
                                    {...register('locations')}
                                    className={errors.locations ? 'error' : ''}
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
                                <label htmlFor="claimVolume">Estimated Monthly Claim Volume *</label>
                                <select
                                  id="claimVolume"
                                  {...register('claimVolume')}
                                  className={errors.claimVolume ? 'error' : ''}
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

                          {/* Continue / Confirm button */}
                          <div className="ea-section-actions">
                            <button
                              type="button"
                              className="btn btn-primary ea-continue-btn"
                              onClick={() => handleContinue(step)}
                            >
                              {step === 1 && 'Continue to Practice Type →'}
                              {step === 2 && 'Continue to Operational Profile →'}
                              {step === 3 && 'Confirm & Submit →'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ── What happens next callout ── */}
              <div className="ea-what-next-callout">
                <div className="ea-what-next-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <div className="ea-what-next-title">What happens next?</div>
                  <div className="ea-what-next-body">
                    On submission, you'll receive a confirmation email. If your practice is selected for the early release cohort, an invitation to schedule onboarding will be extended approximately six weeks before launch.
                  </div>
                </div>
              </div>

              {/* ── Footer: consent + submit ── */}
              <div className="ea-form-footer">
                <p className="ea-consent-text">
                  By submitting, you consent to email contact regarding your early access request. Your information will not be shared with third parties.
                </p>
                <button
                  type="submit"
                  className={`btn ea-submit-btn${completedSteps.size >= 3 ? ' ea-submit-btn--enabled' : ''}`}
                  disabled={completedSteps.size < 3 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Intake →'
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default EarlyAccess;

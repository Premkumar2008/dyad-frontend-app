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

const SECTION_FIELDS: Record<number, (keyof EarlyAccessFormData)[]> = {
  1: ['practiceName', 'contactName', 'phoneNumber', 'email', 'title'],
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

  // ── OTP state ──────────────────────────────────────────
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const verifiedEmailRef = useRef<string>('');
  const [emailRegistered, setEmailRegistered] = useState(false);
  const [emailRegisteredMsg, setEmailRegisteredMsg] = useState('');

  const { register, handleSubmit, trigger, watch, getValues, formState: { errors } } = useForm({
    resolver: yupResolver(earlyAccessSchema),
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpTimer <= 0) return;
    const id = setTimeout(() => setOtpTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [otpTimer]);

  // Reset OTP + email-check state whenever email field changes
  const watchedEmail = watch('email');
  useEffect(() => {
    if (otpVerified && watchedEmail !== verifiedEmailRef.current) {
      setOtpVerified(false);
      setOtpSent(false);
      setOtpValue('');
    }
    setEmailRegistered(false);
    setEmailRegisteredMsg('');
  }, [watchedEmail]);

  const progress = Math.round((completedSteps.size / 3) * 100);

  const handleSendOTP = async () => {
    const isEmailValid = await trigger('email' as any);
    if (!isEmailValid) return;

    const email = getValues('email' as any);
    setOtpLoading(true);
    setEmailRegistered(false);
    setEmailRegisteredMsg('');

    try {
      // Check if email is already registered for early access
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const checkRes = await axios.post(`${apiUrl}/api-early-access/check-email`, { email });

      if (checkRes.data.exists) {
        setEmailRegistered(true);
        setEmailRegisteredMsg(checkRes.data.message);
        return;
      }

      // Email is eligible — send OTP
      await sendEmailOTP(email);
      setOtpSent(true);
      setOtpTimer(60);
      toast.success('OTP sent to your email!');
    } catch (error: any) {
      const msg = error.response?.data?.message;
      // If the check-email endpoint itself returns a structured error, surface it
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
      toast.error('Please verify your email before continuing.');
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

      // Fire confirmation email (fire-and-forget)
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

  return (
    <div className="early-access-container">
      <LandingHeader />

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
            </div>
          </div>}

          {formSubmitted ? (
            <div className="sc-wrapper">
              {/* Icon */}
              <div className="sc-icon">
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
                  <circle cx="26" cy="26" r="24" stroke="#22c55e" strokeWidth="2.5" />
                  <path d="M16 26l7 7 13-13" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Headline */}
              <p className="sc-label">Submission Received</p>
              <h2 className="sc-title">Thank you for your interest in Dyad</h2>
              <p className="sc-subtitle">
                If selected, early access invitations will be extended via email in advance of platform release.
              </p>

              {/* What happens next card */}
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
                      className={`ea-section-header${status === 'completed' ? ' ea-section-header--clickable' : ''}`}
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

                    {/* Animated body — only rendered when active */}
                    {isExpanded && (
                    <div className="ea-section-body">
                      <div className="ea-section-body-inner">

                        {/* Section 1: Practice & Facility Details */}
                        {step === 1 && (
                          <div className="form-grid">
                            <div className="form-field">
                              <label htmlFor="practiceName">Practice/Facility Name *</label>
                              <input
                                id="practiceName"
                                type="text"
                                {...register('practiceName')}
                                className={errors.practiceName ? 'error' : ''}
                                placeholder="Enter practice or facility name"
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
                                {otpVerified ? (
                                  <span className="ea-verified-badge">✓ Verified</span>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn ea-otp-send-btn"
                                    onClick={handleSendOTP}
                                    disabled={otpLoading}
                                  >
                                    {otpLoading && !otpSent ? <span className="spinner ea-spinner-sm" /> : null}
                                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                                  </button>
                                )}
                              </div>
                              {errors.email && (
                                <span className="error-message">{errors.email.message}</span>
                              )}

                              {emailRegistered && (
                                <div className="ea-email-registered">
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{flexShrink:0,marginTop:'2px'}}>
                                    <circle cx="8" cy="8" r="7" stroke="#d97706" strokeWidth="1.5"/>
                                    <path d="M8 5v3.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
                                    <circle cx="8" cy="11" r="0.75" fill="#d97706"/>
                                  </svg>
                                  <span>{emailRegisteredMsg}</span>
                                </div>
                              )}

                              {otpSent && !otpVerified && (
                                <div className="ea-otp-box">
                                  <p className="ea-otp-hint">Enter the 6-digit OTP sent to your email</p>
                                  <div className="ea-otp-input-row">
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      className="ea-otp-input"
                                      maxLength={6}
                                      value={otpValue}
                                      onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                      placeholder="000000"
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-primary ea-otp-verify-btn"
                                      onClick={handleVerifyOTP}
                                      disabled={otpValue.length !== 6 || otpLoading}
                                    >
                                      {otpLoading ? <span className="spinner ea-spinner-sm" /> : 'Verify'}
                                    </button>
                                  </div>
                                  <p className="ea-otp-resend-row">
                                    {otpTimer > 0 ? (
                                      <span className="ea-otp-timer">Resend in {otpTimer}s</span>
                                    ) : (
                                      <button type="button" className="ea-otp-resend-btn" onClick={handleSendOTP}>
                                        Resend OTP
                                      </button>
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Section 2: Practice Type */}
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

                        {/* Section 3: Operational Profile */}
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
                            {step < 3 ? 'Continue' : 'Confirm'}
                          </button>
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                );
              })}

              {/* ── What happens next ── */}
              <div className="ea-next-info">
                <div className="ea-next-icon" aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="20" width="24" height="4" rx="2" fill="rgba(255,255,255,0.9)" />
                    <rect x="4" y="14" width="24" height="4" rx="2" fill="rgba(255,255,255,0.7)" />
                    <rect x="4" y="8" width="24" height="4" rx="2" fill="rgba(255,255,255,0.5)" />
                  </svg>
                </div>
                <div>
                  <h3 className="ea-next-title">What happens next?</h3>
                  <p className="ea-next-body">
                    On submission, you&apos;ll receive a confirmation email. If your practice is selected for the early release cohort, an invitation to schedule onboarding will be extended approximately six weeks before launch.
                  </p>
                </div>
              </div>

              {/* ── Footer: consent + submit ── */}
              <div className="ea-form-footer">
              
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

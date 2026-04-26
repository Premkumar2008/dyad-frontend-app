import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import './EarlyAccess.css';
import LandingHeader from '../components/common/LandingHeader/LandingHeader';
import LandingFooter from '../components/common/LandingFooter/LandingFooter';

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
  // Anesthesia & Perioperative Providers
  { value: 'anesthesiologist', label: 'Anesthesiologist', group: 'Anesthesia & Perioperative Providers' },
  { value: 'crna', label: 'Certified Registered Nurse Anesthetist', group: 'Anesthesia & Perioperative Providers' },
  { value: 'pain-mgmt-anesthesiologist', label: 'Pain Management Anesthesiologist', group: 'Anesthesia & Perioperative Providers' },
  { value: 'pediatric-anesthesiologist', label: 'Pediatric Anesthesiologist', group: 'Anesthesia & Perioperative Providers' },
  // Surgical & Procedural Physicians
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
  // Interventional & Diagnostic Physicians
  { value: 'gastroenterologist', label: 'Gastroenterologist (Endoscopy)', group: 'Interventional & Diagnostic Physicians' },
  { value: 'interventional-pain', label: 'Interventional Pain Management Physician', group: 'Interventional & Diagnostic Physicians' },
  { value: 'interventional-radiologist', label: 'Interventional Radiologist', group: 'Interventional & Diagnostic Physicians' },
  { value: 'interventional-cardiologist', label: 'Interventional Cardiologist', group: 'Interventional & Diagnostic Physicians' },
  // Specialty Groups
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
  // Facilities
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
  { value: 'multi-2-5', label: 'Multi-site (2\u20135)' },
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

const EarlyAccess: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(earlyAccessSchema),
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const onSubmit = async (data: EarlyAccessFormData) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Submitting intake form...', {
      duration: 7000,
    });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      await axios.post(`${apiUrl}/api/early-access`, data);

      toast.dismiss(toastId);
      toast.success('Intake submitted successfully!', {
        duration: 7000,
        icon: '\u2705',
      });

      setFormSubmitted(true);
      localStorage.setItem('earlyAccessSubmitted', new Date().toISOString());
    } catch (error: any) {
      toast.dismiss(toastId);

      if (error.response?.status === 429) {
        toast.error('Please wait a moment before submitting again.', {
          duration: 7000,
          icon: '\u26a0\ufe0f',
        });
      } else {
        toast.error(
          error.response?.data?.message || 'Failed to submit intake. Please try again.',
          { duration: 7000, icon: '\u274c' }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="early-access-container">
      <LandingHeader />

      <main className="early-access-main">
        <div className="early-access-content">
          <div className="early-access-header">
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
          </div>

          {formSubmitted ? (
            <div className="submission-confirmation">
              <div className="confirmation-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" />
                  <path d="M8 12l2.5 2.5L16 9" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2>Intake Submitted</h2>
              <p>
                Submission received. If selected, early access invitations will be extended via email in advance of platform release.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/')}
              >
                Return to Home
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="early-access-form" noValidate>
              <section className="form-section">
                <h2 className="form-section-title">1. Practice/Facility Details</h2>
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
                    <label htmlFor="email">Email (OTP required) *</label>
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      className={errors.email ? 'error' : ''}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email.message}</span>
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
                </div>
              </section>

              <section className="form-section">
                <h2 className="form-section-title">2. Practice Type *</h2>
                <div className="form-field full-width">
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
              </section>

              <section className="form-section">
                <h2 className="form-section-title">3. Number of Rendering Providers *</h2>
                <div className="form-field full-width">
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
              </section>

              <section className="form-section">
                <h2 className="form-section-title">4. Locations *</h2>
                <div className="form-field full-width">
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
              </section>

              <section className="form-section">
                <h2 className="form-section-title">5. Estimated Monthly Claim Volume *</h2>
                <div className="form-field full-width">
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
              </section>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Intake'
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

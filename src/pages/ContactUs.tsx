import React, { useState, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ContactUs.css';
import { InlineWidget } from 'react-calendly';
import LandingHeader from '../components/common/LandingHeader/LandingHeader';
import LandingFooter from '../components/common/LandingFooter/LandingFooter';

// ── DateTimePicker ────────────────────────────────────────────────────────────
// OLD MANUAL DATE/TIME PICKER - REMOVED - NOW USING CALENDLY ONLY
// The manual DateTimePicker component has been removed to use only Calendly scheduling
// ── End DateTimePicker ────────────────────────────────────────────────────────

// Validation schema
const contactSchema = yup.object({
  name: yup.string().required('Name is required'),
  phoneNumber: yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
    .required('Phone number is required'),
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required')
    .matches(/^[\w-\.]+@([\w-]+\.)+(com|org|net|edu|gov|mil)$/, 'Please enter a valid email address'),
  organization: yup.string().required('Organization/Facility name is required'),
  message: yup.string().required('Message is required'),
  scheduledTime: yup.string().required('Schedule time is required'),
});

const ContactUs: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submissionTime, setSubmissionTime] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<{ minutes: number; seconds: number } | null>(null);
  const [showCalendly, setShowCalendly] = useState(false);
  const [formStep, setFormStep] = useState<'form' | 'calendar'>('form');
  const [selectedCalendlyDateTime, setSelectedCalendlyDateTime] = useState<string>('');
  const [calendlyEventData, setCalendlyEventData] = useState<any>(null);
  const [calendlyAlreadyBooked, setCalendlyAlreadyBooked] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

 // Check for existing submission and handle cooldown
 useEffect(() => {
   const storedSubmissionTime = localStorage.getItem('contactFormSubmission');
   if (storedSubmissionTime) {
     const submissionTime = new Date(storedSubmissionTime);
     const currentTime = new Date();
     const timeDiff = currentTime.getTime() - submissionTime.getTime();
     const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
     
     if (timeDiff < tenMinutes) {
       setFormSubmitted(true);
       setSubmissionTime(storedSubmissionTime);
       
       // Set timer to reset form after cooldown period
       const remainingTime = tenMinutes - timeDiff;
       const timer = setTimeout(() => {
         setFormSubmitted(false);
         setSubmissionTime(null);
         localStorage.removeItem('contactFormSubmission');
       }, remainingTime);
       
       return () => clearTimeout(timer);
     } else {
       // Clear expired submission
       localStorage.removeItem('contactFormSubmission');
     }
   }
 }, []);

 // Countdown timer effect
 useEffect(() => {
  if (formSubmitted && submissionTime) {
    const timer = setInterval(() => {
      const remaining = getRemainingTime();
      setCountdown(remaining);
      
      if (!remaining) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }
}, [formSubmitted, submissionTime]);

 
 

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch,
  } = useForm({
    resolver: yupResolver(contactSchema),
    mode: 'onChange'
  });

  const scheduledTimeValue = watch('scheduledTime') as string | undefined;

  const nameValue = watch('name') as string;
  const emailValue = watch('email') as string;

  // Handle Calendly events - always active when calendar step is shown
  useEffect(() => {
    const handleCalendlyEvent = (event: any) => {
      if (!event.data || typeof event.data.event !== 'string') return;

      if (event.data.event === 'calendly.date_and_time_selected') {
        const payload = event.data.payload || {};
        const startTime = payload?.event?.start_time || payload?.start_time;

        if (startTime) {
          setSelectedCalendlyDateTime(startTime);
          setValue('scheduledTime', startTime, { shouldValidate: true });
          setCalendlyEventData(payload);
          setCalendlyAlreadyBooked(false);
          toast.success('Date and time selected! Complete the form and click Submit to confirm your booking.', { duration: 7000 });
        }
      }

      if (event.data.event === 'calendly.event_scheduled') {
        // User completed Calendly booking - automatically submit the form
        const payload = event.data.payload;
        
        // Extract the URIs from payload
        const eventUri = payload?.event?.uri;
        const inviteeUri = payload?.invitee?.uri;
        
        // Store the URIs for API calls - we'll fetch full details later
        const calendlyEventData = {
          event: {
            uri: eventUri
          },
          invitee: {
            uri: inviteeUri
          },
          // Flag to indicate we need to fetch full details
          needsFetch: true
        };
        
        // Store the Calendly data for API calls
        setCalendlyEventData(calendlyEventData);
        setCalendlyAlreadyBooked(true);
        
        // Use the current time as the scheduled time (when user selected the slot)
        const selectedTime = new Date().toISOString();
        setSelectedCalendlyDateTime(selectedTime);
        setValue('scheduledTime', selectedTime, { shouldValidate: true });
        
        // Automatically submit the form after Calendly event is created
        setTimeout(() => {
          try {
            handleSubmit(onSubmit)();
          } catch (error) {
            // Error in form submission handled silently
          }
        }, 1000);
        
        toast.success('Consultation scheduled! Submitting your request...', { duration: 7000 });
      }
    };

    window.addEventListener('message', handleCalendlyEvent);
    return () => {
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, [setValue, handleSubmit]);

  // Validate required fields before opening scheduler
  const openCalendly = async () => {
    // Validate all required fields except scheduledTime
    const fieldsValid = await trigger(['name', 'phoneNumber', 'email', 'organization', 'message']);
    if (!fieldsValid) {
      toast.error('Please fill in all required fields before scheduling a time.', { duration: 7000 });
      return;
    }
    setShowCalendly(true);
  };

  const closeCalendly = () => {
    setShowCalendly(false);
  };

  
  const handleContinueToSchedule = async () => {
    // Validate all form fields except scheduledTime
    const fieldsValid = await trigger(['name', 'phoneNumber', 'email', 'organization', 'message']);
  
    if (!fieldsValid) {
      toast.error('Please fill in all required fields before continuing.', { duration: 7000 });
      return;
    }
  
    // Move to calendar step
    setFormStep('calendar');
    setShowCalendly(true);
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    // reCAPTCHA removed - no token needed
    
    const apiUrl = import.meta.env.VITE_API_URL || '';
    
    try {
      // Step 1: Call Calendly booking API first
      if (calendlyEventData) {
        // Step 1: Creating Calendly booking...
        
        try {
          const calendlyPayload = {
            calendlyEvent: calendlyEventData,
            scheduledTime: selectedCalendlyDateTime,
            contactData: {
              name: data.name,
              email: data.email,
              phoneNumber: data.phoneNumber,
              organization: data.organization,
              message: data.message
            }
          };
          
          
          const calendlyResponse = await axios.post(`${apiUrl}/api/booking/invitees`, calendlyPayload);
          
          if (calendlyResponse.data.success) {
            toast.success('Consultation booked in Calendly!', { duration: 7000 });
          } else {
            throw new Error(calendlyResponse.data.message || 'Calendly booking failed');
          }
        } catch (calendlyError: any) {
          toast.error('Failed to book consultation. Please try again.', { duration: 7000 });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Step 2: Call contact request API after successful Calendly booking
      
      const contactPayload = {
        ...data,
        scheduledTime: data.scheduledTime
      };
       
      const contactResponse = await axios.post(`${apiUrl}/contact-requests`, contactPayload);
      
      if (contactResponse.data.success) {
        toast.success('Your request has been submitted successfully!', { duration: 7000 });

        // Store submission time and set form submitted state
        const currentSubmissionTime = new Date().toISOString();
        localStorage.setItem('contactFormSubmission', currentSubmissionTime);
        setSubmissionTime(currentSubmissionTime);
        setFormSubmitted(true);

        // Reset form
        setValue('name', '');
        setValue('phoneNumber', '');
        setValue('email', '');
        setValue('organization', '');
        setValue('message', '');
        setValue('scheduledTime', '');
        setSelectedCalendlyDateTime('');
        setCalendlyEventData(null);
        setCalendlyAlreadyBooked(false);
        
        // Reset form step to form
        setFormStep('form');
        
        // Set timer to reset form after 10 minutes
        setTimeout(() => {
          setFormSubmitted(false);
          setSubmissionTime(null);
          localStorage.removeItem('contactFormSubmission');
        }, 10 * 60 * 1000); // 10 minutes
        
        // Scroll to top when form is submitted successfully with a delay
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error(contactResponse.data.message || 'Failed to submit contact request');
      }
    } catch (error: any) {
      
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please try again later.', { duration: 7000 });
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.', { duration: 7000 });
      } else {
        toast.error(error.message || 'Failed to submit request. Please try again.', { duration: 7000 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  // Calculate remaining time for cooldown
  const getRemainingTime = () => {
    if (!submissionTime) return null;
    
    const submission = new Date(submissionTime);
    const currentTime = new Date();
    const timeDiff = currentTime.getTime() - submission.getTime();
    const tenMinutes = 10 * 60 * 1000;
    const remainingTime = tenMinutes - timeDiff;
    
    if (remainingTime <= 0) return null;
    
    const minutes = Math.floor(remainingTime / (60 * 1000));
    const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
    
    return { minutes, seconds };
  };

  return (
    <div className="contact-us-container" key="contact-form-v2">
      {/* Contact Banner */}
      
      <LandingHeader activePage="Contact" />

       <div className="contact-banner">
        <img 
          src="/assets/images/contactbanner.png" 
          alt="Contact Us Banner" 
          className="contact-banner-image"
        />
      </div>

      {/* Main Content */}
      <main className="contact-main">
        {/* Banner Section */}
      

        {/* Form Section */}
        <section className="contact-form-section mb-8">
          <div className="form-container">
            {/* Left Side - Form */}
            <div className="form-left-section">
              {formSubmitted ? (
                <div className="success-container">
                  <div className="success-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2"/>
                      <path d="M8 12L11 15L16 9" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h2 className="success-title">Contact Request Submitted Successfully!</h2>
                 
                  <div className="mt-6">
                    <a
                      onClick={() => navigate('/')}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer underline font-medium"
                    >
                      Back to Home
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <div className="form-header-content">
                    <h2 className="form-title">To Be Filled Out By Providers Or Administrators:</h2>
                  </div>
                  <br />
                  <form onSubmit={handleSubmit(onSubmit)} className="contact-form" id="demo-form">
                {/* Name Field */}
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="name" className="form-label">
                      Your Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      {...register('name')}
                    />
                    {errors.name && (
                      <span className="error-message">{errors.name.message}</span>
                    )}
                  </div>

                  {/* Phone Number Field */}
                 
                </div>
                <div className='form-row'>
                   <div className="form-field">
                    <label htmlFor="phoneNumber" className="form-label">
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                      maxLength={10}
                      {...register('phoneNumber')}
                    />
                    {errors.phoneNumber && (
                      <span className="error-message">{errors.phoneNumber.message}</span>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="email" className="form-label">
                      Your Email*
                    </label>
                    <input
                      type="email"
                      id="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      {...register('email')}
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email.message}</span>
                    )}
                  </div>

                 
                </div>

                <div className='form-row'>
                   {/* Organization Field */}
                  <div className="form-field">
                    <label htmlFor="organization" className="form-label">
                      Practice Name/Facility Name*
                    </label>
                    <input
                      type="text"
                      id="organization"
                      className={`form-input ${errors.organization ? 'error' : ''}`}
                      {...register('organization')}
                    />
                    {errors.organization && (
                      <span className="error-message">{errors.organization.message}</span>
                    )}
                  </div>
                </div>

                {/* Message Field */}
                <div className="form-row">
                  <div className="form-field full-width">
                    <label htmlFor="message" className="form-label">
                      Enter a Brief Message*
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder='Do not leave information protected under HIPAA. This form is intended for providers and administrators only.'
                      className={`form-textarea ${errors.message ? 'error' : ''}`}
                      {...register('message')}
                    />
                    {errors.message && (
                      <span className="error-message">{errors.message.message}</span>
                    )}
                  </div>
                </div>

                {/* Schedule Time */}
                {/* <div className="">
                  <div className=""> */}
                    {/* <label className="form-label">
                      Schedule a time to connect*
                    </label>
                    <input type="hidden" {...register('scheduledTime')} />
                     */}
                    {/* 
                    // OLD MANUAL SCHEDULING - COMMENTED OUT
                    // Scheduling Method Toggle
                    <div className="mb-4">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="schedulingMethod"
                            checked={!useCalendly}
                            onChange={() => toggleSchedulingMethod()}
                            className="mr-2"
                          />
                          <span className="text-sm">Select from available slots</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="schedulingMethod"
                            checked={useCalendly}
                            onChange={() => toggleSchedulingMethod()}
                            className="mr-2"
                          />
                          <span className="text-sm">Schedule with Calendly</span>
                        </label>
                      </div>
                    </div>

                    // Manual DateTimePicker
                    {!useCalendly && (
                      <DateTimePicker
                        value={scheduledTimeValue || ''}
                        onChange={(val) => setValue('scheduledTime', val, { shouldValidate: true })}
                        hasError={!!errors.scheduledTime}
                      />
                    )}
                    */}

                    {/* Date/Time Selection - HIDDEN, WILL SHOW AFTER FORM SUBMIT */}
                    {/* <div>
                      <label className="form-label">
                        Schedule a time to connect*
                      </label>
                      <input type="hidden" {...register('scheduledTime')} />
                      
                      <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="text-gray-600 mb-2">
                          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">
                          Complete the form above, then click "Continue to Schedule" to select a time
                        </p>
                      </div>
                    </div> */}

                    {/* {errors.scheduledTime && (
                      <span className="error-message">{errors.scheduledTime.message}</span>
                    )} */}
                  {/* </div>
                </div> */}
   
              
              {/* Submit Button */}
              <div className="form-group full-width">
                <button
                  type="button"
                  onClick={handleContinueToSchedule}
                  className="submit-btn w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Validating...' : 'Schedule a time to connect'}
                </button>
              </div>
              </form>
                
                {/* Step 2: Calendar Selection */}
                {formStep === 'calendar' && (
                  <div className="w-full">
                    <br />
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Select a Time</h3>
                      <p className="text-sm text-gray-600">Choose your preferred consultation time from the calendar below</p>
                    </div>
                    
                    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                      <div className="calendly-widget-container">
                        <InlineWidget
                          url="https://calendly.com/dyadpracticesolutions/new-meeting"
                          styles={{
                            height: '600px',
                            width: '100%'
                          }}
                          pageSettings={{
                            backgroundColor: 'ffffff',
                            hideEventTypeDetails: false,
                            hideLandingPageDetails: false,
                            primaryColor: '00a2ff',
                            textColor: '4d5055'
                          }}
                          prefill={{
                            email: watch('email') || '',
                            name: watch('name') || '',
                            customAnswers: {
                              a1: `Organization: ${watch('organization') || ''}`,
                              a2: `Phone: ${watch('phoneNumber') || ''}`
                            }
                          }}
                        />
                      </div>
                      
                                          </div>
                    
                    {/* Fallback message if Calendly fails to load */}
                    
                    
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setFormStep('form')}
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                      >
                        ← Back to Form
                      </button>
                    </div>
                  </div>
                )}
                </>
              )}
            </div>
            
            {/* Right Side - Image */}
            <div className="form-right-section">
              <img src="/assets/images/contact-us.jpeg" alt="Contact Us" />
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />

      </div>
  );
};

export default ContactUs;

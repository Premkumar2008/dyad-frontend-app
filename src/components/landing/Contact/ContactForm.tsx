/**
 * Contact form component
 * Refactored contact form with proper validation and API integration
 */

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReCAPTCHA from 'react-google-recaptcha';
import { ContactFormData } from '../../../types/landing';
import { ContactService } from '../../../services/api/contactService';
import { log } from '../../../utils/logger';

// Validation schema using Yup
const contactSchema = yup.object({
  name: yup.string().required('Name is required'),
  phoneNumber: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
    .required('Phone number is required'),
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  organization: yup.string().required('Organization/Facility name is required'),
  message: yup.string().required('Message is required'),
  scheduledTime: yup.string().required('Schedule time is required'),
  recaptcha: yup
    .boolean()
    .oneOf([true], 'Please verify you are not a robot')
    .required(),
});

interface ContactFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const captchaRef = useRef<ReCAPTCHA>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ContactFormData>({
    resolver: yupResolver(contactSchema) as any,
  });

  const handleRecaptchaChange = (token: string | null) => {
    log.debug('reCAPTCHA changed', 'ContactForm', { token: !!token });
    
    if (token) {
      setValue('recaptcha', true);
      setRecaptchaVerified(true);
    } else {
      setValue('recaptcha', false);
      setRecaptchaVerified(false);
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      log.info('Submitting contact form', 'ContactForm', { 
        email: data.email, 
        organization: data.organization 
      });

      // Get reCAPTCHA token
      const token = captchaRef.current?.getValue();
      
      if (!token) {
        const error = 'Please complete the CAPTCHA';
        log.warn(error, 'ContactForm');
        onError?.(error);
        return;
      }

      // Prepare form data
      const formData: ContactFormData = {
        ...data,
        scheduledTime: data.scheduledTime,
        recaptchaToken: token,
      };

      // Validate form data
      const validation = ContactService.validateContactData(formData);
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors)[0];
        log.warn('Form validation failed', 'ContactForm', validation.errors);
        onError?.(errorMessage);
        return;
      }

      // Submit form
      const response = await ContactService.submitContactForm(formData);
      
      if (response.success) {
        log.info('Contact form submitted successfully', 'ContactForm');
        reset();
        setRecaptchaVerified(false);
        if (captchaRef.current) {
          captchaRef.current.reset();
        }
        onSuccess?.();
      } else {
        log.error('Contact form submission failed', 'ContactForm', response.message);
        onError?.(response.message || 'Failed to submit form');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      log.error('Contact form submission error', 'ContactForm', error);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="contact-form">
      {/* Name Field */}
      <div className="form-field">
        <label htmlFor="name" className="form-label">
          Name*
        </label>
        <input
          type="text"
          id="name"
          className={`form-input ${errors.name ? 'error' : ''}`}
          {...register('name')}
          placeholder="Your full name"
        />
        {errors.name && (
          <span className="error-message">{errors.name.message}</span>
        )}
      </div>

      {/* Phone Number Field */}
      <div className="form-field">
        <label htmlFor="phoneNumber" className="form-label">
          Phone Number*
        </label>
        <input
          type="tel"
          id="phoneNumber"
          className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
          {...register('phoneNumber')}
          placeholder="1234567890"
          maxLength={10}
        />
        {errors.phoneNumber && (
          <span className="error-message">{errors.phoneNumber.message}</span>
        )}
      </div>

      {/* Email Field */}
      <div className="form-field">
        <label htmlFor="email" className="form-label">
          Email*
        </label>
        <input
          type="email"
          id="email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          {...register('email')}
          placeholder="your.email@example.com"
        />
        {errors.email && (
          <span className="error-message">{errors.email.message}</span>
        )}
      </div>

      {/* Organization Field */}
      <div className="form-field">
        <label htmlFor="organization" className="form-label">
          Organization/Facility Name*
        </label>
        <input
          type="text"
          id="organization"
          className={`form-input ${errors.organization ? 'error' : ''}`}
          {...register('organization')}
          placeholder="Your organization name"
        />
        {errors.organization && (
          <span className="error-message">{errors.organization.message}</span>
        )}
      </div>

      {/* Message Field */}
      <div className="form-field">
        <label htmlFor="message" className="form-label">
          Message*
        </label>
        <textarea
          id="message"
          className={`form-textarea ${errors.message ? 'error' : ''}`}
          {...register('message')}
          placeholder="Tell us about your needs..."
          rows={4}
        />
        {errors.message && (
          <span className="error-message">{errors.message.message}</span>
        )}
      </div>

      {/* Scheduled Time Field */}
      <div className="form-field">
        <label htmlFor="scheduledTime" className="form-label">
          Preferred Contact Time*
        </label>
        <input
          type="datetime-local"
          id="scheduledTime"
          className={`form-input ${errors.scheduledTime ? 'error' : ''}`}
          {...register('scheduledTime')}
        />
        {errors.scheduledTime && (
          <span className="error-message">{errors.scheduledTime.message}</span>
        )}
      </div>

      {/* reCAPTCHA */}
      <div className="form-field">
        <ReCAPTCHA
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''}
          ref={captchaRef}
          onChange={handleRecaptchaChange}
        />
        <input type="hidden" {...register('recaptcha')} />
        {errors.recaptcha && (
          <span className="error-message">{errors.recaptcha.message}</span>
        )}
      </div>

      {/* Submit Button */}
      <div className="form-field">
        <button
          type="submit"
          className="form-submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};

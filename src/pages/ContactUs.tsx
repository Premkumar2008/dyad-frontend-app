import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ContactUs.css';

// Validation schema
const contactSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  phoneNumber: yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
    .required('Phone number is required'),
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  organization: yup.string().required('Organization/Facility name is required'),
  message: yup.string().required('Message is required'),
  scheduledTime: yup.string().required('Schedule time is required'),
  recaptcha: yup.boolean().oneOf([true], 'Please verify you are not a robot').required()
});

interface ContactFormData {
  name: string;
  phoneNumber: string;
  email: string;
  organization: string;
  message: string;
  scheduledTime: string;
  recaptcha: boolean;
}

const ContactUs: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Contact');

  const navigationItems = [
    { name: 'About us', href: '#about' },
    { name: 'Leadership', href: '#leadership' },
    { name: 'Our services', href: '#services' }
  ];

  const handleNavClick = (item: { name: string; href: string }) => {
    setActiveMenu(item.name);
    // Navigate to landing page and scroll to section
    navigate('/', { state: { scrollTo: item.href } });
    setIsMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger
  } = useForm<ContactFormData>({
    resolver: yupResolver(contactSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: data.name,
        phoneNumber: data.phoneNumber,
        email: data.email,
        organization: data.organization,
        message: data.message,
        scheduledTime: new Date(data.scheduledTime).toISOString()
      };

      const response = await axios.post('/api/contact-requests', payload);
      
      if (response.data.success) {
        toast.success('Your request has been submitted successfully!');
        // Reset form
        setValue('name', '');
        setValue('phoneNumber', '');
        setValue('email', '');
        setValue('organization', '');
        setValue('message', '');
        setValue('scheduledTime', '');
        setRecaptchaVerified(false);
        setValue('recaptcha', false);
      } else {
        toast.error(response.data.message || 'Failed to submit request. Please try again.');
      }
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 429) {
        toast.error('Too many requests. Please try again later.');
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to submit request. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecaptchaVerify = () => {
    // Simulate reCAPTCHA verification
    setRecaptchaVerified(true);
    setValue('recaptcha', true);
    trigger('recaptcha');
  };

  // Get minimum date as today for datetime input
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="contact-us-container">
      {/* Header */}
      <header className="contact-header">
        <div className="contact-header-content">
          <div className="contact-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img 
              src="/assets/images/dyadmain-ogo.svg" 
              alt="Dyad Logo" 
              className="logo-image"
            />
          </div>
          
          {/* Navigation */}
          <nav className="dyad-nav">
            <ul className="nav-list" style={{ gap: '0rem' }}>
              {navigationItems.map((item) => {
                const isActive = activeMenu === item.name;
                return (
                  <li key={item.name}>
                    <a 
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item);
                      }}
                      style={{ 
                        color: isActive ? '#1D6DD8' : '#374151',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        fontWeight: 500,
                        fontSize: '1.1rem',
                        fontFamily: 'Prompt, sans-serif',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {item.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={handleMobileMenuToggle}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav">
          <ul className="mobile-nav-list">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <a 
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item);
                  }}
                  className="mobile-nav-link"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <main className="contact-main">
        {/* Banner Section */}
        <section className="contact-banner">
          <div className="banner-content">
            <h1 className="banner-title">Contact Us</h1>
            <div className="gradient-underline"></div>
          </div>
          <div className="banner-image">
            <img src="/assets/images/contact-us.png" alt="Contact Us" />
          </div>
        </section>

        {/* Form Section */}
        <section className="contact-form-section">
          <div className="form-container">
            <div className="form-header">
              <div className="form-header-content">
                <h2 className="form-title">Get in Touch</h2>
                <p className="form-subtitle">We'd love to hear from you. Fill out the form below and we'll get back to you soon.</p>
              </div>
              <div className="form-header-image">
                <img src="/assets/images/contact-us.png" alt="Contact Us" className="contact-form-image" />
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Your Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter your full name"
                  {...register('name')}
                />
                {errors.name && (
                  <span className="error-message">{errors.name.message}</span>
                )}
              </div>

              {/* Phone Number Field */}
              <div className="form-group">
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                  placeholder="Enter your 10-digit phone number"
                  maxLength={10}
                  {...register('phoneNumber')}
                />
                {errors.phoneNumber && (
                  <span className="error-message">{errors.phoneNumber.message}</span>
                )}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Your Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email address"
                  {...register('email')}
                />
                {errors.email && (
                  <span className="error-message">{errors.email.message}</span>
                )}
              </div>

              {/* Organization Field */}
              <div className="form-group">
                <label htmlFor="organization" className="form-label">
                  Organization / Facility Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="organization"
                  className={`form-input ${errors.organization ? 'error' : ''}`}
                  placeholder="Enter your organization or facility name"
                  {...register('organization')}
                />
                {errors.organization && (
                  <span className="error-message">{errors.organization.message}</span>
                )}
              </div>

              {/* Message Field */}
              <div className="form-group full-width">
                <label htmlFor="message" className="form-label">
                  Enter a brief Message <span className="required">*</span>
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className={`form-textarea ${errors.message ? 'error' : ''}`}
                  placeholder="Tell us how we can help you..."
                  {...register('message')}
                />
                {errors.message && (
                  <span className="error-message">{errors.message.message}</span>
                )}
              </div>

              {/* Schedule Time Field */}
              <div className="form-group">
                <label htmlFor="scheduledTime" className="form-label">
                  Schedule a time to connect <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="scheduledTime"
                  className={`form-input ${errors.scheduledTime ? 'error' : ''}`}
                  min={getMinDateTime()}
                  {...register('scheduledTime')}
                />
                {errors.scheduledTime && (
                  <span className="error-message">{errors.scheduledTime.message}</span>
                )}
              </div>

              {/* reCAPTCHA */}
              <div className="form-group full-width">
                <div className="recaptcha-container">
                  <div 
                    className={`recaptcha-box ${recaptchaVerified ? 'verified' : ''} ${errors.recaptcha ? 'error' : ''}`}
                    onClick={handleRecaptchaVerify}
                  >
                    <div className="recaptcha-checkbox">
                      {recaptchaVerified && <span className="checkmark">✓</span>}
                    </div>
                    <span className="recaptcha-text">I'm not a robot</span>
                    <div className="recaptcha-logo">
                      <span className="recaptcha-icon">🔒</span>
                    </div>
                  </div>
                  {errors.recaptcha && (
                    <span className="error-message">{errors.recaptcha.message}</span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-group full-width">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-section">
        <div className="footer-container">
          <div className="footer-content">
            {/* Column 1: Logo and Description */}
            <div className="footer-column">
              <div className="footer-logo">
                <img src="/assets/images/dyadmain-ogo.svg" alt="Dyad Logo" />
              </div>
              <p className="footer-description">
                Dyad is an integrated revenue cycle and practice operations platform for anesthesia, ambulatory surgery centers, and surgical specialties. Built on banking-grade infrastructure, it replaces fragmented vendors with a single, scalable operating layer—combining deep industry expertise, advanced technology, and institutional-grade controls to deliver precise, end-to-end case-to-cash outcomes, same day.
              </p>
            </div>

            {/* Column 2: Company */}
            <div className="footer-column">
              <h3 className="footer-column-title">Company</h3>
              <ul className="footer-menu">
                <li><a href="/">Home</a></li>
                <li><a href="/#about">About Us</a></li>
                <li><a href="/#leadership">Leadership</a></li>
                <li><a href="/#services">Our Services</a></li>
              </ul>
            </div>

            {/* Column 3: Services */}
            <div className="footer-column">
              <h3 className="footer-column-title">Services</h3>
              <ul className="footer-menu">
                <li><a href="/#services">Practice Foundations</a></li>
                <li><a href="/#services">Technology driven capabilities</a></li>
                <li><a href="/#services">Pre & Post Encounter</a></li>
                <li><a href="/#services">Claims Management</a></li>
                <li><a href="/#services">Specialty Billing</a></li>
                <li><a href="/#services">Real Time Insights</a></li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="footer-column">
              <h3 className="footer-column-title">Contact</h3>
              <div className="footer-contact-info">
                <div className="contact-item">
                  <span className="contact-symbol">✉</span>
                  <span>info@dyadmd.com</span>
                </div>
                <div className="contact-item">
                  <span className="contact-symbol">📍</span>
                  <span>2573 Pacific Coast Hwy, Ste A277 Torrance, CA 90505</span>
                </div>
                <div className="footer-social-icons">
                  <a href="#" className="social-icon">
                    <span className="social-symbol">in</span>
                  </a>
                  <a href="#" className="social-icon">
                    <span className="social-symbol">f</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row: Copyright and Legal */}
          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <p>&copy; 2026 DYAD Practice Solutions. All rights reserved.</p>
            </div>
            <div className="footer-bottom-right">
              <ul className="footer-legal-menu">
                <li><a href="#">Privacy policy</a></li>
                <li><a href="#">Terms of service</a></li>
                <li><a href="#">Cookie policy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;

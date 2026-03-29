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
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isWhoWeServeDropdownOpen, setIsWhoWeServeDropdownOpen] = useState(false);

  const contactNavigationItems = [
    { name: 'About Us', href: '#about', hasDropdown: true },
    { name: 'Leadership', href: '#leadership' },
    { name: 'What We Do', href: '#services' },
    { name: 'Who We Serve', href: '#who-we-serve', hasDropdown: true }
  ];

  const aboutDropdownItems = [
    { name: 'Our Story & Inspiration', href: '#about-story' },
    { name: 'Our Mission & Vision', href: '#about-mission' },
    { name: 'Our Values & Principles', href: '#about-values' },
    { name: 'Our Team & Expertise', href: '#about-team' }
  ];

  const whoWeServeDropdownItems = [
    { name: 'Surgical & Procedural Specialties', href: '#surgical-specialties' },
    { name: 'Interventional & Diagnostic Care', href: '#interventional-care' },
    { name: 'Perioperative & Supportive Services', href: '#perioperative-services' },
    { name: 'Outpatient & Specialty Facilities', href: '#outpatient-facilities' }
  ];

  const handleNavClick = (item: { name: string; href: string }) => {
    setActiveMenu(item.name);
    // Navigate to landing page and scroll to section
    navigate('/', { state: { scrollTo: item.href } });
    setIsMobileMenuOpen(false);
  };

  const handleMenuHover = (menuName: string | null) => {
    setHoveredMenu(menuName);
  };

  const handleAboutDropdownHover = (isOpen: boolean) => {
    setIsAboutDropdownOpen(isOpen);
  };

  const handleWhoWeServeDropdownHover = (isOpen: boolean) => {
    setIsWhoWeServeDropdownOpen(isOpen);
  };

  const handleAboutDropdownItemClick = (href: string) => {
    navigate('/', { state: { scrollTo: href } });
    setIsAboutDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleWhoWeServeDropdownItemClick = (href: string) => {
    navigate('/', { state: { scrollTo: href } });
    setIsWhoWeServeDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleContactRequest = () => {
    // Scroll to form or stay on current page since we're already on contact page
    const formElement = document.querySelector('.contact-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
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
      <header className="dyad-header">
        <div className="dyad-header-content">
          {/* Left - Logo */}
          <div className="dyad-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img 
              src="/assets/images/dyadmain-ogo.svg" 
              alt="Dyad Logo" 
              className="logo-image"
            />
          </div>

          {/* Right - Navigation and Buttons */}
          <div className="dyad-nav-actions">
            {/* Navigation */}
            <nav className="dyad-nav">
              <ul className="nav-list" style={{ gap: '0rem' }}>
                {contactNavigationItems.map((item) => {
                  const isActive = activeMenu === item.name;
                  return (
                    <li key={item.name} className="nav-item-container">
                      {item.hasDropdown ? (
                        <div 
                          className="dropdown-container"
                          onMouseEnter={() => {
                            handleMenuHover(item.name);
                            if (item.name === 'About Us') {
                              handleAboutDropdownHover(true);
                            } else if (item.name === 'Who We Serve') {
                              handleWhoWeServeDropdownHover(true);
                            }
                          }}
                          onMouseLeave={() => {
                            handleMenuHover(null);
                            if (item.name === 'About Us') {
                              handleAboutDropdownHover(false);
                            } else if (item.name === 'Who We Serve') {
                              handleWhoWeServeDropdownHover(false);
                            }
                          }}
                        >
                          <a 
                            style={{ 
                              color: hoveredMenu === item.name ? '#1D6DD8' : '#374151',
                              cursor: 'pointer',
                              textDecoration: 'none',
                              fontWeight: 400,
                              fontSize: '1.1rem',
                              fontFamily: 'Prompt, sans-serif',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {item.name}
                            <svg 
                              width="16" 
                              height="16" 
                              viewBox="0 0 16 16" 
                              fill="none" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                d="M4 6L8 10L12 6" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                          </a>
                          <div className={`dropdown-menu ${
                            (item.name === 'About Us' && isAboutDropdownOpen) || 
                            (item.name === 'Who We Serve' && isWhoWeServeDropdownOpen) 
                              ? 'open' : ''
                          }`}>
                            {item.name === 'About Us' && aboutDropdownItems.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleAboutDropdownItemClick(dropdownItem.href);
                                }}
                                className="dropdown-item"
                                style={{
                                  display: 'block',
                                  padding: '0.75rem 1rem',
                                  color: '#374151',
                                  textDecoration: 'none',
                                  fontSize: '0.95rem',
                                  fontFamily: 'Prompt, sans-serif',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                            {item.name === 'Who We Serve' && whoWeServeDropdownItems.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleWhoWeServeDropdownItemClick(dropdownItem.href);
                                }}
                                className="dropdown-item"
                                style={{
                                  display: 'block',
                                  padding: '0.75rem 1rem',
                                  color: '#374151',
                                  textDecoration: 'none',
                                  fontSize: '0.95rem',
                                  fontFamily: 'Prompt, sans-serif',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
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
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Action Buttons */}
            <div className="dyad-actions">
              <button className="btn btn-secondary" onClick={handleLogin}>
                <span>Login</span>
              </button>
              <button className="btn btn-primary" onClick={handleContactRequest}>
                <span>Contact Us</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              {contactNavigationItems.map((item) => {
                  const isActive = activeMenu === item.name;
                  return (
                    <li key={item.name}>
                      {item.hasDropdown ? (
                        <div className="mobile-dropdown-container">
                          <a 
                            onClick={(e) => {
                              e.preventDefault();
                              if (item.name === 'About Us') {
                                handleAboutDropdownHover(!isAboutDropdownOpen);
                              } else if (item.name === 'Who We Serve') {
                                handleWhoWeServeDropdownHover(!isWhoWeServeDropdownOpen);
                              }
                            }}
                            className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                            style={{ 
                              color: isActive ? '#1D6DD8' : '#374151',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            {item.name}
                            <svg 
                              className={`mobile-dropdown-arrow ${
                                (item.name === 'About Us' && isAboutDropdownOpen) || 
                                (item.name === 'Who We Serve' && isWhoWeServeDropdownOpen) 
                                  ? 'open' : ''
                              }`}
                              width="16" 
                              height="16" 
                              viewBox="0 0 16 16" 
                              fill="none" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                d="M4 6L8 10L12 6" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                          </a>
                          <div className={`mobile-dropdown-menu ${
                            (item.name === 'About Us' && isAboutDropdownOpen) || 
                            (item.name === 'Who We Serve' && isWhoWeServeDropdownOpen) 
                              ? 'open' : ''
                          }`}>
                            {item.name === 'About Us' && aboutDropdownItems.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleAboutDropdownItemClick(dropdownItem.href);
                                }}
                                className="mobile-dropdown-item"
                                style={{
                                  display: 'block',
                                  padding: '0.75rem 1rem 0.75rem 2rem',
                                  color: '#374151',
                                  textDecoration: 'none',
                                  fontSize: '0.9rem',
                                  fontFamily: 'Prompt, sans-serif',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                            {item.name === 'Who We Serve' && whoWeServeDropdownItems.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleWhoWeServeDropdownItemClick(dropdownItem.href);
                                }}
                                className="mobile-dropdown-item"
                                style={{
                                  display: 'block',
                                  padding: '0.75rem 1rem 0.75rem 2rem',
                                  color: '#374151',
                                  textDecoration: 'none',
                                  fontSize: '0.9rem',
                                  fontFamily: 'Prompt, sans-serif',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <a 
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(item);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                          style={{ 
                            color: isActive ? '#1D6DD8' : '#374151',
                            cursor: 'pointer'
                          }}
                          href={item.href}
                        >
                          {item.name}
                        </a>
                      )}
                    </li>
                  );
                })}
            </ul>
          </nav>
          <div className="mobile-actions">
            <button className="btn btn-primary btn-full" onClick={handleContactRequest}>
              <span>Contact Us</span>
            </button>
            <button className="btn btn-secondary btn-full" onClick={handleLogin}>
              <span>Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="contact-main">
        {/* Banner Section */}
        <section className="contact-banner">
          <div className="banner-content">
            <h1 className="banner-title">Contact Us</h1>
          </div>
          <div className="banner-image">
            <img src="/assets/images/contact-us.png" alt="Contact Us" />
          </div>
        </section>

        {/* Form Section */}
        <section className="contact-form-section mb-8">
          <div className="form-container">
            <div className="form-header">
              <div className="form-header-content">
                <h2 className="form-title">Get in Touch</h2>
                <p className="form-subtitle">Please Fill Out The Form Below</p>
              </div>
              <div className="form-header-image">
                <img src="/assets/images/contact-us.jpeg" alt="Contact Us" className="contact-form-image" />
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Your Name
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
                  Phone Number
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
                  Your Email
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
                  Organization / Facility Name
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
                  Enter a brief Message
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
                  Schedule a time to connect
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
    <footer className="footer-section" id="contact">
        <div className="footer-container">
          <div className="footer-content">
            {/* Column 1: Logo and Description */}
            <div className="footer-column">
              <div className="footer-logo">
                <img src="/assets/images/dyadmain-logofooter.svg" alt="Dyad Logo" />
              </div>
              <p className="footer-description" style={{textAlign: 'justify'}}>
                Dyad is a fully integrated healthcare finance operations platform for anesthesia, ambulatory surgery centers, and the surgical specialties that operate within them, built on bank-grade infrastructure. We replace fragmented vendors with a single operating layer powered by deep industry expertise, advanced technologies, and institutional-grade risk controls, delivering end-to-end precision. One platform for independent practices, physician groups, private equity-backed portfolios, and managed services organizations. Truly integrated. Exponentially scalable.
              </p>
            </div>

            {/* Column 2: Services */}
            <div className="footer-column">
              <h3 className="footer-column-title">Services</h3>
              <ul className="footer-menu">
                <li><a href="#services">Practice Foundations</a></li>
                <li><a href="#services">Technology Driven Capabilities</a></li>
                <li><a href="#services">Pre & Post Encounter</a></li>
                <li><a href="#services">Claims Management</a></li>
                <li><a href="#services">Specialty Billing</a></li>
                <li><a href="#services">Real Time Insights</a></li>
              </ul>
            </div>

            {/* Column 3: Specialties */}
            <div className="footer-column">
              <h3 className="footer-column-title">Specialties</h3>
              <ul className="footer-menu">
                <li><a href="#surgical-specialties">Surgical & Procedural Specialties</a></li>
                <li><a href="#interventional-care">Interventional & Diagnostic Care</a></li>
                <li><a href="#perioperative-services">Perioperative & Supportive Services</a></li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="footer-column">
              <h3 className="footer-column-title">Contact</h3>
              <div className="footer-contact-info">
                <div className="contact-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-mail w-6 h-6 mr-3"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                  <span>info@dyadmd.com</span>
                </div>
                <div className="contact-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-map-pin w-6 h-6 mr-3"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>2573 Pacific Coast Hwy, Ste A277 Torrance, CA 90505</span>
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

import React, { useState, useRef  } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ContactUs.css';
import ReCAPTCHA from 'react-google-recaptcha';

// Validation schema
const contactSchema = yup.object({
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

const ContactUs: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Contact');
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isWhoWeServeDropdownOpen, setIsWhoWeServeDropdownOpen] = useState(false);
  const [isWhatWeDoDropdownOpen, setIsWhatWeDoDropdownOpen] = useState(false);
 const captchaRef = useRef(null);

 const handleRecaptchaChange = (token: string | null) => {
    console.log('reCAPTCHA changed:', token);
    if (token) {
      setValue('recaptcha', true);
      setRecaptchaVerified(true);
    } else {
      setValue('recaptcha', false);
      setRecaptchaVerified(false);
    }
  };


 const whatWeDoDropdownItems = [
    { name: 'Practice Foundations', href: '#services', cardId: 0 },
    { name: 'Technology Driven Capabilities', href: '#services', cardId: 1 },
    { name: 'Pre & Post Encounter', href: '#services', cardId: 2 },
    { name: 'Claims Management', href: '#services', cardId: 3 },
    { name: 'Specialty Billing', href: '#services', cardId: 4 },
    { name: 'Real Time Insights', href: '#services', cardId: 5 }
  ];

 const contactNavigationItems = [
    { name: 'About Us', href: '#about', hasDropdown: true },
    { name: 'What We Do', href: '#services', hasDropdown: true },
    { name: 'Who We Serve', href: '#who-we-serve', hasDropdown: true }
  ];



   const aboutDropdownItems2 = [
    { name: 'Our Story & Inspiration', href: '#about', cardId: 0 },
    { name: 'Our Mission & Vision', href: '#about', cardId: 1 },
    { name: 'Our Values & Principles', href: '#about', cardId: 2 },
    { name: 'Our Approach & Methodology', href: '#about', cardId: 3 },
    { name: 'Our Innovative Technologies', href: '#about', cardId: 4 },
    { name: 'Our Team & Expertise', href: '#leadership', cardId: 5 }
  ];

  const whoWeServeDropdownItems = [
    { name: 'Surgical & Procedural Specialties'},
    { name: 'Interventional & Diagnostic Care'},
    { name: 'Perioperative & Supportive Services'},
    { name: 'Outpatient & Specialty Facilities' }
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

  const handleWhatWeDoDropdownHover = (isOpen: boolean) => {
    setIsWhatWeDoDropdownOpen(isOpen);
  };

  const handleAboutDropdownItemClick = (href: string) => {
    navigate('/', { state: { scrollTo: href } });
    setIsAboutDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleWhatWeDoDropdownItemClick = (dropdownItem: any) => {
    navigate('/', { state: { scrollTo: dropdownItem.href, cardId: dropdownItem.cardId } });
    setIsWhatWeDoDropdownOpen(false);
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
    // Navigate to contact page
    navigate('/contact');
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger
  } = useForm({
    resolver: yupResolver(contactSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: any) => {
    console.log('Form submitted with data:', data);
    setIsSubmitting(true);

    const token = captchaRef.current?.getValue();
    console.log('reCAPTCHA token:', token);

    if (!token) {
      alert('Please complete the CAPTCHA.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const payload = {
        ...data,
        scheduledTime: data.scheduledTime || new Date().toISOString()
      };
      
      console.log('API payload:', payload);

      const apiUrl = import.meta.env.VITE_API_URL || '';
      console.log('API URL:', apiUrl);
      console.log('Full endpoint:', `${apiUrl}/api/contact-requests`);
      
      const response = await axios.post(`${apiUrl}/api/contact-requests`, payload);
      console.log('API response:', response);
      
      if (response.data.success) {
        toast.success('Your request has been submitted successfully!');
        // Reset form
        setValue('name', '');
        setValue('phoneNumber', '');
        setValue('email', '');
        setValue('organization', '');
        setValue('message', '');
        setRecaptchaVerified(false);
        setValue('recaptcha', false);
        
        // Scroll to top when form is submitted successfully with a delay
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        toast.error(response.data.message || 'Failed to submit request. Please try again.');
      }
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      
      if (error.response?.status === 429) {
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


  // Get minimum date as today for datetime input
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="contact-us-container">
      {/* Contact Banner */}
      
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
                    <li key={item.name} className="nav-item-container"
                      onMouseEnter={() => {
                        handleMenuHover(item.name);
                        if (item.hasDropdown) {
                          if (item.name === 'About Us') {
                            handleAboutDropdownHover(true);
                          } else if (item.name === 'Who We Serve') {
                            handleWhoWeServeDropdownHover(true);
                          } else if (item.name === 'What We Do') {
                            handleWhatWeDoDropdownHover(true);
                          }
                        }
                      }}
                      onMouseLeave={() => {
                        handleMenuHover(null);
                        if (item.hasDropdown) {
                          if (item.name === 'About Us') {
                            handleAboutDropdownHover(false);
                          } else if (item.name === 'Who We Serve') {
                            handleWhoWeServeDropdownHover(false);
                          } else if (item.name === 'What We Do') {
                            handleWhatWeDoDropdownHover(false);
                          }
                        }
                      }}
                    >
                      {item.hasDropdown ? (
                        <div className="dropdown-container">
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
                              alignItems: 'center',
                              gap: '0.5rem'
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
                            (item.name === 'Who We Serve' && isWhoWeServeDropdownOpen) ||
                            (item.name === 'What We Do' && isWhatWeDoDropdownOpen)
                              ? 'open' : ''
                          }`}>
                            {item.name === 'About Us' && aboutDropdownItems2.map((dropdownItem) => (
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
                            {item.name === 'What We Do' && whatWeDoDropdownItems.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleWhatWeDoDropdownItemClick(dropdownItem);
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
                            fontWeight: 400,
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
              <button className="btn btn-primary" onClick={handleLogin}>
                <span>Login/Register</span>
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
                              } else if (item.name === 'What We Do') {
                                handleWhatWeDoDropdownHover(!isWhatWeDoDropdownOpen);
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
                            (item.name === 'Who We Serve' && isWhoWeServeDropdownOpen) ||
                            (item.name === 'What We Do' && isWhatWeDoDropdownOpen)
                              ? 'open' : ''
                          }`}>
                            {item.name === 'About Us' && aboutDropdownItems2.map((dropdownItem) => (
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
                            {item.name === 'What We Do' && whatWeDoDropdownItems.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleWhatWeDoDropdownItemClick(dropdownItem);
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
            <button className="btn btn-primary btn-full" onClick={handleLogin}>
              <span>Login</span>
            </button>
          </div>
        </div>
      </header>

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
              <div className="form-header-content">
                <h2 className="form-title">To be filled out by Providers or Administrators:</h2>
              
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
                      Enter a brief Message*
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

                {/* Schedule Time & reCAPTCHA Row */}
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="scheduledTime" className="form-label">
                      Schedule a time to connect*
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

               
                </div>
  <ReCAPTCHA 
    sitekey="6LfUvKQsAAAAAEYzVOsF2PJv7EzW-JGTQOQK4-Jw" 
    ref={captchaRef} 
    onChange={handleRecaptchaChange}
  />
  <input type="hidden" {...register('recaptcha')} /> 
              
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
            
            {/* Right Side - Image */}
            <div className="form-right-section">
              <img src="/assets/images/contact-us.jpeg" alt="Contact Us" />
            </div>
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
                <li><a href="#outpatient-facilities">Outpatient & Specialty Facilities</a></li>
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
                  <span>2573 Pacific Coast Hwy, Suite A277<br />Torrance, CA 90505</span>
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

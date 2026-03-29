import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./service-detail.css";

const AboutUsDetail: React.FC = () => {

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

  const servicesData = [
    {
      id: 0,
      title: 'Practice Foundations',
      subtitle: 'Startup support, compliance and credentialing',
      image: '/assets/images/ourservices1.jpg',
      icon: 'icon-building',
      description: 'Comprehensive practice foundation services that ensure your startup success. From initial setup to ongoing compliance management, we provide the essential support needed for sustainable practice operations.',
      features: [
        'Practice assessment',
        'Payer enrollment',
        'Physician credentialing',
        'Facility credentialing',
        'Physician licensing'
      ]
    },
    {
      id: 1,
      title: 'Technology Driven Capabilities',
      subtitle: 'Mobile supported work flows, ONC Integration FHIR, governance and compliance',
      image: '/assets/images/ourservices2.jpg',
      icon: 'icon-laptop',
      description: 'Advanced technology solutions that modernize your practice operations. Our integrated platform ensures seamless workflows and compliance with industry standards.',
      features: [
        'iOS mobile supported Anesthesia workflows',
        'ONC Integration FHIR',
        'Fully automated and integrated document management',
        '24/7 365 ecosystem monitoring, governance, and compliance'
      ]
    },
    {
      id: 2,
      title: 'Pre & Post Encounter',
      subtitle: 'Eligibility verifications, prior-authorizations, patient estimates, Precision driven charge capture, Specialty Coding',
      image: '/assets/images/ourservices3.jpg',
      icon: 'icon-clipboard',
      description: 'Complete pre and post-encounter management that optimizes your revenue cycle. From patient eligibility to precise coding, we ensure accuracy at every step.',
      features: [
        'Eligibility & Benefits verifications',
        'Prior-authorizations',
        'Patient good faith estimates',
        'Expedited Charge capture',
        'Specialty Coding'
      ]
    },
    {
      id: 3,
      title: 'Claims Management',
      subtitle: 'Expedited submissions, resolutions & real-time tracking',
      image: '/assets/images/ourservices4.png',
      icon: 'icon-document',
      description: 'Streamlined claims management that accelerates reimbursement and reduces denials. Our expert team ensures optimal claim submission and resolution.',
      features: [
        'Denials & Appeals',
        'Accounts Receivable (AR)',
        'Payment posting & Reconciliation',
        'Re-bill processing',
        'Underpayments detection & recovery'
      ]
    },
    {
      id: 4,
      title: 'Specialty Billing',
      subtitle: 'Expert lien management for complex cases',
      image: '/assets/images/ourservices5.jpeg',
      icon: 'icon-medical',
      description: 'Specialized billing services for complex cases requiring expert lien management. Our team handles intricate billing scenarios with precision.',
      features: [
        'Personal injury',
        'Workers compensation'
      ]
    },
    {
      id: 5,
      title: 'Real Time Insights',
      subtitle: 'Credentials alert, reporting & strategic insights',
      image: '/assets/images/ourservices6.jpg',
      icon: 'icon-chart',
      description: 'Real-time analytics and insights that drive strategic decision-making. Stay informed with instant alerts and comprehensive reporting.',
      features: [
        'Track claims real time',
        'CAQH management',
        'Contracted rates benchmarking',
        'Market analytics',
        'Robust reporting',
        'Customized insights'
      ]
    }
  ];


  return (
    <div>
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

       <section className="about-us-section" id="about">
        <div className="about-container">
          <div className="about-header">
             <h2 className="services-title">Our Services</h2>
            <p className="services-subtitle">
              We set the standard for accuracy, efficiency, and value - delivering faster turnarounds, unmatched precision, and measurable impact. Backed by rigorous risk controls and uncompromising quality, our integrated solutions go beyond excellence to redefine what's possible. No fragmentation - just a unified approach. Most services operate within our full-service model, where seamless integration drives real value.
            </p>   </div>
        
   <div className="leadership-grid service-detail">
            {servicesData.map((service) => (
              <div
                key={service.id}
                className={`leadership-card service-us-card-detail}`}
              >
                <div className="leadership-image service-us-image">
                  <img src={service.image} alt={service.title} data-mobile-src={service.image} />
                </div>
                <div className="leadership-content">
                  <h3 className="leader-name">{service.title}</h3>
                  <p className="leader-title">{service.subtitle}</p>
                   <div className="description-features">
                      <ul>
                        {service.features.map((feature, index) => (
                          <li key={index}>
                            <img src="/assets/images/Vector.svg" alt="✓" className="tick-icon" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      
      </section>


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

export default AboutUsDetail;
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DyadLanding.css';

const DyadLanding: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeAboutCard, setActiveAboutCard] = useState<number | null>(null);
  const [activeMenu, setActiveMenu] = useState('Home');
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isWhoWeServeDropdownOpen, setIsWhoWeServeDropdownOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle scroll from Contact Us page navigation
  useEffect(() => {
    if (location.state?.scrollTo) {
      const scrollTo = location.state.scrollTo;
      const sectionId = scrollTo.replace('#', '');
      const element = document.getElementById(sectionId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      // Clear the state to prevent re-scrolling
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  const handleLogin = () => {
    // Navigate to login page
    navigate('/login');
  };
  
  const handleContactRequest = () => {
    // Navigate to contact page
    navigate('/contact');
  };
  
  const handleLogoClick = () => {
    // Navigate to landing page (top)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleNavClick = (menuName: string, href: string) => {
    setActiveMenu(menuName);
    
    // Close all dropdowns when clicking on other menu items
    setIsAboutDropdownOpen(false);
    setIsWhoWeServeDropdownOpen(false);
    
    // Don't navigate for Who We Serve - just close dropdowns
    if (menuName === 'Who We Serve') {
      return;
    }
    
    // Smooth scroll to section with header offset
    const sectionId = href.replace('#', '');
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Approximate header height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleAboutDropdownHover = (isOpen: boolean) => {
    setIsAboutDropdownOpen(isOpen);
    if (isOpen) {
      setIsWhoWeServeDropdownOpen(false);
      setHoveredMenu('About Us');
    } else {
      setHoveredMenu(null);
    }
  };

  const handleWhoWeServeDropdownHover = (isOpen: boolean) => {
    setIsWhoWeServeDropdownOpen(isOpen);
    if (isOpen) {
      setIsAboutDropdownOpen(false);
      setHoveredMenu('Who We Serve');
    } else {
      setHoveredMenu(null);
    }
  };

  const handleAboutDropdownItemClick = (href: string) => {
    setActiveMenu('About Us');
    setIsAboutDropdownOpen(false);
    setHoveredMenu(null);
    
    // Always redirect to main About Us section with header offset
    const aboutElement = document.getElementById('about');
    if (aboutElement) {
      const headerHeight = 80; // Approximate header height
      const elementPosition = aboutElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleWhoWeServeDropdownItemClick = (href: string) => {
    // Don't set active menu for Who We Serve
    setIsWhoWeServeDropdownOpen(false);
    setHoveredMenu(null);
    // No navigation - just close dropdown
  };

  const handleMenuHover = (menuName: string | null) => {
    setHoveredMenu(menuName);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container') && !target.closest('.mobile-dropdown-container')) {
        setIsAboutDropdownOpen(false);
        setIsWhoWeServeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleAboutCardClick = (cardId: number) => {
    setActiveAboutCard(activeAboutCard === cardId ? null : cardId);
  };
  
  const leadershipData = [
    {
      id: 1,
      name: 'S. Jaikumar',
      title: 'Founder',
      description: '27+ years building institutional-grade financial, payments, and risk infrastructure. A Treasurer at global enterprises with deep expertise in collections optimization, cash acceleration, and controls for over 2.5 trillion in assets under management. Designed real-time receivables, merchant processing, and fraud mitigation platforms — applied directly to healthcare revenue cycle. Brings fiduciary discipline and payer-level rigor to physician reimbursement.',
      image: '/assets/images/leadershipnew1.jpeg',
      mobileImage: '/assets/images/leadershipmb1.jpeg'
    },
    {
      id: 2,
      name: 'A. Subramaniam',
      title: 'Chief Technology & AI Officer',
      description: '27+ years architecting enterprise data, AI, and automation platforms across healthcare and financial services at major insurers and global banks. Chief AI Officer who has scaled 50+ production AI and GenAI accelerators including data ingestion, rules engines, and document intelligence. Expert in paper-elimination, workflow automation, and real-time analytics. Adjunct professor at Johns Hopkins AI graduate studies.',
      image: '/assets/images/leadershipnew2.jpeg',
      mobileImage: '/assets/images/leadershipmb2.jpeg'
    },
    {
      id: 3,
      name: 'S. Rajan',
      title: 'Chief Operating Officer, India',
      description: '28+ years running large-scale U.S. healthcare RCM operations across onshore and offshore teams. Former global P&L leader for multi-billion-dollar RCM platforms serving thousands of providers. Deep expertise in specialty billing, AR recovery, denials, IDR workflows, SLA governance, and compliance. Scales Dyad\'s operations with a quality-first, audit-defensible model.',
      image: '/assets/images/leadershipnew3.jpeg',
      mobileImage: '/assets/images/leadershipmb3.jpeg'
    }
  ];

  const aboutContent = [
    {
      id: 0,
      title: 'Our Story & Inspiration',
      subtitle: 'The origins and purpose',
      paragraph: 'In 1908, William J. Mayo hired Harry Harwick to manage the business and operations of the Mayo Clinic, pioneering a new leadership model in healthcare: the Dyad. At its core, a Dyad is a partnership - a seamless collaboration between a clinical leader and a business operations expert to elevate care delivery and practice performance. Inspired by this model, Dyad Practice Solutions was founded to bring the same partnership-driven approach to modern healthcare finance operations, combining institutional-grade technology, domain expertise, and a commitment to transforming practice operations.',
      image: '/assets/images/aboutus1.png'
    },
    {
      id: 1,
      title: 'Our Mission & Vision',
      subtitle: 'What drives us forward',
      paragraph: 'Healthcare finance operations deserves the same qualitative and quantitative discipline that financial and banking enterprises apply to capital. Dyad was built on that premise. We bring a fiduciary lens to healthcare financial operations - removing the inefficiencies, redundancies, and gaps that erode revenue. Through integrated technology, data-driven analytics, and a partnership model grounded in accountability, we give healthcare organizations the infrastructure to operate with institutional-grade precision.',
      image: '/assets/images/aboutus2.jpg'
    },
    {
      id: 2,
      title: 'Our Values & Principles',
      subtitle: 'The foundation of our work',
      paragraph: 'Excellence, integrity, partnership, and innovation guide everything we do. We believe in building long-term relationships with our clients, understanding their unique challenges, and delivering solutions that exceed expectations. Our commitment to quality, compliance, and continuous improvement ensures that our clients receive the highest standard of service and support.',
      image: '/assets/images/aboutus3.jpeg'
    },
    {
      id: 3,
      title: 'Our Approach & Methodology',
      subtitle: 'How we deliver results',
      paragraph: 'We combine innovative technologies with healthcare finance expertise to deliver comprehensive solutions. Our methodology involves thorough a assessment, strategic planning, seamless implementation, and ongoing optimization. We work collaboratively with our clients to understand their workflows, identify opportunities for improvement, and implement changes that drive measurable results.',
      image: '/assets/images/aboutus4.jpg'
    },
    {
      id: 4,
      title: 'Our Innovative Technologies',
      subtitle: 'Advanced solutions for modern healthcare',
      paragraph: "Grounded in industry expertise, rigorous risk controls, and governance, our platform leverages artificial intelligence, machine learning, and advanced analytics to optimize healthcare operations. From intelligent coding and claims processing to predictive analytics and real-time reporting, our solutions deliver the financial intelligence and operational discipline to thrive in today's complex healthcare landscape.",
      image: '/assets/images/aboutus5.jpeg'
    },
    {
      id: 5,
      title: 'Our Team & Expertise',
      subtitle: 'The people behind our success',
      paragraph: 'Our team brings together decades of experience in healthcare, technology, and business operations. With backgrounds in leading healthcare institutions, technology companies, and financial services, our experts understand the unique challenges facing modern medical practices and are committed to delivering solutions that drive success.',
      image: '/assets/images/aboutus6.webp'
    }
  ];

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

  const aboutDropdownItems = [
    { name: 'Our Story & Inspiration', href: '#about-story' },
    { name: 'Our Mission & Vision', href: '#about-mission' },
    { name: 'Our Values & Principles', href: '#about-values' },
    { name: 'Our Approach & Methodology', href: '#about-approach' },
    { name: 'Our Innovative Technologies', href: '#about-technology' },
    { name: 'Our Team & Expertise', href: '#about-team' }
  ];

  const whoWeServeDropdownItems = [
    { name: 'Surgical & Procedural Specialties', href: '#surgical-specialties' },
    { name: 'Interventional & Diagnostic Care', href: '#interventional-care' },
    { name: 'Perioperative & Supportive Services', href: '#perioperative-services' },
    { name: 'Outpatient & Specialty Facilities', href: '#outpatient-facilities' }
  ];

  const navigationItems = [
    { name: 'About Us', href: '#about', hasDropdown: true },
    { name: 'Leadership', href: '#leadership' },
    { name: 'What We Do', href: '#services' },
    { name: 'Who We Serve', href: '#who-we-serve', hasDropdown: true }
  ];

  return (
    <div className="dyad-landing-container" id="top">
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
                {navigationItems.map((item) => {
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
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            {item.name}
                            <svg 
                              className={`dropdown-arrow ${
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
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(item.name, item.href);
                          }}
                          onMouseEnter={() => handleMenuHover(item.name)}
                          onMouseLeave={() => handleMenuHover(null)}
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
              {navigationItems.map((item) => {
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
                                  setIsMobileMenuOpen(false);
                                }}
                                className="mobile-dropdown-item"
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
                                  setIsMobileMenuOpen(false);
                                }}
                                className="mobile-dropdown-item"
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
                            handleNavClick(item.name, item.href);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                          style={{ 
                            color: isActive ? '#1D6DD8' : '#374151',
                            cursor: 'pointer'
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

      {/* Main Content - Video Banner */}
      <main className="dyad-main">
        <div className="video-banner">
          <video
            className="video-background"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/videos/dyad-bannervideo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Video Overlay */}
          <div className="video-overlay">
            <div className="video-content">
              <div className="title-container">
                <h1 className="video-title">
                  <span className="title-line">A Bold Partnership Model for Smarter Healthcare Operations</span>
                
                </h1>
                <p className="video-subtitle" style={{ marginTop: '2rem' }}>
           We're rewriting the rules. By uniting industry expertise, innovative technologies, and operational risk controls, we're introducing a scalable new model of integration that is built to measurably improve practice economics.      </p>
              </div>
            </div>
          </div>
        </div>
      </main>

       {/* Trust Logos Section */}
      <section className="trust-logos-section">
        <div className="trust-container">
          <div className="logos-scroll">
            <div className="logos-track">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="logo-set">
                  <div className="logo-item">
                    <img src="/assets/images/logo_section.svg" alt="Trust Logo 1" />
                  </div>
                  <div className="logo-item">
                    <img src="/assets/images/logo_section1.svg" alt="Trust Logo 2" />
                  </div>
                  <div className="logo-item">
                    <img src="/assets/images/logo_section2.svg" alt="Trust Logo 3" />
                  </div>
                  <div className="logo-item">
                    <img src="/assets/images/logo_section3.svg" alt="Trust Logo 4" />
                  </div>
                  <div className="logo-item">
                    <img src="/assets/images/logo_section4.svg" alt="Trust Logo 5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-us-section" id="about">
        <div className="about-container">
          <div className="about-header">
            <h2 className="about-title">About Us</h2>
            <p className="about-subtitle">
          Dyad is a fully integrated healthcare finance operations platform for anesthesia, ambulatory surgery centers, and the surgical specialties that operate within them, built on bank-grade infrastructure. We replace fragmented vendors with a single operating layer powered by deep industry expertise, advanced technologies, and institutional-grade risk controls, delivering end-to-end precision. One platform for independent practices, physician groups, private equity-backed portfolios, and managed services organizations. Truly integrated. Exponentially scalable.    </p>
          </div>
          <div className="about-grid">
            {aboutContent.map((item) => (
              <div
                key={item.id}
                className={`about-card ${activeAboutCard === item.id ? 'active' : ''}`}
                onClick={() => handleAboutCardClick(item.id)}
              >
                <div className="about-card-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="about-card-overlay">
                  <h3 className="about-card-title">{item.title}</h3>
                  <p className="about-card-subtitle">{item.subtitle}</p>
                  <div className="about-card-learn-more">
                    <span>Learn More →</span>
                  </div>
                  <p className="about-card-paragraph">{item.paragraph}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="leadership-section" id="leadership">
        <div className="leadership-container">
          <div className="leadership-header">
            <h2 className="leadership-title">Leadership</h2>
            <p className="leadership-subtitle">
              Decades of proven expertise at the intersection of healthcare, finance and technology
            </p>
          </div>
          <div className="leadership-grid">
            {leadershipData.map((leader, index) => (
              <div
                key={leader.id}
                className={`leadership-card ${index % 2 === 1 ? 'reversed' : ''}`}
              >
                <div className="leadership-image">
                  <div className="leadership-image-bg" data-mobile-bg={leader.mobileImage}></div>
                  <img src={leader.image} alt={leader.name} data-mobile-src={leader.mobileImage} />
                </div>
                <div className="leadership-content">
                  <h3 className="leader-name">{leader.name}</h3>
                  <p className="leader-title">{leader.title}</p>
                  <p className="leader-description">{leader.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    

      {/* Our Services Section */}
      <section className="services-section" id="services">
        <div className="services-container">
          <div className="services-header">
            <h2 className="services-title">Our Services</h2>
            <p className="services-subtitle">
              We set the standard for accuracy, efficiency, and value - delivering faster turnarounds, unmatched precision, and measurable impact. Backed by rigorous risk controls and uncompromising quality, our integrated solutions go beyond excellence to redefine what's possible. No fragmentation - just a unified approach. Most services operate within our full-service model, where seamless integration drives real value.
            </p>
          </div>
          <div className="services-grid">
            {servicesData.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-card-image">
                  <img src={service.image} alt={service.title} />
                </div>
                <div className="service-card-content">
                  <h3 className="service-card-title">{service.title}</h3>
                  <p className="service-card-subtitle">{service.subtitle}</p>
                  <div className="service-card-learn-more" style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
                    <span>Learn More</span>
                  </div>
                </div>
                <div className="service-card-description-overlay">
                  <div className="description-content">
                    <h3>{service.title}</h3>
                    
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
              </div>
            ))}
          </div>
        </div>
      </section>

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
                  <span className="contact-symbol">✉</span>
                  <span>info@dyadmd.com</span>
                </div>
                <div className="contact-item">
                  <span className="contact-symbol">📍</span>
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

export default DyadLanding;

import React, { useState, useEffect } from 'react';
import './DyadLanding.css';

const DyadLanding: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState<number>(0);
  const [activeAbout, setActiveAbout] = useState<number>(0);
  
  const leadershipData = [
    {
      id: 1,
      name: 'S. Jaikumar',
      title: 'Founder',
   
      description: '27+ years building institutional-grade financial, payments, and risk infrastructure. A Treasurer at global enterprises with deep expertise in collections optimization, cash acceleration, and controls for over 2.5 trillion in assets under management. Designed real-time receivables, merchant processing, and fraud mitigation platforms — applied directly to healthcare revenue cycle. Brings fiduciary discipline and payer-level rigor to physician reimbursement.',
      image: 'https://ui-avatars.com/api/?name=S.+Jaikumar&background=1D6DD8&color=fff&size=400'
    },
    {
      id: 2,
      name: 'A. Subramaniam',
      title: 'Chief Technology & AI Officer',
    
      description: '27+ years architecting enterprise data, AI, and automation platforms across healthcare and financial services at major insurers and global banks. Chief AI Officer who has scaled 50+ production AI and GenAI accelerators including data ingestion, rules engines, and document intelligence. Expert in paper-elimination, workflow automation, and real-time analytics. Adjunct professor at Johns Hopkins AI graduate studies.',
      image: 'https://ui-avatars.com/api/?name=A.+Subramaniam&background=00A7D8&color=fff&size=400'
    },
    {
      id: 3,
      name: 'K. S. Rajan',
      title: 'Chief Operating Officer, India',
     
      description: '28+ years running large-scale U.S. healthcare RCM operations across onshore and offshore teams. Former global P&L leader for multi-billion-dollar RCM platforms serving thousands of providers. Deep expertise in specialty billing, AR recovery, denials, IDR workflows, SLA governance, and compliance. Scales Dyad\'s operations with a quality-first, audit-defensible model.',
      image: 'https://ui-avatars.com/api/?name=K.+S.+Rajan&background=B0DA23&color=fff&size=400'
    }
  ];

  const aboutContent = [
    {
      id: 0,
      title: 'Our Story & Inspiration',
      subtitle: 'The origins and purpose',
      paragraph: 'In 1908, William J. Mayo hired Harry Harwick to manage the business and operations of the Mayo Clinic, pioneering a new leadership model in healthcare: the Dyad. At its core, a Dyad is a partnership — a seamless collaboration between a clinical leader and a business operations expert to elevate care delivery and practice performance. Inspired by this model, Dyad Practice Solutions was founded to bring the same partnership-driven approach to modern healthcare operations, combining institutional-grade technology, deep domain expertise and a commitment to transforming practice operations.',
      image: '/assets/images/aboutus1.png'
    },
    {
      id: 1,
      title: 'Clarity & Accountability',
      subtitle: 'Partnership through integrity and transparency',
      paragraph: 'The DYAD partnership-driven model is built on a fiduciary commitment, providing integrity and transparency in every engagement. We deliver measurable outcomes that support practices in optimizing operations while ensuring they maintain control. Our approach ensures every solution aligns with the best interests of the organization, creating stability, efficiency, and accountability in practice operations.',
      image: '/assets/images/aboutus2.jpg'
    },
    {
      id: 2,
      title: 'Technology Guided by Expertise',
      subtitle: 'Integrated risk controls & optimized workflows',
      paragraph: 'Technology alone isn\'t enough — it\'s how it\'s applied that makes the difference. Dyad integrates AI, automation, and data-driven insights with industry expertise to improve workflows, reduce costs, and strengthen practice operations — all with expert oversight to ensure accuracy and reliability. Our integrated approach delivers a seamless, structured framework that enhances efficiency and ensures consistency.',
      image: '/assets/images/aboutus3.jpeg'
    },
    {
      id: 3,
      title: 'Scalable by Design',
      subtitle: 'Empowering independent practices with scalable solutions',
      paragraph: 'Whether you operate a single practice, a regional group, or a PE-backed portfolio of acquisitions, Dyad deploys the same institutional-grade platform with consistent controls, consolidated reporting, and real-time visibility. Our modular architecture means onboarding a new entity does not require custom integration or months of implementation. Dyad delivers value, exceptional service, and measurable results from day one.',
      image: '/assets/images/aboutus4.jpg'
    },
    {
      id: 4,
      title: 'Why DYAD?',
      subtitle: 'Expertise, execution and strategic support',
      paragraph: 'DYAD integrates industry expertise, technology, and structured risk controls to create stability, efficiency, and accountability in practice operations. Rather than offering fragmented, à la carte services, we take an integrated approach — delivering a seamless, structured framework that enhances efficiency, ensures consistency, and drives measurable outcomes. Our approach ensures every solution aligns with the best interests of the organization.',
      image: '/assets/images/aboutus5.jpeg'
    },
    {
      id: 5,
      title: 'Our Process',
      subtitle: 'Streamlined for efficiency from day one',
      paragraph: 'Designed with intention, built for impact. From onboarding to execution, our streamlined approach eliminates complexity, accelerates results, and ensures seamless integration. We deliver a seamless, structured framework that enhances efficiency, ensures consistency, and drives measurable outcomes — all with expert oversight to ensure accuracy and reliability.',
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
        'Facility credentialing',
        'Physician licensing',
        'Physician credentialing'
      ]
    },
    {
      id: 1,
      title: 'Technology driven capabilities',
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

  const navigationItems = [
    { name: 'Home', href: '#top' },
    { name: 'About us', href: '#about' },
    { name: 'Leadership', href: '#leadership' },
    { name: 'Our services', href: '#services' }
  ];

  const [activeSection, setActiveSection] = useState('top');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'leadership', 'services', 'contact'];
      const scrollPosition = window.scrollY + 100;

      // Check if at top of page
      if (scrollPosition < 200) {
        setActiveSection('top');
        return;
      }

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="dyad-landing-container" id="top">
      {/* Header */}
      <header className="dyad-header">
        <div className="dyad-header-content">
          {/* Left - Logo */}
          <div className="dyad-logo">
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
              <ul className="nav-list">
                {navigationItems.map((item) => (
                  <li key={item.name}>
                    <a 
                      href={item.href} 
                      className={`nav-link ${activeSection === item.href.slice(1) ? 'active' : ''}`}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Action Buttons */}
            <div className="dyad-actions">
              <button className="btn btn-primary">
                <span>Request an Introduction</span>
              </button>
              <button className="btn btn-secondary">
                <span>Login</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
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
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.href} 
                    className={`mobile-nav-link ${activeSection === item.href.slice(1) ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mobile-actions">
            <button className="btn btn-primary btn-full">
              <span>Request an Introduction</span>
            </button>
            <button className="btn btn-secondary btn-full">
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
                  <span className="title-line">A Bold Partnership Model for</span>
                  <span className="title-line">Fiduciary-Grade Practice Operations</span>
                </h1>
              </div>
              
              <p className="video-subtitle">
              One platform. Fully integrated. Highly scalable
               
              </p>
              
              <div className="button-group">
                <button className="request-demo-button">
                  <span>Request an Introduction</span>
                </button>
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
         Dyad is the integrated revenue cycle and practice operations platform for anesthesia, ambulatory surgery centers, and the surgical specialties that operate within them, built on banking-class infrastructure. We replace fragmented vendors with a single operating layer powered by deep industry expertise, advanced technology, and institutional-grade risk controls, delivering end-to-end precision from to case to cash, same day. One platform for independent practices, physician groups, private equity-backed portfolios, and managed services organizations. Truly integrated. Exponentially scalable.    </p>
          </div>

          {/* About Tabs */}
          <div className="about-tabs">
            {aboutContent.map((item) => (
              <button 
                key={item.id}
                className={`about-tab ${activeAbout === item.id ? 'active' : ''}`}
                onClick={() => setActiveAbout(item.id)}
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* About Content - Show only active card */}
          <div className="about-content-area">
            {aboutContent.map((item) => (
              <div 
                key={item.id} 
                className={`about-card ${activeAbout === item.id ? 'active' : ''}`}
              >
                <div className="about-card-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="about-card-content">
                  <h3 className="about-card-title">{item.title}</h3>
                  <h4 className="about-card-subtitle">{item.subtitle}</h4>
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
              <div key={leader.id} className={`leadership-card ${index === 1 ? 'reversed' : ''}`}>
                <div className="leadership-image">
                  <img src={leader.image} alt={leader.name} />
                </div>
                <div className="leadership-content">
                  <div className="content-arrow" style={{width: '15px'}}>
                    <svg width="15" height="20" viewBox="0 0 20 20" fill="#B0DA23">
                      <path d="M10 2L18 18H2L10 2Z"/>
                    </svg>
                  </div>
                  <h3 className="leader-name">{leader.name}</h3>
                  <h4 className="leader-title">{leader.title}</h4>
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

          <div className="services-content">
            {/* Left Side - Service List */}
            <div className="services-list">
              {servicesData.map((service) => (
                <div 
                  key={service.id} 
                  className={`service-item ${activeService === service.id ? 'active' : ''}`}
                  onClick={() => setActiveService(service.id)}
                >
                  {/* Mobile Card Image - Top */}
                  <div className="service-card-image">
                    <img src={service.image} alt={service.title} />
                  </div>
                  
                  <div className="service-item-content">
                    {/* Title - Below Image */}
                    <h3 className="service-item-title">{service.title}</h3>
                    
                    {/* Subtitle - Below Title */}
                    <p className="service-item-subtitle">{service.subtitle}</p>
                    
                    {/* Expand Text - Below Subtitle */}
                    <span 
                      className="service-expand-text"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveService(activeService === service.id ? -1 : service.id);
                      }}
                    >
                      {activeService === service.id ? 'Show Less' : 'Learn More'}
                    </span>
                  </div>
                  
                  {/* Expandable Content - Mobile Only */}
                  <div className="service-expand-content">
                    <div className="service-expand-details">
                      <ul className="service-features-list">
                        {service.features.map((feature, index) => (
                          <li key={index} className="service-feature-item">
                            <img src="/assets/images/vector-tick.png" alt="✓" className="feature-bullet" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side - Service Details */}
            <div className="service-details">
              {servicesData.map((service) => (
                <div 
                  key={service.id} 
                  className={`service-detail-card ${activeService === service.id ? 'active' : ''}`}
                >
                  <div className="service-detail-image">
                    <img src={service.image} alt={service.title} />
                  </div>
                  <div className="service-detail-content">
                    <h3 className="service-detail-title">{service.title}</h3>
                    <h4 className="service-detail-subtitle">{service.subtitle}</h4>
                    <ul className="service-features-list">
                      {service.features.map((feature, index) => (
                        <li key={index} className="service-feature-item">
                          <img src="/assets/images/vector-tick.png" alt="✓" className="feature-bullet" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer-section" id="contact">
        <div className="footer-container">
          {/* Company Info Section */}
          <div className="footer-column">
            <div className="footer-logo">
              <img src="/assets/images/dyadmain-ogo.svg" alt="Dyad Logo" />
            </div>
            <p className="footer-description">
              Dyad is an integrated revenue cycle and practice operations platform for anesthesia, ambulatory surgery centers, and surgical specialties. Built on banking-grade infrastructure, it replaces fragmented vendors with a single, scalable operating layer—combining deep industry expertise, advanced technology, and institutional-grade controls to deliver precise, end-to-end case-to-cash outcomes, same day.
            </p>
          </div>

          {/* Company Section */}
          <div className="footer-column">
            <h3 className="footer-title">Company</h3>
            <ul className="footer-links">
              <li><a href="#top">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#leadership">Leadership</a></li>
              <li><a href="#services">Our Services</a></li>
            </ul>
          </div>

          {/* Services Section */}
          <div className="footer-column">
            <h3 className="footer-title">Services</h3>
            <ul className="footer-links">
              <li><a href="#services">Practice Foundations</a></li>
              <li><a href="#services">Technology driven capabilities</a></li>
              <li><a href="#services">Pre & Post Encounter</a></li>
              <li><a href="#services">Claims Management</a></li>
              <li><a href="#services">Specialty Billing</a></li>
              <li><a href="#services">Real Time Insights</a></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="footer-column">
            <h3 className="footer-title">Contact</h3>
            <div className="footer-contact">
              <p className="footer-email">
                <span className="contact-icon">📧</span>
                <a href="mailto:info@dyadmd.com" className="contact-link">info@dyadmd.com</a>
              </p>
              <p className="footer-address">
                <span className="contact-icon">📍</span>
                2573 Pacific Coast Hwy,<br />
                Ste A277 Torrance, CA 90505
              </p>
              <div className="social-icons">
                <a href="#" className="social-icon facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="social-icon twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="social-icon linkedin">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom Row */}
        <div className="footer-bottom">
          <div className="footer-bottom-container">
            <div className="footer-copyright">
              © 2026 DYAD Practice Solutions. All rights reserved.
            </div>
            <div className="footer-policies">
              <a href="#" className="policy-link">Privacy policy</a>
              <a href="#" className="policy-link">Terms of service</a>
              <a href="#" className="policy-link">Cookie policy</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default DyadLanding;

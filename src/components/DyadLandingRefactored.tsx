import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/landing.css';

// Types
interface NavigationItem {
  name: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: Array<{
    title: string;
    description: string;
    link: string;
  }>;
}

interface AboutContentItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  paragraph: string;
  features: string[];
}

// Constants
const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: 'Home',
    href: '#top',
  },
  {
    name: 'About',
    href: '#about',
    hasDropdown: true,
    dropdownItems: [
      { title: 'Our Story', description: 'Learn about our journey', link: '#our-story' },
      { title: 'Mission', description: 'Our mission and values', link: '#mission' },
      { title: 'Team', description: 'Meet our team', link: '#team' },
    ],
  },
  {
    name: 'Who We Serve',
    href: '#who-we-serve',
    hasDropdown: true,
    dropdownItems: [
      { title: 'Anesthesia Groups', description: 'Solutions for anesthesia practices', link: '#anesthesia' },
      { title: 'ASCs', description: 'Ambulatory Surgery Centers', link: '#asc' },
      { title: 'Surgical Specialties', description: 'Specialized surgical care', link: '#surgical' },
    ],
  },
  {
    name: 'Solutions',
    href: '#solutions',
  },
  {
    name: 'Contact',
    href: '#contact',
  },
];

const ABOUT_CONTENT: AboutContentItem[] = [
  {
    id: 1,
    title: 'Revenue Cycle Management',
    subtitle: 'Optimize your financial operations',
    image: 'https://via.placeholder.com/400x300?text=Revenue+Cycle',
    paragraph: 'Our comprehensive revenue cycle management solution streamlines your entire financial workflow, from patient registration to final payment collection. We leverage advanced automation and AI-driven analytics to reduce claim denials, accelerate payments, and improve your bottom line.',
    features: [
      'Automated claim processing',
      'Real-time denial management',
      'Patient payment optimization',
      'Analytics and reporting'
    ]
  },
  {
    id: 2,
    title: 'Practice Analytics',
    subtitle: 'Data-driven insights for better decisions',
    image: 'https://via.placeholder.com/400x300?text=Analytics',
    paragraph: 'Transform your practice data into actionable insights with our advanced analytics platform. Track key performance indicators, identify trends, and make informed decisions to drive practice growth and efficiency.',
    features: [
      'Real-time dashboards',
      'Custom reporting',
      'Predictive analytics',
      'Performance benchmarking'
    ]
  },
  {
    id: 3,
    title: 'Patient Engagement',
    subtitle: 'Enhance the patient experience',
    image: 'https://via.placeholder.com/400x300?text=Patient+Care',
    paragraph: 'Improve patient satisfaction and outcomes with our comprehensive engagement platform. From online scheduling to secure messaging, we provide the tools your patients need for a seamless healthcare experience.',
    features: [
      'Online appointment scheduling',
      'Secure patient portal',
      'Automated reminders',
      'Patient feedback collection'
    ]
  },
  {
    id: 4,
    title: 'Compliance Management',
    subtitle: 'Stay compliant with confidence',
    image: 'https://via.placeholder.com/400x300?text=Compliance',
    paragraph: 'Navigate the complex healthcare regulatory landscape with our comprehensive compliance management system. Automated monitoring, documentation, and reporting ensure your practice remains compliant with all applicable regulations.',
    features: [
      'Automated compliance monitoring',
      'Document management',
      'Regulatory updates',
      'Audit preparation tools'
    ]
  },
  {
    id: 5,
    title: 'Inventory Management',
    subtitle: 'Optimize your supply chain',
    image: 'https://via.placeholder.com/400x300?text=Inventory',
    paragraph: 'Streamline your inventory management with our intelligent tracking system. Reduce waste, control costs, and ensure you always have the right supplies when you need them through automated reordering and real-time inventory visibility.',
    features: [
      'Real-time inventory tracking',
      'Automated reordering',
      'Cost optimization',
      'Supplier management'
    ]
  },
  {
    id: 6,
    title: 'Staff Management',
    subtitle: 'Empower your team',
    image: 'https://via.placeholder.com/400x300?text=Staff',
    paragraph: 'Optimize your workforce with our comprehensive staff management platform. From scheduling to performance tracking, we provide the tools you need to manage your team efficiently and effectively.',
    features: [
      'Staff scheduling',
      'Time and attendance',
      'Performance tracking',
      'Training management'
    ]
  }
];

const DyadLanding: React.FC = () => {
  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeAboutCard, setActiveAboutCard] = useState<number | null>(null);
  const [expandedMobileCard, setExpandedMobileCard] = useState<number | null>(null);
  const [activeMenu, setActiveMenu] = useState('Home');
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isWhoWeServeDropdownOpen, setIsWhoWeServeDropdownOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isTrustSectionSticky, setIsTrustSectionSticky] = useState(false);
  const [isStickyDivActive, setIsStickyDivActive] = useState(false);
  const [selectedAboutCard, setSelectedAboutCard] = useState<AboutContentItem | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll from navigation
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
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handle sticky sections
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Trust section sticky detection
      const trustSection = document.querySelector('.trust-logos-section');
      if (trustSection) {
        const rect = trustSection.getBoundingClientRect();
        setIsTrustSectionSticky(rect.top <= 80);
      }
      
      // Sticky div activation
      setIsStickyDivActive(scrollY > 300);
    };

    const handleResize = () => {
      // Handle resize logic if needed
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsAboutDropdownOpen(false);
        setIsWhoWeServeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation handlers
  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleContactRequest = useCallback(() => {
    navigate('/contact');
  }, [navigate]);

  const handleLogoClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNavClick = useCallback((menuName: string, href: string) => {
    setActiveMenu(menuName);
    setIsAboutDropdownOpen(false);
    setIsWhoWeServeDropdownOpen(false);
    
    if (menuName === 'Who We Serve') {
      return;
    }
    
    const sectionId = href.replace('#', '');
    const element = document.getElementById(sectionId);
    if (element) {
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        const headerElement = document.querySelector('.dyad-header') as HTMLElement;
        const headerHeight = headerElement ? headerElement.offsetHeight : 60;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const targetPosition = elementPosition - headerHeight - 100;
        
        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: 'smooth'
        });
      } else {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
    
    // Close mobile menu if open
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobileMenuOpen]);

  // About card handlers
  const handleAboutCardClick = useCallback((cardId: number) => {
    const card = ABOUT_CONTENT.find(item => item.id === cardId);
    if (card) {
      setSelectedAboutCard(card);
      setActiveAboutCard(cardId);
    }
  }, []);

  const closeAboutPopup = useCallback(() => {
    setSelectedAboutCard(null);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const toggleDropdown = useCallback((dropdownType: 'about' | 'whoWeServe') => {
    if (dropdownType === 'about') {
      setIsAboutDropdownOpen(prev => !prev);
      setIsWhoWeServeDropdownOpen(false);
    } else {
      setIsWhoWeServeDropdownOpen(prev => !prev);
      setIsAboutDropdownOpen(false);
    }
  }, []);

  const handleMenuHover = useCallback((menuName: string | null) => {
    setHoveredMenu(menuName);
  }, []);

  // Memoized navigation items
  const navigationItems = useMemo(() => NAVIGATION_ITEMS, []);
  const aboutContent = useMemo(() => ABOUT_CONTENT, []);

  return (
    <div className="dyad-landing-container" id="top">
      {/* Header */}
      <header className="dyad-header">
        <div className="container">
          <div className="dyad-header-content">
            {/* Logo */}
            <div className="dyad-logo" onClick={handleLogoClick}>
              <img 
                src="/assets/images/dyadmain-ogo.svg" 
                alt="Dyad Logo" 
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="nav-list">
              {navigationItems.map((item) => (
                <li key={item.name} className="nav-item-container">
                  {item.hasDropdown ? (
                    <div className="dropdown-container">
                      <div 
                        className="nav-link"
                        onClick={() => toggleDropdown(item.name === 'About' ? 'about' : 'whoWeServe')}
                        onMouseEnter={() => handleMenuHover(item.name)}
                        onMouseLeave={() => handleMenuHover(null)}
                      >
                        {item.name}
                      </div>
                      <div className="dropdown-menu">
                        {item.dropdownItems?.map((dropdownItem, index) => (
                          <a
                            key={index}
                            href={dropdownItem.link}
                            className="dropdown-item"
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavClick(dropdownItem.title, dropdownItem.link);
                            }}
                          >
                            <div className="font-medium">{dropdownItem.title}</div>
                            <div className="text-sm text-gray-500">{dropdownItem.description}</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`nav-link ${activeMenu === item.name ? 'active' : ''}`}
                      onClick={() => handleNavClick(item.name, item.href)}
                    >
                      {item.name}
                    </div>
                  )}
                </li>
              ))}
            </nav>

            {/* Header Actions */}
            <div className="nav-actions">
              <button className="btn btn-outline" onClick={handleLogin}>
                Login
              </button>
              <button className="btn btn-primary" onClick={handleContactRequest}>
                Get Started
              </button>
              
              {/* Mobile Menu Toggle */}
              <button 
                className="mobile-menu-toggle"
                onClick={toggleMobileMenu}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu}>
        <div className="mobile-nav-menu" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-nav-header">
            <div className="dyad-logo" onClick={handleLogoClick}>
              <img 
                src="/assets/images/dyadmain-ogo.svg" 
                alt="Dyad Logo" 
              />
            </div>
            <button className="mobile-nav-close" onClick={toggleMobileMenu}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <ul className="mobile-nav-list">
            {navigationItems.map((item) => (
              <li key={item.name} className="mobile-nav-item">
                {item.hasDropdown ? (
                  <div className="mobile-dropdown-container">
                    <div 
                      className="mobile-nav-link"
                      onClick={() => toggleDropdown(item.name === 'About' ? 'about' : 'whoWeServe')}
                    >
                      {item.name}
                    </div>
                    <div className={`mobile-dropdown-menu ${(item.name === 'About' && isAboutDropdownOpen) || (item.name === 'Who We Serve' && isWhoWeServeDropdownOpen) ? 'active' : ''}`}>
                      {item.dropdownItems?.map((dropdownItem, index) => (
                        <a
                          key={index}
                          href={dropdownItem.link}
                          className="mobile-dropdown-item"
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(dropdownItem.title, dropdownItem.link);
                          }}
                        >
                          {dropdownItem.title}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`mobile-nav-link ${activeMenu === item.name ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.name, item.href)}
                  >
                    {item.name}
                  </div>
                )}
              </li>
            ))}
          </ul>
          
          <div className="mobile-nav-actions">
            <button className="btn btn-outline w-full" onClick={handleLogin}>
              Login
            </button>
            <button className="btn btn-primary w-full" onClick={handleContactRequest}>
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Transform Healthcare Finance Operations
          </h1>
          <p className="hero-subtitle">
            Dyad integrates all your financial operations on a single, bank-grade platform. 
            Built for anesthesia practices, ASCs, and surgical specialties.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={handleContactRequest}>
              Get Started Today
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => handleNavClick('About', '#about')}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Sticky Logo Section */}
      <div id="stickySection" className="sticky-section">
        <div className="logo-container">
          <div className="logo-track">
            <img src="https://via.placeholder.com/150x80?text=Logo1" className="logo" alt="Partner Logo 1" />
            <img src="https://via.placeholder.com/150x80?text=Logo2" className="logo" alt="Partner Logo 2" />
            <img src="https://via.placeholder.com/150x80?text=Logo3" className="logo" alt="Partner Logo 3" />
            <img src="https://via.placeholder.com/150x80?text=Logo4" className="logo" alt="Partner Logo 4" />
            <img src="https://via.placeholder.com/150x80?text=Logo5" className="logo" alt="Partner Logo 5" />
            
            {/* Duplicate for seamless scroll */}
            <img src="https://via.placeholder.com/150x80?text=Logo1" className="logo" alt="Partner Logo 1" />
            <img src="https://via.placeholder.com/150x80?text=Logo2" className="logo" alt="Partner Logo 2" />
            <img src="https://via.placeholder.com/150x80?text=Logo3" className="logo" alt="Partner Logo 3" />
            <img src="https://via.placeholder.com/150x80?text=Logo4" className="logo" alt="Partner Logo 4" />
            <img src="https://via.placeholder.com/150x80?text=Logo5" className="logo" alt="Partner Logo 5" />
          </div>
        </div>
      </div>

      {/* Trust Logos Section */}
      <div className={`stickytrustlogos ${isStickyDivActive ? 'active' : ''}`}>
        <section className="trust-logos-section">
          <footer className="marquee trust-container">
            <div className="marquee__track">
              <div className="marquee__content">
                <ul className="marquee__list">
                  <li className="marquee__item">
                    <div className="logo-item">
                      <img src="/assets/images/logo_section.svg" alt="Trust Logo" />
                    </div>
                  </li>
                  <li className="marquee__item">
                    <div className="logo-item">
                      <img src="/assets/images/logo_section1.svg" alt="Trust Logo 1" />
                    </div>
                  </li>
                  <li className="marquee__item">
                    <div className="logo-item">
                      <img src="/assets/images/logo_section2.svg" alt="Trust Logo 2" />
                    </div>
                  </li>
                  <li className="marquee__item">
                    <div className="logo-item">
                      <img src="/assets/images/logo_section3.svg" alt="Trust Logo 3" />
                    </div>
                  </li>
                  <li className="marquee__item">
                    <div className="logo-item">
                      <img src="/assets/images/logo_section4.svg" alt="Trust Logo 4" />
                    </div>
                  </li>
                </ul>
              </div>
              
              {/* Duplicate for seamless scroll */}
              <div className="marquee__content">
                <ul className="marquee__list">
                  <li className="marquee__item">
                    <div className="logo-item">
                      <img src="/assets/images/logo_section.svg" alt="Trust Logo" />
                    </div>
                  </li>
                  <li className="marquee__item">
                    <div className="logo-item">
                      <img src="/assets/images/logo_section1.svg" alt="Trust Logo 1" />
                    </div>
                  </li>
                  <li className="marquee__item">
                    <div className="logo-item">
                      <img src="/assets/images/logo_section2.svg" alt="Trust Logo 2" />
                    </div>
                  </li>
                  <li className="marquee__item">
                    <div className="logo-item">
                      <img src="/assets/images/logo_section3.svg" alt="Trust Logo 3" />
                    </div>
                  </li>
                  <li className="marquee__item">
                    <div className="logo-item">
                      <img src="/assets/images/logo_section4.svg" alt="Trust Logo 4" />
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </footer>
        </section>
      </div>

      {/* About Us Section */}
      <section className="about-us-section" id="about">
        <div className="about-container">
          <div className="about-header">
            <h2 className="about-title">About Us</h2>
            <p className="about-subtitle">
              Dyad is a fully integrated healthcare finance operations platform for anesthesia, 
              ambulatory surgery centers, and the surgical specialties that operate within them, 
              built on bank-grade infrastructure. We replace fragmented vendors with a single 
              operating layer powered by deep industry expertise, advanced technologies, and 
              institutional-grade risk controls, delivering end-to-end precision.
            </p>
          </div>
          
          <div className="about-grid">
            {aboutContent.map((item) => (
              <div
                key={item.id}
                className={`about-card ${activeAboutCard === item.id ? 'active' : ''}`}
                onClick={() => handleAboutCardClick(item.id)}
              >
                <div className="about-card-layout">
                  <div className="about-card-image-section">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="about-card-content-box">
                    <div className="about-card-content">
                      <h3 className="about-card-title">{item.title}</h3>
                      <p className="about-card-subtitle">{item.subtitle}</p>
                      <p className="about-card-description">{item.paragraph}</p>
                      <ul className="about-card-features">
                        {item.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
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

      {/* About Us Popup */}
      {selectedAboutCard && (
        <div className="about-popup-overlay" onClick={closeAboutPopup}>
          <div className="about-popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="about-popup-header">
              <div className="about-popup-left">
                <h2 className="about-popup-title">{selectedAboutCard.title}</h2>
                <p className="about-popup-subtitle">{selectedAboutCard.subtitle}</p>
              </div>
              <button className="about-popup-close" onClick={closeAboutPopup}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="about-popup-body">
              <div className="about-popup-description">
                <p>{selectedAboutCard.paragraph}</p>
                <ul className="about-card-features">
                  {selectedAboutCard.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Dyad Practice Solutions</h3>
              <p>Transforming healthcare finance operations with integrated, bank-grade solutions.</p>
            </div>
            
            <div className="footer-section">
              <h3>Solutions</h3>
              <ul className="footer-links">
                <li><a href="#solutions">Revenue Cycle</a></li>
                <li><a href="#solutions">Practice Analytics</a></li>
                <li><a href="#solutions">Patient Engagement</a></li>
                <li><a href="#solutions">Compliance</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Company</h3>
              <ul className="footer-links">
                <li><a href="#about">About Us</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#blog">Blog</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Legal</h3>
              <ul className="footer-links">
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#cookies">Cookie Policy</a></li>
                <li><a href="#compliance">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <p>&copy; 2026 DYAD Practice Solutions. All rights reserved.</p>
            </div>
            <div className="footer-bottom-right">
              <ul className="footer-legal-menu">
                <li><a href="#privacy">Privacy policy</a></li>
                <li><a href="#terms">Terms of service</a></li>
                <li><a href="#cookies">Cookie policy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DyadLanding;

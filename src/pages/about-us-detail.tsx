import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "./about-us-detail.css";

const AboutUsDetail: React.FC = () => {

     const navigate = useNavigate();
     const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Contact');
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isWhoWeServeDropdownOpen, setIsWhoWeServeDropdownOpen] = useState(false);

  // Scroll to hash on component mount and hash change
  useEffect(() => {
    const scrollToHash = () => {
      const hash = location.hash;
      if (hash) {
        // Remove the # and decode URI components
        const elementId = decodeURIComponent(hash.substring(1));
        const element = document.getElementById(elementId);
        
        if (element) {
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - 170; // 90px + 80px offset for header
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }, 100);
        }
      } else {
        // If no hash, scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Initial scroll
    scrollToHash();

    // Listen for hash changes
    const handleHashChange = () => {
      scrollToHash();
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [location.hash]);

     const contactNavigationItems = [
    { name: 'About Us', href: '#about', hasDropdown: true },
    { name: 'Leadership', href: '#leadership' },
    { name: 'What We Do', href: '#services' },
    { name: 'Who We Serve', href: '#who-we-serve', hasDropdown: true }
  ];

   const aboutDropdownItems1 = [
    { name: 'Our Story & Inspiration', href: '#our-story-&-inspiration' },
    { name: 'Our Mission & Vision', href: '#our-mission-&-vision' },
    { name: 'Our Values & Principles', href: '#our-values-&-principles' },
    { name: 'Our Approach & Methodology', href: '#our-approach-&-methodology' },
    { name: 'Our Innovative Technologies', href: '#our-innovative-technologies' },
    { name: 'Our Team & Expertise', href: '#our-team-&-expertise' }
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
    setIsAboutDropdownOpen(false);
    setIsMobileMenuOpen(false);
    
    // Extract the section ID from href (remove #)
    const sectionId = href.replace('#', '');
    const element = document.getElementById(sectionId);
    
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 170; // Header offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

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
                            {item.name === 'About Us' && aboutDropdownItems1.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleAboutDropdownItemClick(dropdownItem.href);
                                }}
                                href={dropdownItem.href}
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
                            {item.name === 'About Us' && aboutDropdownItems1.map((dropdownItem) => (
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
            <h2 className="about-title">About Us</h2>
            <p className="about-subtitle">
          Dyad is a fully integrated healthcare finance operations platform for anesthesia, ambulatory surgery centers, and the surgical specialties that operate within them, built on bank-grade infrastructure. We replace fragmented vendors with a single operating layer powered by deep industry expertise, advanced technologies, and institutional-grade risk controls, delivering end-to-end precision. One platform for independent practices, physician groups, private equity-backed portfolios, and managed services organizations. Truly integrated. Exponentially scalable.    </p>
          </div>
        
   <div className="leadership-grid">
            {aboutContent.map((leader, index) => (
              <div
                key={leader.id} id={leader.title.toLocaleLowerCase().replace(/\s+/g, '-')}
                className={`leadership-card about-us-card-detail ${index % 2 === 1 ? 'reversed' : ''}`}
              >
                <div className="leadership-image about-us-image">
                  <img src={leader.image} alt={leader.title} data-mobile-src={leader.image} />
                </div>
                <div className="leadership-content">
                  <h3 className="leader-name">{leader.title}</h3>
                  <p className="leader-title">{leader.subtitle}</p>
                  <p className="leader-description">{leader.paragraph}</p>
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
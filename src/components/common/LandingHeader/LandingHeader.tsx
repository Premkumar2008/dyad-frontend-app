import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LandingHeaderProps {
  activePage?: string;
  hideEarlyAccess?: boolean;
  onScrollToSection?: (scrollTo: string, cardId?: number) => void;
}

const whatWeDoDropdownItems = [
  { name: 'Practice Foundations', href: '#services', cardId: 0 },
  { name: 'Technology Driven Capabilities', href: '#services', cardId: 1 },
  { name: 'Pre & Post Encounter', href: '#services', cardId: 2 },
  { name: 'Claims Management', href: '#services', cardId: 3 },
  { name: 'Specialty Billing', href: '#services', cardId: 4 },
  { name: 'Real Time Insights', href: '#services', cardId: 5 },
];

const navigationItems = [
  { name: 'About Us', href: '#about', hasDropdown: true },
  { name: 'What We Do', href: '#services', hasDropdown: true },
  { name: 'Who We Serve', href: '#who-we-serve', hasDropdown: true },
];

const aboutDropdownItems = [
  { name: 'Our Story & Inspiration', href: '#about', cardId: 0 },
  { name: 'Mission & Vision', href: '#about', cardId: 1 },
  { name: 'Values & Principles', href: '#about', cardId: 2 },
  { name: 'Approach & Methodology', href: '#about', cardId: 3 },
  { name: 'Innovative Technologies', href: '#about', cardId: 4 },
  { name: 'Team & Expertise', href: '/team-expertise', cardId: 5 },
];

const whoWeServeDropdownItems = [
  { name: 'Surgical & Procedural Specialties' },
  { name: 'Interventional & Diagnostic Care' },
  { name: 'Perioperative & Supportive Services' },
  { name: 'Outpatient & Specialty Facilities' },
];

const LandingHeader: React.FC<LandingHeaderProps> = ({
  activePage = 'Home',
  hideEarlyAccess = false,
  onScrollToSection,
}) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(activePage);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isWhoWeServeDropdownOpen, setIsWhoWeServeDropdownOpen] = useState(false);
  const [isWhatWeDoDropdownOpen, setIsWhatWeDoDropdownOpen] = useState(false);

  const scrollOrNavigate = (href: string, cardId?: number) => {
    setIsMobileMenuOpen(false);
    setIsAboutDropdownOpen(false);
    setIsWhoWeServeDropdownOpen(false);
    setIsWhatWeDoDropdownOpen(false);

    if (href.startsWith('/') && !href.startsWith('/#')) {
      navigate(href);
      return;
    }

    if (window.location.pathname === '/' && onScrollToSection) {
      onScrollToSection(href, cardId);
      return;
    }

    navigate('/', { state: { scrollTo: href, cardId } });
  };

  const handleNavClick = (item: { name: string; href: string }) => {
    setActiveMenu(item.name);
    scrollOrNavigate(item.href);
  };

  const handleLogoClick = () => navigate('/');
  const handleLogin = () => navigate('/login');
  const handleEarlyAccess = () => navigate('/early-access')
  const handleContactRequest = () => navigate('/contact');

  const handleAboutDropdownItemClick = (dropdownItem: { name: string; href: string; cardId: number }) => {
    setActiveMenu('About Us');
    if (dropdownItem.name === 'Team & Expertise') {
      setIsAboutDropdownOpen(false);
      setIsMobileMenuOpen(false);
      navigate('/team-expertise');
      return;
    }
    scrollOrNavigate(dropdownItem.href, dropdownItem.cardId);
  };

  const handleWhatWeDoDropdownItemClick = (dropdownItem: { href: string; cardId: number }) => {
    setActiveMenu('What We Do');
    scrollOrNavigate(dropdownItem.href, dropdownItem.cardId);
  };

  const dropdownItemStyle: React.CSSProperties = {
    display: 'block',
    padding: '0.75rem 1rem',
    color: '#374151',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontFamily: 'Prompt, sans-serif',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };

  const mobileDropdownItemStyle: React.CSSProperties = {
    display: 'block',
    padding: '0.75rem 1rem 0.75rem 2rem',
    color: '#374151',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontFamily: 'Prompt, sans-serif',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };

  return (
    <header className="dyad-header">
      <div className="dyad-header-content">
        <div className="dyad-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img src="/assets/images/logo_main.png" alt="Dyad Logo" className="logo-image" />
        </div>

        <div className="dyad-nav-actions">
          <nav className="dyad-nav">
            <ul className="nav-list" style={{ gap: '0rem' }}>
              {navigationItems.map((item) => {
                const isActive = activeMenu === item.name;
                return (
                  <li
                    key={item.name}
                    className="nav-item-container"
                    onMouseEnter={() => {
                      setHoveredMenu(item.name);
                      if (item.name === 'About Us') setIsAboutDropdownOpen(true);
                      else if (item.name === 'Who We Serve') setIsWhoWeServeDropdownOpen(true);
                      else if (item.name === 'What We Do') setIsWhatWeDoDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      setHoveredMenu(null);
                      if (item.name === 'About Us') setIsAboutDropdownOpen(false);
                      else if (item.name === 'Who We Serve') setIsWhoWeServeDropdownOpen(false);
                      else if (item.name === 'What We Do') setIsWhatWeDoDropdownOpen(false);
                    }}
                  >
                    {item.hasDropdown ? (
                      <div className="dropdown-container">
                        <a
                          style={{
                            color: hoveredMenu === item.name ? '#173e7a' : '#374151',
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
                            gap: '0.5rem',
                          }}
                        >
                          {item.name}
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </a>
                        <div
                          className={`dropdown-menu ${
                            (item.name === 'About Us' && isAboutDropdownOpen) ||
                            (item.name === 'Who We Serve' && isWhoWeServeDropdownOpen) ||
                            (item.name === 'What We Do' && isWhatWeDoDropdownOpen)
                              ? 'open'
                              : ''
                          }`}
                        >
                          {item.name === 'About Us' &&
                            aboutDropdownItems.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => { e.preventDefault(); handleAboutDropdownItemClick(dropdownItem); }}
                                className="dropdown-item"
                                style={dropdownItemStyle}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                          {item.name === 'Who We Serve' &&
                            whoWeServeDropdownItems.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => e.preventDefault()}
                                className="dropdown-item"
                                style={dropdownItemStyle}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                          {item.name === 'What We Do' &&
                            whatWeDoDropdownItems.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => { e.preventDefault(); handleWhatWeDoDropdownItemClick(dropdownItem); }}
                                className="dropdown-item"
                                style={dropdownItemStyle}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <a
                        href={item.href}
                        onClick={(e) => { e.preventDefault(); handleNavClick(item); }}
                        style={{
                          color: isActive ? '#173e7a' : '#374151',
                          cursor: 'pointer',
                          textDecoration: 'none',
                          fontWeight: 400,
                          fontSize: '1.1rem',
                          fontFamily: 'Prompt, sans-serif',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          transition: 'all 0.3s ease',
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

          {!hideEarlyAccess && (
            <div className="dyad-actions" style={{ flexDirection: 'column', gap: '0.35rem' }}>
              <div className="platform-access-shine" style={{ fontSize: '0.8rem', color: '#003f7f', fontWeight: 600, fontFamily: 'Prompt, sans-serif', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Platform Access Begins Q3 2026
              </div>
              <button className="btn btn-primary" onClick={handleEarlyAccess} style={{width : '260px'}}>
                <span>Request Early Access</span>
              </button>
            </div>
          )}
        </div>

        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

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
                          if (item.name === 'About Us') setIsAboutDropdownOpen(!isAboutDropdownOpen);
                          else if (item.name === 'Who We Serve') setIsWhoWeServeDropdownOpen(!isWhoWeServeDropdownOpen);
                          else if (item.name === 'What We Do') setIsWhatWeDoDropdownOpen(!isWhatWeDoDropdownOpen);
                        }}
                        className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                        style={{
                          color: isActive ? '#173e7a' : '#374151',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        {item.name}
                        <svg
                          className={`mobile-dropdown-arrow ${
                            (item.name === 'About Us' && isAboutDropdownOpen) ||
                            (item.name === 'Who We Serve' && isWhoWeServeDropdownOpen) ||
                            (item.name === 'What We Do' && isWhatWeDoDropdownOpen)
                              ? 'open'
                              : ''
                          }`}
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                      <div
                        className={`mobile-dropdown-menu ${
                          (item.name === 'About Us' && isAboutDropdownOpen) ||
                          (item.name === 'Who We Serve' && isWhoWeServeDropdownOpen) ||
                          (item.name === 'What We Do' && isWhatWeDoDropdownOpen)
                            ? 'open'
                            : ''
                        }`}
                      >
                        {item.name === 'About Us' &&
                          aboutDropdownItems.map((dropdownItem) => (
                            <a
                              key={dropdownItem.name}
                              onClick={(e) => { e.preventDefault(); handleAboutDropdownItemClick(dropdownItem); }}
                              className="mobile-dropdown-item"
                              style={mobileDropdownItemStyle}
                            >
                              {dropdownItem.name}
                            </a>
                          ))}
                        {item.name === 'Who We Serve' &&
                          whoWeServeDropdownItems.map((dropdownItem) => (
                            <a
                              key={dropdownItem.name}
                              onClick={(e) => e.preventDefault()}
                              className="mobile-dropdown-item"
                              style={mobileDropdownItemStyle}
                            >
                              {dropdownItem.name}
                            </a>
                          ))}
                        {item.name === 'What We Do' &&
                          whatWeDoDropdownItems.map((dropdownItem) => (
                            <a
                              key={dropdownItem.name}
                              onClick={(e) => { e.preventDefault(); handleWhatWeDoDropdownItemClick(dropdownItem); }}
                              className="mobile-dropdown-item"
                              style={mobileDropdownItemStyle}
                            >
                              {dropdownItem.name}
                            </a>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <a
                      onClick={(e) => { e.preventDefault(); handleNavClick(item); setIsMobileMenuOpen(false); }}
                      className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                      style={{ color: isActive ? '#173e7a' : '#374151', cursor: 'pointer' }}
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
            {!hideEarlyAccess && (
              <>
                <div className="platform-access-shine" style={{ fontSize: '0.8rem', color: '#003f7f', fontWeight: 600, fontFamily: 'Prompt, sans-serif', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Platform Access Begins Q3 2026
                </div>
                <button className="btn btn-primary" onClick={handleEarlyAccess}>
                  <span>Request Early Access</span>
                </button>
              </>
            )}
          {/* <button className="btn btn-primary btn-full" onClick={handleContactRequest}>
            <span>Contact Us</span>
          </button>
          <button className="btn btn-primary btn-full" onClick={handleLogin}>
            <span>Login/Register</span>
          </button> */}
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;

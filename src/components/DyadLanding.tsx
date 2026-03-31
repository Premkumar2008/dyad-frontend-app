import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import './DyadLanding.css';

const DyadLanding: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeAboutCard, setActiveAboutCard] = useState<number | null>(null);
  const [expandedMobileCard, setExpandedMobileCard] = useState<number | null>(null);
  const [expandedserviceMobileCard, setExpandedserviceMobileCard] = useState<number | null>(null);
  const [activeMenu, setActiveMenu] = useState('Home');
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isWhoWeServeDropdownOpen, setIsWhoWeServeDropdownOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isTrustSectionSticky, setIsTrustSectionSticky] = useState(false);
  const [isStickyDivActive, setIsStickyDivActive] = useState(false);
  const [selectedAboutCard, setSelectedAboutCard] = useState<typeof aboutContent[0] | null>(null);
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
    
    // Mobile-only scroll solution
    const sectionId = href.replace('#', '');
    const element = document.getElementById(sectionId);
    if (element) {
      console.log('=== MOBILE ONLY SCROLL ===');
      console.log('Section:', sectionId);
      console.log('Window width:', window.innerWidth);
      console.log('Element found:', !!element);
      
      // Check if we're on mobile
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        console.log('Mobile detected - using mobile scroll');
        
        // Mobile approach: direct position calculation
        const headerElement = document.querySelector('.dyad-header') as HTMLElement;
        const headerHeight = headerElement ? headerElement.offsetHeight : 60;
        
        // Get element position
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        
        // Calculate target position with header clearance
        const targetPosition = elementPosition - headerHeight - 100;
        
        console.log('Header height:', headerHeight);
        console.log('Element position:', elementPosition);
        console.log('Target position:', targetPosition);
        
        // Direct scroll to calculated position
        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: 'smooth'
        });
        
      } else {
        console.log('Desktop detected - using scrollIntoView');
        // Desktop: use scrollIntoView (which works)
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      console.log('Element not found:', sectionId);
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
    
    // Navigate to the specific about-us-details page with hash
    navigate(href);
  };

  const handleWhoWeServeDropdownItemClick = (href: string) => {
    setIsWhoWeServeDropdownOpen(false);
    setHoveredMenu(null);
    // Navigate to the specific service-detail page with hash
    navigate(href);
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

  const SPEED_PX_PER_SEC = 40;
 
// ─── Replace each `url` with your actual image paths or remote URLs ───────────
// alt text and ratio are used for accessibility and correct sizing.
const IMAGES = [
  {
    id: "img1",
    url: "/assets/images/logo_section.svg",
    alt: "Image 1",
    ratio: { w: 211, h: 59 },   // aspect ratio — controls slot proportions
  },
  {
    id: "img2",
    url: "/assets/images/logo_section1.svg",
    alt: "Image 2",
    ratio: { w: 1, h: 1 },
  },
  {
    id: "img3",
    url: "/assets/images/logo_section2.svg",
    alt: "Image 3",
    ratio: { w: 1, h: 1 },
  },
  {
    id: "img4",
    url: "/assets/images/logo_section3.svg",
    alt: "Image 4",
    ratio: { w: 25, h: 23 },
  },
  {
    id: "img5",
    url: "/assets/images/logo_section4.svg",
    alt: "Image 5",
    ratio: { w: 198, h: 115 },
  },
];
 
// Responsive size config per breakpoint
function getSizes(vw) {
  if (vw <= 480) {
    return {
      default:{ img1: [185, 75], img2: [75, 75], img3: [75, 75], img4: [78, 75], img5: [98, 75] },
      shrunk:  { img1: [115, 45],  img2: [45, 45], img3: [45, 45], img4: [48, 45], img5: [68, 45] },
      gap: 30,
      shrunkGap: 25,
      barPad: "8px 0",
      shrunkBarPad: "4px 0",
    };
  }
  if (vw <= 768) {
    return {
      default: { img1: [270, 80], img2: [95, 95], img3: [95, 95], img4: [106, 95], img5: [155, 95] },
    shrunk:  { img1: [135, 45], img2: [45, 45], img3: [45, 45], img4: [48, 45], img5: [68, 45] },
    gap: 70,
    shrunkGap: 40,
      barPad: "10px 0",
      shrunkBarPad: "5px 0",
    };
  }
  return {
    default: { img1: [270, 80], img2: [95, 95], img3: [95, 95], img4: [106, 95], img5: [155, 95] },
    shrunk:  { img1: [135, 45], img2: [45, 45], img3: [45, 45], img4: [48, 45], img5: [68, 45] },
    gap: 70,
    shrunkGap: 40,
    barPad: "10px 0",
    shrunkBarPad: "5px 0",
  };
}
 
// Single image wrapper
function ImgWrap({ imgId, shrunk, sizes }) {
  const key = imgId;
  const [w, h] = shrunk ? sizes.shrunk[key] : sizes.default[key];
  const margin = `0 ${shrunk ? sizes.shrunkGap : sizes.gap}px`;
  const img = IMAGES.find((i) => i.id === imgId);

  return (
    <div
      style={{
        flexShrink: 0,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
       
        borderRadius: 6,
        width: w,
        height: h,
        margin,
        transition: "width 0.38s cubic-bezier(0.4,0,0.2,1), height 0.38s cubic-bezier(0.4,0,0.2,1), margin 0.38s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <img
        src={img.url}
        alt={img.alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          filter: "grayscale(1)",
          transition: "filter 0.3s ease-in-out",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = "grayscale(0)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "grayscale(1)";
        }}
        draggable={false}
      />
    </div>
  );
}
 
// One full set of 5 images
function ImageSet({ shrunk, sizes }) {
  return (
    <>
      {IMAGES.map((img) => (
        <ImgWrap key={img.id} imgId={img.id} shrunk={shrunk} sizes={sizes} />
      ))}
    </>
  );
}
 
// Marquee component
function Marquee({ shrunk, sizes }) {
  const trackRef = useRef(null);
  const styleRef = useRef(null);
  const [sets, setSets] = useState(2);
  const builtRef = useRef(false);
 
  const build = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
 
    builtRef.current = false;
    track.style.animation = "none";
 
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!trackRef.current) return;
        const setW = trackRef.current.scrollWidth;
        if (setW === 0) return;
 
        const vw = window.innerWidth || 375;
        const setsNeeded = Math.max(2, Math.ceil((vw * 2.5) / setW) + 1);
        const total = setsNeeded * 2;
        setSets(total);
 
        requestAnimationFrame(() => {
          if (!trackRef.current) return;
          const halfW = setW * setsNeeded;
          const duration = halfW / SPEED_PX_PER_SEC;
 
          if (styleRef.current) styleRef.current.remove();
          const s = document.createElement("style");
          s.textContent = `@keyframes marquee-tkr{0%{transform:translateX(0)}100%{transform:translateX(-${halfW}px)}}`;
          document.head.appendChild(s);
          styleRef.current = s;
 
          trackRef.current.style.animation = `marquee-tkr ${duration}s linear infinite`;
          builtRef.current = true;
        });
      });
    });
  }, []);
 
  useEffect(() => {
    build();
    let tm;
    const onResize = () => { clearTimeout(tm); tm = setTimeout(build, 250); };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(tm);
      if (styleRef.current) styleRef.current.remove();
    };
  }, [build]);
 
  return (
    <div className="trust-logo-first-level"  style={{ display: "flex", width: "100%", overflow: "hidden" }}>
      <div className="trust-logo-second-level"
        ref={trackRef}
        style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        onMouseEnter={(e) => { if (e.currentTarget) e.currentTarget.style.animationPlayState = "paused"; }}
        onMouseLeave={(e) => { if (e.currentTarget) e.currentTarget.style.animationPlayState = "running"; }}
      >
        {Array.from({ length: sets }).map((_, i) => (
          <ImageSet key={i} shrunk={shrunk} sizes={sizes} />
        ))}
      </div>
    </div>
  );
}
 
// Main sticky bar
function StickyMarqueeBar() {
  const barRef = useRef(null);
  const [shrunk, setShrunk] = useState(false);
  const [vw, setVw] = useState(window.innerWidth || 800);
 
  useEffect(() => {
    const onScroll = () => {
      if (!barRef.current) return;
      setShrunk(Math.round(barRef.current.getBoundingClientRect().top) <= 80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
 
  useEffect(() => {
    let tm;
    const onResize = () => { clearTimeout(tm); tm = setTimeout(() => setVw(window.innerWidth), 250); };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(tm); };
  }, []);
 
  const sizes = getSizes(vw);
 
  return (
    <div 
      ref={barRef}
      className="sticky-bar-trust-logo"
      style={{
        position: "sticky",
      
        zIndex: 100,
        background: "#ffffff",
        borderTop: "0.5px solid rgba(0,0,0,0.1)",
        borderBottom: "0.5px solid rgba(0,0,0,0.1)",
        overflow: "hidden",
        padding: shrunk ? sizes.shrunkBarPad : sizes.barPad,
        transition: "padding 0.38s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
     
 
      <Marquee shrunk={shrunk} sizes={sizes} />
    </div>
  );
}
  
  const handleAboutCardClick = (cardId: number) => {
    const card = aboutContent.find(item => item.id === cardId);
    if (card) {
      setSelectedAboutCard(card);
    }
  };

  const closeAboutPopup = () => {
    setSelectedAboutCard(null);
  };

  const toggleMobileCard = (cardId: number) => {
    setExpandedMobileCard(expandedMobileCard === cardId ? null : cardId);
  };

  const toggleMobileCardService = (cardId: number) => {
    setExpandedserviceMobileCard(expandedserviceMobileCard === cardId ? null : cardId);
  };
  
  const leadershipData = [
    {
      id: 1,
      name: 'S. Jaikumar',
      title: 'Founder',
      description: 'Brings over 26 years of institutional treasury, capital markets, and financial risk management experience to her role. She has held senior leadership positions at Capital Group, Latham & Watkins, Western Digital Corporation, Levi Strauss & Co., BNP Paribas, and ProLogis. Across these roles, she has directed oversight of $2.5 trillion in global securities valuations, structured over $35 billion in syndicated financings, managed over $40 billion in global derivatives portfolios, and has overseen treasury operations across 110 countries. She holds a Master of Science in Financial Analysis and Investment Management and a Master of Business Administration in Finance. She is an FAA-certified private pilot.',
      image: '/assets/images/leadershipnew1.jpeg',
      mobileImage: '/assets/images/leadershipmb1.jpeg'
    },
    {
      id: 2,
      name: 'A. Subramaniam ',
      title: 'Chief Technology and AI Solutions Officer',
      description: 'Brings over 27 years architecting enterprise data, AI, and automation platforms across healthcare and financial services at major health care insurers and global banks.  At Bank of America, he served as Vice President and India Head of Data Practice, supporting 14 million wealth management clients across a multi million dollar platform. He subsequently built and scaled an AI and data analytics practice from 5 to 130 professionals, delivering over 50 production AI and GenAI accelerators across banking, lending, and healthcare. He holds a Post Graduate Diploma in Business Analytics and Business Intelligence and is an adjunct professor at Johns Hopkins University for AI graduate studies.',
      image: '/assets/images/leadershipnew2.jpeg',
      mobileImage: '/assets/images/leadershipmb2.jpeg'
    },
    {
      id: 3,
      name: 'S. Rajan',
      title: 'Chief Operating Officer',
      description: 'Brings over 27 years of healthcare finance operations leadership to his role. He previously served as Senior Vice President of Global Revenue Cycle Operations at a Veritas Capital portfolio company, where he held P&L responsibility for $190 million in revenue and led an organization of over 15,000 individuals globally. Prior to that, he served as President of Global Revenue Cycle Operations at a Carlyle Group company, scaling revenue from $108 million to $160 million and expanding EBITDA by six percent. He holds a Post Graduate Diploma in Business Administration in Finance, a Master of Business Administration, and a Six Sigma Black Belt from KPMG. He is a licensed private pilot.',
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
    { name: 'Our Story & Inspiration', href: '/about-us-details#our-story-&-inspiration' },
    { name: 'Our Mission & Vision', href: '/about-us-details#our-mission-&-vision' },
    { name: 'Our Values & Principles', href: '/about-us-details#our-values-&-principles' },
    { name: 'Our Approach & Methodology', href: '/about-us-details#our-approach-&-methodology' },
    { name: 'Our Innovative Technologies', href: '/about-us-details#our-innovative-technologies' },
    { name: 'Our Team & Expertise', href: '/about-us-details#our-team-&-expertise' }
  ];

  const whoWeServeDropdownItems = [
    { name: 'Surgical & Procedural Specialties', href: '/' },
    { name: 'Interventional & Diagnostic Care', href: '/' },
    { name: 'Perioperative & Supportive Services', href: '/' },
    { name: 'Outpatient & Specialty Facilities', href: '/' }
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
              <button className="btn btn-primary" onClick={handleLogin}>
                <span>Login / Register</span>
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


       <StickyMarqueeBar />




 
      {/* About Us Section */}
      <section className="about-us-section" id="about">
        <div className="about-container">
          <div className="about-header">
            <h2 className="about-title">About Us</h2>
            <p className="about-subtitle">
          Dyad is a fully integrated healthcare finance operations platform for anesthesia, ambulatory surgery centers, and the surgical specialties that operate within them, built on bank-grade infrastructure. We replace fragmented vendors with a single operating layer powered by deep industry expertise, advanced technologies, and institutional-grade risk controls, delivering end-to-end precision. One platform for independent practices, physician groups, private equity-backed portfolios, and managed services organizations. Truly integrated. Exponentially scalable.    </p>
          </div>
        

            <div className="about-grid desktop-about-us">
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
                      <div className="about-card-text-content">
                        <div className="about-card-header">
                          <div className="about-card-title-subtitle">
                            <h3 className="about-card-title">{item.title}</h3>
                            <p className="about-card-subtitle">{item.subtitle}</p>
                          </div>
                          <div className="about-card-arrow">
                            <div className="arrow-circle">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="about-card-paragraph">{item.paragraph}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

         {/* Mobile Cards Section - Mobile Only */}
      <section className="mobile-cards-section">
        <div className="container">
          <div className="mobile-cards-container">
            {aboutContent.map((card) => (
              <div key={card.id} className={`mobile-card ${expandedMobileCard === card.id ? 'expanded' : ''}`} onClick={() => toggleMobileCard(card.id)}>
                <div className="mobile-card-image">
                  <img src={card.image} alt={card.title} />
                </div>
                <div className="mobile-card-content">
                  <div className="mobile-card-header">
                    <div className="mobile-card-title-subtitle">
                      <h3 className="mobile-card-title">{card.title}</h3>
                      <p className="mobile-card-subtitle">{card.subtitle}</p>
                    </div>
                    <div className="mobile-card-arrow">
                      <div className="mobile-arrow-circle" onClick={(e) => {
                        e.stopPropagation();
                        toggleMobileCard(card.id);
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18L15 12L9 6" stroke="rgb(29 109 216)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className={`mobile-card-description ${expandedMobileCard === card.id ? 'expanded' : ''}`}>
                    <p>{card.paragraph}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </section>

    

     

      {/* Leadership Section */}
      <section className="leadership-section" id="leadership">
        <div className="leadership-container">
          <div className="leadership-header">
            <h2 className="leadership-title">Leadership</h2>
            <p className="leadership-subtitle">
            Dyad was built on the simple conviction that the same financial discipline that governs global financial platforms should apply to healthcare revenue.
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
      <section className="services-section " id="services">
        <div className="services-container">
          <div className="services-header">
            <h2 className="services-title">Our Services</h2>
            <p className="services-subtitle">
              We set the standard for accuracy, efficiency, and value - delivering faster turnarounds, unmatched precision, and measurable impact. Backed by rigorous risk controls and uncompromising quality, our integrated solutions go beyond excellence to redefine what's possible. No fragmentation - just a unified approach. Most services operate within our full-service model, where seamless integration drives real value.
            </p>
          </div>
          <div className="services-grid  desktop-about-us">
            {servicesData.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-card-image">
                  <img src={service.image} alt={service.title} />
                </div>
                <div className="service-card-content">
                  <div className="service-card-header">
                    <div className="service-card-title-subtitle">
                      <h3 className="service-card-title">{service.title}</h3>
                      <p className="service-card-subtitle">{service.subtitle}</p>
                    </div>
                    <div className="service-card-arrow">
                      <div className="arrow-circle">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
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
               <section className="mobile-cards-section">
        <div className="container">
          <div className="mobile-cards-container services">
            {servicesData.map((card) => (
              <div key={card.id} className={`mobile-card ${expandedserviceMobileCard === card.id ? 'expanded' : ''}`} onClick={() => toggleMobileCardService(card.id)}>
                <div className="mobile-card-image">
                  <img src={card.image} alt={card.title} />
                </div>
                <div className="mobile-card-content">
                  <div className="mobile-card-header">
                    <div className="mobile-card-title-subtitle">
                      <h3 className="mobile-card-title">{card.title}</h3>
                      <p className="mobile-card-subtitle">{card.subtitle}</p>
                    </div>
                    <div className="mobile-card-arrow">
                      <div className="mobile-arrow-circle" onClick={(e) => {
                        e.stopPropagation();
                        toggleMobileCardService(card.id);
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18L15 12L9 6" stroke="rgb(29 109 216)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className={`mobile-card-description ${expandedserviceMobileCard === card.id ? 'expanded' : ''}`}>
                   <div className="description-features">
                      <ul>
                        {card.features.map((feature, index) => (
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
              </div>
            </div>
          </div>
        </div>
      )}
     </div>
  );
};

export default DyadLanding;

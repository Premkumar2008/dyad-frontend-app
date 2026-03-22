import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, User, LogOut, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import Logo from '../assets/images/dyadmain-ogo.svg';

const Landing: React.FC = () => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedCard, setSelectedCard] = useState<{title: string, subtitle: string, description: string} | null>(null);
  const navigate = useNavigate();

  // Add custom scrollbar styles using useEffect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout({
        showNotification: true,
        reason: 'user_initiated',
        redirectPath: '/login'
      });
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  const handleDashboardRedirect = () => {
    const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
    navigate(redirectPath);
  };

  // Handle smooth scroll and update active section
  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 64; // Height of the sticky navigation
      const elementPosition = element.offsetTop - navHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  // Update active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'leadership', 'services', 'contact'];
      const scrollPosition = window.scrollY + 100;

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
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('nav') && !target.closest('[data-mobile-menu]')) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl lg:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section - Logo */}
            <div className="flex items-center">
             <img src={Logo} alt="Dyad Logo" className="h-12 w-auto" />
            </div>
            
            {/* Center Section - Navigation Menu */}
            {user ? (
              <div className="hidden md:flex items-center space-x-4 flex-1 justify-center">
                <a 
                  href="#home" 
                  className={`text-sm sm:text-base font-medium transition-colors px-3 py-2 rounded-lg ${
                    activeSection === 'home' 
                      ? 'text-[#1D6DD8]' 
                      : 'text-[#222222] hover:text-[#1D6DD8] hover:bg-blue-50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToSection('home');
                  }}
                >
                  Home
                </a>
                <a 
                  href="#about" 
                  className={`text-sm sm:text-base font-medium transition-colors px-3 py-2 rounded-lg ${
                    activeSection === 'about' 
                      ? 'text-[#1D6DD8]' 
                      : 'text-[#222222] hover:text-[#1D6DD8] hover:bg-blue-50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToSection('about');
                  }}
                >
                  About us
                </a>
                <a 
                  href="#leadership" 
                  className={`text-sm sm:text-base font-medium transition-colors px-3 py-2 rounded-lg ${
                    activeSection === 'leadership' 
                      ? 'text-[#1D6DD8]' 
                      : 'text-[#222222] hover:text-[#1D6DD8] hover:bg-blue-50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToSection('leadership');
                  }}
                >
                  Leadership
                </a>
                <a 
                  href="#services" 
                  className={`text-sm sm:text-base font-medium transition-colors px-3 py-2 rounded-lg ${
                    activeSection === 'services' 
                      ? 'text-[#1D6DD8]' 
                      : 'text-[#222222] hover:text-[#1D6DD8] hover:bg-blue-50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToSection('services');
                  }}
                >
                  Our Services
                </a>
                <a 
                  href="#contact" 
                  className={`text-sm sm:text-base font-medium transition-colors px-3 py-2 rounded-lg ${
                    activeSection === 'contact' 
                      ? 'text-[#1D6DD8]' 
                      : 'text-[#222222] hover:text-[#1D6DD8] hover:bg-blue-50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToSection('contact');
                  }}
                >
                  Contact us
                </a>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4 flex-1 justify-center">
                <a 
                  href="#home" 
                  className={`text-sm sm:text-base font-medium transition-colors px-3 py-2 rounded-lg ${
                    activeSection === 'home' 
                      ? 'text-[#1D6DD8]' 
                      : 'text-[#222222] hover:text-[#1D6DD8] hover:bg-blue-50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToSection('home');
                  }}
                >
                  Home
                </a>
                <a 
                  href="#about" 
                  className={`text-sm sm:text-base font-medium transition-colors px-3 py-2 rounded-lg ${
                    activeSection === 'about' 
                      ? 'text-[#1D6DD8]' 
                      : 'text-[#222222] hover:text-[#1D6DD8] hover:bg-blue-50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToSection('about');
                  }}
                >
                  About us
                </a>
                <a 
                  href="#leadership" 
                  className={`text-sm sm:text-base font-medium transition-colors px-3 py-2 rounded-lg ${
                    activeSection === 'leadership' 
                      ? 'text-[#1D6DD8]' 
                      : 'text-[#222222] hover:text-[#1D6DD8] hover:bg-blue-50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToSection('leadership');
                  }}
                >
                  Leadership
                </a>
                <a 
                  href="#services" 
                  className={`text-sm sm:text-base font-medium transition-colors px-3 py-2 rounded-lg ${
                    activeSection === 'services' 
                      ? 'text-[#1D6DD8]' 
                      : 'text-[#222222] hover:text-[#1D6DD8] hover:bg-blue-50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToSection('services');
                  }}
                >
                  Our Services
                </a>
                <a 
                  href="#contact" 
                  className={`text-sm sm:text-base font-medium transition-colors px-3 py-2 rounded-lg ${
                    activeSection === 'contact' 
                      ? 'text-[#1D6DD8]' 
                      : 'text-[#222222] hover:text-[#1D6DD8] hover:bg-blue-50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToSection('contact');
                  }}
                >
                  Contact us
                </a>
              </div>
            )}
            
            {/* Right Section - Sign In Button / User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleDashboardRedirect}
                  className="hidden md:inline-block text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Dashboard
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors p-2 rounded-lg hover:bg-gray-100"
                  >
                    <User className="w-5 h-5" />
                    <span className="ml-2 hidden sm:inline">{user.name}</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  
                  {/* User dropdown menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={handleDashboardRedirect}
                        className="md:hidden w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </button>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-6 h-6 flex flex-col justify-center">
                    <span className={`block h-0.5 w-6 bg-gray-600 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                    <span className={`block h-0.5 w-6 bg-gray-600 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                    <span className={`block h-0.5 w-6 bg-gray-600 transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                  </div>
                </button>
                
                {/* Desktop Sign In/Sign Up buttons */}
                <div className="hidden md:flex items-center space-x-4">
                 
                  <button 
                    disabled
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg font-medium opacity-50 cursor-not-allowed transition-colors"
                  >
                   Login / Sign Up
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile Navigation Menu */}
          {!user && isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-[60]">
              <div className="px-4 py-4 space-y-3">
            <a 
              href="#home" 
              className={`block font-medium py-2 px-4 rounded-lg transition-colors ${
                activeSection === 'home' 
                  ? 'text-[#1D6DD8]' 
                  : 'text-[#222222] hover:text-[#1D6DD8] hover:bg-blue-50'
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection('home');
                setIsMobileMenuOpen(false);
              }}
            >
              Home
            </a>
            <a 
              href="#about" 
              className={`block font-medium py-2 px-4 rounded-lg transition-colors ${
                activeSection === 'about' 
                  ? 'text-[#1D6DD8]' 
                  : 'text-[#222222] hover:text-[#1D6DD8] hover:bg-blue-50'
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection('about');
                setIsMobileMenuOpen(false);
              }}
            >
              About us
            </a>
            <a 
              href="#leadership" 
              className={`block font-medium py-2 px-4 rounded-lg transition-colors ${
                activeSection === 'leadership' 
                  ? 'text-[#1D6DD8]' 
                  : 'text-[#222222] hover:text-[#1D6DD8] hover:bg-blue-50'
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection('leadership');
                setIsMobileMenuOpen(false);
              }}
            >
              Leadership
            </a>
            <a 
              href="#services" 
              className={`block font-medium py-2 px-4 rounded-lg transition-colors ${
                activeSection === 'services' 
                  ? 'text-[#1D6DD8]' 
                  : 'text-[#222222] hover:text-[#1D6DD8] hover:bg-blue-50'
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection('services');
                setIsMobileMenuOpen(false);
              }}
            >
              Our Services
            </a>
            <a 
              href="#contact" 
              className={`block font-medium py-2 px-4 rounded-lg transition-colors ${
                activeSection === 'contact' 
                  ? 'text-[#1D6DD8]' 
                  : 'text-[#222222] hover:text-[#1D6DD8] hover:bg-blue-50'
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection('contact');
                setIsMobileMenuOpen(false);
              }}
            >
              Contact us
            </a>
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <button 
                disabled
                className="block text-gray-400 font-medium py-2 px-4 transition-colors opacity-50 cursor-not-allowed"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </button>
              <button 
                disabled
                className="block bg-gray-400 text-white px-4 py-2 rounded-lg font-medium opacity-50 cursor-not-allowed transition-colors text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </nav>

      {/* Video Hero Section */}
      <section id="home" className="relative h-[calc(100vh-64px)] overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/videos/dyad-bannervideo.mp4" type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
              alt="Healthcare Professional"
              className="w-full h-full object-cover"
            />
          </video>
        </div>

        {/* Content Overlay */}
        <div className="relative z-20 h-full flex items-center justify-center px-0 sm:px-6 lg:px-8 pb-0 sm:pb-6 md:pb-8 lg:pb-12 sm:pt-0 sm:pt-4 sm:pt-16 md:pt-24 bg-gradient-to-t from-black/80 to-transparent sm:from-transparent sm:to-transparent">
          {/* Glossy Overlay Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
          <div className="w-[95%] sm:w-[80%] md:w-[80%] lg:w-[70%] xl:w-[70%] 2xl:w-[70%] max-w-[95%] sm:max-w-[80%] md:max-w-[80%] lg:max-w-[70%] xl:max-w-[70%] 2xl:max-w-[70%] mx-auto text-left sm:bg-black sm:bg-opacity-60 rounded-none sm:rounded-2xl p-6 sm:p-6 md:p-8 lg:p-12 bottom-4 sm:bottom-32">
            {/* Main Title */}
            <h1 className="text-[23px] sm:text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px] 2xl:text-[36px] font-bold text-white mb-6 sm:mb-6 leading-tight text-left sm:hidden" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.1)' }}>
              <span className="block sm:inline">A Bold Partnership</span>
              <span className="block sm:inline sm:ml-2">Model for</span>
              <br className="hidden sm:block" />
              <span className="text-[#B0DA23] block sm:inline sm:ml-2">Fiduciary-Grade</span>
              <span className="text-[#B0DA23] block sm:inline">Practice Operations</span>
            </h1>
            <h3 className="hidden sm:block text-[26px] md:text-[26px] lg:text-[28px] xl:text-[32px] 2xl:text-[36px] font-bold text-white mb-6 sm:mb-6 leading-tight text-left" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.1)', fontSize: '26px' }}>
              <span className="block sm:inline">A Bold Partnership</span>
              <span className="block sm:inline sm:ml-2">Model for</span>
              <br className="hidden sm:block" />
              <span className="text-[#B0DA23] block sm:inline sm:ml-2">Fiduciary-Grade</span>
              <span className="text-[#B0DA23] block sm:inline">Practice Operations</span>
            </h3>

            {/* Description */}
            <p className="text-[15px] sm:text-[17px] md:text-[17px] lg:text-[17px] xl:text-[18px] 2xl:text-[19px] text-blue-50 mb-8 sm:mb-8 leading-relaxed text-left max-w-none" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8), -1px -1px 1px rgba(255,255,255,0.1)', fontSize: '17px' }}>
              <span className="hidden sm:inline">
                Dyad is the integrated revenue cycle and practice operations platform for anesthesia, ambulatory surgery centers, and the surgical specialties that operate within them, built on banking-class infrastructure. We replace fragmented vendors with a single operating layer powered by deep industry expertise, advanced technology, and institutional-grade risk controls, delivering end-to-end precision from to case to cash, same day. One platform for independent practices, physician groups, private equity-backed portfolios, and managed services organizations. Truly integrated. Exponentially scalable.
              </span>
              <span className="sm:hidden">
                Dyad is the integrated revenue cycle and practice operations platform for anesthesia, ambulatory surgery centers, and surgical specialties. Built on banking-class infrastructure, we replace fragmented vendors with a single operating layer powered by deep expertise and advanced technology, delivering end-to-end precision from case to cash, same day.
              </span>
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-start sm:justify-start items-center">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-[#1D6DD8] text-white px-6 sm:px-6 py-4 sm:py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center gap-3 sm:gap-3 text-base sm:text-base shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transform hover:-translate-y-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
              >
                <span className="flex items-center gap-3">
                  Request a Demo
                  <ArrowRight className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                </span>
              </Link>
              <a
                href="#contact"
                className="w-full sm:w-auto bg-white text-[#1D6DD8] px-6 sm:px-6 py-4 sm:py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3 sm:gap-3 text-base sm:text-base shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transform hover:-translate-y-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection('contact');
                }}
              >
                <span className="flex items-center gap-3">
                  Contact Us
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Section */}
      <section id="logo_section4" className="relative mt-0 sm:-mt-8">
        <div className="w-full sm:w-4/5 mx-auto">
          <div className="bg-gray-50 rounded-none sm:rounded-2xl shadow-lg py-[1%] px-[2%] py-4 sm:py-[1%] px-4 sm:px-[2%]">
            {/* Desktop Layout - Single Row */}
            <div className="hidden sm:flex justify-around items-center w-full">
              <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 w-[16%] flex items-center justify-center">
                <img 
                  src="/assets/images/logo_section.svg" 
                  alt="Partner Logo 1" 
                  className="w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              
              <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 w-[10%] flex items-center justify-center">
                <img 
                  src="/assets/images/logo_section1.svg" 
                  alt="Partner Logo 2" 
                  className="w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              
              <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 w-[10%] flex items-center justify-center">
                <img 
                  src="/assets/images/logo_section2.svg" 
                  alt="Partner Logo 3" 
                  className="w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              
              <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 w-[10%] flex items-center justify-center">
                <img 
                  src="/assets/images/logo_section3.svg" 
                  alt="Partner Logo 4" 
                  className="w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              
              <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 w-[14%] flex items-center justify-center">
                <img 
                  src="/assets/images/logo_section4.svg" 
                  alt="Partner Logo 5" 
                  className="w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            </div>

            {/* Mobile Layout - Smooth Auto Scroll */}
            <div className="sm:hidden w-full py-6">
              <div className="overflow-hidden">
                <div className="flex gap-6 px-6 animate-scroll-left" style={{ width: 'fit-content' }}>
                  <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 w-40 h-20 flex items-center justify-center">
                    <img 
                      src="/assets/images/logo_section.svg" 
                      alt="Partner Logo 1" 
                      className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 w-40 h-20 flex items-center justify-center">
                    <img 
                      src="/assets/images/logo_section1.svg" 
                      alt="Partner Logo 2" 
                      className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 w-40 h-20 flex items-center justify-center">
                    <img 
                      src="/assets/images/logo_section2.svg" 
                      alt="Partner Logo 3" 
                      className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 w-40 h-20 flex items-center justify-center">
                    <img 
                      src="/assets/images/logo_section3.svg" 
                      alt="Partner Logo 4" 
                      className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 w-40 h-20 flex items-center justify-center">
                    <img 
                      src="/assets/images/logo_section4.svg" 
                      alt="Partner Logo 5" 
                      className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  {/* Duplicate logos for infinite scroll effect */}
                  <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 w-40 h-20 flex items-center justify-center">
                    <img 
                      src="/assets/images/logo_section.svg" 
                      alt="Partner Logo 1" 
                      className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 w-40 h-20 flex items-center justify-center">
                    <img 
                      src="/assets/images/logo_section1.svg" 
                      alt="Partner Logo 2" 
                      className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 w-40 h-20 flex items-center justify-center">
                    <img 
                      src="/assets/images/logo_section2.svg" 
                      alt="Partner Logo 3" 
                      className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 w-40 h-20 flex items-center justify-center">
                    <img 
                      src="/assets/images/logo_section3.svg" 
                      alt="Partner Logo 4" 
                      className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0 transition-all duration-300 hover:scale-105 w-40 h-20 flex items-center justify-center">
                    <img 
                      src="/assets/images/logo_section4.svg" 
                      alt="Partner Logo 5" 
                      className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CSS for infinite scrolling */}
            <style>{`
              @keyframes scroll-x {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
              .animate-scroll-x {
                animation: scroll-x 18s linear infinite;
                will-change: transform;
                backface-visibility: hidden;
                perspective: 1000px;
              }
              @keyframes scroll-left {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
            .animate-scroll-left {
                animation: scroll-left 20s linear infinite;
                will-change: transform;
                backface-visibility: hidden;
                perspective: 1000px;
              }
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl lg:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-bold text-blue-600 mb-6 text-[32px]" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3), -1px -1px 1px rgba(255,255,255,0.2)' }}>About Us</h2>
            <p className="text-base leading-relaxed" style={{ color: '#222222', maxWidth: '1152px', margin: '0 auto', textShadow: '1px 1px 1px rgba(0,0,0,0.1), -1px -1px 1px rgba(255,255,255,0.3)' }}>
              We operate at the intersection of expertise, technology, and trust, bringing deep industry knowledge and strategic insight to every engagement. Grounded in transparency and integrity, we align with those who prioritize operational excellence and long-term sustainability. Our approach is straightforward: no shortcuts, just a commitment to delivering measurable results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Our Story & Inspiration */}
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <div className="aspect-w-4 aspect-h-3 sm:aspect-w-16 sm:aspect-h-12">
                <img 
                  src="/assets/images/Our Story.png" 
                  alt="Our Story & Inspiration" 
                  className="w-full h-64 sm:h-64 lg:h-96 object-cover"
                />
                <div className='absolute bottom-0 left-0 right-0 h-3/4 sm:h-1/2 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2 sm:p-6 flex flex-col justify-end transition-all duration-700 ease-in-out sm:group-hover:h-full sm:group-hover:from-black/95 sm:group-hover:via-black/80'>
                  <div className='overlay-content opacity-100 transition-all duration-700 ease-in-out sm:group-hover:transform sm:group-hover:-translate-y-0 sm:group-hover:-translate-y-2 p-2 sm:p-6'>
                    <div className='overlay-title text-white font-bold mb-2 sm:mb-3 text-[18px] lg:text-xl' style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.2)' }}>Our Story & Inspiration</div>
                    <div className='overlay-subtitle text-gray-200 mb-4 sm:mb-6 text-[15px] sm:text-[18px] font-normal' style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 1px rgba(255,255,255,0.1)' }}>The origins and purpose</div>
                    <button 
                      onClick={() => setSelectedCard({
                        title: 'Our Story & Inspiration',
                        subtitle: 'The origins and purpose',
                        description: 'In 1908, William J. Mayo hired Harry Harwick to manage the business and operations of the Mayo Clinic, pioneering a new leadership model in healthcare: the Dyad. At its core, a Dyad is a partnership — a seamless collaboration between a clinical leader and a business operations expert to elevate care delivery and practice performance. Inspired by this model, Dyad Practice Solutions was founded to bring the same partnership-driven approach to modern healthcare operations, combining institutional-grade technology, deep domain'
                      })}
                      className='text-blue-500 hover:text-blue-400 font-medium transition-colors duration-300 text-xs sm:text-base sm:hidden block mt-2 mb-3 flex items-center justify-center'
                    >
                      <span>Learn More</span>
                      <svg className="w-4 h-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <a href="#" className='text-blue-500 hover:text-blue-400 font-medium transition-all duration-700 ease-in-out group-hover:opacity-0 group-hover:max-h-0 text-xs sm:text-base hidden sm:block mt-2 mb-3'>
                      Learn More
                      <svg className="w-4 h-4 ml-1 inline-block align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                    <div className='max-h-0 opacity-0 overflow-hidden transition-all duration-700 ease-in-out group-hover:max-h-24 sm:group-hover:max-h-48 group-hover:opacity-100 hidden sm:block'>
                      <div className='text-gray-200 text-xs sm:text-sm leading-relaxed overflow-y-auto max-h-24 sm:max-h-48 scrollbar scrollbar-track-gray-800 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full scrollbar-w-1 sm:scrollbar-w-2'>
                        In 1908, William J. Mayo hired Harry Harwick to manage the business and operations of the Mayo Clinic, pioneering a new leadership model in healthcare: the Dyad. At its core, a Dyad is a partnership — a seamless collaboration between a clinical leader and a business operations expert to elevate care delivery and practice performance. Inspired by this model, Dyad Practice Solutions was founded to bring the same partnership-driven approach to modern healthcare operations, combining institutional-grade technology, deep domain
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clarity & Accountability */}
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <div className="aspect-w-4 aspect-h-3 sm:aspect-w-16 sm:aspect-h-12">
                <img 
                  src="/assets/images/Clarity & Accountability.png" 
                  alt="Clarity & Accountability" 
                  className="w-full h-64 sm:h-64 lg:h-96 object-cover"
                />
                <div className='absolute bottom-0 left-0 right-0 h-3/4 sm:h-1/2 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2 sm:p-6 flex flex-col justify-end transition-all duration-700 ease-in-out sm:group-hover:h-full sm:group-hover:from-black/95 sm:group-hover:via-black/80'>
                  <div className='overlay-content opacity-100 transition-all duration-700 ease-in-out sm:group-hover:transform sm:group-hover:-translate-y-0 sm:group-hover:-translate-y-2 p-2 sm:p-6'>
                    <div className='overlay-title text-white font-bold mb-2 sm:mb-3 text-[18px] lg:text-xl' style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.2)' }}>Clarity & Accountability</div>
                    <div className='overlay-subtitle text-gray-200 mb-4 sm:mb-6 text-[15px] sm:text-[18px] font-normal' style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 1px rgba(255,255,255,0.1)' }}>Partnership through integrity and transparency</div>
                    <button 
                      onClick={() => setSelectedCard({
                        title: 'Clarity & Accountability',
                        subtitle: 'Partnership through integrity and transparency',
                        description: 'The DYAD partnership-driven model is built on a fiduciary commitment, providing integrity and transparency in every engagement. We deliver measurable outcomes that support practices in optimizing operations while ensuring they maintain control.'
                      })}
                      className='text-blue-500 hover:text-blue-400 font-medium transition-colors duration-300 text-xs sm:text-base sm:hidden block mt-2 mb-3 flex items-center justify-center'
                    >
                      <span>Learn More</span>
                      <svg className="w-4 h-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <a href="#" className='text-blue-500 hover:text-blue-400 font-medium transition-all duration-700 ease-in-out group-hover:opacity-0 group-hover:max-h-0 text-xs sm:text-base hidden sm:block mt-2 mb-3'>
                      Learn More
                      <svg className="w-4 h-4 ml-1 inline-block align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                    <div className='max-h-0 opacity-0 overflow-hidden transition-all duration-700 ease-in-out group-hover:max-h-24 sm:group-hover:max-h-48 group-hover:opacity-100 hidden sm:block'>
                      <div className='text-gray-200 text-xs sm:text-sm leading-relaxed overflow-y-auto max-h-24 sm:max-h-48 scrollbar scrollbar-track-gray-800 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full scrollbar-w-1 sm:scrollbar-w-2'>
                   The DYAD partnership-driven model is built on a fiduciary commitment, providing integrity and transparency in every engagement. We deliver measurable outcomes that support practices in optimizing operations while ensuring they maintain control.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technology Guided by Expertise */}
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <div className="aspect-w-4 aspect-h-3 sm:aspect-w-16 sm:aspect-h-12">
                <img 
                  src="/assets/images/Technology Guided by Expertise.png" 
                  alt="Technology Guided by Expertise" 
                  className="w-full h-64 sm:h-64 lg:h-96 object-cover"
                />
                <div className='absolute bottom-0 left-0 right-0 h-3/4 sm:h-1/2 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2 sm:p-6 flex flex-col justify-end transition-all duration-700 ease-in-out sm:group-hover:h-full sm:group-hover:from-black/95 sm:group-hover:via-black/80'>
                  <div className='overlay-content opacity-100 transition-all duration-700 ease-in-out sm:group-hover:transform sm:group-hover:-translate-y-0 sm:group-hover:-translate-y-2 p-2 sm:p-6'>
                    <div className='overlay-title text-white font-bold mb-2 sm:mb-3 text-[18px] lg:text-xl' style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.2)' }}>Technology Guided by Expertise</div>
                    <div className='overlay-subtitle text-gray-200 mb-4 sm:mb-6 text-[15px] sm:text-[18px] font-normal' style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 1px rgba(255,255,255,0.1)' }}>Integrated risk controls & optimized workflows</div>
                    <button 
                      onClick={() => setSelectedCard({
                        title: 'Technology Guided by Expertise',
                        subtitle: 'Integrated risk controls & optimized workflows',
                        description: 'Technology alone isn\'t enough — it\'s how it\'s applied that makes the difference. Dyad integrates AI, automation, and data-driven insights with industry expertise to improve workflows, reduce costs, and strengthen practice operations — all with expert oversight to ensure accuracy and reliability.'
                      })}
                      className='text-blue-500 hover:text-blue-400 font-medium transition-colors duration-300 text-xs sm:text-base sm:hidden block mt-2 mb-3 flex items-center justify-center'
                    >
                      <span>Learn More</span>
                      <svg className="w-4 h-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <a href="#" className='text-blue-500 hover:text-blue-400 font-medium transition-all duration-700 ease-in-out group-hover:opacity-0 group-hover:max-h-0 text-xs sm:text-base hidden sm:block mt-2 mb-3'>
                      Learn More
                      <svg className="w-4 h-4 ml-1 inline-block align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                    <div className='max-h-0 opacity-0 overflow-hidden transition-all duration-700 ease-in-out group-hover:max-h-24 sm:group-hover:max-h-48 group-hover:opacity-100 hidden sm:block'>
                      <div className='text-gray-200 text-xs sm:text-sm leading-relaxed overflow-y-auto max-h-24 sm:max-h-48 scrollbar scrollbar-track-gray-800 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full scrollbar-w-1 sm:scrollbar-w-2'>
                     Technology alone isn't enough — it's how it's applied that makes the difference. Dyad integrates AI, automation, and data-driven insights with industry expertise to improve workflows, reduce costs, and strengthen practice operations — all with expert oversight to ensure accuracy and reliability.  </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row of Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 mt-3 sm:mt-6 lg:mt-8">
            {/* Scalable by Design */}
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <div className="aspect-w-4 aspect-h-3 sm:aspect-w-16 sm:aspect-h-12">
                <img 
                  src="/assets/images/Scalable by Design.png" 
                  alt="Scalable by Design" 
                  className="w-full h-64 sm:h-64 lg:h-96 object-cover"
                />
                <div className='absolute bottom-0 left-0 right-0 h-3/4 sm:h-1/2 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2 sm:p-6 flex flex-col justify-end transition-all duration-700 ease-in-out sm:group-hover:h-full sm:group-hover:from-black/95 sm:group-hover:via-black/80'>
                  <div className='overlay-content opacity-100 transition-all duration-700 ease-in-out sm:group-hover:transform sm:group-hover:-translate-y-0 sm:group-hover:-translate-y-2 p-2 sm:p-6'>
                    <div className='overlay-title text-white font-bold mb-2 sm:mb-3 text-[18px] lg:text-xl' style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.2)' }}>Scalable by Design</div>
                    <div className='overlay-subtitle text-gray-200 mb-4 sm:mb-6 text-[15px] sm:text-[18px] font-normal' style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 1px rgba(255,255,255,0.1)' }}>Empowering independent practices with scalable solutions</div>
                    <button 
                      onClick={() => setSelectedCard({
                        title: 'Scalable by Design',
                        subtitle: 'Empowering independent practices with scalable solutions',
                        description: 'Whether you operate a single practice, a regional group, or a PE-backed portfolio of acquisitions, Dyad deploys the same institutional-grade platform with consistent controls, consolidated reporting, and real-time visibility. Our modular architecture means onboarding a new entity does not require custom integration or months of implementation. Dyad delivers value, exceptional service, and measurable results from day one.'
                      })}
                      className='text-blue-500 hover:text-blue-400 font-medium transition-colors duration-300 text-xs sm:text-base sm:hidden block mt-2 mb-3 flex items-center justify-center'
                    >
                      <span>Learn More</span>
                      <svg className="w-4 h-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <a href="#" className='text-blue-500 hover:text-blue-400 font-medium transition-all duration-700 ease-in-out group-hover:opacity-0 group-hover:max-h-0 text-xs sm:text-base hidden sm:block mt-2 mb-3'>
                      Learn More
                      <svg className="w-4 h-4 ml-1 inline-block align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                    <div className='max-h-0 opacity-0 overflow-hidden transition-all duration-700 ease-in-out group-hover:max-h-24 sm:group-hover:max-h-48 group-hover:opacity-100 hidden sm:block'>
                      <div className='text-gray-200 text-xs sm:text-sm leading-relaxed overflow-y-auto max-h-24 sm:max-h-48 scrollbar scrollbar-track-gray-800 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full scrollbar-w-1 sm:scrollbar-w-2'>
                   Whether you operate a single practice, a regional group, or a PE-backed portfolio of acquisitions, Dyad deploys the same institutional-grade platform with consistent controls, consolidated reporting, and real-time visibility. Our modular architecture means onboarding a new entity does not require custom integration or months of implementation. Dyad delivers value, exceptional service, and measurable results from day one.   </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Dyad */}
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <div className="aspect-w-4 aspect-h-3 sm:aspect-w-16 sm:aspect-h-12">
                <img 
                  src="/assets/images/Why Dyad_.png" 
                  alt="Why Dyad" 
                  className="w-full h-64 sm:h-64 lg:h-96 object-cover"
                />
                <div className='absolute bottom-0 left-0 right-0 h-3/4 sm:h-1/2 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2 sm:p-6 flex flex-col justify-end transition-all duration-700 ease-in-out sm:group-hover:h-full sm:group-hover:from-black/95 sm:group-hover:via-black/80'>
                  <div className='overlay-content opacity-100 transition-all duration-700 ease-in-out sm:group-hover:transform sm:group-hover:-translate-y-0 sm:group-hover:-translate-y-2 p-2 sm:p-6'>
                    <div className='overlay-title text-white font-bold mb-2 sm:mb-3 text-[18px] lg:text-xl' style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.2)' }}>Why DYAD?</div>
                    <div className='overlay-subtitle text-gray-200 mb-4 sm:mb-6 text-[15px] sm:text-[18px] font-normal' style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 1px rgba(255,255,255,0.1)' }}>Expertise, execution and strategic support</div>
                    <button 
                      onClick={() => setSelectedCard({
                        title: 'Why DYAD?',
                        subtitle: 'Expertise, execution and strategic support',
                        description: 'DYAD integrates industry expertise, technology, and structured risk controls to create stability, efficiency, and accountability in practice operations. Rather than offering fragmented, à la carte services, we take an integrated approach — delivering a seamless, structured framework that enhances efficiency, ensures consistency, and drives measurable outcomes. Our approach ensures every solution aligns with the best interests of the organization.'
                      })}
                      className='text-blue-500 hover:text-blue-400 font-medium transition-colors duration-300 text-xs sm:text-base sm:hidden block mt-2 mb-3 flex items-center justify-center'
                    >
                      <span>Learn More</span>
                      <svg className="w-4 h-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <a href="#" className='text-blue-500 hover:text-blue-400 font-medium transition-all duration-700 ease-in-out group-hover:opacity-0 group-hover:max-h-0 text-xs sm:text-base hidden sm:block mt-2 mb-3'>
                      Learn More
                      <svg className="w-4 h-4 ml-1 inline-block align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                    <div className='max-h-0 opacity-0 overflow-hidden transition-all duration-700 ease-in-out group-hover:max-h-24 sm:group-hover:max-h-48 group-hover:opacity-100 hidden sm:block'>
                      <div className='text-gray-200 text-xs sm:text-sm leading-relaxed overflow-y-auto max-h-24 sm:max-h-48 scrollbar scrollbar-track-gray-800 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full scrollbar-w-1 sm:scrollbar-w-2'>
                    DYAD integrates industry expertise, technology, and structured risk controls to create stability, efficiency, and accountability in practice operations. Rather than offering fragmented, à la carte services, we take an integrated approach — delivering a seamless, structured framework that enhances efficiency, ensures consistency, and drives measurable outcomes. Our approach ensures every solution aligns with the best interests of the organization.   </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Our Process */}
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <div className="aspect-w-4 aspect-h-3 sm:aspect-w-16 sm:aspect-h-12">
                <img 
                  src="/assets/images/Our process.png" 
                  alt="Our Process" 
                  className="w-full h-64 sm:h-64 lg:h-96 object-cover"
                />
                <div className='absolute bottom-0 left-0 right-0 h-3/4 sm:h-1/2 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2 sm:p-6 flex flex-col justify-end transition-all duration-700 ease-in-out sm:group-hover:h-full sm:group-hover:from-black/95 sm:group-hover:via-black/80'>
                  <div className='overlay-content opacity-100 transition-all duration-700 ease-in-out sm:group-hover:transform sm:group-hover:-translate-y-0 sm:group-hover:-translate-y-2 p-2 sm:p-6'>
                    <div className='overlay-title text-white font-bold mb-2 sm:mb-3 text-[18px] lg:text-xl' style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.2)' }}>Our Process</div>
                    <div className='overlay-subtitle text-gray-200 mb-4 sm:mb-6 text-[18px] font-normal' style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 1px rgba(255,255,255,0.1)' }}>Streamlined for efficiency from day one</div>
                    <button 
                      onClick={() => setSelectedCard({
                        title: 'Our Process',
                        subtitle: 'Streamlined for efficiency from day one',
                        description: 'Designed with intention, built for impact. From onboarding to execution, our streamlined approach eliminates complexity, accelerates results, and ensures seamless integration.'
                      })}
                      className='text-blue-500 hover:text-blue-400 font-medium transition-colors duration-300 text-xs sm:text-base sm:hidden block mt-2 mb-3 flex items-center justify-center'
                    >
                      <span>Learn More</span>
                      <svg className="w-4 h-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <a href="#" className='text-blue-500 hover:text-blue-400 font-medium transition-all duration-700 ease-in-out group-hover:opacity-0 group-hover:max-h-0 text-xs sm:text-base hidden sm:block mt-2 mb-3'>
                      Learn More
                      <svg className="w-4 h-4 ml-1 inline-block align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                    <div className='max-h-0 opacity-0 overflow-hidden transition-all duration-700 ease-in-out group-hover:max-h-24 sm:group-hover:max-h-48 group-hover:opacity-100 hidden sm:block'>
                      <div className='text-gray-200 text-xs sm:text-sm leading-relaxed overflow-y-auto max-h-24 sm:max-h-48 scrollbar scrollbar-track-gray-800 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full scrollbar-w-1 sm:scrollbar-w-2'>
                     Designed with intention, built for impact. From onboarding to execution, our streamlined approach eliminates complexity, accelerates results, and ensures seamless integration.  </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Popup Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 sm:hidden">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl max-w-sm w-full max-h-[80vh] overflow-hidden shadow-2xl border border-gray-200">
            <div className="relative">
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 rounded-full p-2 shadow-lg border border-gray-200"
              >
                <X className="w-5 h-5 text-gray-800" />
              </button>
              <div className="bg-white border-b border-gray-200 p-6">
                <h3 className="text-gray-900 font-bold text-lg mb-1">{selectedCard.title}</h3>
                <p className="text-gray-800 text-base font-medium">{selectedCard.subtitle}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
                <p className="text-gray-800 text-sm leading-relaxed">
                  {selectedCard.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leadership Section */}
      <section id="leadership" className="py-20" style={{ backgroundColor: '#F1F6FC' }}>
        <div className="max-w-7xl lg:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-bold text-blue-600 mb-6 text-[32px]" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3), -1px -1px 1px rgba(255,255,255,0.2)' }}>Leadership</h2>
            <p className="text-base leading-relaxed" style={{ color: '#222222', maxWidth: '1152px', margin: '0 auto', textShadow: '1px 1px 1px rgba(0,0,0,0.1), -1px -1px 1px rgba(255,255,255,0.3)' }}>
              Decades of proven expertise at the intersection of healthcare, finance and technology
            </p>
          </div>
          
          <div className="space-y-16 sm:space-y-20 lg:space-y-24">
            {/* Leadership Card 1 */}
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center">
                {/* Left Side - Person Image */}
                <div className="w-full sm:w-1/3 flex-shrink-0">
                  <div className="aspect-w-1 aspect-h-1">
                    <img 
                      src="https://ui-avatars.com/api/?name=S+Jaikumar&background=E5E7EB&color=374151&size=400" 
                      alt="S. Jaikumar" 
                      className="w-full h-64 sm:h-80 object-cover rounded-lg"
                    />
                  </div>
                </div>
                
                {/* Right Side - Content */}
                <div className="w-full sm:w-2/3">
                  <h3 className="font-bold text-gray-900 mb-2" style={{ fontSize: '24px' }}>S. Jaikumar</h3>
                  <p className="text-gray-700 font-medium mb-4" style={{ fontSize: '16px' }}>Founder</p>
                  <p className="text-gray-700 mb-2" style={{ fontSize: '14px' }}>MBA, MS FAIM</p>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    27+ years building institutional-grade financial, payments, and risk infrastructure. A Treasurer at global enterprises with deep expertise in collections optimization, cash acceleration, and controls for over 2.5 trillion in assets under management. Designed real-time receivables, merchant processing, and fraud mitigation platforms — applied directly to healthcare revenue cycle. Brings fiduciary discipline and payer-level rigor to physician reimbursement.
                  </p>
                </div>
              </div>
            </div>

            {/* Leadership Card 2 */}
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row-reverse gap-6 sm:gap-8 items-center">
                {/* Right Side - Person Image */}
                <div className="w-full sm:w-1/3 flex-shrink-0">
                  <div className="aspect-w-1 aspect-h-1">
                    <img 
                      src="https://ui-avatars.com/api/?name=A+Subramaniam&background=E5E7EB&color=374151&size=400" 
                      alt="A. Subramaniam" 
                      className="w-full h-64 sm:h-80 object-cover rounded-lg"
                    />
                  </div>
                </div>
                
                {/* Left Side - Content */}
                <div className="w-full sm:w-2/3">
                  <h3 className="font-bold text-gray-900 mb-2" style={{ fontSize: '24px' }}>A. Subramaniam</h3>
                  <p className="text-gray-700 font-medium mb-4" style={{ fontSize: '16px' }}>Chief Technology & AI Officer</p>
                  <p className="text-gray-700 mb-2" style={{ fontSize: '14px' }}>Post-Graduate Certificate in Business Analytics and Business Intelligence</p>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    27+ years architecting enterprise data, AI, and automation platforms across healthcare and financial services at major insurers and global banks. Chief AI Officer who has scaled 50+ production AI and GenAI accelerators including data ingestion, rules engines, and document intelligence. Expert in paper-elimination, workflow automation, and real-time analytics. Adjunct professor at Johns Hopkins AI graduate studies.
                  </p>
                </div>
              </div>
            </div>

            {/* Leadership Card 3 */}
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center">
                {/* Left Side - Person Image */}
                <div className="w-full sm:w-1/3 flex-shrink-0">
                  <div className="aspect-w-1 aspect-h-1">
                    <img 
                      src="https://ui-avatars.com/api/?name=K+S+Rajan&background=E5E7EB&color=374151&size=400" 
                      alt="K. S. Rajan" 
                      className="w-full h-64 sm:h-80 object-cover rounded-lg"
                    />
                  </div>
                </div>
                
                {/* Right Side - Content */}
                <div className="w-full sm:w-2/3">
                  <h3 className="font-bold text-gray-900 mb-2" style={{ fontSize: '24px' }}>K. S. Rajan</h3>
                  <p className="text-gray-700 font-medium mb-4" style={{ fontSize: '16px' }}>Chief Operating Officer, India</p>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    28+ years running large-scale U.S. healthcare RCM operations across onshore and offshore teams. Former global P&L leader for multi-billion-dollar RCM platforms serving thousands of providers. Deep expertise in specialty billing, AR recovery, denials, IDR workflows, SLA governance, and compliance. Scales Dyad's operations with a quality-first, audit-defensible model.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl lg:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-bold text-blue-600 mb-6 text-[32px]" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3), -1px -1px 1px rgba(255,255,255,0.2)' }}>Our Services</h2>
            <p className="text-base leading-relaxed" style={{ color: '#222222', maxWidth: '1152px', margin: '0 auto', textShadow: '1px 1px 1px rgba(0,0,0,0.1), -1px -1px 1px rgba(255,255,255,0.3)' }}>
          We set the standard for accuracy, efficiency, and value - delivering faster turnarounds, unmatched precision, and measurable impact. Backed by rigorous risk controls and uncompromising quality, our integrated solutions go beyond excellence to redefine what’s possible. No fragmentation - just a unified approach. Most services operate within our full-service model, where seamless integration drives real value.  </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Service Card 1 */}
            <div className="bg-white rounded-xl shadow-xl hover:shadow-[0_20px_25px_-5px_rgba(29,109,216,0.3),0_8px_10px_-6px_rgba(29,109,216,0.2)] transition-all duration-500 overflow-hidden h-full flex flex-col border border-gray-100 group relative">
              {/* Top Image */}
              <div className="w-full h-48 relative overflow-hidden">
                <img 
                  src="/assets/images/service1.png" 
                  alt="Practice Foundations" 
                  className="w-full h-full object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-105"
                />
              </div>
              
              {/* Bottom Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-[18px] lg:text-xl font-bold text-gray-900 mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2), -1px -1px 1px rgba(255,255,255,0.2)' }}>Practice Foundations</h3>
                <p className="text-gray-600 mb-4 text-[15px] sm:text-[16px] leading-relaxed" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.1), -1px -1px 1px rgba(255,255,255,0.1)' }}>
                  Startup support, compliance and credentialing services to establish and optimize your practice operations from day one.
                </p>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300 inline-flex items-center text-[15px] sm:text-[16px]" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.1), -1px -1px 1px rgba(255,255,255,0.1)' }}>
                  Learn More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              
              {/* Full Card Overlay */}
              <div className="absolute inset-0 bg-[#F1F6FC] opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center px-6 py-8">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 inline-block border-b-2 border-blue-500 pb-2">Payer Contracting</h3>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Practice assessment</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Payer enrollment</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Facility credentialing</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Physician licensing</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Physician credentialing</p>
                  </div>
                </div>
                <a href="#" className="text-gray-900 hover:text-gray-700 font-semibold transition-colors duration-300 inline-flex items-center text-base">
                  Learn More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Service Card 2 */}
            <div className="bg-white rounded-xl shadow-xl hover:shadow-[0_20px_25px_-5px_rgba(29,109,216,0.3),0_8px_10px_-6px_rgba(29,109,216,0.2)] transition-all duration-500 overflow-hidden h-full flex flex-col border border-gray-100 group relative">
              {/* Top Image */}
              <div className="w-full h-48 relative overflow-hidden">
                <img 
                  src="/assets/images/service2.png" 
                  alt="Technology driven capabilities" 
                  className="w-full h-full object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-105"
                />
              </div>
              
              {/* Bottom Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-[18px] lg:text-xl font-bold text-gray-900 mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2), -1px -1px 1px rgba(255,255,255,0.2)' }}>Technology Driven Capabilities</h3>
                <p className="text-gray-600 mb-4 text-[15px] sm:text-[16px] leading-relaxed" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.1), -1px -1px 1px rgba(255,255,255,0.1)' }}>
                  Mobile supported workflows, ONC Integration FHIR, governance and compliance solutions for modern healthcare operations.
                </p>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300 inline-flex items-center text-[15px] sm:text-[16px]" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.1), -1px -1px 1px rgba(255,255,255,0.1)' }}>
                  Learn More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              
              {/* Full Card Overlay */}
              <div className="absolute inset-0 bg-[#F1F6FC] opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center px-6 py-8">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 inline-block border-b-2 border-blue-500 pb-2">Technology Solutions</h3>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">iOS mobile supported Anesthesia workflows</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">ONC Integration FHIR</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Fully automated and integrated document management</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">24/7 365 ecosystem monitoring, governance, and compliance</p>
                  </div>
                </div>
                <a href="#" className="text-gray-900 hover:text-gray-700 font-semibold transition-colors duration-300 inline-flex items-center text-base">
                  Learn More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Service Card 3 */}
            <div className="bg-white rounded-xl shadow-xl hover:shadow-[0_20px_25px_-5px_rgba(29,109,216,0.3),0_8px_10px_-6px_rgba(29,109,216,0.2)] transition-all duration-500 overflow-hidden h-full flex flex-col border border-gray-100 group relative">
              {/* Top Image */}
              <div className="w-full h-48 relative overflow-hidden">
                <img 
                  src="/assets/images/service3.png" 
                  alt="Pre & Post Encounter" 
                  className="w-full h-full object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-105"
                />
              </div>
              
              {/* Bottom Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-[18px] lg:text-xl font-bold text-gray-900 mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2), -1px -1px 1px rgba(255,255,255,0.2)' }}>Pre & Post Encounter</h3>
                <p className="text-gray-600 mb-3 text-[15px] sm:text-[16px] leading-relaxed opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                  Eligibility verifications, prior-authorizations, patient estimates, Precision driven charge capture, Specialty Coding.
                </p>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300 inline-flex items-center text-[15px] sm:text-[16px] opacity-100 group-hover:opacity-0">
                  Learn More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              
              {/* Full Card Overlay */}
              <div className="absolute inset-0 bg-[#F1F6FC] opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center px-6 py-8">
                <div className="mb-4">
                  <h3 className="text-[18px] lg:text-xl font-bold text-gray-900 mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2), -1px -1px 1px rgba(255,255,255,0.2)' }}>Patient Services</h3>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Eligibility & Benefits verifications</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Prior-authorizations</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Patient good faith estimates</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Expedited Charge capture</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Specialty Coding</p>
                  </div>
                </div>
                <a href="#" className="text-gray-900 hover:text-gray-700 font-semibold transition-colors duration-300 inline-flex items-center text-base">
                  Learn More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {/* Service Card 4 */}
            <div className="bg-white rounded-xl shadow-xl hover:shadow-[0_20px_25px_-5px_rgba(29,109,216,0.3),0_8px_10px_-6px_rgba(29,109,216,0.2)] transition-all duration-500 overflow-hidden h-full flex flex-col border border-gray-100 group relative">
              {/* Top Image */}
              <div className="w-full h-48 relative overflow-hidden">
                <img 
                  src="/assets/images/service4.png" 
                  alt="Claims Management" 
                  className="w-full h-full object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-105"
                />
              </div>
              
              {/* Bottom Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-[18px] lg:text-xl font-bold text-gray-900 mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2), -1px -1px 1px rgba(255,255,255,0.2)' }}>Claims Management</h3>
                <p className="text-gray-600 mb-3 text-[15px] sm:text-[16px] leading-relaxed opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                  Expedited submissions, resolutions & real-time tracking for optimized claims processing and faster reimbursements.
                </p>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300 inline-flex items-center text-[15px] sm:text-[16px] opacity-100 group-hover:opacity-0">
                  Learn More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              
              {/* Full Card Overlay */}
              <div className="absolute inset-0 bg-[#F1F6FC] opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center px-6 py-8">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 inline-block border-b-2 border-blue-500 pb-2">Revenue Management</h3>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Denials & Appeals</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Accounts Receivable (AR)</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Payment posting & Reconciliation</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Re-bill processing</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Underpayments detection & recovery</p>
                  </div>
                </div>
                <a href="#" className="text-gray-900 hover:text-gray-700 font-semibold transition-colors duration-300 inline-flex items-center text-base">
                  Learn More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Service Card 5 */}
            <div className="bg-white rounded-xl shadow-xl hover:shadow-[0_20px_25px_-5px_rgba(29,109,216,0.3),0_8px_10px_-6px_rgba(29,109,216,0.2)] transition-all duration-500 overflow-hidden h-full flex flex-col border border-gray-100 group relative">
              {/* Top Image */}
              <div className="w-full h-48 relative overflow-hidden">
                <img 
                  src="/assets/images/service5.png" 
                  alt="Specialty Billing" 
                  className="w-full h-full object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-105"
                />
              </div>
              
              {/* Bottom Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-[18px] lg:text-xl font-bold text-gray-900 mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2), -1px -1px 1px rgba(255,255,255,0.2)' }}>Specialty Billing</h3>
                <p className="text-gray-600 mb-3 text-[15px] sm:text-[16px] leading-relaxed opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                  Expert lien management for complex cases, ensuring accurate billing and optimal reimbursement for specialty services.
                </p>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300 inline-flex items-center text-[15px] sm:text-[16px] opacity-100 group-hover:opacity-0">
                  Learn More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              
              {/* Full Card Overlay */}
              <div className="absolute inset-0 bg-[#F1F6FC] opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center px-6 py-8">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 inline-block border-b-2 border-blue-500 pb-2">Specialty Billing</h3>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Personal injury</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Workers compensation</p>
                  </div>
                </div>
                <a href="#" className="text-gray-900 hover:text-gray-700 font-semibold transition-colors duration-300 inline-flex items-center text-base">
                  Learn More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Service Card 6 */}
            <div className="bg-white rounded-xl shadow-xl hover:shadow-[0_20px_25px_-5px_rgba(29,109,216,0.3),0_8px_10px_-6px_rgba(29,109,216,0.2)] transition-all duration-500 overflow-hidden h-full flex flex-col border border-gray-100 group relative">
              {/* Top Image */}
              <div className="w-full h-48 relative overflow-hidden">
                <img 
                  src="/assets/images/service6.png" 
                  alt="Real Time Insights" 
                  className="w-full h-full object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-105"
                />
              </div>
              
              {/* Bottom Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-[18px] lg:text-xl font-bold text-gray-900 mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2), -1px -1px 1px rgba(255,255,255,0.2)' }}>Real Time Insights</h3>
                <p className="text-gray-600 mb-3 text-[15px] sm:text-[16px] leading-relaxed opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                  Credentials alert, reporting & strategic insights to drive data-informed decisions and optimize practice performance.
                </p>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300 inline-flex items-center text-[15px] sm:text-[16px] opacity-100 group-hover:opacity-0">
                  Learn More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              
              {/* Full Card Overlay */}
              <div className="absolute inset-0 bg-[#F1F6FC] opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center px-6 py-8">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 inline-block border-b-2 border-blue-500 pb-2">Analytics & Insights</h3>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Track claims real time</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">CAQH management</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Contracted rates benchmarking</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Market analytics</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Robust reporting</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <img src="/assets/images/vector-tick.png" alt="" className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 text-base">Customized insights</p>
                  </div>
                </div>
                <a href="#" className="text-gray-900 hover:text-gray-700 font-semibold transition-colors duration-300 inline-flex items-center text-base">
                  Learn More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      </div>
  );
};

export default Landing;

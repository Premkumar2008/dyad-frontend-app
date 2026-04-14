/**
 * Refactored DyadLanding component
 * Clean architecture with separated concerns and optimized performance
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { Header } from '../common/Header/Header';
import { Footer } from '../common/Footer/Footer';
import { HeroSection } from './Hero/HeroSection';
import { AboutSection } from './About/AboutSection';
import { ContactForm } from './Contact/ContactForm';
import { NAVIGATION_ITEMS, ABOUT_CONTENT, FOOTER_COLUMNS, HERO_CONTENT } from '../../constants/content';
import { AboutContentItem } from '../../types/landing';
import { log } from '../../utils/logger';
import toast from 'react-hot-toast';

/**
 * Main landing page component with optimized architecture
 */
export const DyadLandingRefactored: React.FC = () => {
  // Navigation state and handlers
  const {
    activeMenu,
    hoveredMenu,
    isMobileMenuOpen,
    setActiveMenu,
    setHoveredMenu,
    toggleMobileMenu,
    closeMobileMenu,
    navigateWithScroll,
    handleScrollFromState,
  } = useNavigation();

  // About section state
  const [activeAboutCard, setActiveAboutCard] = useState<number | null>(null);
  const [expandedAboutCard, setExpandedAboutCard] = useState<AboutContentItem | null>(null);

  // Contact form state
  const [showContactSuccess, setShowContactSuccess] = useState(false);

  // Handle scroll from navigation state
  useEffect(() => {
    handleScrollFromState();
  }, [handleScrollFromState]);

  // Memoized navigation items to prevent unnecessary re-renders
  const navigationItems = useMemo(() => NAVIGATION_ITEMS, []);

  // Memoized about content
  const aboutContent = useMemo(() => ABOUT_CONTENT, []);

  // Handle navigation menu click
  const handleMenuClick = useCallback((menu: string) => {
    log.debug('Menu clicked', 'DyadLanding', { menu });
    setActiveMenu(menu);
    
    // Handle navigation based on menu item
    switch (menu) {
      case 'Home':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'Contact':
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        // For other menu items, scroll to corresponding section
        const sectionId = menu.toLowerCase().replace(/\s+/g, '-');
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        break;
    }
  }, [setActiveMenu]);

  // Handle about card expansion
  const handleAboutCardExpand = useCallback((item: AboutContentItem) => {
    log.debug('About card expanded', 'DyadLanding', { itemId: item.id });
    setExpandedAboutCard(item);
  }, []);

  // Handle about card active state
  const handleAboutCardActiveChange = useCallback((id: number | null) => {
    log.debug('About card active state changed', 'DyadLanding', { id });
    setActiveAboutCard(id);
  }, []);

  // Close about popup
  const handleAboutPopupClose = useCallback(() => {
    log.debug('About popup closed', 'DyadLanding');
    setExpandedAboutCard(null);
    setActiveAboutCard(null);
  }, []);

  // Handle login navigation
  const handleLogin = useCallback(() => {
    log.info('Navigate to login', 'DyadLanding');
    navigateWithScroll('/login');
  }, [navigateWithScroll]);

  // Handle contact form success
  const handleContactSuccess = useCallback(() => {
    log.info('Contact form submitted successfully', 'DyadLanding');
    setShowContactSuccess(true);
    toast.success('Thank you for your inquiry! We will contact you soon.');
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowContactSuccess(false);
    }, 5000);
  }, []);

  // Handle contact form error
  const handleContactError = useCallback((error: string) => {
    log.error('Contact form submission failed', 'DyadLanding', { error });
    toast.error(error);
  }, []);

  // Memoized hero props to prevent unnecessary re-renders
  const heroProps = useMemo(() => ({
    title: HERO_CONTENT.title,
    subtitle: HERO_CONTENT.subtitle,
    description: HERO_CONTENT.description,
    primaryButtonText: HERO_CONTENT.primaryButtonText,
    secondaryButtonText: HERO_CONTENT.secondaryButtonText,
    onPrimaryClick: handleLogin,
    onSecondaryClick: () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }),
  }), [handleLogin]);

  // Memoized header props
  const headerProps = useMemo(() => ({
    navigationItems,
    activeMenu,
    hoveredMenu,
    isMobileMenuOpen,
    onMenuClick: handleMenuClick,
    onMenuHover: setHoveredMenu,
    onMobileMenuToggle: toggleMobileMenu,
    onMobileMenuClose: closeMobileMenu,
  }), [
    navigationItems,
    activeMenu,
    hoveredMenu,
    isMobileMenuOpen,
    handleMenuClick,
    setHoveredMenu,
    toggleMobileMenu,
    closeMobileMenu,
  ]);

  // Memoized about section props
  const aboutSectionProps = useMemo(() => ({
    aboutContent,
    expandedCard: expandedAboutCard,
    activeCardId: activeAboutCard,
    onCardExpand: handleAboutCardExpand,
    onCardActiveChange: handleAboutCardActiveChange,
    onPopupClose: handleAboutPopupClose,
  }), [
    aboutContent,
    expandedAboutCard,
    activeAboutCard,
    handleAboutCardExpand,
    handleAboutCardActiveChange,
    handleAboutPopupClose,
  ]);

  return (
    <div className="dyad-landing-container">
      {/* Header */}
      <Header {...headerProps} />

      {/* Main Content */}
      <main className="dyad-landing-main">
        {/* Hero Section */}
        <HeroSection {...heroProps} />

        {/* About Section */}
        <AboutSection {...aboutSectionProps} />

        {/* Contact Section */}
        <section id="contact" className="contact-section">
          <div className="contact-container">
            <div className="contact-header">
              <h2 className="contact-title">Get in Touch</h2>
              <p className="contact-subtitle">
                Ready to transform your practice? Contact us today to learn how Dyad Practice Solutions can help you achieve operational excellence and improved patient outcomes.
              </p>
            </div>

            {/* Success Message */}
            {showContactSuccess && (
              <div className="contact-success-message">
                <h3>Thank you for your inquiry!</h3>
                <p>We have received your message and will contact you within 24 hours.</p>
              </div>
            )}

            {/* Contact Form */}
            <div className="contact-form-container">
              <ContactForm
                onSuccess={handleContactSuccess}
                onError={handleContactError}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer columns={FOOTER_COLUMNS} />
    </div>
  );
};

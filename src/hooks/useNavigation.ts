/**
 * Custom hook for navigation management
 * Handles navigation state and common navigation actions
 */

import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeMenu, setActiveMenu] = useState('Home');
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle navigation with smooth scroll
  const navigateWithScroll = useCallback((path: string, scrollTo?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setTimeout(() => {
      if (scrollTo) {
        navigate(path, { state: { scrollTo } });
      } else {
        navigate(path);
      }
    }, 300);
  }, [navigate]);

  // Handle scroll to section from navigation state
  const handleScrollFromState = useCallback(() => {
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

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Close mobile menu
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Set active menu item
  const setActiveMenuItem = useCallback((menu: string) => {
    setActiveMenu(menu);
  }, []);

  return {
    // State
    activeMenu,
    hoveredMenu,
    isMobileMenuOpen,
    
    // Actions
    setActiveMenu: setActiveMenuItem,
    setHoveredMenu,
    toggleMobileMenu,
    closeMobileMenu,
    navigateWithScroll,
    handleScrollFromState,
  };
};

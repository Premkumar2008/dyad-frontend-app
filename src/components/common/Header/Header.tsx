/**
 * Header component
 * Main header with navigation, logo, and mobile menu toggle
 */

import React from 'react';
import { Menu } from 'lucide-react';
import { NavigationItem } from '../../../types/landing';
import { DesktopNavigation } from '../Navigation/DesktopNavigation';
import { MobileMenu } from '../Navigation/MobileMenu';

interface HeaderProps {
  navigationItems: NavigationItem[];
  activeMenu: string;
  hoveredMenu: string | null;
  isMobileMenuOpen: boolean;
  onMenuClick: (item: string) => void;
  onMenuHover: (item: string | null) => void;
  onMobileMenuToggle: () => void;
  onMobileMenuClose: () => void;
  logoSrc?: string;
  logoAlt?: string;
}

export const Header: React.FC<HeaderProps> = ({
  navigationItems,
  activeMenu,
  hoveredMenu,
  isMobileMenuOpen,
  onMenuClick,
  onMenuHover,
  onMobileMenuToggle,
  onMobileMenuClose,
  logoSrc = '/assets/images/logo_main.png',
  logoAlt = 'Dyad Logo',
}) => {
  return (
    <header className="main-header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">
          <img src={logoSrc} alt={logoAlt} className="logo-image" />
        </div>

        {/* Desktop Navigation */}
        <DesktopNavigation
          navigationItems={navigationItems}
          activeMenu={activeMenu}
          hoveredMenu={hoveredMenu}
          onMenuClick={onMenuClick}
          onMenuHover={onMenuHover}
        />

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={onMobileMenuToggle}
          aria-label="Toggle mobile menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={onMobileMenuClose}
        navigationItems={navigationItems}
        activeMenu={activeMenu}
        onMenuClick={onMenuClick}
      />
    </header>
  );
};

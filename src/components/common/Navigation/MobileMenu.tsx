/**
 * Mobile menu component
 * Handles mobile navigation menu with dropdown support
 */

import React from 'react';
import { X } from 'lucide-react';
import { NavigationItem } from '../../../types/landing';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  activeMenu: string;
  onMenuClick: (item: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navigationItems,
  activeMenu,
  onMenuClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="mobile-menu-overlay" onClick={onClose}>
      <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-menu-header">
          <button className="mobile-menu-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="mobile-navigation">
          {navigationItems.map((item) => (
            <div key={item.name} className="mobile-nav-item">
              <button
                className={`mobile-nav-link ${activeMenu === item.name ? 'active' : ''}`}
                onClick={() => {
                  onMenuClick(item.name);
                  onClose();
                }}
              >
                {item.name}
              </button>
              
              {item.hasDropdown && item.dropdownItems && (
                <div className="mobile-dropdown">
                  {item.dropdownItems.map((dropdownItem) => (
                    <a
                      key={dropdownItem.link}
                      href={dropdownItem.link}
                      className="mobile-dropdown-item"
                      onClick={onClose}
                    >
                      <div className="mobile-dropdown-title">{dropdownItem.title}</div>
                      <div className="mobile-dropdown-description">
                        {dropdownItem.description}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

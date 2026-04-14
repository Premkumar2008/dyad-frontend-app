/**
 * Desktop navigation component
 * Handles desktop navigation with dropdown support
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { NavigationItem } from '../../../types/landing';
import { useDropdown } from '../../../hooks/useDropdown';

interface DesktopNavigationProps {
  navigationItems: NavigationItem[];
  activeMenu: string;
  hoveredMenu: string | null;
  onMenuClick: (item: string) => void;
  onMenuHover: (item: string | null) => void;
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  navigationItems,
  activeMenu,
  hoveredMenu,
  onMenuClick,
  onMenuHover,
}) => {
  return (
    <nav className="desktop-navigation">
      {navigationItems.map((item) => {
        const isHovered = hoveredMenu === item.name;
        const hasDropdown = item.hasDropdown && item.dropdownItems;
        
        return (
          <div
            key={item.name}
            className="nav-item"
            onMouseEnter={() => onMenuHover(item.name)}
            onMouseLeave={() => onMenuHover(null)}
          >
            <a
              href={item.href}
              className={`nav-link ${activeMenu === item.name ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                onMenuClick(item.name);
              }}
            >
              {item.name}
              {hasDropdown && (
                <ChevronDown
                  size={16}
                  className={`nav-dropdown-icon ${isHovered ? 'open' : ''}`}
                />
              )}
            </a>
            
            {hasDropdown && (
              <div className={`nav-dropdown ${isHovered ? 'open' : ''}`}>
                <div className="nav-dropdown-content">
                  {item.dropdownItems!.map((dropdownItem) => (
                    <a
                      key={dropdownItem.link}
                      href={dropdownItem.link}
                      className="nav-dropdown-item"
                    >
                      <div className="nav-dropdown-title">{dropdownItem.title}</div>
                      <div className="nav-dropdown-description">
                        {dropdownItem.description}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

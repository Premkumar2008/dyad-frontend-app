/**
 * Footer component
 * Main footer with company information, links, and contact details
 */

import React from 'react';
import { FooterColumn } from '../../../types/landing';

interface FooterProps {
  columns: FooterColumn[];
  companyName?: string;
  copyrightText?: string;
  legalLinks?: Array<{ text: string; href: string }>;
}

export const Footer: React.FC<FooterProps> = ({
  columns,
  companyName = 'DYAD Practice Solutions',
  copyrightText = 'All rights reserved',
  legalLinks = [
    { text: 'Privacy Policy', href: '/privacy-policy' },
    { text: 'Terms of Service', href: '/terms-of-service' },
    { text: 'Mobile Terms', href: '/mobile-terms' },
    { text: 'Mobile Privacy Policy', href: '/mobile-privacy-policy' },
  ],
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Footer Columns */}
        <div className="footer-content">
          {columns.map((column, index) => (
            <div key={index} className="footer-column">
              <h3 className="footer-column-title">{column.title}</h3>
              
              {column.type === 'links' ? (
                <ul className="footer-menu">
                  {column.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <a href={item.href}>{item.text}</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="footer-contact-info">
                  {column.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="contact-item">
                      {item.icon && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="contact-icon"
                        >
                          {/* Render icon based on type or use provided SVG */}
                          <path d={item.icon} />
                        </svg>
                      )}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>
              &copy; {currentYear} {companyName}. {copyrightText}.
            </p>
          </div>
          <div className="footer-bottom-right">
            <ul className="footer-legal-menu">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href}>{link.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

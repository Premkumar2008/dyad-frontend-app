/**
 * About section component
 * Main about section with cards grid and mobile view
 */

import React from 'react';
import { AboutContentItem } from '@/types/landing';
import { AboutCard } from './AboutCard';
import { MobileAboutCard } from './MobileAboutCard.tsx';

interface AboutSectionProps {
  aboutContent: AboutContentItem[];
  expandedCard: AboutContentItem | null;
  activeCardId: number | null;
  onCardExpand: (item: AboutContentItem) => void;
  onCardActiveChange: (id: number | null) => void;
  onPopupClose: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  aboutContent,
  expandedCard,
  activeCardId,
  onCardExpand,
  onCardActiveChange,
  onPopupClose,
}) => {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-header">
          <h2 className="about-title">About Dyad Practice Solutions</h2>
          <p className="about-subtitle">
            Empowering healthcare practices with integrated solutions and operational excellence
          </p>
        </div>

        {/* Desktop Cards Grid */}
        <div className="about-cards-grid">
          {aboutContent.map((item) => (
            <AboutCard
              key={item.id}
              item={item}
              isExpanded={expandedCard?.id === item.id}
              onExpand={onCardExpand}
              isActive={activeCardId === item.id}
              onActiveChange={onCardActiveChange}
            />
          ))}
        </div>

        {/* Mobile Cards */}
        <div className="mobile-cards-section">
          <div className="mobile-cards-container">
            {aboutContent.map((item) => (
              <MobileAboutCard
                key={item.id}
                item={item}
                isExpanded={expandedCard?.id === item.id}
                onExpand={onCardExpand}
              />
            ))}
          </div>
        </div>
      </div>

      {/* About Popup */}
      {expandedCard && (
        <div className="about-popup-overlay" onClick={onPopupClose}>
          <div className="about-popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="about-popup-header">
              <div className="about-popup-left">
                <h2 className="about-popup-title">{expandedCard.title}</h2>
                <p className="about-popup-subtitle">{expandedCard.subtitle}</p>
              </div>
              <button className="about-popup-close" onClick={onPopupClose}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="about-popup-body">
              <div className="about-popup-description">
                <p>{expandedCard.paragraph}</p>
              </div>
              {expandedCard.features && (
                <div className="about-popup-features">
                  <ul>
                    {expandedCard.features.map((feature, index) => (
                      <li key={index} className="feature-item">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 622 622"
                          width="17"
                          height="17"
                          aria-hidden="true"
                          fill="none"
                        >
                          <path
                            d="M311 0C139.4 0 0 139.4 0 311s139.4 311 311 311 311-139.4 311-311S482.6 0 311 0zm0 566.7c-141.3 0-255.7-114.4-255.7-255.7S169.7 55.3 311 55.3 566.7 169.7 566.7 311 452.3 566.7 311 566.7z"
                            fill="#4F46E5"
                          />
                          <path
                            d="M446.7 233.4L311 369.1 175.3 233.4c-10.8-10.8-28.3-10.8-39.1 0s-10.8 28.3 0 39.1l155.8 155.8c10.8 10.8 28.3 10.8 39.1 0l155.8-155.8c10.8-10.8 10.8-28.3 0-39.1s-28.3-10.8-39.2 0z"
                            fill="#4F46E5"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

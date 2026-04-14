/**
 * Mobile about card component
 * Mobile-optimized about card with expand/collapse functionality
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { AboutContentItem } from '@/types/landing';

interface MobileAboutCardProps {
  item: AboutContentItem;
  isExpanded: boolean;
  onExpand: (item: AboutContentItem) => void;
}

export const MobileAboutCard: React.FC<MobileAboutCardProps> = ({
  item,
  isExpanded,
  onExpand,
}) => {
  const handleCardClick = () => {
    onExpand(item);
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExpand(item);
  };

  return (
    <div
      className={`mobile-card ${isExpanded ? 'expanded' : ''}`}
      onClick={handleCardClick}
    >
      <div className="mobile-card-image">
        <img src={item.image} alt={item.title} />
      </div>
      
      <div className="mobile-card-content">
        <div className="mobile-card-header">
          <div className="mobile-card-title-subtitle">
            <h3 className="mobile-card-title">{item.title}</h3>
            <p className="mobile-card-subtitle">{item.subtitle}</p>
          </div>
          <div className="mobile-card-arrow">
            <div className="mobile-arrow-circle" onClick={handleExpandClick}>
              <ChevronDown
                size={24}
                className={`arrow-icon ${isExpanded ? 'expanded' : ''}`}
              />
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mobile-card-expanded">
            <div className="mobile-card-description">
              <p>{item.paragraph}</p>
            </div>
            
            {item.features && (
              <div className="mobile-card-features">
                <ul>
                  {item.features.map((feature, index) => (
                    <li key={index} className="mobile-feature-item">
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
        )}
      </div>
    </div>
  );
};

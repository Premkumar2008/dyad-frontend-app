/**
 * About card component
 * Individual about section card with expandable details
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { AboutContentItem } from '@/types/landing';

interface AboutCardProps {
  item: AboutContentItem;
  isExpanded: boolean;
  onExpand: (item: AboutContentItem) => void;
  isActive: boolean;
  onActiveChange: (id: number | null) => void;
}

export const AboutCard: React.FC<AboutCardProps> = ({
  item,
  isExpanded,
  onExpand,
  isActive,
  onActiveChange,
}) => {
  const handleCardClick = () => {
    onActiveChange(item.id);
    onExpand(item);
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExpand(item);
  };

  return (
    <div
      className={`about-card ${isActive ? 'active' : ''}`}
      onClick={handleCardClick}
    >
      <div className="about-card-content">
        <div className="about-card-image">
          <img src={item.image} alt={item.title} />
        </div>
        
        <div className="about-card-text">
          <div className="about-card-header">
            <h3 className="about-card-title">{item.title}</h3>
            <p className="about-card-subtitle">{item.subtitle}</p>
          </div>
          
          <div className="about-card-arrow">
            <div className="arrow-circle" onClick={handleExpandClick}>
              <ChevronRight size={24} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="about-card-paragraph">
        <p>{item.paragraph}</p>
      </div>
    </div>
  );
};

/**
 * Hero section component
 * Main landing hero with title, subtitle, and call-to-action buttons
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description?: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
  backgroundImage?: string;
  videoSrc?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick,
  backgroundImage,
  videoSrc,
}) => {
  return (
    <section className="hero-section">
      <div className="hero-background">
        {videoSrc ? (
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          backgroundImage && (
            <img
              src={backgroundImage}
              alt="Hero background"
              className="hero-image"
            />
          )
        )}
      </div>

      <div className="hero-content">
        <div className="hero-container">
          <div className="hero-text">
            <h1 className="hero-title">{title}</h1>
            <h2 className="hero-subtitle">{subtitle}</h2>
            {description && (
              <p className="hero-description">{description}</p>
            )}
          </div>

          <div className="hero-actions">
            <button
              className="hero-button primary"
              onClick={onPrimaryClick}
            >
              {primaryButtonText}
              <ArrowRight size={20} className="button-icon" />
            </button>
            
            <button
              className="hero-button secondary"
              onClick={onSecondaryClick}
            >
              {secondaryButtonText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

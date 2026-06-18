import React, { useEffect } from 'react';
import LandingHeader from '../components/common/LandingHeader/LandingHeader';
import LandingFooter from '../components/common/LandingFooter/LandingFooter';
import { leadershipData, teamExpertiseIntro } from '../constants/leadershipData';
import '../components/DyadLanding.css';
import './team-expertise.css';

const TeamExpertise: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="dyad-landing-container team-expertise-page">
      <LandingHeader activePage="About Us" />

      <section className="leadership-section" id="leadership">
        <div className="leadership-container">
          <div className="leadership-header">
            <h1 className="leadership-title">Team &amp; Expertise</h1>
            <p className="leadership-subtitle">{teamExpertiseIntro}</p>
          </div>
          <div className="leadership-grid">
            {leadershipData.map((leader, index) => (
              <div
                key={leader.id}
                className={`leadership-card ${index % 2 === 1 ? 'reversed' : ''}`}
              >
                <div className="leadership-image">
                  <img src={leader.image} alt={leader.name} data-mobile-src={leader.mobileImage} />
                </div>
                <div className="leadership-content">
                  <h2 className="leader-name">{leader.name}</h2>
                  <p className="leader-title">{leader.title}</p>
                  <p className="leader-description">{leader.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default TeamExpertise;

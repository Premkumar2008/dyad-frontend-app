import React from 'react';
import { Link } from 'react-router-dom';
import './LandingFooter.css';

const LandingFooter: React.FC = () => {
  return (
    <footer className="footer-section" id="contact">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-column">
            <div className="footer-logo">
              <img src="/assets/images/dyadmain-logofooter.svg" alt="Dyad Logo" />
            </div>
            <p className="footer-description" style={{ textAlign: 'justify' }}>
              Dyad is a fully integrated healthcare finance operations platform for anesthesia, ambulatory surgery centers, and the surgical specialties that operate within them, built on bank-grade infrastructure. We replace fragmented vendors with a single operating layer powered by deep industry expertise, advanced technologies, and institutional-grade risk controls, delivering end-to-end precision. One platform for independent practices, physician groups, private equity-backed portfolios, and managed services organizations. Truly integrated. Exponentially scalable.
            </p>
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">Services</h3>
            <ul className="footer-menu">
              <li><a href="#services">Practice Foundations</a></li>
              <li><a href="#services">Technology Driven Capabilities</a></li>
              <li><a href="#services">Pre &amp; Post Encounter</a></li>
              <li><a href="#services">Claims Management</a></li>
              <li><a href="#services">Specialty Billing</a></li>
              <li><a href="#services">Real Time Insights</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">Specialties</h3>
            <ul className="footer-menu">
              <li><a href="#surgical-specialties">Surgical &amp; Procedural Specialties</a></li>
              <li><a href="#interventional-care">Interventional &amp; Diagnostic Care</a></li>
              <li><a href="#perioperative-services">Perioperative &amp; Supportive Services</a></li>
              <li><a href="#outpatient-facilities">Outpatient &amp; Specialty Facilities</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">Contact</h3>
            <div className="footer-contact-info">
              <div className="contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail w-6 h-6 mr-3">
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                <span>info@dyadmd.com</span>
              </div>
              <div className="contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin w-6 h-6 mr-3">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>2573 Pacific Coast Hwy, Suite A277<br />Torrance, CA 90505</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>&copy; 2026 DYAD Practice Solutions. All rights reserved.</p>
          </div>
          <div className="footer-bottom-right">
            <ul className="footer-legal-menu">
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service">Terms of Service</Link></li>
              <li><Link to="/mobile-terms">Mobile Terms</Link></li>
              <li><Link to="/mobile-privacy-policy">Mobile Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;

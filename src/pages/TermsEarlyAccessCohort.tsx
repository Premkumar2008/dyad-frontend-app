import React, { useEffect } from 'react';
import LandingHeader from '../components/common/LandingHeader/LandingHeader';
import LandingFooter from '../components/common/LandingFooter/LandingFooter';
import './TermsEarlyAccessCohort.css';

const cohortTermRows: { label: string; value: React.ReactNode }[] = [
  {
    label: 'MONTHS 1–6',
    value: (
      <>
        <strong className="teac-row-highlight">No platform fees.</strong> Full access to all
        integrated services described in your commercial proposal.
      </>
    ),
  },
  {
    label: 'MONTHS 7–12',
    value: (
      <>
        <strong className="teac-row-highlight">Preferred rate</strong> reflecting your
        contribution as an Early Release Cohort partner. Specific terms set forth in the Master
        Services Agreement.
      </>
    ),
  },
  {
    label: 'MONTH 13+',
    value:
      'Standard commercial terms apply, at the Tier-based pricing established in your proposal. The preferred rate does not extend beyond the first twelve months.',
  },
  {
    label: 'FEEDBACK',
    value:
      'Feedback will be gathered weekly in an organized and coordinated manner; this may require written feedback or feedback in a collaborative virtual feedback session.',
  },
  {
    label: 'COHORT OPT-OUT',
    value:
      'Participation in the Early Release Cohort feedback program is voluntary. A cohort partner electing to discontinue cohort participation will have the option to convert to standard commercial terms in accordance with the Master Services Agreement, including any applicable rate adjustments and provisions set forth therein.',
  },
];

const TermsEarlyAccessCohort: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="teac-container">
      <LandingHeader />
      <main className="teac-main">
        <div className="teac-content">
          <div className="teac-page-header">
            <h1 className="teac-title">Early Release Cohort Terms</h1>
            <p className="teac-subtitle">
              Selected providers will receive Dyad's full platform and services{' '}
              <span className="teac-highlight">at no cost for the first six months</span>. As an
              Early Release Cohort Partner, you have an opportunity to shape how the platform
              works for you.
            </p>
          </div>

          <div className="teac-card">
            <div className="teac-table">
              {cohortTermRows.map((row) => (
                <div key={row.label} className="teac-row">
                  <span className="teac-row-label">{row.label}</span>
                  <span className="teac-row-value">{row.value}</span>
                </div>
              ))}
            </div>

           
          </div>

          
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default TermsEarlyAccessCohort;

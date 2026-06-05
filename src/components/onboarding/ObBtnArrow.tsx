import React from 'react';

export const trimBtnArrow = (text: string) =>
  text.replace(/\s*[→←✓]\s*$/, '').trim();

/** Thin line arrow — matches Begin Enrollment reference */
export const ObArrowRight: React.FC = () => (
  <svg
    className="ob-btn-arrow ob-btn-arrow-right"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden
  >
    <path
      d="M2.5 8h10M8.5 4.5L12.5 8 8.5 11.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ObArrowLeft: React.FC = () => (
  <svg
    className="ob-btn-arrow ob-btn-arrow-left"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden
  >
    <path
      d="M13.5 8H3.5M7.5 4.5L3.5 8 7.5 11.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ObForwardButtonLabel: React.FC<{
  label: string;
  loading?: boolean;
  loadingLabel?: string;
  showArrow?: boolean;
}> = ({ label, loading, loadingLabel = 'Saving…', showArrow = true }) => {
  if (loading) {
    return (
      <>
        <span className="ob-btn-spinner" aria-hidden />
        {loadingLabel}
      </>
    );
  }
  return (
    <>
      {trimBtnArrow(label)}
      {showArrow && <ObArrowRight />}
    </>
  );
};

export const ObBackButtonLabel: React.FC<{ label?: string }> = ({ label = 'Previous Step' }) => (
  <>
    <ObArrowLeft />
    {trimBtnArrow(label.replace(/^←\s*/, ''))}
  </>
);

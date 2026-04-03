import React from 'react';
import { useNavigate } from 'react-router-dom';

const ComingSoon: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    // Clear all auth tokens
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
    // Force page reload to ensure auth state is reset
    window.location.reload();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Logo */}
      <img 
        src="/assets/images/logo_main.png" 
        alt="Dyad Logo" 
        style={{
          height: '60px',
          width: 'auto',
          marginBottom: '30px'
        }}
      />

      <h1 style={{
        color: '#1D6DD8',
        fontSize: '3rem',
        marginBottom: '20px'
      }}>
        Coming Soon!
      </h1>

      <p style={{
        color: '#666',
        fontSize: '1.2rem',
        marginBottom: '40px'
      }}>
        Page is under construction
      </p>

      <span
        onClick={handleBackToHome}
        style={{
          color: '#1D6DD8',
          fontSize: '1.1rem',
          fontWeight: '500',
          cursor: 'pointer',
          textDecoration: 'underline'
        }}
      >
        Back to Home
      </span>
    </div>
  );
};

export default ComingSoon;

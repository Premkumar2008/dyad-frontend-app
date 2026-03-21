import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const SimpleLogoutButton: React.FC = () => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      await logout({
        showNotification: true,
        reason: 'user_initiated',
        redirectPath: '/login'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return null; // Don't show logout button if not logged in
  }

  return (
    <div style={{ padding: '20px' }}>
      <p>Logged in as: {user.email} ({user.role})</p>
      <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Log Out
      </button>
    </div>
  );
};

export default SimpleLogoutButton;

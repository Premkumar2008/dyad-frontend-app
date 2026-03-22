import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LogoutButtonProps {
  variant?: 'button' | 'dropdown-item';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = 'button', 
  className = '',
  showIcon = true,
  children 
}) => {
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      'Are you sure you want to log out? Any unsaved work will be lost.'
    );
    
    if (isConfirmed) {
      try {
        await logout({
          showNotification: true,
          reason: 'user_initiated',
          redirectPath: '/login'
        });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  if (variant === 'dropdown-item') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`
          w-full text-left px-4 py-2 text-sm text-gray-700 
          hover:bg-gray-100 hover:text-gray-900
          flex items-center gap-2 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {showIcon && <LogOut className="w-4 h-4" />}
        {children || 'Log Out'}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-red-600 text-white rounded-lg
        hover:bg-red-700 focus:outline-none focus:ring-2 
        focus:ring-red-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
    >
      {showIcon && (
        isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <LogOut className="w-4 h-4" />
        )
      )}
      {children || (
        <>
          {isLoading ? 'Logging out...' : 'Log Out'}
        </>
      )}
    </button>
  );
};

export default LogoutButton;

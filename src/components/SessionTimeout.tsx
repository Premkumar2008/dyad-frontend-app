import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import SecureSessionStorage from '../utils/sessionStorage';

interface SessionTimeoutProps {
  onSessionExpired?: () => void;
}

const SessionTimeout: React.FC<SessionTimeoutProps> = ({ onSessionExpired }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  // Handle session expiration
  const handleSessionExpired = useCallback(() => {
    // Prevent multiple redirects
    if (isRedirecting) {
      return;
    }
    
    setIsRedirecting(true);
    SecureSessionStorage.clearSession();
    
    // Import and use the enhanced logout function
    import('../contexts/AuthContext').then(({ useAuth }) => {
      const { logout } = useAuth();
      logout({
        showNotification: true,
        reason: 'session_expired',
        redirectPath: '/login?reason=session_expired'
      });
    }).catch(error => {
      console.error('Failed to logout:', error);
      // Fallback to basic redirect
      window.location.href = '/login?reason=session_expired';
    });
  }, [isRedirecting]);

  // Extend session
  const extendSession = useCallback(() => {
    SecureSessionStorage.refreshSession();
    setIsOpen(false);
    setIsWarning(false);
    setCountdown(0);
    toast.success('Session extended successfully.');
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && isOpen) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && isOpen) {
      handleSessionExpired();
    }
  }, [countdown, isOpen, handleSessionExpired]);

  // Session monitoring - temporarily disabled for debugging
  useEffect(() => {
    console.log('SessionTimeout component mounted - monitoring disabled for debugging');
    return () => {
      console.log('SessionTimeout component unmounted');
    };
  }, []);

  // Format countdown time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          {isWarning ? (
            <>
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Session Expiring Soon</h2>
            </>
          ) : (
            <>
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Session Expired</h2>
            </>
          )}
        </div>
        
        <div className="mb-6">
          {isWarning ? (
            <div>
              <p className="text-gray-700 mb-3">
                Your session will expire in <span className="font-bold text-blue-600">{formatTime(countdown)}</span>.
              </p>
              <p className="text-gray-600">
                To continue working, please extend your session. Otherwise, you will be automatically logged out.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-700 mb-3">
                Your session has expired due to inactivity.
              </p>
              <p className="text-gray-600">
                Please log in again to continue using the application.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          {isWarning ? (
            <>
              <button 
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                onClick={extendSession}
              >
                Extend Session
              </button>
              <button 
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                onClick={handleSessionExpired}
              >
                Logout Now
              </button>
            </>
          ) : (
            <button 
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionTimeout;

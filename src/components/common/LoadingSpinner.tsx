/**
 * Loading Spinner component
 * Consistent loading states across the application
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  message,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'border-blue-600',
    secondary: 'border-gray-600',
    white: 'border-white',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50'
    : 'flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        <div
          className={`
            ${sizeClasses[size]} 
            ${colorClasses[color]}
            border-2 border-t-transparent
            rounded-full
            animate-spin
          `}
        />
        {message && (
          <p className="text-gray-600 text-sm font-medium animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

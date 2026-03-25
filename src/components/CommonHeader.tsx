import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

interface CommonHeaderProps {
  title?: string;
  subtitle?: string;
  showAuth?: boolean;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({ 
  title = 'DYAD PRACTICE SOLUTIONS', 
  subtitle = 'Healthcare Excellence Through Innovation',
  showAuth = true 
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout({ showNotification: true, reason: 'user_initiated' });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigationItems = [
    { name: 'Home', href: '#top' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Leadership', href: '#leadership' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="md" textColor="dark" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-gray-700 hover:text-[#1D6DD8] px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.href ? 'border-b-2 border-[#1D6DD8]' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Links */}
          {showAuth && (
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="user-profile">
                    <span className="user-name">{user.name}</span>
                    <button 
                      onClick={handleLogout}
                      className="text-gray-700 hover:text-[#1D6DD8] px-3 py-2 text-sm font-medium transition-colors duration-200"
                    >
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-[#1D6DD8] px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#1D6DD8] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors duration-200"
                  >
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Mobile menu button - could be expanded later if needed */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-[#1D6DD8] p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonHeader;

import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = () => {
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
            <Link
              to="/"
              className="text-gray-700 hover:text-[#1D6DD8] px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/#about"
              className="text-gray-700 hover:text-[#1D6DD8] px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              About
            </Link>
            <Link
              to="/#services"
              className="text-gray-700 hover:text-[#1D6DD8] px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Services
            </Link>
            <Link
              to="/#contact"
              className="text-gray-700 hover:text-[#1D6DD8] px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Contact
            </Link>
          </nav>

          {/* Auth Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-[#1D6DD8] px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-[#1D6DD8] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors duration-200"
            >
              Register
            </Link>
          </div>

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

export default AuthHeader;

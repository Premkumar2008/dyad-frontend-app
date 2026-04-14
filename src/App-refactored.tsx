/**
 * Refactored App component
 * Clean architecture with proper error boundaries and performance optimization
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import { initializeSecurity } from './utils/security';
import { SecurityMonitor } from './utils/securityMonitor';
import { log } from './utils/logger';

// Lazy load components for better performance
const DyadLanding = lazy(() => import('./components/landing/DyadLandingRefactored').then(module => ({ default: module.DyadLandingRefactored })));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const OTPVerification = lazy(() => import('./pages/OTPVerification'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const AboutUsDetail = lazy(() => import('./pages/about-us-detail'));
const ServiceDetail = lazy(() => import('./pages/service-detail'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));

// Initialize security measures on app startup
const initializeApp = () => {
  try {
    initializeSecurity();
    SecurityMonitor.initializeSecurityMonitoring();
    log.info('Application initialized successfully', 'App');
  } catch (error) {
    log.error('Failed to initialize application', 'App', error);
  }
};

// Initialize app
initializeApp();

/**
 * Main App component with error boundaries and lazy loading
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          {/* Main application routes */}
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<DyadLanding />} />
              <Route path="/dyadlanding-new" element={<DyadLanding />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<OTPVerification />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/about-us-details" element={<AboutUsDetail />} />
              <Route path="/service-details" element={<ServiceDetail />} />
              <Route path="/coming-soon" element={<ComingSoon />} />

              {/* Protected admin routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected user routes */}
              <Route
                path="/user/*"
                element={
                  <ProtectedRoute requiredRole="user">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<ComingSoon />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;

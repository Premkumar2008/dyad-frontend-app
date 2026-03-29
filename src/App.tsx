import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DyadLanding from './components/DyadLanding';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerification from './pages/OTPVerification';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import TestDashboard from './pages/TestDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ContactUs from './pages/ContactUs';
import { initializeSecurity } from './utils/security';
import SecurityMonitor from './utils/securityMonitor';
import ComingSoon from './pages/ComingSoon';
import AboutUsDetail from './pages/about-us-detail';
import ServiceDetail from './pages/service-detail';

// Initialize security measures on app startup
initializeSecurity();
SecurityMonitor.initializeSecurityMonitoring();

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
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
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/*" 
              element={<ComingSoon />} 
            />
            {/* Temporary test route - remove in production */}
            <Route path="/test-dashboard" element={<ClientDashboard />} />
            <Route path="/simple-test" element={<TestDashboard />} />
          </Routes>
        </div>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              padding: '12px 16px',
              maxWidth: 'calc(100vw - 32px)',
              margin: '0 16px',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
              style: {
                background: '#059669',
                color: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              style: {
                background: '#dc2626',
                color: '#fff',
              },
            },
            loading: {
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;

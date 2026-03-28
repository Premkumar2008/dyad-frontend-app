import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginFormData } from '../types/auth';
import toast from 'react-hot-toast';
import "../pages/login.css";


const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
  rememberMe: yup.boolean().default(false),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const { login, isLoading, user } = useAuth();

  const handleLogoClick = () => {
    navigate('/');
  };

  // const from = location.state?.from?.pathname || '/'; // Reserved for future redirect functionality

  // Handle redirection when user state changes
  useEffect(() => {
    console.log('Login useEffect - User state changed:', user);
    console.log('Login useEffect - User role:', user?.role);
    console.log('Login useEffect - Should redirect:', !!user);
    
    if (user) {
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
      console.log('Login useEffect - Redirecting to:', redirectPath);
      
      // Force navigation with a small delay to ensure state is settled
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      const result = await login(data.email, data.password);
      
      if (result.success) {
        // Wait a moment for user state to update, then redirect manually
        setTimeout(() => {
          console.log('Manual redirect check - current user:', user);
          if (user) {
            const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
            console.log('Manual redirect to:', redirectPath);
            navigate(redirectPath, { replace: true });
          } else {
            console.log('No user state available, using fallback');
            // Fallback redirect to user dashboard
            navigate('/user/dashboard', { replace: true });
          }
        }, 1000);
      } else if (result.needsVerification) {
        // Redirect to OTP verification page
        console.log('Redirecting to OTP verification for:', result.needsVerification.email);
        navigate('/verify-otp', { 
          state: { email: result.needsVerification.email },
          replace: true 
        });
      } else if (result.needsRegistration) {
        // Redirect to register page with pre-filled data
        console.log('Redirecting to register with pre-filled data for:', result.needsRegistration.email);
        navigate('/register', { 
          state: { 
            email: result.needsRegistration.email,
            prefillData: result.needsRegistration.prefillData,
            message: 'Your email is not verified. Please complete registration to verify your email.'
          },
          replace: true 
        });
      } else {
        // Show error only in form (toast is handled by AuthContext)
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="login-form-container">
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="login-form-box">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
             
              <div className="dyad-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img 
              src="/assets/images/dyadmain-ogo.svg" 
              alt="Dyad Logo" 
              className="logo-image"
            />
          </div>
            </div>
         
          </div>

             <h3 className="text-2xl font-medium text-gray-900">Login</h3>
             <br />

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Enter email"
                  className="input-field"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  className="input-field pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Register now
                </Link>
              </span>
            </div>
            <br />
            
            {/* Back to Home Link */}
            <div className="text-center">
              <Link
                to="/"
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                ← Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

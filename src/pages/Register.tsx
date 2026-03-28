import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RegisterFormData } from '../types/auth';
import '../pages/register.css';

const registerSchema = yup.object().shape({
  npi: yup.string().required('NPI is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  phone: yup.string().required('Phone number is required'),
  countryCode: yup.string().required('Country code is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [infoMessage, setInfoMessage] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      email: location.state?.email || '',
      firstName: '',
      lastName: '',
      phone: '',
      countryCode: '+1',
      npi: '',
      password: '',
    }
  });

  // Check for pre-filled data from login redirect
  React.useEffect(() => {
    const state = location.state;
    if (state?.prefillData) {
      // Pre-fill form data (except password)
      const prefillData = state.prefillData;
      Object.keys(prefillData).forEach(key => {
        if (key !== 'password' && prefillData[key]) {
          setValue(key as keyof RegisterFormData, prefillData[key]);
        }
      });
      
      if (state.message) {
        setInfoMessage(state.message);
      }
    } else {
      // Check localStorage for pre-filled data
      const prefillDataStr = localStorage.getItem('prefillRegistrationData');
      if (prefillDataStr) {
        try {
          const prefillData = JSON.parse(prefillDataStr);
          Object.keys(prefillData).forEach(key => {
            if (key !== 'password' && prefillData[key]) {
              setValue(key as keyof RegisterFormData, prefillData[key]);
            }
          });
          setInfoMessage('Your email is not verified. Please complete registration to verify your email.');
          // Clear localStorage after using
          localStorage.removeItem('prefillRegistrationData');
        } catch (error) {
          console.error('Error parsing pre-fill data:', error);
        }
      }
    }
  }, [location.state, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      const result = await registerUser(data);
      
      if (result.success) {
        // Redirect to OTP verification page
        navigate('/verify-otp', { state: { email: data.email } });
      } else if (result.needsVerification) {
        // Redirect to OTP verification page for existing unverified user
        navigate('/verify-otp', { state: { email: result.needsVerification.email } });
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    }
  };
    const handleLogoClick = () => {
    navigate('/');
  };


  return (
    <div className="register-container">
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 mb-8">
        <div className="register-form-box">
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

 <h3 className="text-2xl font-medium text-gray-900">Register</h3>
 <div className="register-subtitle">
  Join our network of surgical specialists, proceduralists, and outpatient facilities. Register today to explore how Dyad can support your practice with integrated services, operational expertise, and technology-driven solutions.
 </div>
 <br />
          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Info Message */}
            {infoMessage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">{infoMessage}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* NPI Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NPI
              </label>
              <input
                {...register('npi')}
                type="text"
                placeholder="Enter NPI"
                className="input-field"
                disabled={isLoading}
              />
              {errors.npi && (
                <p className="mt-1 text-sm text-red-600">{errors.npi.message}</p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  placeholder="First name"
                  className="input-field"
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  placeholder="Last name"
                  className="input-field"
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <div className="flex space-x-2">
                <div className="relative">
                  <select
                    {...register('countryCode')}
                    className="input-field appearance-none pr-8"
                    disabled={isLoading}
                    defaultValue="+1"
                  >
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+91">🇮🇳 +91</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="relative flex-1">
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="Enter phone number"
                    className="input-field"
                    disabled={isLoading}
                  />
                </div>
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

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

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <br />

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Registering...
                </div>
              ) : (
                'Register'
              )}
            </button>
            <br />

            {/* Login Link */}
             <br />
            <div className="text-center">
              <span className="text-md text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Login now
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

export default Register;

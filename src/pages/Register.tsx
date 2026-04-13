import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import "../pages/login-new.css";

// Define the form type directly
interface RegisterFormData {
  npi: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}

const registerSchema = yup.object().shape({
  npi: yup.string().required('NPI is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  phone: yup.string().required('Phone number is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

// Carousel images for the right side
const carouselImages = [
  {
    url: '/assets/images/loginbanner1.jpeg',
    title: 'Healthcare Excellence',
    description: 'Transforming healthcare operations with innovative solutions'
  },
  {
    url: '/assets/images/loginbanner2.jpeg',
    title: 'Partnership Model',
    description: 'Building strong partnerships for better healthcare outcomes'
  },
  {
    url: '/assets/images/loginbanner3.jpeg',
    title: 'Technology Driven',
    description: 'Leveraging cutting-edge technology for healthcare efficiency'
  }
];

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [infoMessage, setInfoMessage] = useState<string>('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, isLoading } = useAuth();

  const handleLogoClick = () => {
    navigate('/');
  };

  // Auto-sliding carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema) as any,
    defaultValues: {
      email: location.state?.email || '',
      firstName: '',
      lastName: '',
      phone: '',
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
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPreviousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  return (
    <div className="login-page-container">
      <div className='login-page-holder'>
      {/* Left Side - Register Form */}
      <div className="login-form-section register-box">
        <div className="login-form-content">

          <h3 className="text-2xl font-medium text-gray-900 mb-2">Register</h3>
 <div className='form-container-login register' >
            <p className="text-gray-600 mb-8">Join our network of surgical specialists, proceduralists, and outpatient facilities. Register today to explore how Dyad can support your practice with integrated services, operational expertise, and technology-driven solutions.</p>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {/* NPI and First Name in one row */}
            <div className="form-row">
              <div className="form-field">
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

              <div className="form-field">
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
            </div>

            {/* Last Name and Phone in one row */}
            <div className="form-row">
              <div className="form-field">
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

              <div className="form-field">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <div className="relative">
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="Enter phone number"
                    className="input-field"
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Email in one row */}
            <div className="form-row">
              <div className="form-field full-width">
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
            </div>

            {/* Password in one row */}
            <div className="form-row">
              <div className="form-field full-width">
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
            </div>

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

            {/* Login Link */}
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
            
            {/* Back to Home Link */}
            <div className="text-center">
              <Link
                to="/"
                className="text-md text-gray-500 hover:text-gray-700 font-medium"
              >
                ← Back to Home
              </Link>
            </div>
          </form>
          </div>
        </div>
      </div>

      {/* Right Side - Image Carousel */}
      <div className="login-carousel-section">
        <div className="carousel-container">
          {/* Carousel Images */}
          <div className="carousel-images">
            {carouselImages.map((image, index) => (
              <div
                key={index}
                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                style={{
                  backgroundImage: `url(${image.url})`,
                  opacity: index === currentSlide ? 1 : 0,
                  transform: `translateX(${(index - currentSlide) * 100}%)`
                }}
              />
            ))}
          </div>

          {/* Carousel Content - Removed title and subtitle */}
          <div className="carousel-content">
            {/* Content removed as requested */}
          </div>

          {/* Carousel Indicators */}
          <div className="carousel-indicators">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                className={`carousel-indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Register;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ChevronLeft, ChevronRight, Mail, ArrowLeft, Loader2, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import "../pages/login-new.css";

// Define the form type directly
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface ForgotPasswordFormData {
  email: string;
}

interface ResetPasswordFormData {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface RegisterFormData {
  npi: string;
  npiType: string;
  facilityName: string;
  firstName: string;
  phone: string;
  email: string;
  password: string;
}

const loginSchema = yup.object({
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required')
    .matches(/^[\w-\.]+@([\w-]+\.)+(com|org|net|edu|gov|mil)$/, 'Please enter a valid email address'),
  password: yup.string().required('Password is required'),
  rememberMe: yup.boolean(),
});

const forgotPasswordSchema = yup.object().shape({
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required')
    .matches(/^[\w-\.]+@([\w-]+\.)+(com|org|net|edu|gov|mil)$/, 'Please enter a valid email address'),
});

const resetPasswordSchema = yup.object().shape({
  otp: yup.string().length(6, 'OTP must be 6 digits').required('Verification code is required'),
  newPassword: yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Passwords must match').required('Please confirm your password'),
});

const registerSchema = yup.object().shape({
  npi: yup.string().required('NPI is required').length(10, 'Invalid NPI Number'),
  npiType: yup.string(),
  facilityName: yup.string().when('npiType', {
    is: 'Facility/Group',
    then: (schema) => schema.required('Facility Name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  firstName: yup.string().when('npiType', {
    is: 'Individual',
    then: (schema) => schema.required('First name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  phone: yup.string().required('Phone number is required'),
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required')
    .matches(/^[\w-\.]+@([\w-]+\.)+(com|org|net|edu|gov|mil)$/, 'Please enter a valid email address'),
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

// Inline OTP Verification Component
interface OTPVerificationInlineProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

const OTPVerificationInline: React.FC<OTPVerificationInlineProps> = ({ email, onBack, onSuccess }) => {
  const [error, setError] = useState<string>('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { verifyOTP, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(yup.object({
      otp: yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
    })) as any,
  });

  const otpValue = watch('otp');

  // Handle OTP input change
  const handleOTPChange = (index: number, value: string) => {
    const newOTP = otpValue ? otpValue.split('') : Array(6).fill('');
    newOTP[index] = value;
    const updatedOTP = newOTP.join('');
    setValue('otp', updatedOTP);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-inline-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle key press for backspace
  const handleKeyPress = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValue?.[index] && index > 0) {
      const prevInput = document.getElementById(`otp-inline-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      setValue('otp', pastedData.padEnd(6, ''));
    }
  };

  const onSubmit = async (data: { otp: string }) => {
    try {
      setError('');
      const result = await verifyOTP(email, data.otp);
      
      if (result.success) {
        toast.success('Email verified successfully!', { duration: 7000 });
        onSuccess();
      } else {
        if (result.error?.toLowerCase().includes('already verified') || result.error?.toLowerCase().includes('account exists')) {
          toast('Email is already verified.', { icon: 'ℹ️' });
          onSuccess();
        } else {
          setError(result.error || 'OTP verification failed');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    setResendDisabled(true);
    setCountdown(60);

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // API call to resend OTP would go here
    console.log('Resending OTP to:', email);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Email Info */}
      <div className="text-center">
    
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-medium text-gray-900">{email}</p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* OTP Input Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Enter Verification Code
          </label>
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                id={`otp-inline-${index}`}
                type="text"
                maxLength={1}
                value={otpValue?.[index] || ''}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyPress(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />
            ))}
          </div>
          {errors.otp && (
            <p className="mt-2 text-sm text-red-600 text-center">{errors.otp?.message as string}</p>
          )}
        </div>

        {/* Hidden input for form validation */}
        <input type="hidden" {...register('otp')} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Verify Button */}
        <button
          type="submit"
          disabled={isLoading || otpValue?.length !== 6}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Verifying...
            </div>
          ) : (
            'Verify Email'
          )}
        </button>

        {/* Resend OTP */}
        {/* <div className="text-center">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendDisabled}
            className="text-primary-600 hover:text-primary-500 font-medium disabled:text-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${resendDisabled ? '' : 'animate-spin'}`} />
            {resendDisabled
              ? `Resend code in ${countdown}s`
              : "Didn't receive the code? Resend"}
          </button>
        </div> */}
      </form>
    </div>
  );
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState<string>('');
  const [localLoading, setLocalLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string>('');
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerShowPassword, setRegisterShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string>('');
  const [registerInfoMessage, setRegisterInfoMessage] = useState<string>('');
  const [isNpiValidating, setIsNpiValidating] = useState(false);
  const [npiValidated, setNpiValidated] = useState(false);
  const [npiEnumerationType, setNpiEnumerationType] = useState<string>('');
  const [phoneValue, setPhoneValue] = useState('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpEmail, setOtpEmail] = useState<string>('');
  const { login, isLoading, user, sendPasswordResetOTP, resetPasswordWithOTP, register: registerUser } = useAuth();

  const handleLogoClick = () => {
    navigate('/');
  };

  // Auto-sliding carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 8000); // Change slide every 8 seconds

    return () => clearInterval(interval);
  }, []);

  // Scroll to top when component mounts or when switching between forms
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle redirection when user state changes
  useEffect(() => {
    console.log('Login useEffect - User state changed:', user);
    console.log('Login useEffect - User role:', user?.role);
    console.log('Login useEffect - Should redirect:', !!user);
    
    if (user) {
      const redirectPath = user.role === 'admin' ? '/admin/' : '/user/dashboard';
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
    resolver: yupResolver(loginSchema) as any,
  });

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema) as any,
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    setValue,
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema) as any,
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    setValue: setValueRegister,
    reset: resetRegister,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema) as any,
    defaultValues: {
      email: location.state?.email || '',
      npiType: '',
      facilityName: '',
      firstName: '',
      phone: '',
      npi: '',
      password: '',
    }
  });

  const { onChange: npiOnChange, ...npiRest } = registerRegister('npi');
  const { onChange: phoneOnChange, ...phoneRest } = registerRegister('phone');

  const validateNPI = async (npi: string) => {
    if (npi.length !== 10) return;
    setIsNpiValidating(true);
    try {
      const response = await axios.post('/api/npi/registry', { npi });
      if (response.data.success) {
        const data = response.data.data || response.data;
        const basic = data.basic || data;
        const enumType: string = data.enumeration_type || basic.enumeration_type || '';
        const phone = data?.addresses[0]?.telephone_number || '';
        console.log('phone',  data.addresses[0].telephone_number);

        // Get contact name based on enumeration type
        let fullName = '';
        
        if (enumType === 'NPI-2') {
          // For facilities, use authorized official's name
          const prefix = basic.authorized_official_name_prefix || '';
          const firstName = basic.authorized_official_first_name || '';
          const lastName = basic.authorized_official_last_name || '';
          fullName = [prefix, firstName, lastName].filter(Boolean).join(' ').trim();
        } else if (enumType === 'NPI-1') {
          // For individuals, use their own name
          const prefix = basic.name_prefix && basic.name_prefix !== '--' ? basic.name_prefix : '';
          const firstName = basic.first_name || '';
          const middleName = basic.middle_name || '';
          const lastName = basic.last_name || '';
          const suffix = basic.name_suffix && basic.name_suffix !== '--' ? basic.name_suffix : '';
          const credential = basic.credential || '';
          
          // Combine name parts: prefix first middle last suffix, credential
          const nameParts = [prefix, firstName, middleName, lastName, suffix].filter(Boolean);
          const nameString = nameParts.join(' ').trim();
          fullName = credential ? `${nameString}, ${credential}` : nameString;
        }

        if (enumType === 'NPI-2') {
          const orgName = basic.organization_name || data.organization_name || '';
          setValueRegister('npiType', 'Facility/Group');
          setValueRegister('facilityName', orgName);
          setValueRegister('firstName', fullName || 'N/A');
        } else if (enumType === 'NPI-1') {
          setValueRegister('npiType', 'Individual');
          setValueRegister('firstName', fullName || '');
          setValueRegister('facilityName', '');
        }

        setValueRegister('phone', phone);
        setPhoneValue(phone);
        setNpiEnumerationType(enumType);
        toast.success('NPI validation successful!', { duration: 7000 });
        setNpiValidated(true);
      } else {
        toast.error('NPI validation failed. Please check your NPI number.', { duration: 7000 });
        setNpiValidated(false);
      }
    } catch (error) {
      toast.error('Invalid NPI number/Error validating NPI. Please try again.', { duration: 7000 });
      setNpiValidated(false);
    } finally {
      setIsNpiValidating(false);
    }
  };

  
  const otp = watch('otp');

  // Check for pre-filled data from login redirect
  useEffect(() => {
    if (showRegister) {
      const state = location.state;
      if (state?.prefillData) {
        // Pre-fill form data (except password)
        const prefillData = state.prefillData;
        Object.keys(prefillData).forEach(key => {
          if (key !== 'password' && prefillData[key]) {
            setValueRegister(key as keyof RegisterFormData, prefillData[key]);
          }
        });
        
        if (state.message) {
          setRegisterInfoMessage(state.message);
        }
      } else {
        // Check localStorage for pre-filled data
        const prefillDataStr = localStorage.getItem('prefillRegistrationData');
        if (prefillDataStr) {
          try {
            const prefillData = JSON.parse(prefillDataStr);
            Object.keys(prefillData).forEach(key => {
              if (key !== 'password' && prefillData[key]) {
                setValueRegister(key as keyof RegisterFormData, prefillData[key]);
              }
            });
            setRegisterInfoMessage('Your email is not verified. Please complete registration to verify your email.');
            // Clear localStorage after using
            localStorage.removeItem('prefillRegistrationData');
          } catch (error) {
            console.error('Error parsing pre-fill data:', error);
          }
        }
      }
    }
  }, [showRegister, location.state]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      const result = await login(data.email, data.password);
      
      if (result.success) {
        // Wait a moment for user state to update, then redirect manually
        setTimeout(() => {
          console.log('Manual redirect check - current user:', user);
          if (user) {
            const redirectPath = user.role === 'admin' ? '/admin/' : '/user/dashboard';
            console.log('Manual redirect to:', redirectPath);
            navigate(redirectPath, { replace: true });
          } else {
            console.log('No user state available, using fallback');
            // Fallback redirect to user dashboard
            navigate('/user/dashboard', { replace: true });
          }
        }, 1000);
      } else if (result.needsVerification) {
        // Show OTP verification inline
        console.log('Showing OTP verification for:', result.needsVerification.email);
        setOtpEmail(result.needsVerification.email);
        setShowOTPVerification(true);
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
      toast.error(errorMessage, { duration: 7000 });
    }
  };

  const onForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setForgotPasswordError('');
      console.log('Sending reset OTP for email:', data.email);
      
      // Use the actual API function if available, otherwise use fallback
      let result;
      if (sendPasswordResetOTP) {
        result = await sendPasswordResetOTP(data.email);
      } else {
        // Fallback implementation
        setLocalLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = { success: true };
        setLocalLoading(false);
      }
      
      console.log('Reset OTP result:', result);
      
      if (result.success) {
        console.log('Reset OTP sent successfully, showing reset password form');
        setResetEmail(data.email);
        setShowForgotPassword(false);
        setShowResetPassword(true);
        // Store session data
        localStorage.setItem('resetEmail', data.email);
        localStorage.setItem('resetTimestamp', Date.now().toString());
      } else {
        console.log('Reset OTP failed:', result.error);
        setForgotPasswordError(result.error || 'Failed to send reset code');
      }
    } catch (error) {
      console.error('Unexpected error in forgot password:', error);
      setForgotPasswordError('An unexpected error occurred. Please try again.');
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setValue('otp', pastedData.padEnd(6, ''));
  };

  const handleOtpChange = (index: number, value: string) => {
    const otpArray = otp ? otp.split('') : ['', '', '', '', '', ''];
    otpArray[index] = value.slice(-1);
    const newOtp = otpArray.join('');
    setValue('otp', newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const onResetPasswordSubmit = async (data: ResetPasswordFormData) => {
    try {
      setResetPasswordError('');
      const result = await resetPasswordWithOTP(resetEmail, data.otp, data.newPassword);
      
      if (result.success) {
        setResetPasswordSuccess(true);
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          setShowResetPassword(false);
          setResetPasswordSuccess(false);
          setResetEmail('');
          localStorage.removeItem('resetEmail');
          localStorage.removeItem('resetTimestamp');
        }, 3000);
      } else {
        setResetPasswordError(result.error || 'Failed to reset password');
      }
    } catch (error) {
      setResetPasswordError('An unexpected error occurred. Please try again.');
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setRegisterError('');
      const result = await registerUser(data);
      
      if (result.success) {
        // Show OTP verification inline
        setOtpEmail(data.email);
        setShowOTPVerification(true);
      } else if (result.needsVerification) {
        // Show OTP verification inline for existing unverified user
        setOtpEmail(result.needsVerification.email);
        setShowOTPVerification(true);
      } else {
        setRegisterError(result.error || 'Registration failed');
      }
    } catch (error) {
      setRegisterError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.', { duration: 7000 });
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

      <div className="login-page-holder">
        
      
      {/* Left Side - Login Form */}
      <div className="login-form-section">
          <div className="">
          
              <div className="dyad-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                <img 
                  src="/assets/images/logo_main.png" 
                  alt="Dyad Logo" 
                  className="logo-image login-logo"
                />
              </div>
            
          </div>
        <div className="login-form-content">
          {/* Logo */}
        

          <h3 className="text-xl font-medium text-gray-900">
            {showOTPVerification ? '' : showRegister ? 'Register' : showResetPassword ? 'Reset Your Password' : showForgotPassword ? 'Forgot Your Password?' : 'Login'}
          </h3>
         
           <div className={`form-container-login ${showRegister ? "register-form" : ""}`}>
          {!showOTPVerification && !showForgotPassword && !showResetPassword && !showRegister ? (
            /* Login Form */
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
                    className="input-field input-field-pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-button"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <img 
                        src="/assets/images/openeye.svg" 
                        alt="Hide password" 
                      />
                    ) : (
                      <img 
                        src="/assets/images/closeeye.svg" 
                        alt="Show password" 
                      />
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
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                >
                  Forgot password?
                </button>
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
                    Logging In...
                  </div>
                ) : (
                  'Log In'
                )}
              </button>

              {/* Register Link */}
              <div className="text-center">
                <span className="text-md text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setShowRegister(true)}
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Register now
                  </button>
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
          ) : showOTPVerification ? (
            /* OTP Verification Form */
            <OTPVerificationInline 
              email={otpEmail}
              onBack={() => {
                setShowOTPVerification(false);
                setOtpEmail('');
                setShowRegister(false);
              }}
              onSuccess={() => {
                setShowOTPVerification(false);
                setOtpEmail('');
                setShowRegister(false);
                // Clear registration form and state
                resetRegister();
                setRegisterError('');
                setRegisterInfoMessage('');
                setNpiValidated(false);
                setNpiEnumerationType('');
                setPhoneValue('');
                // Show login form after successful verification
              }}
            />
          ) : showRegister ? (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-6">
           

              {/* Info Message */}
              {registerInfoMessage && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">{registerInfoMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error Message */}
              {registerError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {registerError}
                </div>
              )}
              
              {/* NPI Field - Full Width */}
              <div className="form-row">
                <div className="form-field full-width">
                  <label className="block text-sm font-medium text-gray-700 mb-2">NPI</label>
                  <input
                    {...npiRest}
                    type="text"
                    placeholder="Enter NPI"
                    className={`input-field ${npiValidated ? 'border-green-500' : ''} ${isNpiValidating ? 'border-blue-500' : ''}`}
                    disabled={isLoading || isNpiValidating}
                    maxLength={10}
                    onChange={(e) => {
                      npiOnChange(e);
                      const val = e.target.value;
                      if (val.length < 10) {
                        setNpiValidated(false);
                        setNpiEnumerationType('');
                        setValueRegister('npiType', '');
                        setValueRegister('facilityName', '');
                      } else if (val.length === 10 && !isNpiValidating) {
                        validateNPI(val);
                      }
                    }}
                  />
                  {isNpiValidating && (
                    <div className="mt-2 flex items-center text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Validating NPI...
                    </div>
                  )}
                  {npiValidated && (
                    <div className="mt-2 text-sm text-green-600">✓ NPI validated successfully</div>
                  )}
                  {registerErrors.npi && (
                    <p className="mt-1 text-sm text-red-600">{registerErrors.npi.message as string}</p>
                  )}
                </div>
              </div>

              {/* Facility Name Field - Full Width - Only show for NPI-2 */}
              {npiEnumerationType === 'NPI-2' && (
                <div className="form-row">
                  <div className="form-field full-width">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                     Verify Facility/Group/Practice Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...registerRegister('facilityName')}
                      type="text"
                      placeholder="Facility/Group/Practice Name"
                      className="input-field bg-gray-50"
                      disabled={isLoading}
                      readOnly={true}
                    />
                    {registerErrors.facilityName && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.facilityName.message as string}</p>
                    )}
                  </div>
                </div>
              )}

              {/* First Name Field - Full Width - Show only after NPI verification */}
              {npiValidated && (
                <div className="form-row">
                  <div className="form-field full-width">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verify Contact Name {npiEnumerationType === 'NPI-1' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      {...registerRegister('firstName')}
                      type="text"
                      placeholder="Contact name"
                      className="input-field bg-gray-50"
                      disabled={true}
                      readOnly={true}
                    />
                    {registerErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.firstName.message as string}</p>
                    )}
                  </div>
                </div>
              )}

              
              {/* Phone Field - Full Width */}
              <div className="form-row">
                <div className="form-field full-width">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    {...phoneRest}
                    type="tel"
                    placeholder="Enter phone number"
                    className="input-field"
                    disabled={isLoading}
                    value={phoneValue}
                    onChange={(e) => {
                      phoneOnChange(e);
                      setPhoneValue(e.target.value);
                    }}
                  />
                  {registerErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{registerErrors.phone.message as string}</p>
                  )}
                </div>
              </div>

              {/* Email Field - Full Width */}
              <div className="form-row">
                <div className="form-field full-width">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      {...registerRegister('email')}
                      type="email"
                      placeholder="Enter email"
                      className="input-field"
                      disabled={isLoading}
                    />
                  </div>
                  {registerErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{registerErrors.email.message as string}</p>
                  )}
                </div>
              </div>

              {/* Password Field - Full Width */}
              <div className="form-row">
                <div className="form-field full-width">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...registerRegister('password')}
                      type={registerShowPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      className="input-field pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setRegisterShowPassword(!registerShowPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={isLoading}
                    >
                      {registerShowPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {registerErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{registerErrors.password.message as string}</p>
                  )}
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading || isNpiValidating || !npiValidated}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registering...
                  </div>
                ) : isNpiValidating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Validating NPI...
                  </div>
                ) : (
                  'Register'
                )}
              </button>

              {/* Login Link */}
              <div className="text-center">
                <span className="text-md text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegister(false);
                      setRegisterError('');
                      setRegisterInfoMessage('');
                    }}
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Login now
                  </button>
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
          ) : showForgotPassword ? (
            /* Forgot Password Form */
            <form onSubmit={handleForgotSubmit(onForgotPasswordSubmit)} className="space-y-6">
              {forgotPasswordSubmitted ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Check Your Email
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    We've sent a password reset code to your email address.
                  </p>
                  <p className="text-sm text-gray-500">
                    Redirecting to reset page...
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-600">
                      We'll send you instructions to reset your password.
                    </p>
                  </div>

                  {/* Error Message */}
                  {forgotPasswordError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{forgotPasswordError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...registerForgot('email')}
                        type="email"
                        placeholder="Enter your email address"
                        className="input-field pl-10"
                        disabled={isLoading || localLoading}
                      />
                    </div>
                    {forgotErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{forgotErrors.email.message as string}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || localLoading}
                    className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(isLoading || localLoading) ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending Reset Code...
                      </>
                    ) : (
                      'Send Reset Code'
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordError('');
                        setForgotPasswordSubmitted(false);
                      }}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            /* Reset Password Form */
            <form onSubmit={handleResetSubmit(onResetPasswordSubmit)} className="space-y-6">
              {resetPasswordSuccess ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Password Reset Successful!
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    Your password has been reset successfully. You can now login with your new password.
                  </p>
                  <p className="text-sm text-gray-500">
                    Redirecting to login page...
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-600">
                      Enter the verification code sent to {resetEmail}
                    </p>
                  </div>

                  {/* Error Message */}
                  {resetPasswordError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{resetPasswordError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OTP Input Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Verification Code
                    </label>
                    <div className="flex justify-center space-x-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          className="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          value={otp?.[index] || ''}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={index === 0 ? handlePaste : undefined}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                    {resetErrors.otp && (
                      <p className="mt-2 text-sm text-red-600 text-center">{resetErrors.otp.message as string}</p>
                    )}
                  </div>

                  {/* New Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...registerReset('newPassword')}
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className="input-field pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        )}
                      </button>
                    </div>
                    {resetErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{resetErrors.newPassword.message as string}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...registerReset('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        className="input-field pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        )}
                      </button>
                    </div>
                    {resetErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{resetErrors.confirmPassword.message as string}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPassword(false);
                        setShowForgotPassword(true);
                        setResetPasswordError('');
                      }}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      ← Back to Forgot Password
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
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

export default Login;

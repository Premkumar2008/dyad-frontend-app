import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ToastManager from '../utils/toastHelpers';

interface OTPFormData {
  otp: string;
}

const otpSchema: yup.ObjectSchema<OTPFormData> = yup.object({
  otp: yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
});

const OTPVerification: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCheckingEmail, setIsCheckingEmail] = useState(true);
  const [shouldShowOTP, setShouldShowOTP] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, isLoading } = useAuth();

  const email = location.state?.email || '';
  
  // Check for session expiration on component mount
  React.useEffect(() => {
    const registrationTimestamp = localStorage.getItem('registrationTimestamp');
    const pendingData = localStorage.getItem('pendingRegistration');
    
    if (!pendingData || !registrationTimestamp) {
      navigate('/register', { replace: true });
      return;
    }
    
    // Check if session is older than 15 minutes
    const sessionAge = Date.now() - parseInt(registrationTimestamp);
    const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    
    if (sessionAge > SESSION_TIMEOUT) {
      // Clean up expired session data
      localStorage.removeItem('pendingRegistration');
      localStorage.removeItem('registrationTimestamp');
      navigate('/register', { replace: true });
      return;
    }

    // Show OTP screen directly - no automatic verification check
    console.log('Session valid, showing OTP screen');
    setShouldShowOTP(true);
    setIsCheckingEmail(false);
  }, [navigate, email]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OTPFormData>({
    resolver: yupResolver(otpSchema) as any,
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
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle key press for backspace
  const handleKeyPress = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValue?.[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
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

  const onSubmit = async (data: OTPFormData) => {
    try {
      setError('');
      const result = await verifyOTP(email, data.otp);
      
      if (result.success) {
        // OTP verified successfully, redirect to login
        ToastManager.success('Email verified successfully! Redirecting to login...');
        
        // Small delay to show the success message
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
      } else {
        // Check if the error message indicates email is already verified
        if (result.error?.toLowerCase().includes('already verified') || result.error?.toLowerCase().includes('account exists')) {
          ToastManager.info('Email is already verified. Redirecting to login...');
          
          // Clean up session data
          localStorage.removeItem('pendingRegistration');
          localStorage.removeItem('registrationTimestamp');
          
          // Small delay to show the info message
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 1500);
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        {isCheckingEmail ? (
          // Loading state while checking email verification status
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking email verification status...</p>
          </div>
        ) : shouldShowOTP ? (
          <>
            {/* Back Button */}
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Register
            </Link>

            {/* Logo */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">DYAD PRACTICE SOLUTIONS</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
              <p className="mt-2 text-gray-600">
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
                      id={`otp-${index}`}
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
                  <p className="mt-2 text-sm text-red-600 text-center">{errors.otp.message}</p>
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
              <div className="text-center">
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
              </div>
            </form>
          </>
        ) : (
          // This should not happen, but fallback to register if something goes wrong
          <div className="text-center">
            <p className="text-gray-600 mb-4">Unable to verify email status.</p>
            <Link
              to="/register"
              className="btn-primary"
            >
              Back to Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTPVerification;

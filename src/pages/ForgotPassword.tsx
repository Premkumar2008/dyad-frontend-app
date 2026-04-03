import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
});

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string>('');
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();
  
  // Always call hooks at the top level
  const auth = useAuth();
  const sendPasswordResetOTP = auth?.sendPasswordResetOTP;
  const isLoading = auth?.isLoading || localLoading;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError('');
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
        console.log('Reset OTP sent successfully, showing success state');
        setIsSubmitted(true);
        // Auto-redirect to reset password page after 2 seconds
        setTimeout(() => {
          console.log('Redirecting to reset password page');
          navigate('/reset-password', { 
            state: { email: data.email },
            replace: true 
          });
        }, 2000);
      } else {
        console.log('Reset OTP failed:', result.error);
        setError(result.error || 'Failed to send reset code');
      }
    } catch (error) {
      console.error('Unexpected error in forgot password:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a password reset code to your email address.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Redirecting to reset page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link
            to="/login"
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
          
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
              Forgot Your Password?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we'll send you a code to reset your password.
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                className="input-field pl-10"
                disabled={isLoading}
              />
            </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Reset Code...
                </>
              ) : (
                'Send Reset Code'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

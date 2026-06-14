import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  buildDisplayName,
  checkOnboardingClientEmail,
  formatOnboardingAuthError,
  sendOnboardingClientOTP,
  setOnboardingClientSession,
  verifyOnboardingClientOTP,
} from '../../services/onboardingClientAuthService';
import SecureSessionStorage from '../../utils/sessionStorage';

interface LoginWithCodeFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const emailPattern = /^[\w-.]+@([\w-]+\.)+(com|org|net|edu|gov|mil)$/i;

export const LoginWithCodeForm: React.FC<LoginWithCodeFormProps> = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startResendCooldown = () => {
    setResendDisabled(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!trimmed || !emailPattern.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const check = await checkOnboardingClientEmail(trimmed);
      const name = buildDisplayName({ ...check, email: trimmed });
      setDisplayName(name);
      await sendOnboardingClientOTP(trimmed);
      setStep('otp');
      setOtp('');
      startResendCooldown();
      toast.success('Verification code sent to your email.');
    } catch (err) {
      setError(formatOnboardingAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.trim().length !== 6) {
      setError('Enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      const result = await verifyOnboardingClientOTP(email.trim(), otp.trim());
      if (!result.success) {
        setError(result.message || 'Invalid or expired verification code.');
        return;
      }
      const name = buildDisplayName({ ...result, email: email.trim() }) || displayName;
      setOnboardingClientSession({
        email: email.trim(),
        displayName: name,
        onboardingId: result.onboardingId,
      });
      if (result.accessToken && result.refreshToken) {
        SecureSessionStorage.setTokens(result.accessToken, result.refreshToken);
      }
      toast.success('Welcome back!');
      onSuccess();
    } catch (err) {
      setError(formatOnboardingAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendDisabled || !email.trim()) return;
    setError('');
    setLoading(true);
    try {
      await sendOnboardingClientOTP(email.trim());
      startResendCooldown();
      toast.success('A new code has been sent.');
    } catch (err) {
      setError(formatOnboardingAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '').slice(-1);
    const arr = otp.padEnd(6, ' ').split('');
    arr[index] = digits;
    const next = arr.join('').replace(/\s/g, '').slice(0, 6);
    setOtp(next);
    if (digits && index < 5) {
      document.getElementById(`login-code-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`login-code-otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp(pasted);
  };

  if (step === 'email') {
    return (
      <form onSubmit={handleSendCode} className="space-y-6">
        <button type="button" onClick={onBack} className="flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} className="mr-1" /> Back to password login
        </button>
        <p className="text-sm text-gray-600">
          Enter the email from your Dyad early access invitation. We&apos;ll verify it against our records, then send a one-time code.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            className="input-field"
            placeholder="Enter email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" /> Checking email…
            </span>
          ) : 'Send Verification Code'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-6">
      <button
        type="button"
        onClick={() => { setStep('email'); setOtp(''); setError(''); }}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} className="mr-1" /> Change email
      </button>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Enter verification code</h2>
        <p className="text-sm text-gray-600">We sent a 6-digit code to <strong>{email}</strong></p>
      </div>
      <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
        {Array.from({ length: 6 }, (_, i) => (
          <input
            key={i}
            id={`login-code-otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className="w-11 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none"
            value={otp[i] || ''}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => handleOtpKeyDown(i, e)}
            disabled={loading}
          />
        ))}
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full disabled:opacity-50">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin" /> Verifying…
          </span>
        ) : 'Verify & Continue'}
      </button>
      <div className="text-center text-sm text-gray-600">
        Didn&apos;t receive a code?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendDisabled || loading}
          className="text-primary-600 hover:text-primary-500 font-medium disabled:opacity-50"
        >
          {resendDisabled ? `Resend in ${countdown}s` : 'Resend code'}
        </button>
      </div>
    </form>
  );
};

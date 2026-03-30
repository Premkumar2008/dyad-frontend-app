import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth';
import {
  login as apiLogin, 
  register as apiRegister, 
  sendEmailOTP, 
  verifyOTP as apiVerifyOTP,
  getUserProfile,
  sendResetOTP,
  resetPassword,
  checkEmail,
  handleApiError,
  LoginRequest,
  RegisterRequest,
  VerifyOTPRequest,
  SendResetOTPRequest,
  ResetPasswordRequest
} from '../services/api';
import SecureSessionStorage from '../utils/sessionStorage';
import SessionTimeout from '../components/SessionTimeout';
import ToastManager from '../utils/toastHelpers';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: { email: string }; needsRegistration?: { email: string; prefillData: any }; errorMessage?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string; needsVerification?: { email: string }; errorMessage?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; error?: string; errorMessage?: string }>;
  logout: (options?: { 
    showNotification?: boolean; 
    reason?: 'user_initiated' | 'session_expired' | 'token_expired' | 'security_breach';
    redirectPath?: string;
  }) => Promise<void>;
  sendPasswordResetOTP: (email: string) => Promise<{ success: boolean; error?: string; errorMessage?: string }>;
  resetPasswordWithOTP: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string; errorMessage?: string }>;
  isLoading: boolean;
  clearRegistrationSuccess: () => void;
  pendingVerificationEmail: string | null;
  setPendingVerificationEmail: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [pendingRegistrationData, setPendingRegistrationData] = useState<any>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Initialize secure session monitoring
    // SecureSessionStorage.initializeSessionMonitoring();
    
    // Check for existing session on mount
    const sessionData = SecureSessionStorage.getSessionData();
    const userData = SecureSessionStorage.getUserData();
    
    if (sessionData && userData) {
      try {
        setUser(userData);
        // Verify session is still valid by fetching user profile
        fetchUserProfile();
      } catch (error) {
        console.error('Error validating session:', error);
        SecureSessionStorage.clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile...');
      const response = await getUserProfile();
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);
      
      // Check if response has nested data structure
      const userProfile = (response.data as any).data || response.data;
      console.log('User profile received:', userProfile);
      
      // Handle undefined or missing profile data
      if (!userProfile || !userProfile.id) {
        console.error('Invalid user profile data:', userProfile);
        throw new Error('Invalid user profile data received');
      }
      
      console.log('Profile validation passed, ID:', userProfile.id, 'Type:', typeof userProfile.id);
      
      const formattedUser: User = {
        id: userProfile.id?.toString() || '1',
        email: userProfile.email || '',
        name: userProfile.first_name && userProfile.last_name 
          ? `${userProfile.first_name} ${userProfile.last_name}` 
          : userProfile.email || 'User',
        role: (userProfile.role as 'admin' | 'user') || 'user',
        avatar: '', // UserProfile doesn't have avatar field
        createdAt: new Date().toISOString(), // UserProfile doesn't have created_at field
      };
      
      console.log('Formatted user:', formattedUser);
      setUser(formattedUser);
      console.log('User state set successfully');
      
      // Update secure session with fresh user data
      SecureSessionStorage.setSessionData(formattedUser);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      SecureSessionStorage.clearSession();
      throw error; // Re-throw to handle in login function
    }
  };

  const clearAuthData = () => {
    SecureSessionStorage.clearSession();
    setUser(null);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; needsVerification?: { email: string }; needsRegistration?: { email: string; prefillData: any } }> => {
    try {
      setIsLoading(true);
      
      const loginData: LoginRequest = { email, password };
      const response = await apiLogin(loginData);
      
      if (response.data.success && response.data.accessToken && response.data.refreshToken) {
        const { accessToken, refreshToken } = response.data;
        
        // Store tokens securely
        SecureSessionStorage.setTokens(accessToken, refreshToken);
        
        // Fetch user profile to get complete user data and validate authentication
        try {
          await fetchUserProfile();
          ToastManager.success('Login successful! Welcome back.');
          console.log('Login successful, user state updated:', user);
          
          // Force a state update check
          setTimeout(() => {
            console.log('Post-login user state check:', user);
            if (user) {
              console.log('User state confirmed, role:', user.role);
            } else {
              console.log('User state still null after fetchUserProfile');
            }
          }, 200);
          
          // Ensure user state is available before returning
          await new Promise(resolve => setTimeout(resolve, 100));
          
          return { success: true };
        } catch (profileError) {
          // If profile fetch fails, tokens might be invalid
          console.error('Profile fetch failed after login:', profileError);
          clearAuthData();
          ToastManager.error('Authentication failed. Please try again.');
          return { success: false, error: 'Authentication failed. Please try again.' };
        }
      } else {
        // Handle API error messages properly
        const errorMessage = response.data?.message || 'Login failed. Please check your credentials.';
        
        // Check if this is an unverified user scenario
        if (response.data?.needsVerification || errorMessage.toLowerCase().includes('verify') || errorMessage.toLowerCase().includes('otp')) {
          console.log('Unverified user detected, redirecting to register with pre-filled data');
          
          // Get user data from API if available, otherwise use minimal data
          let userData: any = { email };
          try {
            // Try to get user profile data for pre-filling
            const profileResponse = await getUserProfile();
            if (profileResponse.data) {
              const userProfile = (profileResponse.data as any).data || profileResponse.data;
              userData = {
                email: userProfile.email || email,
                firstName: userProfile.first_name || '',
                lastName: userProfile.last_name || '',
                phone: userProfile.phone || '',
                npi: userProfile.npi || ''
              };
            }
          } catch (profileError) {
            console.log('Could not fetch user profile for pre-filling:', profileError);
          }
          
          // Store pre-filled data for register page
          localStorage.setItem('prefillRegistrationData', JSON.stringify(userData));
          
          ToastManager.error('Your email is not verified. Please complete registration to verify your email.');
          return { 
            success: false, 
            error: 'Your email is not verified. Please complete registration to verify your email.',
            needsRegistration: { email, prefillData: userData }
          };
        }
        
        ToastManager.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (apiError: any) {
      // Handle API errors with proper error messages
      const errorMessage = handleApiError(apiError);
      console.error('Login API error:', apiError);
      ToastManager.error(errorMessage);
      
      // Check if this is an unverified user scenario (403 might indicate unverified)
      if (apiError.response?.status === 403) {
        const errorData = apiError.response.data;
        if (errorData?.needsVerification || errorData?.message?.toLowerCase().includes('verify')) {
          console.log('Unverified user detected via 403, redirecting to register with pre-filled data');
          
          // Get user data for pre-filling
          let userData: any = { email };
          try {
            const profileResponse = await getUserProfile();
            if (profileResponse.data) {
              const userProfile = (profileResponse.data as any).data || profileResponse.data;
              userData = {
                email: userProfile.email || email,
                firstName: userProfile.first_name || '',
                lastName: userProfile.last_name || '',
                phone: userProfile.phone || '',
                npi: userProfile.npi || ''
              };
            }
          } catch (profileError) {
            console.log('Could not fetch user profile for pre-filling:', profileError);
          }
          
          // Store pre-filled data for register page
          localStorage.setItem('prefillRegistrationData', JSON.stringify(userData));
          
          return { 
            success: false, 
            error: 'Your email is not verified. Please complete registration to verify your email.',
            needsRegistration: { email, prefillData: userData }
          };
        }
      }
      
      // Don't fall back to demo mode for real API errors
      if (apiError.response) {
        // Server responded with error status
        const { status, data } = apiError.response;
        if (status === 401) {
          const errorMsg = data?.message || 'Invalid email or password.';
          ToastManager.error(errorMsg);
          return { success: false, error: errorMsg };
        } else if (status === 403) {
          const errorMsg = data?.message || 'Access denied. Your account may be suspended.';
          ToastManager.error(errorMsg);
          return { success: false, error: errorMsg };
        } else if (status === 404) {
          const errorMsg = data?.message || 'User not found. Please check your email or register.';
          ToastManager.error(errorMsg);
          return { success: false, error: errorMsg };
        } else {
          const errorMsg = data?.message || errorMessage;
          ToastManager.error(errorMsg);
          return { success: false, error: errorMsg };
        }
      } else if (apiError.request) {
        // Network error - only show demo mode if explicitly configured
        if (import.meta.env.VITE_ENABLE_DEMO_MODE === 'true') {
          console.log('API not available, using demo mode for login');
          
          // Mock user data for demo
          const mockUser: User = {
            id: '1',
            email,
            name: email.includes('admin') ? 'Admin User' : 'User',
            role: email.includes('admin') ? 'admin' : 'user',
            avatar: '',
            createdAt: new Date().toISOString(),
          };
          
          const mockToken = 'demo-jwt-token-' + Date.now();
          
          // Store auth data securely
          SecureSessionStorage.setTokens(mockToken, mockToken);
          SecureSessionStorage.setSessionData(mockUser);
          setUser(mockUser);
          
          console.log('Demo mode - User set:', mockUser);
          console.log('Demo mode - User role:', mockUser.role);
          
          // Force a state update check
          setTimeout(() => {
            console.log('Demo mode - Post-login user state check:', user);
            if (user) {
              console.log('Demo mode - User state confirmed, role:', user.role);
            } else {
              console.log('Demo mode - User state still null after setUser');
            }
          }, 200);
          
          ToastManager.success('Demo mode: Login successful!');
          return { success: true };
        } else {
          const errorMsg = 'Unable to connect to server. Please check your internet connection and try again.';
          ToastManager.error(errorMsg);
          return { success: false, error: errorMsg };
        }
      } else {
        ToastManager.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<{ success: boolean; error?: string; needsVerification?: { email: string } }> => {
    try {
      setIsLoading(true);
      
      const registerData: RegisterRequest = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        npi: userData.npi,
        phone: userData.phone,
      };
      
      // Store registration data temporarily for OTP verification
      setPendingRegistrationData(registerData);
      localStorage.setItem('pendingRegistration', JSON.stringify(registerData));
      localStorage.setItem('registrationTimestamp', Date.now().toString());
      
      // Check if email already exists before sending OTP
      try {
        console.log('Checking if email exists for registration:', userData.email);
        const emailCheckResponse = await checkEmail(userData.email);
        console.log('Email check response for registration:', emailCheckResponse);
        
        if (emailCheckResponse.data.success && emailCheckResponse.data.exists) {
          const errorMessage = 'An account with this email already exists. Please log in instead.';
          console.log('Email already exists, stopping registration flow');
          ToastManager.error(errorMessage);
          return { success: false, error: errorMessage };
        } else {
          console.log('Email does not exist, proceeding with registration OTP');
        }
      } catch (emailCheckError: any) {
        console.error('Email check error during registration:', emailCheckError);
        const errorMessage = handleApiError(emailCheckError);
        ToastManager.error(errorMessage);
        return { success: false, error: errorMessage };
      }
      
      // Send OTP for verification before storing in database
      try {
        const otpResponse = await sendEmailOTP(userData.email);
        
        if (otpResponse.status === 200) {
          // OTP sent successfully, redirect to verification
          ToastManager.success('Please check your email for verification code.');
          setPendingVerificationEmail(userData.email);
          
          return { 
            success: true, 
            needsVerification: { email: userData.email }
          };
        } else {
          // Failed to send OTP
          ToastManager.error('Failed to send verification code. Please try again.');
          return { success: false, error: 'Failed to send verification code. Please try again.' };
        }
      } catch (otpError: any) {
        console.error('Failed to send OTP:', otpError);
        
        // Check if error is because email already exists
        if (otpError.response?.status === 409) {
          const errorMessage = otpError.response.data?.message || 'An account with this email already exists.';
          ToastManager.error(errorMessage);
          return { success: false, error: errorMessage };
        }
        
        // For other errors, use standard error handling
        const errorMessage = handleApiError(otpError);
        ToastManager.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (apiError: any) {
      const errorMessage = handleApiError(apiError);
      console.error('Registration error:', apiError);
      ToastManager.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (_email: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Check for session expiration
      const registrationTimestamp = localStorage.getItem('registrationTimestamp');
      const pendingData = localStorage.getItem('pendingRegistration');
      
      if (!pendingData || !registrationTimestamp) {
        ToastManager.error('Registration session expired. Please register again.');
        // Clean up expired session data
        localStorage.removeItem('pendingRegistration');
        localStorage.removeItem('registrationTimestamp');
        setPendingRegistrationData(null);
        return { success: false, error: 'Registration session expired. Please register again.' };
      }
      
      // Check if session is older than 15 minutes (900000 ms)
      const sessionAge = Date.now() - parseInt(registrationTimestamp);
      const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
      
      if (sessionAge > SESSION_TIMEOUT) {
        ToastManager.error('Registration session expired. Please register again.');
        // Clean up expired session data
        localStorage.removeItem('pendingRegistration');
        localStorage.removeItem('registrationTimestamp');
        setPendingRegistrationData(null);
        return { success: false, error: 'Registration session expired. Please register again.' };
      }
      
      const registerData: RegisterRequest = JSON.parse(pendingData);
      
      // Call the OTP verification API to validate the OTP
      try {
        // This API call would validate the OTP and update the database entry
        const verifyData: VerifyOTPRequest = {
          email: registerData.email,
          otp: otp
        };
        
        const verifyResponse = await apiVerifyOTP(verifyData);
        console.log('Verify OTP API response:', verifyResponse);
        console.log('Verify OTP response data:', verifyResponse.data);
        
        if (verifyResponse.status === 200 && verifyResponse.data.success) {
          console.log('OTP verified successfully, now registering user in database');
          // OTP verified successfully, now register the user in database
          try {
            // Add emailVerified field from OTP verification response
            const registerDataWithVerification = {
              ...registerData,
              emailVerified: verifyResponse.data.emailVerified || true
            };
            
            const registerResponse = await apiRegister(registerDataWithVerification);
            console.log('Register API response:', registerResponse);
            console.log('Register response data:', registerResponse.data);
            
            if (registerResponse.status === 200) {
              console.log('Registration successful, cleaning up session data');
              // Registration successful, clean up session data
              localStorage.removeItem('pendingRegistration');
              localStorage.removeItem('registrationTimestamp');
              setPendingRegistrationData(null);
              setPendingVerificationEmail(null);
              
              ToastManager.success('Registration completed successfully! You can now log in.');
              
              return { success: true };
            } else {
              console.log('Registration failed with status:', registerResponse.status);
              // OTP verified but registration failed
              ToastManager.error('OTP verified but registration failed. Please try again.');
              return { success: false, error: 'OTP verified but registration failed. Please try again.' };
            }
          } catch (registerError) {
            console.error('Registration error after OTP verification:', registerError);
            const errorMessage = handleApiError(registerError);
            ToastManager.error(errorMessage);
            return { success: false, error: errorMessage };
          }
        } else {
          ToastManager.error(verifyResponse.data.message || 'OTP verification failed. Please try again.');
          return { success: false, error: verifyResponse.data.message || 'OTP verification failed.' };
        }
      } catch (apiError) {
        // API is not available, show error instead of demo mode
        console.error('OTP verification API error:', apiError);
        const errorMessage = handleApiError(apiError);
        ToastManager.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error('OTP verification error:', error);
      ToastManager.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (options?: { 
    showNotification?: boolean; 
    reason?: 'user_initiated' | 'session_expired' | 'token_expired' | 'security_breach';
    redirectPath?: string;
  }): Promise<void> => {
    console.log('Logout function called with options:', options);
    
    const {
      showNotification = true,
      reason = 'user_initiated',
      redirectPath = '/login'
    } = options || {};

    try {
      setIsLoading(true);
      console.log('Starting logout process...');
      
      // Clear all authentication data first (most important)
      clearAuthData();
      console.log('Auth data cleared');
      
      // Show notification
      if (showNotification) {
        switch (reason) {
          case 'session_expired':
            ToastManager.error('Your session has expired. Please log in again.');
            break;
          case 'token_expired':
            ToastManager.error('Your authentication has expired. Please log in again.');
            break;
          case 'security_breach':
            ToastManager.error('Security alert: You have been logged out for security reasons.');
            break;
          case 'user_initiated':
          default:
            ToastManager.success('You have been logged out successfully.');
            break;
        }
      }

      // Redirect to login page
      console.log('Redirecting to:', redirectPath);
      window.location.href = redirectPath;
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Ensure logout completes even if there are errors
      clearAuthData();
      
      if (showNotification) {
        ToastManager.error('An error occurred during logout, but you have been logged out for security.');
      }
      
      // Force redirect to login
      window.location.href = redirectPath;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetOTP = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('sendPasswordResetOTP called with email:', email);
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        ToastManager.error('Please enter a valid email address.');
        return { success: false, error: 'Please enter a valid email address.' };
      }
      
      // Check if email exists before sending OTP
      try {
        console.log('Checking if email exists:', email);
        const emailCheckResponse = await checkEmail(email);
        console.log('Email check response:', emailCheckResponse);
        
        if (emailCheckResponse.data.success && emailCheckResponse.data.exists) {
          console.log('Email exists, proceeding with password reset OTP');
        } else {
          const errorMessage = 'User not found. No account exists with this email address.';
          console.log('Email does not exist, stopping flow');
          ToastManager.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (emailCheckError: any) {
        console.error('Email check error:', emailCheckError);
        const errorMessage = handleApiError(emailCheckError);
        ToastManager.error(errorMessage);
        return { success: false, error: errorMessage };
      }
      
      console.log('Making API call to sendResetOTP');
      const response = await sendResetOTP(email);
      console.log('API response:', response);
      
      if (response.data.success) {
        console.log('API returned success');
        // Store reset email for verification page
        localStorage.setItem('resetEmail', email);
        localStorage.setItem('resetTimestamp', Date.now().toString());
        
        ToastManager.success('Password reset code sent to your email address.');
        return { success: true };
      } else {
        console.log('API returned failure:', response.data);
        ToastManager.error(response.data.message || 'Failed to send reset code.');
        return { success: false, error: response.data.message || 'Failed to send reset code.' };
      }
    } catch (apiError: any) {
      console.error('Send reset OTP error:', apiError);
      console.error('Error status:', apiError.response?.status);
      console.error('Error data:', apiError.response?.data);
      
      if (apiError.response?.status === 429) {
        ToastManager.error('Too many reset attempts. Please try again later.');
        return { success: false, error: 'Too many reset attempts. Please try again later.' };
      } else {
        ToastManager.error('Failed to send reset code. Please try again.');
        return { success: false, error: 'Failed to send reset code. Please try again.' };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordWithOTP = async (email: string, otp: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!email || !otp || !newPassword) {
        ToastManager.error('All fields are required.');
        return { success: false, error: 'All fields are required.' };
      }
      
      if (otp.length !== 6) {
        ToastManager.error('Invalid verification code format.');
        return { success: false, error: 'Invalid verification code format.' };
      }
      
      if (newPassword.length < 8) {
        ToastManager.error('Password must be at least 8 characters long.');
        return { success: false, error: 'Password must be at least 8 characters long.' };
      }
      
      // Check if reset session is valid (5 minutes)
      const resetTimestamp = localStorage.getItem('resetTimestamp');
      const resetEmail = localStorage.getItem('resetEmail');
      
      if (!resetTimestamp || !resetEmail || resetEmail !== email) {
        ToastManager.error('Reset session expired. Please request a new reset code.');
        return { success: false, error: 'Reset session expired. Please request a new reset code.' };
      }
      
      const sessionAge = Date.now() - parseInt(resetTimestamp);
      const RESET_TIMEOUT = 5 * 60 * 1000; // 5 minutes
      
      if (sessionAge > RESET_TIMEOUT) {
        // Clean up expired session
        localStorage.removeItem('resetEmail');
        localStorage.removeItem('resetTimestamp');
        ToastManager.error('Reset code expired. Please request a new one.');
        return { success: false, error: 'Reset code expired. Please request a new one.' };
      }
      
      const resetData: ResetPasswordRequest = {
        email,
        otp,
        newPassword
      };
      
      const response = await resetPassword(resetData);
      
      if (response.data.success) {
        // Clean up reset session
        localStorage.removeItem('resetEmail');
        localStorage.removeItem('resetTimestamp');
        
        ToastManager.success('Password reset successfully! You can now login with your new password.');
        
        // Log out any existing sessions for security
        clearAuthData();
        
        return { success: true };
      } else {
        ToastManager.error(response.data.message || 'Failed to reset password.');
        return { success: false, error: response.data.message || 'Failed to reset password.' };
      }
    } catch (apiError: any) {
      console.error('Reset password error:', apiError);
      const errorMessage = handleApiError(apiError);
      
      if (apiError.response?.status === 400) {
        ToastManager.error('Invalid or expired verification code.');
        return { success: false, error: 'Invalid or expired verification code.' };
      } else if (apiError.response?.status === 429) {
        ToastManager.error('Too many reset attempts. Please try again later.');
        return { success: false, error: 'Too many reset attempts. Please try again later.' };
      } else {
        ToastManager.error('Failed to reset password. Please try again.');
        return { success: false, error: 'Failed to reset password. Please try again.' };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    verifyOTP,
    logout,
    sendPasswordResetOTP,
    resetPasswordWithOTP,
    isLoading,
    clearRegistrationSuccess: () => {
      ToastManager.success('Registration completed! Please login to continue.');
    },
    pendingVerificationEmail,
    setPendingVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionTimeout onSessionExpired={() => setSessionExpired(true)} />
    </AuthContext.Provider>
  );
};

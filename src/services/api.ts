import axios, { AxiosInstance, AxiosResponse } from 'axios';
import SecureSessionStorage from '../utils/sessionStorage';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = SecureSessionStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = SecureSessionStorage.getRefreshToken();
        if (refreshToken) {
          const response = await refreshAccessToken(refreshToken);
          const { accessToken } = response.data;
          
          SecureSessionStorage.setTokens(accessToken, refreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, logout user - temporarily disabled for debugging
        console.error('Token refresh failed:', refreshError);
        // SecureSessionStorage.clearSession();
        // window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Type definitions
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SendResetOTPRequest {
  email: string;
}

export interface SendResetOTPResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  message?: string;
  needsVerification?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  npi?: string;
  phone?: string;
}

export interface RegisterResponse {
  message: string;
}

export interface SendEmailOTPRequest {
  email: string;
}

export interface SendEmailOTPResponse {
  message: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  message: string;
  success: boolean;
  emailVerified?: boolean;
}

// API Functions

/**
 * Send OTP to user's email for registration
 */
export const sendEmailOTP = async (email: string): Promise<AxiosResponse<SendEmailOTPResponse>> => {
  return api.post('/send-email-otp', { email });
};

/**
 * Register a new user with OTP verification
 */
export const register = async (userData: RegisterRequest): Promise<AxiosResponse<RegisterResponse>> => {
  return api.post('/register', userData);
};

/**
 * Login user and return tokens
 */
export const login = async (credentials: LoginRequest): Promise<AxiosResponse<LoginResponse>> => {
  return api.post('/login', credentials);
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<AxiosResponse<{ accessToken: string }>> => {
  return api.post('/refresh', { refreshToken });
};

/**
 * Get user profile (requires authentication)
 */
export const getUserProfile = async (): Promise<AxiosResponse<UserProfile>> => {
  return api.get('/profile');
};

/**
 * Send password reset OTP
 */
export const sendResetOTP = async (email: string): Promise<AxiosResponse<SendResetOTPResponse>> => {
  return api.post('/send-reset-otp', { email });
};

/**
 * Reset password with OTP
 */
export const resetPassword = async (resetData: ResetPasswordRequest): Promise<AxiosResponse<ResetPasswordResponse>> => {
  return api.post('/reset-password', resetData);
};

/**
 * Verify email using token
 */
export const verifyEmail = async (token: string): Promise<AxiosResponse<string>> => {
  return api.get(`/verify-email?token=${token}`);
};

/**
 * Check if email exists in database
 */
export const checkEmail = async (email: string): Promise<AxiosResponse<{ success: boolean; exists: boolean; message: string }>> => {
  return api.post('/check-email', { email });
};

/**
 * Verify OTP with email and OTP code
 */
export const verifyOTP = async (data: VerifyOTPRequest): Promise<AxiosResponse<VerifyOTPResponse>> => {
  return api.post('/verify-otp', data);
};

export interface SendEarlyAccessConfirmationRequest {
  to: string;
  contactName: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Send early access confirmation email after successful submission
 */
export const sendEarlyAccessConfirmation = async (
  data: SendEarlyAccessConfirmationRequest
): Promise<AxiosResponse<{ success: boolean }>> => {
  return api.post('/send-early-access-confirmation', data);
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Invalid request. Please check your input and try again.';
      case 401:
        return data.message || 'Invalid credentials. Please check your email and password.';
      case 403:
        return data.message || 'Access denied. You do not have permission to perform this action.';
      case 404:
        return data.message || 'Resource not found. Please check your request and try again.';
      case 408:
        return 'Request timeout. Please try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return data.message || 'Server error. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. Please try again later.';
      case 503:
        return 'Service maintenance in progress. Please try again later.';
      case 504:
        return 'Gateway timeout. Please try again.';
      default:
        return data.message || `Request failed with status ${status}. Please try again.`;
    }
  } else if (error.request) {
    // Network error
    if (error.code === 'ECONNABORTED') {
      return 'Request was cancelled. Please try again.';
    } else if (error.code === 'ETIMEDOUT') {
      return 'Connection timeout. Please check your internet connection and try again.';
    } else if (error.code === 'ENOTFOUND') {
      return 'Server not found. Please check the URL and try again.';
    } else {
      return 'Network error. Please check your internet connection and try again.';
    }
  } else {
    // Other error
    return error.message || 'An unexpected error occurred. Please try again.';
  }
};

export default api;

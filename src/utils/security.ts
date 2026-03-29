/**
 * Security utilities for production-ready application
 */

// Security configuration
export const SECURITY_CONFIG = {
  // Content Security Policy
  CSP: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts for React development
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'", 'https:', 'http:', 'ws:', 'wss:', 'localhost', '127.0.0.1', 'http://localhost:5000', 'https://dyad-backend-server-dev.up.railway.app'], // Allow local and production API
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },
  
  // Additional security headers (only ones that work with meta tags)
  HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }
};

/**
 * Generate Content Security Policy header
 */
export const generateCSP = (): string => {
  const directives = Object.entries(SECURITY_CONFIG.CSP)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
  
  return directives;
};

/**
 * Apply security headers to the document
 */
export const applySecurityHeaders = (): void => {
  // Apply CSP meta tag
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = generateCSP();
  document.head.appendChild(cspMeta);

  // Apply other security meta tags
  Object.entries(SECURITY_CONFIG.HEADERS).forEach(([name, content]) => {
    const meta = document.createElement('meta');
    meta.httpEquiv = name;
    meta.content = content;
    document.head.appendChild(meta);
  });
};

/**
 * CSRF token utilities
 */
export class CSRFProtection {
  private static readonly TOKEN_KEY = 'csrf_token';
  private static readonly HEADER_NAME = 'X-CSRF-Token';

  /**
   * Generate a random CSRF token
   */
  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Store CSRF token
   */
  static setToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Get CSRF token
   */
  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get CSRF header name and token
   */
  static getHeader(): { [key: string]: string } | {} {
    const token = this.getToken();
    return token ? { [this.HEADER_NAME]: token } : {};
  }

  /**
   * Clear CSRF token
   */
  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Initialize CSRF protection
   */
  static initialize(): void {
    // Generate and store token if not exists
    if (!this.getToken()) {
      this.setToken(this.generateToken());
    }
  }
}

/**
 * Input sanitization utilities
 */
export class InputSanitizer {
  /**
   * Sanitize HTML input
   */
  static sanitizeHTML(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Sanitize for SQL injection prevention (basic)
   */
  static sanitizeSQL(input: string): string {
    return input.replace(/['"\\;]/g, '');
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Rate limiting utilities
 */
export class RateLimiter {
  private static attempts = new Map<string, { count: number; resetTime: number }>();

  /**
   * Check if action is allowed
   */
  static isAllowed(identifier: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Get remaining attempts
   */
  static getRemainingAttempts(identifier: string, maxAttempts: number): number {
    const record = this.attempts.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return maxAttempts;
    }
    return Math.max(0, maxAttempts - record.count);
  }

  /**
   * Get reset time
   */
  static getResetTime(identifier: string): number | null {
    const record = this.attempts.get(identifier);
    return record ? record.resetTime : null;
  }
}

/**
 * Initialize security measures
 */
export const initializeSecurity = (): void => {
  // Apply security headers
  applySecurityHeaders();
  
  // Initialize CSRF protection
  CSRFProtection.initialize();
  
  // Clear sensitive data on page unload
  window.addEventListener('beforeunload', () => {
    // Clear any sensitive data from memory
    CSRFProtection.clearToken();
  });
  
  };

export default {
  SECURITY_CONFIG,
  generateCSP,
  applySecurityHeaders,
  CSRFProtection,
  InputSanitizer,
  RateLimiter,
  initializeSecurity
};

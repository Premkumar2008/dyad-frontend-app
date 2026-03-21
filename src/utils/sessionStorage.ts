import CryptoJS from 'crypto-js';

// Session configuration
const SESSION_CONFIG = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user_data',
  SESSION_KEY: 'session_data',
  ACTIVITY_KEY: 'last_activity',
  ENCRYPTION_KEY: 'dyad_session_encryption_key_2024',
  SESSION_TIMEOUT_MINUTES: 30, // Session timeout in minutes
  WARNING_TIMEOUT_MINUTES: 25, // Show warning 5 minutes before timeout
  IDLE_TIMEOUT_MINUTES: 15, // Idle timeout in minutes
};

// Types
interface SessionData {
  isAuthenticated: boolean;
  userId: string;
  userEmail: string;
  userRole: 'admin' | 'user';
  loginTime: number;
  lastActivity: number;
  expiresAt: number;
  deviceId: string;
}

interface TokenData {
  token: string;
  expiresAt: number;
  refreshToken?: string;
}

/**
 * Simple encryption for sensitive data (client-side only)
 * Note: This is for basic obfuscation, not military-grade security
 * Real security should be handled by HTTPS and secure HTTP-only cookies
 */
class SimpleEncryption {
  private static getEncryptionKey(): string {
    return SESSION_CONFIG.ENCRYPTION_KEY;
  }

  static encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.getEncryptionKey()).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      return data; // Fallback to plain text
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.getEncryptionKey());
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData; // Return as-is if decryption fails
    }
  }
}

/**
 * Secure Session Storage Utility
 * Provides encrypted storage for sensitive session data
 */
export class SecureSessionStorage {
  /**
   * Generate a unique device ID for this browser/session
   */
  private static generateDeviceId(): string {
    const stored = localStorage.getItem('device_id');
    if (stored) return stored;
    
    const deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('device_id', deviceId);
    return deviceId;
  }

  /**
   * Store authentication tokens securely
   */
  static setTokens(accessToken: string, refreshToken: string): void {
    const tokenData: TokenData = {
      token: accessToken,
      expiresAt: Date.now() + (SESSION_CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000),
      refreshToken,
    };

    // Store in memory for immediate access
    sessionStorage.setItem(SESSION_CONFIG.TOKEN_KEY, SimpleEncryption.encrypt(JSON.stringify(tokenData)));
    
    // Store refresh token in localStorage (less sensitive, persists across tabs)
    localStorage.setItem(SESSION_CONFIG.REFRESH_TOKEN_KEY, SimpleEncryption.encrypt(refreshToken));
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    try {
      const encrypted = sessionStorage.getItem(SESSION_CONFIG.TOKEN_KEY);
      if (!encrypted) return null;

      const tokenData: TokenData = JSON.parse(SimpleEncryption.decrypt(encrypted));
      
      // Check if token is expired
      if (Date.now() > tokenData.expiresAt) {
        this.clearTokens();
        return null;
      }

      return tokenData.token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    try {
      const encrypted = localStorage.getItem(SESSION_CONFIG.REFRESH_TOKEN_KEY);
      if (!encrypted) return null;

      return SimpleEncryption.decrypt(encrypted);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Store user session data
   */
  static setSessionData(user: any): void {
    const sessionData: SessionData = {
      isAuthenticated: true,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      loginTime: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + (SESSION_CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000),
      deviceId: this.generateDeviceId(),
    };

    // Store encrypted session data
    sessionStorage.setItem(SESSION_CONFIG.SESSION_KEY, SimpleEncryption.encrypt(JSON.stringify(sessionData)));
    
    // Store user data (less sensitive)
    localStorage.setItem(SESSION_CONFIG.USER_KEY, SimpleEncryption.encrypt(JSON.stringify(user)));
    
    // Update last activity
    this.updateLastActivity();
  }

  /**
   * Get session data
   */
  static getSessionData(): SessionData | null {
    try {
      const encrypted = sessionStorage.getItem(SESSION_CONFIG.SESSION_KEY);
      if (!encrypted) return null;

      const sessionData: SessionData = JSON.parse(SimpleEncryption.decrypt(encrypted));
      
      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        this.clearSession();
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Error getting session data:', error);
      return null;
    }
  }

  /**
   * Get user data
   */
  static getUserData(): any | null {
    try {
      const encrypted = localStorage.getItem(SESSION_CONFIG.USER_KEY);
      if (!encrypted) return null;

      return JSON.parse(SimpleEncryption.decrypt(encrypted));
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Update last activity timestamp
   */
  static updateLastActivity(): void {
    const now = Date.now();
    sessionStorage.setItem(SESSION_CONFIG.ACTIVITY_KEY, now.toString());
    
    // Also update session data
    const sessionData = this.getSessionData();
    if (sessionData) {
      sessionData.lastActivity = now;
      sessionStorage.setItem(SESSION_CONFIG.SESSION_KEY, SimpleEncryption.encrypt(JSON.stringify(sessionData)));
    }
  }

  /**
   * Check if session is valid
   */
  static isSessionValid(): boolean {
    const sessionData = this.getSessionData();
    if (!sessionData) return false;

    const now = Date.now();
    const lastActivity = parseInt(sessionStorage.getItem(SESSION_CONFIG.ACTIVITY_KEY) || '0');
    
    // Check session timeout
    if (now > sessionData.expiresAt) {
      this.clearSession();
      return false;
    }

    // Check idle timeout
    const idleTime = now - lastActivity;
    if (idleTime > (SESSION_CONFIG.IDLE_TIMEOUT_MINUTES * 60 * 1000)) {
      this.clearSession();
      return false;
    }

    return true;
  }

  /**
   * Check if session is about to expire (within warning period)
   */
  static isSessionExpiringSoon(): boolean {
    const sessionData = this.getSessionData();
    if (!sessionData) return false;

    const now = Date.now();
    const warningTime = sessionData.expiresAt - (SESSION_CONFIG.WARNING_TIMEOUT_MINUTES * 60 * 1000);
    
    return now > warningTime && now < sessionData.expiresAt;
  }

  /**
   * Get remaining session time in minutes
   */
  static getRemainingSessionTime(): number {
    const sessionData = this.getSessionData();
    if (!sessionData) return 0;

    const remaining = sessionData.expiresAt - Date.now();
    return Math.max(0, Math.floor(remaining / (60 * 1000)));
  }

  /**
   * Refresh session (extend expiration)
   */
  static refreshSession(): void {
    const sessionData = this.getSessionData();
    if (sessionData) {
      sessionData.lastActivity = Date.now();
      sessionData.expiresAt = Date.now() + (SESSION_CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000);
      sessionStorage.setItem(SESSION_CONFIG.SESSION_KEY, SimpleEncryption.encrypt(JSON.stringify(sessionData)));
      this.updateLastActivity();
    }
  }

  /**
   * Clear all session data
   */
  static clearSession(): void {
    // Clear sessionStorage
    sessionStorage.removeItem(SESSION_CONFIG.TOKEN_KEY);
    sessionStorage.removeItem(SESSION_CONFIG.SESSION_KEY);
    sessionStorage.removeItem(SESSION_CONFIG.ACTIVITY_KEY);
    
    // Clear localStorage
    localStorage.removeItem(SESSION_CONFIG.REFRESH_TOKEN_KEY);
    localStorage.removeItem(SESSION_CONFIG.USER_KEY);
    localStorage.removeItem('pendingRegistration');
  }

  /**
   * Clear tokens only
   */
  static clearTokens(): void {
    sessionStorage.removeItem(SESSION_CONFIG.TOKEN_KEY);
    localStorage.removeItem(SESSION_CONFIG.REFRESH_TOKEN_KEY);
  }

  /**
   * Initialize session monitoring
   */
  static initializeSessionMonitoring(): void {
    // Update activity on user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.updateLastActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.updateLastActivity();
    });

    // Note: Session validation is now handled by SessionTimeout component
    // to avoid multiple conflicting intervals
  }
}

export default SecureSessionStorage;

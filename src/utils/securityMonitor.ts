import { useAuth } from '../contexts/AuthContext';

/**
 * Security monitoring utilities for production-level authentication
 */

export class SecurityMonitor {
  private static readonly MAX_CONCURRENT_SESSIONS = 3;
  private static readonly SUSPICIOUS_ACTIVITY_THRESHOLD = 5;
  private static readonly TOKEN_REUSE_THRESHOLD = 2;

  /**
   * Monitor for suspicious activities and trigger security logout
   */
  static monitorSuspiciousActivity(activity: string): void {
    const { logout } = useAuth();
    
    // Track suspicious activities in session storage
    const activities = this.getSuspiciousActivities();
    activities.push({ activity, timestamp: Date.now() });
    
    // Keep only recent activities (last 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const recentActivities = activities.filter((a: { timestamp: number }) => a.timestamp > tenMinutesAgo);
    
    this.setSuspiciousActivities(recentActivities);
    
    // Check if threshold exceeded
    if (recentActivities.length >= this.SUSPICIOUS_ACTIVITY_THRESHOLD) {
      console.warn('Suspicious activity threshold exceeded, triggering security logout');
      logout({
        showNotification: true,
        reason: 'security_breach',
        redirectPath: '/login?reason=security'
      });
    }
  }

  /**
   * Monitor for concurrent sessions
   */
  static monitorConcurrentSessions(): void {
    const { logout } = useAuth();
    
    try {
      const sessionId = this.getCurrentSessionId();
      const activeSessions = this.getActiveSessions();
      
      // Add current session
      activeSessions[sessionId] = Date.now();
      
      // Clean up old sessions (older than 30 minutes)
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      Object.keys(activeSessions).forEach(id => {
        if (activeSessions[id] < thirtyMinutesAgo) {
          delete activeSessions[id];
        }
      });
      
      // Check concurrent session limit
      if (Object.keys(activeSessions).length > this.MAX_CONCURRENT_SESSIONS) {
        console.warn('Too many concurrent sessions, triggering security logout');
        logout({
          showNotification: true,
          reason: 'security_breach',
          redirectPath: '/login?reason=concurrent_sessions'
        });
      }
      
      this.setActiveSessions(activeSessions);
    } catch (error) {
      console.warn('Failed to monitor concurrent sessions:', error);
    }
  }

  /**
   * Monitor for token reuse
   */
  static monitorTokenReuse(token: string): void {
    const { logout } = useAuth();
    
    try {
      const tokenHash = this.hashToken(token);
      const usedTokens = this.getUsedTokens();
      
      if (usedTokens[tokenHash]) {
        usedTokens[tokenHash]++;
        
        if (usedTokens[tokenHash] >= this.TOKEN_REUSE_THRESHOLD) {
          console.warn('Token reuse threshold exceeded, triggering security logout');
          logout({
            showNotification: true,
            reason: 'security_breach',
            redirectPath: '/login?reason=token_reuse'
          });
        }
      } else {
        usedTokens[tokenHash] = 1;
      }
      
      this.setUsedTokens(usedTokens);
    } catch (error) {
      console.warn('Failed to monitor token reuse:', error);
    }
  }

  /**
   * Check for session hijacking attempts
   */
  static checkSessionIntegrity(): boolean {
    const { logout } = useAuth();
    
    try {
      const currentFingerprint = this.generateFingerprint();
      const storedFingerprint = this.getStoredFingerprint();
      
      if (storedFingerprint && currentFingerprint !== storedFingerprint) {
        console.warn('Session integrity check failed, possible hijacking attempt');
        logout({
          showNotification: true,
          reason: 'security_breach',
          redirectPath: '/login?reason=session_hijack'
        });
        return false;
      }
      
      this.setStoredFingerprint(currentFingerprint);
      return true;
    } catch (error) {
      console.warn('Failed to check session integrity:', error);
      return false;
    }
  }

  /**
   * Initialize security monitoring
   */
  static initializeSecurityMonitoring(): void {
    // Disable security monitoring to prevent CORS and permission issues
    console.log('Security monitoring disabled to prevent CORS and permission issues');
    
    // Monitor page visibility changes (potential tab duplication) - DISABLED
    // document.addEventListener('visibilitychange', () => {
    //   if (document.visibilityState === 'visible') {
    //     this.monitorConcurrentSessions();
    //     this.checkSessionIntegrity();
    //   }
    // });

    // Monitor focus events (potential session hijacking) - DISABLED
    // window.addEventListener('focus', () => {
    //   this.checkSessionIntegrity();
    // });

    // Monitor storage events (potential session manipulation) - DISABLED
    // window.addEventListener('storage', (e) => {
    //   if (e.key === 'auth_token' || e.key === 'user_data') {
    //     this.monitorSuspiciousActivity('storage_event_detected');
    //   }
    // });

    // Periodic security checks - DISABLED
    // setInterval(() => {
    //   this.checkSessionIntegrity();
    // }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Private helper methods
  private static getSuspiciousActivities() {
    try {
      return JSON.parse(sessionStorage.getItem('suspicious_activities') || '[]');
    } catch {
      return [];
    }
  }

  private static setSuspiciousActivities(activities: any[]) {
    try {
      sessionStorage.setItem('suspicious_activities', JSON.stringify(activities));
    } catch (error) {
      console.warn('Failed to store suspicious activities:', error);
    }
  }

  private static getCurrentSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  private static getActiveSessions() {
    try {
      return JSON.parse(localStorage.getItem('active_sessions') || '{}');
    } catch {
      return {};
    }
  }

  private static setActiveSessions(sessions: any) {
    try {
      localStorage.setItem('active_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.warn('Failed to store active sessions:', error);
    }
  }

  private static hashToken(token: string): string {
    // Simple hash function (in production, use a proper hashing library)
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private static getUsedTokens() {
    try {
      return JSON.parse(sessionStorage.getItem('used_tokens') || '{}');
    } catch {
      return {};
    }
  }

  private static setUsedTokens(tokens: any) {
    try {
      sessionStorage.setItem('used_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.warn('Failed to store used tokens:', error);
    }
  }

  private static generateFingerprint(): string {
    // Disable canvas fingerprinting to prevent permission requests
    // Canvas API can trigger permission prompts on some browsers
    console.log('Canvas fingerprinting disabled to prevent permission issues');
    
    // Return a simple fingerprint without using canvas
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset()
    ].join('|');

    return this.hashToken(fingerprint);
  }

  private static getStoredFingerprint(): string | null {
    return sessionStorage.getItem('browser_fingerprint');
  }

  private static setStoredFingerprint(fingerprint: string): void {
    sessionStorage.setItem('browser_fingerprint', fingerprint);
  }
}

export default SecurityMonitor;

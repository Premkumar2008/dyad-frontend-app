import toast from 'react-hot-toast';

// Toast deduplication utility
class ToastManager {
  private static activeToasts = new Set<string>();
  private static toastTimeouts = new Map<string, number>();

  /**
   * Show toast with deduplication
   */
  static showToast(message: string, type: 'success' | 'error' | 'loading' = 'error', duration?: number): string {
    // Create a unique key for this toast
    const toastKey = `${type}:${message}`;
    
    // If this toast is already active, don't show another one
    if (this.activeToasts.has(toastKey)) {
      // Clear existing timeout
      const existingTimeout = this.toastTimeouts.get(toastKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Remove from active toasts
      this.activeToasts.delete(toastKey);
      this.toastTimeouts.delete(toastKey);
    }

    // Add to active toasts
    this.activeToasts.add(toastKey);

    // Show the toast
    const toastFn = type === 'success' ? toast.success : 
                    type === 'loading' ? toast.loading : 
                    toast.error;
    
    const newToastId = toastFn(message, {
      duration: duration || (type === 'error' ? 4000 : 3000),
      id: toastKey, // Use the key as ID to prevent duplicates
    });

    // Set timeout to remove from active toasts after duration
    const timeoutDuration = duration || (type === 'error' ? 4000 : 3000);
    const timeout = setTimeout(() => {
      this.activeToasts.delete(toastKey);
      this.toastTimeouts.delete(toastKey);
    }, timeoutDuration);
    
    this.toastTimeouts.set(toastKey, timeout);

    return newToastId;
  }

  /**
   * Show success toast
   */
  static success(message: string, duration?: number): string {
    return this.showToast(message, 'success', duration);
  }

  /**
   * Show error toast
   */
  static error(message: string, duration?: number): string {
    return this.showToast(message, 'error', duration);
  }

  /**
   * Show loading toast
   */
  static loading(message: string, duration?: number): string {
    return this.showToast(message, 'loading', duration);
  }

  /**
   * Show info toast
   */
  static info(message: string, duration?: number): string {
    return this.showToast(message, 'error', duration); // Using error type for info (blue color)
  }

  /**
   * Dismiss a specific toast
   */
  static dismiss(toastId: string): void {
    toast.dismiss(toastId);
    this.activeToasts.delete(toastId);
    const timeout = this.toastTimeouts.get(toastId);
    if (timeout) {
      clearTimeout(timeout);
      this.toastTimeouts.delete(toastId);
    }
  }

  /**
   * Clear all toasts
   */
  static clear(): void {
    toast.dismiss();
    this.activeToasts.clear();
    this.toastTimeouts.forEach(timeout => clearTimeout(timeout));
    this.toastTimeouts.clear();
  }
}

export default ToastManager;

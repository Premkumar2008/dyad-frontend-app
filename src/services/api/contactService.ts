/**
 * Contact service API layer
 * Centralized API management for contact-related operations
 */

import api from '../api';
import { ContactFormData } from '../../types/landing';

export interface ContactResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export class ContactService {
  /**
   * Submit contact form
   * @param contactData - Contact form data
   * @returns Promise with API response
   */
  static async submitContactForm(contactData: ContactFormData): Promise<ContactResponse> {
    try {
      const response = await api.post('/contact-requests', contactData);
      
      return {
        success: true,
        message: 'Contact form submitted successfully',
        data: response.data,
      };
    } catch (error: any) {
      // Log error for debugging (in production, use proper logging service)
      if (import.meta.env.DEV) {
        console.error('Contact form submission error:', error);
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit contact form',
      };
    }
  }

  /**
   * Validate contact form data
   * @param data - Contact form data to validate
   * @returns Validation result
   */
  static validateContactData(data: Partial<ContactFormData>): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    if (!data.name?.trim()) {
      errors.name = 'Name is required';
    }

    if (!data.phoneNumber?.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(data.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be exactly 10 digits';
    }

    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email format';
    }

    if (!data.organization?.trim()) {
      errors.organization = 'Organization is required';
    }

    if (!data.message?.trim()) {
      errors.message = 'Message is required';
    }

    if (!data.scheduledTime?.trim()) {
      errors.scheduledTime = 'Schedule time is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

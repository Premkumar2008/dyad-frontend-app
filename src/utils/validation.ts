/**
 * Validation utilities
 * Common validation functions used across the application
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate a string value against provided rules
 */
export const validateString = (value: string, rules: ValidationRule): ValidationResult => {
  const trimmedValue = value.trim();

  // Required validation
  if (rules.required && !trimmedValue) {
    return {
      isValid: false,
      error: rules.message || 'This field is required',
    };
  }

  // Skip other validations if field is not required and empty
  if (!trimmedValue) {
    return { isValid: true };
  }

  // Min length validation
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return {
      isValid: false,
      error: rules.message || `Must be at least ${rules.minLength} characters`,
    };
  }

  // Max length validation
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return {
      isValid: false,
      error: rules.message || `Must be no more than ${rules.maxLength} characters`,
    };
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return {
      isValid: false,
      error: rules.message || 'Invalid format',
    };
  }

  // Custom validation
  if (rules.custom && !rules.custom(trimmedValue)) {
    return {
      isValid: false,
      error: rules.message || 'Invalid value',
    };
  }

  return { isValid: true };
};

/**
 * Common validation patterns
 */
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10}$/,
  NAME: /^[a-zA-Z\s'-]+$/,
  URL: /^https?:\/\/.+/,
} as const;

/**
 * Common validation rules
 */
export const VALIDATION_RULES = {
  REQUIRED: { required: true },
  EMAIL: {
    pattern: PATTERNS.EMAIL,
    message: 'Invalid email format',
  },
  PHONE: {
    pattern: PATTERNS.PHONE,
    message: 'Phone number must be exactly 10 digits',
  },
  NAME: {
    pattern: PATTERNS.NAME,
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  },
} as const;

/**
 * Validate email
 */
export const validateEmail = (email: string): ValidationResult => {
  return validateString(email, { ...VALIDATION_RULES.REQUIRED, ...VALIDATION_RULES.EMAIL });
};

/**
 * Validate phone number (10 digits)
 */
export const validatePhone = (phone: string): ValidationResult => {
  return validateString(phone, { ...VALIDATION_RULES.REQUIRED, ...VALIDATION_RULES.PHONE });
};

/**
 * Validate name
 */
export const validateName = (name: string): ValidationResult => {
  return validateString(name, { ...VALIDATION_RULES.REQUIRED, ...VALIDATION_RULES.NAME });
};

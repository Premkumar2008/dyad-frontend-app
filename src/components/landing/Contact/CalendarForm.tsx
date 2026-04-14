/**
 * Calendar Event Form Component
 * Optimized version using custom hook for separation of concerns
 * Follows existing architecture patterns from ContactForm
 */

import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CalendarEventData } from '../../../types/landing';
import { useCalendarForm } from '../../../hooks/useCalendarForm';

// Validation schema using Yup - matches requirements
const calendarSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  date: yup.string().required('Date is required').test(
    'not-past',
    'Date cannot be in the past',
    (value) => {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }
  ),
  time: yup.string().required('Time is required'),
});

interface CalendarFormProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const CalendarForm: React.FC<CalendarFormProps> = ({
  onSuccess,
  onError,
  className = '',
}) => {
  // Use custom hook for business logic
  const {
    isSubmitting,
    submitStatus,
    statusMessage,
    submitEvent,
    resetStatus,
  } = useCalendarForm(onSuccess, onError);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CalendarEventData>({
    resolver: yupResolver(calendarSchema) as any,
    mode: 'onChange',
  });

  // Optimized submit handler using the custom hook
  const onSubmit = useCallback(async (data: CalendarEventData) => {
    await submitEvent(data);
    if (submitStatus === 'success') {
      reset(); // Clear form on success
    }
  }, [submitEvent, submitStatus, reset]);

  // Reset status when user starts typing again
  const handleInputChange = useCallback(() => {
    if (submitStatus !== 'idle') {
      resetStatus();
    }
  }, [submitStatus, resetStatus]);

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className={`calendar-form ${className}`}>
      {/* Name Field */}
      <div className="form-field">
        <label htmlFor="calendar-name" className="form-label">
          Name*
        </label>
        <input
          type="text"
          id="calendar-name"
          className={`form-input ${errors.name ? 'error' : ''}`}
          {...register('name', { onChange: handleInputChange })}
          placeholder="Your full name"
          disabled={isSubmitting}
        />
        {errors.name && (
          <span className="error-message">{errors.name.message}</span>
        )}
      </div>

      {/* Date Field */}
      <div className="form-field">
        <label htmlFor="calendar-date" className="form-label">
          Date*
        </label>
        <input
          type="date"
          id="calendar-date"
          className={`form-input ${errors.date ? 'error' : ''}`}
          {...register('date', { 
            onChange: handleInputChange,
            valueAsDate: true 
          })}
          min={new Date().toISOString().split('T')[0]} // Prevent past dates
          disabled={isSubmitting}
        />
        {errors.date && (
          <span className="error-message">{errors.date.message}</span>
        )}
      </div>

      {/* Time Field */}
      <div className="form-field">
        <label htmlFor="calendar-time" className="form-label">
          Time*
        </label>
        <input
          type="time"
          id="calendar-time"
          className={`form-input ${errors.time ? 'error' : ''}`}
          {...register('time', { onChange: handleInputChange })}
          disabled={isSubmitting}
        />
        {errors.time && (
          <span className="error-message">{errors.time.message}</span>
        )}
      </div>

      {/* Status Messages */}
      {submitStatus !== 'idle' && statusMessage && (
        <div className={`form-status-message ${submitStatus}`}>
          {statusMessage}
        </div>
      )}

      {/* Submit Button */}
      <div className="form-field">
        <button
          type="submit"
          className="form-submit-button"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Event...
            </span>
          ) : (
            'Add to Calendar'
          )}
        </button>
      </div>
    </form>
  );
};

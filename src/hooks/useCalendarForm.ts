/**
 * Custom hook for calendar form logic
 * Separates business logic from UI component for better maintainability
 */

import { useState, useCallback } from 'react';
import { CalendarEventData, CalendarEventResponse } from '../types/landing';
import { CalendarService } from '../services/calendarService';
import { log } from '../utils/logger';

interface UseCalendarFormState {
  isSubmitting: boolean;
  submitStatus: 'idle' | 'success' | 'error';
  statusMessage: string;
}

interface UseCalendarFormReturn extends UseCalendarFormState {
  submitEvent: (data: CalendarEventData) => Promise<void>;
  resetStatus: () => void;
}

export const useCalendarForm = (
  onSuccess?: (message: string) => void,
  onError?: (error: string) => void
): UseCalendarFormReturn => {
  const [state, setState] = useState<UseCalendarFormState>({
    isSubmitting: false,
    submitStatus: 'idle',
    statusMessage: '',
  });

  const resetStatus = useCallback(() => {
    setState({
      isSubmitting: false,
      submitStatus: 'idle',
      statusMessage: '',
    });
  }, []);

  const submitEvent = useCallback(async (data: CalendarEventData) => {
    setState(prev => ({ ...prev, isSubmitting: true, submitStatus: 'idle', statusMessage: '' }));

    try {
      log.info('Submitting calendar event via hook', 'useCalendarForm', { 
        name: data.name, 
        date: data.date, 
        time: data.time 
      });

      // Validate using service layer
      const validation = CalendarService.validateData(data);
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors)[0];
        log.warn('Calendar form validation failed via hook', 'useCalendarForm', validation.errors);
        
        setState({
          isSubmitting: false,
          submitStatus: 'error',
          statusMessage: errorMessage,
        });
        
        onError?.(errorMessage);
        return;
      }

      // Submit to API
      const response: CalendarEventResponse = await CalendarService.createEvent(data);
      
      if (response.success) {
        log.info('Calendar event submitted successfully via hook', 'useCalendarForm', { 
          eventId: response.eventId,
          name: data.name 
        });
        
        setState({
          isSubmitting: false,
          submitStatus: 'success',
          statusMessage: response.message || 'Event added to calendar',
        });
        
        onSuccess?.(response.message || 'Event added to calendar');
      } else {
        log.error('Calendar event submission failed via hook', 'useCalendarForm', response.message);
        
        setState({
          isSubmitting: false,
          submitStatus: 'error',
          statusMessage: response.message,
        });
        
        onError?.(response.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      log.error('Calendar form submission error via hook', 'useCalendarForm', error);
      
      setState({
        isSubmitting: false,
        submitStatus: 'error',
        statusMessage: errorMessage,
      });
      
      onError?.(errorMessage);
    }
  }, [onSuccess, onError]);

  return {
    ...state,
    submitEvent,
    resetStatus,
  };
};

/**
 * Calendar Event Service
 * Handles API integration for Google Calendar event creation
 */

import api, { handleApiError } from './api';
import { CalendarEventData, CalendarEventResponse } from '../types/landing';
import { log } from '../utils/logger';
import { formatDateTimeForAPI } from '../utils/dateTimeUtils';

/**
 * Validates calendar event data before API submission
 */
export const validateCalendarEventData = (data: CalendarEventData): {
  isValid: boolean;
  errors: Partial<CalendarEventData>;
} => {
  const errors: Partial<CalendarEventData> = {};

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }

  // Date validation
  if (!data.date) {
    errors.date = 'Date is required';
  } else {
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.date = 'Date cannot be in the past';
    }
  }

  // Time validation
  if (!data.time) {
    errors.time = 'Time is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};


/**
 * Creates a Google Calendar event via API
 */
export const createCalendarEvent = async (
  eventData: CalendarEventData
): Promise<CalendarEventResponse> => {
  try {
    log.info('Creating calendar event', 'calendarService', { 
      name: eventData.name, 
      date: eventData.date, 
      time: eventData.time 
    });

    // Validate input data
    const validation = validateCalendarEventData(eventData);
    if (!validation.isValid) {
      log.warn('Calendar event validation failed', 'calendarService', validation.errors);
      return {
        success: false,
        message: (Object.values(validation.errors) as string[])[0] || 'Invalid form data',
      };
    }

    // Format date and time for API
    const formattedDateTime = formatDateTimeForAPI(eventData.date, eventData.time);

    // Prepare API payload
    const apiPayload = {
      name: eventData.name.trim(),
      date: eventData.date,
      time: eventData.time,
      dateTime: formattedDateTime, // Additional formatted datetime for backend convenience
    };

    // Make API call
    const response = await api.post<CalendarEventResponse>('/create-event', apiPayload);
    
    log.info('Calendar event created successfully', 'calendarService', { 
      eventId: response.data.eventId,
      name: eventData.name 
    });

    return {
      success: true,
      message: response.data.message || 'Event added to calendar',
      eventId: response.data.eventId,
    };
    
  } catch (error) {
    const errorMessage = handleApiError(error);
    log.error('Calendar event creation failed', 'calendarService', error);
    
    return {
      success: false,
      message: errorMessage,
    };
  }
};

/**
 * Calendar service object for organized exports
 */
export const CalendarService = {
  createEvent: createCalendarEvent,
  validateData: validateCalendarEventData,
  formatDateTime: formatDateTimeForAPI,
};

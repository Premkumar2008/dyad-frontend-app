/**
 * Date and Time Utilities
 * Reusable functions for date/time formatting and validation
 */

/**
 * Formats date and time into ISO string for API submission
 * Ensures proper timezone handling
 */
export const formatDateTimeForAPI = (date: string, time: string): string => {
  try {
    // Combine date and time strings
    const dateTimeString = `${date}T${time}`;
    const dateObj = new Date(dateTimeString);
    
    // Validate the combined date
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date or time format');
    }
    
    return dateObj.toISOString();
  } catch (error) {
    console.error('Date time formatting error:', { date, time, error });
    throw new Error('Invalid date or time format');
  }
};

/**
 * Checks if a given date is in the past
 */
export const isDateInPast = (dateString: string): boolean => {
  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate < today;
};

/**
 * Gets the minimum allowed date (today) for date input
 */
export const getMinDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Validates time format (HH:MM)
 */
export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Formats a date for display (e.g., "January 1, 2024")
 */
export const formatDateForDisplay = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Formats time for display (e.g., "2:30 PM")
 */
export const formatTimeForDisplay = (timeString: string): string => {
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  } catch (error) {
    return timeString;
  }
};

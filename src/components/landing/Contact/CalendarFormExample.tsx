/**
 * Calendar Form Usage Example
 * Demonstrates how to integrate the CalendarForm component
 */

import React from 'react';
import { CalendarForm } from './CalendarForm';

export const CalendarFormExample: React.FC = () => {
  const handleSuccess = (message: string) => {
    console.log('Calendar event created:', message);
    // You could show a toast notification, redirect, etc.
  };

  const handleError = (error: string) => {
    console.error('Calendar event failed:', error);
    // You could show an error toast, etc.
  };

  return (
    <div className="calendar-form-example">
      <h2>Schedule an Event</h2>
      <p>Fill out the form below to add an event to your Google Calendar.</p>
      
      <CalendarForm
        onSuccess={handleSuccess}
        onError={handleError}
        className="custom-calendar-form"
      />
    </div>
  );
};

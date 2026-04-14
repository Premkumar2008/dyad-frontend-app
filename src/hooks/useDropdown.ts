/**
 * Custom hook for dropdown management
 * Handles dropdown state and common dropdown actions
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export const useDropdown = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Open dropdown
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Close dropdown
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, close]);

  // Close dropdown on ESC key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, close]);

  return {
    isOpen,
    toggle,
    open,
    close,
    dropdownRef,
  };
};

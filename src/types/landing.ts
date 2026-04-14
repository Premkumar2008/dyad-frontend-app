/**
 * Landing page type definitions
 * Centralized type management for landing page components
 */

export interface NavigationItem {
  name: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
}

export interface DropdownItem {
  title: string;
  description: string;
  link: string;
}

export interface AboutContentItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  paragraph: string;
  features: string[];
}

export interface ServiceItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  image: string;
}

export interface LeadershipItem {
  id: number;
  name: string;
  title: string;
  description: string;
  image: string;
  credentials?: string[];
}

export interface ContactFormData {
  name: string;
  phoneNumber: string;
  email: string;
  organization: string;
  message: string;
  scheduledTime: string;
  recaptchaToken: string;
  recaptcha: boolean;
}

export interface CalendarEventData {
  name: string;
  date: string;
  time: string;
}

export interface CalendarEventResponse {
  success: boolean;
  message: string;
  eventId?: string;
}

export interface FooterColumn {
  title: string;
  items: FooterItem[];
  type: 'links' | 'contact';
}

export interface FooterItem {
  text: string;
  href?: string;
  icon?: string;
}

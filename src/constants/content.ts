/**
 * Content constants for the landing page
 * Centralized content management for easy updates
 */

import { NavigationItem, AboutContentItem, ServiceItem, FooterColumn } from '../types/landing';

// Navigation items
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: 'Home',
    href: '#top',
  },
  {
    name: 'About',
    href: '#about',
    hasDropdown: true,
    dropdownItems: [
      { title: 'Our Story', description: 'Learn about our journey', link: '#our-story' },
      { title: 'Mission', description: 'Our mission and values', link: '#mission' },
      { title: 'Team', description: 'Meet our team', link: '#team' },
    ],
  },
  {
    name: 'Who We Serve',
    href: '#who-we-serve',
    hasDropdown: true,
    dropdownItems: [
      { title: 'Anesthesia Groups', description: 'Solutions for anesthesia practices', link: '#anesthesia' },
      { title: 'ASCs', description: 'Ambulatory Surgery Centers', link: '#asc' },
      { title: 'Surgical Specialties', description: 'Specialized surgical care', link: '#surgical' },
    ],
  },
  {
    name: 'What We Do',
    href: '#services',
    hasDropdown: true,
    dropdownItems: [
      { title: 'Technology', description: 'Advanced technology solutions', link: '#technology' },
      { title: 'Billing', description: 'Specialized billing services', link: '#billing' },
      { title: 'Analytics', description: 'Data-driven insights', link: '#analytics' },
    ],
  },
  {
    name: 'Leadership',
    href: '#leadership',
  },
  {
    name: 'Contact',
    href: '#contact',
  },
];

// About content
export const ABOUT_CONTENT: AboutContentItem[] = [
  {
    id: 1,
    title: 'Integrated Practice Management',
    subtitle: 'Comprehensive solutions for modern healthcare',
    image: '/assets/images/about-integrated.jpg',
    paragraph: 'Our integrated practice management solutions combine cutting-edge technology with deep industry expertise to streamline operations, enhance patient care, and optimize financial performance for healthcare practices of all sizes.',
    features: [
      'Electronic Health Records (EHR)',
      'Practice Management Systems',
      'Patient Portal Integration',
      'Revenue Cycle Management',
    ],
  },
  {
    id: 2,
    title: 'Operational Excellence',
    subtitle: 'Optimizing workflows for maximum efficiency',
    image: '/assets/images/about-operations.jpg',
    paragraph: 'We specialize in identifying operational bottlenecks and implementing data-driven solutions that improve efficiency, reduce costs, and enhance the overall patient experience while maintaining the highest standards of clinical care.',
    features: [
      'Workflow Optimization',
      'Staff Training & Development',
      'Quality Assurance Programs',
      'Performance Metrics & KPIs',
    ],
  },
  {
    id: 3,
    title: 'Technology Integration',
    subtitle: 'Seamless digital transformation',
    image: '/assets/images/about-technology.jpg',
    paragraph: 'Our technology integration services ensure that healthcare providers can leverage the latest digital tools and platforms to improve patient outcomes, streamline operations, and stay ahead in an increasingly competitive healthcare landscape.',
    features: [
      'Cloud-Based Solutions',
      'Telemedicine Integration',
      'Data Analytics Platforms',
      'Cybersecurity & Compliance',
    ],
  },
];

// Services content
export const SERVICES_CONTENT: ServiceItem[] = [
  {
    id: 1,
    title: 'Revenue Cycle Management',
    subtitle: 'Maximize your financial performance',
    description: 'Comprehensive revenue cycle management services that optimize billing processes, reduce claim denials, and improve cash flow for healthcare practices.',
    features: [
      'Medical Billing & Coding',
      'Claims Processing',
      'Denial Management',
      'Financial Reporting',
    ],
    image: '/assets/images/service-billing.jpg',
  },
  {
    id: 2,
    title: 'Practice Management',
    subtitle: 'Streamline your operations',
    description: 'End-to-end practice management solutions that enhance operational efficiency, improve patient satisfaction, and support practice growth.',
    features: [
      'Patient Scheduling',
      'Electronic Health Records',
      'Patient Engagement',
      'Staff Productivity Tools',
    ],
    image: '/assets/images/service-management.jpg',
  },
  {
    id: 3,
    title: 'Analytics & Insights',
    subtitle: 'Data-driven decision making',
    description: 'Advanced analytics and reporting solutions that provide actionable insights to improve clinical outcomes, operational efficiency, and financial performance.',
    features: [
      'Performance Dashboards',
      'Predictive Analytics',
      'Quality Metrics',
      'Business Intelligence',
    ],
    image: '/assets/images/service-analytics.jpg',
  },
];

// Footer content
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Services',
    type: 'links',
    items: [
      { text: 'Technology Driven Capabilities', href: '#services' },
      { text: 'Pre & Post Encounter', href: '#services' },
      { text: 'Claims Management', href: '#services' },
      { text: 'Specialty Billing', href: '#services' },
      { text: 'Real Time Insights', href: '#services' },
    ],
  },
  {
    title: 'Specialties',
    type: 'links',
    items: [
      { text: 'Surgical & Procedural Specialties', href: '#surgical-specialties' },
      { text: 'Interventional & Diagnostic Care', href: '#interventional-care' },
      { text: 'Perioperative & Supportive Services', href: '#perioperative-services' },
      { text: 'Outpatient & Specialty Facilities', href: '#outpatient-facilities' },
    ],
  },
  {
    title: 'Contact',
    type: 'contact',
    items: [
      {
        text: 'info@dyadmd.com',
        icon: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z',
      },
      {
        text: '2573 Pacific Coast Hwy, Suite A277\nTorrance, CA 90505',
        icon: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z',
      },
    ],
  },
];

// Hero content
export const HERO_CONTENT = {
  title: 'Transforming Healthcare Practice Management',
  subtitle: 'Integrated Solutions for Modern Healthcare Excellence',
  description: 'Empowering healthcare practices with cutting-edge technology, operational expertise, and data-driven insights to deliver exceptional patient care and optimize practice performance.',
  primaryButtonText: 'Get Started',
  secondaryButtonText: 'Learn More',
};

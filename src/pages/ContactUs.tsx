import React, { useState, useRef, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ContactUs.css';
import ReCAPTCHA from 'react-google-recaptcha';

// ── DateTimePicker ────────────────────────────────────────────────────────────
interface CalendarEvent { start: string; end: string; }

const BUSINESS_START = 9;   // 9 AM
const BUSINESS_END   = 17;  // last slot ends at 5 PM

function generateTimeSlots() {
  const slots: { hour: number; min: number }[] = [];
  for (let h = BUSINESS_START; h < BUSINESS_END; h++) {
    slots.push({ hour: h, min: 0 });
    slots.push({ hour: h, min: 30 });
  }
  return slots;
}

function formatSlotLabel(hour: number, min: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const toAmPm = (h: number, m: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${pad(m)} ${ampm}`;
  };
  const endTotal = hour * 60 + min + 30;
  return `${toAmPm(hour, min)} – ${toAmPm(Math.floor(endTotal / 60), endTotal % 60)}`;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const TIME_SLOTS = generateTimeSlots();

const DateTimePicker: React.FC<{
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}> = ({ value, onChange, hasError }) => {
  const todayMidnight = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [busyEvents, setBusyEvents]     = useState<CalendarEvent[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // ── helpers ──────────────────────────────────────────────────────────────
  const isSlotBusy = (date: Date, hour: number, min: number): boolean => {
    const slotStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, min);
    const slotEnd   = new Date(slotStart.getTime() + 30 * 60_000);
    return busyEvents.some(ev => slotStart < new Date(ev.end) && slotEnd > new Date(ev.start));
  };

  const isSlotPast = (date: Date, hour: number, min: number): boolean =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, min) <= new Date();

  const getSelectedSlotKey = (): string => {
    if (!value || !selectedDate) return '';
    const tPart = value.split('T')[1];
    if (!tPart) return '';
    const [h, m] = tPart.split(':');
    return `${parseInt(h)}-${parseInt(m)}`;
  };

  // ── fetch calendar events ─────────────────────────────────────────────────
  const fetchBusySlots = async (date: Date) => {
    setLoadingSlots(true);
    try {
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      const apiUrl  = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${apiUrl}/calendar-events?date=${dateStr}`);
      setBusyEvents(res.data.events ?? []);
    } catch {
      setBusyEvents([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // ── calendar navigation ───────────────────────────────────────────────────
  const canGoPrev = () => {
    const now = new Date();
    return currentMonth.getFullYear() > now.getFullYear() ||
           currentMonth.getMonth()    > now.getMonth();
  };
  const prevMonth = () => setCurrentMonth(p => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(p => new Date(p.getFullYear(), p.getMonth() + 1, 1));

  // ── days grid ─────────────────────────────────────────────────────────────
  const getDaysGrid = (): (Date | null)[] => {
    const yr = currentMonth.getFullYear(), mo = currentMonth.getMonth();
    const grid: (Date | null)[] = Array(new Date(yr, mo, 1).getDay()).fill(null);
    for (let d = 1; d <= new Date(yr, mo + 1, 0).getDate(); d++) grid.push(new Date(yr, mo, d));
    return grid;
  };

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleDateClick = (day: Date) => {
    const mid = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    if (mid < todayMidnight) return;
    setSelectedDate(day);
    onChange('');
    fetchBusySlots(day);
  };

  const handleSlotClick = (hour: number, min: number) => {
    if (!selectedDate) return;
    const pad = (n: number) => String(n).padStart(2, '0');
    onChange(
      `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth()+1)}-${pad(selectedDate.getDate())}T${pad(hour)}:${pad(min)}:00`
    );
  };

  // ── render ────────────────────────────────────────────────────────────────
  const days            = getDaysGrid();
  const selectedSlotKey = getSelectedSlotKey();

  return (
    <div className={`dtp-container${hasError ? ' dtp-has-error' : ''}`}>
      <div className="dtp-inner">

        {/* ── Left: Calendar ── */}
        <div className="dtp-cal-panel">

          {/* Month navigation */}
          <div className="dtp-month-nav">
            <button type="button" className="dtp-arrow" onClick={prevMonth} disabled={!canGoPrev()}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="dtp-month-title">
              {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button type="button" className="dtp-arrow" onClick={nextMonth}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="dtp-weekdays">
            {DAY_LABELS.map(d => <span key={d} className="dtp-weekday">{d}</span>)}
          </div>

          {/* Days */}
          <div className="dtp-days">
            {days.map((day, i) => {
              if (!day) return <span key={`e-${i}`} className="dtp-day-empty" />;
              const mid     = new Date(day.getFullYear(), day.getMonth(), day.getDate());
              const isPast  = mid < todayMidnight;
              const isToday = mid.getTime() === todayMidnight.getTime();
              const isSel   = !!selectedDate && selectedDate.toDateString() === day.toDateString();
              return (
                <button
                  key={day.getDate()}
                  type="button"
                  disabled={isPast}
                  className={`dtp-day${isPast ? ' dtp-day--past' : ' dtp-day--future'}${isToday ? ' dtp-day--today' : ''}${isSel ? ' dtp-day--selected' : ''}`}
                  onClick={() => !isPast && handleDateClick(day)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Calendar legend */}
          <div className="dtp-cal-legend">
            <span className="dtp-cal-legend-item">
              <span className="dtp-cal-dot dtp-cal-dot--today" /> Today
            </span>
            <span className="dtp-cal-legend-item">
              <span className="dtp-cal-dot dtp-cal-dot--sel" /> Selected
            </span>
            <span className="dtp-cal-legend-item">
              <span className="dtp-cal-dot dtp-cal-dot--past" /> Past
            </span>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="dtp-vdivider" />

        {/* ── Right: Time Slots ── */}
        <div className="dtp-slots-panel">
          {!selectedDate ? (
            <div className="dtp-slots-empty">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#c7cdd6" strokeWidth="1.4">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <p>Pick a date on the left<br/>to see available slots</p>
            </div>
          ) : (
            <>
              <div className="dtp-slots-date">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>

              {loadingSlots ? (
                <div className="dtp-slots-loading">
                  <div className="dtp-spin" />
                  <span>Checking availability…</span>
                </div>
              ) : (
                <>
                  <div className="dtp-slots-list">
                    {TIME_SLOTS.map(({ hour, min }) => {
                      const busy     = isSlotBusy(selectedDate, hour, min);
                      const past     = isSlotPast(selectedDate, hour, min);
                      const disabled = busy || past;
                      const key      = `${hour}-${min}`;
                      const isSel    = selectedSlotKey === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={disabled}
                          className={`dtp-slot${isSel ? ' dtp-slot--sel' : ''}${busy ? ' dtp-slot--busy' : past ? ' dtp-slot--past' : ' dtp-slot--free'}`}
                          onClick={() => !disabled && handleSlotClick(hour, min)}
                        >
                          <span className="dtp-slot-time">{formatSlotLabel(hour, min)}</span>
                          {busy && <span className="dtp-slot-tag dtp-slot-tag--busy">Booked</span>}
                          {past && !busy && <span className="dtp-slot-tag dtp-slot-tag--past">Past</span>}
                          {isSel && (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                              <path d="M5 13l4 4L19 7"/>
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Slot legend */}
                  <div className="dtp-slot-legend">
                    <span><i className="dtp-sleg dtp-sleg--free" />Available</span>
                    <span><i className="dtp-sleg dtp-sleg--busy" />Booked</span>
                    <span><i className="dtp-sleg dtp-sleg--past" />Past</span>
                  </div>
                </>
              )}
            </>
          )}
        </div>

      </div>

      {/* ── Confirmation bar ── */}
      {value && (
        <div className="dtp-confirm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7"/>
          </svg>
          <span>
            Scheduled for&nbsp;
            <strong>
              {new Date(value).toLocaleString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric',
                year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
              })}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
};
// ── End DateTimePicker ────────────────────────────────────────────────────────

// Validation schema
const contactSchema = yup.object({
  name: yup.string().required('Name is required'),
  phoneNumber: yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
    .required('Phone number is required'),
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  organization: yup.string().required('Organization/Facility name is required'),
  message: yup.string().required('Message is required'),
  scheduledTime: yup.string().required('Schedule time is required'),
  recaptcha: yup.boolean().oneOf([true], 'Please verify you are not a robot').required()
});

const ContactUs: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Contact');
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isWhoWeServeDropdownOpen, setIsWhoWeServeDropdownOpen] = useState(false);
  const [isWhatWeDoDropdownOpen, setIsWhatWeDoDropdownOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submissionTime, setSubmissionTime] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<{ minutes: number; seconds: number } | null>(null);
 const captchaRef = useRef(null);

 // Scroll to top when component mounts
 useEffect(() => {
   window.scrollTo({ top: 0, behavior: 'smooth' });
 }, []);

 // Check for existing submission and handle cooldown
 useEffect(() => {
   const storedSubmissionTime = localStorage.getItem('contactFormSubmission');
   if (storedSubmissionTime) {
     const submissionTime = new Date(storedSubmissionTime);
     const currentTime = new Date();
     const timeDiff = currentTime.getTime() - submissionTime.getTime();
     const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
     
     if (timeDiff < tenMinutes) {
       setFormSubmitted(true);
       setSubmissionTime(storedSubmissionTime);
       
       // Set timer to reset form after cooldown period
       const remainingTime = tenMinutes - timeDiff;
       const timer = setTimeout(() => {
         setFormSubmitted(false);
         setSubmissionTime(null);
         localStorage.removeItem('contactFormSubmission');
       }, remainingTime);
       
       return () => clearTimeout(timer);
     } else {
       // Clear expired submission
       localStorage.removeItem('contactFormSubmission');
     }
   }
 }, []);

 // Countdown timer effect
 useEffect(() => {
  if (formSubmitted && submissionTime) {
    const timer = setInterval(() => {
      const remaining = getRemainingTime();
      setCountdown(remaining);
      
      if (!remaining) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }
}, [formSubmitted, submissionTime]);

 const handleRecaptchaChange = (token: string | null) => {
    console.log('reCAPTCHA changed:', token);
    if (token) {
      setValue('recaptcha', true);
      setRecaptchaVerified(true);
    } else {
      setValue('recaptcha', false);
      setRecaptchaVerified(false);
    }
  };


 const whatWeDoDropdownItems = [
    { name: 'Practice Foundations', href: '#services', cardId: 0 },
    { name: 'Technology Driven Capabilities', href: '#services', cardId: 1 },
    { name: 'Pre & Post Encounter', href: '#services', cardId: 2 },
    { name: 'Claims Management', href: '#services', cardId: 3 },
    { name: 'Specialty Billing', href: '#services', cardId: 4 },
    { name: 'Real Time Insights', href: '#services', cardId: 5 }
  ];

 const contactNavigationItems = [
    { name: 'About Us', href: '#about', hasDropdown: true },
    { name: 'What We Do', href: '#services', hasDropdown: true },
    { name: 'Who We Serve', href: '#who-we-serve', hasDropdown: true }
  ];



   const aboutDropdownItems2 = [
    { name: 'Our Story & Inspiration', href: '#about', cardId: 0 },
    { name: 'Our Mission & Vision', href: '#about', cardId: 1 },
    { name: 'Our Values & Principles', href: '#about', cardId: 2 },
    { name: 'Our Approach & Methodology', href: '#about', cardId: 3 },
    { name: 'Our Innovative Technologies', href: '#about', cardId: 4 },
    { name: 'Our Team & Expertise', href: '#leadership', cardId: 5 }
  ];

  const whoWeServeDropdownItems = [
    { name: 'Surgical & Procedural Specialties'},
    { name: 'Interventional & Diagnostic Care'},
    { name: 'Perioperative & Supportive Services'},
    { name: 'Outpatient & Specialty Facilities' }
  ];

  const handleNavClick = (item: { name: string; href: string }) => {
    setActiveMenu(item.name);
    // Navigate to landing page and scroll to section
    navigate('/', { state: { scrollTo: item.href } });
    setIsMobileMenuOpen(false);
  };

  const handleMenuHover = (menuName: string | null) => {
    setHoveredMenu(menuName);
  };

  const handleAboutDropdownHover = (isOpen: boolean) => {
    setIsAboutDropdownOpen(isOpen);
  };

  const handleWhoWeServeDropdownHover = (isOpen: boolean) => {
    setIsWhoWeServeDropdownOpen(isOpen);
  };

  const handleWhatWeDoDropdownHover = (isOpen: boolean) => {
    setIsWhatWeDoDropdownOpen(isOpen);
  };

  const handleAboutDropdownItemClick = (href: string) => {
    navigate('/', { state: { scrollTo: href } });
    setIsAboutDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleWhatWeDoDropdownItemClick = (dropdownItem: any) => {
    navigate('/', { state: { scrollTo: dropdownItem.href, cardId: dropdownItem.cardId } });
    setIsWhatWeDoDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleWhoWeServeDropdownItemClick = (href: string) => {
    navigate('/', { state: { scrollTo: href } });
    setIsWhoWeServeDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleContactRequest = () => {
    // Navigate to contact page
    navigate('/contact');
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch,
  } = useForm({
    resolver: yupResolver(contactSchema),
    mode: 'onChange'
  });

  const scheduledTimeValue = watch('scheduledTime') as string | undefined;

  const onSubmit = async (data: any) => {
    console.log('Form submitted with data:', data);
    setIsSubmitting(true);

    const token = captchaRef.current?.getValue();
    console.log('reCAPTCHA token:', token);
    
    // Check if reCAPTCHA is configured
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    console.log('reCAPTCHA site key configured:', !!recaptchaSiteKey);
    
    if (recaptchaSiteKey && !token) {
      alert('Please complete the CAPTCHA.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const payload = {
        ...data,
        scheduledTime: data.scheduledTime,
        recaptchaToken: token || 'development-bypass'
      };
      
      console.log('API payload:', payload);

      const apiUrl = import.meta.env.VITE_API_URL || '';
      console.log('API URL:', apiUrl);
      console.log('Full endpoint:', `${apiUrl}/contact-requests`);
       
      const response = await axios.post(`${apiUrl}/contact-requests`, payload);
      console.log('API response:', response);
      
      if (response.data.success) {
        toast.success('Your request has been submitted successfully!');
        
        // Create calendar event
        try {
          await axios.post(`${apiUrl}/create-event`, {
            title: data.name,
            dateTime: data.scheduledTime,
          });
          alert("Submitted & Event Created!");
        } catch (eventError) {
          console.error('Calendar event creation failed:', eventError);
          toast.error('Form submitted but calendar event creation failed');
        }
        
        // Store submission time and set form submitted state
        const currentSubmissionTime = new Date().toISOString();
        localStorage.setItem('contactFormSubmission', currentSubmissionTime);
        setSubmissionTime(currentSubmissionTime);
        setFormSubmitted(true);
        
        // Reset form
        setValue('name', '');
        setValue('phoneNumber', '');
        setValue('email', '');
        setValue('organization', '');
        setValue('message', '');
        setValue('scheduledTime', '');
        setRecaptchaVerified(false);
        setValue('recaptcha', false);
        
        // Reset reCAPTCHA component
        if (captchaRef.current) {
          captchaRef.current.reset();
        }
        
        // Set timer to reset form after 10 minutes
        setTimeout(() => {
          setFormSubmitted(false);
          setSubmissionTime(null);
          localStorage.removeItem('contactFormSubmission');
        }, 10 * 60 * 1000); // 10 minutes
        
        // Scroll to top when form is submitted successfully with a delay
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        toast.error(response.data.message || 'Failed to submit request. Please try again.');
      }
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please try again later.');
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to submit request. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  // Calculate remaining time for cooldown
  const getRemainingTime = () => {
    if (!submissionTime) return null;
    
    const submission = new Date(submissionTime);
    const currentTime = new Date();
    const timeDiff = currentTime.getTime() - submission.getTime();
    const tenMinutes = 10 * 60 * 1000;
    const remainingTime = tenMinutes - timeDiff;
    
    if (remainingTime <= 0) return null;
    
    const minutes = Math.floor(remainingTime / (60 * 1000));
    const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
    
    return { minutes, seconds };
  };

  return (
    <div className="contact-us-container">
      {/* Contact Banner */}
      
      {/* Header */}
      <header className="dyad-header">
       
         
        <div className="dyad-header-content">
          {/* Left - Logo */}
          <div className="dyad-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img 
              src="/assets/images/logo_main.png" 
              alt="Dyad Logo" 
              className="logo-image"
            />
          </div>

          {/* Right - Navigation and Buttons */}
          <div className="dyad-nav-actions">
            {/* Navigation */}
            <nav className="dyad-nav">
              <ul className="nav-list" style={{ gap: '0rem' }}>
                {contactNavigationItems.map((item) => {
                  const isActive = activeMenu === item.name;
                  return (
                    <li key={item.name} className="nav-item-container"
                      onMouseEnter={() => {
                        handleMenuHover(item.name);
                        if (item.hasDropdown) {
                          if (item.name === 'About Us') {
                            handleAboutDropdownHover(true);
                          } else if (item.name === 'Who We Serve') {
                            handleWhoWeServeDropdownHover(true);
                          } else if (item.name === 'What We Do') {
                            handleWhatWeDoDropdownHover(true);
                          }
                        }
                      }}
                      onMouseLeave={() => {
                        handleMenuHover(null);
                        if (item.hasDropdown) {
                          if (item.name === 'About Us') {
                            handleAboutDropdownHover(false);
                          } else if (item.name === 'Who We Serve') {
                            handleWhoWeServeDropdownHover(false);
                          } else if (item.name === 'What We Do') {
                            handleWhatWeDoDropdownHover(false);
                          }
                        }
                      }}
                    >
                      {item.hasDropdown ? (
                        <div className="dropdown-container">
                          <a 
                            style={{ 
                              color: hoveredMenu === item.name ? '#1D6DD8' : '#374151',
                              cursor: 'pointer',
                              textDecoration: 'none',
                              fontWeight: 400,
                              fontSize: '1.1rem',
                              fontFamily: 'Prompt, sans-serif',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            {item.name}
                            <svg 
                              width="16" 
                              height="16" 
                              viewBox="0 0 16 16" 
                              fill="none" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                d="M4 6L8 10L12 6" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                          </a>
                          <div className={`dropdown-menu ${
                            (item.name === 'About Us' && isAboutDropdownOpen) || 
                            (item.name === 'Who We Serve' && isWhoWeServeDropdownOpen) ||
                            (item.name === 'What We Do' && isWhatWeDoDropdownOpen)
                              ? 'open' : ''
                          }`}>
                            {item.name === 'About Us' && aboutDropdownItems2.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleAboutDropdownItemClick(dropdownItem.href);
                                }}
                                className="dropdown-item"
                                style={{
                                  display: 'block',
                                  padding: '0.75rem 1rem',
                                  color: '#374151',
                                  textDecoration: 'none',
                                  fontSize: '0.95rem',
                                  fontFamily: 'Prompt, sans-serif',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                            {item.name === 'Who We Serve' && whoWeServeDropdownItems.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                 
                                }}
                                className="dropdown-item"
                                style={{
                                  display: 'block',
                                  padding: '0.75rem 1rem',
                                  color: '#374151',
                                  textDecoration: 'none',
                                  fontSize: '0.95rem',
                                  fontFamily: 'Prompt, sans-serif',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                            {item.name === 'What We Do' && whatWeDoDropdownItems.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleWhatWeDoDropdownItemClick(dropdownItem);
                                }}
                                className="dropdown-item"
                                style={{
                                  display: 'block',
                                  padding: '0.75rem 1rem',
                                  color: '#374151',
                                  textDecoration: 'none',
                                  fontSize: '0.95rem',
                                  fontFamily: 'Prompt, sans-serif',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <a 
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(item);
                          }}
                          style={{ 
                            color: isActive ? '#1D6DD8' : '#374151',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            fontWeight: 400,
                            fontSize: '1.1rem',
                            fontFamily: 'Prompt, sans-serif',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {item.name}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Action Buttons */}
            <div className="dyad-actions">
              <button className="btn btn-primary" onClick={handleLogin}>
                <span>Login/Register</span>
              </button>
              <button className="btn btn-primary" onClick={handleContactRequest}>
                <span>Contact Us</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              {contactNavigationItems.map((item) => {
                  const isActive = activeMenu === item.name;
                  return (
                    <li key={item.name}>
                      {item.hasDropdown ? (
                        <div className="mobile-dropdown-container">
                          <a 
                            onClick={(e) => {
                              e.preventDefault();
                              if (item.name === 'About Us') {
                                handleAboutDropdownHover(!isAboutDropdownOpen);
                              } else if (item.name === 'Who We Serve') {
                                handleWhoWeServeDropdownHover(!isWhoWeServeDropdownOpen);
                              } else if (item.name === 'What We Do') {
                                handleWhatWeDoDropdownHover(!isWhatWeDoDropdownOpen);
                              }
                            }}
                            className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                            style={{ 
                              color: isActive ? '#1D6DD8' : '#374151',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            {item.name}
                            <svg 
                              className={`mobile-dropdown-arrow ${
                                (item.name === 'About Us' && isAboutDropdownOpen) || 
                                (item.name === 'Who We Serve' && isWhoWeServeDropdownOpen) 
                                  ? 'open' : ''
                              }`}
                              width="16" 
                              height="16" 
                              viewBox="0 0 16 16" 
                              fill="none" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                d="M4 6L8 10L12 6" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                          </a>
                          <div className={`mobile-dropdown-menu ${
                            (item.name === 'About Us' && isAboutDropdownOpen) || 
                            (item.name === 'Who We Serve' && isWhoWeServeDropdownOpen) ||
                            (item.name === 'What We Do' && isWhatWeDoDropdownOpen)
                              ? 'open' : ''
                          }`}>
                            {item.name === 'About Us' && aboutDropdownItems2.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleAboutDropdownItemClick(dropdownItem.href);
                                }}
                                className="mobile-dropdown-item"
                                style={{
                                  display: 'block',
                                  padding: '0.75rem 1rem 0.75rem 2rem',
                                  color: '#374151',
                                  textDecoration: 'none',
                                  fontSize: '0.9rem',
                                  fontFamily: 'Prompt, sans-serif',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                            {item.name === 'Who We Serve' && whoWeServeDropdownItems.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                 
                                }}
                                className="mobile-dropdown-item"
                                style={{
                                  display: 'block',
                                  padding: '0.75rem 1rem 0.75rem 2rem',
                                  color: '#374151',
                                  textDecoration: 'none',
                                  fontSize: '0.9rem',
                                  fontFamily: 'Prompt, sans-serif',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                            {item.name === 'What We Do' && whatWeDoDropdownItems.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleWhatWeDoDropdownItemClick(dropdownItem);
                                }}
                                className="mobile-dropdown-item"
                                style={{
                                  display: 'block',
                                  padding: '0.75rem 1rem 0.75rem 2rem',
                                  color: '#374151',
                                  textDecoration: 'none',
                                  fontSize: '0.9rem',
                                  fontFamily: 'Prompt, sans-serif',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <a 
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(item);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                          style={{ 
                            color: isActive ? '#1D6DD8' : '#374151',
                            cursor: 'pointer'
                          }}
                          href={item.href}
                        >
                          {item.name}
                        </a>
                      )}
                    </li>
                  );
                })}
            </ul>
          </nav>
          <div className="mobile-actions">
            <button className="btn btn-primary btn-full" onClick={handleContactRequest}>
              <span>Contact Us</span>
            </button>
            <button className="btn btn-primary btn-full" onClick={handleLogin}>
              <span>Login/Register</span>
            </button>
          </div>
        </div>
      </header>

       <div className="contact-banner">
        <img 
          src="/assets/images/contactbanner.png" 
          alt="Contact Us Banner" 
          className="contact-banner-image"
        />
      </div>

      {/* Main Content */}
      <main className="contact-main">
        {/* Banner Section */}
      

        {/* Form Section */}
        <section className="contact-form-section mb-8">
          <div className="form-container">
            {/* Left Side - Form */}
            <div className="form-left-section">
              {formSubmitted ? (
                <div className="success-container">
                  <div className="success-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2"/>
                      <path d="M8 12L11 15L16 9" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h2 className="success-title">Contact Request Submitted Successfully!</h2>
                  <p className="success-message">We will contact you back soon.</p>
                 
                </div>
              ) : (
                <>
                  <div className="form-header-content">
                    <h2 className="form-title">To Be Filled Out By Providers Or Administrators:</h2>
                  </div>
                  <br />
                  <form onSubmit={handleSubmit(onSubmit)} className="contact-form" id="demo-form">
                {/* Name Field */}
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="name" className="form-label">
                      Your Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      {...register('name')}
                    />
                    {errors.name && (
                      <span className="error-message">{errors.name.message}</span>
                    )}
                  </div>

                  {/* Phone Number Field */}
                 
                </div>
                <div className='form-row'>
                   <div className="form-field">
                    <label htmlFor="phoneNumber" className="form-label">
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                      maxLength={10}
                      {...register('phoneNumber')}
                    />
                    {errors.phoneNumber && (
                      <span className="error-message">{errors.phoneNumber.message}</span>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="email" className="form-label">
                      Your Email*
                    </label>
                    <input
                      type="email"
                      id="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      {...register('email')}
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email.message}</span>
                    )}
                  </div>

                 
                </div>

                <div className='form-row'>
                   {/* Organization Field */}
                  <div className="form-field">
                    <label htmlFor="organization" className="form-label">
                      Practice Name/Facility Name*
                    </label>
                    <input
                      type="text"
                      id="organization"
                      className={`form-input ${errors.organization ? 'error' : ''}`}
                      {...register('organization')}
                    />
                    {errors.organization && (
                      <span className="error-message">{errors.organization.message}</span>
                    )}
                  </div>
                </div>

                {/* Message Field */}
                <div className="form-row">
                  <div className="form-field full-width">
                    <label htmlFor="message" className="form-label">
                      Enter a brief Message*
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder='Do not leave information protected under HIPAA. This form is intended for providers and administrators only.'
                      className={`form-textarea ${errors.message ? 'error' : ''}`}
                      {...register('message')}
                    />
                    {errors.message && (
                      <span className="error-message">{errors.message.message}</span>
                    )}
                  </div>
                </div>

                {/* Schedule Time */}
                <div className="form-row">
                  <div className="form-field full-width">
                    <label className="form-label">
                      Schedule a time to connect*
                    </label>
                    <input type="hidden" {...register('scheduledTime')} />
                    <DateTimePicker
                      value={scheduledTimeValue || ''}
                      onChange={(val) => setValue('scheduledTime', val, { shouldValidate: true })}
                      hasError={!!errors.scheduledTime}
                    />
                    {errors.scheduledTime && (
                      <span className="error-message">{errors.scheduledTime.message}</span>
                    )}
                  </div>
                </div>
  <ReCAPTCHA 
    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeFuKksAAAAAG1iqkO6MePDHwYShw-cS26vQHC3'} 
    ref={captchaRef} 
    onChange={handleRecaptchaChange}
  />
  <input type="hidden" {...register('recaptcha')} /> 
              
              {/* Submit Button */}
              <div className="form-group full-width">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
              </form>
                </>
              )}
            </div>
            
            {/* Right Side - Image */}
            <div className="form-right-section">
              <img src="/assets/images/contact-us.jpeg" alt="Contact Us" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
    <footer className="footer-section" id="contact">
        <div className="footer-container">
          <div className="footer-content">
            {/* Column 1: Logo and Description */}
            <div className="footer-column">
              <div className="footer-logo">
                <img src="/assets/images/dyadmain-logofooter.svg" alt="Dyad Logo" />
              </div>
              <p className="footer-description" style={{textAlign: 'justify'}}>
                Dyad is a fully integrated healthcare finance operations platform for anesthesia, ambulatory surgery centers, and the surgical specialties that operate within them, built on bank-grade infrastructure. We replace fragmented vendors with a single operating layer powered by deep industry expertise, advanced technologies, and institutional-grade risk controls, delivering end-to-end precision. One platform for independent practices, physician groups, private equity-backed portfolios, and managed services organizations. Truly integrated. Exponentially scalable.
              </p>
            </div>

            {/* Column 2: Services */}
            <div className="footer-column">
              <h3 className="footer-column-title">Services</h3>
              <ul className="footer-menu">
                <li><a href="#services">Practice Foundations</a></li>
                <li><a href="#services">Technology Driven Capabilities</a></li>
                <li><a href="#services">Pre & Post Encounter</a></li>
                <li><a href="#services">Claims Management</a></li>
                <li><a href="#services">Specialty Billing</a></li>
                <li><a href="#services">Real Time Insights</a></li>
              </ul>
            </div>

            {/* Column 3: Specialties */}
            <div className="footer-column">
              <h3 className="footer-column-title">Specialties</h3>
              <ul className="footer-menu">
                <li><a href="#surgical-specialties">Surgical & Procedural Specialties</a></li>
                <li><a href="#interventional-care">Interventional & Diagnostic Care</a></li>
                <li><a href="#perioperative-services">Perioperative & Supportive Services</a></li>
                <li><a href="#outpatient-facilities">Outpatient & Specialty Facilities</a></li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="footer-column">
              <h3 className="footer-column-title">Contact</h3>
              <div className="footer-contact-info">
                <div className="contact-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-mail w-6 h-6 mr-3"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                  <span>info@dyadmd.com</span>
                </div>
                <div className="contact-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-map-pin w-6 h-6 mr-3"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>2573 Pacific Coast Hwy, Suite A277<br />Torrance, CA 90505</span>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row: Copyright and Legal */}
          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <p>&copy; 2026 DYAD Practice Solutions. All rights reserved.</p>
            </div>
            <div className="footer-bottom-right">
              <ul className="footer-legal-menu">
                <li><a href="#">Privacy policy</a></li>
                <li><a href="#">Terms of service</a></li>
                <li><a href="#">Cookie policy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;

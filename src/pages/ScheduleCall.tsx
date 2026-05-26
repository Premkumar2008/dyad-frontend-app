import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { InlineWidget } from 'react-calendly';

const CALENDLY_URL = 'https://calendly.com/dyadpracticesolutions/new-meeting';

const ScheduleCall: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const name = searchParams.get('name') || '';
  const email = searchParams.get('email') || '';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f4f4', fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img
          src="/assets/images/logo_main.png"
          alt="Dyad Practice Solutions"
          style={{ height: '54px', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        />
      </div>

      {/* Hero text */}
      <div style={{ textAlign: 'center', padding: '40px 24px 16px' }}>
        <div style={{ display: 'inline-block', backgroundColor: '#173e7a', color: '#a8c8f0', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '20px', marginBottom: '16px' }}>
          Early Access Program
        </div>
        <h1 style={{ margin: '0 0 10px', fontSize: '26px', fontWeight: 700, color: '#1a1a1a' }}>
          Schedule Your Introduction Call
        </h1>
        <p style={{ margin: '0 auto', maxWidth: '520px', fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>
          30-minute video call &nbsp;&middot;&nbsp; Dyad Practice Solutions
        </p>
        {name && (
          <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#9ca3af' }}>
            Scheduling for <strong style={{ color: '#374151' }}>{name}</strong>
            {email && <> &lt;{email}&gt;</>}
          </p>
        )}
      </div>

      {/* Calendly widget */}
      <div style={{ maxWidth: '940px', margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          <InlineWidget
            url={CALENDLY_URL}
            styles={{ height: '700px', width: '100%' }}
            pageSettings={{
              backgroundColor: 'ffffff',
              hideEventTypeDetails: false,
              hideLandingPageDetails: false,
              primaryColor: '00a2ff',
              textColor: '4d5055',
            }}
            prefill={{ name, email }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '0 24px 32px', fontSize: '12px', color: '#9ca3af' }}>
        Dyad Practice Solutions, LLC &nbsp;&bull;&nbsp;
        <a href="/privacy-policy" style={{ color: '#6b7280', textDecoration: 'none' }}>Privacy Policy</a>
        &nbsp;&bull;&nbsp;
        <a href="https://dyadmd.com" style={{ color: '#6b7280', textDecoration: 'none' }}>dyadmd.com</a>
      </div>

    </div>
  );
};

export default ScheduleCall;

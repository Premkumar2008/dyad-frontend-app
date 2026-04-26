import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import LandingHeader from '../components/common/LandingHeader/LandingHeader';
import LandingFooter from '../components/common/LandingFooter/LandingFooter';
import './MobilePolicy.css';

interface MobileTermsProps {
  scrollToSection?: string;
}

const MobileTerms: React.FC<MobileTermsProps> = ({ scrollToSection }) => {
  useEffect(() => {
    if (scrollToSection) {
      const el = document.getElementById(scrollToSection);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [scrollToSection]);

  const tocLinks = [
    { href: 'mobile-terms', label: 'Mobile Terms' },
    { href: 'mobile-services', label: '1. What Mobile Services Cover' },
    { href: 'consent', label: '2. Consent to Mobile Communications' },
    { href: 'sms-opt-out', label: '3. Text Message Opt-Out' },
    { href: 'push-notifications', label: '4. Push Notifications' },
    { href: 'message-rates', label: '5. Message and Data Rates' },
    { href: 'carrier-disclaimer', label: '6. Carrier Disclaimer' },
    { href: 'no-emergency', label: '7. No Emergency Use' },
    { href: 'mobile-terms-privacy', label: '8. Privacy' },
    { href: 'mobile-terms-changes', label: '9. Changes' },
    { href: 'privacy-policy', label: 'Mobile Privacy Policy' },
    { href: 'information-we-collect', label: '1. Information We Collect' },
    { href: 'how-we-use-information', label: '2. How We Use Information' },
    { href: 'text-and-push-data', label: '3. Text & Push Notifications' },
    { href: 'sharing-information', label: '4. How We Share Information' },
    { href: 'data-security', label: '5. Data Security' },
    { href: 'data-retention', label: '6. Data Retention' },
    { href: 'user-choices', label: '7. User Choices' },
    { href: 'children', label: '8. Children' },
    { href: 'third-party-services', label: '9. Third-Party Services' },
    { href: 'privacy-policy-changes', label: '10. Changes to This Policy' },
    { href: 'contact', label: '11. Contact' },
    { href: 'sms-sign-up-disclosure', label: 'SMS Consent Disclosure' },
  ];

  return (
    <div className="mobile-policy-container">
      <LandingHeader />
   <header className="mobile-policy-header">
             
              <h1 className="mobile-policy-title">Mobile Terms and Mobile Privacy Policy</h1>
             
            </header>
      <main className="mobile-policy-main">
        <div className="mobile-policy-layout">

          {/* Table of Contents Sidebar */}
          <nav className="policy-toc" aria-label="On-page navigation">
            <h2>Jump to</h2>
            <ul>
              {tocLinks.map((link) => (
                <li key={link.href}>
                  <a href={`#${link.href}`}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Page Content */}
          <div className="mobile-policy-content">

         

            {/* ── MOBILE TERMS ─────────────────────────────── */}
            <section id="mobile-terms" className="mobile-policy-section">
              <h2>Mobile Terms</h2>
              <p>
                These Mobile Terms apply to the Dyad mobile application, text messaging, push notifications,
                and other mobile communications made available by Dyad Practice Solutions, LLC and its
                affiliated platforms and service lines ("Dyad," "we," "us," or "our"). By using Dyad's
                mobile features, enrolling in text messaging, or enabling push notifications, the user
                agrees to these Mobile Terms.
              </p>

              <div id="mobile-services" className="mobile-policy-subsection">
                <h3>1. What Mobile Services Cover</h3>
                <p>Dyad's mobile features may be used to support administrative, billing, payment, account, and service-related functions, including:</p>
                <ul>
                  <li>cost estimates and patient responsibility estimates;</li>
                  <li>billing statements, payment links, payment confirmations, and receipts;</li>
                  <li>appointment-related administrative reminders and notices;</li>
                  <li>registration, intake, and account setup prompts;</li>
                  <li>security alerts, login codes, and account verification messages; and</li>
                  <li>other account or service-related communications connected to the Dyad platform.</li>
                </ul>
                <p>These communications may be delivered through the Dyad mobile application, SMS text messages, push notifications, or in-app messages.</p>
              </div>

              <div id="consent" className="mobile-policy-subsection">
                <h3>2. Consent to Receive Mobile Communications</h3>
                <p>
                  By providing a mobile number, enrolling in text messaging, or enabling push notifications,
                  the user agrees to receive mobile communications from Dyad and, where applicable, from the
                  provider, practice, facility, or organization using the Dyad platform.
                </p>
                <p>
                  These messages may include transactional, operational, billing, account, and service-related
                  communications. Message frequency will vary based on account activity and the services being used.
                </p>
                <p>Consent to receive text messages is not a condition of purchasing any goods or services.</p>
              </div>

              <div id="sms-opt-out" className="mobile-policy-subsection">
                <h3>3. Text Message Opt-Out</h3>
                <p>
                  A user may opt out of SMS messages at any time by replying <strong>STOP</strong> to any text
                  message. After a STOP request is received, a confirmation text may be sent, and no further
                  text messages will be sent to that number unless the user later re-enrolls.
                </p>
                <p>
                  To receive text messages again after opting out, the user may reply <strong>START</strong> if
                  that option is available or update communication preferences through the applicable Dyad workflow.
                </p>
                <p>For help, reply <strong>HELP</strong> or contact the applicable provider, practice, facility, or organization using the Dyad platform.</p>
              </div>

              <div id="push-notifications" className="mobile-policy-subsection">
                <h3>4. Push Notifications</h3>
                <p>
                  Users who enable push notifications may receive alerts related to billing events, payment
                  confirmations, account activity, security events, workflow updates, and other service-related
                  matters. Push notifications can be turned off through the device settings or, where available,
                  through in-app settings.
                </p>
              </div>

              <div id="message-rates" className="mobile-policy-subsection">
                <h3>5. Message and Data Rates</h3>
                <p>
                  Message and data rates may apply based on the user's wireless plan or mobile carrier agreement.
                  Dyad is not responsible for charges imposed by carriers, internet providers, or other third parties.
                </p>
              </div>

              <div id="carrier-disclaimer" className="mobile-policy-subsection">
                <h3>6. Carrier Disclaimer</h3>
                <p>
                  Wireless carriers are not liable for delayed or undelivered messages. Delivery of text messages
                  and push notifications depends on the user's carrier, device, operating system, and other
                  third-party services outside Dyad's control.
                </p>
              </div>

              <div id="no-emergency" className="mobile-policy-subsection">
                <h3>7. No Emergency Use</h3>
                <p>
                  Dyad's mobile communications are for administrative and service-related purposes only.
                  They are not intended for emergency communications or urgent medical needs. In a medical
                  emergency, call 911 or contact emergency services immediately.
                </p>
              </div>

              <div id="mobile-terms-privacy" className="mobile-policy-subsection">
                <h3>8. Privacy</h3>
                <p>
                  Information collected through Dyad's mobile features is handled in accordance with the{' '}
                  <a href="#privacy-policy">Mobile Privacy Policy</a> and any other applicable privacy notices
                  or notices of privacy practices.
                </p>
              </div>

              <div id="mobile-terms-changes" className="mobile-policy-subsection">
                <h3>9. Changes</h3>
                <p>
                  Dyad may update these Mobile Terms from time to time. Continued use of Dyad's mobile features
                  after an update means the user accepts the revised terms.
                </p>
              </div>
            </section>

            {/* ── MOBILE PRIVACY POLICY ────────────────────── */}
            <section id="privacy-policy" className="mobile-policy-section">
              <h2>Mobile Privacy Policy</h2>
              <p>
                This Mobile Privacy Policy explains how Dyad Practice Solutions, LLC and its affiliated platforms
                and service lines ("Dyad," "we," "us," or "our") collect, use, and disclose information through
                the Dyad mobile application, text messaging, push notifications, and related mobile services.
              </p>

              <div id="information-we-collect" className="mobile-policy-subsection">
                <h3>1. Information We Collect</h3>
                <p>Dyad may collect information provided directly by the user, information generated through use of the mobile application, and information related to mobile communications. Depending on the services being used, this may include:</p>
                <ul>
                  <li>name, phone number, email address, and account details;</li>
                  <li>device information, operating system, app version, internet protocol address, and mobile carrier information;</li>
                  <li>login, authentication, and security activity;</li>
                  <li>billing, estimate, payment, and receipt information;</li>
                  <li>registration, intake, and support request details;</li>
                  <li>app usage and notification engagement data; and</li>
                  <li>other administrative or account-related information submitted or generated through the Dyad platform.</li>
                </ul>
                <p>
                  Where permitted by law and required for the services being delivered, this information may include
                  protected health information or other regulated personal information.
                </p>
              </div>

              <div id="how-we-use-information" className="mobile-policy-subsection">
                <h3>2. How We Use Information</h3>
                <p>Dyad may use mobile information to:</p>
                <ul>
                  <li>operate and support the mobile application and related services;</li>
                  <li>send billing, payment, security, account, and service-related communications;</li>
                  <li>authenticate users and protect account security;</li>
                  <li>deliver customer support;</li>
                  <li>monitor system performance and fix technical issues;</li>
                  <li>improve platform functionality and user experience;</li>
                  <li>maintain business records and audit trails;</li>
                  <li>comply with legal, regulatory, and contractual requirements; and</li>
                  <li>detect, prevent, and address fraud, misuse, or unauthorized access.</li>
                </ul>
                <p>
                  Dyad may also use de-identified or aggregated information for analytics, quality improvement,
                  operational reporting, and platform improvement, as permitted by law.
                </p>
              </div>

              <div id="text-and-push-data" className="mobile-policy-subsection">
                <h3>3. Text Messages and Push Notifications</h3>
                <p>
                  If a user opts into text messaging or enables push notifications, Dyad may use the mobile
                  number, device token, delivery status, and related communication data to send, manage, and
                  document those communications.
                </p>
                <p>Text messages are not encrypted by wireless carriers and may present privacy limitations outside Dyad's control.</p>
              </div>

              <div id="sharing-information" className="mobile-policy-subsection">
                <h3>4. How We Share Information</h3>
                <p>Dyad may share information:</p>
                <ul>
                  <li>with the provider, practice, facility, employer, client, or organization using the Dyad platform, as needed to deliver the relevant services;</li>
                  <li>with service providers that support hosting, communications, analytics, payments, authentication, customer support, and infrastructure;</li>
                  <li>when required by law, regulation, court order, subpoena, or governmental request;</li>
                  <li>to protect the rights, safety, security, or property of Dyad, its users, its clients, or others;</li>
                  <li>in connection with a merger, acquisition, financing, restructuring, or sale of assets; and</li>
                  <li>with the user's consent or at the user's direction.</li>
                </ul>
                <p>Dyad does not sell personal information collected through its mobile services for money.</p>
              </div>

              <div id="data-security" className="mobile-policy-subsection">
                <h3>5. Data Security</h3>
                <p>
                  Dyad uses administrative, technical, and physical safeguards designed to protect information
                  processed through its mobile services. No application, network, or transmission method is
                  completely secure, and Dyad cannot guarantee absolute security.
                </p>
                <p>Users are responsible for protecting their devices, passwords, passcodes, and login credentials.</p>
              </div>

              <div id="data-retention" className="mobile-policy-subsection">
                <h3>6. Data Retention</h3>
                <p>
                  Dyad retains information for as long as reasonably necessary to provide services, maintain
                  required records, support audits and compliance, resolve disputes, enforce agreements, and
                  meet legal or contractual obligations.
                </p>
              </div>

              <div id="user-choices" className="mobile-policy-subsection">
                <h3>7. User Choices</h3>
                <p>Users may choose to stop certain mobile communications by:</p>
                <ul>
                  <li>replying <strong>STOP</strong> to opt out of SMS messages;</li>
                  <li>turning off push notifications through device or in-app settings; and</li>
                  <li>updating account or communication preferences where those options are available.</li>
                </ul>
                <p>Disabling some communications may limit certain features or delay important account updates.</p>
              </div>

              <div id="children" className="mobile-policy-subsection">
                <h3>8. Children</h3>
                <p>
                  Dyad's mobile services are not directed to children under 13 except where used lawfully by a
                  parent, guardian, or authorized representative in connection with account administration.
                </p>
              </div>

              <div id="third-party-services" className="mobile-policy-subsection">
                <h3>9. Third-Party Services</h3>
                <p>
                  The Dyad mobile application may interact with third-party tools, payment processors,
                  authentication vendors, app stores, device operating systems, and other service providers.
                  Dyad is not responsible for the privacy practices of third parties except as required by law
                  or contract.
                </p>
              </div>

              <div id="privacy-policy-changes" className="mobile-policy-subsection">
                <h3>10. Changes to This Policy</h3>
                <p>
                  Dyad may update this Mobile Privacy Policy from time to time. Continued use of Dyad's mobile
                  services after an update means the user accepts the revised policy to the extent permitted by law.
                </p>
              </div>

              <div id="contact" className="mobile-policy-subsection">
                <h3>11. Contact</h3>
                <p>
                  Questions about these mobile policies may be directed to the applicable provider, practice,
                  facility, employer, client, or organization using the Dyad platform, or through the contact
                  channel listed in the applicable Dyad service materials.
                </p>
              </div>
            </section>

            {/* ── SMS CONSENT DISCLOSURE ───────────────────── */}
            <section id="sms-sign-up-disclosure" className="sms-consent-section">
              <h2>SMS Consent Disclosure for Sign-Up Screens</h2>
              <label className="sms-consent-label">
                <input type="checkbox" name="sms-consent" />
                <span>I agree to receive service-related text messages from Dyad.</span>
              </label>
              <p>
                Message frequency varies. Message and data rates may apply. Reply STOP to opt out,
                HELP for help. Consent is not a condition of purchase.
              </p>
              <div className="sms-consent-links">
                <Link to="/mobile-terms">Mobile Terms</Link>
                <span className="sms-consent-separator">|</span>
                <Link to="/mobile-privacy-policy">Mobile Privacy Policy</Link>
              </div>
            </section>

          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default MobileTerms;

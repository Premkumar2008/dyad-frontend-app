import React, { useEffect } from 'react';
import LandingHeader from '../components/common/LandingHeader/LandingHeader';
import LandingFooter from '../components/common/LandingFooter/LandingFooter';
import './PrivacyPolicy.css';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="privacy-policy-container">
      <LandingHeader />

      <main className="privacy-policy-main">
        <div className="privacy-policy-content">
          <h1 className="privacy-policy-title">
            PRIVACY POLICY, CALIFORNIA NOTICE AT COLLECTION, AND SUPPLEMENTAL HIPAA / BUSINESS ASSOCIATE NOTICE
          </h1>
         

          <section className="policy-section">
            <h2>1. Scope</h2>
            <p>
              Dyad Practice Solutions, LLC ("Dyad," "we," "our," or "us") provides administrative, operational, financial, technology-enabled, and revenue cycle support services to healthcare organizations and related users. This Privacy Policy explains how Dyad collects, uses, discloses, stores, and otherwise processes personal information through Dyad websites, forms, portals, mobile applications, integrations, and other online or offline touchpoints that link or refer to this policy (collectively, the "Services").
            </p>
            <p>
              By using the Services, the user acknowledges this Privacy Policy. If the user does not agree with this Privacy Policy, the user should not use the Services.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Information We Collect</h2>
            <p>
              The information Dyad collects depends on the Services used, the user's relationship with Dyad, and the information submitted in connection with onboarding, support, contracting, credentialing, billing, payment, analytics, reporting, or related workflows.
            </p>
            <p>Dyad may collect the following categories of information:</p>
            <ul>
              <li><strong>Identifiers and contact details,</strong> such as name, business name, organization name, mailing address, billing address, email address, telephone number, online account identifiers, and similar contact information.</li>
              <li><strong>Professional or commercial information,</strong> such as job title, role, specialty, facility affiliation, practice information, provider roster information, credentialing status, contract information, payer information, billing information, transaction history, and related business records.</li>
              <li><strong>Account and authentication information,</strong> such as username, password, account preferences, security credentials, and access logs.</li>
              <li><strong>Customer-submitted content,</strong> such as forms, messages, uploaded files, spreadsheets, schedules, contracts, notes, payment records, reimbursement information, and other materials submitted through the Services.</li>
              <li><strong>Internet or network activity information,</strong> such as IP address, browser type, device type, operating system, pages viewed, referring pages, session activity, timestamps, clickstream data, diagnostics, and crash information.</li>
              <li><strong>Approximate geolocation</strong> derived from IP address or device settings, where available.</li>
              <li><strong>Payment and remittance information</strong> processed in connection with invoicing, collections, payment authorization, banking, or related workflows, which may be collected directly by Dyad or by Dyad's payment processors or financial service providers.</li>
              <li><strong>Information received through integrations,</strong> vendors, analytics providers, communication tools, clearinghouses, banking platforms, or other third-party services activated by Dyad, a customer, or an authorized user.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. Sources of Information</h2>
            <p>Dyad may collect personal information:</p>
            <ul>
              <li>Directly from users, customers, clients, or authorized representatives.</li>
              <li>Automatically through use of the Services, including through cookies, logs, pixels, software development kits, and similar technologies.</li>
              <li>From healthcare organizations, physician groups, ambulatory surgery centers, practices, facilities, payers, vendors, payment processors, analytics providers, communication providers, and other service providers.</li>
              <li>From third-party integrations and connected systems enabled by Dyad, a customer, or an authorized user.</li>
              <li>From publicly available or commercially available sources, where lawful and relevant to Dyad's business purposes.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. How We Use Information</h2>
            <p>Dyad may use personal information to:</p>
            <ul>
              <li>Provide, operate, administer, maintain, secure, and improve the Services.</li>
              <li>Create and manage accounts, credentials, permissions, and user access.</li>
              <li>Respond to inquiries, provide support, troubleshoot issues, and communicate with users and customers.</li>
              <li>Support implementation, onboarding, contracting, credentialing, billing, reconciliation, reporting, analytics, payment workflows, and other operational services.</li>
              <li>Process transactions, maintain records, and administer billing and payments.</li>
              <li>Monitor performance, usage, and platform reliability; diagnose errors; and improve product functionality.</li>
              <li>Detect, prevent, and investigate fraud, misuse, unauthorized access, security incidents, and violations of applicable agreements.</li>
              <li>Comply with legal obligations, contractual obligations, industry requirements, and lawful process.</li>
              <li>Generate aggregate or de-identified analytics, benchmarking, reporting, product improvement insights, and business intelligence, in each case as permitted by law.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>5. How We Disclose Information</h2>
            <p>Dyad may disclose personal information for business or operational purposes to the following categories of recipients:</p>
            <ul>
              <li>Affiliates, parent entities, subsidiaries, or related entities under common control.</li>
              <li>Service providers, contractors, vendors, consultants, hosting providers, analytics providers, communications providers, payment processors, banking or remittance partners, document management providers, and other parties performing services on Dyad's behalf.</li>
              <li>Customers, clients, practices, facilities, physician groups, ambulatory surgery centers, or other organizations that use Dyad's Services and direct Dyad's processing activities.</li>
              <li>Third-party integration partners and connected platforms when a user, customer, or authorized administrator activates or permits such integration.</li>
              <li>Professional advisors, including legal, compliance, audit, accounting, financing, and insurance advisors.</li>
              <li>Government agencies, regulators, courts, law enforcement, or other third parties when required by law or when Dyad reasonably believes disclosure is necessary to protect rights, property, safety, systems, customers, users, or the public.</li>
              <li>Successors, purchasers, lenders, investors, or counterparties in connection with an actual or proposed merger, acquisition, financing, restructuring, reorganization, sale of assets, or similar corporate transaction.</li>
            </ul>
            <p>Dyad may also use and disclose aggregate, de-identified, or anonymized information where permitted by law.</p>
          </section>

          <section className="policy-section">
            <h2>6. Cookies and Similar Technologies</h2>
            <p>
              Dyad and its service providers may use cookies, local storage, pixels, tags, scripts, software development kits, server logs, and similar technologies to remember preferences, maintain login sessions, analyze traffic, support security, measure performance, and improve the Services.
            </p>
            <p>
              Users may adjust browser or device settings to control cookies or similar technologies. Disabling certain technologies may affect functionality or availability of portions of the Services.
            </p>
          </section>

          <section className="policy-section">
            <h2>7. Data Retention</h2>
            <p>
              Dyad retains personal information for as long as reasonably necessary for the purposes described in this policy, including to provide the Services, maintain business and operational records, comply with legal and contractual obligations, resolve disputes, enforce agreements, prevent fraud, and protect Dyad, its customers, and its systems. Retention periods may vary depending on the nature of the information, the applicable service, and legal or contractual requirements.
            </p>
          </section>

          <section className="policy-section">
            <h2>8. Data Security</h2>
            <p>
              Dyad uses reasonable administrative, technical, and physical safeguards designed to protect personal information from unauthorized access, destruction, loss, misuse, alteration, or disclosure. No method of transmission over the internet and no method of storage is completely secure. Accordingly, Dyad cannot guarantee absolute security.
            </p>
          </section>

          <section className="policy-section">
            <h2>9. California Notice at Collection and California Privacy Rights</h2>
            <p>
              This section applies to California residents to the extent the California Consumer Privacy Act, as amended, applies to Dyad's processing activities. This section is intended to function as Dyad's California notice at collection and supplemental California privacy notice.
            </p>
            <p><strong>Categories of personal information.</strong> Dyad may collect the categories of personal information described in Section 2 above.</p>
            <p><strong>Business and commercial purposes.</strong> Dyad may collect, use, disclose, and retain personal information for the purposes described in Sections 4 through 8 above.</p>
            <p><strong>Categories of recipients.</strong> Dyad may disclose personal information to the categories of recipients described in Section 5 above.</p>
            <p>
              <strong>Sensitive personal information.</strong> To the extent Dyad collects or processes sensitive personal information under California law, Dyad uses and discloses that information only as reasonably necessary to provide requested services, operate the business, comply with law, protect security and integrity, or for other purposes permitted by applicable law, unless Dyad provides a separate notice and choice where required.
            </p>
            <p>
              [Insert one of the following statements before publication: (A) "Dyad does not sell or share personal information as those terms are defined under California law." or (B) a tailored disclosure describing any sale, sharing, or cross-context behavioral advertising practices together with the required mechanism for submitting an opt-out request.]
            </p>
            <p>Subject to applicable law and verification, California residents may request to:</p>
            <ul>
              <li>Know the categories of personal information Dyad collects, the sources of that information, the purposes for which it is used, and the categories of third parties to whom it is disclosed.</li>
              <li>Access the specific pieces of personal information Dyad has collected about them.</li>
              <li>Request correction of inaccurate personal information maintained by Dyad.</li>
              <li>Request deletion of personal information Dyad has collected from them, subject to legal and operational exceptions.</li>
              <li>Opt out of the sale or sharing of personal information, if Dyad engages in those activities.</li>
              <li>Limit the use and disclosure of sensitive personal information, where that right applies.</li>
              <li>Receive equal service and pricing and not be retaliated against for exercising applicable privacy rights.</li>
            </ul>
            <p>California residents may submit requests by using the contact information below or any privacy request mechanism Dyad makes available on the Services:</p>
            <ul>
              <li>Email: [Insert privacy request email address]</li>
              <li>Phone: [Insert privacy request phone number]</li>
              <li>Webform: [Insert privacy request URL, if applicable]</li>
            </ul>
            <p>
              Dyad will take reasonable steps to verify a request before responding. Dyad may request additional information if necessary to verify identity or authority. Authorized agents may submit requests on a California resident's behalf, subject to proof of authorization and identity verification as permitted by law.
            </p>
            <p>
              Where required by law, Dyad will confirm receipt of a request within 10 business days and will respond within 45 calendar days, unless a longer period is permitted and the requester is notified accordingly.
            </p>
            <p>
              Certain information Dyad processes may be exempt from some or all portions of the California Consumer Privacy Act, including protected health information and certain medical information governed by federal or state healthcare privacy laws, and personal information Dyad processes solely as a service provider or contractor on behalf of a customer, where applicable.
            </p>
            <p>
              If Dyad is required to offer a California opt-out mechanism, Dyad will publish a clear "Your California Privacy Choices" link or another legally compliant method for submitting those requests.
            </p>
          </section>

          <section className="policy-section">
            <h2>10. Third-Party Links and Services</h2>
            <p>
              The Services may contain links to third-party websites, products, or services. Dyad is not responsible for the content, security, or privacy practices of those third parties. Information disclosed to a third party is governed by that third party's own terms and privacy practices.
            </p>
          </section>

          <section className="policy-section">
            <h2>11. Children's Privacy</h2>
            <p>
              The Services are intended for business and professional use and are not directed to children. Dyad does not knowingly collect personal information from children in violation of applicable law.
            </p>
          </section>

          <section className="policy-section">
            <h2>12. Changes to This Policy</h2>
            <p>
              Dyad may revise this Privacy Policy from time to time to reflect changes in applicable law, the Services, business practices, or technology. The revised version will become effective when posted unless a later date is stated.
            </p>
          </section>

          <section className="policy-section">
            <h2>13. Contact Information</h2>
            <address className="policy-address">
              <p>Dyad Practice Solutions, LLC</p>
              <p>2573 Pacific Coast Highway, Suite A277</p>
              <p>Torrance, California 90505</p>
              <p>Email: <a href="mailto:compliance@dyadmd.com">compliance@dyadmd.com</a></p>
            </address>
          </section>

          <section className="policy-section">
            <h2>14. Supplemental HIPAA and Business Associate Notice</h2>
            <p>
              This supplemental notice applies when Dyad receives, creates, maintains, transmits, or otherwise processes protected health information on behalf of a healthcare provider, health plan, healthcare clearinghouse, or another regulated entity subject to the Health Insurance Portability and Accountability Act of 1996 and its implementing regulations (collectively, "HIPAA").
            </p>
            <p>
              When Dyad performs services involving protected health information for or on behalf of a covered entity or another business associate, Dyad acts only in the role specified in the applicable business associate agreement, subcontractor agreement, service agreement, or other written arrangement. Dyad uses and discloses protected health information only as permitted or required by the applicable agreement, by HIPAA, or by other applicable law.
            </p>
            <p>When this supplemental notice applies:</p>
            <ul>
              <li>Protected health information is governed primarily by the applicable covered entity's Notice of Privacy Practices, the applicable business associate agreement, and HIPAA, rather than solely by the general website privacy terms above.</li>
              <li>Dyad processes protected health information only to perform contracted services, support operations, maintain and secure systems, respond to incidents, carry out lawful instructions, and satisfy legal or regulatory requirements.</li>
              <li>Dyad requires appropriate workforce, vendor, and subcontractor controls designed to protect the confidentiality, integrity, and availability of protected health information, consistent with its contractual and legal obligations.</li>
              <li>Where required, Dyad will report breaches of unsecured protected health information to the applicable covered entity without unreasonable delay and in accordance with HIPAA and the applicable contract.</li>
              <li>Requests relating to access, amendment, accounting of disclosures, restrictions, confidential communications, or other HIPAA rights should generally be directed to the healthcare provider, health plan, or other covered entity with which the individual has a direct relationship. Dyad may support that covered entity in responding to such requests where applicable.</li>
              <li>If there is any conflict between this Privacy Policy and an applicable business associate agreement or HIPAA requirement, the business associate agreement and HIPAA will control with respect to protected health information.</li>
            </ul>
          </section>

          <section className="policy-section policy-section--notice">
            <h2>15. Publication Placeholders to Finalize Before Launch</h2>
            <ul>
              <li>Insert the effective date and last updated date.</li>
              <li>Insert Dyad's privacy email address, phone number, and any privacy request webform URL.</li>
              <li>Finalize the California sale / sharing disclosure and opt-out language based on Dyad's actual advertising, analytics, and data sharing practices.</li>
              <li>Confirm whether Dyad will publish a separate cookie notice, banner, or preference center.</li>
              <li>Confirm whether any SMS, mobile, applicant, vendor, or customer-specific privacy disclosures should be linked separately.</li>
            </ul>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default PrivacyPolicy;

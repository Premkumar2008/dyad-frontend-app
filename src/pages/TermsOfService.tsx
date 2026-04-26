import React, { useEffect } from 'react';
import LandingHeader from '../components/common/LandingHeader/LandingHeader';
import LandingFooter from '../components/common/LandingFooter/LandingFooter';
import './PrivacyPolicy.css';

const TermsOfService: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="privacy-policy-container">
      <LandingHeader />

      <main className="privacy-policy-main">
        <div className="privacy-policy-content">
          <h1 className="privacy-policy-title">
            DYAD PRACTICE SOLUTIONS, LLC
            <br />
            TERMS OF SERVICE
          </h1>
         

          <section className="policy-section">
            <h2>1. DEFINITIONS</h2>
            <p><strong>"Subscriber"</strong> means the entity that enters into an Order or otherwise agrees to be bound by these Terms.</p>
            <p><strong>"Authorized User"</strong> means an employee, contractor, representative, physician, administrator, or other individual authorized by Subscriber to access or use the Services on Subscriber's behalf.</p>
            <p><strong>"Business Associate Agreement"</strong> means the parties' business associate agreement, if applicable, for purposes of compliance with the Health Insurance Portability and Accountability Act of 1996, as amended, and its implementing regulations.</p>
            <p><strong>"Documentation"</strong> means Dyad's then-current user guides, implementation materials, technical specifications, workflow descriptions, and service documentation made available by Dyad.</p>
            <p><strong>"Dyad Materials"</strong> means the Services, software, dashboards, interfaces, workflows, templates, data models, claim logic, reimbursement logic, configuration rules, analytics frameworks, implementation materials, documentation, know-how, methods, and all related intellectual property rights, excluding Subscriber Data.</p>
            <p><strong>"Order"</strong> means an ordering document, statement of work, order form, subscription schedule, implementation schedule, or other written ordering instrument executed by the parties that references these Terms.</p>
            <p><strong>"Services"</strong> means the administrative, technology-enabled, and support services identified in an applicable Order and made available by Dyad, whether delivered directly by Dyad or through Dyad's approved affiliates, subcontractors, licensors, banking partners, clearinghouse partners, payment processors, or other third-party service providers. The Services may include, as applicable, software access, implementation support, data intake, workflow configuration, eligibility and patient responsibility workflows, documentation support, claim preparation workflows, clearinghouse connectivity, remittance workflows, reconciliation support, analytics, dashboards, payment administration workflows, and related administrative enablement services. The Services may also include pilot, beta, evaluation, or limited-release functionality.</p>
            <p><strong>"Subscriber Data"</strong> means all data, content, files, records, reimbursement data, contract data, fee schedules, patient account data, provider data, facility data, roster data, operational data, and other information submitted, transmitted, uploaded, imported, or otherwise made available by or on behalf of Subscriber or its Authorized Users in connection with the Services, excluding Dyad Materials and Usage Data.</p>
            <p><strong>"Third-Party Services"</strong> means products, services, platforms, software, banking rails, payment processors, clearinghouses, credentialing systems, electronic health record systems, practice management systems, and other third-party infrastructure with which the Services interoperate or upon which portions of the Services rely.</p>
            <p><strong>"Usage Data"</strong> means aggregated, de-identified, and statistical information derived from the access to, use of, and operation of the Services, including workflow metrics, system performance metrics, utilization data, and other non-identifiable analytical data.</p>
          </section>

          <section className="policy-section">
            <h2>2. ACCESS TO THE SERVICES</h2>
            <p><strong>2.1 Subscription and Scope.</strong> The Services are provided on a subscription, project, or other fee basis as set forth in the applicable Order. Subscriber's rights are limited to the Services, modules, workflows, and usage levels expressly identified in the applicable Order and Documentation.</p>
            <p><strong>2.2 Authorization.</strong> Subject to Subscriber's compliance with these Terms, Dyad grants Subscriber a limited, non-exclusive, non-transferable, non-sublicensable right during the applicable subscription or service term to permit Authorized Users to access and use the Services solely for Subscriber's internal business operations and solely in accordance with the applicable Order, Documentation, and applicable law.</p>
            <p><strong>2.3 Integrated Operating Model.</strong> Subscriber acknowledges and agrees that Dyad operates as an integrated administrative enablement platform and may deliver the Services through a combination of proprietary tools, licensed technologies, interfaces, approved third-party infrastructure, banking and payment partners, clearinghouse connectivity, implementation personnel, operational support personnel, and approved subcontractors, including offshore support resources where permitted by law and by the parties' contractual arrangements. Dyad remains responsible for managing such service delivery in accordance with these Terms, but Subscriber acknowledges that portions of the Services may depend on Third-Party Services.</p>
            <p><strong>2.4 Suspension.</strong> Dyad may suspend access to the Services, in whole or in part, upon written notice if Dyad reasonably determines that Subscriber or any Authorized User has breached these Terms, poses a security risk, is using the Services in violation of applicable law, or has failed to pay undisputed fees when due following any applicable notice and cure period.</p>
            <p><strong>2.5 Modifications.</strong> Dyad may update, enhance, substitute, or modify components of the Services from time to time, including replacing or changing underlying vendors, infrastructure, or workflows, provided that the overall functionality of the subscribed Services is not materially degraded except as otherwise permitted by these Terms or the applicable Order.</p>
          </section>

          <section className="policy-section">
            <h2>3. SUBSCRIBER OBLIGATIONS</h2>
            <p><strong>3.1 Authorized Users and Accounts.</strong> Subscriber is responsible for all access to and use of the Services by its Authorized Users, for maintaining appropriate access controls, and for promptly disabling access for individuals who are no longer authorized.</p>
            <p><strong>3.2 Accuracy and Authority of Subscriber Data.</strong> Subscriber is solely responsible for the accuracy, completeness, legality, and appropriateness of all Subscriber Data. Subscriber represents and warrants that it has all rights, permissions, consents, notices, and authorizations necessary for Dyad and its approved service providers to receive, host, use, process, transmit, and disclose Subscriber Data as required to perform the Services.</p>
            <p><strong>3.3 Subscriber Retains Business and Compliance Responsibility.</strong> Subscriber remains solely responsible for:</p>
            <ul>
              <li>all clinical decisions;</li>
              <li>all medical judgment;</li>
              <li>final coding, billing, reimbursement, collection, patient communication, and compliance decisions to the extent such decisions require Subscriber approval or oversight;</li>
              <li>compliance with all professional, payer, regulatory, tax, privacy, and healthcare laws applicable to Subscriber's operations; and</li>
              <li>review and approval of outputs, files, submissions, estimates, models, or recommendations before reliance where such review is reasonably required in light of the nature of the output.</li>
            </ul>
            <p><strong>3.4 Restrictions.</strong> Subscriber shall not, and shall not permit any Authorized User or third party to:</p>
            <ul>
              <li>copy, reproduce, modify, disassemble, decompile, reverse engineer, or create derivative works of the Services or Dyad Materials, except to the limited extent expressly permitted by applicable law;</li>
              <li>use the Services for the benefit of an unauthorized third party, on a service bureau basis, or for competitive benchmarking;</li>
              <li>interfere with or circumvent security controls, authentication mechanisms, or usage restrictions;</li>
              <li>upload malicious code or unlawful content;</li>
              <li>use the Services in violation of applicable law; or</li>
              <li>misrepresent eligibility, coding, reimbursement, payment status, patient responsibility, or other regulated or operational data through the Services.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. SUBSCRIBER DATA; LICENSE; DATA RIGHTS</h2>
            <p><strong>4.1 Ownership.</strong> As between the parties, Subscriber retains all right, title, and interest in and to the Subscriber Data, subject to the rights expressly granted to Dyad under these Terms.</p>
            <p><strong>4.2 License to Dyad.</strong> Subscriber grants to Dyad and its affiliates, approved subcontractors, and approved Third-Party Services providers engaged in delivering the Services a non-exclusive, worldwide, royalty-free right and license during the term to host, store, reproduce, transmit, process, display, convert, transform, and otherwise use Subscriber Data solely as necessary to:</p>
            <ul>
              <li>provide, support, secure, maintain, and improve the Services;</li>
              <li>perform implementation, onboarding, migration, support, reconciliation, reporting, analytics, and related administrative workflows;</li>
              <li>enable interoperability with Third-Party Services authorized by Subscriber or required for the subscribed Services; and</li>
              <li>comply with applicable law and enforce these Terms.</li>
            </ul>
            <p><strong>4.3 De-Identified and Aggregated Data.</strong> Dyad may create and use Usage Data and other aggregated, de-identified data derived from Subscriber Data for internal analytics, service improvement, benchmarking, model refinement, quality assurance, security monitoring, operational planning, and development of Dyad's products and services, provided that such data does not identify Subscriber, any patient, or any individual and is not disclosed in identifiable form.</p>
            <p><strong>4.4 Rate and Contract Confidentiality.</strong> Notwithstanding anything to the contrary, Dyad shall not disclose Subscriber-provided payer contracts, contracted rates, reimbursement schedules, fee schedules, or other non-public reimbursement terms to third parties except:</p>
            <ul>
              <li>to Dyad's approved personnel, subcontractors, and service providers with a need to know for purposes of performing the Services and who are bound by confidentiality obligations no less protective than those set forth herein;</li>
              <li>as expressly authorized in writing by Subscriber; or</li>
              <li>as required by applicable law, court order, or governmental process.</li>
            </ul>
            <p><strong>4.5 Data Processing and Privacy.</strong> To the extent Subscriber Data includes protected health information or other regulated personal information, the parties shall comply with the Business Associate Agreement and any applicable data protection requirements incorporated into the Order or required by law.</p>
          </section>

          <section className="policy-section">
            <h2>5. DYAD OBLIGATIONS</h2>
            <p><strong>5.1 Administrative Service Model.</strong> Dyad will provide the Services in a professional and workmanlike manner consistent with industry standards for healthcare administrative and technology-enabled enablement services. Subscriber acknowledges that Dyad is not engaged in the practice of medicine, does not provide legal advice, and does not act as Subscriber's insurer, clearinghouse, bank, or payer.</p>
            <p><strong>5.2 Security.</strong> Dyad will maintain commercially reasonable administrative, technical, and physical safeguards designed to protect Subscriber Data against unauthorized access, use, alteration, disclosure, or destruction. Dyad may satisfy portions of this obligation through approved infrastructure, hosting, payment, and service providers, provided Dyad remains contractually authorized to use them for the Services.</p>
            <p><strong>5.3 Support.</strong> Dyad will provide technical and operational support as described in the applicable Order, service schedule, or Documentation.</p>
            <p><strong>5.4 Service Levels.</strong> If the applicable Order includes service levels, those service levels and remedies shall apply solely to the extent expressly set forth in such Order. Any stated service credits or other remedies shall be Subscriber's sole and exclusive remedy for the applicable service-level failure unless otherwise expressly stated in the Order.</p>
            <p><strong>5.5 No Guarantee of Reimbursement or Collection.</strong> Subscriber acknowledges that healthcare reimbursement, eligibility, patient responsibility, payment timing, collections, claims adjudication, and related financial outcomes depend on numerous variables beyond Dyad's control, including payer rules, plan terms, provider contracts, documentation quality, coding choices, patient circumstances, regulatory changes, bank processing, clearinghouse performance, and third-party system behavior. Accordingly, Dyad does not warrant or guarantee:</p>
            <ul>
              <li>payer reimbursement amounts;</li>
              <li>payment timing;</li>
              <li>claim adjudication outcomes;</li>
              <li>patient collections;</li>
              <li>successful payment processing;</li>
              <li>eligibility responses;</li>
              <li>contract model outputs;</li>
              <li>estimate accuracy; or</li>
              <li>forecasted revenue, savings, or margin results.</li>
            </ul>
            <p><strong>5.6 Estimates and Administrative Outputs.</strong> Any estimates, forecasts, expected reimbursement models, patient responsibility calculations, denial indicators, work queue recommendations, dashboard outputs, or other administrative outputs made available through the Services are provided as administrative tools only and must be reviewed by Subscriber in light of Subscriber's own records, payer rules, and operational judgment before reliance where appropriate.</p>
          </section>

          <section className="policy-section">
            <h2>6. THIRD-PARTY SERVICES AND INFRASTRUCTURE</h2>
            <p><strong>6.1 Third-Party Dependencies.</strong> Certain portions of the Services may depend on Third-Party Services, including electronic health record systems, practice management systems, clearinghouses, payment processors, banking partners, lockbox providers, remittance vendors, credentialing platforms, and communications platforms.</p>
            <p><strong>6.2 Authorized Interoperation.</strong> If Subscriber enables, requests, or otherwise authorizes an integration or workflow involving a Third-Party Service, Subscriber authorizes Dyad to exchange Subscriber Data with that Third-Party Service as reasonably necessary to enable the requested functionality or subscribed Services.</p>
            <p><strong>6.3 Third-Party Terms.</strong> Subscriber may be required to enter into separate terms with certain Third-Party Services providers. Subscriber is responsible for complying with those third-party terms to the extent applicable to Subscriber.</p>
            <p><strong>6.4 Third-Party Performance.</strong> Dyad is not responsible for outages, delays, errors, data corruption, posting failures, remittance delays, network interruptions, bank processing failures, rejected transactions, or other failures caused by Third-Party Services, except to the extent directly caused by Dyad's own failure to properly configure or transmit data within Dyad's control.</p>
          </section>

          <section className="policy-section">
            <h2>7. FEES; PAYMENT ADMINISTRATION; AUTO-DEBIT</h2>
            <p><strong>7.1 Fees.</strong> Subscriber shall pay all fees, implementation charges, subscription fees, transaction fees, support fees, pass-through fees, and other charges set forth in the applicable Order.</p>
            <p><strong>7.2 Payment Methods.</strong> Subscriber shall maintain a valid payment method or other approved payment arrangement on file as required by the applicable Order. If Dyad offers automated debit, invoice payment, lockbox administration, or other payment administration functionality, Subscriber authorizes Dyad and its designated payment or banking partners to process such payments in accordance with the applicable Order and any separately executed payment authorization.</p>
            <p><strong>7.3 Payment Administration Feature.</strong> If Subscriber elects to use payment administration, automated clearing house debit, card processing, lockbox administration, or similar payment functionality made available through or in connection with the Services, such functionality may be provided by third-party banking or payment partners. Subscriber agrees to provide all information reasonably required by such partners and acknowledges that such services may be subject to separate onboarding, underwriting, compliance review, and transaction terms.</p>
            <p><strong>7.4 Variable Billing Inputs.</strong> Where fees are calculated based on claim volume, encounter volume, provider count, facility count, transaction volume, or other operational metrics, such fees shall be determined in accordance with the pricing logic, data sources, and timing rules set forth in the applicable Order. Dyad may rely on system-of-record data, imported files, or mutually agreed reconciliation logic for invoice generation.</p>
            <p><strong>7.5 Nonpayment.</strong> Overdue undisputed amounts will accrue interest at the lesser of one and one-half percent (1.5%) per month or the maximum lawful rate. Dyad may suspend Services for nonpayment of undisputed amounts following written notice and any applicable cure period set forth in the Order.</p>
          </section>

          <section className="policy-section">
            <h2>8. INTELLECTUAL PROPERTY</h2>
            <p><strong>8.1 Dyad Ownership.</strong> As between the parties, Dyad owns and retains all right, title, and interest in and to the Dyad Materials, the Services, the platform architecture, interfaces, workflows, logic, templates, implementations, analytics models, and all improvements, modifications, derivatives, and enhancements thereto.</p>
            <p><strong>8.2 Subscriber Ownership.</strong> As between the parties, Subscriber owns and retains all right, title, and interest in and to Subscriber Data.</p>
            <p><strong>8.3 Feedback.</strong> If Subscriber or any Authorized User provides suggestions, comments, recommendations, workflow ideas, enhancement requests, or other feedback relating to the Services, Dyad may use such feedback without restriction or obligation, and all right, title, and interest in any such feedback as incorporated into the Services shall vest in Dyad.</p>
          </section>

          <section className="policy-section">
            <h2>9. CONFIDENTIALITY</h2>
            <p>Each party shall protect the other party's Confidential Information using at least reasonable care and shall use such Confidential Information only as necessary to perform or receive the Services or exercise rights under these Terms. Dyad may disclose Confidential Information to its affiliates, approved subcontractors, and approved service providers with a need to know, provided such recipients are bound by confidentiality obligations no less protective than those set forth herein. Confidential Information excludes information that is publicly available without breach, already lawfully known without restriction, or independently developed without use of the other party's Confidential Information.</p>
          </section>

          <section className="policy-section">
            <h2>10. WARRANTIES AND DISCLAIMERS</h2>
            <p><strong>10.1 Mutual Authority.</strong> Each party represents that it has full power and authority to enter into these Terms.</p>
            <p><strong>10.2 Dyad Limited Warranty.</strong> Dyad warrants that it will perform the Services in a professional and workmanlike manner consistent with generally accepted standards for similar services.</p>
            <p><strong>10.3 Disclaimer.</strong> EXCEPT AS EXPRESSLY SET FORTH IN THESE TERMS OR AN APPLICABLE ORDER, THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE." DYAD DISCLAIMS ALL OTHER WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, AND ANY WARRANTY ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.</p>
            <p>WITHOUT LIMITING THE FOREGOING, DYAD DOES NOT WARRANT THAT:</p>
            <ul>
              <li>THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE;</li>
              <li>ALL DEFECTS WILL BE CORRECTED;</li>
              <li>ALL THIRD-PARTY INTEGRATIONS WILL REMAIN AVAILABLE;</li>
              <li>ALL OUTPUTS WILL BE COMPLETE, ACCURATE, OR FIT FOR A PARTICULAR PURPOSE; OR</li>
              <li>THE SERVICES WILL ACHIEVE ANY PARTICULAR REVENUE, COLLECTION, MARGIN, REIMBURSEMENT, OR OPERATIONAL RESULT.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>11. INDEMNIFICATION</h2>
            <p><strong>11.1 By Subscriber.</strong> Subscriber shall defend, indemnify, and hold harmless Dyad and its affiliates, officers, directors, employees, contractors, subcontractors, licensors, and service providers from and against any third-party claims, losses, liabilities, damages, judgments, costs, and expenses, including reasonable attorneys' fees, arising out of or relating to:</p>
            <ul>
              <li>Subscriber Data;</li>
              <li>Subscriber's or its Authorized Users' misuse of the Services;</li>
              <li>Subscriber's breach of these Terms; or</li>
              <li>Subscriber's violation of applicable law.</li>
            </ul>
            <p><strong>11.2 By Dyad.</strong> Dyad shall defend, indemnify, and hold harmless Subscriber and its officers, directors, and employees from and against any third-party claims alleging that the Services, as provided by Dyad and used by Subscriber in accordance with these Terms, infringe a United States intellectual property right, except to the extent the claim arises from Subscriber Data, Third-Party Services selected by Subscriber, Subscriber's modifications, or Subscriber's misuse of the Services.</p>
          </section>

          <section className="policy-section">
            <h2>12. LIMITATION OF LIABILITY</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, BUSINESS OPPORTUNITY, GOODWILL, OR DATA, ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
            <p>EXCEPT FOR:</p>
            <ul>
              <li>SUBSCRIBER'S PAYMENT OBLIGATIONS;</li>
              <li>A PARTY'S CONFIDENTIALITY BREACH;</li>
              <li>A PARTY'S GROSS NEGLIGENCE, WILLFUL MISCONDUCT, OR FRAUD;</li>
              <li>SUBSCRIBER'S MISUSE OF DYAD MATERIALS; OR</li>
              <li>A PARTY'S INDEMNIFICATION OBLIGATIONS,</li>
            </ul>
            <p>EACH PARTY'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICES SHALL NOT EXCEED THE TOTAL FEES PAID OR PAYABLE BY SUBSCRIBER TO DYAD UNDER THE APPLICABLE ORDER DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.</p>
          </section>

          <section className="policy-section">
            <h2>13. TERM AND TERMINATION</h2>
            <p><strong>13.1 Term.</strong> These Terms commence on the Effective Date and continue until expiration or termination of all Orders.</p>
            <p><strong>13.2 Termination for Cause.</strong> Either party may terminate these Terms or an applicable Order for material breach if the breach remains uncured thirty (30) days after written notice, or immediately upon written notice in the event of insolvency, bankruptcy, or similar proceedings of the other party.</p>
            <p><strong>13.3 Effect of Termination.</strong> Upon termination or expiration:</p>
            <ul>
              <li>Subscriber's access rights cease, except as otherwise set forth in the applicable Order;</li>
              <li>Subscriber remains responsible for all accrued fees and charges;</li>
              <li>each party shall return or destroy the other party's Confidential Information upon request, subject to legal retention requirements and routine backup retention; and</li>
              <li>provisions that by their nature should survive shall survive, including payment obligations, confidentiality, intellectual property, disclaimers, indemnities, limitations of liability, and data rights with respect to previously created Usage Data.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>14. MISCELLANEOUS</h2>
            <p><strong>14.1 Service Availability.</strong> Dyad may schedule maintenance, upgrades, patches, migrations, or infrastructure changes from time to time. Dyad will use commercially reasonable efforts to provide advance notice of material planned downtime where practicable.</p>
            <p><strong>14.2 Assignment.</strong> Neither party may assign these Terms without the other party's prior written consent, except to an affiliate or in connection with a merger, reorganization, sale of substantially all assets, or similar transaction.</p>
            <p><strong>14.3 Governing Law and Venue.</strong> These Terms shall be governed by the laws of the State of California, without regard to conflict of laws principles. The state and federal courts located in Los Angeles County, California shall have exclusive jurisdiction over disputes arising out of or relating to these Terms, and each party irrevocably submits to such jurisdiction and venue.</p>
            <p><strong>14.4 Entire Agreement.</strong> These Terms, together with the applicable Order, Business Associate Agreement, service schedules, and any expressly incorporated policies, constitute the complete agreement between the parties with respect to the subject matter hereof and supersede all prior or contemporaneous discussions, proposals, and agreements relating thereto.</p>
            <p><strong>14.5 Order Controls.</strong> If there is a conflict between these Terms and an executed Order, the Order shall control solely with respect to the specific subject matter of that Order.</p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default TermsOfService;

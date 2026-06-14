import React from 'react';

export const LpoaDocumentBody: React.FC = () => (
  <div className="ob-bank-agr-scroll">
    <h3>LIMITED POWER OF ATTORNEY</h3>
    <p>This Limited Power of Attorney (&ldquo;LPOA&rdquo;) is granted by the undersigned Provider (&ldquo;Principal&rdquo;) to Dyad Practice Solutions, LLC, a California limited liability company (&ldquo;Agent&rdquo; or &ldquo;Dyad&rdquo;), effective as of the date of electronic execution below.</p>
    <h4>1. Grant of Authority</h4>
    <p>The Principal hereby appoints Dyad as its limited attorney-in-fact, with authority to act on the Principal&rsquo;s behalf solely for the following purposes in connection with the services rendered under the Master Services Agreement (&ldquo;MSA&rdquo;) between the Parties:</p>
    <p>(a) <strong>Account Opening &amp; Administration.</strong> To open, establish, and administer a dedicated lockbox deposit account (&ldquo;Lockbox Account&rdquo;) at Live Oak Banking Company, N.A. (&ldquo;Live Oak Bank&rdquo;) through the Anatomy Financial platform, in the name of the Principal, for the receipt, processing, and reconciliation of payments from insurance payers, government programs, patients, and other sources related to the Principal&rsquo;s medical practice.</p>
    <p>(b) <strong>Banking Operations.</strong> To execute banking documents, enrollment forms, and agreements required by Live Oak Bank and Anatomy Financial for the establishment and ongoing operation of the Lockbox Account, including but not limited to account applications, signature cards, ACH enrollment, and ERA/EFT enrollment with payers.</p>
    <p>(c) <strong>Fund Management.</strong> To receive deposits into the Lockbox Account, initiate weekly sweeps of collected funds to the Principal&rsquo;s designated operating account, perform payment posting and reconciliation, and manage banking operations incidental to the revenue cycle services described in the MSA.</p>
    <p>(d) <strong>Payer Enrollment.</strong> To enroll and manage electronic remittance advice (ERA) and electronic funds transfer (EFT) registrations with insurance payers on behalf of the Principal, directing reimbursement payments to the Lockbox Account.</p>
    <h4>2. Limitations</h4>
    <p>This LPOA is strictly limited to the purposes described above. Dyad shall not have authority to: (i) withdraw, transfer, or disburse funds from the Lockbox Account for any purpose other than authorized sweeps to the Principal&rsquo;s designated operating account or fee debits as authorized under Exhibit E (ACH Authorization); (ii) borrow funds, pledge assets, or create liens in the name of the Principal; (iii) close the Lockbox Account without the Principal&rsquo;s prior written consent; or (iv) take any action outside the scope of services defined in the MSA.</p>
    <h4>3. Fiduciary Obligations</h4>
    <p>Dyad acknowledges that it acts in a fiduciary capacity with respect to the Lockbox Account and all funds deposited therein. All funds in the Lockbox Account are the sole property of the Principal. Dyad shall maintain complete transparency regarding all account activity, provide real-time visibility through its reporting platform, and comply with all applicable banking regulations.</p>
    <h4>4. Duration &amp; Revocation</h4>
    <p>This LPOA shall remain in effect for the duration of the MSA. The Principal may revoke this LPOA at any time by providing thirty (30) days&rsquo; written notice to Dyad. Revocation of this LPOA without establishing an alternative banking arrangement may result in disruption of revenue cycle services. This LPOA shall automatically terminate upon termination of the MSA.</p>
    <h4>5. Governing Law</h4>
    <p>This LPOA shall be governed by and construed in accordance with the laws of the State of California and applicable federal banking regulations, including but not limited to the Bank Secrecy Act, USA PATRIOT Act, and FDIC regulations.</p>
  </div>
);

export const AchDocumentBody: React.FC = () => (
  <div className="ob-bank-agr-scroll">
    <h3>EXHIBIT E: ACH AUTHORIZATION AGREEMENT</h3>
    <h4>Authorization Agreement for Automatic Debits and Credits via ACH</h4>
    <p>This ACH Automatic Debit/Credit Authorization Agreement (&ldquo;Agreement&rdquo;), dated as of the Effective Date of enrollment, is entered into by and between Dyad Practice Solutions LLC and the enrolling Provider entity.</p>
    <p>This Exhibit E sets forth the terms and conditions under which Dyad Practice Solutions, LLC (the &ldquo;MSO&rdquo;) is authorized to initiate electronic funds transfers via the Automated Clearing House (&ldquo;ACH&rdquo;) network to and from the designated operating account of the Provider. This authorization includes recurring ACH debits for the payment of service fees due under the Master Services Agreement (&ldquo;MSA&rdquo;) and the applicable Exhibit D: Fee Schedule.</p>
    <h4>ACH Authorization Consent Statement</h4>
    <p>By signing below, the Provider expressly authorizes Dyad Practice Solutions, LLC to electronically initiate recurring ACH debits and credits to and from the designated Provider Operating Account listed herein, pursuant to the Electronic Fund Transfer Act, Regulation E, and NACHA Operating Rules.</p>
    <h4>Third-Party Payment Processor</h4>
    <p>Provider acknowledges and consents that Dyad has engaged Zoho Payment Services Inc. and the &ldquo;Zoho Pay&rdquo; payment platform as its contracted third-party payment service provider for the origination of all ACH debit and credit entries authorized hereunder.</p>
    <p><strong>Independence from Lockbox Infrastructure.</strong> The Live Oak Banking Company / Anatomy Financial lockbox infrastructure established under the Limited Power of Attorney (Section 1) is unrelated to and shall not be involved in the origination, processing, settlement, or any other aspect of the service fee debits authorized under this Exhibit E.</p>
    <h4>Billing &amp; Reconciliation Process</h4>
    <p><strong>Variable Monthly Amounts</strong>: The ACH debit amount will vary based on the services provided to the Provider for the billing period, in accordance with the fee schedule outlined in Exhibit D of the MSA.</p>
    <p><strong>Reconciliation &amp; Review</strong>: The MSO will provide a detailed reconciliation statement and invoice on the last business day of each month.</p>
    <p><strong>Provider Review Period</strong>: The Provider will have five (5) business days to review the invoice and reconciliation statement.</p>
    <p><strong>Automatic Approval &amp; Debit Timing</strong>: If there are no disputes submitted in writing by 12:00 PM on the 5th business day, the MSO will initiate an ACH debit for the full invoiced amount.</p>
    <p><strong>Disputes</strong>: Provider must submit written dispute notice to support@dyadmd.com before the review deadline.</p>
    <h4>General ACH Authorization Terms</h4>
    <p><strong>Returned Payments &amp; Fees</strong>: If a payment is returned due to insufficient funds, closed accounts, or other reasons, Provider agrees to pay applicable fees, including bank-imposed return fees and a $35 administrative fee per occurrence.</p>
    <p><strong>Changes to Banking Information</strong>: Provider must notify the MSO in writing at least ten (10) business days before the next scheduled payment if there is a change to the designated bank account.</p>
    <p><strong>Revocation &amp; Termination</strong>: This authorization will remain in effect until the MSO receives written notice of cancellation at least fifteen (15) business days before the next scheduled debit.</p>
    <h4>Compliance with Applicable Laws</h4>
    <p>This Agreement is subject to all applicable federal and state laws, including EFTA &amp; Regulation E, NACHA Operating Rules, HIPAA and HITECH Act, and state-specific Corporate Practice of Medicine and fee-splitting laws.</p>
  </div>
);

export const ACH_ATTEST_TEXT = (
  <>
    <strong>(i) Authority.</strong> I possess the legal capacity and authority to bind the Provider to this Authorization and to execute this agreement on the Provider&rsquo;s behalf.<br /><br />
    <strong>(ii) ACH Authorization.</strong> I authorize Dyad Practice Solutions, LLC, acting through Zoho Pay and its sponsor ODFI, to initiate recurring variable-amount ACH debit entries from the Provider Operating Account specified above.<br /><br />
    <strong>(iii) Independence from Lockbox.</strong> I acknowledge that the Authorized Account is the Provider&rsquo;s existing operating account and is wholly distinct from the Live Oak Bank lockbox account established under Section 1.<br /><br />
    <strong>(iv) Regulatory Framework.</strong> I acknowledge that this Authorization is given pursuant to EFTA, Regulation E, and NACHA Operating Rules.<br /><br />
    <strong>(v) Notice of Variable Amounts.</strong> I have received clear notice of the variable nature of debit amounts, monthly frequency, and debit trigger timing.<br /><br />
    <strong>(vi) Right of Revocation.</strong> I acknowledge my right to revoke this Authorization with written notice to support@dyadmd.com no fewer than fifteen (15) business days prior to the next scheduled debit.<br /><br />
    <strong>(vii) Right of Dispute.</strong> I acknowledge my right to dispute unauthorized or incorrectly executed electronic funds transfers.<br /><br />
    <strong>(viii) Returned Payments.</strong> I acknowledge the Provider&rsquo;s obligation to pay a $35 administrative fee per returned ACH occurrence.<br /><br />
    <strong>(ix) Substitution of Processor.</strong> I acknowledge that Dyad may substitute its third-party payment processor upon prior written notice.<br /><br />
    <strong>(x) Electronic Signature.</strong> By checking this box, I affix my electronic signature to this Authorization pursuant to the ESIGN Act and applicable UETA.
  </>
);

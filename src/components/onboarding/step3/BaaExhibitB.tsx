import React from 'react';
import {
  AgreementField,
  AgreementSub,
  AgreementSnum,
  DyadSignatureBlock,
} from './agreementHelpers';

export interface BaaExhibitBProps {
  fields: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  providerDisplayName: string;
  showDyadSignature: boolean;
}

const field = (
  props: BaaExhibitBProps,
  key: string,
  placeholder: string,
  size: 's' | 'm' | 'l' = 'm',
  required = true,
) => (
  <AgreementField
    id={`baa-${key}`}
    value={props.fields[key] ?? ''}
    onChange={(v) => props.onFieldChange(key, v)}
    placeholder={placeholder}
    className={size}
    required={required}
  />
);

export const BaaExhibitB: React.FC<BaaExhibitBProps> = (props) => {
  const sigProviderName = props.providerDisplayName || props.fields.pname || '—';

  return (
    <div className="ob-agreement-asc">
      <h2>EXHIBIT B: BUSINESS ASSOCIATE AGREEMENT (BAA)</h2>

      <div className="ob-agreement-provider-header">
        <strong>Provider Name: </strong>
        {field(props, 'pname', 'Provider / Entity Name (required)', 'l')}
      </div>

      <p>
        <strong>THIS BUSINESS ASSOCIATE AGREEMENT</strong> (the &ldquo;Agreement&rdquo;), is entered
        into by and between <strong>Dyad Practice Solutions, LLC</strong> (the &ldquo;Business
        Associate&rdquo;) and {field(props, 'centity', 'Covered Entity Name (required)', 'l')} (the
        &ldquo;Covered Entity&rdquo;) (collectively, the &ldquo;Parties&rdquo;). The Agreement is
        effective as of {field(props, 'edate', 'Effective Date (required)', 'm')} (the &ldquo;Effective
        Date&rdquo;).
      </p>

      <p>
        <strong>Scope of Covered Entity (BAA Only).</strong> For purposes of this Business Associate
        Agreement only, &ldquo;Covered Entity&rdquo; means the signatory entity and any additional
        entities, practice locations, or providers for whom Covered Entity authorizes Business
        Associate to create, receive, maintain, transmit, or access Protected Health Information in
        connection with the Services or Pre-Engagement Activities. If the Parties attach a Schedule 1
        (Covered Entity Roster, Group Identifiers, and Practice Locations), such Schedule 1 will be for
        administrative convenience only and will not limit or expand the scope of Covered Entity
        beyond the written authorizations and PHI protections provided under this Agreement.
      </p>

      <p>
        <strong>RECITALS</strong>
      </p>

      <p>
        <strong>WHEREAS</strong>, the Covered Entity desires to engage the Business Associate to
        participate in preliminary discussions, due diligence, discovery, workflow review,
        implementation planning, system scoping, testing, and other pre-engagement activities that may
        involve the creation, receipt, maintenance, transmission, access to, or use/disclosure of
        Protected Health Information (&ldquo;PHI&rdquo;) solely to evaluate and/or prepare for a
        potential services relationship (collectively, the &ldquo;Pre-Engagement Activities&rdquo;);
      </p>

      <p>
        <strong>WHEREAS</strong>, the Parties may in the future enter into a master services
        agreement, statement of work, service order, or similar written agreement governing services
        (collectively, a &ldquo;Services Agreement&rdquo;), pursuant to which the Business Associate
        may perform services for the Covered Entity (the &ldquo;Services&rdquo;). In addition to the
        Master Services Agreement, the parties will execute, comprehensive agreements that may
        include, but are not limited to, confidentiality agreements, EDI Agreements, ACH Agreements,
        and Delegation of Authority Agreements which shall be incorporated by reference and form an
        integral part of the Master Services Agreement, constituting schedules and addendums
        (collectively, the &ldquo;Agreements&rdquo;).
      </p>

      <p>
        <strong>WHEREAS</strong>, this Agreement is intended to govern PHI exchanged or accessed in
        connection with Pre-Engagement Activities whether or not a Services Agreement is executed,
        and, if a Services Agreement is executed, to be incorporated by reference and govern PHI
        handled in connection with the Services, unless expressly replaced as set forth herein.
      </p>

      <p>
        <strong>WHEREAS</strong>, the parties are committed to compliance with the Health Insurance
        Portability and Accountability Act of 1996 and the Health Information Technology for Economic
        and Clinical Health Act of 2009 and regulations promulgated thereunder, as amended from time
        to time (collectively, &ldquo;HIPAA&rdquo;), and, for purposes of this Agreement, the
        &ldquo;HIPAA Rules&rdquo; which shall mean the Privacy, Security, Breach Notification, and
        Enforcement Rules at 45 CFR Part 160 and Part 164.
      </p>

      <p>
        <strong>WHEREAS</strong>, the Covered Entity may disclose or make available to the Business
        Associate, and the Business Associate may use, disclose, receive, transmit, maintain or
        create to, from, or on behalf of the Covered Entity, health information that is considered
        &ldquo;Protected Health Information&rdquo; or &ldquo;PHI&rdquo; (as defined in HIPAA) in
        connection with the provision of Services to or on behalf of the Covered Entity.
      </p>

      <p>
        <strong>NOW, THEREFORE</strong>, the purpose of this Agreement is to satisfy the obligations
        of the Covered Entity and the Business Associate under HIPAA and ensure the integrity and
        confidentiality of PHI that the Business Associate uses, discloses, receives, transmits,
        maintains or creates to, from, or on behalf of the Covered Entity.
      </p>

      <p>
        <strong>TERMS</strong>
      </p>

      <AgreementSub>
        <AgreementSnum>1. Definitions.</AgreementSnum> The following terms used in this Agreement
        shall have the same meaning as in the HIPAA Rules: Breach, Data Aggregation, Designated
        Record Set, Health Care Operations, Individual, Minimum Necessary, Notice of Privacy
        Practices, Required By Law, Secretary, Security Incident, Subcontractor, and Unsecured
        Protected Health Information.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>Additional Definitions.</AgreementSnum> (a) &ldquo;Pre-Engagement
        Activities&rdquo; has the meaning set forth in the Recitals. (b) &ldquo;Services
        Agreement&rdquo; has the meaning set forth in the Recitals. (c) &ldquo;Services&rdquo; means
        (i) Pre-Engagement Activities, and (ii) if executed, the services performed under a Services
        Agreement to the extent such services involve PHI. (d) &ldquo;Agreements&rdquo; means, only if
        and when executed by the Parties, the Services Agreement and any related schedules, addenda,
        or ancillary agreements that involve PHI.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>2. Obligations and Activities of Business Associate.</AgreementSnum> The
        Business Associate agrees to:
      </AgreementSub>
      <AgreementSub>
        (a) Not use or disclose PHI other than as permitted or required by this Agreement and the
        Agreements, or as required by law;
      </AgreementSub>
      <AgreementSub>
        (b) Develop, implement, use, and monitor appropriate safeguards, at its expense, and comply
        with the Security Rule with respect to electronic PHI, to prevent use or disclosure of PHI
        other than as provided for by this Agreement;
      </AgreementSub>
      <AgreementSub>
        (c) Encrypt PHI (using standards consistent with those issued by the National Institute of
        Standards and Technology (NIST)) in transmission and/or at rest if the Business Associate
        transmits PHI over wireless networks or stores PHI on the cloud;
      </AgreementSub>
      <AgreementSub>
        (d) Report to the Covered Entity any use or disclosure of PHI not permitted by HIPAA and the
        Agreements, including any Breach of Unsecured Protected Health Information, and any security
        incident, as required by 45 CFR 164.410. Such report must be made immediately after, but in
        no case more than 24 hours after, discovery of such impermissible use, disclosure, Breach, or
        Security Incident. The Business Associate will cooperate fully with the Covered Entity in
        responding to such event and will supplement such initial report with additional information
        as soon as it becomes available, including all information available to the Business Associate
        that is required to be included in notices to affected individuals, regulators, or other
        entities required by HIPAA or applicable state laws. For purposes of Security Incidents in
        this subsection (d), notice is hereby deemed provided, and no further notice will be
        provided, for unsuccessful attempts at unauthorized use or disclosure such as pings and
        other broadcast attacks on a firewall, port scans, unsuccessful login attempts, denial of
        service attacks or detection of malware. The Business Associate will bear all costs,
        including fines, penalties, and attorney fees, associated with any Breach, Security Incident,
        or impermissible use or disclosure to the extent that such event occurred in connection with
        PHI in the possession or control of the Business Associate or was otherwise the fault of the
        Business Associate or a violation of this Agreement, the Agreements, or applicable law on the
        part of the Business Associate;
      </AgreementSub>
      <AgreementSub>
        (e) Mitigate, to the extent practicable, any harmful effects of its unauthorized use or
        disclosure of PHI in violation of HIPAA or this Agreement;
      </AgreementSub>
      <AgreementSub>
        (f) In accordance with 45 CFR 164.502(e)(1)(ii) and 164.308(b)(2), if applicable, ensure
        that any subcontractors that create, receive, maintain, or transmit PHI on behalf of the
        Business Associate agree, in writing, to the same restrictions, conditions, and requirements
        that apply to the Business Associate with respect to such information;
      </AgreementSub>
      <AgreementSub>
        (g) Within five business days of a request from the Covered Entity, make PHI available to the
        Covered Entity as necessary to satisfy the Covered Entity&rsquo;s obligations under 45 CFR
        164.524;
      </AgreementSub>
      <AgreementSub>
        (h) Within five business days of a request, make any amendment(s) to PHI as directed or
        agreed to by the Covered Entity pursuant to 45 CFR 164.526;
      </AgreementSub>
      <AgreementSub>
        (i) Maintain and, within five business days of a request, make available the information
        required to provide an accounting of disclosures pursuant to 45 CFR 164.528;
      </AgreementSub>
      <AgreementSub>
        (j) To the extent that the Business Associate is to carry out one or more of the Covered
        Entity&rsquo;s obligation(s) under the HIPAA Privacy Rule, comply with the requirements of
        the Privacy Rule that apply to the Covered Entity;
      </AgreementSub>
      <AgreementSub>
        (k) Make its internal practices, books, and records available to the Secretary or the Covered
        Entity for purposes of determining compliance with the HIPAA Rules; and
      </AgreementSub>
      <AgreementSub>
        (l) Conduct a HIPAA Security Rule risk analysis on a regular basis, not less than annually, and
        provide a summary of the results to the Covered Entity when requested in writing.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>3. Permitted and Prohibited Uses and Disclosures.</AgreementSnum>
      </AgreementSub>
      <AgreementSub>
        (a) The Business Associate may only use or disclose PHI as specified in this Agreement and as
        necessary to perform the Services set forth in the Agreements between the parties.
      </AgreementSub>
      <AgreementSub>
        (b) The Business Associate may use or disclose PHI as required by law.
      </AgreementSub>
      <AgreementSub>
        (c) The Business Associate agrees to make uses and disclosures and requests for PHI consistent
        with the minimum necessary requirements under the HIPAA Rules.
      </AgreementSub>
      <AgreementSub>
        (d) The Business Associate may not provide data aggregation services or de-identify PHI unless
        specifically directed by the Covered Entity in an executed amendment to this Agreement.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>4. Obligations of Covered Entity.</AgreementSnum>
      </AgreementSub>
      <AgreementSub>
        (a) The Covered Entity shall notify the Business Associate of any limitation(s) in the notice
        of privacy practices under 45 CFR 164.520, to the extent that such limitation may affect the
        Business Associate&rsquo;s use or disclosure of PHI.
      </AgreementSub>
      <AgreementSub>
        (b) The Covered Entity shall notify the Business Associate of any changes in, or revocation of,
        the permission by an individual to use or disclose his or her PHI.
      </AgreementSub>
      <AgreementSub>
        (c) The Covered Entity shall notify the Business Associate of any restriction on the use or
        disclosure of PHI that the Covered Entity has agreed to or is required to abide by under 45
        CFR 164.522.
      </AgreementSub>
      <AgreementSub>
        (d) The Covered Entity shall not ask the Business Associate to use or disclose PHI in any
        manner that would not be permissible under the Privacy Rule if done by the Covered Entity.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>5. Term and Termination.</AgreementSnum>
      </AgreementSub>
      <AgreementSub>
        (a) <strong>Term.</strong> This Agreement is effective as of the Effective Date and applies
        to all Pre-Engagement Activities; it will remain in effect until terminated, and, if a Master
        Services Agreement is executed, will continue to apply unless expressly superseded by a
        written replacement business associate agreement.
      </AgreementSub>
      <AgreementSub>
        (b) <strong>Termination for Cause.</strong> The Business Associate authorizes termination by
        the Covered Entity if the Covered Entity determines the Business Associate has violated a
        material term and has not cured the breach within the time specified.
      </AgreementSub>
      <AgreementSub>
        (c) <strong>Obligations Upon Termination.</strong> Upon termination, the Business Associate
        shall: not use or disclose PHI except as permitted; return to the Covered Entity or securely
        destroy the remaining PHI within 30 days; continue to use appropriate safeguards for any
        retained PHI; and provide a certificate of secure destruction.
      </AgreementSub>
      <AgreementSub>
        (d) <strong>Survival.</strong> The obligations under this Section shall survive termination
        only as it pertains to compliance with HIPAA, state and federal regulations governing PHI
        data storage, management, and destruction.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>6. Indemnification.</AgreementSnum>
      </AgreementSub>
      <AgreementSub>
        (a) The Business Associate shall indemnify and hold the Covered Entity harmless from and
        against all claims, liabilities, judgments, fines, assessments, penalties, awards, or other
        expenses, including attorneys&rsquo; fees, relating to or arising out of any breach of this
        Agreement by the Business Associate or its subcontractors or agents.
      </AgreementSub>
      <AgreementSub>
        (b) The Covered Entity shall indemnify and hold the Business Associate harmless from and
        against all claims, liabilities, judgments, fines, assessments, penalties, awards, or other
        expenses, including attorneys&rsquo; fees, relating to or arising out of any breach of this
        Agreement by the Covered Entity or its subcontractors or agents.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>7. Miscellaneous.</AgreementSnum>
      </AgreementSub>
      <AgreementSub>
        (a) <strong>Ownership.</strong> The Business Associate has no ownership interest or title in
        the PHI. (b) <strong>Regulatory References.</strong> References to HIPAA Rules mean sections
        as in effect or as amended. (c) <strong>Amendment.</strong> The parties agree to amend as
        necessary for HIPAA compliance. (d) <strong>Interpretation.</strong> Any ambiguity shall be
        interpreted to permit compliance. (e) <strong>No Third-party Beneficiaries.</strong> There are
        no intended third-party beneficiaries. (f) <strong>Governing Law.</strong> Governed by
        applicable federal law with respect to HIPAA and otherwise by the state of California. (g){' '}
        <strong>Waiver.</strong> No waiver except in writing. (h) <strong>Conflict.</strong> This
        Agreement governs with respect to PHI in the event of conflict with other agreements. (i){' '}
        <strong>Assignment.</strong> Neither party may assign without written consent. (j){' '}
        <strong>Independent Contractor.</strong> The parties are independent contractors. (k){' '}
        <strong>Headings.</strong> Inserted solely for convenience. (l) <strong>Severability.</strong>{' '}
        Invalid provisions do not affect remaining provisions. (m) <strong>Notice.</strong> In writing
        to the representative who signed. (n) <strong>Counterparts.</strong> May be executed in
        multiple counterparts. (o) <strong>Entire Agreement.</strong> This constitutes the entire
        understanding.
      </AgreementSub>

      <p className="ob-agreement-ack">
        <strong>Acknowledgment and Incorporation</strong>
      </p>

      <p>
        By signing below, the Parties acknowledge that they have reviewed, understood, and agreed to
        the terms of this Business Associate Agreement titled <em>Exhibit B</em>. This Agreement is
        intended to stand independently and govern the exchange and protection of protected health
        information as required under HIPAA.
      </p>

      <p>
        If in the future, a Master Services Agreement (&ldquo;MSA&rdquo;) is executed between the
        Parties, this Business Associate Agreement will be incorporated by reference and, if so
        incorporated, shall form an integral part of that agreement, subject to any mutually agreed
        modifications. In the event of any conflict between this Business Associate Agreement and the
        MSA, the conflict provisions detailed in 7(h) shall govern.
      </p>

      <p style={{ marginTop: 24, fontWeight: 600 }}>
        <strong>IN WITNESS WHEREOF</strong>, the parties hereto have executed this Agreement as of the
        Effective Date.
      </p>

      <table className="ob-agreement-sigtbl">
        <tbody>
          <tr>
            <td>
              <div className="ob-agreement-sigp">
                Covered Entity:{' '}
                <span className="ob-agreement-sig-pname">{sigProviderName}</span>
              </div>
              <div className="ob-agreement-sigl">
                <span className="ob-agreement-sig-hint">
                  Electronic acceptance captured below
                </span>
              </div>
              <div className="ob-agreement-sigll">By: Authorized Signatory</div>
              <div className="ob-agreement-sign">
                Name: {field(props, 'signame', 'Full Name (required)', 'm')}
              </div>
              <div className="ob-agreement-sign" style={{ marginTop: 3 }}>
                Title: {field(props, 'sigtitle', 'Title (required)', 'm')}
              </div>
            </td>
            <td>
              <DyadSignatureBlock
                label="Business Associate: Dyad Practice Solutions, LLC"
                showSignature={props.showDyadSignature}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

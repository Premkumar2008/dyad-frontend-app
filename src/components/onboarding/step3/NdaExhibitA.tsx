import React from 'react';
import {
  AgreementField,
  AgreementSub,
  AgreementSnum,
  DyadSignatureBlock,
} from './agreementHelpers';

export interface NdaExhibitAProps {
  fields: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  providerDisplayName: string;
  showDyadSignature: boolean;
  readOnly?: boolean;
  executed?: boolean;
}

const field = (
  props: NdaExhibitAProps,
  key: string,
  placeholder: string,
  size: 's' | 'm' | 'l' = 'm',
  required = true,
) => (
  <AgreementField
    id={`nda-${key}`}
    value={props.fields[key] ?? ''}
    onChange={(v) => props.onFieldChange(key, v)}
    placeholder={placeholder}
    className={size}
    required={required}
    readOnly={props.readOnly}
  />
);

export const NdaExhibitA: React.FC<NdaExhibitAProps> = (props) => {
  const sigProviderName = props.providerDisplayName || props.fields.pname || '-';

  return (
    <div className="ob-agreement-asc">
      <h2>EXHIBIT A: CONFIDENTIALITY AGREEMENT</h2>

      <div className="ob-agreement-provider-header">
        <strong>Provider Name: </strong>
        {field(props, 'pname', 'Provider / Entity Name (required)', 'l')}
      </div>

      <p>
        This Confidentiality Agreement (the &ldquo;Agreement&rdquo;), dated as of{' '}
        {field(props, 'edate', 'Effective Date (required)', 'm')} (&ldquo;Effective Date&rdquo;), is
        entered into by and between Dyad Practice Solutions LLC, a physician enablement platform
        with offices at 2573 Pacific Coast Hwy, Suite A277, Torrance, CA 90505 (&ldquo;Dyad&rdquo;),
        and {field(props, 'pentity', 'Provider Legal Entity Name (required)', 'l')}, a{' '}
        {field(props, 'ptype', 'e.g. clinician/clinical group/medical facility (required)', 'm')}{' '}
        licensed under the laws of {field(props, 'pstate', 'State', 's')}, with a principal place of
        business located at {field(props, 'paddr', 'Provider Address (required)', 'l')} (
        &ldquo;Provider&rdquo;), together with any affiliated entities, associated facilities,
        practice locations, and provider organizations as may be identified in a Schedule 1 to
        Exhibit B (Business Associate Agreement) (as such Schedule 1 may be updated in accordance
        with Exhibit B) (the &ldquo;Provider Group&rdquo; and collectively, the &ldquo;Parties&rdquo;).
      </p>

      <p>
        Whereas the Parties wish to engage in discussions related to business services to be
        performed by Dyad Practice Solutions (the &ldquo;Purpose&rdquo;), each Party may disclose
        Confidential Information (as defined below) (&ldquo;Disclosing Party&rdquo;) to the other
        Party (&ldquo;Recipient&rdquo;). Both Parties agree to protect and maintain the
        confidentiality of the information shared, as set forth herein. Recipient shall use the
        Confidential Information solely for the Purpose and, subject to Section 3, shall not
        disclose Confidential Information other than to its partners, affiliates, owners, officers,
        directors, managers, employees, workforce members (including physicians and other
        clinicians), medical staff, contractors, agents, consultants, vendors, subcontractors, and
        professional advisors (collectively, &ldquo;Representatives&rdquo;) who (a) have a need to
        know such information for the sole purpose of assisting the Recipient in fulfilling the
        Purpose; (b) are informed by the Recipient of the confidential nature of the information;
        and (c) are bound by an obligation of confidentiality to the Recipient sufficient to ensure
        compliance with this Agreement. Recipient shall take all reasonable measures to protect the
        secrecy of, and avoid unauthorized disclosure or use of, the Disclosing Party&rsquo;s
        Confidential Information. Such measures shall include exercising at least the same degree
        of care that the Recipient uses to protect its own Confidential Information of a similar
        nature. Recipient shall be liable to the Disclosing Party for any unauthorized use,
        disclosure, or misappropriation of Confidential Information by its Representatives and, for
        Provider, the Provider Group&rsquo;s Representatives as if such unauthorized actions were
        undertaken by the Recipient itself.
      </p>

      <p>
        Authority to Bind Provider Group. Provider represents and warrants that the individual
        signing this Agreement on Provider&rsquo;s behalf has full legal authority to bind Provider
        and the Provider Group, including each associated facility, practice location, and entity
        covered under Schedule 1 of Exhibit B, and to cause Provider&rsquo;s and the Provider
        Group&rsquo;s Representatives to be bound by confidentiality obligations that are at least as
        protective as those set forth in this Agreement. Provider further represents and warrants
        that it has obtained and will maintain all internal approvals and authorizations necessary
        to disclose Confidential Information and to permit Dyad to disclose Confidential Information
        to Dyad&rsquo;s Representatives for the Purpose.
      </p>

      <p>
        Both Parties acknowledge and agree that (a) Confidential Information disclosed by either
        Party shall remain the sole property of the Disclosing Party; (b) the Recipient shall
        promptly notify the Disclosing Party in the event of any unauthorized use or disclosure of
        the Disclosing Party&rsquo;s Confidential Information; (c) The obligations set forth in
        this Agreement shall apply equally to both Parties in their respective roles as Disclosing
        Party or Recipient.
      </p>

      <p>
        This Agreement shall commence on the Effective Date and remain in effect for a period of
        five (5) years, unless earlier terminated by mutual written agreement of the Parties. The
        obligations of confidentiality under this Agreement shall survive its termination for a
        period of five (5) years.
      </p>

      <p>
        Whereas the parties are committed to compliance with the Health Insurance Portability and
        Accountability Act of 1996 and the Health Information Technology for Economic and Clinical
        Health Act of 2009 and regulations promulgated thereunder, as amended from time to time
        (collectively, &ldquo;HIPAA&rdquo;), and, for purposes of this Agreement, the &ldquo;HIPAA
        Rules&rdquo; which shall mean the Privacy, Security, Breach Notification, and Enforcement
        Rules at 45 CFR Part 160 and Part 164.
      </p>

      <p style={{ marginLeft: 20 }}>
        In consideration of the mutual promises set forth herein, the parties hereby agree as
        follows:
      </p>

      <AgreementSub>
        <AgreementSnum>1.</AgreementSnum> Except as set out in Section 2 below, &ldquo;Confidential
        Information&rdquo; means all non-public, confidential, or proprietary information disclosed
        before, on or after the Effective Date, by the Disclosing Party to Recipient or its
        Representatives, whether disclosed orally or disclosed or accessed in written, electronic, or
        other form or media, and whether or not marked, designated, or otherwise identified as
        &ldquo;confidential,&rdquo; including, without limitation:
      </AgreementSub>

      <AgreementSub>
        (a) all information concerning the Disclosing Party&rsquo;s and its affiliates&rsquo;, and
        their customers&rsquo;, suppliers&rsquo;, and other third parties&rsquo; past, present, and
        future business affairs including, without limitation, finances, customer information,
        supplier information, products, services, organizational structure and internal practices,
        operating model, operating strategies, forecasts, sales and other financial results,
        records and budgets, and business, marketing, development, sales and other commercial
        strategies, including but not limited to details about practice management, revenue cycle
        management, business analytics, workflows, proprietary systems, methodologies, and
        patient-related statistics;
      </AgreementSub>

      <AgreementSub>
        (b) the Disclosing Party&rsquo;s unpatented inventions, ideas, methods and discoveries, trade
        secrets, know-how, unpublished patent applications, and other confidential intellectual
        property;
      </AgreementSub>

      <AgreementSub>
        (c) all designs, specifications, documentation, components, source code, object code,
        images, icons, audiovisual components and objects, schematics, drawings, protocols, processes,
        and other visual depictions, in whole or in part, of any of the foregoing;
      </AgreementSub>

      <AgreementSub>
        (d) any third-party confidential information included with, or incorporated in, any
        information provided by the Disclosing Party to the Recipient or its Representatives; and
      </AgreementSub>

      <AgreementSub>
        (e) all notes, analyses, compilations, reports, forecasts, studies, samples, data,
        statistics, summaries, interpretations, and other materials (the &ldquo;Notes&rdquo;)
        prepared by or for the Recipient or its Representatives that contain, are based on, or
        otherwise reflect or are derived from, in whole or in part, any information furnished by the
        Disclosing Party or any of Disclosing Party&rsquo;s Representatives.
      </AgreementSub>

      <AgreementSub>
        (f) Any creation, receipt, maintenance, access, use, disclosure, or transmission of Protected
        Health Information (as defined under the Health Insurance Portability and Accountability Act
        of 1996, as amended, and its implementing regulations, &ldquo;HIPAA&rdquo;) will occur only
        pursuant to Exhibit B (Business Associate Agreement). Schedule 1 to Exhibit B will govern and
        control the identification of all covered entities, facilities, locations, and providers
        within the Provider Group for purposes of this Agreement whenever Protected Health
        Information is involved.
      </AgreementSub>

      <AgreementSub>
        (g) Recipient agrees not to use Disclosing Party&rsquo;s Confidential Information for any
        purpose other than fulfilling the Purpose of this Agreement. Recipient shall not reverse
        engineer, decompile, disassemble, or otherwise attempt to derive the Disclosing Party&rsquo;s
        proprietary methodologies, technologies, or business practices.
      </AgreementSub>

      <AgreementSub>
        (h) Both Parties agree to implement and maintain reasonable technical, administrative, and
        physical safeguards to protect Confidential Information from unauthorized access, use, or
        disclosure, in alignment with industry standards and applicable laws.
      </AgreementSub>

      <AgreementSub>
        (i) Notwithstanding anything to the contrary in this Agreement, all ideas, developments,
        methods, workflows, deliverables, reports, analyses, designs, or other materials &mdash;
        whether tangible or intangible &mdash; created, developed, or derived by Dyad (or its
        personnel or vendors) in connection with or as a result of the Purpose or the services
        contemplated hereunder, including but not limited to written content, documentation,
        frameworks, automations, software artifacts, and design elements, shall be deemed proprietary
        to Dyad, including any associated intellectual property rights. To the extent any rights may
        arise in such materials, they shall vest exclusively in Dyad. This clause shall not apply
        to any patient information, medical records, clinical data, or business data and records
        owned by the Provider. For avoidance of doubt, any materials created, developed, or derived
        by Dyad in connection with or as a result of the Purpose, even if informed by the
        Provider&rsquo;s Confidential Information, shall be deemed proprietary to Dyad, provided that
        such materials do not incorporate or disclose the Provider&rsquo;s Confidential Information or
        data protected under Section 1(a) &ndash; (e).
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>2.</AgreementSnum> Except as required by applicable federal, state, or local
        law or regulation, the term &ldquo;Confidential Information&rdquo; as used in this Agreement
        shall not include information that:
      </AgreementSub>

      <AgreementSub>
        (a) at the time of disclosure is, or thereafter becomes, generally available to and known by
        the public other than as a result of, directly or indirectly, any violation of this
        Agreement by the Recipient or any of its Representatives;
      </AgreementSub>

      <AgreementSub>
        (b) at the time of disclosure is, or thereafter becomes, available to the Recipient on a
        non-confidential basis from a third-party source, provided that such third party is not and
        was not prohibited from disclosing such Confidential Information to the Recipient by a
        contractual obligation to the Disclosing Party;
      </AgreementSub>

      <AgreementSub>
        (c) was known by or in the possession of the Recipient or its Representatives, as established
        by documentary evidence, before being disclosed by or on behalf of the Disclosing Party under
        this Agreement; or
      </AgreementSub>

      <AgreementSub>
        (d) was or is independently developed by the Recipient, as established by documentary
        evidence, without reference to or use of, in whole or in part, any of the Disclosing
        Party&rsquo;s Confidential Information.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>3.</AgreementSnum> If Recipient is required by applicable law or legal process
        to disclose any Confidential Information, Recipient shall, to the extent practicable prior
        to making such disclosure, use commercially reasonable efforts to notify Disclosing Party of
        such requirements to afford Disclosing Party the opportunity to seek, at Disclosing
        Party&rsquo;s sole cost and expense, a protective order or other remedy. If, in the absence
        of a protective order or other similar remedy or the receipt of a waiver from the Disclosing
        Party, the Recipient&rsquo;s counsel determines that disclosure of the Disclosing
        Party&rsquo;s Confidential Information is required to comply with such process or applicable
        law, the Recipient may, without liability under this Agreement, disclose to the appropriate
        authority only that portion of the Confidential Information which, on advice of counsel, it
        is required to disclose; provided that the Recipient uses reasonable efforts to preserve the
        confidentiality of the other Confidential Information, including without limitation by
        cooperating with the Disclosing Party, to obtain an appropriate protective order or other
        reliable assurance that confidential treatment will be accorded the other Confidential
        Information by such tribunal.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>4.</AgreementSnum> On Disclosing Party&rsquo;s written request, Recipient
        shall: (a) discontinue all use of Confidential Information and, (b) at its discretion,
        promptly return to Disclosing Party or destroy all Confidential Information; provided,
        however, that Recipient may retain copies of Confidential Information: (c) that are stored
        on Recipient&rsquo;s IT backup and disaster recovery systems until the ordinary course
        deletion thereof or (d) as required by applicable law or professional standards, which
        shall remain subject to the terms and conditions under this Agreement for the term hereof.
        Recipient shall certify in writing to the Disclosing Party that all Confidential Information
        has been returned or securely destroyed within 30 days of termination of this Agreement,
        except as required by applicable law or professional standards.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>5.</AgreementSnum> Non-Solicitation: During the term of this Agreement and for
        a period of two (2) years thereafter, neither Party shall directly or indirectly solicit or
        attempt to solicit the employees, contractors, vendors, or business partners of the other
        Party without prior written consent.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>6.</AgreementSnum> Survival and Evergreen Provision: The rights and obligations
        of the parties under this Agreement expire two (2) years after the Effective Date, other
        than with respect to trade secrets, which do not expire. However, notwithstanding the
        foregoing, the confidentiality obligations under this Agreement shall automatically renew on
        an annual basis unless either party provides written notice of termination at least thirty
        (30) days prior to the expiration of the then-current term. Such renewal ensures the
        continued protection of Confidential Information shared during the course of the engagement,
        unless superseded by a subsequent agreement.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>7.</AgreementSnum> This Agreement and all matters relating hereto are governed
        by, and construed in accordance with, the laws of the State of California without regard to
        the conflict of laws provisions of such State. Any legal suit, action or proceeding relating
        to this Agreement must be instituted in the federal or state courts located in California.
        Each Party irrevocably submits to the exclusive jurisdiction of such courts in any such suit,
        action or proceeding.{' '}
        <span className="ob-agreement-caps">
          EACH PARTY HEREBY IRREVOCABLY WAIVES, TO THE FULLEST EXTENT PERMITTED BY LAW, ALL RIGHTS TO
          TRIAL BY JURY IN ANY ACTION, PROCEEDING OR COUNTERCLAIM (WHETHER IN CONTRACT, STATUTE, TORT
          (SUCH AS NEGLIGENCE), OR OTHERWISE) RELATING TO THIS AGREEMENT.
        </span>{' '}
        Notwithstanding the foregoing, in the event that the Disclosing Party is not a person or
        entity based in or incorporated or formed in the United States, then any dispute or claim
        arising out of or related to this contract, or the interpretation, making, performance,
        breach or termination hereof, shall be finally settled by binding arbitration, conducted in
        English in Los Angeles, California under the Rules of Arbitration of the International
        Chamber of Commerce, by one arbitrator appointed in accordance with said rules. Judgement on
        the award rendered by the arbitrator may be entered in any court having jurisdiction thereof.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>8.</AgreementSnum> All notices must be in writing and addressed to the
        relevant party at its address set forth in the preamble. All notices must be personally
        delivered or sent prepaid by nationally recognized courier or certified or registered mail,
        return receipt requested, and are effective upon actual receipt.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>9.</AgreementSnum> Recipient acknowledges and agrees that a breach of this
        Agreement may cause injury to Disclosing Party for which money damages may be an inadequate
        remedy and that, in addition to remedies at law, Disclosing Party is entitled to seek
        equitable relief as a remedy for any such breach. In no event shall either party, its
        affiliates or related entities, be liable for consequential, special, indirect, incidental,
        punitive or exemplary loss, damage or expense relating to this Agreement (whether in
        contract, statute, tort (such as negligence), or otherwise).
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>10.</AgreementSnum> This Agreement constitutes the entire agreement of the
        parties with respect its subject matter, and supersedes all prior and contemporaneous
        understandings, agreements, representations and warranties, whether written or oral, with
        respect to such subject matter. This Agreement may only be amended, modified, waived or
        supplemented by an agreement in writing signed by both parties.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>11.</AgreementSnum> Neither party may assign this Agreement without the other
        party&rsquo;s prior written consent, except that no such consent is needed in the event of a
        party&rsquo;s assignment or transfer of the majority of its stock or all or substantially all
        of its assets to which the Purpose relates, as part of a merger, acquisition or asset sale.
        Any assignment in violation of this Agreement will be void. This Agreement benefits and
        binds the parties to this Agreement and their respective successors and permitted assigns.
      </AgreementSub>

      <AgreementSub>
        <AgreementSnum>12.</AgreementSnum> This Agreement may be executed in counterparts, each of
        which shall be deemed an original, but all of which together shall constitute one and the
        same instrument.
      </AgreementSub>

      <p className="ob-agreement-ack">
        <strong>Acknowledgment and Incorporation</strong>
      </p>

      <p>
        By signing below, the Parties acknowledge that they have carefully reviewed, understood, and
        agreed to the terms of this Confidentiality Agreement titled <em>Exhibit A</em>. This
        Agreement is intended to stand independently and govern the exchange and protection of
        confidential information between the Parties.
      </p>

      <p>
        If in the future, a Master Services Agreement (&ldquo;MSA&rdquo;) is executed between the
        Parties, this Confidentiality Agreement will be incorporated by reference and, if so
        incorporated, shall form an integral part of that agreement, subject to any mutually agreed
        modifications. In the event of any conflict between this Confidentiality Agreement and the
        MSA, the terms of the MSA shall govern unless expressly stated otherwise. Notwithstanding
        anything to the contrary, Exhibit B (Business Associate Agreement) will govern all matters
        relating to Protected Health Information and HIPAA compliance, and Schedule 1 to Exhibit B
        will control the identification of covered entities, facilities, locations, and providers
        within the Provider Group for purposes of this Exhibit A whenever Protected Health
        Information is involved.
      </p>

      <p style={{ marginTop: 24, fontWeight: 600 }}>
        IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the Effective Date.
      </p>

      <table className="ob-agreement-sigtbl">
        <tbody>
          <tr>
            <td>
              <div className="ob-agreement-sigp">
                Provider: <span className="ob-agreement-sig-pname">{sigProviderName}</span>
              </div>
              <div className="ob-agreement-sigl" style={props.executed ? { borderBottomColor: '#2E7D32' } : undefined}>
                {props.executed ? (
                  <span className="ob-ca-sig-cursive">{props.fields.signame || ''}</span>
                ) : (
                  <span className="ob-agreement-sig-hint">
                    Electronic acceptance captured below
                  </span>
                )}
              </div>
              <div className="ob-agreement-sigll">By: Authorized Signatory</div>
              {props.executed ? (
                <>
                  <div className="ob-agreement-sign">Name: {props.fields.signame || ''}</div>
                  <div className="ob-agreement-sign" style={{ marginTop: 3 }}>
                    Title: {props.fields.sigtitle || ''}
                  </div>
                </>
              ) : (
                <>
                  <div className="ob-agreement-sign">
                    Name: {field(props, 'signame', 'Full Name (required)', 'm')}
                  </div>
                  <div className="ob-agreement-sign" style={{ marginTop: 3 }}>
                    Title: {field(props, 'sigtitle', 'Title (required)', 'm')}
                  </div>
                </>
              )}
            </td>
            <td>
              <DyadSignatureBlock showSignature={props.showDyadSignature} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

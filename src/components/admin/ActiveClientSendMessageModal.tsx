import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import type { ActiveClientRow } from '../../services/onboardingAdminService';

export type ClientMessageMode = 'reminder' | 'email';

interface ActiveClientSendMessageModalProps {
  open: boolean;
  mode: ClientMessageMode;
  clients: ActiveClientRow[];
  onClose: () => void;
  onSent?: () => void;
}

const getContactName = (client: ActiveClientRow) => {
  const contact = client.contact?.trim();
  if (contact && contact !== '-') return contact;
  return client.contactEmail?.split('@')[0] ?? 'there';
};

const buildDefaultSubject = (mode: ClientMessageMode, clients: ActiveClientRow[]) => {
  const practice = clients.length === 1 ? clients[0].name : `${clients.length} practices`;
  if (mode === 'reminder') {
    return `Reminder: Complete your Dyad onboarding – ${practice}`;
  }
  return `Message from Dyad Practice Solutions – ${practice}`;
};

const buildDefaultMessage = (mode: ClientMessageMode, clients: ActiveClientRow[]) => {
  if (clients.length === 1) {
    const client = clients[0];
    const contactName = getContactName(client);
    if (mode === 'reminder') {
      return `Hi ${contactName},

This is a friendly reminder to complete your Dyad onboarding enrollment for ${client.name}. If you have any questions or need assistance, please reply to this email.

Thank you,
Dyad Practice Solutions`;
    }
    return `Hi ${contactName},

We wanted to reach out regarding your Dyad account for ${client.name}. Please let us know if you need any assistance.

Thank you,
Dyad Practice Solutions`;
  }

  if (mode === 'reminder') {
    return `Hello,

This is a friendly reminder to complete your Dyad onboarding enrollment. If you have any questions or need assistance, please reply to this email.

Thank you,
Dyad Practice Solutions`;
  }

  return `Hello,

We wanted to reach out regarding your Dyad account. Please let us know if you need any assistance.

Thank you,
Dyad Practice Solutions`;
};

export const ActiveClientSendMessageModal: React.FC<ActiveClientSendMessageModalProps> = ({
  open,
  mode,
  clients,
  onClose,
  onSent,
}) => {
  const recipients = useMemo(
    () => clients.filter((c) => c.contactEmail?.trim()),
    [clients],
  );

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSubject(buildDefaultSubject(mode, recipients));
    setMessage(buildDefaultMessage(mode, recipients));
    setSending(false);
  }, [open, mode, recipients]);

  if (!open) return null;

  const title = mode === 'reminder' ? 'Send Reminder' : 'Send Email';
  const primaryLabel = mode === 'reminder' ? 'Send Reminder' : 'Send Email';
  const toAddresses = recipients.map((c) => c.contactEmail!).join(', ');
  const isSingle = recipients.length === 1;
  const single = isSingle ? recipients[0] : null;

  const handleSend = async () => {
    if (!recipients.length) {
      toast.error('No contact email available for the selected clients.');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter a message to send.');
      return;
    }

    setSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      toast.success(
        `${primaryLabel} queued for ${recipients.length} recipient${recipients.length !== 1 ? 's' : ''}.`,
      );
      onSent?.();
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="adm2-modal-backdrop" onClick={onClose}>
      <div className="adm2-modal adm2-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="adm2-modal-header">
          <h2 className="adm2-modal-title">{title}</h2>
          <button type="button" className="adm2-modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="adm2-modal-body">
          <p className="adm2-modal-desc">
            {recipients.length === 1
              ? 'Review the details below and customize the message before sending.'
              : `Sending to ${recipients.length} selected client${recipients.length !== 1 ? 's' : ''} with the same message.`}
          </p>

          <label className="adm2-modal-label" htmlFor="client-message-to">To</label>
          <input
            id="client-message-to"
            type="text"
            className="adm2-modal-input adm2-modal-input--readonly"
            value={toAddresses}
            readOnly
          />

          {isSingle && single && (
            <>
              <label className="adm2-modal-label" htmlFor="client-message-contact">Contact</label>
              <input
                id="client-message-contact"
                type="text"
                className="adm2-modal-input adm2-modal-input--readonly"
                value={getContactName(single)}
                readOnly
              />

              <label className="adm2-modal-label" htmlFor="client-message-practice">Practice</label>
              <input
                id="client-message-practice"
                type="text"
                className="adm2-modal-input adm2-modal-input--readonly"
                value={single.name}
                readOnly
              />

              <div className="adm2-modal-form-grid">
                <div className="adm2-modal-field">
                  <label className="adm2-modal-label" htmlFor="client-message-specialty">Specialty</label>
                  <input
                    id="client-message-specialty"
                    type="text"
                    className="adm2-modal-input adm2-modal-input--readonly"
                    value={single.specialty}
                    readOnly
                  />
                </div>
                <div className="adm2-modal-field">
                  <label className="adm2-modal-label" htmlFor="client-message-status">Status</label>
                  <input
                    id="client-message-status"
                    type="text"
                    className="adm2-modal-input adm2-modal-input--readonly"
                    value={single.status === 'at-risk' ? 'At Risk' : single.status.charAt(0).toUpperCase() + single.status.slice(1)}
                    readOnly
                  />
                </div>
              </div>
            </>
          )}

          {!isSingle && recipients.length > 0 && (
            <div className="adm2-modal-recipient-list">
              {recipients.map((client) => (
                <div key={client.id} className="adm2-modal-recipient-item">
                  <strong>{client.name}</strong>
                  <span>{getContactName(client)} · {client.contactEmail}</span>
                </div>
              ))}
            </div>
          )}

          <label className="adm2-modal-label" htmlFor="client-message-subject">Subject</label>
          <input
            id="client-message-subject"
            type="text"
            className="adm2-modal-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={sending}
          />

          <label className="adm2-modal-label" htmlFor="client-message-body">Message</label>
          <textarea
            id="client-message-body"
            className="adm2-modal-input adm2-modal-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending}
            rows={8}
          />
        </div>

        <div className="adm2-modal-footer">
          <button type="button" className="adm2-btn adm2-btn--ghost" onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button type="button" className="adm2-btn adm2-btn--primary" onClick={handleSend} disabled={sending}>
            {sending ? (
              <><span className="adm2-btn-spinner" /> Sending…</>
            ) : primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

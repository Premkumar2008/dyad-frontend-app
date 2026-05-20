import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminEarlyAccess.css';

// ── Types ────────────────────────────────────────────────
interface Submission {
  _id: string;
  npi: string;
  practiceName: string;
  contactName: string;
  phoneNumber: string;
  email: string;
  title: string;
  practiceType: string;
  providers: string;
  locations: string;
  claimVolume: string;
  createdAt: string;
  betaInvite: boolean;
  status: 'pending' | 'beta-cohort' | 'reviewed' | 'rejected';
  invitationSent: boolean;
}

// ── Helpers ──────────────────────────────────────────────
const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
};

const practiceTypeBadge = (type: string): { bg: string; color: string } => {
  const t = type.toLowerCase();
  if (t.includes('anesthesia'))     return { bg: '#dcfce7', color: '#16a34a' };
  if (t.includes('ophthalmology'))  return { bg: '#dbeafe', color: '#1d6dd8' };
  if (t.includes('asc') || t.includes('ambulatory')) return { bg: '#ede9fe', color: '#7c3aed' };
  if (t.includes('pain'))           return { bg: '#ffedd5', color: '#ea580c' };
  if (t.includes('orthopedic'))     return { bg: '#fef3c7', color: '#d97706' };
  if (t.includes('spine'))          return { bg: '#f0fdf4', color: '#15803d' };
  if (t.includes('gastro'))         return { bg: '#fff1f2', color: '#e11d48' };
  if (t.includes('urology'))        return { bg: '#f0f9ff', color: '#0369a1' };
  if (t.includes('ent'))            return { bg: '#fdf4ff', color: '#9333ea' };
  return { bg: '#f1f5f9', color: '#475569' };
};

const statusConfig: Record<string, { dot: string; label: string; color: string }> = {
  'pending':     { dot: '#f59e0b', label: 'Pending review',  color: '#92400e' },
  'beta-cohort': { dot: '#00a7d8', label: 'Beta cohort',     color: '#173e7a' },
  'reviewed':    { dot: '#22c55e', label: 'Reviewed',        color: '#166534' },
  'rejected':    { dot: '#ef4444', label: 'Rejected',        color: '#991b1b' },
};

const PRACTICE_TYPE_OPTIONS = [
  'All types',
  'Anesthesia Group', 'Ophthalmology Group', 'ASC', 'Pain Management Group',
  'Orthopedic Surgery Group', 'Spine Surgery Group', 'ENT Group',
  'Gastroenterology Group', 'Urology Group',
];

// ── Invite email template (mirrors emailService.ts pattern) ──
const buildInviteHtml = (contactName: string, email: string): string => {
  const scheduleUrl = `${window.location.origin}/schedule-call?name=${encodeURIComponent(contactName)}&email=${encodeURIComponent(email)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Early Access Invitation – Dyad</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="680" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <!-- Logo -->
        <tr><td style="padding:32px 48px 20px 48px;">
          <img src="https://landing-dev.dyadmd.com/assets/images/logo_main.png" alt="Dyad Practice Solutions" width="180" style="width:180px;display:block;" />
        </td></tr>
        <tr><td style="padding:0 48px;"><hr style="border:none;border-top:1px solid #e0e0e0;margin:0;" /></td></tr>

        <!-- Blue banner -->
        <tr><td style="padding:24px 48px;">
          <div style="background-color:#173e7a;border-radius:6px;padding:22px 28px;">
            <div style="font-size:11px;font-weight:600;color:#a8c8f0;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">SELECTED FOR EARLY ACCESS</div>
            <div style="font-size:18px;font-weight:700;color:#ffffff;line-height:1.4;">Your practice has been chosen for the early release cohort</div>
          </div>
        </td></tr>

        <!-- Body copy -->
        <tr><td style="padding:8px 48px 0 48px;font-size:14px;color:#333333;line-height:1.8;">
          <p style="margin:0 0 16px 0;">Dear ${contactName},</p>
          <p style="margin:0 0 16px 0;">We are pleased to invite your practice to join Dyad's early access program ahead of our September 2026 launch.</p>
          <p style="margin:0 0 16px 0;">Your practice has been selected as one of a limited number of practices that will shape Dyad's product roadmap and implementation approach during the final development phase.</p>
          <p style="margin:0 0 16px 0;">As an early access partner, you will receive priority onboarding to institutional-grade infrastructure, FDIC-insured banking workflows, integrated lockbox architecture, and fiduciary-level financial governance. Your operational feedback will directly inform product priorities, workflow design, and integration sequencing before broader release.</p>
          <p style="margin:0 0 24px 0;">To begin, please schedule a brief 30-minute introduction call at your convenience.</p>
        </td></tr>

        <!-- Schedule CTA card -->
        <tr><td style="padding:0 48px 28px 48px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;background:#f9fbff;">
            <tr><td style="padding:24px 28px;">
              <table cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="vertical-align:middle;padding-right:14px;">
                  <div style="width:44px;height:44px;border:1.5px solid #c3d4f0;border-radius:8px;text-align:center;line-height:44px;font-size:22px;background:#ffffff;">&#128197;</div>
                </td>
                <td style="vertical-align:middle;">
                  <div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:3px;">Dyad Early Access &middot; Introduction Call</div>
                  <div style="font-size:12px;color:#6b7280;">30 min &nbsp;&middot;&nbsp; Video conference &nbsp;&middot;&nbsp; Sroothi Jaikumar</div>
                </td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:0 28px 24px 28px;text-align:center;">
              <a href="${scheduleUrl}" target="_blank" style="display:inline-block;background-color:#173e7a;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:6px;font-size:15px;font-weight:700;letter-spacing:0.02em;">Schedule Your Introduction Call &rarr;</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Sign-off -->
        <tr><td style="padding:4px 48px 28px 48px;font-size:14px;color:#333333;line-height:1.7;">
          <p style="margin:0 0 16px 0;">We appreciate your interest in Dyad and look forward to the opportunity to serve your practice.</p>
          <p style="margin:0 0 4px 0;">Warm regards,</p>
          <p style="margin:0 0 2px 0;font-weight:700;color:#1a6faf;">Sroothi Jaikumar</p>
          <p style="margin:0;color:#888888;font-size:13px;">Founder &amp; CEO, Dyad Practice Solutions</p>
        </td></tr>

        <tr><td style="padding:0 48px;"><hr style="border:none;border-top:1px solid #e0e0e0;margin:0;" /></td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#f8f8f8;padding:20px 48px;text-align:center;">
          <p style="margin:0 0 6px 0;font-size:12px;color:#888888;">
            Dyad Practice Solutions, LLC &nbsp;&bull;&nbsp;
            <a href="https://dyadmd.com" style="color:#1a6faf;text-decoration:none;">dyadmd.com</a>
            &nbsp;&bull;&nbsp;
            <a href="https://dyadmd.com/unsubscribe" style="color:#1a6faf;text-decoration:none;">Unsubscribe</a>
            &nbsp;&bull;&nbsp;
            <a href="https://dyadmd.com/privacy" style="color:#1a6faf;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#aaaaaa;">This invitation is extended to a limited cohort of selected practices. If you no longer wish to participate, please let us know.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

const buildInviteText = (contactName: string, email: string): string => {
  const scheduleUrl = `${window.location.origin}/schedule-call?name=${encodeURIComponent(contactName)}&email=${encodeURIComponent(email)}`;
  return `Dear ${contactName},\n\nWe are pleased to invite your practice to join Dyad's early access program ahead of our September 2026 launch.\n\nYour practice has been selected as one of a limited number of practices that will shape Dyad's product roadmap and implementation approach during the final development phase.\n\nTo schedule your 30-minute introduction call, visit:\n${scheduleUrl}\n\nWarm regards,\nSroothi Jaikumar\nFounder & CEO, Dyad Practice Solutions\n\nDyad Practice Solutions, LLC · dyadmd.com`;
};

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending review' },
  { value: 'beta-cohort', label: 'Beta cohort' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'rejected', label: 'Rejected' },
];

// ── Component ────────────────────────────────────────────
const AdminEarlyAccess: React.FC = () => {
  const navigate = useNavigate();
  const [adminInfo, setAdminInfo] = useState<{ username?: string; role?: string } | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [sendingInvite, setSendingInvite] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [manualInviteOpen, setManualInviteOpen] = useState(false);
  const [manualInviteEmail, setManualInviteEmail] = useState('');
  const [manualInviteLoading, setManualInviteLoading] = useState(false);
  const [manualInviteError, setManualInviteError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All types');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // ── Auth guard ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    if (!token) { navigate('/admin-login', { replace: true }); return; }
    try { setAdminInfo(JSON.parse(localStorage.getItem('adminInfo') || '{}')); } catch {}
    fetchSubmissions(token);
  }, [navigate]);

  // ── Normalise a raw API record into a Submission ─────────
  const normalise = (s: any): Submission => ({
    _id:            s._id ?? s.id ?? String(s.npi ?? Math.random()),
    npi:            s.npi            ?? '',
    practiceName:   s.practiceName   ?? s.practice_name   ?? s.facilityName ?? '',
    contactName:    s.contactName    ?? s.contact_name    ?? s.name         ?? '',
    phoneNumber:    s.phoneNumber    ?? s.phone_number    ?? s.phone        ?? '',
    email:          s.email          ?? '',
    title:          s.title          ?? s.role            ?? '',
    practiceType:   s.practiceType   ?? s.practice_type   ?? '',
    providers:      s.providers      ?? s.numberOfProviders ?? '',
    locations:      s.locations      ?? s.numberOfLocations ?? '',
    claimVolume:    s.claimVolume    ?? s.claim_volume    ?? '',
    createdAt:      s.createdAt      ?? s.submittedAt     ?? s.created_at   ?? new Date().toISOString(),
    betaInvite:     s.betaInvite     ?? s.beta_invite     ?? false,
    status:         s.status         ?? 'pending',
    invitationSent: s.invitationSent ?? s.invitation_sent ?? false,
  });

  // ── Fetch ───────────────────────────────────────────────
  const fetchSubmissions = async (token: string) => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${apiUrl}/api-early-access`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle: { success, data: [...] }  |  { data: [...] }  |  [...]
      const raw: any[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setSubmissions(raw.map(normalise));
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Token expired — send back to login
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin-login', { replace: true });
      }
      // Other errors: empty state is sufficient feedback
    } finally {
      setLoading(false);
    }
  };

  // ── Stats ───────────────────────────────────────────────
  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      total:          submissions.length,
      thisWeek:       submissions.filter(s => new Date(s.createdAt).getTime() > weekAgo).length,
      designatedBeta: submissions.filter(s => s.betaInvite).length,
      pendingReview:  submissions.filter(s => s.status === 'pending').length,
      invitationsSent: submissions.filter(s => s.invitationSent).length,
    };
  }, [submissions]);

  // ── Filtered rows ───────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return submissions.filter(s => {
      const matchSearch = !q ||
        s.practiceName.toLowerCase().includes(q) ||
        s.contactName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.npi.includes(q);
      const matchType = filterType === 'All types' || s.practiceType === filterType;
      const matchStatus = !filterStatus || s.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [submissions, search, filterType, filterStatus]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setCurrentPage(1); }, [search, filterType, filterStatus]);

  // ── Pagination ──────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage, PAGE_SIZE]);

  const getPageNumbers = (cur: number, total: number): (number | '…')[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    if (cur > 3) pages.push('…');
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
    if (cur < total - 2) pages.push('…');
    pages.push(total);
    return pages;
  };

  // ── Selection (beta-cohort only) ─────────────────────────
  const selectable = filtered.filter(s => s.status === 'beta-cohort' && !s.invitationSent);
  const allSelected = selectable.length > 0 && selectable.every(s => selected.has(s._id));
  const toggleAll = () => {
    if (allSelected) {
      setSelected(prev => { const n = new Set(prev); selectable.forEach(s => n.delete(s._id)); return n; });
    } else {
      setSelected(prev => { const n = new Set(prev); selectable.forEach(s => n.add(s._id)); return n; });
    }
  };
  const toggleRow = (id: string, status: string, invitationSent: boolean) => {
    if (status !== 'beta-cohort' || invitationSent) return;
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // ── Beta invite toggle ──────────────────────────────────
  const handleBetaToggle = useCallback(async (sub: Submission) => {
    setTogglingIds(prev => { const n = new Set(prev); n.add(sub._id); return n; });
    const token = localStorage.getItem('adminAccessToken') || '';
    const newVal = !sub.betaInvite;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      await axios.patch(
        `${apiUrl}/api-early-access/${sub._id}`,
        { betaInvite: newVal, status: newVal ? 'beta-cohort' : 'pending' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissions(prev => prev.map(s =>
        s._id === sub._id
          ? { ...s, betaInvite: newVal, status: newVal ? 'beta-cohort' : 'pending' }
          : s
      ));
    } catch {
      toast.error('Failed to update beta invite status.');
    } finally {
      setTogglingIds(prev => { const n = new Set(prev); n.delete(sub._id); return n; });
    }
  }, []);

  // ── Send invite ─────────────────────────────────────────
  const handleSendInvite = async () => {
    const targetSubs = Array.from(selected)
      .map(id => submissions.find(s => s._id === id))
      .filter((s): s is Submission => !!s && !s.invitationSent);
    if (!targetSubs.length) return;

    setSendingInvite(true);
    const subject = "You've Been Selected for Dyad Early Access";
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('adminAccessToken') || '';
    const sentIds: string[] = [];

    await Promise.allSettled(
      targetSubs.map(async sub => {
        try {
          await axios.post(
            `${apiUrl}/api-early-access/send-invite`,
            {
              ids: [sub._id],
              subject,
              html: buildInviteHtml(sub.contactName, sub.email),
              text: buildInviteText(sub.contactName, sub.email),
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          sentIds.push(sub._id);
        } catch {
          // individual failure — tracked via sentIds length
        }
      })
    );

    if (sentIds.length > 0) {
      setSubmissions(prev => prev.map(s =>
        sentIds.includes(s._id) ? { ...s, invitationSent: true } : s
      ));
      toast.success(`Invitation${sentIds.length > 1 ? 's' : ''} sent to ${sentIds.length} practice${sentIds.length > 1 ? 's' : ''}.`);
    }
    const failedCount = targetSubs.length - sentIds.length;
    if (failedCount > 0) toast.error(`${failedCount} invitation${failedCount > 1 ? 's' : ''} failed to send.`);
    setSelected(new Set());
    setSendingInvite(false);
  };

  // ── Export CSV ──────────────────────────────────────────
  const handleExportCSV = () => {
    const cols = ['NPI', 'Practice/Facility', 'Contact', 'Email', 'Phone', 'Title', 'Practice Type', 'Providers', 'Locations', 'Claim Volume', 'Submitted', 'Beta Invite', 'Status', 'Invitation Sent'];
    const rows = filtered.map(s => [
      s.npi, s.practiceName, s.contactName, s.email, s.phoneNumber, s.title,
      s.practiceType, s.providers, s.locations, s.claimVolume,
      formatDate(s.createdAt), s.betaInvite ? 'Yes' : 'No', s.status, s.invitationSent ? 'Yes' : 'No',
    ]);
    const csv = [cols, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'early-access-submissions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Manual invite ────────────────────────────────────────
  const handleManualInvite = async () => {
    const email = manualInviteEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setManualInviteError('Please enter a valid email address.');
      return;
    }
    setManualInviteError('');
    setManualInviteLoading(true);
    const baseUrl = window.location.origin;
    const logoUrl = `${baseUrl}/assets/images/logo_main.png`;
    const registerUrl = `${baseUrl}/early-access`;
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited — Dyad Early Access</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
    .wrapper { background: #f4f4f4; padding: 30px 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { padding: 24px 32px; border-bottom: 2px solid #003F7F; }
    .header img { height: 80px; width: auto; }
    .content { padding: 32px 32px 24px; }
    .content p { margin: 0 0 16px; font-size: 15px; color: #444; }
    .cta-wrap { text-align: center; margin: 28px 0; }
    .cta-btn { display: inline-block; background: #003F7F; color: #ffffff !important; text-decoration: none; padding: 13px 32px; border-radius: 6px; font-size: 15px; font-weight: 700; letter-spacing: 0.02em; }
    .signature { margin-top: 24px; }
    .signature p { margin: 0; font-size: 15px; color: #444; }
    .dyad-team { color: #003F7F; font-weight: 700; }
    .footer { background: #f9f9f9; border-top: 1px solid #e8e8e8; padding: 20px 32px; text-align: center; }
    .footer p { margin: 0 0 6px; font-size: 12px; color: #888; }
    .footer a { color: #003F7F; text-decoration: underline; }
    .thanks { font-size: 14px; color: #666; text-align: center; margin: 0 0 6px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="${logoUrl}" alt="Dyad Practice Solutions" />
      </div>
      <div class="content">
               <p class="thanks">Thank you for your interest in Dyad Practice Solutions.</p>

        <p>We're excited to invite you to join the <strong>Dyad Early Access Program</strong> an exclusive cohort of forward-thinking practices onboarding ahead of our Q3 2026 public launch.</p>
        <div class="cta-wrap">
          <a href="${registerUrl}" class="cta-btn">Register for Early Access</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:<br/><a href="${registerUrl}">${registerUrl}</a></p>
        <div class="signature">
          <p>Regards,</p>
          <p><span class="dyad-team">The Dyad Team</span><br/>Dyad Practice Solutions</p>
        </div>
      </div>
      <div class="footer">
        <p>Dyad Practice Solutions, LLC &middot; <a href="${baseUrl}">dyadmd.com</a> &middot; <a href="${baseUrl}/privacy-policy">Privacy Policy</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
    const text = `Hello,\n\nWe're excited to invite you to join the Dyad Early Access Program.\n\nRegister here: ${registerUrl}\n\nRegards,\nThe Dyad Team\nDyad Practice Solutions\n\nThank you for your interest in Dyad Practice Solutions.\n${baseUrl}`;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('adminAccessToken') || '';
    try {
      // Step 1: check if email is already registered
      const checkRes = await axios.post(
        `${apiUrl}/api-early-access/check-email`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (checkRes.data?.exists) {
        setManualInviteError(checkRes.data.message || 'This email is already registered.');
        setManualInviteLoading(false);
        return;
      }
    } catch (err: any) {
      setManualInviteError(err.response?.data?.message || 'Failed to verify email. Please try again.');
      setManualInviteLoading(false);
      return;
    }
    try {
      // Step 2: send the invite email
      await axios.post(
        `${apiUrl}/api-early-access/send-invite-email`,
        { email, subject: "You're Invited — Dyad Early Access Program", html, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Invitation sent to ${email}`);
      setManualInviteOpen(false);
      setManualInviteEmail('');
    } catch (err: any) {
      setManualInviteError(err.response?.data?.message || 'Failed to send invitation. Please try again.');
    } finally {
      setManualInviteLoading(false);
    }
  };

  // ── Logout ──────────────────────────────────────────────
  const handleLogout = () => {
    ['adminAccessToken', 'adminRefreshToken', 'adminInfo'].forEach(k => localStorage.removeItem(k));
    navigate('/admin-login', { replace: true });
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="adm2-shell">

      {/* ══ Sidebar ══════════════════════════════════════ */}
      <aside className="adm2-sidebar">
        <div className="adm2-sidebar-logo">
          <img src="/assets/images/logo_main.png" alt="Dyad" className="adm2-logo-img" />
         
        </div>

        <nav className="adm2-nav">
          <span className="adm2-nav-group-label">PRE-LAUNCH</span>
          <button className="adm2-nav-item adm2-nav-item--active">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M4 6h8M4 9h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Early Access Submissions
          </button>
        </nav>

        <div className="adm2-sidebar-bottom">
          <button className="adm2-signout-btn" onClick={handleLogout}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path d="M6 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3M10 10l3-3-3-3M13 7.5H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {adminInfo?.username ? `Sign out (${adminInfo.username})` : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ══ Main content ═════════════════════════════════ */}
      <div className="adm2-main">

        {/* Page header */}
        <div className="adm2-page-head">
          <p className="adm2-breadcrumb">PRE-LAUNCH · COHORT DESIGNATION</p>
          <h1 className="adm2-title">Early Access Submissions</h1>
          <p className="adm2-subtitle">
            Review intake submissions and designate practices for the early release cohort. Toggling{' '}
            <code className="adm2-code">Beta Invite</code> queues the practice for the timed invitation email.
          </p>
        </div>

        {/* Stats cards */}
        <div className="adm2-stats-grid">
          <div className="adm2-stat-card">
            <p className="adm2-stat-label">TOTAL SUBMISSIONS</p>
            <p className="adm2-stat-value">{stats.total}</p>
            <p className="adm2-stat-sub">
              {stats.thisWeek > 0 ? `+${stats.thisWeek} this week` : 'no new this week'}
            </p>
          </div>
          <div className="adm2-stat-card">
            <p className="adm2-stat-label">DESIGNATED BETA</p>
            <p className="adm2-stat-value adm2-stat-value--blue">{stats.designatedBeta}</p>
            <p className="adm2-stat-sub">Cohort target: 25–30</p>
          </div>
          <div className="adm2-stat-card">
            <p className="adm2-stat-label">PENDING REVIEW</p>
            <p className="adm2-stat-value adm2-stat-value--amber">{stats.pendingReview}</p>
            <p className="adm2-stat-sub">Awaiting cohort decision</p>
          </div>
          <div className="adm2-stat-card">
            <p className="adm2-stat-label">INVITATIONS SENT</p>
            <p className="adm2-stat-value adm2-stat-value--green">{stats.invitationsSent}</p>
            <p className="adm2-stat-sub">Window opens Jul 21, 2026</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="adm2-toolbar">
          <div className="adm2-toolbar-left">
            <div className="adm2-search-wrap">
              <svg className="adm2-search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="5" stroke="#9ca3af" strokeWidth="1.5"/>
                <path d="M10.5 10.5l3 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                className="adm2-search"
                placeholder="Search by practice name, contact, or NPI…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="adm2-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              {PRACTICE_TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
            </select>
            <select className="adm2-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="adm2-toolbar-right">
            <button className="adm2-btn adm2-btn--ghost" onClick={handleExportCSV}>
              Export CSV
            </button>
            <button className="adm2-btn adm2-btn--primary" onClick={() => { setManualInviteOpen(true); setManualInviteEmail(''); setManualInviteError(''); }}>
              Add Manual Invite
            </button>
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="adm2-bulk-bar">
            <span className="adm2-bulk-label">
              <strong>{selected.size} practice{selected.size > 1 ? 's' : ''} selected</strong>
              {' · Apply bulk action to selected rows'}
            </span>
            <div className="adm2-bulk-actions">
              <button className="adm2-btn adm2-btn--primary" onClick={handleSendInvite} disabled={sendingInvite}>
                {sendingInvite ? 'Sending…' : 'Send Invite'}
              </button>
              <button className="adm2-btn adm2-btn--ghost" onClick={() => setSelected(new Set())}>
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="adm2-table-wrap">
          {loading ? (
            <div className="adm2-loading">
              <span className="adm2-spinner" />
              Loading submissions…
            </div>
          ) : filtered.length === 0 ? (
            <div className="adm2-empty">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                <rect x="4" y="8" width="36" height="28" rx="3" stroke="#173e7a" strokeWidth="1.5" fill="#eef3fb"/>
                <path d="M10 17h24M10 23h14M10 29h18" stroke="#173e7a" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className="adm2-empty-title">No submissions found</p>
              <p className="adm2-empty-sub">
                {search || filterType !== 'All types' || filterStatus
                  ? 'Try adjusting your search or filters.'
                  : 'Intake submissions from practices will appear here.'}
              </p>
            </div>
          ) : (
            <table className="adm2-table">
              <thead>
                <tr>
                  <th className="adm2-th adm2-th--check">
                    <input type="checkbox" className="adm2-checkbox" checked={allSelected} onChange={toggleAll} />
                  </th>
                  <th className="adm2-th">PRACTICE / FACILITY</th>
                  <th className="adm2-th">PRACTICE TYPE</th>
                  <th className="adm2-th adm2-th--center">PROVIDERS</th>
                  <th className="adm2-th">LOCATIONS</th>
                  <th className="adm2-th">CLAIM VOL.</th>
                  <th className="adm2-th">SUBMITTED</th>
                  <th className="adm2-th adm2-th--center">BETA INVITE</th>
                  <th className="adm2-th">STATUS</th>
                  <th className="adm2-th adm2-th--center">INVITATION SENT</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(sub => {
                  const badge = practiceTypeBadge(sub.practiceType);
                  const sc = statusConfig[sub.status] ?? statusConfig['pending'];
                  const isSelected = selected.has(sub._id);
                  const isInvited = sub.invitationSent;
                  return (
                    <tr key={sub._id} className={`adm2-tr${isSelected ? ' adm2-tr--selected' : ''}${isInvited ? ' adm2-tr--invited' : ''}`}>
                      <td className="adm2-td adm2-td--check">
                        <input type="checkbox" className="adm2-checkbox" checked={isSelected} onChange={() => toggleRow(sub._id, sub.status, sub.invitationSent)} disabled={sub.status !== 'beta-cohort' || isInvited} />
                      </td>
                      <td className="adm2-td">
                        <span className="adm2-practice-name">{sub.practiceName}</span>
                        <span className="adm2-practice-sub">{sub.contactName} · {sub.email}</span>
                      </td>
                      <td className="adm2-td">
                        <span className="adm2-type-badge" style={{ background: badge.bg, color: badge.color }}>
                          {sub.practiceType}
                        </span>
                      </td>
                      <td className="adm2-td adm2-td--center">{sub.providers}</td>
                      <td className="adm2-td">{sub.locations}</td>
                      <td className="adm2-td">{sub.claimVolume}</td>
                      <td className="adm2-td adm2-td--date">{formatDate(sub.createdAt)}</td>
                      <td className="adm2-td adm2-td--center">
                        {togglingIds.has(sub._id) ? (
                          <span className="adm2-toggle-spinner" />
                        ) : (
                          <button
                            type="button"
                            className={`adm2-toggle${sub.betaInvite ? ' adm2-toggle--on' : ''}`}
                            onClick={() => handleBetaToggle(sub)}
                            aria-label={sub.betaInvite ? 'Disable beta invite' : 'Enable beta invite'}
                            disabled={isInvited}
                          >
                            <span className="adm2-toggle-thumb" />
                          </button>
                        )}
                      </td>
                      <td className="adm2-td">
                        <span className="adm2-status-badge" style={{ color: sc.color }}>
                          <span className="adm2-status-dot" style={{ background: sc.dot }} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="adm2-td adm2-td--center">
                        {isInvited ? (
                          <span className="adm2-invite-sent-badge">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                              <circle cx="6.5" cy="6.5" r="6" fill="#16a34a" />
                              <path d="M3.5 6.5l2 2 4-4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Sent
                          </span>
                        ) : (
                          <span className="adm2-invite-pending">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination footer */}
          {!loading && filtered.length > 0 && (
            <div className="adm2-table-footer">
              <span className="adm2-pagination-info">
                Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} submission{filtered.length !== 1 ? 's' : ''}
              </span>
              <div className="adm2-pagination">
                <button
                  className="adm2-page-btn adm2-page-btn--nav"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >‹</button>
                {getPageNumbers(currentPage, totalPages).map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="adm2-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`adm2-page-btn${currentPage === p ? ' adm2-page-btn--active' : ''}`}
                      onClick={() => setCurrentPage(p as number)}
                    >{p}</button>
                  )
                )}
                <button
                  className="adm2-page-btn adm2-page-btn--nav"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >›</button>
              </div>
            </div>
          )}
        </div>

        {/* Automation logic banner */}
        <div className="adm2-automation-banner">
          <span className="adm2-automation-label">Daily automation logic:</span>
          {' '}A scheduled job runs daily at 8:00 AM PT. For each submission record, the job checks three conditions:{' '}
          <code className="adm2-code">current_date</code> within the outreach window (e.g., 6 weeks before launch),{' '}
          <code className="adm2-code">beta_invite = true</code>, and{' '}
          <code className="adm2-code">invite_sent_at IS NULL</code>. When all three are met, Email 2 (Beta Invitation) is dispatched with the embedded Calendly link, and{' '}
          <code className="adm2-code">invite_sent_at</code> is stamped to prevent re-send. Bulk actions on this page modify the{' '}
          <code className="adm2-code">beta_invite</code> flag in the database — they do not send emails directly.
        </div>

      </div>

      {/* ══ Manual Invite Modal ══════════════════════════ */}
      {manualInviteOpen && (
        <div className="adm2-modal-backdrop" onClick={() => setManualInviteOpen(false)}>
          <div className="adm2-modal" onClick={e => e.stopPropagation()}>
            <div className="adm2-modal-header">
              <h2 className="adm2-modal-title">Send Manual Invite</h2>
              <button className="adm2-modal-close" onClick={() => setManualInviteOpen(false)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="adm2-modal-body">
              <p className="adm2-modal-desc">
                Enter the recipient's email address. They'll receive an invitation with a link to register at the Early Access page.
              </p>
              <label className="adm2-modal-label">Email Address</label>
              <input
                type="email"
                className={`adm2-modal-input${manualInviteError ? ' adm2-modal-input--error' : ''}`}
                placeholder="e.g. doctor@practice.com"
                value={manualInviteEmail}
                onChange={e => { setManualInviteEmail(e.target.value); setManualInviteError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleManualInvite()}
                autoFocus
                disabled={manualInviteLoading}
              />
              {manualInviteError && <p className="adm2-modal-error">{manualInviteError}</p>}
            </div>
            <div className="adm2-modal-footer">
              <button className="adm2-btn adm2-btn--ghost" onClick={() => setManualInviteOpen(false)} disabled={manualInviteLoading}>
                Cancel
              </button>
              <button className="adm2-btn adm2-btn--primary" onClick={handleManualInvite} disabled={manualInviteLoading}>
                {manualInviteLoading ? (
                  <><span className="adm2-btn-spinner" /> Sending…</>
                ) : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminEarlyAccess;

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
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All types');
  const [filterStatus, setFilterStatus] = useState('');

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

  // ── Selection ───────────────────────────────────────────
  const allSelected = filtered.length > 0 && filtered.every(s => selected.has(s._id));
  const toggleAll = () => {
    if (allSelected) {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(s => n.delete(s._id)); return n; });
    } else {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(s => n.add(s._id)); return n; });
    }
  };
  const toggleRow = (id: string) => {
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
    const ids = Array.from(selected).filter(id => {
      const sub = submissions.find(s => s._id === id);
      return sub && !sub.invitationSent;
    });
    if (!ids.length) return;
    setSendingInvite(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('adminAccessToken') || '';
      const res = await axios.post(
        `${apiUrl}/api-early-access/send-invite`,
        { ids },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sentIds: string[] = res.data?.sentIds ?? res.data?.data?.sentIds ?? ids;
      if (sentIds.length > 0) {
        setSubmissions(prev => prev.map(s =>
          sentIds.includes(s._id) ? { ...s, invitationSent: true } : s
        ));
        toast.success(`Invitation${sentIds.length > 1 ? 's' : ''} sent to ${sentIds.length} practice${sentIds.length > 1 ? 's' : ''}.`);
      }
      const failedCount = ids.length - sentIds.length;
      if (failedCount > 0) toast.error(`${failedCount} invitation${failedCount > 1 ? 's' : ''} failed to send.`);
      setSelected(new Set());
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send invitations. Please try again.');
    } finally {
      setSendingInvite(false);
    }
  };

  // ── Export CSV ──────────────────────────────────────────
  const handleExportCSV = () => {
    const cols = ['NPI', 'Practice/Facility', 'Contact', 'Email', 'Phone', 'Title', 'Practice Type', 'Providers', 'Locations', 'Claim Volume', 'Submitted', 'Beta Invite', 'Status'];
    const rows = filtered.map(s => [
      s.npi, s.practiceName, s.contactName, s.email, s.phoneNumber, s.title,
      s.practiceType, s.providers, s.locations, s.claimVolume,
      formatDate(s.createdAt), s.betaInvite ? 'Yes' : 'No', s.status,
    ]);
    const csv = [cols, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'early-access-submissions.csv'; a.click();
    URL.revokeObjectURL(url);
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
            <button className="adm2-btn adm2-btn--primary">
              + Add Manual Entry
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
                {filtered.map(sub => {
                  const badge = practiceTypeBadge(sub.practiceType);
                  const sc = statusConfig[sub.status] ?? statusConfig['pending'];
                  const isSelected = selected.has(sub._id);
                  const isInvited = sub.invitationSent;
                  return (
                    <tr key={sub._id} className={`adm2-tr${isSelected ? ' adm2-tr--selected' : ''}${isInvited ? ' adm2-tr--invited' : ''}`}>
                      <td className="adm2-td adm2-td--check">
                        <input type="checkbox" className="adm2-checkbox" checked={isSelected} onChange={() => toggleRow(sub._id)} disabled={isInvited} />
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
        </div>

      </div>
    </div>
  );
};

export default AdminEarlyAccess;

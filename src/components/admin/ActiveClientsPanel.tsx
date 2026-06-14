import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ActiveClientSendMessageModal,
  type ClientMessageMode,
} from './ActiveClientSendMessageModal';
import {
  fetchOnboardingList,
  type ActiveClientRow,
} from '../../services/onboardingAdminService';
type SegmentId = 'all' | 'onboarding' | 'healthy' | 'at-risk' | 'renewal' | 'paused';

const SEGMENTS: { id: SegmentId; label: string; danger?: boolean }[] = [
  { id: 'all', label: 'All Clients' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'healthy', label: 'Healthy' },
  { id: 'at-risk', label: 'At-Risk', danger: true },
  { id: 'renewal', label: 'Renewal < 60d' },
  { id: 'paused', label: 'Paused' },
];

const STATUS_LABEL: Record<ActiveClientRow['status'], string> = {
  active: 'Active',
  onboarding: 'Onboarding',
  'at-risk': 'At Risk',
  paused: 'Paused',
};

const DEFAULT_SPECIALTIES = [
  'All specialties',
  'Anesthesia',
  'Ophthalmology',
  'Orthopedic Surg.',
  'Pain Mgmt.',
  'ASC',
  'Spine Surgery',
  'Endoscopy',
];

export const ActiveClientsPanel: React.FC = () => {
  const [clients, setClients] = useState<ActiveClientRow[]>([]);
  const [apiTotal, setApiTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [segment, setSegment] = useState<SegmentId>('all');
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All specialties');
  const [csm, setCsm] = useState('All CSMs');
  const [plan, setPlan] = useState('All plans');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sendModal, setSendModal] = useState<{ mode: ClientMessageMode; clients: ActiveClientRow[] } | null>(null);
  const PAGE_SIZE = 10;

  const loadClients = useCallback(async () => {
    const token = localStorage.getItem('adminAccessToken');
    if (!token) {
      setLoadError('Admin session expired. Please sign in again.');
      setClients([]);
      setApiTotal(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError('');
    try {
      const { clients: rows, total } = await fetchOnboardingList(token);
      setClients(rows);
      setApiTotal(total);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setLoadError(message || 'Could not load onboarding records.');
      setClients([]);
      setApiTotal(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const specialtyOptions = useMemo(() => {
    const fromData = clients
      .map((c) => c.specialty)
      .filter((s) => s && s !== '-');
    return ['All specialties', ...new Set([...DEFAULT_SPECIALTIES.slice(1), ...fromData])];
  }, [clients]);

  const segmentCounts = useMemo(() => ({
    all: clients.length,
    onboarding: clients.filter((c) => c.status === 'onboarding').length,
    healthy: clients.filter((c) => c.status === 'active').length,
    'at-risk': clients.filter((c) => c.status === 'at-risk').length,
    renewal: clients.filter((c) => c.renewal !== '-').length,
    paused: clients.filter((c) => c.status === 'paused').length,
  }), [clients]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) => {
      if (segment === 'onboarding' && c.status !== 'onboarding') return false;
      if (segment === 'healthy' && c.status !== 'active') return false;
      if (segment === 'at-risk' && c.status !== 'at-risk') return false;
      if (segment === 'paused' && c.status !== 'paused') return false;
      if (segment === 'renewal' && c.renewal === '-') return false;
      if (specialty !== 'All specialties' && c.specialty !== specialty) return false;
      if (csm !== 'All CSMs' && c.csmName !== '-' && !c.csmName.includes(csm.split(' ')[0])) return false;
      if (plan !== 'All plans' && c.plan !== plan) return false;
      if (q && !`${c.name} ${c.contact} ${c.accountId} ${c.contactEmail ?? ''} ${c.npi ?? ''}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [clients, segment, search, specialty, csm, plan]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id));
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((c) => next.add(c.id));
        return next;
      });
    }
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const selectedClients = useMemo(
    () => clients.filter((c) => selected.has(c.id)),
    [clients, selected],
  );

  const selectedOnboardingClients = useMemo(
    () => selectedClients.filter((c) => c.status === 'onboarding'),
    [selectedClients],
  );

  const openSendModal = (mode: ClientMessageMode) => {
    const targets = mode === 'reminder' ? selectedOnboardingClients : selectedClients;
    const withEmail = targets.filter((c) => c.contactEmail?.trim());
    if (!withEmail.length) {
      toast.error('Selected clients do not have a contact email on file.');
      return;
    }
    setSendModal({ mode, clients: withEmail });
  };

  const renderDashCell = (value: string) => (
    <span className={value === '-' ? 'adm2-dash' : undefined}>{value}</span>
  );

  const formatPracticeSub = (client: ActiveClientRow) => {
    const contactName = client.contact?.trim() && client.contact !== '-' ? client.contact.trim() : '';
    const email = client.contactEmail?.trim() ?? '';
    if (contactName && email) return `${contactName} · ${email}`;
    if (email) return email;
    if (contactName) return contactName;
    return '-';
  };

  const formatCompactNumber = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
    return value.toLocaleString('en-US');
  };

  const formatCompactCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${formatCompactNumber(value)}`;
    return `$${value.toLocaleString('en-US')}`;
  };

  const tileStats = useMemo(() => {
    const dash = '-';
    if (loading || loadError) {
      return {
        activePractices: dash,
        activeSub: dash,
        mrr: dash,
        mrrSub: dash,
        claims: dash,
        claimsSub: dash,
        atRisk: dash,
        atRiskSub: dash,
      };
    }

    const activeCount = clients.filter((c) => c.status === 'active').length;
    const activePracticesValue = activeCount > 0
      ? activeCount
      : (apiTotal ?? (clients.length > 0 ? clients.length : null));

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const datedClients = clients.filter((c) => c.createdAt);
    const addedLast30Days = datedClients.filter(
      (c) => new Date(c.createdAt!).getTime() >= thirtyDaysAgo,
    ).length;

    const mrrValues = clients
      .map((c) => c.mrrNumeric)
      .filter((n): n is number => n != null);
    const totalMrr = mrrValues.length > 0
      ? mrrValues.reduce((sum, n) => sum + n, 0)
      : null;

    const claimsValues = clients
      .map((c) => c.claimsNumeric)
      .filter((n): n is number => n != null);
    const totalClaims = claimsValues.length > 0
      ? claimsValues.reduce((sum, n) => sum + n, 0)
      : null;

    const atRiskCount = clients.filter((c) => c.status === 'at-risk').length;
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' }).toUpperCase();

    return {
      activePractices: activePracticesValue != null ? String(activePracticesValue) : dash,
      activeSub: datedClients.length > 0 ? `+${addedLast30Days} in last 30 days` : dash,
      mrr: totalMrr != null ? formatCompactCurrency(totalMrr) : dash,
      mrrSub: dash,
      claims: totalClaims != null ? formatCompactNumber(totalClaims) : dash,
      claimsSub: totalClaims != null ? `Across all clients · ${currentMonth}` : dash,
      atRisk: String(atRiskCount),
      atRiskSub: atRiskCount > 0 ? 'Need CSM intervention' : dash,
    };
  }, [clients, apiTotal, loading, loadError]);

  const claimsMonthLabel = new Date().toLocaleDateString('en-US', { month: 'long' }).toUpperCase();

  const handleExportCSV = () => {
    if (!filtered.length) {
      toast.error('No clients to export.');
      return;
    }

    const cols = [
      'Practice',
      'Contact',
      'Email',
      'Account ID',
      'NPI',
      'Specialty',
      'Plan',
      'MRR',
      `Claims (${claimsMonthLabel})`,
      'Health',
      'CSM',
      'Renewal',
      'Status',
    ];

    const rows = filtered.map((c) => [
      c.name,
      c.contact !== '-' ? c.contact : '',
      c.contactEmail ?? '',
      c.accountId !== '-' ? c.accountId : '',
      c.npi ?? '',
      c.specialty !== '-' ? c.specialty : '',
      c.plan !== '-' ? c.plan : '',
      c.mrr !== '-' ? c.mrr : '',
      c.claims !== '-' ? c.claims : '',
      c.health !== '-' ? c.health : '',
      c.csmName !== '-' ? c.csmName : '',
      c.renewal !== '-' ? c.renewal : '',
      STATUS_LABEL[c.status],
    ]);

    const csv = [cols, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `active-clients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="adm2-stats-grid">
        <div className="adm2-stat-card">
          <p className="adm2-stat-label">ACTIVE PRACTICES</p>
          <p className={`adm2-stat-value adm2-stat-value--blue${tileStats.activePractices === '-' ? ' adm2-stat-value--dash' : ''}`}>
            {tileStats.activePractices}
          </p>
          <p className={`adm2-stat-sub${tileStats.activeSub === '-' ? ' adm2-stat-sub--dash' : ''}`}>
            {tileStats.activeSub}
          </p>
        </div>
        <div className="adm2-stat-card">
          <p className="adm2-stat-label">MONTHLY RECURRING REVENUE</p>
          <p className={`adm2-stat-value adm2-stat-value--green${tileStats.mrr === '-' ? ' adm2-stat-value--dash' : ''}`}>
            {tileStats.mrr}
          </p>
          <p className={`adm2-stat-sub${tileStats.mrrSub === '-' ? ' adm2-stat-sub--dash' : ''}`}>
            {tileStats.mrrSub}
          </p>
        </div>
        <div className="adm2-stat-card">
          <p className="adm2-stat-label">CLAIMS PROCESSED ({claimsMonthLabel})</p>
          <p className={`adm2-stat-value${tileStats.claims === '-' ? ' adm2-stat-value--dash' : ''}`}>
            {tileStats.claims}
          </p>
          <p className={`adm2-stat-sub${tileStats.claimsSub === '-' ? ' adm2-stat-sub--dash' : ''}`}>
            {tileStats.claimsSub}
          </p>
        </div>
        <div className="adm2-stat-card">
          <p className="adm2-stat-label">AT-RISK ACCOUNTS</p>
          <p className={`adm2-stat-value adm2-stat-value--amber${tileStats.atRisk === '-' ? ' adm2-stat-value--dash' : ''}`}>
            {tileStats.atRisk}
          </p>
          <p className={`adm2-stat-sub${tileStats.atRiskSub === '-' ? ' adm2-stat-sub--dash' : ''}`}>
            {tileStats.atRiskSub}
          </p>
        </div>
      </div>

      {loadError && (
        <div className="adm2-alert-banner">
          <div className="adm2-alert-icon">!</div>
          <div className="adm2-alert-body">
            <p className="adm2-alert-title">Could not load client records</p>
            <p className="adm2-alert-text">{loadError}</p>
          </div>
          <button type="button" className="adm2-btn adm2-btn--outline" onClick={loadClients}>
            Retry
          </button>
        </div>
      )}

      <div className="adm2-segment-tabs">
        {SEGMENTS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`adm2-segment-tab${segment === s.id ? ' adm2-segment-tab--active' : ''}${s.danger ? ' adm2-segment-tab--danger' : ''}`}
            onClick={() => { setSegment(s.id); setPage(1); }}
          >
            {s.label}
            <span className="adm2-segment-count">{segmentCounts[s.id]}</span>
          </button>
        ))}
      </div>

      <div className="adm2-toolbar adm2-toolbar--card">
        <div className="adm2-toolbar-left">
          <div className="adm2-search-wrap adm2-search-wrap--wide">
            <svg className="adm2-search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5" stroke="#9ca3af" strokeWidth="1.5" />
              <path d="M10.5 10.5l3 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              className="adm2-search"
              placeholder="Search by practice, contact, NPI, or account ID…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="adm2-filter-select" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
            {specialtyOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <select className="adm2-filter-select" value={csm} onChange={(e) => setCsm(e.target.value)}>
            {['All CSMs', 'Priya Anand', 'Jordan Mills', 'Talia Reyes', 'Sarah Klein'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <select className="adm2-filter-select" value={plan} onChange={(e) => setPlan(e.target.value)}>
            {['All plans', 'Beta cohort', 'Starter', 'Professional', 'Enterprise'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className="adm2-toolbar-right">
          <button type="button" className="adm2-btn adm2-btn--ghost" onClick={loadClients} disabled={loading}>
            Refresh
          </button>
          <button
            type="button"
            className="adm2-btn adm2-btn--ghost"
            onClick={handleExportCSV}
            disabled={loading || filtered.length === 0}
          >
            Export CSV
          </button>
          <button
            type="button"
            className="adm2-btn adm2-btn--outline"
            onClick={() => window.open('/early-access', '_blank', 'noopener,noreferrer')}
          >
            + Add Client
          </button>
        </div>
      </div>

      <div className="adm2-table-wrap">
        {someSelected && (
          <div className="adm2-bulk-bar adm2-bulk-bar--in-table">
            <span className="adm2-bulk-label">
              <strong>{selected.size} client{selected.size !== 1 ? 's' : ''} selected</strong>
              {' · Apply bulk action to selected rows'}
            </span>
            <div className="adm2-bulk-actions">
              {selectedOnboardingClients.length > 0 && (
                <button
                  type="button"
                  className="adm2-btn adm2-btn--primary"
                  onClick={() => openSendModal('reminder')}
                >
                  Send Reminder
                </button>
              )}
              <button
                type="button"
                className="adm2-btn adm2-btn--primary"
                onClick={() => openSendModal('email')}
              >
                Send Email
              </button>
              <button type="button" className="adm2-btn adm2-btn--ghost" onClick={clearSelection}>
                Clear Selection
              </button>
            </div>
          </div>
        )}
        <table className="adm2-table adm2-table--clients">
          <thead>
            <tr>
              <th className="adm2-th adm2-th--check">
                <input
                  type="checkbox"
                  className="adm2-checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={loading || filtered.length === 0}
                  aria-label="Select all clients"
                />
              </th>
              <th className="adm2-th">PRACTICE</th>
              <th className="adm2-th">SPECIALTY</th>
              <th className="adm2-th">PLAN</th>
              <th className="adm2-th">MRR</th>
              <th className="adm2-th">CLAIMS (MAY)</th>
              <th className="adm2-th">HEALTH</th>
              <th className="adm2-th">CSM</th>
              <th className="adm2-th">RENEWAL</th>
              <th className="adm2-th">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="adm2-tr">
                <td className="adm2-td" colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  Loading onboarding records…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr className="adm2-tr">
                <td className="adm2-td" colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  No clients match the current filters.
                </td>
              </tr>
            )}
            {!loading && rows.map((c) => {
              const isSelected = selected.has(c.id);
              return (
              <tr key={c.id} className={`adm2-tr${isSelected ? ' adm2-tr--selected' : ''}`}>
                <td className="adm2-td adm2-td--check">
                  <input
                    type="checkbox"
                    className="adm2-checkbox"
                    checked={isSelected}
                    onChange={() => toggleRow(c.id)}
                    aria-label={`Select ${c.name}`}
                  />
                </td>
                <td className="adm2-td">
                  <div className="adm2-client-practice">
                    <span className="adm2-client-avatar" style={c.avatarStyle}>{c.initials}</span>
                    <div>
                      <span className="adm2-practice-name">{c.name}</span>
                      <span className="adm2-practice-sub">{formatPracticeSub(c)}</span>
                    </div>
                  </div>
                </td>
                <td className="adm2-td">
                  <span className="adm2-specialty-badge">{c.specialty}</span>
                </td>
                <td className="adm2-td">{renderDashCell(c.plan)}</td>
                <td className="adm2-td adm2-td--mrr">{renderDashCell(c.mrr)}</td>
                <td className="adm2-td">{renderDashCell(c.claims)}</td>
                <td className="adm2-td">{renderDashCell(c.health)}</td>
                <td className="adm2-td">
                  <div className="adm2-csm">
                    <span className="adm2-csm-avatar" style={c.csmStyle}>{c.csmInitials}</span>
                    <span className="adm2-csm-name">{c.csmName}</span>
                  </div>
                </td>
                <td className="adm2-td adm2-td--date">{renderDashCell(c.renewal)}</td>
                <td className="adm2-td">
                  <span className={`adm2-client-status adm2-client-status--${c.status}`}>
                    <span className="adm2-status-dot" />
                    {STATUS_LABEL[c.status]}
                  </span>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
        <div className="adm2-table-footer">
          <span className="adm2-pagination-info">
            Showing {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} client{filtered.length !== 1 ? 's' : ''}
          </span>
          <div className="adm2-pagination">
            <button type="button" className="adm2-page-btn adm2-page-btn--nav" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`adm2-page-btn${page === p ? ' adm2-page-btn--active' : ''}`}
                onClick={() => setPage(p)}
              >{p}</button>
            ))}
            <button type="button" className="adm2-page-btn adm2-page-btn--nav" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
          </div>
        </div>
      </div>

      <div className="adm2-system-info">
        <strong>Health score logic:</strong>
        {' '}Each client&apos;s health score is computed nightly from a weighted blend of four signals:{' '}
        <code>product_usage</code> (40%, claims-submitted vs. historical baseline),{' '}
        <code>support_load</code> (20%, open ticket count and severity),{' '}
        <code>billing_status</code> (20%, payment timeliness and contract activity), and{' '}
        <code>relationship_signal</code> (20%, CSM-logged sentiment and meeting cadence).
        Scores below 60 auto-route to the At-Risk segment and create a CSM task.
        Click any row to open the full client profile with usage charts, ticket history, and renewal playbook.
      </div>

      <ActiveClientSendMessageModal
        open={sendModal != null}
        mode={sendModal?.mode ?? 'reminder'}
        clients={sendModal?.clients ?? []}
        onClose={() => setSendModal(null)}
      />
    </>
  );
};

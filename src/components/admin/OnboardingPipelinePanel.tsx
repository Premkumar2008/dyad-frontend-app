import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchOnboardingRecords } from '../../services/onboardingAdminService';
import { OnboardingPipelineDetailModal } from './OnboardingPipelineDetailModal';
import {
  computePipelineStats,
  isPipelineRecord,
  mapRecordToPipelineRow,
  type PipelineRow,
} from './onboardingPipelineData';
import './OnboardingPipelinePanel.css';

type SortKey = 'practice' | 'stage' | 'days' | 'updated';
type StallFilter = 'all' | 'stalled' | 'active';

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

export const OnboardingPipelinePanel: React.FC = () => {
  const [rows, setRows] = useState<PipelineRow[]>([]);
  const [apiTotal, setApiTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All specialties');
  const [stallFilter, setStallFilter] = useState<StallFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [detailRow, setDetailRow] = useState<PipelineRow | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const loadPipeline = useCallback(async () => {
    const token = localStorage.getItem('adminAccessToken');
    if (!token) {
      setLoadError('Admin session expired. Please sign in again.');
      setRows([]);
      setApiTotal(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError('');
    try {
      const { records, total } = await fetchOnboardingRecords(token);
      const pipelineRows = records
        .filter(isPipelineRecord)
        .map(mapRecordToPipelineRow);
      setRows(pipelineRows);
      setApiTotal(total);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setLoadError(message || 'Could not load onboarding pipeline.');
      setRows([]);
      setApiTotal(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPipeline();
  }, [loadPipeline]);

  const stats = useMemo(() => computePipelineStats(rows), [rows]);

  const specialtyOptions = useMemo(() => {
    const fromData = rows.map(r => r.specialty).filter(s => s && s !== '-');
    return ['All specialties', ...new Set([...DEFAULT_SPECIALTIES.slice(1), ...fromData])];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter(r => {
      if (specialty !== 'All specialties' && r.specialty !== specialty) return false;
      if (stallFilter === 'stalled' && !r.isStalled) return false;
      if (stallFilter === 'active' && r.isStalled) return false;
      if (q && !`${r.practiceName} ${r.contactName} ${r.contactEmail} ${r.npi} ${r.onboardingId}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortKey === 'practice') return a.practiceName.localeCompare(b.practiceName);
      if (sortKey === 'stage') return a.currentStep - b.currentStep;
      if (sortKey === 'days') return b.daysInStage - a.daysInStage;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return list;
  }, [rows, search, specialty, stallFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, specialty, stallFilter, sortKey]);

  const handleExport = () => {
    if (!filtered.length) {
      toast.error('No rows to export');
      return;
    }
    const header = ['Practice', 'Contact', 'Email', 'Stage', 'Progress', 'Days in stage', 'Days total', 'NPI', 'Onboarding ID'];
    const lines = filtered.map(r => [
      r.practiceName,
      r.contactName,
      r.contactEmail,
      r.stageLabel,
      r.progressLabel,
      String(r.daysInStage),
      String(r.daysTotal),
      r.npi,
      r.onboardingId,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-pipeline-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Pipeline exported');
  };

  return (
    <div className="obp-root">
      <div className="adm2-stats-grid">
        <div className="adm2-stat-card">
          <p className="adm2-stat-label">IN PIPELINE</p>
          <p className={`adm2-stat-value adm2-stat-value--blue${stats.inPipeline ? '' : ' adm2-stat-value--dash'}`}>
            {loading ? '…' : stats.inPipeline || '—'}
          </p>
          <p className="adm2-stat-sub">
            {apiTotal != null && !loading
              ? `${apiTotal} total from API · active enrollments`
              : 'Active enrollments'}
          </p>
        </div>
        <div className="adm2-stat-card">
          <p className="adm2-stat-label">AVG. DAYS IN PIPELINE</p>
          <p className={`adm2-stat-value${stats.avgDaysToLive != null ? '' : ' adm2-stat-value--dash'}`}>
            {loading ? '…' : stats.avgDaysToLive ?? '—'}
          </p>
          <p className="adm2-stat-sub">Rolling cohort average</p>
        </div>
        <div className="adm2-stat-card">
          <p className="adm2-stat-label">STALLED (&gt; 14d)</p>
          <p className={`adm2-stat-value adm2-stat-value--amber${stats.stalled ? '' : ' adm2-stat-value--dash'}`}>
            {loading ? '…' : stats.stalled || '—'}
          </p>
          <p className="adm2-stat-sub">Needs follow-up</p>
        </div>
        <div className="adm2-stat-card">
          <p className="adm2-stat-label">NEAR GO-LIVE</p>
          <p className={`adm2-stat-value adm2-stat-value--green${stats.goLiveReady ? '' : ' adm2-stat-value--dash'}`}>
            {loading ? '…' : stats.goLiveReady || '—'}
          </p>
          <p className="adm2-stat-sub">Banking complete</p>
        </div>
      </div>

      <div className="adm2-toolbar adm2-toolbar--card obp-toolbar">
        <div className="adm2-toolbar-left">
          <div className="adm2-search-wrap adm2-search-wrap--wide">
            <svg className="adm2-search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5" stroke="#9ca3af" strokeWidth="1.5" />
              <path d="M10.5 10.5l3 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              className="adm2-search"
              placeholder="Search practice, contact, NPI, or onboarding ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="adm2-filter-select" value={specialty} onChange={e => setSpecialty(e.target.value)}>
            {specialtyOptions.map(o => <option key={o}>{o}</option>)}
          </select>
          <select className="adm2-filter-select" value={stallFilter} onChange={e => setStallFilter(e.target.value as StallFilter)}>
            <option value="all">All activity</option>
            <option value="stalled">Stalled only</option>
            <option value="active">Active (&lt; 14d)</option>
          </select>
          <select className="adm2-filter-select" value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
            <option value="updated">Sort: Last updated</option>
            <option value="days">Sort: Days in stage</option>
            <option value="stage">Sort: Step progress</option>
            <option value="practice">Sort: Practice name</option>
          </select>
        </div>
        <div className="adm2-toolbar-right">
          <button type="button" className="adm2-btn adm2-btn--ghost" onClick={loadPipeline} disabled={loading}>
            Refresh
          </button>
          <button type="button" className="adm2-btn adm2-btn--ghost" onClick={handleExport} disabled={loading || !filtered.length}>
            Export CSV
          </button>
        </div>
      </div>

      {loadError && (
        <div className="obp-error-banner" role="alert">{loadError}</div>
      )}

      <div className="adm2-table-wrap">
        <table className="adm2-table obp-table">
          <thead>
            <tr>
              <th className="adm2-th">PRACTICE</th>
              <th className="adm2-th">STAGE</th>
              <th className="adm2-th">PROGRESS</th>
              <th className="adm2-th">DAYS IN STAGE</th>
              <th className="adm2-th">MILESTONES</th>
              <th className="adm2-th adm2-th--actions">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="adm2-tr">
                <td className="adm2-td obp-empty" colSpan={6}>Loading pipeline…</td>
              </tr>
            )}
            {!loading && pageRows.length === 0 && (
              <tr className="adm2-tr">
                <td className="adm2-td obp-empty" colSpan={6}>
                  {loadError ? 'Unable to display pipeline records.' : 'No practices match your filters.'}
                </td>
              </tr>
            )}
            {!loading && pageRows.map(row => (
              <tr
                key={row.id}
                className={`adm2-tr adm2-tr--clickable${row.isStalled ? ' obp-tr--stalled' : ''}`}
                onClick={() => setDetailRow(row)}
              >
                <td className="adm2-td">
                  <span className="adm2-practice-name">{row.practiceName}</span>
                  <span className="adm2-practice-sub">
                    {row.contactName}{row.contactEmail ? ` · ${row.contactEmail}` : ''}
                  </span>
                </td>
                <td className="adm2-td">
                  <span className="obp-stage-pill" style={{ borderColor: row.stageColor, color: row.stageColor }}>
                    {row.stageLabel}
                  </span>
                </td>
                <td className="adm2-td">
                  <div className="obp-progress-cell">
                    <span className="obp-progress-label">{row.progressLabel}</span>
                    <div className="obp-progress-bar">
                      <div className="obp-progress-fill" style={{ width: `${row.progressPct}%`, background: row.stageColor }} />
                    </div>
                  </div>
                </td>
                <td className="adm2-td">
                  <span className={row.isStalled ? 'obp-days-stalled' : undefined}>
                    {row.daysInStage} days
                  </span>
                </td>
                <td className="adm2-td">
                  <div className="obp-milestones">
                    {row.callScheduled && <span className="obp-milestone-chip">Call</span>}
                    {row.isStalled && <span className="obp-milestone-chip obp-milestone-chip--warn">Stalled</span>}
                    {!row.callScheduled && !row.isStalled && (
                      <span className="adm2-dash">—</span>
                    )}
                  </div>
                </td>
                <td className="adm2-td adm2-td--actions" onClick={e => e.stopPropagation()}>
                  <button type="button" className="adm2-btn adm2-btn--ghost adm2-btn--sm" onClick={() => setDetailRow(row)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && filtered.length > PAGE_SIZE && (
        <div className="obp-pagination">
          <span className="obp-pagination-meta">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="obp-pagination-btns">
            <button type="button" className="adm2-btn adm2-btn--ghost adm2-btn--sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </button>
            <button type="button" className="adm2-btn adm2-btn--ghost adm2-btn--sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next
            </button>
          </div>
        </div>
      )}

      <OnboardingPipelineDetailModal row={detailRow} onClose={() => setDetailRow(null)} />
    </div>
  );
};

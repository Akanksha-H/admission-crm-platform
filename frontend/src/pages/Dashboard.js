/**
 * Dashboard — Pipeline, Funnel, Source Chart, Counsellor Performance
 * @author Aakanksha Hedau
 */
import React, { useEffect, useState } from 'react';
import { fetchDashboard } from '../api';
import { GlobalTopbar } from '../App';

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Source badge colors ───────────────────────────────────────────────────────
function SourceBadge({ source }) {
  return <span className={`badge source-${source.replace(/\s+/g, '-')}`}>{source}</span>;
}

// ── Conversion Funnel with drop-off % ────────────────────────────────────────
function ConversionFunnel({ pipeline, total, onGoLeads }) {
  const stages = ['New', 'Contacted', 'Interested', 'Follow-up Scheduled', 'Converted'];
  const [hovered, setHovered] = useState(null);

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Conversion Funnel</h2>
      <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
        Drop-off % shows how many leads were lost between each stage. <strong>Click any stage</strong> to view those leads.
      </p>
      <table className="funnel-table">
        <thead>
          <tr>
            <th style={{ width: 180 }}>Stage</th>
            <th style={{ width: 50 }}>Count</th>
            <th>Volume</th>
            <th style={{ width: 100 }}>% of Total</th>
            <th style={{ width: 110 }}>Drop-off</th>
          </tr>
        </thead>
        <tbody>
          {stages.map((stage, i) => {
            const count  = pipeline[stage] || 0;
            const pct    = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            const prev   = i > 0 ? (pipeline[stages[i - 1]] || 0) : null;
            const dropoff = prev !== null && prev > 0
              ? (((prev - count) / prev) * 100).toFixed(1) : null;
            const barWidth = total > 0 ? `${(count / total) * 100}%` : '0%';
            const isHovered = hovered === stage;

            return (
              <tr
                key={stage}
                className="funnel-row"
                style={{
                  cursor: 'pointer',
                  background: isHovered ? '#f5f3ff' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onClick={() => onGoLeads({ status: stage })}
                onMouseEnter={() => setHovered(stage)}
                onMouseLeave={() => setHovered(null)}
                title={`View ${count} "${stage}" lead${count !== 1 ? 's' : ''}`}
              >
                <td style={{ fontWeight: 600, color: isHovered ? '#4f46e5' : '#374151' }}>
                  {stage}
                </td>
                <td style={{ fontWeight: 700 }}>{count}</td>
                <td>
                  <div className="funnel-bar-wrap">
                    <div className="funnel-bar" style={{
                      width: barWidth,
                      background: isHovered ? '#4f46e5' : '#818cf8',
                    }} />
                  </div>
                </td>
                <td style={{ color: '#6b7280' }}>{pct}%</td>
                <td>
                  {dropoff !== null ? (
                    <span className={`funnel-drop ${parseFloat(dropoff) <= 20 ? 'good' : ''}`}>
                      ▼ {dropoff}%
                    </span>
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af' }}>
        🔴 Drop-off &gt;20% = needs attention &nbsp;|&nbsp; 🟢 Drop-off ≤20% = healthy progression
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard({ page, onViewLead, onGoLeads }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard().then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="content" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 32 }}>⏳</div>
      <p style={{ color: '#9ca3af', marginTop: 10 }}>Loading dashboard...</p>
    </div>
  );

  const { total, pipeline, bySource, byCounsellor, aged, needsFollowUp, conversionRate, recentLeads } = data;
  const STATUSES = ['New', 'Contacted', 'Interested', 'Follow-up Scheduled', 'Converted', 'Dropped'];

  // Empty state
  if (total === 0) return (
    <>
      <GlobalTopbar page={page} actions={
        <button className="btn-primary" onClick={onGoLeads}>Add First Lead</button>
      } />
      <div className="content">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <div className="empty-icon">🎓</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>No leads yet</p>
          <p>Add your first admission lead to start tracking the pipeline.</p>
          <button className="btn-primary" style={{ marginTop: 20 }} onClick={onGoLeads}>+ Add Lead</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <GlobalTopbar page={page} actions={
        <button className="btn-primary" onClick={onGoLeads}>View All Leads</button>
      } />
      <div className="content">

        {/* Alert banners */}
        {aged > 0 && (
          <div className="alert alert-warning">
            ⚠️ <strong>{aged} lead{aged !== 1 ? 's' : ''}</strong> have been active for more than 7 days without conversion — review and follow up.
          </div>
        )}
        {needsFollowUp > 0 && (
          <div className="alert alert-danger">
            🔔 <strong>{needsFollowUp} lead{needsFollowUp !== 1 ? 's' : ''}</strong> need immediate follow-up (no contact in 3+ days).
          </div>
        )}

        {/* Key stats */}
        <div className="stats-grid">
          <div className="stat-card highlight">
            <div className="stat-label">Total Leads</div>
            <div className="stat-value">{total}</div>
            <div className="stat-sub">All time</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Conversion Rate</div>
            <div className="stat-value">{conversionRate}%</div>
            <div className="stat-sub">{pipeline['Converted'] || 0} converted</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-label">Aged Leads</div>
            <div className="stat-value">{aged}</div>
            <div className="stat-sub">7+ days, not closed</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-label">Needs Follow-up</div>
            <div className="stat-value">{needsFollowUp}</div>
            <div className="stat-sub">3+ days no contact</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Leads</div>
            <div className="stat-value">{total - (pipeline['Converted'] || 0) - (pipeline['Dropped'] || 0)}</div>
            <div className="stat-sub">In progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Dropped</div>
            <div className="stat-value">{pipeline['Dropped'] || 0}</div>
            <div className="stat-sub">Lost leads</div>
          </div>
        </div>

        {/* Pipeline status boxes */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Lead Pipeline</h2>
          <div className="pipeline">
            {STATUSES.map(s => (
              <div key={s} className={`pipeline-item ${s.replace(/\s+/g, '-')}`}>
                <div className="pipeline-count">{pipeline[s] || 0}</div>
                <div className="pipeline-label">{s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion funnel with drop-off */}
        <ConversionFunnel pipeline={pipeline} total={total} onGoLeads={onGoLeads} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* By source */}
          <div className="card">
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Leads by Source</h2>
            {Object.entries(bySource)
              .filter(([, v]) => v > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([source, count]) => (
                <div key={source} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
                    <SourceBadge source={source} />
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{count} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({((count / total) * 100).toFixed(0)}%)</span></span>
                  </div>
                  <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3 }}>
                    <div style={{
                      height: '100%', borderRadius: 3, background: '#4f46e5',
                      width: `${(count / total) * 100}%`, transition: 'width 0.4s'
                    }} />
                  </div>
                </div>
              ))}
          </div>

          {/* By counsellor */}
          <div className="card">
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Counsellor Performance</h2>
            <div className="table-wrap">
              <table className="counsellor-table">
                <thead>
                  <tr>
                    <th>Counsellor</th>
                    <th>Total</th>
                    <th>Active</th>
                    <th>Converted</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {byCounsellor.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>{c.total}</td>
                      <td>{c.active}</td>
                      <td><span style={{ color: '#059669', fontWeight: 700 }}>{c.converted}</span></td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>
                        {c.total > 0 ? ((c.converted / c.total) * 100).toFixed(0) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent leads */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Recent Leads</h2>
            <button className="btn-secondary btn-sm" onClick={onGoLeads}>View all →</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Counsellor</th>
                  <th>Added</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <div className="td-name">{lead.name}</div>
                      <div className="td-sub">{lead.phone}</div>
                    </td>
                    <td>{lead.coursePreference}</td>
                    <td><SourceBadge source={lead.source} /></td>
                    <td><span className={`badge badge-${lead.status.replace(/\s+/g, '-')}`}>{lead.status}</span></td>
                    <td>{lead.counsellorName}</td>
                    <td>{fmt(lead.createdAt)}</td>
                    <td>
                      <button className="action-btn action-btn-view" onClick={() => onViewLead(lead.id)} title="View lead">
                        👁
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}

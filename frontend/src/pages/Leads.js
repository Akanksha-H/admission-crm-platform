/**
 * Leads — List, Filters, Add Modal, CSV Export
 * @author Aakanksha Hedau
 */
import React, { useEffect, useState, useCallback } from 'react';
import { fetchLeads, fetchMeta, createLead, deleteLead } from '../api';
import { useToast, Toast } from '../components/Toast';
import { GlobalTopbar } from '../App';

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Export to CSV ─────────────────────────────────────────────────────────────
function exportCSV(leads) {
  const headers = ['Name', 'Phone', 'Email', 'Source', 'Course', 'Status', 'Counsellor', 'Added', 'Last Follow-up', 'Age (days)'];
  const rows = leads.map(l => [
    l.name,
    l.phone,
    l.email || '',
    l.source,
    l.coursePreference,
    l.status,
    l.counsellorName,
    l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-IN') : '',
    l.lastFollowUp ? new Date(l.lastFollowUp).toLocaleDateString('en-IN') : 'Never',
    l.daysSinceCreated,
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `admission_leads_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Form validation ───────────────────────────────────────────────────────────
function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Full name is required';
  else if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

  if (!form.phone.trim()) errors.phone = 'Phone number is required';
  else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) errors.phone = 'Enter a valid 10-digit Indian mobile number';

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address';

  if (!form.source) errors.source = 'Please select a lead source';
  if (!form.coursePreference) errors.coursePreference = 'Please select a course';
  return errors;
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="field-error">⚠ {msg}</div>;
}

// ── Add Lead Modal ────────────────────────────────────────────────────────────
function AddLeadModal({ meta, onClose, onCreated, onViewDuplicate }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: '', coursePreference: '', counsellorId: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [duplicateId, setDuplicateId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    setTouched(t => ({ ...t, [field]: true }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
    // Clear duplicate warning if phone changes
    if (field === 'phone') { setDuplicateId(null); setServerError(''); }
  }

  function blur(field) { setTouched(t => ({ ...t, [field]: true })); }

  const liveErrors = validate(form);

  async function submit(e) {
    e.preventDefault();
    setServerError('');
    setDuplicateId(null);
    setTouched({ name: true, phone: true, email: true, source: true, coursePreference: true });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      await createLead(form);
      onCreated();
      onClose();
    } catch (err) {
      if (err.existingLeadId) {
        // Duplicate phone — show actionable warning
        setDuplicateId(err.existingLeadId);
        setServerError(err.error || 'A lead with this phone number already exists.');
      } else {
        setServerError(err.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function getErr(field) { return touched[field] ? (errors[field] || liveErrors[field]) : ''; }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Add New Lead</h2>
        {serverError && (
          <div className="alert alert-danger" style={{ marginBottom: 14 }}>
            <div>⚠️ {serverError}</div>
            {duplicateId && (
              <button
                className="btn-secondary btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => { onClose(); onViewDuplicate(duplicateId); }}
              >
                👁 View existing lead →
              </button>
            )}
          </div>
        )}
        <form onSubmit={submit} noValidate>
          <div className="form-grid">
            <div className="form-row">
              <label>Full Name *</label>
              <input
                className={getErr('name') ? 'input-error' : ''}
                placeholder="e.g. Rahul Kumar"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                onBlur={() => blur('name')}
              />
              <FieldError msg={getErr('name')} />
            </div>
            <div className="form-row">
              <label>Phone *</label>
              <input
                className={getErr('phone') ? 'input-error' : ''}
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                onBlur={() => blur('phone')}
                maxLength={10}
              />
              <FieldError msg={getErr('phone')} />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input
                type="email"
                className={getErr('email') ? 'input-error' : ''}
                placeholder="optional"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                onBlur={() => blur('email')}
              />
              <FieldError msg={getErr('email')} />
            </div>
            <div className="form-row">
              <label>Lead Source *</label>
              <select
                className={getErr('source') ? 'input-error' : ''}
                value={form.source}
                onChange={e => set('source', e.target.value)}
                onBlur={() => blur('source')}
              >
                <option value="">Select source</option>
                {meta.sources.map(s => <option key={s}>{s}</option>)}
              </select>
              <FieldError msg={getErr('source')} />
            </div>
            <div className="form-row">
              <label>Course Preference *</label>
              <select
                className={getErr('coursePreference') ? 'input-error' : ''}
                value={form.coursePreference}
                onChange={e => set('coursePreference', e.target.value)}
                onBlur={() => blur('coursePreference')}
              >
                <option value="">Select course</option>
                {meta.courses.map(c => <option key={c}>{c}</option>)}
              </select>
              <FieldError msg={getErr('coursePreference')} />
            </div>
            <div className="form-row">
              <label>Assign Counsellor</label>
              <select value={form.counsellorId} onChange={e => set('counsellorId', e.target.value)}>
                <option value="">Unassigned</option>
                {meta.counsellors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Source badge ──────────────────────────────────────────────────────────────
function SourceBadge({ source }) {
  const cls = `badge source-${source.replace(/\s+/g, '-')}`;
  return <span className={cls}>{source}</span>;
}

// ── Main Leads page ───────────────────────────────────────────────────────────
export default function Leads({ page, onViewLead, initialFilter, onFilterUsed }) {
  const [leads, setLeads] = useState([]);
  const [meta, setMeta] = useState(null);
  const [filters, setFilters] = useState(
    initialFilter || { status: '', counsellorId: '', source: '', search: '' }
  );
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  // Apply incoming filter change (e.g. from funnel click)
  React.useEffect(() => {
    if (initialFilter && Object.values(initialFilter).some(v => v)) {
      setFilters(initialFilter);
      if (onFilterUsed) onFilterUsed();
    }
  }, []); // eslint-disable-line

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchLeads(filters);
    setLeads(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetchMeta().then(setMeta); }, []);

  function setFilter(k, v) { setFilters(f => ({ ...f, [k]: v })); }

  async function handleDelete(id, name, e) {
    e.stopPropagation();
    if (!window.confirm(`Delete lead "${name}"? This cannot be undone.`)) return;
    await deleteLead(id);
    addToast(`Lead "${name}" deleted`, 'info');
    load();
  }

  function handleCreated() {
    addToast('Lead added successfully!', 'success');
    load();
  }

  function handleExport() {
    if (leads.length === 0) { addToast('No leads to export', 'info'); return; }
    exportCSV(leads);
    addToast(`Exported ${leads.length} lead${leads.length !== 1 ? 's' : ''} to CSV`, 'success');
  }

  if (!meta) return <div className="content" style={{ textAlign: 'center', paddingTop: 80 }}>⏳ Loading...</div>;

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      {showModal && (
        <AddLeadModal
          meta={meta}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
          onViewDuplicate={id => { setShowModal(false); onViewLead(id); }}
        />
      )}
      <GlobalTopbar page={page} actions={
        <>
          <button className="btn-secondary" onClick={handleExport} title="Export filtered leads to CSV">
            ⬇ Export CSV
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Lead</button>
        </>
      } />
      <div className="content">
        {/* Filters */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="filters">
            <input
              placeholder="🔍 Search by name, email, phone..."
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
              style={{ minWidth: 240 }}
            />
            <select value={filters.status} onChange={e => setFilter('status', e.target.value)}>
              <option value="">All Statuses</option>
              {meta.statuses.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={filters.source} onChange={e => setFilter('source', e.target.value)}>
              <option value="">All Sources</option>
              {meta.sources.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={filters.counsellorId} onChange={e => setFilter('counsellorId', e.target.value)}>
              <option value="">All Counsellors</option>
              {meta.counsellors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {(filters.status || filters.source || filters.counsellorId || filters.search) && (
              <button className="btn-secondary btn-sm" onClick={() => setFilters({ status: '', counsellorId: '', source: '', search: '' })}>
                Clear filters
              </button>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>
            Showing <strong>{leads.length}</strong> lead{leads.length !== 1 ? 's' : ''}
            {(filters.status || filters.source || filters.counsellorId || filters.search) && ' (filtered)'}
          </div>
        </div>

        {/* Table */}
        <div className="card">
          {loading ? (
            <div className="empty-state"><div className="empty-icon">⏳</div><p>Loading leads...</p></div>
          ) : leads.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No leads found. Try adjusting your filters or add a new lead.</p>
            </div>
          ) : (
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
                    <th>Last Follow-up</th>
                    <th>Age</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => onViewLead(lead.id)}>
                      <td>
                        <div className="td-name">{lead.name}</div>
                        <div className="td-sub">{lead.phone}</div>
                      </td>
                      <td style={{ maxWidth: 160 }}>{lead.coursePreference}</td>
                      <td><SourceBadge source={lead.source} /></td>
                      <td>
                        <span className={`badge badge-${lead.status.replace(/\s+/g, '-')}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td>
                        {lead.counsellorName === 'Unassigned'
                          ? <span className="badge badge-unassigned">Unassigned</span>
                          : lead.counsellorName}
                      </td>
                      <td>{fmt(lead.createdAt)}</td>
                      <td>
                        {lead.lastFollowUp
                          ? <span style={{ color: lead.daysSinceFollowUp > 3 ? '#dc2626' : '#374151' }}>
                              {fmt(lead.lastFollowUp)}
                            </span>
                          : <span style={{ color: '#dc2626' }}>Never</span>}
                      </td>
                      <td>
                        <span className={lead.isAged ? 'badge badge-aged' : ''}>
                          {lead.daysSinceCreated}d
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="action-btn action-btn-view" title="View lead" onClick={() => onViewLead(lead.id)}>
                          👁
                        </button>
                        <button className="action-btn action-btn-delete" title="Delete lead"
                          onClick={e => handleDelete(lead.id, lead.name, e)}>
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

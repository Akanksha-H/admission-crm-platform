/**
 * Lead Detail — Edit Form, Status Stepper, Follow-up Notes, Quick Actions
 * @author Aakanksha Hedau
 */
import React, { useEffect, useState } from 'react';
import { fetchLead, fetchMeta, updateLead, addNote } from '../api';
import { useToast, Toast } from '../components/Toast';
import { GlobalTopbar } from '../App';

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

const STATUS_FLOW = ['New', 'Contacted', 'Interested', 'Follow-up Scheduled', 'Converted', 'Dropped'];

export default function LeadDetail({ page, id, onBack }) {
  const [lead, setLead]         = useState(null);
  const [meta, setMeta]         = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteBy, setNoteBy]     = useState('');
  const [saving, setSaving]     = useState(false);
  const [editing, setEditing]   = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const { toasts, addToast, removeToast } = useToast();

  async function load() {
    const [l, m] = await Promise.all([fetchLead(id), fetchMeta()]);
    setLead(l);
    setMeta(m);
    setEditForm({
      name:             l.name,
      phone:            l.phone,
      email:            l.email || '',
      source:           l.source,
      status:           l.status,
      counsellorId:     l.counsellorId || '',
      coursePreference: l.coursePreference,
    });
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  function setF(field, val) {
    setEditForm(f => ({ ...f, [field]: val }));
    setEditErrors(e => ({ ...e, [field]: '' }));
  }

  function validateEdit() {
    const errs = {};
    if (!editForm.name.trim()) errs.name = 'Name is required';
    if (!editForm.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(editForm.phone.trim())) errs.phone = 'Enter a valid 10-digit mobile number';
    if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) errs.email = 'Invalid email';
    return errs;
  }

  async function handleStatusChange(status) {
    const updated = await updateLead(id, { status });
    setLead(updated);
    setEditForm(f => ({ ...f, status }));
    addToast(`Status updated to "${status}"`, 'success');
  }

  async function handleSaveEdit() {
    const errs = validateEdit();
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    setSaving(true);
    const updated = await updateLead(id, editForm);
    setLead(updated);
    setEditing(false);
    setSaving(false);
    setEditErrors({});
    addToast('Lead details saved', 'success');
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    const updated = await addNote(id, noteText.trim(), noteBy.trim() || 'Staff');
    setLead(updated);
    setNoteText('');
    setNoteBy('');
    setSaving(false);
    addToast('Follow-up note added', 'success');
  }

  if (!lead || !meta) return (
    <div className="content" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 32 }}>⏳</div>
      <p style={{ color: '#9ca3af', marginTop: 10 }}>Loading lead...</p>
    </div>
  );

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <GlobalTopbar page={page} actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="back-btn" onClick={onBack}>← Back</button>
          {lead.isAged && <span className="badge badge-aged">Aged</span>}
          {lead.needsFollowUp && <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>Needs Follow-up</span>}
          <span style={{ color: '#d1d5db' }}>|</span>
          {!editing
            ? <button className="btn-secondary" onClick={() => setEditing(true)}>✏️ Edit</button>
            : <>
                <button className="btn-secondary" onClick={() => { setEditing(false); setEditErrors({}); }}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveEdit} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
          }
        </div>
      } />

      <div className="content">
        {/* Status stepper */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 12 }}>LEAD STATUS</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STATUS_FLOW.map(s => {
              const isActive    = lead.status === s;
              const isDropped   = s === 'Dropped';
              const isConverted = s === 'Converted';
              return (
                <button key={s} onClick={() => handleStatusChange(s)} style={{
                  padding: '7px 16px', borderRadius: 999, fontWeight: 600, fontSize: 13,
                  border: isActive ? 'none' : '1.5px solid #e5e7eb',
                  background: isActive ? (isDropped ? '#ef4444' : isConverted ? '#10b981' : '#4f46e5') : '#fff',
                  color: isActive ? '#fff' : '#6b7280',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lead-detail">
          {/* Left: lead info + notes */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 16 }}>LEAD INFORMATION</div>

              {editing ? (
                /* ── FULL EDIT FORM (all fields) ── */
                <div>
                  <div className="form-grid">
                    {/* Contact details */}
                    <div className="form-row">
                      <label>Full Name *</label>
                      <input
                        className={editErrors.name ? 'input-error' : ''}
                        value={editForm.name}
                        onChange={e => setF('name', e.target.value)}
                        placeholder="Full name"
                      />
                      {editErrors.name && <div className="field-error">⚠ {editErrors.name}</div>}
                    </div>
                    <div className="form-row">
                      <label>Phone *</label>
                      <input
                        className={editErrors.phone ? 'input-error' : ''}
                        value={editForm.phone}
                        onChange={e => setF('phone', e.target.value)}
                        placeholder="10-digit mobile"
                        maxLength={10}
                      />
                      {editErrors.phone && <div className="field-error">⚠ {editErrors.phone}</div>}
                    </div>
                    <div className="form-row" style={{ gridColumn: '1 / -1' }}>
                      <label>Email</label>
                      <input
                        type="email"
                        className={editErrors.email ? 'input-error' : ''}
                        value={editForm.email}
                        onChange={e => setF('email', e.target.value)}
                        placeholder="optional"
                      />
                      {editErrors.email && <div className="field-error">⚠ {editErrors.email}</div>}
                    </div>
                    {/* Pipeline fields */}
                    <div className="form-row">
                      <label>Status</label>
                      <select value={editForm.status} onChange={e => setF('status', e.target.value)}>
                        {meta.statuses.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-row">
                      <label>Lead Source</label>
                      <select value={editForm.source} onChange={e => setF('source', e.target.value)}>
                        {meta.sources.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-row">
                      <label>Counsellor</label>
                      <select value={editForm.counsellorId} onChange={e => setF('counsellorId', e.target.value)}>
                        <option value="">Unassigned</option>
                        {meta.counsellors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-row">
                      <label>Course Preference</label>
                      <select value={editForm.coursePreference} onChange={e => setF('coursePreference', e.target.value)}>
                        {meta.courses.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── READ-ONLY VIEW ── */
                <div className="lead-info-grid">
                  <div className="info-item">
                    <div className="info-label">Full Name</div>
                    <div className="info-value">{lead.name}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Phone</div>
                    <div className="info-value">{lead.phone}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Email</div>
                    <div className="info-value">{lead.email || '—'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Lead Source</div>
                    <div className="info-value">{lead.source}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Course Preference</div>
                    <div className="info-value">{lead.coursePreference}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Assigned Counsellor</div>
                    <div className="info-value">{lead.counsellorName}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Created On</div>
                    <div className="info-value">{fmt(lead.createdAt)}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Last Follow-up</div>
                    <div className="info-value" style={{ color: lead.needsFollowUp ? '#dc2626' : 'inherit' }}>
                      {fmt(lead.lastFollowUp)}
                      {lead.daysSinceFollowUp !== null && ` (${lead.daysSinceFollowUp}d ago)`}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Lead Age</div>
                    <div className="info-value">
                      {lead.daysSinceCreated} day{lead.daysSinceCreated !== 1 ? 's' : ''}
                      {lead.isAged && <span className="badge badge-aged" style={{ marginLeft: 8 }}>Aged</span>}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Status</div>
                    <div className="info-value">
                      <span className={`badge badge-${lead.status.replace(/\s+/g, '-')}`}>{lead.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Follow-up notes */}
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 14 }}>
                FOLLOW-UP NOTES ({lead.notes.length})
              </div>
              {lead.notes.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <div className="empty-icon">📝</div>
                  <p>No notes yet. Add the first follow-up note below.</p>
                </div>
              ) : (
                <div className="notes-list">
                  {[...lead.notes].reverse().map(note => (
                    <div key={note.id} className="note-item">
                      <div className="note-text">{note.text}</div>
                      <div className="note-meta">By {note.by} • {fmt(note.createdAt)}</div>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleAddNote} style={{ marginTop: 14 }}>
                <div className="form-row" style={{ marginBottom: 10 }}>
                  <label>Add Follow-up Note</label>
                  <textarea rows={3} placeholder="What happened? What are the next steps?"
                    value={noteText} onChange={e => setNoteText(e.target.value)} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input placeholder="Your name (optional)" value={noteBy}
                    onChange={e => setNoteBy(e.target.value)} style={{ flex: 1 }} />
                  <button type="submit" className="btn-success" disabled={saving || !noteText.trim()}>
                    {saving ? 'Saving...' : 'Add Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: quick actions */}
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 14 }}>QUICK ACTIONS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn-success" style={{ width: '100%' }}
                  onClick={() => handleStatusChange('Converted')} disabled={lead.status === 'Converted'}>
                  ✅ Mark as Converted
                </button>
                <button className="btn-secondary" style={{ width: '100%' }}
                  onClick={() => handleStatusChange('Follow-up Scheduled')} disabled={lead.status === 'Follow-up Scheduled'}>
                  📅 Schedule Follow-up
                </button>
                <button className="btn-danger" style={{ width: '100%', marginTop: 8 }}
                  onClick={() => handleStatusChange('Dropped')} disabled={lead.status === 'Dropped'}>
                  ❌ Mark as Dropped
                </button>
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 14 }}>ACTIVITY SUMMARY</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Total interactions', `${lead.notes.length}`],
                  ['Days since created', `${lead.daysSinceCreated}d`],
                  ['Last contact', lead.daysSinceFollowUp !== null ? `${lead.daysSinceFollowUp}d ago` : 'Never'],
                  ['Source', lead.source],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: 13 }}>{label}</span>
                    <strong style={{ color: label === 'Last contact' && lead.needsFollowUp ? '#dc2626' : '#374151' }}>
                      {value}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

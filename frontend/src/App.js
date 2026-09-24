/**
 * App Shell — Sidebar, Routing, Global Topbar
 * @author Aakanksha Hedau
 */
import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';

// ── Page label map ────────────────────────────────────────────────────────────
const PAGE_LABELS = {
  dashboard: 'Dashboard',
  leads: 'All Leads',
  'lead-detail': 'Lead Detail',
};

// ── Shared global topbar ──────────────────────────────────────────────────────
export function GlobalTopbar({ page, actions }) {
  return (
    <div className="topbar">
      <div className="topbar-brand">
        <span className="topbar-brand-name">🎓 AdmissionCRM</span>
        <span className="topbar-divider">/</span>
        <span className="topbar-page-name">{PAGE_LABELS[page] || ''}</span>
      </div>
      {actions && <div className="topbar-actions">{actions}</div>}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, collapsed }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'leads', label: 'All Leads', icon: '👥' },
  ];
  return (
    <div className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">🎓</span>
        {!collapsed && <span className="sidebar-logo-text">AdmissionCRM</span>}
      </div>
      <nav>
        {links.map(l => (
          <a
            key={l.id}
            className={page === l.id ? 'active' : ''}
            onClick={() => setPage(l.id)}
            title={l.label}
          >
            <span className="sidebar-icon">{l.icon}</span>
            {!collapsed && <span className="sidebar-link-label">{l.label}</span>}
          </a>
        ))}
      </nav>
      {!collapsed && (
        <div className="sidebar-footer">
          Edumerge Solutions<br />Admission CRM v1.0
        </div>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]                 = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [collapsed, setCollapsed]       = useState(true);
  // Shared filter state — Dashboard can pre-set a status filter
  const [leadsFilter, setLeadsFilter]   = useState({ status: '', counsellorId: '', source: '', search: '' });
  const autoCloseRef = React.useRef(null);

  // Auto-close sidebar after 5 seconds
  React.useEffect(() => {
    if (!collapsed) {
      clearTimeout(autoCloseRef.current);
      autoCloseRef.current = setTimeout(() => setCollapsed(true), 5000);
    }
    return () => clearTimeout(autoCloseRef.current);
  }, [collapsed]);

  function goToLead(id)  { setSelectedLeadId(id); setPage('lead-detail'); }

  function goToLeads(filter) {
    setSelectedLeadId(null);
    // If a filter is passed (e.g. from funnel click), apply it
    if (filter) setLeadsFilter(f => ({ ...f, ...filter }));
    setPage('leads');
  }

  return (
    <div className="page">
      {!collapsed && (
        <div className="sidebar-overlay" onClick={() => setCollapsed(true)} />
      )}
      <Sidebar
        page={page}
        setPage={p => { setPage(p); setSelectedLeadId(null); setCollapsed(true); }}
        collapsed={collapsed}
      />
      <div
        className="topbar-hamburger"
        onClick={() => setCollapsed(c => !c)}
        title="Toggle sidebar"
      >
        <span></span><span></span><span></span>
      </div>
      <div className="main">
        {page === 'dashboard' && (
          <Dashboard
            page={page}
            onViewLead={goToLead}
            onGoLeads={goToLeads}
          />
        )}
        {page === 'leads' && (
          <Leads
            page={page}
            onViewLead={goToLead}
            initialFilter={leadsFilter}
            onFilterUsed={() => setLeadsFilter({ status: '', counsellorId: '', source: '', search: '' })}
          />
        )}
        {page === 'lead-detail' && selectedLeadId && (
          <LeadDetail page={page} id={selectedLeadId} onBack={goToLeads} />
        )}
      </div>
    </div>
  );
}

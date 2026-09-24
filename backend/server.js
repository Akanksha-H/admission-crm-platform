/**
 * Admission Lead CRM — Backend API
 * @author Aakanksha Hedau
 */
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// ─── In-memory data store ────────────────────────────────────────────────────

const counsellors = [
  { id: 'c1', name: 'Priya Sharma' },
  { id: 'c2', name: 'Rahul Mehta' },
  { id: 'c3', name: 'Anjali Singh' },
  { id: 'c4', name: 'Vikram Das' },
];

const courses = [
  'B.Tech Computer Science',
  'B.Tech Electronics',
  'MBA',
  'BBA',
  'B.Sc Data Science',
  'B.Com',
  'MCA',
];

const SOURCES = ['Website', 'Walk-in', 'Phone Call', 'WhatsApp', 'Education Fair', 'Campaign', 'Referral'];
const STATUSES = ['New', 'Contacted', 'Interested', 'Follow-up Scheduled', 'Converted', 'Dropped'];

// Seed data — 10 sample leads
let leads = [
  {
    id: uuidv4(),
    name: 'Arun Kumar',
    email: 'arun@example.com',
    phone: '9876543210',
    source: 'Website',
    coursePreference: 'B.Tech Computer Science',
    status: 'New',
    counsellorId: 'c1',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    lastFollowUp: null,
    notes: [],
  },
  {
    id: uuidv4(),
    name: 'Sneha Patel',
    email: 'sneha@example.com',
    phone: '9123456780',
    source: 'Walk-in',
    coursePreference: 'MBA',
    status: 'Contacted',
    counsellorId: 'c2',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastFollowUp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [
      { id: uuidv4(), text: 'Called and introduced the MBA program. She is interested but wants a brochure.', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), by: 'Rahul Mehta' }
    ],
  },
  {
    id: uuidv4(),
    name: 'Deepak Nair',
    email: 'deepak@example.com',
    phone: '9988776655',
    source: 'WhatsApp',
    coursePreference: 'B.Sc Data Science',
    status: 'Interested',
    counsellorId: 'c3',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    lastFollowUp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [
      { id: uuidv4(), text: 'Very interested. Asked about placements and fees.', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), by: 'Anjali Singh' }
    ],
  },
  {
    id: uuidv4(),
    name: 'Meera Joshi',
    email: 'meera@example.com',
    phone: '9001122334',
    source: 'Education Fair',
    coursePreference: 'BBA',
    status: 'Converted',
    counsellorId: 'c1',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    lastFollowUp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [
      { id: uuidv4(), text: 'Completed admission. Fee paid.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), by: 'Priya Sharma' }
    ],
  },
  {
    id: uuidv4(),
    name: 'Karan Verma',
    email: 'karan@example.com',
    phone: '9555444333',
    source: 'Campaign',
    coursePreference: 'MCA',
    status: 'Dropped',
    counsellorId: 'c4',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastFollowUp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [
      { id: uuidv4(), text: 'Not interested anymore. Joining a different institution.', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), by: 'Vikram Das' }
    ],
  },
  {
    id: uuidv4(),
    name: 'Ritika Sen',
    email: 'ritika@example.com',
    phone: '9345678901',
    source: 'Referral',
    coursePreference: 'B.Tech Electronics',
    status: 'Follow-up Scheduled',
    counsellorId: 'c2',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastFollowUp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [
      { id: uuidv4(), text: 'Scheduled call for Friday 10 AM to discuss scholarship options.', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), by: 'Rahul Mehta' }
    ],
  },
  {
    id: uuidv4(),
    name: 'Amit Gupta',
    email: 'amit@example.com',
    phone: '9812345670',
    source: 'Phone Call',
    coursePreference: 'B.Com',
    status: 'New',
    counsellorId: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastFollowUp: null,
    notes: [],
  },
  {
    id: uuidv4(),
    name: 'Pooja Reddy',
    email: 'pooja@example.com',
    phone: '9700011223',
    source: 'Website',
    coursePreference: 'MBA',
    status: 'Contacted',
    counsellorId: 'c3',
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    lastFollowUp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [
      { id: uuidv4(), text: 'Sent brochure via email. No response yet.', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), by: 'Anjali Singh' }
    ],
  },
  {
    id: uuidv4(),
    name: 'Suresh Yadav',
    email: 'suresh@example.com',
    phone: '9600099887',
    source: 'Walk-in',
    coursePreference: 'B.Tech Computer Science',
    status: 'Interested',
    counsellorId: 'c1',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    lastFollowUp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [
      { id: uuidv4(), text: 'Visited campus. Very impressed. Needs to discuss with parents.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), by: 'Priya Sharma' }
    ],
  },
  {
    id: uuidv4(),
    name: 'Nisha Pillai',
    email: 'nisha@example.com',
    phone: '9400055667',
    source: 'Education Fair',
    coursePreference: 'B.Sc Data Science',
    status: 'New',
    counsellorId: 'c4',
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    lastFollowUp: null,
    notes: [],
  },
];

// ─── Helper ──────────────────────────────────────────────────────────────────

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function enrichLead(lead) {
  const counsellor = counsellors.find(c => c.id === lead.counsellorId) || null;
  const daysSinceCreated = daysSince(lead.createdAt);
  const daysSinceFollowUp = lead.lastFollowUp ? daysSince(lead.lastFollowUp) : null;
  const isAged = daysSinceCreated >= 7 && !['Converted', 'Dropped'].includes(lead.status);
  const needsFollowUp = (!lead.lastFollowUp && daysSinceCreated > 2) ||
    (lead.lastFollowUp && daysSinceFollowUp > 3 && !['Converted', 'Dropped'].includes(lead.status));
  return {
    ...lead,
    counsellorName: counsellor ? counsellor.name : 'Unassigned',
    daysSinceCreated,
    daysSinceFollowUp,
    isAged,
    needsFollowUp,
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Meta
app.get('/api/meta', (req, res) => {
  res.json({ counsellors, courses, sources: SOURCES, statuses: STATUSES });
});

// GET all leads (with optional filters)
app.get('/api/leads', (req, res) => {
  let result = leads.map(enrichLead);
  const { status, counsellorId, source, search } = req.query;
  if (status) result = result.filter(l => l.status === status);
  if (counsellorId) result = result.filter(l => l.counsellorId === counsellorId);
  if (source) result = result.filter(l => l.source === source);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.includes(q)
    );
  }
  // Sort: newest first
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(result);
});

// GET single lead
app.get('/api/leads/:id', (req, res) => {
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(enrichLead(lead));
});

// POST create lead
app.post('/api/leads', (req, res) => {
  const { name, email, phone, source, coursePreference, counsellorId } = req.body;
  if (!name || !phone || !source || !coursePreference) {
    return res.status(400).json({ error: 'name, phone, source, and coursePreference are required' });
  }
  // Duplicate check: same phone number
  const duplicate = leads.find(l => l.phone === phone);
  if (duplicate) {
    return res.status(409).json({
      error: 'A lead with this phone number already exists',
      existingLeadId: duplicate.id
    });
  }
  const lead = {
    id: uuidv4(),
    name,
    email: email || '',
    phone,
    source,
    coursePreference,
    status: 'New',
    counsellorId: counsellorId || null,
    createdAt: new Date().toISOString(),
    lastFollowUp: null,
    notes: [],
  };
  leads.push(lead);
  res.status(201).json(enrichLead(lead));
});

// PATCH update lead (status, counsellor, course)
app.patch('/api/leads/:id', (req, res) => {
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  const allowed = ['status', 'counsellorId', 'coursePreference', 'name', 'email', 'phone', 'source'];
  allowed.forEach(field => {
    if (req.body[field] !== undefined) lead[field] = req.body[field];
  });
  res.json(enrichLead(lead));
});

// POST add follow-up note
app.post('/api/leads/:id/notes', (req, res) => {
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  const { text, by, scheduledDate } = req.body;
  if (!text) return res.status(400).json({ error: 'Note text is required' });
  const note = {
    id: uuidv4(),
    text,
    by: by || 'Staff',
    scheduledDate: scheduledDate || null,
    createdAt: new Date().toISOString(),
  };
  lead.notes.push(note);
  lead.lastFollowUp = note.createdAt;
  res.status(201).json(enrichLead(lead));
});

// DELETE lead
app.delete('/api/leads/:id', (req, res) => {
  const idx = leads.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Lead not found' });
  leads.splice(idx, 1);
  res.json({ success: true });
});

// GET dashboard stats
app.get('/api/dashboard', (req, res) => {
  const enriched = leads.map(enrichLead);
  const pipeline = {};
  STATUSES.forEach(s => { pipeline[s] = enriched.filter(l => l.status === s).length; });
  const bySource = {};
  SOURCES.forEach(s => { bySource[s] = enriched.filter(l => l.source === s).length; });
  const byCounsellor = counsellors.map(c => ({
    ...c,
    total: enriched.filter(l => l.counsellorId === c.id).length,
    converted: enriched.filter(l => l.counsellorId === c.id && l.status === 'Converted').length,
    active: enriched.filter(l => l.counsellorId === c.id && !['Converted', 'Dropped'].includes(l.status)).length,
  }));
  const aged = enriched.filter(l => l.isAged).length;
  const needsFollowUp = enriched.filter(l => l.needsFollowUp).length;
  const conversionRate = leads.length > 0
    ? ((pipeline['Converted'] / leads.length) * 100).toFixed(1)
    : 0;
  res.json({
    total: leads.length,
    pipeline,
    bySource,
    byCounsellor,
    aged,
    needsFollowUp,
    conversionRate,
    recentLeads: enriched.slice(0, 5),
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = 4000;
app.listen(PORT, () => console.log(`Admission CRM backend running on http://localhost:${PORT}`));

# Admission Lead CRM — Approach Note

## Assignment Chosen
Assignment 5 — Admission Lead Management

---

## Problem Understanding

An educational institution collects admission enquiries from multiple channels (website, walk-ins, phone calls, WhatsApp, education fairs, campaigns, referrals). Without a structured system, leads fall through the cracks — counsellors forget to follow up, managers have no visibility, and there is no way to know which source drives the best conversions.

The core problem is **lead lifecycle management**: capturing a lead, assigning it, following it through to conversion or drop, and giving management real-time visibility throughout.

---

## Key Assumptions

1. The system is used by three types of users: **Counsellors** (manage and follow up on assigned leads), **Managers** (view dashboard, monitor performance), and **Admins** (add leads, assign counsellors). For this prototype, roles are not enforced by login — the focus is on the data model and workflows.
2. A lead is uniquely identified by **phone number**. Duplicate phone numbers are rejected with an error and a link to the existing record.
3. Lead **ageing threshold** is set at 7 days — any active (non-converted, non-dropped) lead older than 7 days is flagged as aged.
4. **Follow-up urgency** is triggered when: (a) a lead has never been contacted and is older than 2 days, or (b) the last follow-up was more than 3 days ago.
5. Data is stored in-memory for this prototype. In production, this would be replaced with a PostgreSQL or MongoDB database.
6. No authentication is implemented in this prototype — production would add JWT-based role authentication.

---

## Architecture

```
Frontend (React)          Backend (Node + Express)
─────────────────         ────────────────────────
Dashboard.js       ←───→  GET /api/dashboard
Leads.js           ←───→  GET /api/leads (with filters)
                          POST /api/leads
                          DELETE /api/leads/:id
LeadDetail.js      ←───→  GET /api/leads/:id
                          PATCH /api/leads/:id
                          POST /api/leads/:id/notes
                          GET /api/meta
```

**Frontend:** React (CRA), no external UI libraries — custom CSS for full control over design. State managed with useState/useEffect hooks.

**Backend:** Node.js + Express, in-memory data store (array), UUID for IDs.

---

## Core Features Built

### Lead Management
- Add new leads with name, phone, email, source, course preference, counsellor assignment
- Duplicate detection by phone number on creation
- Filter leads by status, source, counsellor, or free-text search
- Delete leads

### Lead Lifecycle
- Status pipeline: New → Contacted → Interested → Follow-up Scheduled → Converted / Dropped
- One-click status updates from the detail page and quick action buttons
- Status stepper showing the full pipeline visually

### Follow-up Tracking
- Add timestamped follow-up notes with author name on each lead
- Last follow-up date tracked and displayed
- Leads with no contact in 3+ days flagged with "Needs Follow-up" badge

### Lead Ageing
- Leads active for 7+ days without conversion are flagged as "Aged"
- Aged leads highlighted in the table and on detail page

### Manager Dashboard
- Pipeline counts across all statuses
- Conversion rate (%)
- Leads by source with visual bar chart
- Counsellor performance table (total, active, converted)
- Aged lead count and needs-follow-up count with alert banners
- Recent leads table

---

## Edge Cases Handled

| Edge Case | How Handled |
|-----------|------------|
| Duplicate lead (same phone) | 409 response with existing lead ID |
| Lead with no counsellor | Shown as "Unassigned" badge |
| Lead never contacted | Flagged as "Needs Follow-up" after 2 days |
| Stale follow-up (3+ days) | Red highlight on last follow-up date |
| Aged lead (7+ days, not closed) | Orange "Aged" badge in table and detail |
| Empty notes list | Empty state with message |
| No leads matching filter | Empty state with guidance |

---

## Trade-offs

- **In-memory store vs Database:** Chosen for speed of prototyping. Data resets on server restart. Production would use a persistent DB with proper indexing on status, counsellorId, and createdAt.
- **No authentication:** Skipped to focus on core CRM logic. Production would add login, role-based access, and per-counsellor data scoping.
- **No real-time updates:** Page refresh required to see changes made by other users. Production would add WebSocket or polling.

---

## How to Run

```bash
# Terminal 1 — Backend
cd backend
npm install
node server.js

# Terminal 2 — Frontend
cd frontend
npm install
npm start
```

Open http://localhost:3000

# Admission Lead CRM

**Edumerge Solutions — Pre-Drive Product Engineering Assignment**
**Assignment 5: Admission Lead Management**
**Author: Aakanksha Hedau**

> A full-stack CRM prototype for managing college admission leads — built with React + Node.js/Express.

---

## Features

### Lead Management
- Add leads with name, phone, email, source, course preference, counsellor assignment
- Duplicate phone number detection — prevents the same lead being added twice
- Delete leads with confirmation dialog
- Filter leads by status, source, counsellor, or free-text search (name/email/phone)
- **Export filtered leads to CSV** with one click

### Lead Lifecycle Pipeline
- Status flow: `New → Contacted → Interested → Follow-up Scheduled → Converted / Dropped`
- One-click status updates from both the list view and the detail page
- Visual status stepper on the lead detail page
- Quick action buttons: Mark Converted, Schedule Follow-up, Mark Dropped

### Follow-up Tracking
- Log timestamped follow-up notes with author name on each lead
- Leads with no contact in **3+ days** are automatically flagged "Needs Follow-up"
- Last follow-up date shown in red when overdue

### Lead Ageing
- Leads active for **7+ days** without conversion are flagged as "Aged"
- Aged leads highlighted in the table and on the detail page

### Manager Dashboard
- Pipeline status counts across all 6 stages
- **Conversion Funnel with drop-off %** — shows where leads are being lost between stages
- Leads by source with color-coded badges and progress bars
- Counsellor performance table with conversion rate per counsellor
- Alert banners for aged leads and leads needing follow-up
- Empty state when no leads exist

### UX Polish
- **Toast notifications** for all actions (add lead, update status, add note, delete, export)
- **Inline form validation** with real-time field-level error messages
- **Color-coded source badges** (Website, Walk-in, WhatsApp, Campaign, etc.)
- Responsive sidebar layout

---

## How to Run

### Option 1 — Local (Recommended for development)

**Terminal 1 — Backend:**
```bash
cd backend
npm install
node server.js
# Running on http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

### Option 2 — Docker (One command)

```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
```

---

## Project Structure

```
admission-crm/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js              ← Express REST API (all routes + business logic)
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── public/index.html
│   └── src/
│       ├── api.js             ← API client (all fetch calls)
│       ├── App.js             ← App shell + sidebar + routing
│       ├── index.css          ← Full custom CSS design system
│       ├── index.js
│       ├── components/
│       │   └── Toast.js       ← Toast notification component + useToast hook
│       └── pages/
│           ├── Dashboard.js   ← Stats, pipeline, funnel, source chart, counsellor table
│           ├── Leads.js       ← Lead list, filters, add modal, CSV export
│           └── LeadDetail.js  ← Lead detail, status stepper, notes, quick actions
├── docker-compose.yml
├── APPROACH_NOTE.md
├── AI_USAGE_REPORT.md
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meta` | Counsellors, courses, sources, statuses |
| GET | `/api/leads` | All leads (filterable: status, source, counsellorId, search) |
| GET | `/api/leads/:id` | Single lead with enriched data |
| POST | `/api/leads` | Create lead (validates required fields, checks duplicate phone) |
| PATCH | `/api/leads/:id` | Update lead (status, counsellor, course, etc.) |
| POST | `/api/leads/:id/notes` | Add follow-up note |
| DELETE | `/api/leads/:id` | Delete lead |
| GET | `/api/dashboard` | Dashboard stats (pipeline, sources, counsellors, aged, funnel) |

---

## Edge Cases Handled

| Edge Case | Handling |
|-----------|----------|
| Duplicate lead (same phone) | 409 response with existing lead ID |
| Lead with no counsellor | "Unassigned" badge displayed |
| Lead never contacted | "Needs Follow-up" flag after 2 days |
| Stale follow-up (3+ days) | Red highlight on last follow-up date |
| Aged lead (7+ days, not closed) | Orange "Aged" badge |
| Empty leads list | Friendly empty state with CTA |
| Empty dashboard | Dedicated empty state with "Add First Lead" |
| Invalid phone number | Inline validation (must be valid Indian mobile) |
| Invalid email | Inline validation on blur |
| Export with no results | Toast notification instead of empty CSV |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Custom CSS |
| Backend | Node.js, Express 4 |
| Data store | In-memory (array) — replace with PostgreSQL/MongoDB for production |
| Containerisation | Docker, Docker Compose, Nginx |

---

*Built for Edumerge Solutions Pre-Drive Product Engineering Assignment — Assignment 5: Admission Lead Management*

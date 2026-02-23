# HireMate Frontend — Pages Overview

High-level summary of each page, what users see, how data is stored in the backend, and what user actions trigger.

---

## Auth Pages

### Login (`/login`)
| | |
|---|---|
| **Shows** | Email, password fields; "Sign in" button; link to Register |
| **Backend** | `POST /api/.../auth/login` — stores JWT in `localStorage` |
| **User actions** | Submit → login API → redirect to Dashboard (`/`) |

### Register (`/register`)
| | |
|---|---|
| **Shows** | First name, last name, email, password; "Register" button; link to Login |
| **Backend** | `POST /api/.../auth/register` — stores JWT in `localStorage` |
| **User actions** | Submit → register API → redirect to Profile (`/profile`) for onboarding |

---

## Start Page (`/start`)
| | |
|---|---|
| **Shows** | Two cards: "Get Recommendations" (→ Job Search) and "Start Autofilling" (→ Profile) |
| **Backend** | None — static navigation |
| **User actions** | Click card → navigate to `/job-search` or `/profile` |

---

## Dashboard

### Home (`/`)
| | |
|---|---|
| **Shows** | Stats (jobs applied, saved, companies checked), Companies viewed list, Applications by day chart, Recent applications sidebar, Saved jobs sidebar |
| **Backend** | `GET /dashboard/stats`, `GET /dashboard/recent-applications`, `GET /dashboard/companies-viewed`, `GET /chrome-extension/jobs`, `GET /dashboard/applications-by-day` |
| **User actions** | Click company → open career page; Click job View/Apply → open job URL; "Go to Applications" → `/application-tracker` |

### Application Tracker (`/application-tracker`)
| | |
|---|---|
| **Shows** | Kanban: Saved, Applied, Interview, Closed. Search bar. Job cards with drag & drop |
| **Backend** | `GET /chrome-extension/jobs` (list), `PATCH /chrome-extension/jobs/:id` (update status) |
| **User actions** | Search (client filter); Drag job between columns → PATCH job status; Click "View job" → open URL; Refresh → refetch |

### Job Search (`/job-search`)
| | |
|---|---|
| **Shows** | Placeholder — "content coming soon" |
| **Backend** | None yet |
| **User actions** | — |

### Job Recommendations (`/job-recommendations`)
| | |
|---|---|
| **Shows** | Placeholder — "add your content here" |
| **Backend** | None yet |
| **User actions** | — |

### Activity (`/activity`)
| | |
|---|---|
| **Shows** | Placeholder — "content coming soon" |
| **Backend** | None yet |
| **User actions** | — |

---

## Profile (`/profile`)
| | |
|---|---|
| **Shows** | 8 tabs: Profile, Experience, Education, Skills, Projects, Preferences, Links, Review |
| **Backend** | `GET /profile` (load), `PATCH /profile` (save). Profile data stored in Redux (profileSlice). Resume parse via `POST /resume/upload` |
| **User actions** | Edit fields → local state; Save → PATCH profile; Upload resume → parse → `mergeFromResume` into form |

**Tabs store:**
- **Profile** — name, email, phone, city, country, headline, summary, resume upload
- **Experience** — job title, company, dates, location, description
- **Education** — degree, institution, dates, grade
- **Skills** — tech skills, soft skills
- **Projects** — name, description, tech stack, links
- **Preferences** — roles, employment type, remote, locations, salary
- **Links** — LinkedIn, GitHub, portfolio, other
- **Review** — summary review before submit

---

## Resume Generator (`/resume-generator`)
| | |
|---|---|
| **Shows** | Job role + job description input; Generate button; Recent resumes list; PDF preview; Upload |
| **Backend** | `GET /resume`, `POST /resume/generate`, `PATCH /resume/:id`, `DELETE /resume/:id`, `POST /resume/upload`, `GET /resume/tailor-context` |
| **User actions** | Paste JD → Generate → create tailored resume; Upload PDF/DOC → store; Edit → PATCH; Delete → DELETE; Download → fetch PDF file |

---

## Pricing (`/pricing`)
| | |
|---|---|
| **Shows** | Plans (Daily, Weekly, Monthly) with prices; Subscribe button; Razorpay modal |
| **Backend** | `POST /payment/create-order`, `POST /payment/verify` |
| **User actions** | Subscribe → create Razorpay order → pay → verify → show success |

---

## Settings (`/settings`)
| | |
|---|---|
| **Shows** | Subscription & Billing (credits), "View Plans" button; Danger Zone with "Delete Account" |
| **Backend** | None directly — View Plans → `/pricing`. Delete account not implemented |
| **User actions** | View Plans → navigate to Pricing; Delete Account → TODO |

---

## Data Flow Summary

| Source | Data | Stored where |
|--------|------|--------------|
| Chrome extension | Jobs saved, applications, companies viewed | Backend (`/chrome-extension/jobs`, `/dashboard/*`) |
| User profile | Name, experience, education, skills, etc. | Backend (`/profile`) |
| Resume generator | Resumes, PDFs | Backend (`/resume`) |
| Auth | JWT, user | `localStorage` |

---

## Routes (Protected)

| Path | Page |
|------|------|
| `/` | Home (Dashboard) |
| `/login` | Login |
| `/register` | Register |
| `/start` | Start (onboarding choice) |
| `/profile` | Profile Builder |
| `/application-tracker` | Application Tracker |
| `/resume-generator` | Resume Generator |
| `/job-recommendations` | Job Recommendations (placeholder) |
| `/settings` | Settings |
| `/pricing` | Pricing |

---

## Chrome Extension

**Purpose:** Auto-fill job application forms on career/job sites using the user's profile and resume. Saves jobs, tracks applications, and syncs data with the backend when the user is logged in.

**Location:** `hiremate-backend/chrome-extension/`

| What it does | How |
|--------------|-----|
| **Login / Signup** | Popup has login & register; stores JWT in `chrome.storage.local`; syncs with HireMate tab if open |
| **Scan & Auto-Fill** | Scrapes form fields from page → calls `POST /chrome-extension/form-fields/map` (LLM maps fields to profile) → fills fields with 300–800ms delay (human-like) |
| **Autofill data** | Fetches profile + resume from `GET /chrome-extension/autofill/data` |
| **Resume file** | Fetches PDF from `GET /chrome-extension/autofill/resume` or `.../resume/{filename}` (proxy for S3/local) |
| **Save job** | `POST /chrome-extension/jobs` — saves job to tracker; extracts company from URL (Greenhouse, Lever, Workday, etc.) |
| **Track career page view** | `POST /chrome-extension/career-page/view` — records visited career pages for "Companies viewed" on dashboard |
| **Track autofill used** | `POST /chrome-extension/autofill/track` — records when user used autofill on a page |
| **Keyword analysis** | `POST /chrome-extension/keywords/analyze` — extracts JD keywords, matches against resume; returns match % and prefill JD for forms |
| **Tailor Resume** | `POST /chrome-extension/tailor-context` — stores JD + title before opening resume-generator; frontend fetches via `GET /resume/tailor-context` |
| **Cover letter** | `GET /chrome-extension/cover-letter`, `POST /chrome-extension/cover-letter/generate` — generate & store cover letter for current job |
| **Resume upload** | Saves PDF to IndexedDB in background script; used for file input mapping during fill |

**Supported sites:** Career pages (Greenhouse, Lever, Workday, Ashby, BambooHR, iCIMS, SmartRecruiters, etc.). Detects job listings vs application forms.

**Storage (when not logged in):** Profile, custom answers in `chrome.storage.local`; resume PDF in IndexedDB.

---

## Backend APIs

**Base URL:** `http://127.0.0.1:8000/api` (or configured `BASE_URL`)

**Purpose:** FastAPI backend for auth, profile, resumes, jobs, dashboard stats, payments, and Chrome extension integration.

### Auth (`/api/auth`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/register` | Register user (first_name, last_name, email, password). Returns JWT. |
| POST | `/auth/login` | Login (email, password). Returns JWT. |
| GET | `/auth/profile` | Get current user (id, name, email). Used to refresh auth state. |
| POST | `/auth/refresh` | Refresh access token. Accepts expired token, returns new one. |

### Profile (`/api/profile`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/profile` | Get full profile (experiences, education, skills, projects, preferences, links). |
| PATCH | `/profile` | Update profile with full schema. |

### Resume (`/api/resume`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | *(base)* | List user's resumes (id, resume_name, resume_url, is_default, resume_text). |
| POST | `/upload` | Upload PDF/DOC/DOCX. Extracts data via LLM, updates profile, stores in S3/local. |
| POST | `/generate` | Generate JD-optimized resume from profile (Jinja2 + WeasyPrint). Returns resume_id, URL. |
| GET | `/{id}/file` | Proxy resume PDF (S3 or local) to avoid CORS. |
| GET | `/tailor-context` | Fetch & clear JD + title stored by extension ("Tailor Resume" flow). |
| PATCH | `/{id}` | Update resume name and/or text. Regenerates PDF when content changes. |
| DELETE | `/{id}` | Delete resume and file from storage. |

### Dashboard (`/api/dashboard`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/stats` | Dashboard stats: jobs_applied, jobs_saved, companies_checked. |
| GET | `/recent-applications` | Recent applied jobs (limit param). |
| GET | `/companies-viewed` | Companies from career page visits (limit param). |
| GET | `/applications-by-day` | Daily count of applications for chart (days param). |

### Chrome Extension (`/api/chrome-extension`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/autofill/data` | Profile + resume text + resume URL for autofill. |
| GET | `/autofill/resume` | Serve resume PDF (proxy S3/local for CORS). |
| GET | `/autofill/resume/{file_name}` | Serve resume by filename. |
| POST | `/autofill/track` | Track autofill usage on a page. |
| POST | `/career-page/view` | Track career page view. |
| POST | `/form-fields/map` | LLM maps form fields to profile values; returns mappings for fill. |
| GET | `/resumes` | List resumes (alias for resume service). |
| POST | `/jobs` | Save job (company, title, location, JD, URL, status). |
| GET | `/jobs` | List saved jobs. Optional ?status=applied. |
| PATCH | `/jobs/{id}` | Update job status (saved, applied, interview, closed). |
| POST | `/keywords/analyze` | Extract JD keywords, match vs resume; return match %, high/low priority keywords, JD for prefill. |
| POST | `/tailor-context` | Store JD + title for resume-generator "Tailor" flow. |
| GET | `/cover-letter` | Get stored cover letter from profile. |
| POST | `/cover-letter/generate` | Generate cover letter from profile + JD, store in preferences. |

### Payment (`/api/payment`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/create-order` | Create Razorpay order (plan_id: daily/weekly/monthly). Returns order_id, amount, key_id. |
| POST | `/verify` | Verify Razorpay payment signature after checkout. TODO: store subscription in DB. |

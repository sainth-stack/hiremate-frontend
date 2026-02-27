# HireMate — Pages, APIs & End-to-End Flows

Overview of pages, backend APIs (what they do internally), and the Chrome extension (what happens, when it calls, how it scrapes, end to end).

---

## 1. Pages & APIs Used

| Page | Route | APIs Called | Purpose |
|------|-------|-------------|---------|
| **Login** | `/login` | `POST /api/auth/login` | Email + password → JWT in localStorage |
| **Register** | `/register` | `POST /api/auth/register` | Creates user → JWT → redirect to Profile |
| **Start** | `/start` | None | Two cards: Recommendations (→ `/job-search`), Autofill (→ `/profile`) |
| **Home (Dashboard)** | `/` | `GET /api/dashboard/summary`, `GET /api/chrome-extension/jobs` | Stats, recent apps, companies viewed, chart, saved jobs sidebar |
| **Application Tracker** | `/application-tracker` | `GET /api/chrome-extension/jobs`, `PATCH /api/chrome-extension/jobs/:id` | Kanban; list jobs, update status |
| **Profile** | `/profile` | `GET /api/profile`, `PATCH /api/profile`, `POST /api/resume/upload` | Load/save profile; upload resume → parse → merge |
| **Resume Generator** | `/resume-generator` | `GET /api/resume/workspace`, `POST /api/resume/generate`, `GET /api/resume/:id/file`, `PATCH`, `DELETE` | List resumes + tailor context; generate; download PDF |
| **Job Recommendations** | `/job-recommendations` | None | Placeholder |
| **Pricing** | `/pricing` | `POST /api/payment/create-order`, `POST /api/payment/verify` | Razorpay checkout |
| **Settings** | `/settings` | None (View Plans → `/pricing`) | Subscription, Delete Account TODO |

**Note:** Start page "Get Recommendations" links to `/job-search`; no such route exists, so it redirects to `/`. The actual page is `/job-recommendations`.

---

## 2. Backend APIs — Internal Behavior (End to End)

**Base URL:** `http://127.0.0.1:8000/api` (or `BASE_URL`)

### Auth (`/api/auth`)
| Endpoint | Internal flow |
|----------|----------------|
| `POST /auth/register` | Validate input → create User in DB → hash password → return JWT |
| `POST /auth/login` | Find user by email → verify password → return JWT |
| `GET /auth/profile` | Decode JWT → load User → return id, name, email |
| `POST /auth/refresh` | Accept expired token → verify signature → issue new JWT |

### Profile (`/api/profile`)
| Endpoint | Internal flow |
|----------|----------------|
| `GET /profile` | Load Profile + related models (experiences, education, skills, projects, preferences, links) → serialize to `ProfilePayload` |
| `PATCH /profile` | Validate payload → upsert Profile and relations → clear `dashboard_summary:{user_id}` + `autofill_ctx:{user_id}` cache → return payload |

### Resume (`/api/resume`)
| Endpoint | Internal flow |
|----------|----------------|
| `GET /workspace` | `list_resumes()` (UserResume + profile fallback) + `get_and_clear_tailor_context()` → return `{ resumes, tailor_context }` |
| `POST /upload` | Save file to S3/local → LLM extract profile → update Profile → add UserResume → clear `autofill_ctx` → return profile |
| `POST /generate` | Build HTML from template + profile + JD keywords → WeasyPrint PDF → upload to S3/local → create UserResume → return `{ resume_id, resume_url, ... }` |
| `GET /{id}/file` | Lookup resume (profile id=0 or UserResume) → proxy S3 or serve local file |
| `PATCH /{id}` | Update name/text → if text changed, regenerate PDF and replace file |
| `DELETE /{id}` | Delete from storage, remove UserResume record |

### Dashboard (`/api/dashboard`)
| Endpoint | Internal flow |
|----------|----------------|
| `GET /summary` | Check Redis `dashboard_summary:{user_id}` → if miss: query UserJob (stats, recent, by day) + CareerPageVisit (companies viewed) → merge → cache 120s → return |

### Activity (`/api/activity`)
| Endpoint | Internal flow |
|----------|----------------|
| `POST /track` | Body: `{ event_type: "career_page_view" | "autofill_used", page_url, metadata }` → insert into `CareerPageVisit` |

### Chrome Extension (`/api/chrome-extension`)
| Endpoint | Internal flow |
|----------|----------------|
| `GET /autofill/context` | Check Redis `autofill_ctx:{user_id}` → if miss: load Profile + list_resumes → flatten profile for form fields + resume_text + resume_url (points to `/autofill/resume/{filename}`) → cache 300s → return |
| `GET /autofill/resume/{file_name}` | Load profile → match filename → proxy S3 or serve local PDF |
| `POST /form-fields/map` | Receive scraped fields + profile + resume_text → LLM maps each field to profile value or generated answer → return `{ mappings }` |
| `POST /jobs` | Derive company from URL → insert UserJob + CareerPageVisit (save_job) → clear `dashboard_summary:{user_id}` → return job id |
| `GET /jobs` | Query UserJob by user_id, optional `?status=applied` filter → return list |
| `PATCH /jobs/{id}` | Update `application_status` |
| `POST /keywords/analyze` | Parse JD from page_html or job_description → extract keywords (LLM, cached) → match vs resume text → return match %, high/low keywords |
| `POST /tailor-context` | Store `{ job_description, job_title, url }` in memory (TTL 300s) for resume-generator to consume |
| `POST /cover-letter/upsert` | If job_url exists → return stored; else generate from profile + JD via LLM → store → return |

### Payment (`/api/payment`)
| Endpoint | Internal flow |
|----------|----------------|
| `POST /create-order` | Create Razorpay order → return order_id, amount, key_id |
| `POST /verify` | Verify signature → TODO: persist subscription |

---

## 3. Chrome Extension — What Happens, When It Calls, How It Scrapes

**Location:** `hiremate-backend/chrome-extension/`

### Architecture
- **Popup** — UI; triggers autofill, loads context, syncs token
- **Content script** — Injected on career pages; scrapes DOM, fills forms, mounts in-page widget
- **Background** — Service worker; IndexedDB (resume), message routing, token sync

### Scraping (How It Works)

**1. Form field scraping**
- Content script listens for `SCRAPE_FIELDS`
- `getFillableFields()` walks DOM + shadow DOM, collects:
  - `input`, `textarea`, `select`, `[contenteditable]`, `[role="textbox"]`, `.ql-editor`, etc.
- For each element: label, name, id, placeholder, type, tag, required, options
- Background sends `SCRAPE_FIELDS` to every frame → merges results with `frameId`, `index`

**2. Page HTML for JD**
- `GET_ALL_FRAMES_HTML` → `chrome.scripting.executeScript` with `allFrames: true`
- Each frame returns `document.documentElement.outerHTML` (max ~1.5MB)
- Frames concatenated with `<!--FRAME_SEP-->` → sent to backend for JD extraction

### Autofill Flow (End to End)

```
User on application form → Clicks "Process and Fill" (popup or in-page widget)
       │
       ├─► 1. SCRAPE_ALL_FRAMES (background → content in each frame)
       │   • Background: chrome.webNavigation.getAllFrames → for each frameId, send SCRAPE_FIELDS
       │   • Content: scrapeFields() → getFillableFields() → return { fields }
       │   • Merge: fields get index, frameId, frameLocalIndex
       │
       ├─► 2. Load context (popup or content)
       │   • Check chrome.storage.local (hm_autofill_ctx, 10min TTL)
       │   • If miss: GET /chrome-extension/autofill/context
       │   • Response: profile, resume_text, resume_url (→ /autofill/resume/{filename})
       │
       ├─► 3. Load resume PDF
       │   • getResumeFromBackground() — IndexedDB
       │   • If empty: fetchResumeFromContext(context)
       │     - Extract filename from resume_url: resume_url.split('/').pop()
       │     - GET /chrome-extension/autofill/resume/{filename}
       │     - Save to IndexedDB via SAVE_RESUME
       │
       ├─► 4. Map fields
       │   • POST /chrome-extension/form-fields/map
       │   • Body: fields, profile, resume_text
       │   • Response: mappings per field index
       │
       ├─► 5. Fill (background → content per frame)
       │   • FILL_ALL_FRAMES → FILL_WITH_VALUES per frame
       │   • Content: fillWithValues() — set value, 300–800ms delay, file inputs get resume from IndexedDB
       │   • dispatchFrameworkEvents() for React/Vue/Angular
       │
       └─► 6. Track
           • POST /activity/track { event_type: "autofill_used", page_url, metadata }
```

### Keyword Analysis Flow

```
User opens Keywords tab (in-page widget)
       │
       ├─► fetchResumesFromApi()
       │   • GET /api/resume/workspace → response.resumes
       │   • Populate resume dropdown (id, resume_name, is_default)
       │
       ├─► getPageHtmlForKeywordsApi()
       │   • Send GET_ALL_FRAMES_HTML to background
       │   • Background: executeScript allFrames → outerHTML per frame
       │   • Return combined HTML
       │
       └─► POST /chrome-extension/keywords/analyze
           • Body: url, page_html, resume_id (optional)
           • Backend: parse JD from HTML → extract keywords → match vs resume
           • Display: match %, high/low priority keywords
```

### Tailor Resume Flow

```
User on job page → Clicks "Tailor Resume"
       │
       ├─► getPageHtmlForKeywordsApi() (same as above)
       │
       ├─► POST /chrome-extension/tailor-context
       │   • Body: page_html, url, job_title
       │   • Backend stores in memory (TTL 300s)
       │
       └─► Open /resume-generator?tailor=1 (new tab)
           • Frontend: GET /resume/workspace → tailor_context returned and cleared
           • Prefills JD from tailor_context
```

### Save Job Flow

```
User on job page → Clicks "Save job"
       │
       └─► POST /chrome-extension/jobs
           • Body: job_posting_url, position_title, company, location, job_description, ...
           • Backend: derive company from URL (Greenhouse, Lever, Workday, etc.)
           • Insert UserJob + CareerPageVisit (action_type: save_job)
           • Clear dashboard_summary cache
```

### Page Load / Career Page View

```
Content script injected on career/job URL
       │
       ├─► trackCareerPageView()
       │   • POST /activity/track { event_type: "career_page_view", page_url, metadata }
       │   • Deduped by URL (visitedUrls set)
       │
       ├─► tryAutoOpenPopup() (if form detected)
       │   • looksLikeJobApplicationForm() — fillable fields + job keywords
       │   • Mount in-page widget, optionally run keyword analysis
       │
       └─► runKeywordAnalysisAndMaybeShowWidget()
           • Optional: keyword analysis for match %
```

### Cover Letter Flow

```
User opens Cover Letter accordion (in-page)
       │
       └─► POST /chrome-extension/cover-letter/upsert
           • Body: job_url, page_html, job_title
           • If stored for this job_url → return existing
           • Else: LLM generate from profile + JD → store → return
```

---

## 4. Cache Invalidation

| Trigger | Clears |
|---------|--------|
| `PATCH /profile` | `dashboard_summary:{user_id}`, `autofill_ctx:{user_id}` |
| `POST /resume/upload` | `autofill_ctx:{user_id}` |
| `POST /chrome-extension/jobs` | `dashboard_summary:{user_id}` |

---

## 5. Data Storage Summary

| Source | Data | Stored |
|--------|------|--------|
| Chrome extension | Jobs, applications, career page visits | Backend (user_jobs, career_page_visits) |
| User profile | Name, experience, education, skills, etc. | Backend (profile, related tables) |
| Resumes | PDFs, resume list | Backend (user_resumes, S3/local) |
| Auth | JWT | localStorage (web), chrome.storage.local (extension) |
| Extension resume PDF | For file inputs | IndexedDB (background) |
| Autofill context | Profile + resume text + URL | chrome.storage.local (10min), Redis (300s) |

---

## 6. API Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/register`, `/auth/login` | Auth |
| GET | `/auth/profile`, `/auth/refresh` | Auth |
| GET | `/profile`, PATCH `/profile` | Profile |
| GET | `/resume/workspace` | Resumes + tailor_context |
| POST | `/resume/upload`, `/resume/generate` | Resume |
| GET | `/resume/{id}/file` | Resume PDF proxy |
| PATCH | `/resume/{id}`, DELETE `/resume/{id}` | Resume |
| GET | `/dashboard/summary` | Dashboard (merged, cached) |
| POST | `/activity/track` | Career page view / autofill used |
| GET | `/chrome-extension/autofill/context` | Profile + resume for autofill |
| GET | `/chrome-extension/autofill/resume/{file_name}` | Resume PDF proxy |
| POST | `/chrome-extension/form-fields/map` | LLM field mapping |
| GET | `/chrome-extension/jobs`, POST, PATCH | Jobs |
| POST | `/chrome-extension/keywords/analyze` | Keyword match |
| POST | `/chrome-extension/tailor-context` | Tailor resume flow |
| POST | `/chrome-extension/cover-letter/upsert` | Cover letter |
| POST | `/payment/create-order`, `/payment/verify` | Razorpay |

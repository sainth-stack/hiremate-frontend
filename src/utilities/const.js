/**
 * Public API base for the web app (browser-safe). Do not put INGEST_SECRET or any
 * server-only secrets here — they would ship to every user. Ingestion uses
 * backend .env INGEST_SECRET + X-Ingest-Secret (scheduler / server-side jobs only).
 *
 * Override via Vite env: VITE_API_URL=http://localhost:8000/api
 * Prod example: VITE_API_URL=https://your-backend-domain/api
 */
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
// export const BASE_URL = 'https://opsbrainai.com/api';

/** Base URL for email links and shareable interview routes. */
export const UI_URL = import.meta.env.VITE_UI_URL || '';

/** Public site origin for interview links (env override, else current browser origin). */
export const getFrontendBaseUrl = () =>
  UI_URL || (typeof window !== 'undefined' ? window.location.origin : '');

/**
 * Build the shareable interview page URL sent to users by email.
 * @param {number|string} userId
 * @param {number|string} [interviewId] - optional, when user has multiple assignments
 */
export const buildInterviewUrl = (userId, interviewId) => {
  const base = getFrontendBaseUrl();
  const url = `${base}/interview/${encodeURIComponent(userId)}`;
  if (interviewId != null && interviewId !== '') {
    return `${url}?interview_id=${encodeURIComponent(interviewId)}`;
  }
  return url;
};
export const CHROME_EXTENSION_WEBSTORE_URL =
  'https://chromewebstore.google.com/detail/opsbrain-job-auto-fill/gbelhjcgamegincihdckbbhojjagfnnh';

/**
 * Job Ingestion Configuration (100% FREE)
 * 
 * The backend automatically scrapes and ingests jobs from FREE public sources every 2 hours.
 * NO PAID API KEYS REQUIRED! All sources are publicly accessible.
 * 
 * Backend .env configuration:
 * - INGEST_SECRET: Auth secret for calling ingestion endpoints
 * - ENABLE_JOB_SCHEDULER=true (enable/disable automatic ingestion)
 * - JOB_INGESTION_INTERVAL_HOURS=2 (how often to run, default: 2 hours)
 * 
 * FREE Job Sources (no registration needed):
 * - RemoteOK API - Remote jobs (https://remoteok.com/api)
 * - Remotive API - Remote jobs (https://remotive.com/api/remote-jobs)
 * - Indeed RSS - All job types (https://www.indeed.com/rss)
 * - WeWorkRemotely - Web scraping (https://weworkremotely.com)
 * 
 * How it works:
 * 1. Cron job runs every 2 hours automatically
 * 2. Scrapes 500-1000 new jobs from free sources
 * 3. Deduplicates by content hash
 * 4. Calculates match scores for logged-in users
 * 
 * Manual trigger (requires INGEST_SECRET):
 * POST http://localhost:8000/api/v1/jobs/ingest/public-apis
 * Headers: X-Ingest-Secret: <your-secret>
 * Body: {"dry_run": false}
 */
export const JOB_INGESTION_CONFIG = {
  enabled: true,
  intervalHours: 2,
  // 🌍 UNIVERSAL MODE - Works for ALL companies automatically!
  // No hardcoded company lists - automatically discovers jobs from:
  sources: [
    'remoteok',           // ALL remote jobs (200+ jobs)
    'remotive',           // ALL remote jobs (100+ jobs)
    'arbeitnow',          // Universal aggregator (100+ jobs)
    'findwork',           // Universal tech jobs (100+ jobs)
    'greenhouse',         // Auto-discovers 100+ companies (200-400 jobs)
    'linkedin',           // Multi-query search (50+ jobs)
  ],
  // Expected total: 600-1000+ jobs per run from ALL companies!
  // No manual maintenance needed - works for startups to Fortune 500
  queries: [
    'software engineer',
    'full stack developer',
    'python developer',
    'react developer',
    'data scientist',
  ],
};
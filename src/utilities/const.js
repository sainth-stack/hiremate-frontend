/**
 * Public API base for the web app (browser-safe). Do not put INGEST_SECRET or any
 * server-only secrets here — they would ship to every user. Ingestion uses
 * backend .env INGEST_SECRET + X-Ingest-Secret (scheduler / curl / server-side jobs only).
 */
// export const BASE_URL = 'http://127.0.0.1:8000/api';
export const BASE_URL = 'https://opsbrainai.com/api';
// export const UI_URL = 'https://opsbrainai.com';
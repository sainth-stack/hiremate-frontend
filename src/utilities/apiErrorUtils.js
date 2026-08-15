/**
 * Parse FastAPI / axios error payloads into a user-facing string.
 * @param {import('axios').AxiosError} err
 * @param {string} [fallback]
 */
export function parseApiError(err, fallback = 'Request failed') {
  if (err?.request && !err?.response) {
    return 'Network error — cannot reach the API server. Check that the backend is running and VITE_API_URL points to the correct port.';
  }
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const msg = item?.msg || item?.message || '';
        return msg.replace(/^Value error,\s*/i, '').trim();
      })
      .filter(Boolean)
      .join('; ') || fallback;
  }
  return fallback;
}

/**
 * Map FastAPI 422 validation errors to form field keys.
 * @param {import('axios').AxiosError} err
 * @returns {Record<string, string>}
 */
export function parseApiFieldErrors(err) {
  const detail = err?.response?.data?.detail;
  if (!Array.isArray(detail)) return {};

  const fields = {};
  detail.forEach((item) => {
    const loc = item?.loc;
    const field = Array.isArray(loc) ? loc[loc.length - 1] : null;
    if (typeof field !== 'string') return;
    const msg = (item?.msg || 'Invalid value').replace(/^Value error,\s*/i, '').trim();
    fields[field] = msg;
  });
  return fields;
}

/**
 * Parse FastAPI / axios error payloads into a user-facing string.
 * @param {import('axios').AxiosError} err
 * @param {string} [fallback]
 */
function friendlyStatusMessage(status) {
  if (status === 502 || status === 503 || status === 504) {
    return 'The server took too long to respond. Your progress is saved — please try again.';
  }
  if (status >= 500) {
    return 'Something went wrong on our side — please try again.';
  }
  return null;
}

export function parseApiError(err, fallback = 'Request failed') {
  if (err?.request && !err?.response) {
    return 'Connection interrupted — please try again in a moment.';
  }

  const status = err?.response?.status;
  const statusMessage = friendlyStatusMessage(status);
  const responseData = err?.response?.data;

  if (responseData instanceof Blob) {
    return statusMessage || fallback;
  }

  if (statusMessage && !responseData?.detail) {
    return statusMessage;
  }

  const rawDetail = responseData?.detail;
  if (typeof rawDetail === 'string' && rawDetail.toLowerCase().includes('cloudflare')) {
    return 'Connection interrupted — please try again in a moment.';
  }

  const detail = rawDetail;
  if (!detail) {
    const message = err?.message || '';
    if (/network error|timeout|aborted/i.test(message)) {
      return 'Connection interrupted — please try again in a moment.';
    }
    return message || fallback;
  }
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

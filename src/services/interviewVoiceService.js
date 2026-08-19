import axiosClient from './axiosClient';

const INTERVIEW_REQUEST_OPTS = {
  skipGlobalErrorToast: true,
};

export const getInterviewVoicesAPI = () => axiosClient.get('/interview/voices');

export const getInterviewVoiceConfigAPI = (userId, params = {}) =>
  axiosClient.get('/interview/voice-config', {
    params: { user_id: userId, ...params },
    ...INTERVIEW_REQUEST_OPTS,
  });

export const getInterviewSessionProgressAPI = (userId, params = {}) =>
  axiosClient.get('/interview/session/progress', {
    params: { user_id: userId, ...params },
    ...INTERVIEW_REQUEST_OPTS,
  });

async function withRetry(requestFn, { retries = 2, delayMs = 800 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestFn();
    } catch (err) {
      lastError = err;
      const status = err?.response?.status;
      const retriable = !status || status >= 500 || status === 429 || status === 408;
      if (!retriable || attempt >= retries) break;
      await new Promise((resolve) => { setTimeout(resolve, delayMs * (attempt + 1)); });
    }
  }
  throw lastError;
}

export const synthesizeInterviewQuestionAPI = (payload) =>
  withRetry(
    () => axiosClient.post('/interview/voice/tts', payload, {
      responseType: 'blob',
      timeout: 90000,
      ...INTERVIEW_REQUEST_OPTS,
    }),
    { retries: 2, delayMs: 1000 },
  );

export const previewInterviewVoiceAPI = (payload) =>
  axiosClient.post('/interview/voice/preview', payload, {
    responseType: 'blob',
    timeout: 90000,
    ...INTERVIEW_REQUEST_OPTS,
  });

export const consumeInterviewPauseAPI = (payload) =>
  withRetry(
    () => axiosClient.post('/interview/voice/pause', payload, {
      timeout: 30000,
      ...INTERVIEW_REQUEST_OPTS,
    }),
    { retries: 1, delayMs: 500 },
  );

export const submitInterviewVoiceAnswerAPI = (formData) =>
  withRetry(
    () => axiosClient.post('/interview/voice/answer', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000,
      ...INTERVIEW_REQUEST_OPTS,
    }),
    { retries: 2, delayMs: 1200 },
  );

export const getInterviewAnswerAudioAPI = (userId, params = {}) =>
  axiosClient.get('/interview/voice/audio', {
    params: { user_id: userId, ...params },
    ...INTERVIEW_REQUEST_OPTS,
  });

export const getInterviewAnswerMediaAPI = (userId, params = {}) =>
  axiosClient.get('/interview/voice/media', {
    params: { user_id: userId, ...params },
    ...INTERVIEW_REQUEST_OPTS,
  });

export function buildInterviewMediaStreamUrl(userId, params = {}) {
  const search = new URLSearchParams({
    user_id: String(userId),
    interview_id: String(params.interview_id),
    order: String(params.order),
    kind: params.kind || 'audio',
  });
  if (params.download) search.set('download', 'true');
  const base = axiosClient.defaults.baseURL || '';
  return `${base}/interview/voice/media/stream?${search.toString()}`;
}

function normalizeResponseBlob(blob, response) {
  const headerType = response?.headers?.['content-type']?.split(';')[0]?.trim();
  if (!headerType || blob.type === headerType) return blob;
  return new Blob([blob], { type: headerType });
}

export async function fetchInterviewMediaBlob(userId, params = {}) {
  const response = await axiosClient.get('/interview/voice/media/stream', {
    params: {
      user_id: userId,
      interview_id: params.interview_id,
      order: params.order,
      kind: params.kind || 'audio',
    },
    responseType: 'blob',
    timeout: 120000,
    ...INTERVIEW_REQUEST_OPTS,
  });
  const blob = response.data;
  if (blob?.type?.includes('json') || blob?.type?.includes('text/plain')) {
    const text = await blob.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.detail || 'Failed to load recording');
    } catch (err) {
      if (err instanceof Error && err.message !== 'Failed to load recording') throw err;
      throw new Error(text || 'Failed to load recording');
    }
  }
  return normalizeResponseBlob(blob, response);
}

export async function downloadInterviewMediaBlob(userId, params = {}) {
  const response = await axiosClient.get('/interview/voice/media/stream', {
    params: {
      user_id: userId,
      interview_id: params.interview_id,
      order: params.order,
      kind: params.kind || 'audio',
      download: true,
    },
    responseType: 'blob',
    timeout: 120000,
    ...INTERVIEW_REQUEST_OPTS,
  });
  const blob = response.data;
  if (blob?.type?.includes('json')) {
    const text = await blob.text();
    throw new Error(JSON.parse(text).detail || 'Download failed');
  }
  return normalizeResponseBlob(blob, response);
}

export const cloneInterviewVoiceAPI = (formData) =>
  axiosClient.post('/interview/voices/clone', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteInterviewVoiceCloneAPI = (cloneId) =>
  axiosClient.delete(`/interview/voices/clone/${cloneId}`);

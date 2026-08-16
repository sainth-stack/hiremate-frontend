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
      timeout: 120000,
      ...INTERVIEW_REQUEST_OPTS,
    }),
    { retries: 2, delayMs: 1200 },
  );

export const getInterviewAnswerAudioAPI = (userId, params = {}) =>
  axiosClient.get('/interview/voice/audio', {
    params: { user_id: userId, ...params },
    ...INTERVIEW_REQUEST_OPTS,
  });

export const cloneInterviewVoiceAPI = (formData) =>
  axiosClient.post('/interview/voices/clone', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteInterviewVoiceCloneAPI = (cloneId) =>
  axiosClient.delete(`/interview/voices/clone/${cloneId}`);

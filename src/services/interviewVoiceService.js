import axiosClient from './axiosClient';

export const getInterviewVoicesAPI = () => axiosClient.get('/interview/voices');

export const getInterviewVoiceConfigAPI = (userId, params = {}) =>
  axiosClient.get('/interview/voice-config', {
    params: { user_id: userId, ...params },
  });

export const getInterviewSessionProgressAPI = (userId, params = {}) =>
  axiosClient.get('/interview/session/progress', {
    params: { user_id: userId, ...params },
  });

export const synthesizeInterviewQuestionAPI = (payload) =>
  axiosClient.post('/interview/voice/tts', payload, {
    responseType: 'blob',
  });

export const previewInterviewVoiceAPI = (payload) =>
  axiosClient.post('/interview/voice/preview', payload, {
    responseType: 'blob',
  });

export const submitInterviewVoiceAnswerAPI = (formData) =>
  axiosClient.post('/interview/voice/answer', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getInterviewAnswerAudioAPI = (userId, params = {}) =>
  axiosClient.get('/interview/voice/audio', {
    params: { user_id: userId, ...params },
  });

export const cloneInterviewVoiceAPI = (formData) =>
  axiosClient.post('/interview/voices/clone', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteInterviewVoiceCloneAPI = (cloneId) =>
  axiosClient.delete(`/interview/voices/clone/${cloneId}`);

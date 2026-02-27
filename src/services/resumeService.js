import { dedupGet } from './axiosClient';
import axiosClient from './axiosClient';

/**
 * Upload resume file to parse. Uses baseURL from const (http://127.0.0.1:8000/api).
 * Token is attached from localStorage via axiosClient interceptor.
 */
export const uploadResumeAPI = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosClient.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getResumeWorkspaceAPI = () => dedupGet('/resume/workspace');

export const generateResumeAPI = ({ job_title, job_description }) =>
  axiosClient.post('/resume/generate', { job_title, job_description });

export const updateResumeAPI = (id, { resume_name, resume_text }) =>
  axiosClient.patch(`/resume/${id}`, { resume_name, resume_text });

export const deleteResumeAPI = (id) => {
  if (id === 0 || id === '0') {
    return axiosClient.delete('/resume');
  }
  return axiosClient.delete(`/resume/${id}`);
};

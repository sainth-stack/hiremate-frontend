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

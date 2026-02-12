import axiosClient from './axiosClient';

/**
 * PATCH profile - sends full profile data to backend.
 * Uses baseURL from const (http://127.0.0.1:8000/api), token from localStorage via axiosClient.
 */
export const patchProfileAPI = (data) =>
  axiosClient.patch('/profile', data);

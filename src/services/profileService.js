import axiosClient from './axiosClient';

/**
 * GET profile - fetches full profile data from backend.
 */
export const getProfileDataAPI = () =>
  axiosClient.get('/profile');

/**
 * PATCH profile - sends full profile data to backend.
 */
export const patchProfileAPI = (data) =>
  axiosClient.patch('/profile', data);

import axiosClient from './axiosClient';

// login API
export const loginAPI = (data) =>
  axiosClient.post('/auth/login', data);

// register API
export const registerAPI = (data) =>
  axiosClient.post('/auth/register', data);

// get profile
export const getProfileAPI = () =>
  axiosClient.get('/auth/profile');

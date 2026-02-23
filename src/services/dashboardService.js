import axiosClient from './axiosClient';

export const getDashboardStatsAPI = () =>
  axiosClient.get('/dashboard/stats');

export const getRecentApplicationsAPI = (limit = 10) =>
  axiosClient.get('/dashboard/recent-applications', { params: { limit } });

export const getCompaniesViewedAPI = (limit = 20) =>
  axiosClient.get('/dashboard/companies-viewed', { params: { limit } });

export const getSavedJobsAPI = () =>
  axiosClient.get('/chrome-extension/jobs');

export const getApplicationsByDayAPI = (days = 14) =>
  axiosClient.get('/dashboard/applications-by-day', { params: { days } });

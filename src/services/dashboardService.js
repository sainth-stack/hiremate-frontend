import { dedupGet } from './axiosClient';
import axiosClient from './axiosClient';

export const getDashboardSummaryAPI = (limit = 5, days = 7) =>
  dedupGet('/dashboard/summary', { params: { limit, days } });

export const getSavedJobsAPI = () =>
  axiosClient.get('/chrome-extension/jobs');

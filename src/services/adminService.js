/**
 * Admin API - all /api/admin/* endpoints. Requires admin auth.
 */
import axiosClient from './axiosClient';

export const getAdminOverviewAPI = () =>
  axiosClient.get('/admin/overview');

export const getAdminUsersAPI = (params = {}) =>
  axiosClient.get('/admin/users', { params });

export const getAdminUserUsageAPI = (userId) =>
  axiosClient.get(`/admin/users/${userId}/usage`);

export const getAdminCompaniesViewedAPI = (params = {}) =>
  axiosClient.get('/admin/companies-viewed', { params });

export const getAdminCareerPageLinksAPI = (params = {}) =>
  axiosClient.get('/admin/career-page-links', { params });

export const getAdminLearningFormStructuresAPI = () =>
  axiosClient.get('/admin/learning/form-structures');

export const getAdminLearningUserAnswersAPI = () =>
  axiosClient.get('/admin/learning/user-answers');

export const getAdminLearningSubmissionsAPI = (params = {}) =>
  axiosClient.get('/admin/learning/submissions', { params });

export const getAdminExtensionErrorsAPI = () =>
  axiosClient.get('/admin/extension/errors');

export const getAdminSubmissionLogsAPI = (params = {}) =>
  axiosClient.get('/admin/learning/submission-logs', { params });

export const getAdminSubmissionLogDetailAPI = (id) =>
  axiosClient.get(`/admin/learning/submission-logs/${id}`);

/** Aggregated AI token usage (admin). Backend: GET /admin/token-usage */
export const getAdminTokenUsageAPI = (params = {}) =>
  axiosClient.get('/admin/token-usage', { params });

/** Ingestion run analytics (admin). Backend: GET /admin/ingestion-runs */
export const getAdminIngestionRunsAPI = (params = {}) =>
  axiosClient.get('/admin/ingestion-runs', { params });

// Subscription Plan Management
export const getAdminPlansAPI = () =>
  axiosClient.get('/admin/plans');

export const updateAdminPlanAPI = (id, data) =>
  axiosClient.put(`/admin/plans/${id}`, data);

export const createAdminPlanAPI = (data) =>
  axiosClient.post('/admin/plans', data);

export const deleteAdminPlanAPI = (id) =>
  axiosClient.delete(`/admin/plans/${id}`);

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

/** Launch mock interviews (admin). POST /admin/launch-interviews */
export const launchAdminInterviewsAPI = (payload) => {
  const users = Array.isArray(payload.users) ? payload.users : [];
  const userIds = Array.isArray(payload.user_ids)
    ? payload.user_ids
    : users.map((u) => u.id);
  const userEmails = Array.isArray(payload.user_emails)
    ? payload.user_emails
    : users.map((u) => u.email);

  return axiosClient.post('/admin/launch-interviews', {
    interview_id: payload.interview_id,
    title: payload.title,
    difficulty: String(payload.difficulty).toLowerCase(),
    description: payload.description,
    created_at: payload.created_at,
    users: users.map((u) => ({ id: u.id, email: u.email })),
    user_ids: userIds,
    user_emails: userEmails,
  });
};

/**
 * @typedef {'easy' | 'medium' | 'hard'} InterviewDifficulty
 * @typedef {{
 *   id: number,
 *   title: string,
 *   difficulty: InterviewDifficulty,
 *   description: string,
 *   created_at: string,
 * }} Interview
 * @typedef {{ interviews: Interview[] }} InterviewListResponse
 * @typedef {{
 *   title: string,
 *   difficulty: InterviewDifficulty,
 *   description: string,
 * }} CreateInterviewRequest
 */

/** List interview templates (admin). GET /admin/interviews → InterviewListResponse */
export const getAdminInterviewsAPI = () =>
  axiosClient.get('/admin/interviews');

/** Get single interview template with questions. GET /admin/interviews/{id} */
export const getAdminInterviewAPI = (id) =>
  axiosClient.get(`/admin/interviews/${id}`);

/**
 * Create interview template (admin). POST /admin/interviews → Interview (201)
 * @param {CreateInterviewRequest} data
 */
export const createAdminInterviewAPI = (data) =>
  axiosClient.post('/admin/interviews', {
    title: data.title,
    difficulty: String(data.difficulty).toLowerCase(),
    description: data.description,
  });

/**
 * Update interview template (admin). PUT /admin/interviews/{id} → Interview (200)
 * @param {number} id
 * @param {CreateInterviewRequest} data
 */
export const updateAdminInterviewAPI = (id, data) =>
  axiosClient.put(`/admin/interviews/${id}`, {
    title: data.title,
    difficulty: String(data.difficulty).toLowerCase(),
    description: data.description,
  });

/** Delete interview template (admin). DELETE /admin/interviews/{id} → 204 */
export const deleteAdminInterviewAPI = (id) =>
  axiosClient.delete(`/admin/interviews/${id}`);

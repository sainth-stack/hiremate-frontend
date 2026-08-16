/**
 * Admin API - all /api/admin/* endpoints. Requires admin auth.
 */
import axiosClient from './axiosClient';
import { getFrontendBaseUrl } from '../utilities/const';

export const getAdminOverviewAPI = () =>
  axiosClient.get('/admin/overview');

export const getAdminUsersAPI = (params = {}) =>
  axiosClient.get('/admin/users', { params });

/** Create user (admin). POST /admin/users */
export const createAdminUserAPI = (data) =>
  axiosClient.post('/admin/users', {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    password: data.password,
    is_admin: Boolean(data.is_admin),
  });

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
    launch_name: payload.launch_name || payload.title,
    title: payload.title,
    difficulty: String(payload.difficulty).toLowerCase(),
    description: payload.description,
    created_at: payload.created_at,
    voice_provider: payload.voice_provider || 'cartesia',
    voice_id: payload.voice_id,
    voice_label: payload.voice_label || null,
    tts_language_code: payload.tts_language_code || 'en-IN',
    frontend_url: payload.frontend_url || getFrontendBaseUrl(),
    users: users.map((u) => ({ id: u.id, email: u.email })),
    user_ids: userIds,
    user_emails: userEmails,
  });
};

/** List launched interview campaigns. GET /admin/launches */
export const getAdminLaunchesAPI = (params = {}) =>
  axiosClient.get('/admin/launches', { params });

/** Launch campaign detail with assignees, transcripts, results. GET /admin/launches/{id} */
export const getAdminLaunchDetailAPI = (launchId) =>
  axiosClient.get(`/admin/launches/${launchId}`);

/** Delete a launch campaign. DELETE /admin/launches/{id} → 204 */
export const deleteAdminLaunchAPI = (id) =>
  axiosClient.delete(`/admin/launches/${id}`);

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
 *   question_count?: number,
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
    question_count: Number(data.question_count) || 15,
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
    question_count: Number(data.question_count) || 15,
  });

/** Delete interview template (admin). DELETE /admin/interviews/{id} → 204 */
export const deleteAdminInterviewAPI = (id) =>
  axiosClient.delete(`/admin/interviews/${id}`);

/** Update question wording (admin). PATCH /admin/interviews/{id}/questions */
export const updateAdminInterviewQuestionsAPI = (id, questions) =>
  axiosClient.patch(`/admin/interviews/${id}/questions`, {
    questions: questions.map((q) => ({ id: q.id, question_text: q.question_text })),
  });

/** Regenerate all questions from description. POST /admin/interviews/{id}/regenerate-questions */
export const regenerateAdminInterviewQuestionsAPI = (id, data = {}) =>
  axiosClient.post(`/admin/interviews/${id}/regenerate-questions`, {
    question_count: Number(data.question_count) || 15,
  });

import axiosClient from './axiosClient';

/**
 * Fetches applications from the tracker using official backend enum values.
 * Only pulls applications currently in an interview-related state.
 */
export const getInterviewApplicationsAPI = (statuses = ['interview_scheduled', 'interview_completed']) => {
  return axiosClient.get('/applications', { 
    params: { status: statuses.join(',') } 
  });
};

/**
 * Fetches tailored interview questions for a specific application.
 */
export const getInterviewQuestionsAPI = (applicationId) => {
  return axiosClient.get(`/mock-interview/questions`, {
    params: { application_id: applicationId }
  });
};

/**
 * Triggers the generation of 5 additional unique questions for the given application.
 */
export const loadMoreInterviewQuestionsAPI = (applicationId, category = null) => {
  return axiosClient.post(`/mock-interview/load-more`, null, {
    params: { 
      application_id: applicationId,
      category: category
    }
  });
};

/**
 * Sends a single interview answer to the AI for STAR evaluation.
 */
export const evaluateInterviewAnswerAPI = (applicationId, question, answer) => {
  return axiosClient.post(`/mock-interview/session/evaluate`, {
    application_id: applicationId,
    question,
    answer
  });
};

/**
 * Saves a completed interview session to the database.
 */
export const saveInterviewSessionAPI = (applicationId, sessionData) => {
  return axiosClient.post(`/mock-interview/session/save`, {
    application_id: applicationId,
    ...sessionData
  });
};

/**
 * Fetches the full details of a specific interview session.
 */
export const getInterviewSessionDetailAPI = (sessionId) => {
  return axiosClient.get(`/mock-interview/session/${sessionId}`);
};

/**
 * Fetches the user's past interview session history.
 */
export const getInterviewHistoryAPI = () => {
  return axiosClient.get(`/mock-interview/history`);
};

/**
 * Fetches interview questions for the user session.
 * Backend: GET /interview/questions?user_id=&interview_id=
 */
export const getUserInterviewQuestionsAPI = (userId, params = {}) =>
  axiosClient.get('/interview/questions', {
    params: { user_id: userId, ...params },
  });

/**
 * Submits all answers in one batch for LangGraph evaluation.
 * Backend: POST /interview/submit
 * Returns performance summary with question_summaries only (no full answers).
 */
export const submitUserInterviewAPI = (payload) =>
  axiosClient.post('/interview/submit', payload);

/** Reset completed interview so candidate can retake. POST /interview/retest */
export const retestInterviewAPI = (payload) =>
  axiosClient.post('/interview/retest', payload);

/**
 * Fetches completed interview performance (same shape as submit response).
 * Backend: GET /interview/performance?user_id=&interview_id=
 */
export const getInterviewPerformanceAPI = (userId, params = {}) =>
  axiosClient.get('/interview/performance', {
    params: { user_id: userId, ...params },
  });

/**
 * Fetches full per-question analysis on demand.
 * Backend: GET /interview/question-analysis?user_id=&interview_id=&order=
 */
export const getInterviewQuestionAnalysisAPI = (userId, params = {}) =>
  axiosClient.get('/interview/question-analysis', {
    params: { user_id: userId, ...params },
  });

/**
 * Fetches a launched interview assignment for a user.
 * Backend: GET /launched-interviews/user/{userId}
 */
export const getLaunchedInterviewAPI = (userId, params = {}) => {
  return axiosClient.get(`/launched-interviews/user/${encodeURIComponent(userId)}`, { params });
};

/**
 * Submits answers for a launched interview assignment.
 * Backend: POST /launched-interviews/user/{userId}/submit
 */
export const submitLaunchedInterviewAPI = (userId, payload, params = {}) => {
  return axiosClient.post(
    `/launched-interviews/user/${encodeURIComponent(userId)}/submit`,
    payload,
    { params },
  );
};

const interviewService = {
  getInterviewApplications: getInterviewApplicationsAPI,
  getInterviewQuestions: getInterviewQuestionsAPI,
  loadMoreQuestions: loadMoreInterviewQuestionsAPI,
  evaluateAnswer: evaluateInterviewAnswerAPI,
  saveSession: saveInterviewSessionAPI,
  getHistory: getInterviewHistoryAPI,
  getSessionDetail: getInterviewSessionDetailAPI,
  getLaunchedInterview: getLaunchedInterviewAPI,
  submitLaunchedInterview: submitLaunchedInterviewAPI,
  getUserInterviewQuestions: getUserInterviewQuestionsAPI,
  submitUserInterview: submitUserInterviewAPI,
  getInterviewPerformance: getInterviewPerformanceAPI,
  getInterviewQuestionAnalysis: getInterviewQuestionAnalysisAPI,
};

export default interviewService;

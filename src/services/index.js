/**
 * Service layer barrel - re-exports all API services for consistent imports.
 */
export {
  loginAPI,
  registerAPI,
  getProfileAPI,
} from './authService';

export {
  getDashboardSummaryAPI,
} from './dashboardService';

export {
  listJobsAPI,
  getJobAPI,
  updateJobStatusAPI,
  createJobAPI,
} from './jobsService';

export {
  createOrderAPI,
  verifyPaymentAPI,
  getPublicPlansAPI,
} from './paymentService';

export {
  getProfileDataAPI,
  patchProfileAPI,
  invalidateFieldAnswersAPI,
} from './profileService';

export {
  getAdminOverviewAPI,
  getAdminUsersAPI,
  getAdminUserUsageAPI,
  getAdminCompaniesViewedAPI,
  getAdminCareerPageLinksAPI,
  getAdminLearningFormStructuresAPI,
  getAdminLearningUserAnswersAPI,
  getAdminLearningSubmissionsAPI,
  getAdminExtensionErrorsAPI,
  getAdminSubmissionLogsAPI,
  getAdminSubmissionLogDetailAPI,
  getAdminTokenUsageAPI,
  getAdminIngestionRunsAPI,
  launchAdminInterviewsAPI,
  getAdminInterviewsAPI,
  getAdminInterviewAPI,
  createAdminInterviewAPI,
  updateAdminInterviewAPI,
  deleteAdminInterviewAPI,
} from './adminService';

export {
  getResumeWorkspaceAPI,
  listResumesAPI,
  generateResumeAPI,
  previewResumeAPI,
  previewResumeHtmlAPI,
  updateResumeAPI,
  renameResumeAPI,
  deleteResumeAPI,
  uploadResumeAPI,
  atsScanResumeAPI,
  analyzeResumeAPI,
  analyzeKeywordsAPI,
  saveResumeSnapshotAPI,
  generateSectionAPI,
  extractKeywordsAPI,
  getResumeTemplatesAPI,
  updateResumeDesignAPI,
} from './resumeService';

export {
  getPrivacyPolicyAPI,
  getPrivacyPolicyHistoryAPI,
  updatePrivacyPolicyAPI,
  getTermsOfServiceAPI,
  getTermsOfServiceHistoryAPI,
  updateTermsOfServiceAPI,
} from './legalService';

export {
  createIssueAPI,
  uploadIssueScreenshotAPI,
  listIssuesAPI,
  getIssueAPI,
  updateIssueStatusAPI,
} from './issueService';

export {
  parseFile,
  resolveLinks,
  streamJobs,
} from './companySearchService';

export {
  getInterviewApplicationsAPI,
  getUserInterviewQuestionsAPI,
  submitUserInterviewAPI,
  getLaunchedInterviewAPI,
  getInterviewPerformanceAPI,
  getInterviewQuestionAnalysisAPI,
} from './interviewService';

export {
  requestAdminInterviewAPI,
  getMyAdminInterviewsAPI,
  getAdminInterviewRequestsAPI,
  launchInterviewFromRequestAPI,
  updateAdminInterviewRequestAPI,
} from './adminInterviewService';

export { default as axiosClient } from './axiosClient';

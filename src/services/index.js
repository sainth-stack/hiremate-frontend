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
  getSavedJobsAPI,
} from './dashboardService';

export {
  listJobsAPI,
  updateJobStatusAPI,
} from './jobsService';

export {
  createOrderAPI,
  verifyPaymentAPI,
} from './paymentService';

export {
  getProfileDataAPI,
  patchProfileAPI,
} from './profileService';

export {
  getResumeWorkspaceAPI,
  listResumesAPI,
  generateResumeAPI,
  updateResumeAPI,
  deleteResumeAPI,
  uploadResumeAPI,
} from './resumeService';

export { default as axiosClient } from './axiosClient';

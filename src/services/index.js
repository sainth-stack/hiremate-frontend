/**
 * Service layer barrel - re-exports all API services for consistent imports.
 */
export {
  loginAPI,
  registerAPI,
  getProfileAPI,
} from './authService';

export {
  getDashboardStatsAPI,
  getRecentApplicationsAPI,
  getCompaniesViewedAPI,
  getSavedJobsAPI,
  getApplicationsByDayAPI,
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
  listResumesAPI,
  generateResumeAPI,
  updateResumeAPI,
  deleteResumeAPI,
  getTailorContextAPI,
  uploadResumeAPI,
} from './resumeService';

export { default as axiosClient } from './axiosClient';

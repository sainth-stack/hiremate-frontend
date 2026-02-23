import axiosClient from './axiosClient';

export const listJobsAPI = (status) =>
  axiosClient.get('/chrome-extension/jobs', status ? { params: { status } } : {});

export const updateJobStatusAPI = (jobId, applicationStatus) =>
  axiosClient.patch(`/chrome-extension/jobs/${jobId}`, { application_status: applicationStatus });

import axiosClient from './axiosClient';

export const listApplicationsAPI = () => axiosClient.get('/applications');
export const getApplicationAPI = (id) => axiosClient.get(`/applications/${id}`);
export const createApplicationAPI = (data) => axiosClient.post('/applications', data);
export const createApplicationFromJDAPI = (data) => axiosClient.post('/applications/from-jd', data);
export const updateApplicationAPI = (id, data) => axiosClient.patch(`/applications/${id}`, data);
export const deleteApplicationAPI = (id) => axiosClient.delete(`/applications/${id}`);
export const withdrawApplicationAPI = (id) => axiosClient.patch(`/applications/${id}/withdraw`);

// HR Contacts
export const addHRContactAPI = (appId, data) => axiosClient.post(`/applications/${appId}/hr-contacts`, data);
export const deleteHRContactAPI = (appId, contactId) => axiosClient.delete(`/applications/${appId}/hr-contacts/${contactId}`);

// Calendar Events
export const addEventToCalendarAPI = (appId, eventId) => axiosClient.post(`/applications/${appId}/events/${eventId}/add-to-calendar`);
export const removeEventFromCalendarAPI = (appId, eventId) => axiosClient.delete(`/applications/${appId}/events/${eventId}/remove-from-calendar`);

// Salary Estimation
export const getSalaryEstimateAPI = (appId, refresh = false) => {
  const params = refresh ? '?refresh=true' : '';
  return axiosClient.get(`/applications/${appId}/salary-estimate${params}`);
};

// Company Profile
export const getCompanyProfileAPI = (domain, refresh = false) => {
  const params = refresh ? '?refresh=true' : '';
  return axiosClient.get(`/applications/companies/${domain}/profile${params}`);
};

// Sync
export const triggerSyncAPI = (fromDate, toDate) => {
  const params = new URLSearchParams();
  if (fromDate) params.append('from_date', fromDate);
  if (toDate) params.append('to_date', toDate);
  return axiosClient.post(`/sync?${params.toString()}`);
};
export const getSyncStatusAPI = () => axiosClient.get('/sync/status');
export const stopSyncAPI = () => axiosClient.post('/sync/stop');

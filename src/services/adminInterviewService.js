import axiosClient from './axiosClient';

/** User: request an admin-led interview. POST /interview-requests */
export const requestAdminInterviewAPI = (payload) =>
  axiosClient.post('/interview-requests', {
    domain: payload.domain,
    description: payload.description,
  });

/** User: list my admin interview assignments/requests. GET /my-admin-interviews */
export const getMyAdminInterviewsAPI = () =>
  axiosClient.get('/my-admin-interviews');

/** Admin: list user interview requests. GET /admin/interview-requests */
export const getAdminInterviewRequestsAPI = (params = {}) =>
  axiosClient.get('/admin/interview-requests', { params });

/** Admin: send/launch interview for a request. POST /admin/interview-requests/{id}/launch */
export const launchInterviewFromRequestAPI = (requestId, payload = {}) =>
  axiosClient.post(`/admin/interview-requests/${requestId}/launch`, payload);

/** Admin: update request status. PATCH /admin/interview-requests/{id} */
export const updateAdminInterviewRequestAPI = (requestId, payload) =>
  axiosClient.patch(`/admin/interview-requests/${requestId}`, payload);

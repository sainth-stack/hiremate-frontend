/**
 * Legal API — privacy policy and terms of service endpoints.
 */
import axiosClient from './axiosClient';

export const getPrivacyPolicyAPI = () =>
  axiosClient.get('/legal/privacy-policy');

export const getPrivacyPolicyHistoryAPI = () =>
  axiosClient.get('/legal/privacy-policy/history');

/** Admin only — publish a new version of the privacy policy. */
export const updatePrivacyPolicyAPI = (payload) =>
  axiosClient.put('/legal/privacy-policy', payload);

export const getTermsOfServiceAPI = () =>
  axiosClient.get('/legal/terms-of-service');

export const getTermsOfServiceHistoryAPI = () =>
  axiosClient.get('/legal/terms-of-service/history');

/** Admin only — publish a new version of the terms of service. */
export const updateTermsOfServiceAPI = (payload) =>
  axiosClient.put('/legal/terms-of-service', payload);

import axiosClient from './axiosClient';

/**
 * Create Razorpay order for a subscription plan.
 * Requires user to be authenticated (Bearer token).
 */
export const createOrderAPI = (planId) =>
  axiosClient.post('/payment/create-order', { plan_id: planId });

/**
 * Verify payment after Razorpay checkout success.
 */
export const verifyPaymentAPI = (data) =>
  axiosClient.post('/payment/verify', data);

import axios from 'axios';
import { BASE_URL } from '../utilities/const';

const _inflight = new Map();

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to requests if present
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: handle 401 and clear auth
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch or redirect can be handled in the app (e.g. via store)
    }
    return Promise.reject(error);
  }
);

export async function dedupGet(url, config = {}) {
  const key = url + JSON.stringify(config.params || {});
  if (_inflight.has(key)) return _inflight.get(key);
  const promise = axiosClient.get(url, config).finally(() => _inflight.delete(key));
  _inflight.set(key, promise);
  return promise;
}

export default axiosClient;

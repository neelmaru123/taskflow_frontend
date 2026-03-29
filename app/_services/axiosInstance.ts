/**
 * axiosInstance.ts
 *
 * Single axios instance used by every service.
 * - Automatically retries with a refreshed token when it gets TOKEN_EXPIRED.
 * - Redirects to "/" if the refresh also fails (session fully expired).
 */

import axios from "axios";

export const API_URL = "http://localhost:8080/";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies on every request
});

// ── Track whether a refresh is already in-flight ────────────────────────────
let isRefreshing = false;
// Queue of { resolve, reject } for requests that arrived while refreshing
let failedQueue: {
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
}[] = [];

function processQueue(error: unknown) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)));
  failedQueue = [];
}

// ── Response interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401s that haven't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      const message: string = error.response?.data?.message ?? "";

      // If the token is just expired, try to refresh it silently
      if (message === "TOKEN_EXPIRED" || message === "TOKEN_MISSING") {
        if (isRefreshing) {
          // Another refresh is running — queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => axiosInstance(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await axiosInstance.post("users/refresh"); // sends refreshToken cookie
          processQueue(null);
          return axiosInstance(originalRequest); // retry original request
        } catch (refreshError) {
          processQueue(refreshError);
          // Refresh failed — session is dead, redirect to login
          if (typeof window !== "undefined") {
            window.location.replace("/");
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // TOKEN_INVALID or any other 401 — force logout immediately
      if (message === "TOKEN_INVALID") {
        if (typeof window !== "undefined") {
          window.location.replace("/");
        }
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

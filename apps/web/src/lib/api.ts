import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@mykks32/expense-crux-contracts';

import { getCookie, removeCookie, setCookie } from './cookies';

const apiHost = import.meta.env.VITE_API_URL;

if (!apiHost) {
  throw new Error('VITE_API_URL is not set — copy apps/web/.env.example to apps/web/.env and set it to your backend URL.');
}

// Backend routes are URI-versioned (main.ts's enableVersioning) — kept as a
// separate constant so bumping the API version later is a one-line change.
const baseURL = `${apiHost}/v1`;

const ACCESS_TOKEN_COOKIE = 'AUTH_TOKEN';
const REFRESH_TOKEN_COOKIE = 'REFRESH_TOKEN';

const ONE_DAY_SECONDS = 60 * 60 * 24;
const SEVEN_DAYS_SECONDS = ONE_DAY_SECONDS * 7;

/** Normalized error thrown for every failed API call, mirroring the backend's error envelope. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorName?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function toApiError(error: AxiosError<ApiResponse<unknown>>): ApiError {
  const body = error.response?.data;
  if (body) {
    return new ApiError(body.message, body.statusCode, body.errorName);
  }
  return new ApiError(error.message, error.response?.status ?? 0);
}

function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  return toApiError(error as AxiosError<ApiResponse<unknown>>);
}

/** Shared fallback message for mutation errors that aren't a normalized {@link ApiError}. */
export function getApiErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong. Try again.';
}

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

function isAuthPath(url?: string): boolean {
  return !!url && AUTH_PATHS.some((path) => url.startsWith(path));
}

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (isAuthPath(config.url)) {
    return config;
  }
  const accessToken = getCookie(ACCESS_TOKEN_COOKIE);
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

let onSessionExpired: (() => void) | null = null;

/**
 * Registers the callback invoked when the refresh flow itself fails (expired,
 * revoked, or reused refresh token) — the auth store uses this to force a
 * sign-out. Kept as a setter (rather than importing the store directly) to
 * avoid a circular import, since the store also depends on this module to
 * call the auth endpoints.
 * @param handler callback invoked with no arguments once the session can no longer be refreshed
 */
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

let refreshPromise: Promise<string> | null = null;

/**
 * Calls POST /auth/refresh with the stored refresh token, persists the rotated
 * pair, and returns the new access token. Concurrent 401s share a single
 * in-flight refresh request instead of each racing their own rotation.
 * @returns the newly issued access token
 * @throws {ApiError} if no refresh token is stored, or the backend rejects it
 */
async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);
      if (!refreshToken) {
        throw new ApiError('No refresh token stored', 401);
      }
      const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
        `${baseURL}/auth/refresh`,
        { refreshToken },
      );
      const tokens = response.data.data;
      if (!tokens) {
        throw new ApiError('Malformed refresh response', 500);
      }
      setCookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, ONE_DAY_SECONDS);
      setCookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, SEVEN_DAYS_SECONDS);
      return tokens.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isUnauthorized = error.response?.status === 401;
    const canRetry = !!originalRequest && !originalRequest._retry && !isAuthPath(originalRequest.url);

    if (isUnauthorized && canRetry) {
      originalRequest._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
        return apiClient(originalRequest);
      } catch (refreshError) {
        removeCookie(ACCESS_TOKEN_COOKIE);
        removeCookie(REFRESH_TOKEN_COOKIE);
        onSessionExpired?.();
        return Promise.reject(normalizeError(refreshError));
      }
    }

    return Promise.reject(toApiError(error));
  },
);

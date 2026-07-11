import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@mykks32/expense-crux-contracts';

import { clearSession, getAccessToken, getRefreshToken, setTokens } from './token-storage';

const apiHost = process.env.EXPO_PUBLIC_API_URL;

if (!apiHost) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is not set — copy apps/mobile/.env.example to apps/mobile/.env and set it to your backend URL.',
  );
}

// Backend routes are URI-versioned (main.ts's enableVersioning) — kept as a
// separate constant so bumping the API version later is a one-line change.
const baseURL = `${apiHost}/v1`;

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

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (isAuthPath(config.url)) {
    return config;
  }
  const accessToken = await getAccessToken();
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
      const refreshToken = await getRefreshToken();
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
      await setTokens(tokens);
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
        await clearSession();
        onSessionExpired?.();
        return Promise.reject(normalizeError(refreshError));
      }
    }

    return Promise.reject(toApiError(error));
  },
);

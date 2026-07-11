import type { ApiResponse, AuthResponse, LoginInput, RegisterInput } from '@mykks32/expense-crux-contracts';

import { apiClient } from '@/lib/api';

function requireData<T>(body: ApiResponse<T>): T {
  if (!body.data) {
    throw new Error('Malformed API response: missing data');
  }
  return body.data;
}

/**
 * Registers a new account.
 * @param input email, password, and optional display name
 * @returns the created user and its initial access/refresh tokens
 * @throws {import('@/lib/api').ApiError} with errorName "emailAlreadyRegistered" if the email is taken
 */
export async function register(input: RegisterInput): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', input);
  return requireData(response.data);
}

/**
 * Signs in with email/password.
 * @param input email and password
 * @returns the authenticated user and its access/refresh tokens
 * @throws {import('@/lib/api').ApiError} with errorName "invalidCredentials" on a bad email/password
 */
export async function login(input: LoginInput): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', input);
  return requireData(response.data);
}

/**
 * Exchanges a refresh token for a new access/refresh pair. This is also how a
 * session is restored on app start, since the backend has no dedicated
 * "current user" endpoint — the refresh response is the only way to get fresh
 * user data.
 * @param token the refresh token to exchange
 * @returns the rotated token pair and current user
 * @throws {import('@/lib/api').ApiError} with errorName "invalidRefreshToken" if the token is expired/revoked/reused
 */
export async function refreshToken(token: string): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken: token });
  return requireData(response.data);
}

/** Revokes the current session server-side (invalidates the stored refresh token hash). */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

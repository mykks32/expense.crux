/**
 * Machine-readable error codes used by {@link GlobalHttpException}, mapped
 * to their default human-readable message.
 */
export const HttpErrorCodeMessage = {
  serverError: 'Internal server error',
  validationError: 'Validation failed',
  emailAlreadyRegistered: 'Email is already registered',
  invalidCredentials: 'Invalid credentials',
  invalidRefreshToken: 'Invalid refresh token',
  userNotFound: 'User not found',
  expenseNotFound: 'Expense not found',
  expenseForbidden: 'You do not have access to this expense',
} as const;

/** Union of all valid error codes, derived from {@link HttpErrorCodeMessage}. */
export type HttpErrorCodeTypes = keyof typeof HttpErrorCodeMessage;

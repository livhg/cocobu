// Authentication configuration constants
export const AUTH_CONSTANTS = {
  // Token expiry times
  SESSION_EXPIRY: '7d',
  SESSION_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds

  // Cookie configuration
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds

  // User ID validation
  USER_ID_REGEX: /^[a-z0-9-]+$/,
  USER_ID_MIN_LENGTH: 3,
  USER_ID_MAX_LENGTH: 64,
} as const;

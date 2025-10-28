// Authentication configuration constants
export const AUTH_CONSTANTS = {
  // Token expiry times
  MAGIC_LINK_EXPIRY: '15m',
  SESSION_EXPIRY: '7d',
  SESSION_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds

  // Email configuration
  DEFAULT_FROM_EMAIL: 'noreply@cocobu.app',
} as const;

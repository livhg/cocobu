import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET;

  // In production, JWT_SECRET must be set
  if (isProduction && !jwtSecret) {
    throw new Error('JWT_SECRET must be set in production environment');
  }

  // In development, use a default secret if not provided
  const secret = jwtSecret || 'dev-secret-change-in-production-use-openssl-rand-hex-32';

  return {
    secret,
    signOptions: {
      expiresIn: '7d',
    },
  };
});

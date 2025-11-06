import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  // Main JWT secret
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Refresh token settings
  refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Algorithm
  algorithm: 'HS256',

  // Issuer
  issuer: 'isuzu-stock-management',
}));

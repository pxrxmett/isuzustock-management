import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Get frontend URLs from environment
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
  const adminUrl = process.env.ADMIN_URL || 'http://localhost:8080';

  // Dynamic CORS origins based on environment
  const getCorsOrigins = (): string[] => {
    // Get additional CORS origins from environment (comma-separated)
    const additionalOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : [];

    if (isProduction) {
      // Production: Only allow production frontends + additional origins
      const origins = [frontendUrl, adminUrl, ...additionalOrigins];
      // Remove duplicates
      return [...new Set(origins)];
    }

    // Development: Allow both local and production URLs for testing
    return [
      'http://localhost:3000', // Backend local
      'http://localhost:4000', // LIFF App local
      'http://localhost:8080', // Admin Dashboard local
      frontendUrl, // Production LIFF App
      adminUrl, // Production Admin Dashboard
      ...additionalOrigins, // Additional CORS origins
    ];
  };

  return {
    // Application settings
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiPrefix: 'api',

    // CORS configuration
    corsOrigins: getCorsOrigins(),
    corsEnabled: true,

    // URLs
    frontendUrl,
    adminUrl,

    // Meta info
    isProduction,
    isDevelopment,
  };
});

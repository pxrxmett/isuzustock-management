import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    const isProduction = process.env.NODE_ENV === 'production';

    const baseConfig: TypeOrmModuleOptions = {
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'stock_management',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      charset: 'utf8mb4',
      timezone: '+07:00',
      connectTimeout: 60000,
      acquireTimeout: 60000,
      extra: {
        connectionLimit: 10,
      },
    };

    if (isProduction) {
      // Production configuration for Railway
      return {
        ...baseConfig,
        synchronize: false, // Never use synchronize in production
        logging: false,
        ssl: {
          rejectUnauthorized: false, // Railway MySQL requires SSL
        },
        extra: {
          ...baseConfig.extra,
          ssl: {
            rejectUnauthorized: false,
          },
        },
      };
    }

    // Development configuration
    return {
      ...baseConfig,
      synchronize: true, // Auto-sync schema in development
      logging: true, // Enable SQL query logging
      logger: 'advanced-console',
    };
  },
);

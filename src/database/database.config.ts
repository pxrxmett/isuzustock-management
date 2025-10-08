import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  
  // ลอง DATABASE_URL ก่อน
  const databaseUrl = configService.get('DATABASE_URL');
  
  console.log('=== Database Config Debug ===');
  console.log('NODE_ENV:', configService.get('NODE_ENV'));
  console.log('DATABASE_URL exists:', !!databaseUrl);
  
  if (databaseUrl) {
    console.log('✅ Using DATABASE_URL');
    console.log('============================');
    
    return {
      type: 'mysql',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: !isProduction,
      extra: {
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
        connectTimeout: 60000,
      },
      timezone: '+07:00',
    };
  }
  
  // ถ้าไม่มี DATABASE_URL ใช้แบบแยก
  console.log('Using individual variables');
  const host = configService.get('DB_HOST');
  const port = configService.get('DB_PORT');
  const username = configService.get('DB_USERNAME');
  const password = configService.get('DB_PASSWORD');
  const database = configService.get('DB_DATABASE');
  
  console.log('DB_HOST:', host);
  console.log('DB_PORT:', port);
  console.log('DB_USERNAME:', username);
  console.log('DB_PASSWORD exists:', !!password);
  console.log('DB_DATABASE:', database);
  console.log('============================');
  
  if (!host || !username || !password || !database) {
    console.error('❌ Missing required database configuration!');
    throw new Error('Database configuration is incomplete');
  }
  
  return {
    type: 'mysql',
    host: host,
    port: port ? parseInt(port, 10) : 3306,
    username: username,
    password: password,
    database: database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: !isProduction,
    extra: {
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
      connectTimeout: 60000,
    },
    timezone: '+07:00',
  };
};

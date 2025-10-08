import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  
  // =============== Debug Logs (สำคัญมาก!) ===============
  console.log('=== Database Config Debug ===');
  console.log('NODE_ENV:', configService.get('NODE_ENV'));
  console.log('DB_HOST:', configService.get('DB_HOST'));
  console.log('DB_PORT:', configService.get('DB_PORT'));
  console.log('DB_USERNAME:', configService.get('DB_USERNAME'));
  console.log('DB_PASSWORD exists:', !!configService.get('DB_PASSWORD'));
  console.log('DB_DATABASE:', configService.get('DB_DATABASE'));
  console.log('============================');
  // =====================================================
  
  // อ่านค่า
  const host = configService.get('DB_HOST');
  const port = configService.get('DB_PORT');
  const username = configService.get('DB_USERNAME');
  const password = configService.get('DB_PASSWORD');
  const database = configService.get('DB_DATABASE');
  
  // ตรวจสอบว่าได้ค่าครบหรือไม่
  if (!host || !username || !password || !database) {
    console.error('❌ Missing required database configuration!');
    console.error('Please check Railway Variables are set correctly');
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
    logging: !isProduction, // ปิด logging ใน production
    extra: {
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
      connectTimeout: 60000, // เพิ่ม timeout สำหรับ Railway
    },
    timezone: '+07:00',
  };
};

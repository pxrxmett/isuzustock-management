import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  
  console.log('=== Database Config Debug ===');
  console.log('NODE_ENV:', nodeEnv);
  
  // ใน production ใช้ process.env โดยตรง
  if (isProduction) {
    const databaseUrl = process.env.DATABASE_URL;
    const dbHost = process.env.DB_HOST;
    const dbPassword = process.env.DB_PASSWORD;
    
    console.log('DATABASE_URL exists:', !!databaseUrl);
    console.log('DB_HOST:', dbHost);
    console.log('DB_PASSWORD exists:', !!dbPassword);
    
    // ลอง DATABASE_URL ก่อน
    if (databaseUrl) {
      console.log('✅ Using DATABASE_URL');
      console.log('============================');
      
      return {
        type: 'mysql',
        url: databaseUrl,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: false,
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
    const dbPort = process.env.DB_PORT;
    const dbUsername = process.env.DB_USERNAME;
    const dbDatabase = process.env.DB_DATABASE;
    
    if (dbHost && dbUsername && dbPassword && dbDatabase) {
      console.log('✅ Using individual variables');
      console.log('============================');
      
      return {
        type: 'mysql',
        host: dbHost,
        port: dbPort ? parseInt(dbPort, 10) : 3306,
        username: dbUsername,
        password: dbPassword,
        database: dbDatabase,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: false,
        extra: {
          connectionLimit: 10,
          waitForConnections: true,
          queueLimit: 0,
          connectTimeout: 60000,
        },
        timezone: '+07:00',
      };
    }
    
    // Fallback: ใช้ค่าตายตัว (จะเห็นข้อความนี้ใน Logs)
    console.log('⚠️ Using fallback hardcoded connection');
    console.log('============================');
    
    return {
      type: 'mysql',
      host: 'mysql.railway.internal',
      port: 3306,
      username: 'root',
      password: 'yowDL0snjFWZrTDPvTJgvhjnqNeNUIUZ',
      database: 'railway',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: false,
      extra: {
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
        connectTimeout: 60000,
      },
      timezone: '+07:00',
    };
  }
  
  // Local development ใช้ ConfigService
  console.log('Using ConfigService for local');
  console.log('============================');
  
  const host = configService.get('DB_HOST') || '127.0.0.1';
  const port = configService.get('DB_PORT');
  const username = configService.get('DB_USERNAME') || 'stockuser';
  const password = configService.get('DB_PASSWORD') || 'stock1234';
  const database = configService.get('DB_DATABASE') || 'stock_management';
  
  return {
    type: 'mysql',
    host: host,
    port: port ? parseInt(port, 10) : 3306,
    username: username,
    password: password,
    database: database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: true,
    extra: {
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
    },
    timezone: '+07:00',
  };
};

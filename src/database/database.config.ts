import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const port = configService.get('DB_PORT');
  return {
    type: 'mysql',
    host: configService.get('DB_HOST'),
    port: port ? parseInt(port, 10) : 3306,
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false, // เปลี่ยนจาก true เป็น false
    logging: true,
    extra: {
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
    },
    timezone: '+07:00',
  };
};

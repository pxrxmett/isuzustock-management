import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';

dotenv.config({ path: envFile });
dotenv.config({ path: '.env' }); // Fallback

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'stock_management',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false, // Never use synchronize with migrations
  logging: !isProduction,
  charset: 'utf8mb4',
  timezone: '+07:00',
  ...(isProduction && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});

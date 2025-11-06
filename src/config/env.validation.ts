import { plainToClass } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync, IsOptional } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  // Database - ต้องมีอย่างน้อย DATABASE_URL หรือ DB_* ครบทุกตัว
  @IsString()
  @IsOptional()
  DATABASE_URL: string;

  @IsString()
  @IsOptional()
  DB_HOST: string;

  @IsNumber()
  @IsOptional()
  DB_PORT: number;

  @IsString()
  @IsOptional()
  DB_USERNAME: string;

  @IsString()
  @IsOptional()
  DB_PASSWORD: string;

  @IsString()
  @IsOptional()
  DB_DATABASE: string;

  // JWT Secret - จำเป็นต้องมี
  @IsString()
  JWT_SECRET: string;

  // LINE Credentials - REQUIRED for LINE integration
  @IsString()
  LINE_CHANNEL_ID: string;

  @IsString()
  LINE_CHANNEL_SECRET: string;

  @IsString()
  LINE_CHANNEL_ACCESS_TOKEN: string;

  @IsString()
  LINE_LIFF_ID: string;

  @IsString()
  @IsOptional()
  FRONTEND_URL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  // ตรวจสอบ JWT_SECRET
  if (!validatedConfig.JWT_SECRET) {
    console.error('❌ CRITICAL: JWT_SECRET is not set!');
    console.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    throw new Error('JWT_SECRET environment variable is required');
  }

  // ตรวจสอบว่ามี DATABASE_URL หรือ DB_* ครบ
  const hasDatabaseUrl = !!validatedConfig.DATABASE_URL;
  const hasIndividualDbVars = !!(
    validatedConfig.DB_HOST &&
    validatedConfig.DB_USERNAME &&
    validatedConfig.DB_PASSWORD &&
    validatedConfig.DB_DATABASE
  );

  if (!hasDatabaseUrl && !hasIndividualDbVars) {
    console.error('❌ CRITICAL: Database configuration is incomplete!');
    console.error('You must provide either:');
    console.error('  Option 1: DATABASE_URL');
    console.error('  Option 2: DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE');
    throw new Error('Database configuration is required');
  }

  // แสดง warnings สำหรับค่าที่ไม่ปลอดภัย
  if (validatedConfig.JWT_SECRET === 'change-this-secret' ||
      validatedConfig.JWT_SECRET === 'your_jwt_secret_key_change_this_in_production' ||
      validatedConfig.JWT_SECRET === 'default-secret-change-in-production') {
    console.warn('⚠️  WARNING: You are using a default JWT_SECRET!');
    console.warn('   This is insecure for production. Please change it immediately.');
  }

  if (validatedConfig.NODE_ENV === Environment.Production) {
    // Production-specific validations
    if (validatedConfig.JWT_SECRET.length < 32) {
      console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters in production');
    }

    if (!validatedConfig.LINE_CHANNEL_SECRET && validatedConfig.LINE_CHANNEL_ID) {
      console.warn('⚠️  WARNING: LINE_CHANNEL_ID is set but LINE_CHANNEL_SECRET is missing');
    }
  }

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach(error => {
      console.error(`  - ${error.property}: ${Object.values(error.constraints || {}).join(', ')}`);
    });
    throw new Error(`Environment validation failed: ${errors}`);
  }

  console.log('✅ Environment variables validated successfully');
  if (hasDatabaseUrl) {
    console.log('   Database: Using DATABASE_URL');
  } else {
    console.log(`   Database: ${validatedConfig.DB_HOST}:${validatedConfig.DB_PORT}/${validatedConfig.DB_DATABASE}`);
  }
  console.log(`   Environment: ${validatedConfig.NODE_ENV}`);
  console.log(`   Port: ${validatedConfig.PORT}`);

  return validatedConfig;
}

/**
 * Simple validation function for use in main.ts
 * Validates required environment variables before app startup
 */
export function validateEnvironment(): void {
  const requiredVars = [
    'DB_HOST',
    'DB_USERNAME',
    'DB_PASSWORD',
    'JWT_SECRET',
    'LINE_CHANNEL_ID',
    'LINE_CHANNEL_SECRET',
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_LIFF_ID',
  ];

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error('\n📝 Please check your .env file and ensure all required variables are set.\n');
    process.exit(1);
  }

  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('\n⚠️  WARNING: JWT_SECRET should be at least 32 characters for security.\n');
  }

  console.log('✅ Environment variables validated');
}

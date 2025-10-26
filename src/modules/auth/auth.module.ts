import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entity
import { User } from './entities/user.entity';
import { Staff } from '../staff/entities/staff.entity';
import { LineProfile } from './entities/line-profile.entity';
import { LineUser } from '../line-integration/entities/line-user.entity';

// Base auth
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

// Line auth
import { LineAuthController } from './controllers/line-auth.controller';
import { LineAuthService } from './services/line-auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Staff, LineProfile, LineUser]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret-change-in-production',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthController,
    LineAuthController
  ],
  providers: [
    AuthService,
    LineAuthService,
    JwtStrategy
  ],
  exports: [
    AuthService,
    LineAuthService,
    JwtStrategy
  ],
})
export class AuthModule {}

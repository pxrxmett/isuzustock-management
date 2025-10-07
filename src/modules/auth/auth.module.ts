import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entity
import { Staff } from '../staff/entities/staff.entity';
import { LineProfile } from './entities/line-profile.entity';
import { LineUser } from '../line-integration/entities/line-user.entity'; // เพิ่ม LineUser Entity

// Base auth
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

// Line auth
import { LineAuthController } from './controllers/line-auth.controller';
import { LineAuthService } from './services/line-auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff, LineProfile, LineUser]), // เพิ่ม LineUser Entity
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'stockManagement2024SecretKey', // ควรย้ายไปใน .env
      signOptions: { expiresIn: '1d' },
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

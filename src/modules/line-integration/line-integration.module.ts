import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LineIntegrationController } from './line-integration.controller';
import { LineIntegrationService } from './line-integration.service';
import { Staff } from '../staff/entities/staff.entity';
import { LineUser } from './entities/line-user.entity';
import { LineProfile } from '../auth/entities/line-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff, LineUser, LineProfile]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret-change-in-production',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [LineIntegrationController],
  providers: [LineIntegrationService],
  exports: [LineIntegrationService],
})
export class LineIntegrationModule {}

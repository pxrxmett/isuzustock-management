import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LineIntegrationController } from './line-integration.controller';
import { LineIntegrationService } from './line-integration.service';
import { Staff } from '../staff/entities/staff.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff]),
  ],
  controllers: [LineIntegrationController],
  providers: [LineIntegrationService],
  exports: [LineIntegrationService],
})
export class LineIntegrationModule {}

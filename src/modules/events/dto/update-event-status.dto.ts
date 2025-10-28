import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '../entities/event-status.enum';

export class UpdateEventStatusDto {
  @ApiProperty({
    enum: EventStatus,
    example: EventStatus.IN_PROGRESS,
    description: 'สถานะใหม่ของงาน'
  })
  @IsEnum(EventStatus)
  status: EventStatus;
}

import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional({
    description: 'Enable email notifications',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiPropertyOptional({
    description: 'Enable LINE notifications',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  line?: boolean;

  @ApiPropertyOptional({
    description: 'Notify on new queue',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  newQueue?: boolean;

  @ApiPropertyOptional({
    description: 'Notify on queue status changes',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  queueStatus?: boolean;

  @ApiPropertyOptional({
    description: 'Notify on events',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  events?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AdminLinkDto {
  @ApiProperty({
    description: 'LINE User ID จากตาราง line_users',
    example: 'U1234567890abcdef1234567890abcdef',
  })
  @IsNotEmpty()
  @IsString()
  lineUserId: string;

  @ApiProperty({
    description: 'Staff ID (UUID) จากตาราง staffs',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  staffId: string;
}

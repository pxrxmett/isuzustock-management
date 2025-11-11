import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class AdminLinkDto {
  @ApiProperty({
    description: 'LINE User ID จากตาราง line_users',
    example: 'U1234567890abcdef1234567890abcdef',
  })
  @IsNotEmpty()
  @IsString()
  lineUserId: string;

  @ApiProperty({
    description: 'Staff ID (number) จากตาราง staffs',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  staffId: number;
}

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkStaffLineDto {
  @ApiProperty({
    description: 'รหัสพนักงาน',
    example: 'S0001',
  })
  @IsNotEmpty()
  @IsString()
  staffCode: string;

  @ApiProperty({
    description: 'LINE User ID',
    example: 'U1234567890abcdef1234567890abcdef',
  })
  @IsNotEmpty()
  @IsString()
  lineUserId: string;

  @ApiProperty({
    description: 'LINE Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  @IsString()
  lineAccessToken: string;
}

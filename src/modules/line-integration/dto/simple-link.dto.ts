import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SimpleLinkDto {
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
    description: 'LINE Display Name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lineDisplayName?: string;

  @ApiProperty({
    description: 'LINE Picture URL',
    example: 'https://profile.line-scdn.net/...',
    required: false,
  })
  @IsOptional()
  @IsString()
  linePictureUrl?: string;
}

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckLineRegistrationDto {
  @ApiProperty({
    description: 'LINE User ID',
    example: 'U1234567890abcdef1234567890abcdef',
  })
  @IsNotEmpty()
  @IsString()
  lineUserId: string;
}

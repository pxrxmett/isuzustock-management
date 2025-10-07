// src/auth/dto/line-login.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LineLoginDto {
  @ApiProperty({
    description: 'LINE Access Token ที่ได้จาก LIFF',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'กรุณาระบุ LINE Access Token' })
  @IsString({ message: 'LINE Access Token ต้องเป็นข้อความ' })
  accessToken: string;
}

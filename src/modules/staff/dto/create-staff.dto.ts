// src/modules/staff/dto/create-staff.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ example: 'STAFF001' })
  @IsNotEmpty()
  @IsString()
  staff_code: string;

  @ApiProperty({ example: 'จอห์น' })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'โด' })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty({ example: 'พนักงานขาย' })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({ example: 'ฝ่ายขาย' })
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiProperty({ example: '0812345678' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

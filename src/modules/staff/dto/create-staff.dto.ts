import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  Matches,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StaffRole } from '../entities/staff.entity';

export class CreateStaffDto {
  @ApiProperty({
    description: 'รหัสพนักงาน (Format: แบรนด์ + เลข 3 หลัก เช่น ISU001, BYD001)',
    example: 'ISU001',
  })
  @IsString()
  @IsNotEmpty({ message: 'Employee code is required' })
  @Matches(/^[A-Z]{3}\d{3}$/, {
    message: 'Employee code must be in format: 3 uppercase letters + 3 digits (e.g., ISU001)',
  })
  employeeCode: string;

  @ApiProperty({
    description: 'ชื่อ-นามสกุลเต็ม (ภาษาไทย)',
    example: 'สมชาย ใจดี',
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @Length(2, 100, { message: 'Full name must be between 2 and 100 characters' })
  fullName: string;

  @ApiPropertyOptional({
    description: 'ชื่อ-นามสกุล (ภาษาอังกฤษ)',
    example: 'Somchai Jaidee',
  })
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'English name must be between 2 and 100 characters' })
  fullNameEn?: string;

  @ApiProperty({
    description: 'อีเมล (ต้อง unique ในระบบ)',
    example: 'somchai.j@noknguekotto.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'เบอร์โทรศัพท์',
    example: '0812345678',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^0[0-9]{8,9}$/, {
    message: 'Phone number must start with 0 and be 9-10 digits',
  })
  phone: string;

  @ApiPropertyOptional({
    description: 'บทบาทพนักงาน',
    enum: StaffRole,
    default: StaffRole.SALES,
    example: StaffRole.SALES,
  })
  @IsOptional()
  @IsEnum(StaffRole, { message: 'Role must be admin, manager, or sales' })
  role?: StaffRole;

  @ApiPropertyOptional({
    description: 'URL รูปโปรไฟล์',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  // Note: brandId จะถูก inject จาก URL path โดย Controller
  // ไม่ต้องรับจาก body เพื่อป้องกัน cross-brand attack
}

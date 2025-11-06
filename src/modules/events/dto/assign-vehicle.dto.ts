import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignVehicleDto {
  @ApiProperty({ example: 1, description: 'ID ของรถที่ต้องการเพิ่มเข้างาน' })
  @IsNumber()
  vehicleId: number;

  @ApiPropertyOptional({ example: 'uuid-of-staff', description: 'ผู้ที่ทำการ assign (Staff ID)' })
  @IsOptional()
  @IsUUID()
  assignedBy?: string;

  @ApiPropertyOptional({ example: 'รถคันนี้สำหรับแสดงหน้างาน', description: 'หมายเหตุ' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignMultipleVehiclesDto {
  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    description: 'รายการ IDs ของรถที่ต้องการเพิ่มเข้างาน'
  })
  @IsNumber({}, { each: true })
  vehicleIds: number[];

  @ApiPropertyOptional({ example: 'uuid-of-staff', description: 'ผู้ที่ทำการ assign (Staff ID)' })
  @IsOptional()
  @IsUUID()
  assignedBy?: string;

  @ApiPropertyOptional({ example: 'รถทั้งหมดสำหรับงานนี้', description: 'หมายเหตุ' })
  @IsOptional()
  @IsString()
  notes?: string;
}

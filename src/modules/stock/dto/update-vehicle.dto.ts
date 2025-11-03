import { IsOptional, IsString, IsNumber, IsDate, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateVehicleDto {
  @ApiPropertyOptional({
    description: 'Vehicle code (based on dealer code)',
    example: '20901-001',
  })
  @IsOptional()
  @IsString()
  vehicleCode?: string;

  @ApiPropertyOptional({
    description: 'Vehicle Identification Number',
    example: 'LGXC74C4XRG011819',
  })
  @IsOptional()
  @IsString()
  vinNumber?: string;

  @ApiPropertyOptional({
    description: 'Front motor number',
    example: 'TZ220XYE3G4116895',
  })
  @IsOptional()
  @IsString()
  frontMotor?: string;

  @ApiPropertyOptional({
    description: 'Battery serial number',
    example: '0NTPBVD6F334CVEBP6000072',
  })
  @IsOptional()
  @IsString()
  batteryNumber?: string;

  @ApiPropertyOptional({
    description: 'Vehicle model name',
    example: 'BYD DOLPHIN (435KM-STD)',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Vehicle color',
    example: 'WHITE',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Vehicle status',
    example: 'available',
    enum: ['available', 'unavailable', 'in_use', 'maintenance', 'locked_for_event'],
  })
  @IsOptional()
  @IsEnum(['available', 'unavailable', 'in_use', 'maintenance', 'locked_for_event'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Dealer code',
    example: '20901',
  })
  @IsOptional()
  @IsString()
  dealerCode?: string;

  @ApiPropertyOptional({
    description: 'Dealer name',
    example: 'Hornbill Motor Co., Ltd.',
  })
  @IsOptional()
  @IsString()
  dealerName?: string;

  @ApiPropertyOptional({
    description: 'Car type',
    example: 'Normal',
  })
  @IsOptional()
  @IsString()
  carType?: string;

  @ApiPropertyOptional({
    description: 'Allocation date',
    example: '2024-07-20',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  allocationDate?: Date;

  @ApiPropertyOptional({
    description: 'Vehicle price',
    example: 826000.00,
  })
  @IsOptional()
  @IsNumber()
  price?: number;
}

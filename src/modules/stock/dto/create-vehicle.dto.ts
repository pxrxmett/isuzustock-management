import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Vehicle code (based on dealer code)',
    example: '20901-001',
  })
  @IsNotEmpty()
  @IsString()
  vehicleCode: string;

  @ApiProperty({
    description: 'Dealer code',
    example: '20901',
  })
  @IsNotEmpty()
  @IsString()
  dealerCode: string;

  @ApiProperty({
    description: 'Dealer name',
    example: 'Hornbill Motor Co., Ltd. (Chiang Rai)',
  })
  @IsNotEmpty()
  @IsString()
  dealerName: string;

  @ApiProperty({
    description: 'Vehicle model name',
    example: 'BYD ATTO 3(480 km)',
  })
  @IsNotEmpty()
  @IsString()
  model: string;

  @ApiProperty({
    description: 'Vehicle Identification Number',
    example: '444444uuiu',
    required: false,
  })
  @IsOptional()
  @IsString()
  vinNumber?: string;

  @ApiProperty({
    description: 'Front motor number',
    example: 'ggg774152',
    required: false,
  })
  @IsOptional()
  @IsString()
  frontMotor?: string;

  @ApiProperty({
    description: 'Battery serial number',
    example: '0EYPBP48A31DAND9V2800030',
    required: false,
  })
  @IsOptional()
  @IsString()
  batteryNumber?: string;

  @ApiProperty({
    description: 'Vehicle color',
    example: 'black',
    required: false,
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({
    description: 'Car type',
    example: 'Normal',
    required: false,
  })
  @IsOptional()
  @IsString()
  carType?: string;

  @ApiProperty({
    description: 'Allocation date',
    example: '2024-07-20',
  })
  @IsNotEmpty()
  @Type(() => Date) // เพิ่ม Type transformer
  @IsDate()
  allocationDate: Date;

  @ApiProperty({
    description: 'Vehicle price',
    example: 825504.0,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Brand ID (1=ISUZU, 2=BYD)',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  brandId?: number;
}

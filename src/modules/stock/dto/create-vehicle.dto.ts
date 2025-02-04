import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  vehicleCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  model: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  vinNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  frontMotor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  batteryNumber?: string;
}

import { IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSystemSettingsDto {
  @ApiPropertyOptional({
    description: 'Language code',
    example: 'th',
    enum: ['th', 'en'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['th', 'en'])
  language?: string;

  @ApiPropertyOptional({
    description: 'Timezone',
    example: 'Asia/Bangkok',
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Date format',
    example: 'DD/MM/YYYY',
    enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'])
  dateFormat?: string;

  @ApiPropertyOptional({
    description: 'Dark mode enabled',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;
}

import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PdpaConsentDto {
  @ApiProperty({
    example: true,
    description: 'ยอมรับเงื่อนไข PDPA หรือไม่',
  })
  @IsBoolean()
  consent: boolean;
}

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitSignatureDto {
  @ApiProperty({
    example: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
    description: 'ข้อมูลลายเซ็นในรูปแบบ base64',
  })
  @IsString()
  @IsNotEmpty()
  signatureData: string;
}

// src/modules/stock/dto/upload-file.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Excel file (.xlsx, .xls) containing vehicle data',
    required: true,
  })
  @IsNotEmpty({ message: 'File is required' })
  file: Express.Multer.File;

  static validate(file: Express.Multer.File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'No file uploaded' };
    }

    // Check file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
      };
    }

    // Check file type
    const allowedMimes = [
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ];
    
    if (!allowedMimes.includes(file.mimetype)) {
      return { 
        isValid: false, 
        error: 'Only Excel files (.xlsx, .xls) are allowed' 
      };
    }

    // Check file extension
    const allowedExtensions = ['.xlsx', '.xls'];
    const ext = file.originalname.toLowerCase().slice(
      ((file.originalname.lastIndexOf('.') - 1) >>> 0) + 2
    );
    
    if (!allowedExtensions.includes(`.${ext}`)) {
      return { 
        isValid: false, 
        error: 'Invalid file extension. Only .xlsx and .xls files are allowed' 
      };
    }

    return { isValid: true };
  }
}

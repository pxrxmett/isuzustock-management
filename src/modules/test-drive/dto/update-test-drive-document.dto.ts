import { PartialType } from '@nestjs/swagger';
import { CreateTestDriveDocumentDto } from './create-test-drive-document.dto';

/**
 * DTO สำหรับอัปเดตเอกสารการทดลองขับ
 * ใช้ PartialType เพื่อให้ทุก field เป็น optional
 */
export class UpdateTestDriveDocumentDto extends PartialType(
  CreateTestDriveDocumentDto,
) {}

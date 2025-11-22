import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandTestDriveController } from './controllers/brand-test-drive.controller';
import { AdminTestDriveController } from './controllers/admin-test-drive.controller';
import { TestDriveController } from './controllers/test-drive.controller';
import { TestDriveService } from './services/test-drive.service';
import { TestDriveDocumentService } from './services/test-drive-document.service';
import { TestDrive } from './entities/test-drive.entity';
import { TestDriveDocument } from './entities/test-drive-document.entity';
import { Vehicle } from '../stock/entities/vehicle.entity';
import { Staff } from '../staff/entities/staff.entity';
import { BrandModule } from '../brand/brand.module';
import { StorageService } from '../../common/services/storage.service';
import { PDFGeneratorService } from '../../common/services/pdf-generator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestDrive, TestDriveDocument, Vehicle, Staff]),
    BrandModule,
  ],
  controllers: [
    BrandTestDriveController, // NEW: Path-based routing /:brandCode/test-drives
    AdminTestDriveController, // NEW: Admin cross-brand access /admin/test-drives
    TestDriveController, // OLD: Deprecated (kept for backward compatibility)
  ],
  providers: [
    TestDriveService,
    TestDriveDocumentService,
    StorageService,
    PDFGeneratorService,
  ],
  exports: [TestDriveService, TestDriveDocumentService],
})
export class TestDriveModule {}

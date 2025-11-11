import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { FileUpload } from './entities/file-upload.entity';
import { StockService } from './services/stock.service';
import { BrandStockController } from './controllers/brand-stock.controller';
import { AdminStockController } from './controllers/admin-stock.controller';
import { StockController } from './controllers/stock.controller'; // Keep old controller for backward compatibility (deprecated)
import { BrandModule } from '../brand/brand.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle, FileUpload]),
    BrandModule, // Import for BrandService and Brand entity
  ],
  controllers: [
    BrandStockController, // New: Path-based routing /:brandCode/stock
    AdminStockController, // New: Admin cross-brand /admin/stock
    StockController, // Old: Legacy /stock endpoint (deprecated, keep for backward compatibility)
  ],
  providers: [StockService],
  exports: [StockService], // Export for use in other modules (e.g., TestDrive, Events)
})
export class StockModule {}

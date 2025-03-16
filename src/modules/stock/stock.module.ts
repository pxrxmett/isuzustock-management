import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './controllers/stock.controller';
import { StockService } from './services/stock.service';
import { Vehicle } from './entities/vehicle.entity';
import { FileUpload } from './entities/file-upload.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, FileUpload])],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './controllers/stock.controller';
import { StockService } from './services/stock.service';
import { Vehicle } from './entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}

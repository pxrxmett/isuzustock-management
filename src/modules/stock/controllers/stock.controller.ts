// src/modules/stock/controllers/stock.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { StockService } from '../services/stock.service';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UploadFileDto } from '../dto/upload-file.dto';
import { Express } from 'express';

@ApiTags('stock')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    return await this.stockService.createVehicle(createVehicleDto);
  }

  @Get()
  async findAll() {
    return await this.stockService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.stockService.findOne(+id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadFileDto,
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.stockService.processExcelFile(file);
  }
}

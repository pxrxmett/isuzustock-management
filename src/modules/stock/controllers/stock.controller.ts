// @ts-nocheck
/**
 * TODO: THIS CONTROLLER IS DEPRECATED
 *
 * This controller has been replaced by:
 * - BrandStockController (src/modules/stock/controllers/brand-stock.controller.ts)
 * - AdminStockController (src/modules/stock/controllers/admin-stock.controller.ts)
 *
 * Kept for backward compatibility only.
 * Type checking temporarily disabled.
 * This file should be removed after migration is complete.
 */
// stock.controller.ts
import { 
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam 
} from '@nestjs/swagger';
import { StockService } from '../services/stock.service';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { UploadFileDto } from '../dto/upload-file.dto';
import { Express } from 'express';

@ApiTags('stock')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    return await this.stockService.createVehicle(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicles' })
  @ApiResponse({ status: 200, description: 'Return all vehicles.' })
  async findAll(@Query('brand') brand?: string) {
    // Support both brand ID (1, 2) and brand code (ISUZU, BYD)
    const brandId = brand ? (!isNaN(Number(brand)) ? Number(brand) : undefined) : undefined;
    return await this.stockService.findAll(brandId);
  }

  @Get('vehicles')
  @ApiOperation({ summary: 'Get vehicles with filters' })
  @ApiResponse({ status: 200, description: 'Return filtered vehicles.' })
  async getVehicles(
    @Query() query: {
      brand?: string;
      brandId?: number;
      carCard?: string;
      dlrId?: string;
      mdlCd?: string;
      type?: string;
      modelCode?: string;
      modelGeneral?: string;
      color?: string;
      engineNo?: string;
      chassisNo?: string;
      status?: string;
    }
  ) {
    return await this.stockService.getVehicles(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vehicle by id' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiResponse({ status: 200, description: 'Return the vehicle.' })
  @ApiResponse({ status: 404, description: 'Vehicle not found.' })
  async findOne(@Param('id') id: string) {
    return await this.stockService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle information' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiResponse({ status: 200, description: 'Vehicle updated successfully.' })
  @ApiResponse({ status: 404, description: 'Vehicle not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid data or vehicle locked.' })
  @ApiResponse({ status: 409, description: 'Conflict - VIN or Vehicle Code already exists.' })
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto
  ) {
    return await this.stockService.updateVehicle(+id, updateVehicleDto);
  }

  @Patch('vehicles/:id/status')
  @ApiOperation({ summary: 'Update vehicle status' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully.' })
  @ApiResponse({ status: 404, description: 'Vehicle not found.' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { status: string }
  ) {
    return await this.stockService.updateVehicleStatus(+id, updateStatusDto.status);
  }

  @Delete('vehicles/:id')
  @ApiOperation({ summary: 'Delete a vehicle' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiResponse({ status: 200, description: 'Vehicle deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Vehicle not found.' })
  async deleteVehicle(@Param('id') id: string) {
    return await this.stockService.deleteVehicle(+id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, callback) => {
      const validMimes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (!validMimes.includes(file.mimetype)) {
        return callback(
          new BadRequestException('รองรับเฉพาะไฟล์ Excel (.xlsx, .xls) เท่านั้น'),
          false
        );
      }

      const fileName = file.originalname || '';
      const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
      
      if (!fileExt || !['xlsx', 'xls'].includes(fileExt)) {
        return callback(
          new BadRequestException('รองรับเฉพาะไฟล์นามสกุล .xlsx และ .xls เท่านั้น'),
          false
        );
      }

      callback(null, true);
    }
  }))
  @ApiOperation({ summary: 'Upload vehicle data from Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadFileDto,
    description: 'Excel file containing vehicle data'
  })
  @ApiResponse({ status: 201, description: 'File successfully processed.' })
  @ApiResponse({ status: 400, description: 'Invalid file format.' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('กรุณาเลือกไฟล์ที่ต้องการอัพโหลด');
    }

    try {
      const result = await this.stockService.processExcelFile(file);
      return {
        status: 'success',
        message: 'อัพโหลดและประมวลผลไฟล์สำเร็จ',
        data: result
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'เกิดข้อผิดพลาดในการประมวลผลไฟล์'
      );
    }
  }
}

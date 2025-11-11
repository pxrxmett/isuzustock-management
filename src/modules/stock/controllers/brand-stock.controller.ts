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
  BadRequestException,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StockService } from '../services/stock.service';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { UploadFileDto } from '../dto/upload-file.dto';
import { Brand as BrandEntity } from '../../brand/entities/brand.entity';
import { BrandValidationGuard } from '../../../common/guards';
import { Brand } from '../../../common/decorators';
import { Express } from 'express';

/**
 * BrandStockController
 *
 * Path-based routing for vehicle/stock management scoped to a specific brand.
 * All operations are restricted to vehicles within the brand specified in the URL.
 *
 * Base path: /:brandCode/stock (e.g., /isuzu/stock, /byd/stock)
 *
 * Security:
 * - BrandValidationGuard validates brandCode and injects Brand entity
 * - brandId is forced from URL, never from request body
 * - All queries filtered by brandId automatically
 */
@ApiTags('Stock Management (Brand-Scoped)')
@Controller(':brandCode/stock')
@UseGuards(BrandValidationGuard)
export class BrandStockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @ApiOperation({
    summary: 'สร้างรถใหม่ในระบบ',
    description: 'เพิ่มรถเข้าสต็อกในแบรนด์ที่ระบุ (brandId จาก URL)',
  })
  @ApiParam({
    name: 'brandCode',
    description: 'รหัสแบรนด์ (isuzu, byd)',
    example: 'isuzu',
  })
  @ApiResponse({ status: 201, description: 'สร้างรถสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง' })
  @ApiResponse({ status: 404, description: 'ไม่พบแบรนด์' })
  @ApiResponse({ status: 409, description: 'รหัส VIN หรือรหัสรถซ้ำ' })
  async create(
    @Brand() brand: BrandEntity,
    @Body() createVehicleDto: CreateVehicleDto,
  ) {
    // Force brandId from URL (security: ignore body)
    return await this.stockService.createVehicle(createVehicleDto, brand.id);
  }

  @Get()
  @ApiOperation({
    summary: 'ดึงรายการรถทั้งหมดในแบรนด์',
    description: 'ดึงรายการรถที่อยู่ในสต็อกของแบรนด์ที่ระบุ',
  })
  @ApiParam({
    name: 'brandCode',
    description: 'รหัสแบรนด์',
    example: 'isuzu',
  })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบแบรนด์' })
  async findAll(@Brand() brand: BrandEntity) {
    return await this.stockService.findAll(brand.id);
  }

  @Get('vehicles')
  @ApiOperation({
    summary: 'ค้นหารถด้วยตัวกรอง',
    description: 'ค้นหารถในแบรนด์ด้วยเงื่อนไขต่างๆ',
  })
  @ApiParam({
    name: 'brandCode',
    description: 'รหัสแบรนด์',
    example: 'isuzu',
  })
  @ApiQuery({ name: 'carCard', required: false, description: 'เลขทะเบียนรถ' })
  @ApiQuery({ name: 'dlrId', required: false, description: 'รหัสดีลเลอร์' })
  @ApiQuery({ name: 'mdlCd', required: false, description: 'รหัสโมเดล' })
  @ApiQuery({ name: 'type', required: false, description: 'ประเภทรถ' })
  @ApiQuery({ name: 'modelCode', required: false, description: 'รหัสรุ่น' })
  @ApiQuery({ name: 'modelGeneral', required: false, description: 'ชื่อรุ่นทั่วไป' })
  @ApiQuery({ name: 'color', required: false, description: 'สี' })
  @ApiQuery({ name: 'engineNo', required: false, description: 'เลขเครื่องยนต์' })
  @ApiQuery({ name: 'chassisNo', required: false, description: 'เลขตัวถัง (VIN)' })
  @ApiQuery({ name: 'status', required: false, description: 'สถานะรถ' })
  @ApiResponse({ status: 200, description: 'ค้นหาสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบแบรนด์' })
  async getVehicles(
    @Brand() brand: BrandEntity,
    @Query()
    query: {
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
    },
  ) {
    // Force brandId from URL
    return await this.stockService.getVehicles({ ...query, brandId: brand.id });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ดึงข้อมูลรถตาม ID',
    description: 'ดึงข้อมูลรถตาม ID (ต้องอยู่ในแบรนด์เดียวกัน)',
  })
  @ApiParam({ name: 'brandCode', description: 'รหัสแบรนด์', example: 'isuzu' })
  @ApiParam({ name: 'id', description: 'รหัสรถ', example: 1 })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบรถ' })
  @ApiResponse({ status: 403, description: 'รถไม่ได้อยู่ในแบรนด์นี้' })
  async findOne(
    @Brand() brand: BrandEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.stockService.findOne(id, brand.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'อัปเดตข้อมูลรถ',
    description: 'แก้ไขข้อมูลรถ (ห้ามเปลี่ยนรถที่ล็อคสำหรับงาน)',
  })
  @ApiParam({ name: 'brandCode', description: 'รหัสแบรนด์', example: 'isuzu' })
  @ApiParam({ name: 'id', description: 'รหัสรถ', example: 1 })
  @ApiResponse({ status: 200, description: 'อัปเดตสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบรถ' })
  @ApiResponse({ status: 403, description: 'รถไม่ได้อยู่ในแบรนด์นี้' })
  @ApiResponse({ status: 400, description: 'รถถูกล็อคหรือข้อมูลไม่ถูกต้อง' })
  @ApiResponse({ status: 409, description: 'VIN หรือรหัสรถซ้ำ' })
  async update(
    @Brand() brand: BrandEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return await this.stockService.updateVehicle(id, updateVehicleDto, brand.id);
  }

  @Patch('vehicles/:id/status')
  @ApiOperation({
    summary: 'อัปเดตสถานะรถ',
    description: 'เปลี่ยนสถานะรถ (available, unavailable, in_use, maintenance, locked_for_event)',
  })
  @ApiParam({ name: 'brandCode', description: 'รหัสแบรนด์', example: 'isuzu' })
  @ApiParam({ name: 'id', description: 'รหัสรถ', example: 1 })
  @ApiResponse({ status: 200, description: 'อัปเดตสถานะสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบรถ' })
  @ApiResponse({ status: 403, description: 'รถไม่ได้อยู่ในแบรนด์นี้' })
  async updateStatus(
    @Brand() brand: BrandEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: { status: string },
  ) {
    return await this.stockService.updateVehicleStatus(
      id,
      updateStatusDto.status,
      brand.id,
    );
  }

  @Delete('vehicles/:id')
  @ApiOperation({
    summary: 'ลบรถ',
    description: 'ลบรถออกจากระบบ (ถาวร)',
  })
  @ApiParam({ name: 'brandCode', description: 'รหัสแบรนด์', example: 'isuzu' })
  @ApiParam({ name: 'id', description: 'รหัสรถ', example: 1 })
  @ApiResponse({ status: 200, description: 'ลบรถสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบรถ' })
  @ApiResponse({ status: 403, description: 'รถไม่ได้อยู่ในแบรนด์นี้' })
  async deleteVehicle(
    @Brand() brand: BrandEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.stockService.deleteVehicle(id, brand.id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, callback) => {
        const validMimes = [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        if (!validMimes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'รองรับเฉพาะไฟล์ Excel (.xlsx, .xls) เท่านั้น',
            ),
            false,
          );
        }

        const fileName = file.originalname || '';
        const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

        if (!fileExt || !['xlsx', 'xls'].includes(fileExt)) {
          return callback(
            new BadRequestException(
              'รองรับเฉพาะไฟล์นามสกุล .xlsx และ .xls เท่านั้น',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  @ApiOperation({
    summary: 'อัพโหลดข้อมูลรถจากไฟล์ Excel',
    description: 'นำเข้าข้อมูลรถจากไฟล์ Excel เข้าสู่แบรนด์ที่ระบุ',
  })
  @ApiParam({
    name: 'brandCode',
    description: 'รหัสแบรนด์',
    example: 'isuzu',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadFileDto,
    description: 'Excel file containing vehicle data',
  })
  @ApiResponse({ status: 201, description: 'ประมวลผลไฟล์สำเร็จ' })
  @ApiResponse({ status: 400, description: 'ไฟล์ไม่ถูกต้อง' })
  @ApiResponse({ status: 404, description: 'ไม่พบแบรนด์' })
  async uploadFile(
    @Brand() brand: BrandEntity,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('กรุณาเลือกไฟล์ที่ต้องการอัพโหลด');
    }

    try {
      // Force brandId from URL
      const result = await this.stockService.processExcelFile(file, brand.id);
      return {
        status: 'success',
        message: 'อัพโหลดและประมวลผลไฟล์สำเร็จ',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'เกิดข้อผิดพลาดในการประมวลผลไฟล์',
      );
    }
  }
}

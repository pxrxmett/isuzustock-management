import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StaffService, PaginatedResult } from '../staff.service';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { SearchStaffDto } from '../dto/search-staff.dto';
import { Staff } from '../entities/staff.entity';
import { Brand as BrandEntity } from '../../brand/entities/brand.entity';
import { BrandValidationGuard } from '../../../common/guards';
import { Brand } from '../../../common/decorators';

@ApiTags('Staff Management (Brand-Scoped)')
@Controller(':brandCode/staff')
@UseGuards(BrandValidationGuard)
export class BrandStaffController {
  constructor(private readonly staffService: StaffService) {}

  /**
   * สร้างพนักงานใหม่ในแบรนด์
   * POST /:brandCode/staff
   */
  @Post()
  @ApiOperation({
    summary: 'สร้างพนักงานใหม่',
    description: 'สร้างพนักงานใหม่ในแบรนด์ที่ระบุ (brandId จาก URL)',
  })
  @ApiParam({
    name: 'brandCode',
    description: 'รหัสแบรนด์ (isuzu, byd)',
    example: 'isuzu',
  })
  @ApiResponse({
    status: 201,
    description: 'สร้างพนักงานสำเร็จ',
    type: Staff,
  })
  @ApiResponse({ status: 404, description: 'ไม่พบแบรนด์' })
  @ApiResponse({ status: 409, description: 'รหัสพนักงานหรืออีเมลซ้ำ' })
  async create(
    @Brand() brand: BrandEntity,
    @Body() createStaffDto: CreateStaffDto,
  ): Promise<Staff> {
    // Brand is validated and injected by BrandValidationGuard
    // Create staff with forced brandId from URL (security: ignore body)
    return await this.staffService.create(createStaffDto, brand.id);
  }

  /**
   * ดึงรายการพนักงานทั้งหมดในแบรนด์ (พร้อม pagination และ filters)
   * GET /:brandCode/staff
   */
  @Get()
  @ApiOperation({
    summary: 'ดึงรายการพนักงาน',
    description: 'ดึงรายการพนักงานทั้งหมดในแบรนด์ พร้อม pagination และตัวกรอง',
  })
  @ApiParam({
    name: 'brandCode',
    description: 'รหัสแบรนด์',
    example: 'isuzu',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'manager', 'sales'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'on_leave'] })
  @ApiQuery({ name: 'search', required: false, description: 'ค้นหาชื่อ/อีเมล/รหัส' })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูลสำเร็จ',
  })
  @ApiResponse({ status: 404, description: 'ไม่พบแบรนด์' })
  async findAll(
    @Brand() brand: BrandEntity,
    @Query() searchDto: SearchStaffDto,
  ): Promise<PaginatedResult<Staff>> {
    return await this.staffService.findAll(brand.id, searchDto);
  }

  /**
   * ดึงข้อมูลพนักงานตาม ID
   * GET /:brandCode/staff/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'ดึงข้อมูลพนักงาน',
    description: 'ดึงข้อมูลพนักงานตาม ID (ต้องอยู่ในแบรนด์เดียวกัน)',
  })
  @ApiParam({ name: 'brandCode', description: 'รหัสแบรนด์', example: 'isuzu' })
  @ApiParam({ name: 'id', description: 'รหัสพนักงาน', example: 1 })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ', type: Staff })
  @ApiResponse({ status: 404, description: 'ไม่พบพนักงาน' })
  @ApiResponse({ status: 403, description: 'พนักงานไม่ได้อยู่ในแบรนด์นี้' })
  async findOne(
    @Brand() brand: BrandEntity,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Staff> {
    return await this.staffService.findOne(id, brand.id);
  }

  /**
   * อัปเดตข้อมูลพนักงาน
   * PATCH /:brandCode/staff/:id
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'อัปเดตข้อมูลพนักงาน',
    description: 'อัปเดตข้อมูลพนักงาน (ห้ามเปลี่ยน employeeCode)',
  })
  @ApiParam({ name: 'brandCode', description: 'รหัสแบรนด์', example: 'isuzu' })
  @ApiParam({ name: 'id', description: 'รหัสพนักงาน', example: 1 })
  @ApiResponse({ status: 200, description: 'อัปเดตสำเร็จ', type: Staff })
  @ApiResponse({ status: 404, description: 'ไม่พบพนักงาน' })
  @ApiResponse({ status: 403, description: 'พนักงานไม่ได้อยู่ในแบรนด์นี้' })
  @ApiResponse({ status: 409, description: 'อีเมลซ้ำ' })
  async update(
    @Brand() brand: BrandEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStaffDto: UpdateStaffDto,
  ): Promise<Staff> {
    return await this.staffService.update(id, updateStaffDto, brand.id);
  }

  /**
   * ลบพนักงาน (Soft delete - เปลี่ยน status เป็น inactive)
   * DELETE /:brandCode/staff/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'ลบพนักงาน',
    description: 'Soft delete: เปลี่ยน status เป็น inactive',
  })
  @ApiParam({ name: 'brandCode', description: 'รหัสแบรนด์', example: 'isuzu' })
  @ApiParam({ name: 'id', description: 'รหัสพนักงาน', example: 1 })
  @ApiResponse({ status: 200, description: 'ลบสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบพนักงาน' })
  @ApiResponse({ status: 403, description: 'พนักงานไม่ได้อยู่ในแบรนด์นี้' })
  async remove(
    @Brand() brand: BrandEntity,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return await this.staffService.remove(id, brand.id);
  }

  /**
   * ดึงรายชื่อพนักงานขายที่พร้อมงาน (สำหรับ dropdown)
   * GET /:brandCode/staff/available-sales
   */
  @Get('available-sales')
  @ApiOperation({
    summary: 'ดึงรายชื่อพนักงานขายที่พร้อมงาน',
    description: 'ดึงพนักงาน role=sales, status=active สำหรับ dropdown assign',
  })
  @ApiParam({ name: 'brandCode', description: 'รหัสแบรนด์', example: 'isuzu' })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูลสำเร็จ (เฉพาะ id, name, code)',
  })
  @ApiResponse({ status: 404, description: 'ไม่พบแบรนด์' })
  async getAvailableSales(@Brand() brand: BrandEntity): Promise<Partial<Staff>[]> {
    return await this.staffService.getAvailableSales(brand.id);
  }
}

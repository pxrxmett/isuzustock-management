import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('staffs')
@Controller('staffs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiOperation({ summary: 'สร้างข้อมูลพนักงาน' })
  @ApiResponse({ status: 201, description: 'สร้างข้อมูลพนักงานสำเร็จ' })
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @Get()
  @ApiOperation({ summary: 'ดูรายการพนักงานทั้งหมด' })
  @ApiResponse({ status: 200, description: 'แสดงรายการพนักงานทั้งหมด' })
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':identifier')
  @ApiOperation({ summary: 'ดูข้อมูลพนักงานตาม ID หรือ staffCode' })
  @ApiResponse({ status: 200, description: 'แสดงข้อมูลพนักงาน' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูลพนักงาน' })
  findOne(@Param('identifier') identifier: string) {
    console.log('📍 GET /api/staffs/:identifier');
    console.log('🔍 Identifier:', identifier);

    // ตรวจสอบว่าเป็น UUID หรือ staffCode
    // UUID format: 8-4-4-4-12 hexadecimal characters
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    if (isUUID) {
      console.log('✅ Detected UUID - Searching by ID');
      return this.staffService.findOne(identifier);
    } else {
      console.log('✅ Detected staffCode - Searching by code');
      return this.staffService.findByStaffCode(identifier);
    }
  }

  // เพิ่มเมธอดอื่นๆ เช่น update, delete ตามต้องการ
}

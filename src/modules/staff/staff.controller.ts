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

  @Get(':id')
  @ApiOperation({ summary: 'ดูข้อมูลพนักงานตาม ID' })
  @ApiResponse({ status: 200, description: 'แสดงข้อมูลพนักงาน' })
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  // เพิ่มเมธอดอื่นๆ เช่น update, delete ตามต้องการ
}

import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  // UseGuards, // Uncomment when authentication is ready
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StaffService, PaginatedResult } from '../staff.service';
import { SearchStaffDto } from '../dto/search-staff.dto';
import { Staff, StaffRole, StaffStatus } from '../entities/staff.entity';
// import { JwtAuthGuard, AdminGuard } from '../../../common/guards'; // Uncomment when ready

interface StaffSummaryByBrand {
  brandId: number;
  brandCode: string;
  brandName: string;
  total: number;
  active: number;
  inactive: number;
  onLeave: number;
  admins: number;
  managers: number;
  sales: number;
}

/**
 * AdminStaffController
 *
 * Cross-brand staff management endpoints for admin users only.
 *
 * Security:
 * - TODO: Uncomment @UseGuards(JwtAuthGuard, AdminGuard) when auth is fully implemented
 * - These endpoints should only be accessible to users with role='admin'
 * - Provides access to staff data across all brands
 */
@ApiTags('Admin - Staff Management (Cross-Brand)')
@ApiBearerAuth() // Document that these endpoints require authentication
@Controller('admin/staff')
// @UseGuards(JwtAuthGuard, AdminGuard) // TODO: Uncomment when auth is ready
export class AdminStaffController {
  constructor(private readonly staffService: StaffService) {}

  /**
   * ดึงรายการพนักงานทุกแบรนด์ (Admin only)
   * GET /admin/staff/all
   */
  @Get('all')
  @ApiOperation({
    summary: 'ดึงพนักงานทุกแบรนด์',
    description: 'ดึงรายการพนักงานทั้งหมดข้ามแบรนด์ (Admin only)',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'brandId', required: false, description: 'กรองตามแบรนด์' })
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'manager', 'sales'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'on_leave'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูลสำเร็จ',
  })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์ access (ต้องเป็น admin)' })
  async findAll(@Query() searchDto: SearchStaffDto): Promise<{
    data: Staff[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // TODO: Get all staff from all brands
    // For now, return placeholder
    // In real implementation, this should query without brandId filter
    return {
      data: [],
      total: 0,
      page: searchDto.page || 1,
      limit: searchDto.limit || 20,
      totalPages: 0,
    };
  }

  /**
   * สรุปจำนวนพนักงานแยกตามแบรนด์
   * GET /admin/staff/summary
   */
  @Get('summary')
  @ApiOperation({
    summary: 'สรุปพนักงานตามแบรนด์',
    description: 'สรุปจำนวนพนักงานแยกตามแบรนด์ (ISUZU vs BYD)',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูลสำเร็จ',
    schema: {
      example: {
        isuzu: {
          brandId: 1,
          brandCode: 'ISUZU',
          brandName: 'Isuzu',
          total: 5,
          active: 4,
          inactive: 0,
          onLeave: 1,
          admins: 1,
          managers: 1,
          sales: 3,
        },
        byd: {
          brandId: 2,
          brandCode: 'BYD',
          brandName: 'BYD',
          total: 4,
          active: 3,
          inactive: 1,
          onLeave: 0,
          admins: 0,
          managers: 1,
          sales: 3,
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์ access' })
  async getSummary(): Promise<{
    isuzu: StaffSummaryByBrand;
    byd: StaffSummaryByBrand;
  }> {
    // TODO: Implement actual summary from database
    // For now, return placeholder structure
    return {
      isuzu: {
        brandId: 1,
        brandCode: 'ISUZU',
        brandName: 'Isuzu',
        total: 0,
        active: 0,
        inactive: 0,
        onLeave: 0,
        admins: 0,
        managers: 0,
        sales: 0,
      },
      byd: {
        brandId: 2,
        brandCode: 'BYD',
        brandName: 'BYD',
        total: 0,
        active: 0,
        inactive: 0,
        onLeave: 0,
        admins: 0,
        managers: 0,
        sales: 0,
      },
    };
  }

  /**
   * ดึงสถิติประสิทธิภาพพนักงานทุกคน
   * GET /admin/staff/performance
   */
  @Get('performance')
  @ApiOperation({
    summary: 'สถิติประสิทธิภาพพนักงาน',
    description: 'ดึงสถิติ test drives และ events ของพนักงานทุกคน',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูลสำเร็จ',
    schema: {
      example: [
        {
          staffId: 1,
          fullName: 'สมชาย ใจดี',
          brandCode: 'ISUZU',
          totalTestDrives: 25,
          completedTestDrives: 20,
          pendingTestDrives: 5,
          eventsCoordinated: 3,
        },
      ],
    },
  })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์ access' })
  async getPerformance(): Promise<any[]> {
    // TODO: Implement actual performance metrics
    // Query from test_drives and events tables
    return [];
  }

  /**
   * ดึงพนักงานตาม ID (cross-brand)
   * GET /admin/staff/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'ดึงข้อมูลพนักงานตาม ID',
    description: 'ดึงข้อมูลพนักงานข้ามแบรนด์ (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'รหัสพนักงาน', example: 1 })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ', type: Staff })
  @ApiResponse({ status: 404, description: 'ไม่พบพนักงาน' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์ access' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Staff> {
    // TODO: Get staff without brand validation (admin can see all)
    // For now, this will throw error until we implement cross-brand query
    throw new Error('Not implemented yet. Use /:brandCode/staff/:id instead.');
  }
}

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
import { StockService } from '../services/stock.service';
// import { JwtAuthGuard, AdminGuard } from '../../../common/guards'; // Uncomment when ready

/**
 * AdminStockController
 *
 * Cross-brand vehicle/stock management endpoints for admin users only.
 *
 * Security:
 * - TODO: Uncomment @UseGuards(JwtAuthGuard, AdminGuard) when auth is fully implemented
 * - These endpoints should only be accessible to users with role='admin'
 * - Provides access to vehicle data across all brands
 */
@ApiTags('Admin - Stock Management (Cross-Brand)')
@ApiBearerAuth()
@Controller('admin/stock')
// @UseGuards(JwtAuthGuard, AdminGuard) // TODO: Uncomment when auth is ready
export class AdminStockController {
  constructor(private readonly stockService: StockService) {}

  @Get('all')
  @ApiOperation({
    summary: 'ดึงรายการรถทุกแบรนด์',
    description: 'ดึงรายการรถทั้งหมดข้ามแบรนด์ (Admin only)',
  })
  @ApiQuery({
    name: 'brandId',
    required: false,
    description: 'กรองตามแบรนด์',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูลสำเร็จ',
  })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์ access (ต้องเป็น admin)' })
  async findAll(@Query('brandId', ParseIntPipe) brandId?: number) {
    return await this.stockService.findAll(brandId);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'สรุปจำนวนรถแยกตามแบรนด์',
    description: 'สรุปสถิติรถแยกตามแบรนด์ (ISUZU vs BYD)',
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
          total: 150,
          available: 100,
          unavailable: 20,
          inUse: 15,
          maintenance: 10,
          lockedForEvent: 5,
          byModel: {
            'MU-X': 50,
            'D-MAX': 100,
          },
        },
        byd: {
          brandId: 2,
          brandCode: 'BYD',
          brandName: 'BYD',
          total: 80,
          available: 60,
          unavailable: 10,
          inUse: 5,
          maintenance: 3,
          lockedForEvent: 2,
          byModel: {
            'ATTO 3': 50,
            'DOLPHIN': 30,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์ access' })
  async getSummary(): Promise<{
    isuzu: any;
    byd: any;
  }> {
    return await this.stockService.getStockSummaryByBrand();
  }

  @Get('search')
  @ApiOperation({
    summary: 'ค้นหารถข้ามแบรนด์',
    description: 'ค้นหารถด้วยเงื่อนไขต่างๆ ข้ามทุกแบรนด์ (Admin only)',
  })
  @ApiQuery({ name: 'brandId', required: false, description: 'กรองตามแบรนด์' })
  @ApiQuery({ name: 'vehicleCode', required: false, description: 'รหัสรถ' })
  @ApiQuery({ name: 'vinNumber', required: false, description: 'เลขตัวถัง (VIN)' })
  @ApiQuery({ name: 'model', required: false, description: 'รุ่นรถ' })
  @ApiQuery({ name: 'color', required: false, description: 'สี' })
  @ApiQuery({ name: 'status', required: false, description: 'สถานะรถ' })
  @ApiQuery({ name: 'dealerCode', required: false, description: 'รหัสดีลเลอร์' })
  @ApiResponse({
    status: 200,
    description: 'ค้นหาสำเร็จ',
  })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์ access' })
  async search(
    @Query()
    query: {
      brandId?: number;
      vehicleCode?: string;
      vinNumber?: string;
      model?: string;
      color?: string;
      status?: string;
      dealerCode?: string;
    },
  ) {
    return await this.stockService.getVehicles(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ดึงข้อมูลรถตาม ID',
    description: 'ดึงข้อมูลรถข้ามแบรนด์ (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'รหัสรถ', example: 1 })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบรถ' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์ access' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    // Admin can access any vehicle regardless of brand
    return await this.stockService.findOne(id);
  }

  @Get('analytics/by-brand')
  @ApiOperation({
    summary: 'วิเคราะห์สต็อกแยกตามแบรนด์',
    description: 'ดึงข้อมูลวิเคราะห์สต็อกรถแยกตามแบรนด์',
  })
  @ApiResponse({
    status: 200,
    description: 'วิเคราะห์สำเร็จ',
    schema: {
      example: [
        {
          brandId: 1,
          brandCode: 'ISUZU',
          brandName: 'Isuzu',
          totalVehicles: 150,
          availableVehicles: 100,
          utilizationRate: 33.33,
          averagePrice: 850000,
          modelDistribution: {
            'MU-X': 50,
            'D-MAX': 100,
          },
        },
        {
          brandId: 2,
          brandCode: 'BYD',
          brandName: 'BYD',
          totalVehicles: 80,
          availableVehicles: 60,
          utilizationRate: 25.0,
          averagePrice: 1200000,
          modelDistribution: {
            'ATTO 3': 50,
            'DOLPHIN': 30,
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์ access' })
  async getAnalyticsByBrand() {
    return await this.stockService.getAnalyticsByBrand();
  }
}

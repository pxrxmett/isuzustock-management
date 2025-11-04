import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AnalyticsService } from '../services/analytics.service';
import { DashboardStatsDto } from '../dto/dashboard-stats.dto';
import { VehicleStatsDto } from '../dto/vehicle-stats.dto';
import { EventStatsDto } from '../dto/event-stats.dto';
import { TestDriveStatsDto } from '../dto/test-drive-stats.dto';
import { DateRangeDto } from '../dto/date-range.dto';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'ดึงสถิติทั้งหมดสำหรับ Dashboard / Get all statistics for dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'สถิติทั้งหมดสำหรับ Dashboard / Dashboard statistics',
    type: DashboardStatsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'ไม่ได้รับอนุญาต / Unauthorized',
  })
  async getDashboard(@Query() dateRange: DateRangeDto): Promise<DashboardStatsDto> {
    return await this.analyticsService.getDashboardStats(dateRange);
  }

  @Get('vehicles/statistics')
  @ApiOperation({
    summary: 'ดึงสถิติรถยนต์โดยละเอียด / Get detailed vehicle statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'สถิติรถยนต์ / Vehicle statistics',
    type: VehicleStatsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'ไม่ได้รับอนุญาต / Unauthorized',
  })
  async getVehicleStatistics(@Query() dateRange: DateRangeDto): Promise<VehicleStatsDto> {
    return await this.analyticsService.getVehicleStats(dateRange);
  }

  @Get('events/statistics')
  @ApiOperation({
    summary: 'ดึงสถิติงาน/อีเวนต์โดยละเอียด / Get detailed event statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'สถิติงาน/อีเวนต์ / Event statistics',
    type: EventStatsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'ไม่ได้รับอนุญาต / Unauthorized',
  })
  async getEventStatistics(@Query() dateRange: DateRangeDto): Promise<EventStatsDto> {
    return await this.analyticsService.getEventStats(dateRange);
  }

  @Get('test-drives/statistics')
  @ApiOperation({
    summary: 'ดึงสถิติทดลองขับโดยละเอียด / Get detailed test drive statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'สถิติทดลองขับ / Test drive statistics',
    type: TestDriveStatsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'ไม่ได้รับอนุญาต / Unauthorized',
  })
  async getTestDriveStatistics(@Query() dateRange: DateRangeDto): Promise<TestDriveStatsDto> {
    return await this.analyticsService.getTestDriveStats(dateRange);
  }
}

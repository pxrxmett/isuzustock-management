import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  StreamableFile,
  Header
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { TestDriveService } from '../services/test-drive.service';
import { SearchTestDriveDto } from '../dto/search-test-drive.dto';
import { ExportReportDto } from '../dto/export-report.dto';
// import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
// import { AdminGuard } from '../../../common/guards/admin.guard';

/**
 * Admin Test Drive Controller
 * Provides cross-brand access to test drive management for administrators
 *
 * Route: /admin/test-drives
 *
 * TODO: Uncomment guards when authentication is fully implemented
 * @UseGuards(JwtAuthGuard, AdminGuard)
 */
@ApiTags('Admin - Test Drive Management (Cross-Brand)')
@ApiBearerAuth()
@Controller('admin/test-drives')
// @UseGuards(JwtAuthGuard, AdminGuard) // TODO: Uncomment when auth is ready
export class AdminTestDriveController {
  constructor(private readonly testDriveService: TestDriveService) {}

  @Get('all')
  @ApiOperation({
    summary: 'ดูรายการทดลองขับทั้งหมด (ทุกแบรนด์)',
    description: 'ผู้ดูแลระบบสามารถดูข้อมูลทดลองขับจากทุกแบรนด์ได้'
  })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)' })
  @ApiQuery({
    name: 'brandId',
    required: false,
    description: 'กรองตาม Brand ID (1 = ISUZU, 2 = BYD)',
    type: Number
  })
  async findAll(
    @Query() searchDto: SearchTestDriveDto,
    @Query('brandId', new ParseIntPipe({ optional: true })) brandId?: number
  ) {
    return await this.testDriveService.findAll(searchDto, brandId);
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export รายงานการทดลองขับ',
    description: 'Export ข้อมูลเป็น Excel file (รองรับทุกแบรนด์)'
  })
  @ApiResponse({
    status: 200,
    description: 'Export สำเร็จ',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="test-drive-report.xlsx"')
  async exportReport(@Query() exportDto: ExportReportDto) {
    const stream = await this.testDriveService.exportReport(exportDto);
    return new StreamableFile(stream);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ดูรายละเอียดการทดลองขับ (ไม่จำกัดแบรนด์)',
    description: 'ผู้ดูแลระบบสามารถดูข้อมูลจากแบรนด์ใดก็ได้'
  })
  @ApiResponse({ status: 200, description: 'พบข้อมูล' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูล' })
  @ApiParam({ name: 'id', description: 'Test Drive ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.testDriveService.findOne(id);
  }
}

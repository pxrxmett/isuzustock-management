import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EventsService } from '../events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { SearchEventDto } from '../dto/search-event.dto';
import { AssignVehicleDto, AssignMultipleVehiclesDto } from '../dto/assign-vehicle.dto';
import { UpdateEventStatusDto } from '../dto/update-event-status.dto';
// import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
// import { AdminGuard } from '../../../common/guards/admin.guard';

/**
 * Admin Events Controller
 * Provides cross-brand access to event management for administrators
 *
 * Route: /admin/events
 *
 * TODO: Uncomment guards when authentication is fully implemented
 * @UseGuards(JwtAuthGuard, AdminGuard)
 */
@ApiTags('Admin - Event Management (Cross-Brand)')
@ApiBearerAuth()
@Controller('admin/events')
// @UseGuards(JwtAuthGuard, AdminGuard) // TODO: Uncomment when auth is ready
export class AdminEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({
    summary: 'สร้างงาน (Event) ใหม่ (Cross-Brand)',
    description: 'ผู้ดูแลระบบสามารถสร้างงานสำหรับแบรนด์ใดก็ได้'
  })
  @ApiResponse({ status: 201, description: 'สร้างงานสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)' })
  create(@Body() createEventDto: CreateEventDto) {
    // Admin can create events for any brand (brandId from body)
    return this.eventsService.create(createEventDto);
  }

  @Get('all')
  @ApiOperation({
    summary: 'ดึงรายการงานทั้งหมด (ทุกแบรนด์)',
    description: 'ผู้ดูแลระบบสามารถดูข้อมูลงานจากทุกแบรนด์ได้'
  })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)' })
  @ApiQuery({
    name: 'brandId',
    required: false,
    description: 'กรองตาม Brand ID (1 = ISUZU, 2 = BYD)',
    type: Number
  })
  findAll(
    @Query() searchDto: SearchEventDto,
    @Query('brandId', new ParseIntPipe({ optional: true })) brandId?: number
  ) {
    return this.eventsService.findAll(searchDto, brandId);
  }

  @Get('calendar/view')
  @ApiOperation({
    summary: 'ดึงข้อมูลงานสำหรับแสดงใน Calendar (Cross-Brand)',
    description: 'รองรับข้อมูลจากทุกแบรนด์'
  })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-01-01', description: 'วันเริ่มต้น (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-12-31', description: 'วันสิ้นสุด (YYYY-MM-DD)' })
  @ApiQuery({
    name: 'brandId',
    required: false,
    description: 'กรองตาม Brand ID (ถ้าไม่ระบุจะแสดงทุกแบรนด์)',
    type: Number
  })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)' })
  getCalendarEvents(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('brandId', new ParseIntPipe({ optional: true })) brandId?: number
  ) {
    return this.eventsService.getCalendarEvents(startDate, endDate, brandId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ดึงข้อมูลงานตาม ID (ไม่จำกัดแบรนด์)',
    description: 'ผู้ดูแลระบบสามารถดูข้อมูลจากแบรนด์ใดก็ได้'
  })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)' })
  @ApiResponse({ status: 404, description: 'ไม่พบงาน' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'แก้ไขข้อมูลงาน (Cross-Brand)',
    description: 'ผู้ดูแลระบบสามารถแก้ไขงานจากแบรนด์ใดก็ได้'
  })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 200, description: 'แก้ไขสำเร็จ' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)' })
  @ApiResponse({ status: 404, description: 'ไม่พบงาน' })
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'ลบงาน (Cross-Brand)',
    description: 'ผู้ดูแลระบบสามารถลบงานจากแบรนด์ใดก็ได้'
  })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 204, description: 'ลบสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ไม่สามารถลบงานที่กำลังดำเนินการ' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)' })
  @ApiResponse({ status: 404, description: 'ไม่พบงาน' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}

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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { SearchEventDto } from './dto/search-event.dto';
import { AssignVehicleDto, AssignMultipleVehiclesDto } from './dto/assign-vehicle.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('events')
@Controller('events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // 1. สร้าง Event ใหม่
  @Post()
  @ApiOperation({ summary: 'สร้างงาน (Event) ใหม่' })
  @ApiResponse({ status: 201, description: 'สร้างงานสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง' })
  @ApiResponse({ status: 401, description: 'ไม่ได้รับอนุญาต - ต้อง login' })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  // 2. ดึงรายการ Events ทั้งหมด (พร้อม filters)
  @Get()
  @ApiOperation({ summary: 'ดึงรายการงานทั้งหมด พร้อม filters และ pagination' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  findAll(@Query() searchDto: SearchEventDto) {
    return this.eventsService.findAll(searchDto);
  }

  // 3. ดึงข้อมูล Event ตาม ID
  @Get(':id')
  @ApiOperation({ summary: 'ดึงข้อมูลงานตาม ID' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบงาน' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  // 4. แก้ไข Event
  @Patch(':id')
  @ApiOperation({ summary: 'แก้ไขข้อมูลงาน' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 200, description: 'แก้ไขสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบงาน' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  // 5. ลบ Event
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ลบงาน' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 204, description: 'ลบสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ไม่สามารถลบงานที่กำลังดำเนินการ' })
  @ApiResponse({ status: 404, description: 'ไม่พบงาน' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  // 6. Assign รถเข้า Event
  @Post(':id/vehicles')
  @ApiOperation({ summary: 'เพิ่มรถเข้างาน (Assign vehicle to event)' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 201, description: 'เพิ่มรถสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบงานหรือไม่พบรถ' })
  @ApiResponse({ status: 409, description: 'รถถูก assign แล้วหรือถูกล็อคสำหรับงานอื่น' })
  assignVehicle(@Param('id') id: string, @Body() assignDto: AssignVehicleDto) {
    return this.eventsService.assignVehicle(id, assignDto);
  }

  // 7. Assign รถหลายคันเข้า Event
  @Post(':id/vehicles/batch')
  @ApiOperation({ summary: 'เพิ่มรถหลายคันเข้างานพร้อมกัน (Batch assign)' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Batch assign สำเร็จ (ดูรายละเอียดผลลัพธ์)' })
  assignMultipleVehicles(@Param('id') id: string, @Body() assignDto: AssignMultipleVehiclesDto) {
    return this.eventsService.assignMultipleVehicles(id, assignDto);
  }

  // 8. ลบรถออกจาก Event
  @Delete(':id/vehicles/:vehicleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ลบรถออกจากงาน (Unassign vehicle from event)' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiParam({ name: 'vehicleId', description: 'Vehicle ID (number)' })
  @ApiResponse({ status: 204, description: 'ลบรถออกสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบงานหรือไม่พบรถในงาน' })
  unassignVehicle(@Param('id') id: string, @Param('vehicleId') vehicleId: number) {
    return this.eventsService.unassignVehicle(id, vehicleId);
  }

  // 9. ดึงรถทั้งหมดใน Event
  @Get(':id/vehicles')
  @ApiOperation({ summary: 'ดึงรายการรถทั้งหมดในงาน' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบงาน' })
  getEventVehicles(@Param('id') id: string) {
    return this.eventsService.getEventVehicles(id);
  }

  // 10. เปลี่ยนสถานะ Event
  @Patch(':id/status')
  @ApiOperation({ summary: 'เปลี่ยนสถานะงาน' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 200, description: 'เปลี่ยนสถานะสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบงาน' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateEventStatusDto) {
    return this.eventsService.updateStatus(id, updateStatusDto);
  }

  // 11. ดึงข้อมูลสำหรับ Calendar view
  @Get('calendar/view')
  @ApiOperation({ summary: 'ดึงข้อมูลงานสำหรับแสดงใน Calendar (ในช่วงเวลาที่กำหนด)' })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-01-01', description: 'วันเริ่มต้น (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-12-31', description: 'วันสิ้นสุด (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  getCalendarEvents(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.eventsService.getCalendarEvents(startDate, endDate);
  }
}

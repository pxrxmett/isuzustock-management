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
import { EventsService } from '../events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { SearchEventDto } from '../dto/search-event.dto';
import { AssignVehicleDto, AssignMultipleVehiclesDto } from '../dto/assign-vehicle.dto';
import { UpdateEventStatusDto } from '../dto/update-event-status.dto';
import { BrandValidationGuard } from '../../../common/guards/brand-validation.guard';
import { Brand as BrandDecorator } from '../../../common/decorators/brand.decorator';
import { Brand } from '../../brand/entities/brand.entity';

/**
 * Brand-Scoped Events Controller
 * Handles event operations for a specific brand using path-based routing
 *
 * Route: /:brandCode/events
 * Example: /isuzu/events, /byd/events
 */
@ApiTags('Event Management (Brand-Scoped)')
@ApiBearerAuth()
@Controller(':brandCode/events')
@UseGuards(BrandValidationGuard)
export class BrandEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'สร้างงาน (Event) ใหม่' })
  @ApiResponse({ status: 201, description: 'สร้างงานสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง' })
  @ApiResponse({ status: 404, description: 'ไม่พบแบรนด์' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  create(
    @BrandDecorator() brand: Brand,
    @Body() createEventDto: CreateEventDto
  ) {
    // Force brandId from URL (security: ignore body)
    return this.eventsService.create(createEventDto, brand.id);
  }

  @Get()
  @ApiOperation({ summary: 'ดึงรายการงานทั้งหมด พร้อม filters และ pagination' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบแบรนด์' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  findAll(
    @BrandDecorator() brand: Brand,
    @Query() searchDto: SearchEventDto
  ) {
    // Force brandId from URL
    return this.eventsService.findAll(searchDto, brand.id);
  }

  @Get('calendar/view')
  @ApiOperation({ summary: 'ดึงข้อมูลงานสำหรับแสดงใน Calendar (ในช่วงเวลาที่กำหนด)' })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-01-01', description: 'วันเริ่มต้น (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-12-31', description: 'วันสิ้นสุด (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบแบรนด์' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  getCalendarEvents(
    @BrandDecorator() brand: Brand,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.eventsService.getCalendarEvents(startDate, endDate, brand.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดึงข้อมูลงานตาม ID' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 403, description: 'ข้อมูลไม่ได้เป็นของแบรนด์นี้' })
  @ApiResponse({ status: 404, description: 'ไม่พบงาน' })
  findOne(
    @BrandDecorator() brand: Brand,
    @Param('id') id: string
  ) {
    return this.eventsService.findOne(id, brand.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'แก้ไขข้อมูลงาน' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 200, description: 'แก้ไขสำเร็จ' })
  @ApiResponse({ status: 403, description: 'ข้อมูลไม่ได้เป็นของแบรนด์นี้' })
  @ApiResponse({ status: 404, description: 'ไม่พบงาน' })
  update(
    @BrandDecorator() brand: Brand,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto
  ) {
    return this.eventsService.update(id, updateEventDto, brand.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ลบงาน' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 204, description: 'ลบสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ไม่สามารถลบงานที่กำลังดำเนินการ' })
  @ApiResponse({ status: 403, description: 'ข้อมูลไม่ได้เป็นของแบรนด์นี้' })
  @ApiResponse({ status: 404, description: 'ไม่พบงาน' })
  remove(
    @BrandDecorator() brand: Brand,
    @Param('id') id: string
  ) {
    return this.eventsService.remove(id, brand.id);
  }

  @Post(':id/vehicles')
  @ApiOperation({ summary: 'เพิ่มรถเข้างาน (Assign vehicle to event)' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 201, description: 'เพิ่มรถสำเร็จ' })
  @ApiResponse({ status: 403, description: 'ข้อมูลไม่ได้เป็นของแบรนด์นี้' })
  @ApiResponse({ status: 404, description: 'ไม่พบงานหรือไม่พบรถ' })
  @ApiResponse({ status: 409, description: 'รถถูก assign แล้วหรือถูกล็อคสำหรับงานอื่น' })
  assignVehicle(
    @BrandDecorator() brand: Brand,
    @Param('id') id: string,
    @Body() assignDto: AssignVehicleDto
  ) {
    return this.eventsService.assignVehicle(id, assignDto, brand.id);
  }

  @Post(':id/vehicles/batch')
  @ApiOperation({ summary: 'เพิ่มรถหลายคันเข้างานพร้อมกัน (Batch assign)' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Batch assign สำเร็จ (ดูรายละเอียดผลลัพธ์)' })
  @ApiResponse({ status: 403, description: 'ข้อมูลไม่ได้เป็นของแบรนด์นี้' })
  assignMultipleVehicles(
    @BrandDecorator() brand: Brand,
    @Param('id') id: string,
    @Body() assignDto: AssignMultipleVehiclesDto
  ) {
    return this.eventsService.assignMultipleVehicles(id, assignDto, brand.id);
  }

  @Delete(':id/vehicles/:vehicleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ลบรถออกจากงาน (Unassign vehicle from event)' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiParam({ name: 'vehicleId', description: 'Vehicle ID (number)' })
  @ApiResponse({ status: 204, description: 'ลบรถออกสำเร็จ' })
  @ApiResponse({ status: 403, description: 'ข้อมูลไม่ได้เป็นของแบรนด์นี้' })
  @ApiResponse({ status: 404, description: 'ไม่พบงานหรือไม่พบรถในงาน' })
  unassignVehicle(
    @BrandDecorator() brand: Brand,
    @Param('id') id: string,
    @Param('vehicleId') vehicleId: number
  ) {
    return this.eventsService.unassignVehicle(id, vehicleId, brand.id);
  }

  @Get(':id/vehicles')
  @ApiOperation({ summary: 'ดึงรายการรถทั้งหมดในงาน' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 403, description: 'ข้อมูลไม่ได้เป็นของแบรนด์นี้' })
  @ApiResponse({ status: 404, description: 'ไม่พบงาน' })
  getEventVehicles(
    @BrandDecorator() brand: Brand,
    @Param('id') id: string
  ) {
    return this.eventsService.getEventVehicles(id, brand.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'เปลี่ยนสถานะงาน' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)' })
  @ApiResponse({ status: 200, description: 'เปลี่ยนสถานะสำเร็จ' })
  @ApiResponse({ status: 403, description: 'ข้อมูลไม่ได้เป็นของแบรนด์นี้' })
  @ApiResponse({ status: 404, description: 'ไม่พบงาน' })
  updateStatus(
    @BrandDecorator() brand: Brand,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateEventStatusDto
  ) {
    return this.eventsService.updateStatus(id, updateStatusDto, brand.id);
  }
}

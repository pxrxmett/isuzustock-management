import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { LineIntegrationService } from './line-integration.service';
import { CheckLineRegistrationDto } from './dto/check-line-registration.dto';
import { LinkStaffLineDto } from './dto/link-staff-line.dto';
import { SimpleLinkDto } from './dto/simple-link.dto';
import { AdminLinkDto } from './dto/admin-link.dto';

@ApiTags('line-integration')
@Controller('line-integration')
export class LineIntegrationController {
  constructor(private readonly lineIntegrationService: LineIntegrationService) {}

  @Post('check')
  @ApiOperation({ summary: 'ตรวจสอบการลงทะเบียน LINE' })
  @ApiResponse({ status: 200, description: 'ผลการตรวจสอบการลงทะเบียน LINE' })
  async checkLineRegistration(@Body(ValidationPipe) checkLineDto: CheckLineRegistrationDto) {
    return await this.lineIntegrationService.checkLineRegistration(checkLineDto);
  }

  @Post('link')
  @ApiOperation({ summary: 'เชื่อมโยง LINE กับพนักงาน (ต้องใช้ LINE Access Token)' })
  @ApiResponse({ status: 200, description: 'เชื่อมโยง LINE กับพนักงานสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูลพนักงาน' })
  @ApiResponse({ status: 409, description: 'LINE หรือพนักงานถูกเชื่อมโยงแล้ว' })
  async linkStaffLine(@Body(ValidationPipe) linkStaffDto: LinkStaffLineDto) {
    return await this.lineIntegrationService.linkLineToStaff(linkStaffDto);
  }

  @Post('link-simple')
  @ApiOperation({
    summary: 'เชื่อมโยง LINE กับพนักงานแบบง่าย (สำหรับ LIFF App)',
    description:
      'ใช้สำหรับเชื่อมโยง LINE กับพนักงานโดยใช้เฉพาะ staffCode และ lineUserId ' +
      'เหมาะสำหรับ LIFF App ที่มี LINE User ID อยู่แล้ว',
  })
  @ApiResponse({
    status: 200,
    description: 'เชื่อมโยงสำเร็จ พร้อม JWT token สำหรับ login',
  })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูลพนักงาน' })
  @ApiResponse({ status: 409, description: 'LINE หรือพนักงานถูกเชื่อมโยงแล้ว' })
  async linkStaffSimple(@Body(ValidationPipe) simpleLinkDto: SimpleLinkDto) {
    console.log('📍 POST /line-integration/link-simple');
    console.log('🔍 Staff Code:', simpleLinkDto.staffCode);
    console.log('🔍 LINE User ID:', simpleLinkDto.lineUserId);
    return await this.lineIntegrationService.linkStaffSimple(simpleLinkDto);
  }

  @Get('staff/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูข้อมูลพนักงาน' })
  @ApiResponse({ status: 200, description: 'ข้อมูลพนักงาน' })
  async getStaffById(@Param('id') id: string) {
    return await this.lineIntegrationService.getStaffById(id);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('pending-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[ADMIN] ดูรายการ LINE users ที่ยังไม่ได้เชื่อมโยงกับพนักงาน',
    description: 'สำหรับแอดมินเท่านั้น - ดูรายการ LINE users ที่ยังไม่ได้เชื่อมโยงกับพนักงาน',
  })
  @ApiResponse({
    status: 200,
    description: 'รายการ LINE users ที่รอเชื่อมโยง',
  })
  @ApiResponse({ status: 401, description: 'ไม่มีสิทธิ์เข้าถึง' })
  @ApiResponse({ status: 403, description: 'ไม่ใช่แอดมิน' })
  async getPendingUsers() {
    console.log('📍 GET /line-integration/pending-users [ADMIN]');
    return await this.lineIntegrationService.getPendingUsers();
  }

  @Get('linked-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[ADMIN] ดูรายการ LINE users ที่เชื่อมโยงกับพนักงานแล้ว',
    description: 'สำหรับแอดมินเท่านั้น - ดูรายการ LINE users พร้อมข้อมูลพนักงานที่เชื่อมโยง',
  })
  @ApiResponse({
    status: 200,
    description: 'รายการ LINE users ที่เชื่อมโยงแล้ว',
  })
  @ApiResponse({ status: 401, description: 'ไม่มีสิทธิ์เข้าถึง' })
  @ApiResponse({ status: 403, description: 'ไม่ใช่แอดมิน' })
  async getLinkedUsers() {
    console.log('📍 GET /line-integration/linked-users [ADMIN]');
    return await this.lineIntegrationService.getLinkedUsers();
  }

  @Post('admin-link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[ADMIN] เชื่อมโยง LINE user กับพนักงาน',
    description: 'สำหรับแอดมินเท่านั้น - เชื่อมโยง LINE user กับพนักงานโดยใช้ transaction',
  })
  @ApiResponse({
    status: 200,
    description: 'เชื่อมโยงสำเร็จ',
  })
  @ApiResponse({ status: 404, description: 'ไม่พบ LINE user หรือพนักงาน' })
  @ApiResponse({ status: 409, description: 'มีการเชื่อมโยงอยู่แล้ว' })
  @ApiResponse({ status: 401, description: 'ไม่มีสิทธิ์เข้าถึง' })
  @ApiResponse({ status: 403, description: 'ไม่ใช่แอดมิน' })
  async adminLinkUser(@Body(ValidationPipe) adminLinkDto: AdminLinkDto) {
    console.log('📍 POST /line-integration/admin-link [ADMIN]');
    console.log('🔍 LINE User ID:', adminLinkDto.lineUserId);
    console.log('🔍 Staff ID:', adminLinkDto.staffId);
    return await this.lineIntegrationService.adminLinkUser(adminLinkDto);
  }

  @Delete('unlink/:lineUserId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[ADMIN] ยกเลิกการเชื่อมโยง LINE user กับพนักงาน',
    description: 'สำหรับแอดมินเท่านั้น - ยกเลิกการเชื่อมโยง LINE user กับพนักงาน',
  })
  @ApiResponse({
    status: 200,
    description: 'ยกเลิกการเชื่อมโยงสำเร็จ',
  })
  @ApiResponse({ status: 404, description: 'ไม่พบ LINE user' })
  @ApiResponse({ status: 400, description: 'LINE user ยังไม่ได้เชื่อมโยง' })
  @ApiResponse({ status: 401, description: 'ไม่มีสิทธิ์เข้าถึง' })
  @ApiResponse({ status: 403, description: 'ไม่ใช่แอดมิน' })
  async unlinkUser(@Param('lineUserId') lineUserId: string) {
    console.log('📍 DELETE /line-integration/unlink/:lineUserId [ADMIN]');
    console.log('🔍 LINE User ID:', lineUserId);
    return await this.lineIntegrationService.unlinkUser(lineUserId);
  }
}

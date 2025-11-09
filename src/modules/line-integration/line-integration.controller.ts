import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LineIntegrationService } from './line-integration.service';
import { CheckLineRegistrationDto } from './dto/check-line-registration.dto';
import { LinkStaffLineDto } from './dto/link-staff-line.dto';
import { SimpleLinkDto } from './dto/simple-link.dto';

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
}

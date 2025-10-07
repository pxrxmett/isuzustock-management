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
  @ApiOperation({ summary: 'เชื่อมโยง LINE กับพนักงาน' })
  @ApiResponse({ status: 200, description: 'เชื่อมโยง LINE กับพนักงานสำเร็จ' })
  async linkStaffLine(@Body(ValidationPipe) linkStaffDto: LinkStaffLineDto) {
    return await this.lineIntegrationService.linkLineToStaff(linkStaffDto);
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

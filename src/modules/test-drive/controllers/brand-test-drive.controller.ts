import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam
} from '@nestjs/swagger';
import { TestDriveService } from '../services/test-drive.service';
import { CreateTestDriveDto } from '../dto/create-test-drive.dto';
import { UpdateTestDriveDto } from '../dto/update-test-drive.dto';
import { SearchTestDriveDto } from '../dto/search-test-drive.dto';
import { PdpaConsentDto } from '../dto/pdpa-consent.dto';
import { SubmitSignatureDto } from '../dto/submit-signature.dto';
import { BrandValidationGuard } from '../../../common/guards/brand-validation.guard';
import { Brand as BrandDecorator } from '../../../common/decorators/brand.decorator';
import { Brand } from '../../brand/entities/brand.entity';

/**
 * Brand-Scoped Test Drive Controller
 * Handles test drive operations for a specific brand using path-based routing
 *
 * Route: /:brandCode/test-drives
 * Example: /isuzu/test-drives, /byd/test-drives
 */
@ApiTags('Test Drive Management (Brand-Scoped)')
@ApiBearerAuth()
@Controller(':brandCode/test-drives')
@UseGuards(BrandValidationGuard)
export class BrandTestDriveController {
  constructor(private readonly testDriveService: TestDriveService) {}

  @Post()
  @ApiOperation({ summary: 'สร้างการจองทดลองขับใหม่' })
  @ApiResponse({ status: 201, description: 'สร้างการจองสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้องหรือรถไม่พร้อมให้บริการ' })
  @ApiResponse({ status: 404, description: 'ไม่พบแบรนด์' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  @ApiBody({ type: CreateTestDriveDto })
  async create(
    @BrandDecorator() brand: Brand,
    @Body() createDto: CreateTestDriveDto
  ) {
    // Force brandId from URL (security: ignore body)
    return await this.testDriveService.create(createDto, brand.id);
  }

  @Get()
  @ApiOperation({ summary: 'ค้นหารายการทดลองขับ' })
  @ApiResponse({ status: 200, description: 'ค้นหาสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบแบรนด์' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  async findAll(
    @BrandDecorator() brand: Brand,
    @Query() searchDto: SearchTestDriveDto
  ) {
    // Force brandId from URL
    return await this.testDriveService.findAll(searchDto, brand.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดการทดลองขับ' })
  @ApiResponse({ status: 200, description: 'พบข้อมูล' })
  @ApiResponse({ status: 403, description: 'ข้อมูลไม่ได้เป็นของแบรนด์นี้' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูล' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  @ApiParam({ name: 'id', description: 'Test Drive ID' })
  async findOne(
    @BrandDecorator() brand: Brand,
    @Param('id', ParseIntPipe) id: number
  ) {
    return await this.testDriveService.findOne(id, brand.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'แก้ไขการทดลองขับ' })
  @ApiResponse({ status: 200, description: 'แก้ไขสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ไม่สามารถแก้ไขได้ (สถานะไม่ถูกต้อง)' })
  @ApiResponse({ status: 403, description: 'ข้อมูลไม่ได้เป็นของแบรนด์นี้' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูล' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  @ApiParam({ name: 'id', description: 'Test Drive ID' })
  @ApiBody({ type: UpdateTestDriveDto })
  async update(
    @BrandDecorator() brand: Brand,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTestDriveDto
  ) {
    return await this.testDriveService.update(id, updateDto, brand.id);
  }

  @Post(':id/pdpa-consent')
  @ApiOperation({ summary: 'ยอมรับเงื่อนไข PDPA' })
  @ApiResponse({ status: 200, description: 'บันทึกการยอมรับ PDPA สำเร็จ' })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง' })
  @ApiResponse({ status: 403, description: 'ข้อมูลไม่ได้เป็นของแบรนด์นี้' })
  @ApiResponse({ status: 404, description: 'ไม่พบรายการทดลองขับ' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  @ApiParam({ name: 'id', description: 'Test Drive ID' })
  @ApiBody({ type: PdpaConsentDto })
  async submitPdpaConsent(
    @BrandDecorator() brand: Brand,
    @Param('id', ParseIntPipe) id: number,
    @Body() pdpaConsentDto: PdpaConsentDto,
  ) {
    return await this.testDriveService.submitPdpaConsent(
      id,
      pdpaConsentDto.consent,
      brand.id
    );
  }

  @Post(':id/signature')
  @ApiOperation({ summary: 'บันทึกลายเซ็น' })
  @ApiResponse({ status: 200, description: 'บันทึกลายเซ็นสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้องหรือยังไม่ได้ยอมรับ PDPA' })
  @ApiResponse({ status: 403, description: 'ข้อมูลไม่ได้เป็นของแบรนด์นี้' })
  @ApiResponse({ status: 404, description: 'ไม่พบรายการทดลองขับ' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  @ApiParam({ name: 'id', description: 'Test Drive ID' })
  @ApiBody({ type: SubmitSignatureDto })
  async submitSignature(
    @BrandDecorator() brand: Brand,
    @Param('id', ParseIntPipe) id: number,
    @Body() submitSignatureDto: SubmitSignatureDto,
  ) {
    return await this.testDriveService.submitSignature(
      id,
      submitSignatureDto.signatureData,
      brand.id
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ยกเลิกการทดลองขับ' })
  @ApiResponse({ status: 200, description: 'ยกเลิกสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ไม่สามารถยกเลิกได้ (สถานะไม่ถูกต้อง)' })
  @ApiResponse({ status: 403, description: 'ข้อมูลไม่ได้เป็นของแบรนด์นี้' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูล' })
  @ApiParam({ name: 'brandCode', description: 'Brand code (isuzu or byd)' })
  @ApiParam({ name: 'id', description: 'Test Drive ID' })
  async cancel(
    @BrandDecorator() brand: Brand,
    @Param('id', ParseIntPipe) id: number
  ) {
    return await this.testDriveService.cancel(id, brand.id);
  }
}

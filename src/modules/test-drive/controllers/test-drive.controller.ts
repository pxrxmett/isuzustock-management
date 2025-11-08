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
  ApiBody 
} from '@nestjs/swagger';
import { TestDriveService } from '../services/test-drive.service';
import { CreateTestDriveDto } from '../dto/create-test-drive.dto';
import { UpdateTestDriveDto } from '../dto/update-test-drive.dto';
import { SearchTestDriveDto } from '../dto/search-test-drive.dto';
import { PdpaConsentDto } from '../dto/pdpa-consent.dto';
import { SubmitSignatureDto } from '../dto/submit-signature.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Test Drive')
@ApiBearerAuth()
@Controller('test-drives')
@UseGuards(JwtAuthGuard)
export class TestDriveController {
  constructor(private readonly testDriveService: TestDriveService) {}

  @Post()
  @ApiOperation({ summary: 'สร้างการจองทดลองขับใหม่' })
  @ApiResponse({ status: 201, description: 'สร้างการจองสำเร็จ' })
  @ApiBody({ type: CreateTestDriveDto })
  create(@Body() createDto: CreateTestDriveDto) {
    return this.testDriveService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'ค้นหารายการทดลองขับ' })
  @ApiResponse({ status: 200, description: 'ค้นหาสำเร็จ' })
  findAll(@Query() searchDto: SearchTestDriveDto) {
    return this.testDriveService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดการทดลองขับ' })
  @ApiResponse({ status: 200, description: 'พบข้อมูล' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูล' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.testDriveService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'แก้ไขการทดลองขับ' })
  @ApiResponse({ status: 200, description: 'แก้ไขสำเร็จ' })
  @ApiBody({ type: UpdateTestDriveDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTestDriveDto
  ) {
    return this.testDriveService.update(id, updateDto);
  }

  @Post(':id/pdpa-consent')
  @ApiOperation({ summary: 'ยอมรับเงื่อนไข PDPA' })
  @ApiResponse({ status: 200, description: 'บันทึกการยอมรับ PDPA สำเร็จ' })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง' })
  @ApiResponse({ status: 404, description: 'ไม่พบรายการทดลองขับ' })
  @ApiBody({ type: PdpaConsentDto })
  submitPdpaConsent(
    @Param('id', ParseIntPipe) id: number,
    @Body() pdpaConsentDto: PdpaConsentDto,
  ) {
    console.log('📍 POST /api/test-drives/:id/pdpa-consent');
    console.log('🔍 Test Drive ID:', id);
    console.log('✅ Consent:', pdpaConsentDto.consent);
    return this.testDriveService.submitPdpaConsent(id, pdpaConsentDto.consent);
  }

  @Post(':id/signature')
  @ApiOperation({ summary: 'บันทึกลายเซ็น' })
  @ApiResponse({ status: 200, description: 'บันทึกลายเซ็นสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้องหรือยังไม่ได้ยอมรับ PDPA' })
  @ApiResponse({ status: 404, description: 'ไม่พบรายการทดลองขับ' })
  @ApiBody({ type: SubmitSignatureDto })
  submitSignature(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitSignatureDto: SubmitSignatureDto,
  ) {
    console.log('📍 POST /api/test-drives/:id/signature');
    console.log('🔍 Test Drive ID:', id);
    console.log('🖊️ Signature data length:', submitSignatureDto.signatureData.length);
    return this.testDriveService.submitSignature(id, submitSignatureDto.signatureData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ยกเลิกการทดลองขับ' })
  @ApiResponse({ status: 200, description: 'ยกเลิกสำเร็จ' })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.testDriveService.cancel(id);
  }
}

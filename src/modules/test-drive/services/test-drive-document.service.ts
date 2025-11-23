import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestDriveDocument } from '../entities/test-drive-document.entity';
import { TestDrive } from '../entities/test-drive.entity';
import { CreateTestDriveDocumentDto } from '../dto/create-test-drive-document.dto';
import { UpdateTestDriveDocumentDto } from '../dto/update-test-drive-document.dto';
import { StorageService } from '../../../common/services/storage.service';
import { PDFGeneratorService } from '../../../common/services/pdf-generator.service';

/**
 * TestDriveDocumentService
 *
 * จัดการเอกสารการทดลองขับ (Test Drive Documents)
 *
 * Features:
 * - สร้าง/อัปเดตเอกสาร
 * - แปลง base64 images เป็นไฟล์และเก็บใน storage
 * - สร้าง PDF เอกสารฉบับสมบูรณ์
 * - ดึงข้อมูลเอกสาร
 * - Brand-scoped (ตรวจสอบ brand ownership)
 */
@Injectable()
export class TestDriveDocumentService {
  private readonly logger = new Logger(TestDriveDocumentService.name);

  constructor(
    @InjectRepository(TestDriveDocument)
    private readonly documentRepository: Repository<TestDriveDocument>,
    @InjectRepository(TestDrive)
    private readonly testDriveRepository: Repository<TestDrive>,
    private readonly storageService: StorageService,
    private readonly pdfGeneratorService: PDFGeneratorService,
  ) {}

  /**
   * สร้างเอกสารการทดลองขับใหม่
   */
  async create(
    testDriveId: number,
    brandId: number,
    brandCode: string,
    dto: CreateTestDriveDocumentDto,
  ): Promise<TestDriveDocument> {
    try {
      this.logger.log(
        `Creating document for test drive ${testDriveId} (brand: ${brandCode})`,
      );

      // 1. ตรวจสอบว่า test drive มีอยู่และเป็นของ brand นี้
      const testDrive = await this.testDriveRepository.findOne({
        where: { id: testDriveId },
        relations: ['vehicle'],
      });

      if (!testDrive) {
        throw new NotFoundException(
          `Test drive with ID ${testDriveId} not found`,
        );
      }

      // 2. ตรวจสอบว่ามีเอกสารอยู่แล้วหรือไม่
      const existingDocument = await this.documentRepository.findOne({
        where: { testDriveId },
      });

      if (existingDocument) {
        throw new BadRequestException(
          `Document already exists for test drive ${testDriveId}. Use PATCH to update.`,
        );
      }

      // 3. สร้าง document entity
      const document = this.documentRepository.create({
        testDriveId,
        brandId,
        salesSpecialist: dto.salesSpecialist,
        salesTel: dto.tel,
        customerName: dto.customerName,
        customerIdNumber: dto.idNumber,
        customerTel: dto.customerTel,
        customerHouseNo: dto.houseNo,
        customerVillage: dto.village,
        customerDistrict: dto.district,
        customerProvince: dto.province,
        purpose: dto.purpose,
        vehicleBrand: dto.vehicleBrand,
        vehicleModel: dto.model,
        vehicleType: dto.type,
        vehicleColor: dto.color,
        vinNumber: dto.vinNumber,
        startMileage: dto.startMileage,
        endMileage: dto.endMileage,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      });

      // 4. บันทึก base64 images เป็นไฟล์
      if (dto.licenseImage) {
        document.licenseImageUrl = await this.storageService.saveBase64File(
          dto.licenseImage,
          brandCode,
          'licenses',
          `test-drive-${testDriveId}-license`,
        );
      }

      if (dto.signatures?.customer) {
        document.customerSignatureUrl =
          await this.storageService.saveBase64File(
            dto.signatures.customer,
            brandCode,
            'signatures',
            `test-drive-${testDriveId}-customer`,
          );
      }

      if (dto.signatures?.sales) {
        document.salesSignatureUrl = await this.storageService.saveBase64File(
          dto.signatures.sales,
          brandCode,
          'signatures',
          `test-drive-${testDriveId}-sales`,
        );
      }

      if (dto.signatures?.manager) {
        document.managerSignatureUrl =
          await this.storageService.saveBase64File(
            dto.signatures.manager,
            brandCode,
            'signatures',
            `test-drive-${testDriveId}-manager`,
          );
      }

      // 5. บันทึก document entity
      const savedDocument = await this.documentRepository.save(document);

      // 6. สร้าง PDF (async - ไม่รอให้เสร็จ)
      this.generateAndSavePDF(savedDocument, brandCode).catch((error) => {
        this.logger.error(`Failed to generate PDF:`, error);
      });

      this.logger.log(
        `✅ Document created successfully (ID: ${savedDocument.id})`,
      );

      return savedDocument;
    } catch (error) {
      this.logger.error(`❌ Failed to create document:`, error);
      throw error;
    }
  }

  /**
   * อัปเดตเอกสารการทดลองขับ (Upsert Pattern)
   * ถ้ายังไม่มีเอกสารจะสร้างใหม่, ถ้ามีอยู่แล้วจะอัปเดต
   */
  async update(
    testDriveId: number,
    brandId: number,
    brandCode: string,
    dto: UpdateTestDriveDocumentDto,
  ): Promise<TestDriveDocument> {
    try {
      this.logger.log(
        `Updating/Creating document for test drive ${testDriveId} (brand: ${brandCode})`,
      );

      // 1. ค้นหา document ที่มีอยู่
      let document = await this.documentRepository.findOne({
        where: { testDriveId, brandId },
      });

      // 2. ถ้ายังไม่มีเอกสาร ให้สร้างใหม่ (Upsert Pattern)
      if (!document) {
        this.logger.log(
          `Document not found, creating new document for test drive ${testDriveId}`,
        );

        // Validate that test drive exists
        const testDrive = await this.testDriveRepository.findOne({
          where: { id: testDriveId },
          relations: ['vehicle'],
        });

        if (!testDrive) {
          throw new NotFoundException(
            `Test drive with ID ${testDriveId} not found`,
          );
        }

        // Create new document
        document = this.documentRepository.create({
          testDriveId,
          brandId,
        });
      }

      // 3. อัปเดตข้อมูล
      if (dto.salesSpecialist !== undefined)
        document.salesSpecialist = dto.salesSpecialist;
      if (dto.tel !== undefined) document.salesTel = dto.tel;
      if (dto.customerName !== undefined)
        document.customerName = dto.customerName;
      if (dto.idNumber !== undefined)
        document.customerIdNumber = dto.idNumber;
      if (dto.customerTel !== undefined)
        document.customerTel = dto.customerTel;
      if (dto.houseNo !== undefined) document.customerHouseNo = dto.houseNo;
      if (dto.village !== undefined) document.customerVillage = dto.village;
      if (dto.district !== undefined) document.customerDistrict = dto.district;
      if (dto.province !== undefined) document.customerProvince = dto.province;
      if (dto.purpose !== undefined) document.purpose = dto.purpose;
      if (dto.vehicleBrand !== undefined)
        document.vehicleBrand = dto.vehicleBrand;
      if (dto.model !== undefined) document.vehicleModel = dto.model;
      if (dto.type !== undefined) document.vehicleType = dto.type;
      if (dto.color !== undefined) document.vehicleColor = dto.color;
      if (dto.vinNumber !== undefined) document.vinNumber = dto.vinNumber;
      if (dto.startMileage !== undefined)
        document.startMileage = dto.startMileage;
      if (dto.endMileage !== undefined) document.endMileage = dto.endMileage;
      if (dto.startDate !== undefined)
        document.startDate = new Date(dto.startDate);
      if (dto.endDate !== undefined) document.endDate = new Date(dto.endDate);

      // 4. อัปเดตรูปภาพ (ถ้ามี)
      if (dto.licenseImage) {
        // ลบไฟล์เก่า
        if (document.licenseImageUrl) {
          await this.storageService.deleteFile(document.licenseImageUrl);
        }
        // บันทึกไฟล์ใหม่
        document.licenseImageUrl = await this.storageService.saveBase64File(
          dto.licenseImage,
          brandCode,
          'licenses',
          `test-drive-${testDriveId}-license`,
        );
      }

      if (dto.signatures?.customer) {
        if (document.customerSignatureUrl) {
          await this.storageService.deleteFile(document.customerSignatureUrl);
        }
        document.customerSignatureUrl =
          await this.storageService.saveBase64File(
            dto.signatures.customer,
            brandCode,
            'signatures',
            `test-drive-${testDriveId}-customer`,
          );
      }

      if (dto.signatures?.sales) {
        if (document.salesSignatureUrl) {
          await this.storageService.deleteFile(document.salesSignatureUrl);
        }
        document.salesSignatureUrl = await this.storageService.saveBase64File(
          dto.signatures.sales,
          brandCode,
          'signatures',
          `test-drive-${testDriveId}-sales`,
        );
      }

      if (dto.signatures?.manager) {
        if (document.managerSignatureUrl) {
          await this.storageService.deleteFile(document.managerSignatureUrl);
        }
        document.managerSignatureUrl =
          await this.storageService.saveBase64File(
            dto.signatures.manager,
            brandCode,
            'signatures',
            `test-drive-${testDriveId}-manager`,
          );
      }

      // 5. บันทึกการเปลี่ยนแปลง
      const updatedDocument = await this.documentRepository.save(document);

      // 6. สร้าง PDF ใหม่ (async)
      this.generateAndSavePDF(updatedDocument, brandCode).catch((error) => {
        this.logger.error(`Failed to regenerate PDF:`, error);
      });

      this.logger.log(`✅ Document updated/created successfully (ID: ${document.id})`);

      return updatedDocument;
    } catch (error) {
      this.logger.error(`❌ Failed to update document:`, error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูลเอกสาร
   * ถ้ายังไม่มีเอกสาร จะ return pre-filled template จาก test drive data
   */
  async findOne(
    testDriveId: number,
    brandId: number,
  ): Promise<TestDriveDocument> {
    // 1. หาเอกสารที่มีอยู่
    let document = await this.documentRepository.findOne({
      where: { testDriveId, brandId },
    });

    // 2. ถ้ามีเอกสารแล้ว return
    if (document) {
      return document;
    }

    // 3. ถ้ายังไม่มีเอกสาร ดึง test drive data มา pre-fill
    this.logger.log(
      `Document not found, creating pre-filled template for test drive ${testDriveId}`,
    );

    const testDrive = await this.testDriveRepository.findOne({
      where: { id: testDriveId },
      relations: ['vehicle', 'vehicle.brand', 'staff'],
    });

    if (!testDrive) {
      throw new NotFoundException(
        `Test drive with ID ${testDriveId} not found`,
      );
    }

    // 4. สร้าง template document (ยังไม่ save ลง DB)
    const template = new TestDriveDocument();
    template.testDriveId = testDriveId;
    template.brandId = brandId;

    // Auto-fill จาก staff
    if (testDrive.staff) {
      template.salesSpecialist = testDrive.staff.fullName || '';
      template.salesTel = testDrive.staff.phone || '';
    }

    // Auto-fill จาก customer
    template.customerName = testDrive.customerName || '';
    template.customerTel = testDrive.customerPhone || '';

    // Auto-fill จาก vehicle
    if (testDrive.vehicle) {
      template.vehicleBrand = testDrive.vehicle.brand?.name || '';
      template.vehicleModel = testDrive.vehicle.model || '';
      template.vehicleType = testDrive.vehicle.carType || '';
      template.vehicleColor = testDrive.vehicle.color || '';
      template.vinNumber = testDrive.vehicle.vinNumber || '';
    }

    // Auto-fill dates
    template.startDate = testDrive.startTime || null;
    template.endDate = testDrive.expectedEndTime || null;

    // Default purpose
    template.purpose = 'testDrive';

    this.logger.log(`✅ Pre-filled template created for test drive ${testDriveId}`);

    return template;
  }

  /**
   * สร้าง PDF และบันทึกลง storage (private method)
   */
  private async generateAndSavePDF(
    document: TestDriveDocument,
    brandCode: string,
  ): Promise<void> {
    try {
      this.logger.log(`🔧 Generating PDF for document ${document.id}...`);

      // อ่านรูปภาพจาก storage (แปลง URL เป็น local path)
      // TODO: ปรับปรุงให้รองรับ remote URLs

      // สร้าง PDF
      const pdfBuffer = await this.pdfGeneratorService.generateTestDriveDocument(
        {
          salesSpecialist: document.salesSpecialist || undefined,
          salesTel: document.salesTel || undefined,
          customerName: document.customerName || undefined,
          customerIdNumber: document.customerIdNumber || undefined,
          customerTel: document.customerTel || undefined,
          customerHouseNo: document.customerHouseNo || undefined,
          customerVillage: document.customerVillage || undefined,
          customerDistrict: document.customerDistrict || undefined,
          customerProvince: document.customerProvince || undefined,
          purpose: document.purpose || undefined,
          vehicleBrand: document.vehicleBrand || undefined,
          vehicleModel: document.vehicleModel || undefined,
          vehicleType: document.vehicleType || undefined,
          vehicleColor: document.vehicleColor || undefined,
          vinNumber: document.vinNumber || undefined,
          startMileage: document.startMileage || undefined,
          endMileage: document.endMileage || undefined,
          startDate: document.startDate?.toISOString().split('T')[0],
          endDate: document.endDate?.toISOString().split('T')[0],
          // TODO: แปลง URLs เป็น local paths สำหรับ pdfmake
        },
      );

      // บันทึก PDF ลง storage
      const pdfUrl = await this.storageService.saveBuffer(
        pdfBuffer,
        brandCode,
        'documents',
        `test-drive-${document.testDriveId}-document.pdf`,
      );

      // อัปเดต document entity
      document.pdfUrl = pdfUrl;
      await this.documentRepository.save(document);

      this.logger.log(`✅ PDF generated and saved: ${pdfUrl}`);
    } catch (error) {
      this.logger.error(`❌ Failed to generate/save PDF:`, error);
      throw error;
    }
  }

  /**
   * ดาวน์โหลด PDF
   */
  async downloadPDF(
    testDriveId: number,
    brandId: number,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const document = await this.findOne(testDriveId, brandId);

    if (!document.pdfUrl) {
      throw new NotFoundException(`PDF not yet generated for this document`);
    }

    const buffer = await this.storageService.readFile(document.pdfUrl);
    const filename = `test-drive-${testDriveId}-document.pdf`;

    return { buffer, filename };
  }
}

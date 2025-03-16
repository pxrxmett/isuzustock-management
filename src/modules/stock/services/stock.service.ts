// stock.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { FileUpload } from '../entities/file-upload.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import * as ExcelJS from 'exceljs';
import { Express } from 'express';
import * as crypto from 'crypto';


type ExcelRow = {
  'No': string;
  'Dealer Code': string;
  'Dealer Name': string;
  'Model': string;
  'VIN No.': string;
  'Front Motor no.': string;
  'BATTERY No.': string;
  'COLOR': string;
  'Car Type': string;
  'Allocation Date': string;
  'Price': string;
};

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(FileUpload)
    private fileUploadRepository: Repository<FileUpload>,
  ) {}

  async createVehicle(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = this.vehicleRepository.create(createVehicleDto);
    return await this.vehicleRepository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return await this.vehicleRepository.find();
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle #${id} not found`);
    }
    return vehicle;
  }

  async getVehicles(filters: any) {
    const queryBuilder = this.vehicleRepository.createQueryBuilder('vehicle');

    if (filters.carCard) {
      queryBuilder.andWhere('vehicle.vehicleCode LIKE :carCard', {
        carCard: `%${filters.carCard}%`
      });
    }

    if (filters.dlrId) {
      queryBuilder.andWhere('vehicle.dealerCode LIKE :dlrId', {
        dlrId: `%${filters.dlrId}%`
      });
    }

    if (filters.mdlCd || filters.modelCode || filters.modelGeneral) {
      queryBuilder.andWhere('vehicle.model LIKE :model', {
        model: `%${filters.mdlCd || filters.modelCode || filters.modelGeneral}%`
      });
    }

    if (filters.type) {
      queryBuilder.andWhere('vehicle.carType LIKE :carType', {
        carType: `%${filters.type}%`
      });
    }

    if (filters.color) {
      queryBuilder.andWhere('vehicle.color LIKE :color', {
        color: `%${filters.color}%`
      });
    }

    if (filters.engineNo) {
      queryBuilder.andWhere('vehicle.frontMotor LIKE :frontMotor', {
        frontMotor: `%${filters.engineNo}%`
      });
    }

    if (filters.chassisNo) {
      queryBuilder.andWhere('vehicle.vinNumber LIKE :vinNumber', {
        vinNumber: `%${filters.chassisNo}%`
      });
    }

    if (filters.status) {
      const statusMap = {
        'พร้อมใช้งาน': 'available',
        'ไม่พร้อมใช้งาน': 'unavailable',
        'อยู่ในระหว่างการทดลองขับ': 'in_use'
      };
      queryBuilder.andWhere('vehicle.status = :status', {
        status: statusMap[filters.status] || filters.status
      });
    }

    const vehicles = await queryBuilder
      .orderBy('vehicle.createdAt', 'DESC')
      .getMany();

    return vehicles.map(vehicle => ({
      id: vehicle.id,
      carCard: vehicle.vehicleCode,
      dlrId: vehicle.dealerCode,
      mdlCd: vehicle.model,
      type: vehicle.carType || 'N/A',
      modelCode: vehicle.model,
      modelGeneral: vehicle.model,
      color: vehicle.color,
      engineNo: vehicle.frontMotor,
      chassisNo: vehicle.vinNumber,
      status: this.mapStatusToThai(vehicle.status)
    }));
  }

  private mapStatusToThai(status: string) {
    const statusMap = {
      'available': 'พร้อมใช้งาน',
      'unavailable': 'ไม่พร้อมใช้งาน',
      'in_use': 'อยู่ในระหว่างการทดลองขับ'
    };
    return statusMap[status] || status;
  }

  async updateVehicleStatus(id: number, newStatus: string) {
    const vehicle = await this.findOne(id);
    
    if (vehicle.status === 'in_use' && newStatus !== 'available') {
      throw new BadRequestException(
        'ไม่สามารถเปลี่ยนสถานะรถที่อยู่ระหว่างการทดลองขับได้'
      );
    }

    const statusMap = {
      'พร้อมใช้งาน': 'available',
      'ไม่พร้อมใช้งาน': 'unavailable',
      'อยู่ในระหว่างการทดลองขับ': 'in_use'
    };

    vehicle.status = statusMap[newStatus] || newStatus;
    return await this.vehicleRepository.save(vehicle);
  }

  async deleteVehicle(id: number) {
    const vehicle = await this.findOne(id);
    
    if (vehicle.status === 'in_use') {
      throw new BadRequestException(
        'ไม่สามารถลบรถที่อยู่ระหว่างการทดลองขับได้'
      );
    }

    return await this.vehicleRepository.remove(vehicle);
  }

  // เพิ่มฟังก์ชันใหม่สำหรับคำนวณ hash ของไฟล์
  private calculateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  // ตรวจสอบเฉพาะ VIN Number ที่ซ้ำกัน
  private async checkDuplicateVin(vinNumber: string): Promise<boolean> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { vinNumber }
    });
    return !!vehicle;
  }

  async processExcelFile(file: Express.Multer.File) {
    try {
      // คำนวณ hash ของไฟล์
      const fileHash = this.calculateFileHash(file.buffer);

      // ตรวจสอบไฟล์ซ้ำโดยใช้ hash
      const existingFile = await this.fileUploadRepository.findOne({
        where: { fileHash }
      });

      if (existingFile) {
        throw new ConflictException('ไฟล์นี้เคยอัพโหลดแล้ว ไม่สามารถอัพโหลดไฟล์ซ้ำได้');
      }

      // ตรวจสอบชื่อไฟล์ซ้ำ (ทางเลือกเพิ่มเติม)
      const existingFileByName = await this.fileUploadRepository.findOne({
        where: { fileName: file.originalname }
      });

      if (existingFileByName) {
        throw new ConflictException('มีไฟล์ชื่อนี้อยู่ในระบบแล้ว กรุณาเปลี่ยนชื่อไฟล์');
      }

      // สร้างบันทึกการอัพโหลดไฟล์ใหม่
      const fileUpload = this.fileUploadRepository.create({
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileHash: fileHash,
        isProcessed: false
      });

      await this.fileUploadRepository.save(fileUpload);

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer);
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        await this.updateFileUploadStatus(fileUpload.id, 0, ['Excel file does not contain any worksheets'], true);
        throw new BadRequestException('Excel file does not contain any worksheets');
      }

      const data: ExcelRow[] = [];
      const errors: string[] = [];
      const duplicateVins: string[] = [];

      // Get headers from first row
      const firstRow = worksheet.getRow(1);
      const headers = firstRow.values as string[];

      if (!headers || headers.length === 0) {
        await this.updateFileUploadStatus(fileUpload.id, 0, ['Excel file does not contain headers'], true);
        throw new BadRequestException('Excel file does not contain headers');
      }

      // Validate required headers
      const requiredHeaders = [
        'Dealer Code',
        'Dealer Name',
        'Model',
        'VIN No.',
        'COLOR'
      ];
      const missingHeaders = requiredHeaders.filter(
        header => !headers.includes(header)
      );

      if (missingHeaders.length > 0) {
        await this.updateFileUploadStatus(
          fileUpload.id,
          0,
          [`Missing required headers: ${missingHeaders.join(', ')}`],
          true
        );
        throw new BadRequestException(
          `Missing required headers: ${missingHeaders.join(', ')}`
        );
      }

      // Process each row
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row

        const rowData = {} as ExcelRow;
        let hasData = false;

        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber];
          if (header) {
            const value = cell.value?.toString().trim() || '';
            rowData[header as keyof ExcelRow] = value;
            if (value) hasData = true;
          }
        });

        if (hasData) {
          data.push(rowData);
        }
      });

      const results: Vehicle[] = [];
      for (const row of data) {
        try {
          // Validate required fields
          if (!row['Dealer Code']) {
            throw new Error(`Missing Dealer Code in row ${data.indexOf(row) + 2}`);
          }
          if (!row['Model']) {
            throw new Error(`Missing Model in row ${data.indexOf(row) + 2}`);
          }
          if (!row['VIN No.'] || row['VIN No.'].length !== 17) {
            throw new Error(`Invalid VIN Number in row ${data.indexOf(row) + 2}`);
          }

          // ตรวจสอบ VIN ซ้ำในฐานข้อมูล
          const isDuplicateVin = await this.checkDuplicateVin(row['VIN No.'].trim());
          if (isDuplicateVin) {
            duplicateVins.push(row['VIN No.'].trim());
            throw new Error(`VIN Number ${row['VIN No.'].trim()} already exists in database (row ${data.indexOf(row) + 2})`);
          }

          // Generate unique vehicleCode
          const lastVehicle = await this.vehicleRepository.findOne({
            where: { dealerCode: row['Dealer Code'] },
            order: { vehicleCode: 'DESC' }
          });

          let vehicleNumber = '001';
          if (lastVehicle) {
            const lastNumber = parseInt(lastVehicle.vehicleCode.split('-')[1]) || 0;
            vehicleNumber = (lastNumber + 1).toString().padStart(3, '0');
          }
          const vehicleCode = `${row['Dealer Code']}-${vehicleNumber}`;

          // Parse date and price safely
          let allocationDate = new Date();
          if (row['Allocation Date']) {
            allocationDate = new Date(row['Allocation Date']);
            if (isNaN(allocationDate.getTime())) {
              throw new Error(`Invalid Allocation Date in row ${data.indexOf(row) + 2}`);
            }
          }

          let price = 0;
          if (row['Price']) {
            const priceString = row['Price'].toString().replace(/[^0-9.]/g, '');
            price = parseFloat(priceString);
            if (isNaN(price)) {
              throw new Error(`Invalid Price in row ${data.indexOf(row) + 2}`);
            }
          }

          const vehicleDto: CreateVehicleDto = {
            vehicleCode,
            dealerCode: row['Dealer Code'].trim(),
            dealerName: row['Dealer Name']?.trim() || '',
            model: row['Model'].trim(),
            vinNumber: row['VIN No.'].trim(),
            color: row['COLOR']?.trim() || '',
            frontMotor: row['Front Motor no.']?.trim() || '',
            batteryNumber: row['BATTERY No.']?.trim() || '',
            carType: row['Car Type']?.trim() || '',
            allocationDate,
            price
          };

          const vehicle = await this.createVehicle(vehicleDto);
          results.push(vehicle);
        } catch (error) {
          errors.push(error.message);
        }
      }

      // อัพเดทผลลัพธ์ลงในเอนทิตี FileUpload
      await this.updateFileUploadStatus(
        fileUpload.id,
        results.length,
        errors.length > 0 ? errors : undefined,
        true
      );

      // หากพบ VIN ซ้ำเป็นจำนวนมาก ให้รวมข้อความแจ้งเตือน
      let duplicateVinMessage = '';
      if (duplicateVins.length > 0) {
        duplicateVinMessage = `\nพบ VIN Number ซ้ำในระบบ: ${
          duplicateVins.length > 10 
            ? `${duplicateVins.slice(0, 10).join(', ')} และอีก ${duplicateVins.length - 10} รายการ` 
            : duplicateVins.join(', ')
        }`;
      }

      return {
        totalRecords: data.length,
        processedRecords: results.length,
        success: results.length > 0,
        errors: errors.length > 0 ? errors : undefined,
        fileId: fileUpload.id,
        duplicateVinCount: duplicateVins.length,
        message: duplicateVins.length > 0 
          ? `นำเข้าข้อมูลสำเร็จ ${results.length} รายการ, ไม่สำเร็จ ${errors.length} รายการ${duplicateVinMessage}`
          : `นำเข้าข้อมูลสำเร็จ ${results.length} รายการ, ไม่สำเร็จ ${errors.length} รายการ`
      };
    } catch (error) {
      // จัดการกับข้อผิดพลาดที่เกิดจากการตรวจสอบไฟล์ซ้ำ
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to process Excel file: ${error.message}`
      );
    }
  }

  // เพิ่มฟังก์ชันสำหรับอัพเดทสถานะและข้อมูลการอัพโหลดไฟล์
  private async updateFileUploadStatus(
    fileId: number,
    recordsImported: number,
    importErrors?: string[],
    isProcessed: boolean = false
  ) {
    const fileUpload = await this.fileUploadRepository.findOne({
      where: { id: fileId }
    });

    if (fileUpload) {
      fileUpload.recordsImported = recordsImported;
      fileUpload.importErrors = importErrors ? JSON.stringify(importErrors) : null;
      fileUpload.isProcessed = isProcessed;
      
      if (isProcessed) {
        fileUpload.processedAt = new Date();
      }
      
      await this.fileUploadRepository.save(fileUpload);
    }
  }

  // เพิ่มฟังก์ชันสำหรับดูประวัติการอัพโหลดไฟล์
  async getFileUploadHistory(page: number = 1, limit: number = 10) {
    const [uploads, total] = await this.fileUploadRepository.findAndCount({
      order: { uploadedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      data: uploads.map(upload => ({
        id: upload.id,
        fileName: upload.fileName,
        fileSize: this.formatFileSize(upload.fileSize),
        uploadedAt: upload.uploadedAt,
        processedAt: upload.processedAt,
        status: upload.isProcessed ? 'ประมวลผลแล้ว' : 'รอการประมวลผล',
        recordsImported: upload.recordsImported,
        hasErrors: upload.importErrors !== null
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // ฟังก์ชันช่วยจัดรูปแบบขนาดไฟล์
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  // ฟังก์ชันดูรายละเอียดข้อผิดพลาดการอัพโหลด
  async getFileUploadErrors(fileId: number) {
    const fileUpload = await this.fileUploadRepository.findOne({
      where: { id: fileId }
    });

    if (!fileUpload) {
      throw new NotFoundException(`File upload #${fileId} not found`);
    }

    return {
      fileName: fileUpload.fileName,
      uploadedAt: fileUpload.uploadedAt,
      processedAt: fileUpload.processedAt,
      recordsImported: fileUpload.recordsImported,
      errors: fileUpload.importErrors ? JSON.parse(fileUpload.importErrors) : []
    };
  }
}

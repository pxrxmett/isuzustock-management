// src/modules/test-drive/services/test-drive.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TestDrive, TestDriveStatus } from '../entities/test-drive.entity';
import { Vehicle, VehicleStatus } from '../../stock/entities/vehicle.entity';
import { CreateTestDriveDto } from '../dto/create-test-drive.dto';
import { UpdateTestDriveDto } from '../dto/update-test-drive.dto';
import { SearchTestDriveDto } from '../dto/search-test-drive.dto';
import { ExportReportDto } from '../dto/export-report.dto';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';

@Injectable()
export class TestDriveService {
  constructor(
    @InjectRepository(TestDrive)
    private testDriveRepository: Repository<TestDrive>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createDto: CreateTestDriveDto) {
    // ตรวจสอบความพร้อมของรถ
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: createDto.vehicle_id },
    });

    if (!vehicle || vehicle.status !== VehicleStatus.AVAILABLE) {
      throw new BadRequestException('รถไม่พร้อมสำหรับการทดลองขับ');
    }

    // ตรวจสอบการจองซ้ำซ้อน
    const existingBooking = await this.testDriveRepository.findOne({
      where: {
        vehicle_id: createDto.vehicle_id,
        status: TestDriveStatus.PENDING,
        start_time: Between(createDto.start_time, createDto.expected_end_time)
      }
    });

    if (existingBooking) {
      throw new BadRequestException('มีการจองรถในช่วงเวลานี้แล้ว');
    }

    // สร้างการจองใหม่
    const testDrive = this.testDriveRepository.create({
      ...createDto,
      status: TestDriveStatus.PENDING
    });

    await this.vehicleRepository.update(vehicle.id, { 
      status: VehicleStatus.IN_USE 
    });

    return this.testDriveRepository.save(testDrive);
  }

  async findAll(searchDto: SearchTestDriveDto) {
    const query = this.testDriveRepository.createQueryBuilder('td')
      .leftJoinAndSelect('td.vehicle', 'vehicle');

    if (searchDto.customer_name) {
      query.andWhere('td.customer_name ILIKE :name', { 
        name: `%${searchDto.customer_name}%` 
      });
    }

    if (searchDto.customer_phone) {
      query.andWhere('td.customer_phone LIKE :phone', { 
        phone: `%${searchDto.customer_phone}%` 
      });
    }

    if (searchDto.vehicleCode) {
      query.andWhere('vehicle.vehicleCode LIKE :code', { 
        code: `%${searchDto.vehicleCode}%` 
      });
    }

    if (searchDto.status) {
      query.andWhere('td.status = :status', { 
        status: searchDto.status 
      });
    }

    if (searchDto.start_date && searchDto.end_date) {
      query.andWhere('td.start_time BETWEEN :startDate AND :endDate', {
        startDate: searchDto.start_date,
        endDate: searchDto.end_date
      });
    }

    return query.getMany();
  }

  async findOne(id: number) {
    const testDrive = await this.testDriveRepository.findOne({
      where: { id },
      relations: ['vehicle']
    });

    if (!testDrive) {
      throw new NotFoundException('ไม่พบรายการทดลองขับ');
    }

    return testDrive;
  }

  async update(id: number, updateDto: UpdateTestDriveDto) {
    const testDrive = await this.findOne(id);

    if (testDrive.status !== TestDriveStatus.PENDING) {
      throw new BadRequestException('ไม่สามารถแก้ไขรายการที่ไม่ได้อยู่ในสถานะรอดำเนินการ');
    }

    if (updateDto.status === TestDriveStatus.COMPLETED) {
      await this.vehicleRepository.update(testDrive.vehicle_id, {
        status: VehicleStatus.AVAILABLE
      });
    }

    Object.assign(testDrive, updateDto);
    return this.testDriveRepository.save(testDrive);
  }

  async cancel(id: number) {
    const testDrive = await this.findOne(id);

    if (testDrive.status !== TestDriveStatus.PENDING) {
      throw new BadRequestException('ไม่สามารถยกเลิกรายการที่ไม่ได้อยู่ในสถานะรอดำเนินการ');
    }

    // อัพเดทสถานะรถให้กลับมาพร้อมใช้งาน
    await this.vehicleRepository.update(testDrive.vehicle_id, {
      status: VehicleStatus.AVAILABLE
    });

    testDrive.status = TestDriveStatus.CANCELLED;
    return this.testDriveRepository.save(testDrive);
  }

  async exportReport(exportDto: ExportReportDto) {
    const testDrives = await this.findAll(exportDto);
    
    // แปลงข้อมูลสำหรับ Excel
    const reportData = testDrives.map(td => ({
      'หมายเลขการจอง': td.id,
      'วันและเวลา': new Date(td.start_time).toLocaleString('th-TH'),
      'ลูกค้า': td.customer_name,
      'เบอร์โทร': td.customer_phone,
      'รถทดสอบ': `${td.vehicle.model} (${td.vehicle.vehicleCode})`,
      'ระยะเวลา': `${td.duration} นาที`,
      'สถานะ': this.getStatusText(td.status)
    }));

    // สร้าง Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);

    // ปรับความกว้างคอลัมน์
    const colWidths = [
      { wch: 15 }, // หมายเลขการจอง
      { wch: 20 }, // วันและเวลา
      { wch: 30 }, // ลูกค้า
      { wch: 15 }, // เบอร์โทร
      { wch: 30 }, // รถทดสอบ
      { wch: 15 }, // ระยะเวลา
      { wch: 15 }  // สถานะ
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'รายงานการทดลองขับ');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    return stream;
  }

  private getStatusText(status: TestDriveStatus): string {
    const statusMap = {
      [TestDriveStatus.PENDING]: 'รอดำเนินการ',
      [TestDriveStatus.ONGOING]: 'กำลังทดลองขับ',
      [TestDriveStatus.COMPLETED]: 'เสร็จสิ้น',
      [TestDriveStatus.CANCELLED]: 'ยกเลิก'
    };
    return statusMap[status];
  }
}

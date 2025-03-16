import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TestDrive, TestDriveStatus } from '../entities/test-drive.entity';
import { Vehicle, VehicleStatus } from '../../stock/entities/vehicle.entity';
import { Staff } from '../../staff/entities/staff.entity';
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
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
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
      .leftJoinAndSelect('td.vehicle', 'vehicle')
      .leftJoinAndSelect('td.staff', 'staff')
      .select([
        'td',
        'vehicle',
        'staff.id',
        'staff.first_name',
        'staff.last_name'
      ]);

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

    const testDrives = await query.getMany();

    return testDrives.map(td => ({
      id: td.id,
      start_time: td.start_time,
      created_at: td.created_at,
      customer_name: td.customer_name,
      customer_phone: td.customer_phone,
      duration: td.duration,
      status: td.status,
      staff_name: td.staff ? `${td.staff.first_name} ${td.staff.last_name}` : null,
      vehicle: td.vehicle
    }));
  }

  async findOne(id: number) {
    const testDrive = await this.testDriveRepository.findOne({
      where: { id },
      relations: ['vehicle', 'staff'],
      select: {
        staff: {
          id: true,
          first_name: true,
          last_name: true
        }
      }
    });

    if (!testDrive) {
      throw new NotFoundException('ไม่พบรายการทดลองขับ');
    }

    return {
      ...testDrive,
      staff_name: testDrive.staff ? 
        `${testDrive.staff.first_name} ${testDrive.staff.last_name}` : 
        null
    };
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

    await this.vehicleRepository.update(testDrive.vehicle_id, {
      status: VehicleStatus.AVAILABLE
    });

    testDrive.status = TestDriveStatus.CANCELLED;
    return this.testDriveRepository.save(testDrive);
  }

  async exportReport(exportDto: ExportReportDto) {
    const testDrives = await this.findAll(exportDto);
    
    const reportData = testDrives.map(td => ({
      'หมายเลขการจอง': td.id,
      'วันและเวลา': new Date(td.start_time).toLocaleString('th-TH'),
      'พนักงานขาย': td.staff_name || 'ไม่ระบุ',
      'ลูกค้า': td.customer_name,
      'เบอร์โทร': td.customer_phone,
      'รถทดสอบ': `${td.vehicle.model} (${td.vehicle.vehicleCode})`,
      'ระยะเวลา': `${td.duration} นาที`,
      'สถานะ': this.getStatusText(td.status)
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);

    const colWidths = [
      { wch: 15 }, // หมายเลขการจอง
      { wch: 20 }, // วันและเวลา
      { wch: 20 }, // พนักงานขาย
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

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TestDrive } from '../entities/test-drive.entity';
import { TestDriveStatus } from '../entities/test-drive-status.enum'; // แก้ไขการนำเข้า TestDriveStatus
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
      where: { id: createDto.vehicle_id }, // ใช้ snake_case ตาม DTO
    });

    if (!vehicle || vehicle.status !== VehicleStatus.AVAILABLE) {
      throw new BadRequestException('รถไม่พร้อมสำหรับการทดลองขับ');
    }

    // ตรวจสอบการจองซ้ำซ้อน
    const existingBooking = await this.testDriveRepository.findOne({
      where: {
        vehicleId: createDto.vehicle_id, // แปลงจาก snake_case เป็น camelCase เมื่อใช้กับ entity
        status: TestDriveStatus.PENDING,
        startTime: Between(createDto.start_time, createDto.expected_end_time) // แปลงจาก snake_case เป็น camelCase เมื่อใช้กับ entity
      }
    });

    if (existingBooking) {
      throw new BadRequestException('มีการจองรถในช่วงเวลานี้แล้ว');
    }

    // สร้างการจองใหม่
    const testDriveData = {
      vehicleId: createDto.vehicle_id,
      customerName: createDto.customer_name,
      customerPhone: createDto.customer_phone,
      startTime: createDto.start_time,
      expectedEndTime: createDto.expected_end_time,
      actualEndTime: createDto.actual_end_time,
      testRoute: createDto.test_route,
      distance: createDto.distance,
      duration: createDto.duration,
      responsibleStaffId: String(createDto.responsible_staff), // แปลงเป็น string
      status: createDto.status || TestDriveStatus.PENDING
    };

    const testDrive = this.testDriveRepository.create(testDriveData);

    await this.vehicleRepository.update(vehicle.id, { 
      status: VehicleStatus.IN_USE 
    });

    return this.testDriveRepository.save(testDrive);
  }

  async findAll(searchDto: SearchTestDriveDto) {
    const query = this.testDriveRepository.createQueryBuilder('td')
      .leftJoinAndSelect('td.vehicle', 'vehicle')
      .leftJoinAndSelect('td.staff', 'staff');

    if (searchDto.customer_name) { // ใช้ snake_case ตาม DTO
      query.andWhere('td.customerName ILIKE :name', { // ใช้ camelCase ตาม entity
        name: `%${searchDto.customer_name}%` 
      });
    }

    if (searchDto.customer_phone) { // ใช้ snake_case ตาม DTO
      query.andWhere('td.customerPhone LIKE :phone', { // ใช้ camelCase ตาม entity
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

    if (searchDto.start_date && searchDto.end_date) { // ใช้ snake_case ตาม DTO
      query.andWhere('td.startTime BETWEEN :startDate AND :endDate', {
        startDate: searchDto.start_date,
        endDate: searchDto.end_date
      });
    }

    const testDrives = await query.getMany();

    return testDrives.map(td => ({
      id: td.id,
      start_time: td.startTime, // แปลงจาก camelCase เป็น snake_case เมื่อส่งกลับ API
      created_at: td.createdAt,
      customer_name: td.customerName,
      customer_phone: td.customerPhone,
      duration: td.duration,
      status: td.status,
      staff_name: td.staff ? `${td.staff.firstName} ${td.staff.lastName}` : null,
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
          firstName: true,
          lastName: true
        }
      }
    });

    if (!testDrive) {
      throw new NotFoundException('ไม่พบรายการทดลองขับ');
    }

    // Calculate can_edit based on signature date
    let canEdit = true;
    if (testDrive.signedAt) {
      const signedDate = new Date(testDrive.signedAt).toDateString();
      const today = new Date().toDateString();
      canEdit = signedDate === today;
    }

    return {
      ...testDrive,
      staff_name: testDrive.staff ?
        `${testDrive.staff.firstName} ${testDrive.staff.lastName}` :
        null,
      can_edit: canEdit,
    };
  }

  async update(id: number, updateDto: UpdateTestDriveDto) {
    const testDrive = await this.findOne(id);

    if (testDrive.status !== TestDriveStatus.PENDING) {
      throw new BadRequestException('ไม่สามารถแก้ไขรายการที่ไม่ได้อยู่ในสถานะรอดำเนินการ');
    }

    if (updateDto.status === TestDriveStatus.COMPLETED) {
      await this.vehicleRepository.update(testDrive.vehicleId, {
        status: VehicleStatus.AVAILABLE
      });
    }

    // แปลงจาก snake_case ใน DTO เป็น camelCase ใน entity
    const entityToUpdate = {};

    if (updateDto.customer_name) entityToUpdate['customerName'] = updateDto.customer_name;
    if (updateDto.customer_phone) entityToUpdate['customerPhone'] = updateDto.customer_phone;
    if (updateDto.customer_license_number) entityToUpdate['customerLicenseNumber'] = updateDto.customer_license_number;
    if (updateDto.notes !== undefined) entityToUpdate['notes'] = updateDto.notes;
    if (updateDto.test_route) entityToUpdate['testRoute'] = updateDto.test_route;
    if (updateDto.start_time) entityToUpdate['startTime'] = updateDto.start_time;
    if (updateDto.expected_end_time) entityToUpdate['expectedEndTime'] = updateDto.expected_end_time;
    if (updateDto.actual_end_time) entityToUpdate['actualEndTime'] = updateDto.actual_end_time;
    if (updateDto.distance) entityToUpdate['distance'] = updateDto.distance;
    if (updateDto.duration) entityToUpdate['duration'] = updateDto.duration;
    if (updateDto.responsible_staff) entityToUpdate['responsibleStaffId'] = String(updateDto.responsible_staff);
    if (updateDto.status) entityToUpdate['status'] = updateDto.status;

    Object.assign(testDrive, entityToUpdate);
    return this.testDriveRepository.save(testDrive);
  }

  async submitPdpaConsent(id: number, consent: boolean) {
    const testDrive = await this.testDriveRepository.findOne({
      where: { id },
    });

    if (!testDrive) {
      throw new NotFoundException('ไม่พบรายการทดลองขับ');
    }

    if (!consent) {
      throw new BadRequestException('ต้องยอมรับเงื่อนไข PDPA ก่อนดำเนินการต่อ');
    }

    testDrive.pdpaConsent = consent;
    testDrive.pdpaConsentedAt = new Date();

    await this.testDriveRepository.save(testDrive);

    return {
      success: true,
      message: 'PDPA consent recorded',
    };
  }

  async submitSignature(id: number, signatureData: string) {
    const testDrive = await this.testDriveRepository.findOne({
      where: { id },
    });

    if (!testDrive) {
      throw new NotFoundException('ไม่พบรายการทดลองขับ');
    }

    if (!testDrive.pdpaConsent) {
      throw new BadRequestException('กรุณายอมรับเงื่อนไข PDPA ก่อนเซ็นชื่อ');
    }

    // Check if already signed today - allow editing only on same day
    if (testDrive.signedAt) {
      const signedDate = new Date(testDrive.signedAt).toDateString();
      const today = new Date().toDateString();

      if (signedDate !== today) {
        throw new BadRequestException('ไม่สามารถแก้ไขลายเซ็นได้ เนื่องจากเกินกำหนดเวลา (แก้ไขได้เฉพาะวันที่เซ็นเท่านั้น)');
      }
    }

    // Save base64 signature data directly to database
    testDrive.signatureData = signatureData;
    testDrive.signedAt = testDrive.signedAt || new Date(); // Keep original signed date if updating

    await this.testDriveRepository.save(testDrive);

    return {
      success: true,
      message: 'Signature saved successfully',
    };
  }

  async cancel(id: number) {
    const testDrive = await this.findOne(id);

    if (testDrive.status !== TestDriveStatus.PENDING) {
      throw new BadRequestException('ไม่สามารถยกเลิกรายการที่ไม่ได้อยู่ในสถานะรอดำเนินการ');
    }

    await this.vehicleRepository.update(testDrive.vehicleId, {
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
      'สถานะ': this.getStatusText(td.status as TestDriveStatus) // แก้ไขการแปลง type
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

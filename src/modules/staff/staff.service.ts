import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Staff, StaffRole, StaffStatus } from './entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { SearchStaffDto } from './dto/search-staff.dto';
import { BrandService } from '../brand/brand.service';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StaffPerformance {
  staffId: number;
  fullName: string;
  totalTestDrives: number;
  completedTestDrives: number;
  pendingTestDrives: number;
  eventsCoordinated: number;
}

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    private brandService: BrandService,
  ) {}

  /**
   * สร้างพนักงานใหม่
   * @param createStaffDto ข้อมูลพนักงาน
   * @param brandId รหัสแบรนด์ (จาก URL path)
   */
  async create(createStaffDto: CreateStaffDto, brandId: number): Promise<Staff> {
    // ตรวจสอบ brand exists
    await this.brandService.findOne(brandId);

    // ตรวจสอบ employee_code unique
    const existingCode = await this.staffRepository.findOne({
      where: { employeeCode: createStaffDto.employeeCode },
    });
    if (existingCode) {
      throw new ConflictException(
        `Employee code "${createStaffDto.employeeCode}" already exists`,
      );
    }

    // ตรวจสอบ email unique
    const existingEmail = await this.staffRepository.findOne({
      where: { email: createStaffDto.email },
    });
    if (existingEmail) {
      throw new ConflictException(`Email "${createStaffDto.email}" already exists`);
    }

    // สร้าง staff โดย force brandId จาก parameter
    const staff = this.staffRepository.create({
      ...createStaffDto,
      brandId, // Force from URL, ไม่เชื่อ body
      role: createStaffDto.role || StaffRole.SALES,
      status: StaffStatus.ACTIVE,
    });

    const saved = await this.staffRepository.save(staff);

    // Load brand relation (non-null assertion safe as we just saved it)
    return (await this.staffRepository.findOne({
      where: { id: saved.id },
      relations: ['brand'],
    }))!;
  }

  /**
   * ดึงรายการพนักงานทั้งหมดในแบรนด์ (พร้อม pagination และ filters)
   * @param brandId รหัสแบรนด์
   * @param searchDto ตัวกรองและ pagination
   */
  async findAll(
    brandId: number,
    searchDto: SearchStaffDto = {},
  ): Promise<PaginatedResult<Staff>> {
    const { page = 1, limit = 20, role, status, search } = searchDto;

    const queryBuilder = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.brand', 'brand')
      .where('staff.brandId = :brandId', { brandId });

    // Filter by role
    if (role) {
      queryBuilder.andWhere('staff.role = :role', { role });
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere('staff.status = :status', { status });
    }

    // Search in fullName, email, employeeCode
    if (search) {
      queryBuilder.andWhere(
        '(staff.fullName LIKE :search OR staff.email LIKE :search OR staff.employeeCode LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by
    queryBuilder.orderBy('staff.createdAt', 'DESC');

    // Execute
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * ดึงข้อมูลพนักงานตาม ID (พร้อมตรวจสอบ brand ownership)
   * @param id รหัสพนักงาน
   * @param brandId รหัสแบรนด์ (สำหรับ validate)
   */
  async findOne(id: number, brandId: number): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['brand'],
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    // Validate: staff belongs to brand
    if (staff.brandId !== brandId) {
      throw new ForbiddenException(
        `Staff #${id} does not belong to this brand (expected brand ${brandId}, got ${staff.brandId})`,
      );
    }

    return staff;
  }

  /**
   * อัปเดตข้อมูลพนักงาน
   * @param id รหัสพนักงาน
   * @param updateStaffDto ข้อมูลที่ต้องการอัปเดต
   * @param brandId รหัสแบรนด์ (สำหรับ validate)
   */
  async update(
    id: number,
    updateStaffDto: UpdateStaffDto,
    brandId: number,
  ): Promise<Staff> {
    // ตรวจสอบ staff exists และ belongs to brand
    const staff = await this.findOne(id, brandId);

    // ตรวจสอบ email unique (ถ้ามีการเปลี่ยน)
    if (updateStaffDto.email && updateStaffDto.email !== staff.email) {
      const existingEmail = await this.staffRepository.findOne({
        where: { email: updateStaffDto.email },
      });
      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException(`Email "${updateStaffDto.email}" already exists`);
      }
    }

    // ไม่อนุญาตให้เปลี่ยน employeeCode (ใช้เป็น reference)
    if (updateStaffDto.employeeCode) {
      delete updateStaffDto.employeeCode;
    }

    // Update fields
    Object.assign(staff, updateStaffDto);

    const updated = await this.staffRepository.save(staff);

    // Load relations (non-null assertion safe as we just saved it)
    return (await this.staffRepository.findOne({
      where: { id: updated.id },
      relations: ['brand'],
    }))!;
  }

  /**
   * ลบพนักงาน (Soft delete โดยเปลี่ยน status เป็น inactive)
   * @param id รหัสพนักงาน
   * @param brandId รหัสแบรนด์ (สำหรับ validate)
   */
  async remove(id: number, brandId: number): Promise<{ message: string }> {
    // ตรวจสอบ staff exists และ belongs to brand
    const staff = await this.findOne(id, brandId);

    // Soft delete: เปลี่ยน status เป็น inactive
    staff.status = StaffStatus.INACTIVE;
    await this.staffRepository.save(staff);

    return {
      message: `Staff "${staff.fullName}" (${staff.employeeCode}) has been deactivated`,
    };
  }

  /**
   * ดึงพนักงานทั้งหมดในแบรนด์ (ไม่มี pagination)
   * @param brandId รหัสแบรนด์
   */
  async findByBrand(brandId: number): Promise<Staff[]> {
    return await this.staffRepository.find({
      where: {
        brandId,
        status: StaffStatus.ACTIVE,
      },
      relations: ['brand'],
      order: { fullName: 'ASC' },
    });
  }

  /**
   * ดึงพนักงานตาม role ในแบรนด์
   * @param brandId รหัสแบรนด์
   * @param role บทบาท (admin, manager, sales)
   */
  async findByRole(brandId: number, role: StaffRole): Promise<Staff[]> {
    return await this.staffRepository.find({
      where: {
        brandId,
        role,
        status: StaffStatus.ACTIVE,
      },
      relations: ['brand'],
      order: { fullName: 'ASC' },
    });
  }

  /**
   * ดึงรายชื่อพนักงานขายที่พร้อมงาน (สำหรับ dropdown assign)
   * @param brandId รหัสแบรนด์
   */
  async getAvailableSales(brandId: number): Promise<Staff[]> {
    return await this.staffRepository.find({
      where: {
        brandId,
        role: StaffRole.SALES,
        status: StaffStatus.ACTIVE,
      },
      select: ['id', 'employeeCode', 'fullName', 'fullNameEn', 'phone', 'email'],
      order: { fullName: 'ASC' },
    });
  }

  /**
   * ตรวจสอบว่า staff เป็นของ brand หรือไม่
   * @param staffId รหัสพนักงาน
   * @param brandId รหัสแบรนด์
   */
  async validateStaffBrand(staffId: number, brandId: number): Promise<boolean> {
    const staff = await this.staffRepository.findOne({
      where: { id: staffId },
      select: ['id', 'brandId'],
    });

    if (!staff) {
      throw new NotFoundException(`Staff #${staffId} not found`);
    }

    return staff.brandId === brandId;
  }

  /**
   * ดึงสถิติประสิทธิภาพของพนักงาน
   * @param staffId รหัสพนักงาน
   * @param brandId รหัสแบรนด์ (สำหรับ validate)
   */
  async getStaffPerformance(
    staffId: number,
    brandId: number,
  ): Promise<StaffPerformance> {
    // ตรวจสอบ staff exists และ belongs to brand
    const staff = await this.findOne(staffId, brandId);

    // TODO: Query from TestDrive and Event tables (will be implemented after refactoring)
    // For now, return placeholder data
    return {
      staffId: staff.id,
      fullName: staff.fullName,
      totalTestDrives: 0,
      completedTestDrives: 0,
      pendingTestDrives: 0,
      eventsCoordinated: 0,
    };
  }

  /**
   * สร้างรหัสพนักงานอัตโนมัติ
   * @param brandCode รหัสแบรนด์ (ISU, BYD)
   */
  async generateEmployeeCode(brandCode: string): Promise<string> {
    // ตัวอย่าง: ISU001, ISU002, BYD001, BYD002
    const prefix = brandCode.toUpperCase().substring(0, 3);

    // หาเลขล่าสุดของแบรนด์นี้
    const lastStaff = await this.staffRepository
      .createQueryBuilder('staff')
      .where('staff.employeeCode LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('staff.employeeCode', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastStaff && lastStaff.employeeCode) {
      // Extract number from code (e.g., ISU001 → 001)
      const lastNumber = parseInt(lastStaff.employeeCode.substring(3), 10);
      nextNumber = lastNumber + 1;
    }

    // Format: ISU001, ISU002, ...
    const code = `${prefix}${String(nextNumber).padStart(3, '0')}`;
    return code;
  }
}

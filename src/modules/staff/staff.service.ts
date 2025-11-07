import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async create(createStaffDto: CreateStaffDto): Promise<Staff> {
    const staff = this.staffRepository.create(createStaffDto);
    return this.staffRepository.save(staff);
  }

  async findAll(): Promise<Staff[]> {
    return this.staffRepository.find();
  }

  async findOne(id: string): Promise<Staff> {
    console.log('🔎 Searching staff by UUID:', id);

    const staff = await this.staffRepository.findOne({
      where: { id },
      select: [
        'id',
        'staffCode',
        'firstName',
        'lastName',
        'position',
        'department',
        'phone',
        'email',
        'role',
        'status',
        'lineUserId',
        'lineDisplayName',
        'linePictureUrl',
        'isLineLinked',
      ],
    });

    if (!staff) {
      console.error('❌ Staff not found with UUID:', id);
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    console.log('✅ Staff found:', staff.staffCode);
    return staff;
  }

  async findByStaffCode(staffCode: string): Promise<Staff> {
    console.log('🔎 Searching staff by code:', staffCode);

    const staff = await this.staffRepository.findOne({
      where: { staffCode },
      select: [
        'id',
        'staffCode',
        'firstName',
        'lastName',
        'position',
        'department',
        'phone',
        'email',
        'role',
        'status',
        'lineUserId',
        'lineDisplayName',
        'linePictureUrl',
        'isLineLinked',
      ],
    });

    if (!staff) {
      console.error('❌ Staff not found with code:', staffCode);
      throw new NotFoundException(`Staff with code ${staffCode} not found`);
    }

    console.log('✅ Staff found:', staff.id);
    return staff;
  }

  // อื่นๆ เช่น update, remove...
}

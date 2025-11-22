import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Brand } from '../../brand/entities/brand.entity';

export enum StaffRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALES = 'sales',
}

export enum StaffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
}

@Entity('staff')
@Index('IDX_STAFF_BRAND_ROLE', ['brandId', 'role'])
@Index('IDX_STAFF_BRAND_STATUS', ['brandId', 'status'])
@Index('IDX_STAFF_EMPLOYEE_CODE', ['employeeCode'])
@Index('IDX_STAFF_EMAIL', ['email'])
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  // Brand Relationship
  @Column({ name: 'brand_id', nullable: false })
  @Index('IDX_STAFF_BRAND_ID')
  brandId: number;

  @ManyToOne(() => Brand, { eager: false })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  // Employee Information
  @Column({
    name: 'employee_code',
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: false,
  })
  employeeCode: string;

  @Column({
    name: 'full_name',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  fullName: string;

  @Column({
    name: 'full_name_en',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  fullNameEn: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  phone: string;

  // Role & Status
  @Column({
    type: 'enum',
    enum: StaffRole,
    default: StaffRole.SALES,
    nullable: false,
  })
  role: StaffRole;

  @Column({
    type: 'enum',
    enum: StaffStatus,
    default: StaffStatus.ACTIVE,
    nullable: false,
  })
  status: StaffStatus;

  // Profile
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  avatar: string | null;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations to Test Drives and Events will be added when those entities are updated
  // For now, we define them as optional to avoid circular dependency issues
  // @OneToMany(() => TestDrive, (testDrive) => testDrive.assignedStaff)
  // assignedTestDrives?: TestDrive[];

  // @OneToMany(() => TestDrive, (testDrive) => testDrive.createdBy)
  // createdTestDrives?: TestDrive[];

  // @OneToMany(() => Event, (event) => event.coordinator)
  // coordinatedEvents?: Event[];
}

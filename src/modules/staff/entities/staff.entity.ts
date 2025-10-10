import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany, // ✅ เพิ่มบรรทัดนี้
} from 'typeorm';
import { TestDrive } from '../../test-drive/entities/test-drive.entity'; // ✅ เพิ่ม import

@Entity('staffs')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'staff_code', unique: true })
  staffCode: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: 'staff' })
  role: string;

  @Column({ default: 'active' })
  status: string;

  // ===== LINE Integration Fields =====
  
  @Column({ name: 'line_user_id', unique: true, nullable: true })
  lineUserId: string;

  @Column({ name: 'line_display_name', nullable: true })
  lineDisplayName: string;

  @Column({ name: 'line_picture_url', nullable: true })
  linePictureUrl: string;

  @Column({ name: 'line_last_login_at', type: 'datetime', nullable: true })
  lineLastLoginAt: Date;

  // ===== Relations =====
  
  /**
   * ✅ เพิ่ม relation นี้
   * Staff หนึ่งคนสามารถรับผิดชอบ Test Drive หลายรายการ
   */
  @OneToMany(() => TestDrive, (testDrive) => testDrive.responsibleStaff)
  testDrives: TestDrive[];

  // ===== Timestamps =====
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ===== Virtual Property =====
  
  /**
   * เช็คว่าพนักงานเชื่อมโยง LINE แล้วหรือยัง
   */
  get isLineLinked(): boolean {
    return !!this.lineUserId;
  }
}

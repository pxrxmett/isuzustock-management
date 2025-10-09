import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
} from 'typeorm';
import { TestDrive } from '../../test-drive/entities/test-drive.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('staffs')
export class Staff {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @Column({ name: 'staff_code', unique: true })
  staffCode: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column()
  position: string;

  @Column()
  department: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ default: 'staff' })
  role: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ name: 'line_user_id', nullable: true, unique: true })
  @Index('IDX_STAFF_LINE_USER_ID')
  lineUserId: string;

  @Column({ name: 'line_display_name', nullable: true })
  lineDisplayName: string;

  @Column({ name: 'line_picture_url', nullable: true })
  linePictureUrl: string;

  @Column({ name: 'line_last_login_at', nullable: true })
  lineLastLoginAt: Date;

  // ⭐ เพิ่มบรรทัดนี้
  @Column({ name: 'is_line_linked', type: 'tinyint', default: 0 })
  isLineLinked: boolean;

  @OneToMany(() => TestDrive, (testDrive) => testDrive.staff)
  testDrives: TestDrive[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

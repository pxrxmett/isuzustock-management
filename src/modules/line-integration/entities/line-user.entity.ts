import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity';

@Entity('line_users')
export class LineUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'line_user_id', unique: true })
  lineUserId: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ name: 'picture_url', nullable: true })
  pictureUrl: string;

  @Column({ name: 'staff_id', type: 'int', nullable: true })
  staffId: number | null;

  // เพิ่มคุณสมบัติใหม่
  @Column({ name: 'access_token', nullable: true, type: 'text' })
  accessToken: string;

  // เพิ่มคุณสมบัติใหม่
  @Column({ name: 'token_expires_at', nullable: true })
  tokenExpiresAt: Date;

  @ManyToOne(() => Staff, { eager: false })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

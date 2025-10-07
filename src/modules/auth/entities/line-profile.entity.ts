// src/modules/auth/entities/line-profile.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity';

@Entity('line_profiles')
export class LineProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'line_user_id', unique: true })
  lineUserId: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ name: 'picture_url', nullable: true })
  pictureUrl: string;

  // เพิ่มคุณสมบัติใหม่
  @Column({ name: 'status_message', nullable: true })
  statusMessage: string;

  // เพิ่มคุณสมบัติใหม่
  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @OneToOne(() => Staff)
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

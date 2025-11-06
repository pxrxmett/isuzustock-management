import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_settings')
@Index(['userId'], { unique: true })
export class UserSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Notification settings
  @Column({ name: 'notify_email', type: 'boolean', default: true })
  notifyEmail: boolean;

  @Column({ name: 'notify_line', type: 'boolean', default: false })
  notifyLine: boolean;

  @Column({ name: 'notify_new_queue', type: 'boolean', default: true })
  notifyNewQueue: boolean;

  @Column({ name: 'notify_queue_status', type: 'boolean', default: true })
  notifyQueueStatus: boolean;

  @Column({ name: 'notify_events', type: 'boolean', default: true })
  notifyEvents: boolean;

  // System settings
  @Column({ length: 5, default: 'th' })
  language: string;

  @Column({ length: 50, default: 'Asia/Bangkok' })
  timezone: string;

  @Column({ name: 'date_format', length: 20, default: 'DD/MM/YYYY' })
  dateFormat: string;

  @Column({ name: 'dark_mode', type: 'boolean', default: false })
  darkMode: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

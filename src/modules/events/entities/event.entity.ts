import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity';
import { EventVehicle } from './event-vehicle.entity';
import { EventStatus } from './event-status.enum';
import { EventType } from './event-type.enum';

@Entity('events')
@Index(['status'])
@Index(['type'])
@Index(['startDate'])
@Index(['endDate'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.MARKETING,
  })
  type: EventType;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PLANNING,
  })
  status: EventStatus;

  @Column({ length: 500, nullable: true })
  location: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'time', nullable: true })
  startTime: string;

  @Column({ type: 'time', nullable: true })
  endTime: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  createdBy: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: Staff;

  @Column({ type: 'simple-array', nullable: true })
  assignedStaffIds: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'int', default: 0 })
  vehicleCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => EventVehicle, (eventVehicle) => eventVehicle.event)
  eventVehicles: EventVehicle[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

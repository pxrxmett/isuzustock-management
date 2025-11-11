import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { EventVehicle } from './event-vehicle.entity';
import { EventStatus } from './event-status.enum';
import { EventType } from './event-type.enum';
import { Brand } from '../../brand/entities/brand.entity';

@Entity('events')
@Index(['status'])
@Index(['type'])
@Index(['startDate'])
@Index(['endDate'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ⭐ เพิ่ม brand relationship
  @Column({ name: 'brand_id', default: 1 })
  brandId: number;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

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

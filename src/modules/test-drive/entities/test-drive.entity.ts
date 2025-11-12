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
import { Vehicle } from '../../stock/entities/vehicle.entity';
@Entity('test_drives')
export class TestDrive {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'vehicle_id' })
  vehicleId: number;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({
    type: 'enum',
    enum: ['pending', 'ongoing', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Column({ name: 'customer_name' })
  customerName: string;

  @Column({ name: 'customer_phone' })
  customerPhone: string;

  @Column({ name: 'test_route', nullable: true })
  testRoute: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distance: number;

  @Column({ nullable: true })
  duration: number;

  @Column({ name: 'start_time', nullable: true })
  startTime: Date;

  @Column({ name: 'expected_end_time', nullable: true })
  expectedEndTime: Date;

  @Column({ name: 'actual_end_time', nullable: true })
  actualEndTime: Date;

  @Column({ name: 'responsible_staff' })
  responsibleStaffId: string;

  @ManyToOne(() => Staff, (staff) => staff.testDrives)
  @JoinColumn({ name: 'responsible_staff' })
  staff: Staff;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

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

  // ===== Vehicle Relation =====
  
  @Column({ name: 'vehicle_id' })
  vehicleId: number;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  // ===== Status & Customer Info =====
  
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

  // ===== Test Drive Details =====
  
  @Column({ name: 'test_route', nullable: true })
  testRoute: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distance: number;

  @Column()
  duration: number;

  @Column({ name: 'start_time' })
  startTime: Date;

  @Column({ name: 'expected_end_time' })
  expectedEndTime: Date;

  @Column({ name: 'actual_end_time', nullable: true })
  actualEndTime: Date;

  // ===== Staff Relation =====
  
  @Column({ name: 'responsible_staff' })
  responsibleStaffId: string;

  @ManyToOne(() => Staff, (staff) => staff.testDrives)
  @JoinColumn({ name: 'responsible_staff' })
  responsibleStaff: Staff;  // ✅ เปลี่ยนจาก "staff" เป็น "responsibleStaff"

  // ===== Timestamps =====
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

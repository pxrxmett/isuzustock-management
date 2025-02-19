import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vehicle } from '../../stock/entities/vehicle.entity';

export enum TestDriveStatus {
  PENDING = 'pending',     // รอดำเนินการ
  ONGOING = 'ongoing',     // กำลังทดลองขับ
  COMPLETED = 'completed', // เสร็จสิ้น
  CANCELLED = 'cancelled', // ยกเลิก
}

@Entity('test_drives')
export class TestDrive {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Vehicle, vehicle => vehicle.testDrives)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column()
  vehicle_id: number;

  @Column()
  customer_name: string;

  @Column()
  customer_phone: string;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp' })
  expected_end_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  actual_end_time: Date;

  @Column({ nullable: true })
  test_route: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distance: number;

  @Column({ type: 'integer' })
  duration: number;

  @Column()
  responsible_staff: string;

  @Column({
    type: 'enum',
    enum: TestDriveStatus,
    default: TestDriveStatus.PENDING,
  })
  status: TestDriveStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

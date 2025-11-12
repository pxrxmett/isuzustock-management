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
import { Brand } from '../../brand/entities/brand.entity';

@Entity('test_drives')
export class TestDrive {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'brand_id', default: 1 })
  brandId: number;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

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

  @Column({ name: 'customer_license_number', nullable: true })
  customerLicenseNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

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

  @Column({ name: 'responsible_staff', type: 'int' })
  responsibleStaffId: number;

  @ManyToOne(() => Staff, { eager: false })
  @JoinColumn({ name: 'responsible_staff' })
  staff: Staff;

  @Column({ name: 'pdpa_consent', type: 'boolean', default: false })
  pdpaConsent: boolean;

  @Column({ name: 'pdpa_consented_at', type: 'timestamp', nullable: true })
  pdpaConsentedAt: Date;

  @Column({ name: 'signature_data', type: 'longtext', nullable: true })
  signatureData: string;

  @Column({ name: 'signed_at', type: 'timestamp', nullable: true })
  signedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

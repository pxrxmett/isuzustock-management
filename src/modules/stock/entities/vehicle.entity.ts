// src/modules/stock/entities/vehicle.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { TestDrive } from '../../test-drive/entities/test-drive.entity';

export enum VehicleStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  IN_USE = 'in_use'
}

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  vehicleCode: string;

  @Column()
  vinNumber: string;

  @Column({ nullable: true })
  frontMotor: string;

  @Column({ nullable: true })
  batteryNumber: string;

  @Column()
  model: string;

  @Column({ nullable: true })
  color: string;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE
  })
  status: VehicleStatus;

  @Column({ nullable: true })
  dealerCode: string;

  @Column({ nullable: true })
  dealerName: string;

  @Column({ nullable: true })
  carType: string;

  @Column({ type: 'datetime', nullable: true })
  allocationDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  // เพิ่มความสัมพันธ์กับ TestDrive
  @OneToMany(() => TestDrive, testDrive => testDrive.vehicle)
  testDrives: TestDrive[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum VehicleType {
  FUEL = 'fuel',
  ELECTRIC = 'electric',
}

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'name_th', length: 100, nullable: true })
  nameTh: string;

  @Column({
    name: 'vehicle_type',
    type: 'enum',
    enum: VehicleType,
  })
  vehicleType: VehicleType;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}

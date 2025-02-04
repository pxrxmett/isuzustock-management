import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  vehicleCode: string;

  @Column()
  model: string;

  @Column({ length: 17, nullable: true })
  vinNumber: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  frontMotor: string;

  @Column({ nullable: true })
  batteryNumber: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

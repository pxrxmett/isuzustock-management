// src/modules/stock/entities/file-upload.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('file_uploads')
export class FileUpload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  fileName: string;

  @Column()
  fileSize: number;

  @Column({ length: 100 })
  mimeType: string;

  @Column({ length: 64, unique: true })
  fileHash: string;

  @Column({ default: 0 })
  recordsImported: number;

  @Column({ nullable: true, type: 'text' })  // ตรวจสอบให้แน่ใจว่ามี nullable: true
  importErrors: string | null;  // แก้ไขประเภทข้อมูลให้รองรับ null

  @Column({ default: false })
  isProcessed: boolean;

  @CreateDateColumn()
  uploadedAt: Date;

  @Column({ nullable: true })
  processedAt: Date;
}

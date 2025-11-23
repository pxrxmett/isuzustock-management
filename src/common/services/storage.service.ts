import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IStorageService } from '../interfaces/storage.interface';

/**
 * LocalStorageService (implements IStorageService)
 *
 * จัดการการเก็บไฟล์ (images, PDFs) ลงใน local file system
 * รองรับการแปลง base64 เป็นไฟล์
 *
 * Features:
 * - บันทึก base64 images เป็นไฟล์
 * - สร้าง directory อัตโนมัติถ้ายังไม่มี
 * - สร้าง unique filename ด้วย UUID
 * - รองรับ brand-scoped storage (แยกไฟล์ตาม brand)
 * - ส่งคืน URL ที่สามารถเข้าถึงได้
 *
 * Current Usage:
 * - Development: ./public/uploads
 * - Production (Railway): /tmp/uploads (ephemeral - files lost on restart)
 *
 * Migration Path:
 * - Replace with S3StorageService for persistent cloud storage
 * - See: src/common/services/s3-storage.service.ts (prepared for future)
 */
@Injectable()
export class StorageService implements IStorageService {
  private readonly logger = new Logger(StorageService.name);
  // ใช้ /tmp สำหรับ Railway (มี permission เขียนได้)
  private readonly uploadDir = process.env.NODE_ENV === 'production'
    ? '/tmp/uploads'
    : path.join(process.cwd(), 'public', 'uploads');
  private readonly baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

  constructor() {
    // สร้าง upload directory เมื่อ service เริ่มทำงาน
    this.ensureUploadDir();
  }

  /**
   * สร้าง upload directory ถ้ายังไม่มี
   */
  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`✅ Upload directory ready: ${this.uploadDir}`);
    } catch (error) {
      this.logger.error(`❌ Failed to create upload directory:`, error);
    }
  }

  /**
   * แปลง base64 string เป็นไฟล์และบันทึกลง file system
   *
   * @param base64Data - base64 string (รองรับทั้งแบบมี data:image/png;base64, หรือไม่มี)
   * @param brandCode - รหัส brand (เช่น 'isuzu', 'byd')
   * @param category - ประเภทไฟล์ (เช่น 'signatures', 'licenses', 'documents')
   * @param originalFilename - ชื่อไฟล์ต้นฉบับ (optional)
   * @returns URL ของไฟล์ที่บันทึก
   */
  async saveBase64File(
    base64Data: string,
    brandCode: string,
    category: string,
    originalFilename?: string,
  ): Promise<string> {
    try {
      // ตรวจสอบว่า base64Data มีข้อมูลหรือไม่
      if (!base64Data) {
        throw new Error('Base64 data is empty');
      }

      // แยก data URL (data:image/png;base64,xxxxx)
      let base64String = base64Data;
      let mimeType = 'image/png'; // default
      let fileExtension = 'png';

      if (base64Data.includes('data:')) {
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64String = matches[2];

          // กำหนด file extension จาก mime type
          if (mimeType.includes('png')) fileExtension = 'png';
          else if (mimeType.includes('jpeg') || mimeType.includes('jpg'))
            fileExtension = 'jpg';
          else if (mimeType.includes('pdf')) fileExtension = 'pdf';
          else if (mimeType.includes('webp')) fileExtension = 'webp';
        }
      }

      // สร้างชื่อไฟล์ unique
      const uniqueId = uuidv4();
      const filename = originalFilename
        ? `${uniqueId}-${originalFilename}`
        : `${uniqueId}.${fileExtension}`;

      // สร้าง directory path (uploads/brandCode/category/)
      const dirPath = path.join(this.uploadDir, brandCode, category);
      await fs.mkdir(dirPath, { recursive: true });

      // สร้าง file path
      const filePath = path.join(dirPath, filename);

      // แปลง base64 เป็น buffer และบันทึกไฟล์
      const buffer = Buffer.from(base64String, 'base64');
      await fs.writeFile(filePath, buffer);

      // สร้าง URL สำหรับเข้าถึงไฟล์
      const fileUrl = `${this.baseUrl}/uploads/${brandCode}/${category}/${filename}`;

      this.logger.log(
        `✅ File saved: ${category}/${filename} (${buffer.length} bytes)`,
      );

      return fileUrl;
    } catch (error) {
      this.logger.error(`❌ Failed to save base64 file:`, error);
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  /**
   * ลบไฟล์จาก file system
   *
   * @param fileUrl - URL ของไฟล์ที่ต้องการลบ
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl) return;

      // แปลง URL เป็น file path
      const relativePath = fileUrl.replace(`${this.baseUrl}/uploads/`, '');
      const filePath = path.join(this.uploadDir, relativePath);

      // ตรวจสอบว่าไฟล์มีอยู่หรือไม่
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        this.logger.log(`✅ File deleted: ${relativePath}`);
      } catch (error) {
        // ไฟล์ไม่มีอยู่ - ไม่ต้องทำอะไร
        this.logger.warn(`⚠️  File not found: ${relativePath}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to delete file:`, error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * บันทึก Buffer เป็นไฟล์ (สำหรับ PDF generation)
   *
   * @param buffer - Buffer ของไฟล์
   * @param brandCode - รหัส brand
   * @param category - ประเภทไฟล์
   * @param filename - ชื่อไฟล์
   * @returns URL ของไฟล์ที่บันทึก
   */
  async saveBuffer(
    buffer: Buffer,
    brandCode: string,
    category: string,
    filename: string,
  ): Promise<string> {
    try {
      // สร้าง directory path
      const dirPath = path.join(this.uploadDir, brandCode, category);
      await fs.mkdir(dirPath, { recursive: true });

      // สร้าง file path
      const filePath = path.join(dirPath, filename);

      // บันทึกไฟล์
      await fs.writeFile(filePath, buffer);

      // สร้าง URL
      const fileUrl = `${this.baseUrl}/uploads/${brandCode}/${category}/${filename}`;

      this.logger.log(
        `✅ Buffer saved: ${category}/${filename} (${buffer.length} bytes)`,
      );

      return fileUrl;
    } catch (error) {
      this.logger.error(`❌ Failed to save buffer:`, error);
      throw new Error(`Failed to save buffer: ${error.message}`);
    }
  }

  /**
   * อ่านไฟล์เป็น Buffer
   *
   * @param fileUrl - URL ของไฟล์
   * @returns Buffer ของไฟล์
   */
  async readFile(fileUrl: string): Promise<Buffer> {
    try {
      const relativePath = fileUrl.replace(`${this.baseUrl}/uploads/`, '');
      const filePath = path.join(this.uploadDir, relativePath);
      return await fs.readFile(filePath);
    } catch (error) {
      this.logger.error(`❌ Failed to read file:`, error);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * ตรวจสอบว่าไฟล์มีอยู่หรือไม่
   *
   * @param fileUrl - URL ของไฟล์
   * @returns true ถ้าไฟล์มีอยู่, false ถ้าไม่มี
   */
  async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const relativePath = fileUrl.replace(`${this.baseUrl}/uploads/`, '');
      const filePath = path.join(this.uploadDir, relativePath);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

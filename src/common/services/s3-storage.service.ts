import { Injectable, Logger } from '@nestjs/common';
import { IStorageService } from '../interfaces/storage.interface';

/**
 * S3StorageService (implements IStorageService)
 *
 * AWS S3 cloud storage implementation for persistent file storage
 *
 * ⚠️ NOT IMPLEMENTED YET - Prepared for future migration
 *
 * Setup Instructions (when ready to migrate):
 * 1. Install AWS SDK:
 *    npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 *
 * 2. Set environment variables:
 *    STORAGE_TYPE=s3
 *    AWS_REGION=ap-southeast-1
 *    AWS_S3_BUCKET=your-bucket-name
 *    AWS_ACCESS_KEY_ID=your-access-key
 *    AWS_SECRET_ACCESS_KEY=your-secret-key
 *    AWS_CLOUDFRONT_URL=https://xxx.cloudfront.net (optional)
 *
 * 3. Create S3 bucket with:
 *    - Public read access (or use presigned URLs)
 *    - CORS configuration for your domain
 *    - Lifecycle rules for old files (optional)
 *
 * 4. Enable this service in storage.module.ts
 *
 * Benefits:
 * ✅ Persistent storage (files don't disappear on restart)
 * ✅ Scalable (unlimited storage)
 * ✅ CDN integration (CloudFront for fast delivery)
 * ✅ Backup & versioning
 * ✅ Cost-effective for production
 *
 * Migration Path:
 * - Replace StorageService injection with this service
 * - No code changes needed in controllers/services (same interface)
 */
@Injectable()
export class S3StorageService implements IStorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly region: string;
  private readonly bucket: string;
  private readonly cdnUrl?: string;

  constructor() {
    // TODO: Load from environment variables
    this.region = process.env.AWS_REGION || 'ap-southeast-1';
    this.bucket = process.env.AWS_S3_BUCKET || '';
    this.cdnUrl = process.env.AWS_CLOUDFRONT_URL;

    if (!this.bucket) {
      this.logger.warn(
        '⚠️  S3StorageService: AWS_S3_BUCKET not configured. Service will not work.',
      );
    }
  }

  /**
   * บันทึกไฟล์จาก base64 string ขึ้น S3
   */
  async saveBase64File(
    base64Data: string,
    brandCode: string,
    category: string,
    originalFilename?: string,
  ): Promise<string> {
    // TODO: Implement S3 upload
    // Steps:
    // 1. Parse base64 data and extract mime type
    // 2. Generate unique filename with UUID
    // 3. Create S3 key: brandCode/category/filename
    // 4. Upload to S3 with proper content type
    // 5. Return S3 URL or CloudFront URL

    throw new Error(
      'S3StorageService.saveBase64File() not implemented yet. ' +
        'Please set STORAGE_TYPE=local or implement S3 integration.',
    );
  }

  /**
   * บันทึก Buffer ขึ้น S3
   */
  async saveBuffer(
    buffer: Buffer,
    brandCode: string,
    category: string,
    filename: string,
  ): Promise<string> {
    // TODO: Implement S3 upload from buffer
    throw new Error('S3StorageService.saveBuffer() not implemented yet.');
  }

  /**
   * อ่านไฟล์จาก S3 เป็น Buffer
   */
  async readFile(fileUrl: string): Promise<Buffer> {
    // TODO: Implement S3 download
    // Steps:
    // 1. Extract S3 key from URL
    // 2. Download from S3
    // 3. Return buffer
    throw new Error('S3StorageService.readFile() not implemented yet.');
  }

  /**
   * ลบไฟล์จาก S3
   */
  async deleteFile(fileUrl: string): Promise<void> {
    // TODO: Implement S3 delete
    throw new Error('S3StorageService.deleteFile() not implemented yet.');
  }

  /**
   * ตรวจสอบว่าไฟล์มีอยู่ใน S3 หรือไม่
   */
  async fileExists(fileUrl: string): Promise<boolean> {
    // TODO: Implement S3 head object check
    throw new Error('S3StorageService.fileExists() not implemented yet.');
  }
}

/**
 * Example S3 Upload Implementation (for reference):
 *
 * import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
 *
 * const s3Client = new S3Client({ region: this.region });
 *
 * const key = `${brandCode}/${category}/${filename}`;
 *
 * await s3Client.send(new PutObjectCommand({
 *   Bucket: this.bucket,
 *   Key: key,
 *   Body: buffer,
 *   ContentType: mimeType,
 *   ACL: 'public-read', // or use presigned URLs
 * }));
 *
 * const fileUrl = this.cdnUrl
 *   ? `${this.cdnUrl}/${key}`
 *   : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
 *
 * return fileUrl;
 */

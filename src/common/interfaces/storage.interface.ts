/**
 * Storage Interface
 *
 * กำหนด contract สำหรับ storage service ทุกประเภท
 * รองรับ local filesystem, S3, Cloudinary, etc.
 */
export interface IStorageService {
  /**
   * บันทึกไฟล์จาก base64 string
   * @returns URL ของไฟล์ที่บันทึก
   */
  saveBase64File(
    base64Data: string,
    brandCode: string,
    category: string,
    originalFilename?: string,
  ): Promise<string>;

  /**
   * บันทึกไฟล์จาก Buffer
   * @returns URL ของไฟล์ที่บันทึก
   */
  saveBuffer(
    buffer: Buffer,
    brandCode: string,
    category: string,
    filename: string,
  ): Promise<string>;

  /**
   * อ่านไฟล์เป็น Buffer
   */
  readFile(fileUrl: string): Promise<Buffer>;

  /**
   * ลบไฟล์
   */
  deleteFile(fileUrl: string): Promise<void>;

  /**
   * ตรวจสอบว่าไฟล์มีอยู่หรือไม่
   */
  fileExists(fileUrl: string): Promise<boolean>;
}

/**
 * Storage Configuration
 */
export interface StorageConfig {
  type: 'local' | 's3' | 'cloudinary';

  // Local storage config
  uploadDir?: string;
  baseUrl?: string;

  // S3 config
  s3?: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    cdnUrl?: string; // CloudFront URL (optional)
  };

  // Cloudinary config (for future)
  cloudinary?: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
}

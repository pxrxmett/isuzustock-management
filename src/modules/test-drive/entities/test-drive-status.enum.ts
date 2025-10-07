// src/modules/test-drive/entities/test-drive-status.enum.ts

/**
 * สถานะของการทดลองขับ
 */
export enum TestDriveStatus {
  /** รอดำเนินการ */
  PENDING = 'PENDING',
  
  /** กำลังทดลองขับ */
  ONGOING = 'ONGOING',
  
  /** เสร็จสิ้น */
  COMPLETED = 'COMPLETED',
  
  /** ยกเลิก */
  CANCELLED = 'CANCELLED'
}

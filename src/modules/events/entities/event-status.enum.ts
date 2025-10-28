export enum EventStatus {
  PLANNING = 'planning',
  PREPARING = 'preparing',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

export const EventStatusLabels = {
  [EventStatus.PLANNING]: 'วางแผน',
  [EventStatus.PREPARING]: 'เตรียมการ',
  [EventStatus.IN_PROGRESS]: 'กำลังดำเนินการ',
  [EventStatus.COMPLETED]: 'เสร็จสิ้น',
  [EventStatus.CANCELLED]: 'ยกเลิก',
  [EventStatus.OVERDUE]: 'เลยกำหนด',
};

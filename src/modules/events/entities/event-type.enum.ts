export enum EventType {
  CAR_SHOW = 'car_show',
  TEST_DRIVE = 'test_drive',
  MARKETING = 'marketing',
  DELIVERY = 'delivery',
  EMERGENCY = 'emergency',
}

export const EventTypeLabels = {
  [EventType.CAR_SHOW]: 'งานแสดงรถ',
  [EventType.TEST_DRIVE]: 'งานทดลองขับ',
  [EventType.MARKETING]: 'งานการตลาด',
  [EventType.DELIVERY]: 'งานส่งมอบรถ',
  [EventType.EMERGENCY]: 'งานเร่งด่วน',
};

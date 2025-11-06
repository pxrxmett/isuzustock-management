import { ApiProperty } from '@nestjs/swagger';

export class EventStatsDto {
  @ApiProperty({
    description: 'สรุปสถานะงาน (Event status summary)',
    example: {
      total: 45,
      planning: 10,
      preparing: 5,
      inProgress: 8,
      completed: 20,
      cancelled: 2,
      overdue: 0,
    },
  })
  statusSummary: {
    total: number;
    planning: number;
    preparing: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overdue: number;
  };

  @ApiProperty({
    description: 'งานแยกตามประเภท (Events by type)',
    example: [
      { type: 'car_show', count: 15 },
      { type: 'test_drive', count: 12 },
      { type: 'marketing', count: 10 },
      { type: 'delivery', count: 5 },
      { type: 'emergency', count: 3 },
    ],
  })
  byType: Array<{
    type: string;
    count: number;
  }>;

  @ApiProperty({
    description: 'งานที่กำลังจะมาถึง (Upcoming events)',
    example: [
      {
        id: 'event-uuid',
        title: 'งานแสดงรถ 2025',
        type: 'car_show',
        startDate: '2025-02-15',
        vehicleCount: 10,
      },
    ],
  })
  upcomingEvents: Array<{
    id: string;
    title: string;
    type: string;
    startDate: string;
    vehicleCount: number;
  }>;

  @ApiProperty({
    description: 'จำนวนรถเฉลี่ยต่องาน (Average vehicles per event)',
    example: 5.2,
  })
  avgVehiclesPerEvent: number;

  @ApiProperty({
    description: 'ระยะเวลาเฉลี่ยของงาน (Average event duration in days)',
    example: 3.5,
  })
  avgEventDuration: number;
}

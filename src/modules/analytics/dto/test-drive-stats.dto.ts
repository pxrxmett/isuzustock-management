import { ApiProperty } from '@nestjs/swagger';

export class TestDriveStatsDto {
  @ApiProperty({
    description: 'สรุปสถานะการทดลองขับ (Test drive status summary)',
    example: {
      total: 120,
      pending: 15,
      confirmed: 25,
      inProgress: 10,
      completed: 65,
      cancelled: 5,
    },
  })
  statusSummary: {
    total: number;
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };

  @ApiProperty({
    description: 'การทดลองขับแยกตามรุ่นรถ (Test drives by vehicle model)',
    example: [
      { model: 'D-MAX', count: 45 },
      { model: 'MU-X', count: 35 },
      { model: 'V-CROSS', count: 25 },
    ],
  })
  byVehicleModel: Array<{
    model: string;
    count: number;
  }>;

  @ApiProperty({
    description: 'การทดลองขับที่กำลังจะมาถึง (Upcoming test drives)',
    example: [
      {
        id: 1,
        customerName: 'นาย สมชาย ใจดี',
        vehicleModel: 'D-MAX Hi-Lander',
        scheduledDate: '2025-02-10',
        status: 'confirmed',
      },
    ],
  })
  upcomingTestDrives: Array<{
    id: number;
    customerName: string;
    vehicleModel: string;
    scheduledDate: string;
    status: string;
  }>;

  @ApiProperty({
    description: 'อัตราการยืนยัน (Confirmation rate percentage)',
    example: 85.5,
  })
  confirmationRate: number;

  @ApiProperty({
    description: 'อัตราการยกเลิก (Cancellation rate percentage)',
    example: 4.2,
  })
  cancellationRate: number;

  @ApiProperty({
    description: 'จำนวนการทดลองขับรายเดือน (Monthly test drive count)',
    example: [
      { month: '2025-01', count: 25 },
      { month: '2024-12', count: 30 },
      { month: '2024-11', count: 28 },
    ],
  })
  monthlyTrend: Array<{
    month: string;
    count: number;
  }>;
}

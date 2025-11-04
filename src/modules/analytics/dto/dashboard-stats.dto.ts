import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({
    description: 'สถิติรถยนต์ทั้งหมด (Total vehicle statistics)',
    example: {
      total: 150,
      available: 80,
      inUse: 30,
      maintenance: 15,
      lockedForEvent: 25,
      unavailable: 0,
    },
  })
  vehicles: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    lockedForEvent: number;
    unavailable: number;
  };

  @ApiProperty({
    description: 'สถิติงาน/อีเวนต์ (Event statistics)',
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
  events: {
    total: number;
    planning: number;
    preparing: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overdue: number;
  };

  @ApiProperty({
    description: 'สถิติการทดลองขับ (Test drive statistics)',
    example: {
      total: 120,
      pending: 15,
      confirmed: 25,
      inProgress: 10,
      completed: 65,
      cancelled: 5,
    },
  })
  testDrives: {
    total: number;
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };

  @ApiProperty({
    description: 'สถิติรายเดือน (Monthly statistics)',
    example: {
      newVehicles: 12,
      completedEvents: 8,
      completedTestDrives: 45,
    },
  })
  thisMonth: {
    newVehicles: number;
    completedEvents: number;
    completedTestDrives: number;
  };
}

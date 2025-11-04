import { ApiProperty } from '@nestjs/swagger';

export class VehicleStatsDto {
  @ApiProperty({
    description: 'สรุปสถานะรถยนต์ (Vehicle status summary)',
    example: {
      total: 150,
      available: 80,
      inUse: 30,
      maintenance: 15,
      lockedForEvent: 25,
      unavailable: 0,
    },
  })
  statusSummary: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    lockedForEvent: number;
    unavailable: number;
  };

  @ApiProperty({
    description: 'รถยนต์แยกตามรุ่น (Vehicles by model)',
    example: [
      { model: 'D-MAX', count: 45 },
      { model: 'MU-X', count: 35 },
      { model: 'V-CROSS', count: 25 },
    ],
  })
  byModel: Array<{
    model: string;
    count: number;
  }>;

  @ApiProperty({
    description: 'รถยนต์แยกตามปี (Vehicles by year)',
    example: [
      { year: 2025, count: 50 },
      { year: 2024, count: 70 },
      { year: 2023, count: 30 },
    ],
  })
  byYear: Array<{
    year: number;
    count: number;
  }>;

  @ApiProperty({
    description: 'รถยนต์แยกตามสี (Vehicles by color)',
    example: [
      { color: 'White', count: 60 },
      { color: 'Black', count: 40 },
      { color: 'Silver', count: 30 },
    ],
  })
  byColor: Array<{
    color: string;
    count: number;
  }>;

  @ApiProperty({
    description: 'อัตราการใช้งาน (Utilization rate percentage)',
    example: 53.33,
  })
  utilizationRate: number;
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Vehicle, VehicleStatus } from '../../stock/entities/vehicle.entity';
import { Event } from '../../events/entities/event.entity';
import { EventStatus } from '../../events/entities/event-status.enum';
import { TestDrive } from '../../test-drive/entities/test-drive.entity';
import { DashboardStatsDto } from '../dto/dashboard-stats.dto';
import { VehicleStatsDto } from '../dto/vehicle-stats.dto';
import { EventStatsDto } from '../dto/event-stats.dto';
import { TestDriveStatsDto } from '../dto/test-drive-stats.dto';
import { DateRangeDto } from '../dto/date-range.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(TestDrive)
    private testDriveRepository: Repository<TestDrive>,
  ) {}

  /**
   * ดึงข้อมูลสถิติทั้งหมดสำหรับ Dashboard
   * Get all statistics for dashboard
   */
  async getDashboardStats(dateRange?: DateRangeDto): Promise<DashboardStatsDto> {
    // คำนวณสถิติรถยนต์
    const vehicleStats = await this.getVehicleStatusSummary();

    // คำนวณสถิติงาน
    const eventStats = await this.getEventStatusSummary();

    // คำนวณสถิติทดลองขับ
    const testDriveStats = await this.getTestDriveStatusSummary();

    // คำนวณสถิติรายเดือนปัจจุบัน
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const newVehiclesThisMonth = await this.vehicleRepository.count({
      where: {
        createdAt: Between(firstDayOfMonth, lastDayOfMonth),
      },
    });

    const completedEventsThisMonth = await this.eventRepository.count({
      where: {
        status: EventStatus.COMPLETED,
        updatedAt: Between(firstDayOfMonth, lastDayOfMonth),
      },
    });

    const completedTestDrivesThisMonth = await this.testDriveRepository.count({
      where: {
        status: 'completed',
        updatedAt: Between(firstDayOfMonth, lastDayOfMonth),
      },
    });

    return {
      vehicles: vehicleStats,
      events: eventStats,
      testDrives: testDriveStats,
      thisMonth: {
        newVehicles: newVehiclesThisMonth,
        completedEvents: completedEventsThisMonth,
        completedTestDrives: completedTestDrivesThisMonth,
      },
    };
  }

  /**
   * ดึงสถิติรถยนต์โดยละเอียด
   * Get detailed vehicle statistics
   */
  async getVehicleStats(dateRange?: DateRangeDto): Promise<VehicleStatsDto> {
    // สรุปสถานะรถ
    const statusSummary = await this.getVehicleStatusSummary();

    // นับรถแยกตามรุ่น
    const byModelQuery = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .select('vehicle.model', 'model')
      .addSelect('COUNT(vehicle.id)', 'count')
      .groupBy('vehicle.model')
      .orderBy('count', 'DESC')
      .getRawMany();

    const byModel = byModelQuery.map((item) => ({
      model: item.model,
      count: parseInt(item.count, 10),
    }));

    // นับรถแยกตามปี
    const byYearQuery = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .select('vehicle.year', 'year')
      .addSelect('COUNT(vehicle.id)', 'count')
      .groupBy('vehicle.year')
      .orderBy('year', 'DESC')
      .getRawMany();

    const byYear = byYearQuery.map((item) => ({
      year: parseInt(item.year, 10),
      count: parseInt(item.count, 10),
    }));

    // นับรถแยกตามสี
    const byColorQuery = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .select('vehicle.color', 'color')
      .addSelect('COUNT(vehicle.id)', 'count')
      .where('vehicle.color IS NOT NULL')
      .groupBy('vehicle.color')
      .orderBy('count', 'DESC')
      .getRawMany();

    const byColor = byColorQuery.map((item) => ({
      color: item.color,
      count: parseInt(item.count, 10),
    }));

    // คำนวณ utilization rate (รถที่ใช้งาน / รถทั้งหมด)
    const utilizationRate = statusSummary.total > 0
      ? ((statusSummary.inUse + statusSummary.lockedForEvent) / statusSummary.total) * 100
      : 0;

    return {
      statusSummary,
      byModel,
      byYear,
      byColor,
      utilizationRate: parseFloat(utilizationRate.toFixed(2)),
    };
  }

  /**
   * ดึงสถิติงาน/อีเวนต์โดยละเอียด
   * Get detailed event statistics
   */
  async getEventStats(dateRange?: DateRangeDto): Promise<EventStatsDto> {
    // สรุปสถานะงาน
    const statusSummary = await this.getEventStatusSummary();

    // นับงานแยกตามประเภท
    const byTypeQuery = await this.eventRepository
      .createQueryBuilder('event')
      .select('event.type', 'type')
      .addSelect('COUNT(event.id)', 'count')
      .groupBy('event.type')
      .orderBy('count', 'DESC')
      .getRawMany();

    const byType = byTypeQuery.map((item) => ({
      type: item.type,
      count: parseInt(item.count, 10),
    }));

    // ดึงงานที่กำลังจะมาถึง (7 วันข้างหน้า)
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const upcomingEventsQuery = await this.eventRepository
      .createQueryBuilder('event')
      .select([
        'event.id',
        'event.title',
        'event.type',
        'event.startDate',
        'event.vehicleCount',
      ])
      .where('event.startDate >= :now', { now: now.toISOString().split('T')[0] })
      .andWhere('event.startDate <= :sevenDaysLater', {
        sevenDaysLater: sevenDaysLater.toISOString().split('T')[0]
      })
      .andWhere('event.status IN (:...statuses)', {
        statuses: [EventStatus.PLANNING, EventStatus.PREPARING, EventStatus.IN_PROGRESS]
      })
      .orderBy('event.startDate', 'ASC')
      .limit(10)
      .getMany();

    const upcomingEvents = upcomingEventsQuery.map((event) => ({
      id: event.id,
      title: event.title,
      type: event.type as string,
      startDate: typeof event.startDate === 'string'
        ? event.startDate
        : event.startDate.toISOString().split('T')[0],
      vehicleCount: event.vehicleCount,
    }));

    // คำนวณรถเฉลี่ยต่องาน
    const totalVehicleCount = await this.eventRepository
      .createQueryBuilder('event')
      .select('SUM(event.vehicleCount)', 'totalVehicles')
      .getRawOne();

    const avgVehiclesPerEvent = statusSummary.total > 0
      ? (totalVehicleCount.totalVehicles || 0) / statusSummary.total
      : 0;

    // คำนวณระยะเวลาเฉลี่ยของงาน
    const eventsWithDuration = await this.eventRepository
      .createQueryBuilder('event')
      .select('DATEDIFF(event.endDate, event.startDate)', 'duration')
      .getRawMany();

    const totalDuration = eventsWithDuration.reduce(
      (sum, item) => sum + (item.duration || 0),
      0,
    );
    const avgEventDuration = eventsWithDuration.length > 0
      ? totalDuration / eventsWithDuration.length
      : 0;

    return {
      statusSummary,
      byType,
      upcomingEvents,
      avgVehiclesPerEvent: parseFloat(avgVehiclesPerEvent.toFixed(2)),
      avgEventDuration: parseFloat(avgEventDuration.toFixed(2)),
    };
  }

  /**
   * ดึงสถิติทดลองขับโดยละเอียด
   * Get detailed test drive statistics
   */
  async getTestDriveStats(dateRange?: DateRangeDto): Promise<TestDriveStatsDto> {
    // สรุปสถานะทดลองขับ
    const statusSummary = await this.getTestDriveStatusSummary();

    // นับทดลองขับแยกตามรุ่นรถ
    const byVehicleModelQuery = await this.testDriveRepository
      .createQueryBuilder('testDrive')
      .leftJoinAndSelect('testDrive.vehicle', 'vehicle')
      .select('vehicle.model', 'model')
      .addSelect('COUNT(testDrive.id)', 'count')
      .groupBy('vehicle.model')
      .orderBy('count', 'DESC')
      .getRawMany();

    const byVehicleModel = byVehicleModelQuery.map((item) => ({
      model: item.model || 'N/A',
      count: parseInt(item.count, 10),
    }));

    // ดึงทดลองขับที่กำลังจะมาถึง
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const upcomingTestDrivesQuery = await this.testDriveRepository
      .createQueryBuilder('testDrive')
      .leftJoinAndSelect('testDrive.vehicle', 'vehicle')
      .select([
        'testDrive.id',
        'testDrive.customerName',
        'testDrive.startTime',
        'testDrive.status',
        'vehicle.model',
      ])
      .where('testDrive.startTime >= :now', { now })
      .andWhere('testDrive.startTime <= :sevenDaysLater', { sevenDaysLater })
      .andWhere('testDrive.status IN (:...statuses)', {
        statuses: ['pending', 'ongoing']
      })
      .orderBy('testDrive.startTime', 'ASC')
      .limit(10)
      .getMany();

    const upcomingTestDrives = upcomingTestDrivesQuery.map((td) => ({
      id: td.id,
      customerName: td.customerName,
      vehicleModel: td.vehicle?.model || 'N/A',
      scheduledDate: td.startTime.toISOString().split('T')[0],
      status: td.status,
    }));

    // คำนวณอัตราการยืนยัน (ongoing + completed)
    const confirmationRate = statusSummary.total > 0
      ? ((statusSummary.ongoing + statusSummary.completed) / statusSummary.total) * 100
      : 0;

    // คำนวณอัตราการยกเลิก
    const cancellationRate = statusSummary.total > 0
      ? (statusSummary.cancelled / statusSummary.total) * 100
      : 0;

    // ดึงข้อมูลรายเดือน (6 เดือนล่าสุด)
    const monthlyTrendQuery = await this.testDriveRepository
      .createQueryBuilder('testDrive')
      .select("DATE_FORMAT(testDrive.startTime, '%Y-%m')", 'month')
      .addSelect('COUNT(testDrive.id)', 'count')
      .where('testDrive.startTime >= DATE_SUB(NOW(), INTERVAL 6 MONTH)')
      .groupBy('month')
      .orderBy('month', 'DESC')
      .getRawMany();

    const monthlyTrend = monthlyTrendQuery.map((item) => ({
      month: item.month,
      count: parseInt(item.count, 10),
    }));

    return {
      statusSummary,
      byVehicleModel,
      upcomingTestDrives,
      confirmationRate: parseFloat(confirmationRate.toFixed(2)),
      cancellationRate: parseFloat(cancellationRate.toFixed(2)),
      monthlyTrend,
    };
  }

  /**
   * Helper: สรุปสถานะรถยนต์
   */
  private async getVehicleStatusSummary() {
    const total = await this.vehicleRepository.count();
    const available = await this.vehicleRepository.count({ where: { status: VehicleStatus.AVAILABLE } });
    const inUse = await this.vehicleRepository.count({ where: { status: VehicleStatus.IN_USE } });
    const maintenance = await this.vehicleRepository.count({ where: { status: VehicleStatus.MAINTENANCE } });
    const lockedForEvent = await this.vehicleRepository.count({
      where: { status: VehicleStatus.LOCKED_FOR_EVENT }
    });
    const unavailable = await this.vehicleRepository.count({
      where: { status: VehicleStatus.UNAVAILABLE }
    });

    return {
      total,
      available,
      inUse,
      maintenance,
      lockedForEvent,
      unavailable,
    };
  }

  /**
   * Helper: สรุปสถานะงาน
   */
  private async getEventStatusSummary() {
    const total = await this.eventRepository.count();
    const planning = await this.eventRepository.count({ where: { status: EventStatus.PLANNING } });
    const preparing = await this.eventRepository.count({ where: { status: EventStatus.PREPARING } });
    const inProgress = await this.eventRepository.count({ where: { status: EventStatus.IN_PROGRESS } });
    const completed = await this.eventRepository.count({ where: { status: EventStatus.COMPLETED } });
    const cancelled = await this.eventRepository.count({ where: { status: EventStatus.CANCELLED } });
    const overdue = await this.eventRepository.count({ where: { status: EventStatus.OVERDUE } });

    return {
      total,
      planning,
      preparing,
      inProgress,
      completed,
      cancelled,
      overdue,
    };
  }

  /**
   * Helper: สรุปสถานะทดลองขับ
   */
  private async getTestDriveStatusSummary() {
    const total = await this.testDriveRepository.count();
    const pending = await this.testDriveRepository.count({ where: { status: 'pending' } });
    const ongoing = await this.testDriveRepository.count({ where: { status: 'ongoing' } });
    const completed = await this.testDriveRepository.count({ where: { status: 'completed' } });
    const cancelled = await this.testDriveRepository.count({ where: { status: 'cancelled' } });

    return {
      total,
      pending,
      ongoing,
      completed,
      cancelled,
    };
  }
}

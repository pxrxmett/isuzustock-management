import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, In } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventVehicle } from './entities/event-vehicle.entity';
import { Vehicle, VehicleStatus } from '../stock/entities/vehicle.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { SearchEventDto } from './dto/search-event.dto';
import { AssignVehicleDto, AssignMultipleVehiclesDto } from './dto/assign-vehicle.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { EventStatus } from './entities/event-status.enum';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(EventVehicle)
    private eventVehicleRepository: Repository<EventVehicle>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  // สร้าง Event ใหม่
  async create(createEventDto: CreateEventDto): Promise<Event> {
    // ตรวจสอบวันที่
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('วันที่สิ้นสุดต้องมากกว่าหรือเท่ากับวันที่เริ่มต้น');
    }

    const event = this.eventRepository.create(createEventDto);
    const savedEvent = await this.eventRepository.save(event);

    this.logger.log(`Event created: ${savedEvent.id} - ${savedEvent.title}`);
    return savedEvent;
  }

  // ค้นหา Events พร้อม filters และ pagination
  async findAll(searchDto: SearchEventDto) {
    const {
      status,
      type,
      startDate,
      endDate,
      search,
      isActive,
      page = 1,
      limit = 10,
    } = searchDto;

    const query = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.creator', 'creator')
      .leftJoinAndSelect('event.eventVehicles', 'eventVehicles')
      .leftJoinAndSelect('eventVehicles.vehicle', 'vehicle');

    // Filters
    if (status) {
      query.andWhere('event.status = :status', { status });
    }

    if (type) {
      query.andWhere('event.type = :type', { type });
    }

    if (startDate && endDate) {
      query.andWhere('event.startDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (search) {
      query.andWhere('(event.title LIKE :search OR event.description LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (isActive !== undefined) {
      query.andWhere('event.isActive = :isActive', { isActive });
    }

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    // Order by start date descending
    query.orderBy('event.startDate', 'DESC');

    const [events, total] = await query.getManyAndCount();

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ดึงข้อมูล Event ตาม ID
  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['creator', 'eventVehicles', 'eventVehicles.vehicle'],
    });

    if (!event) {
      throw new NotFoundException(`ไม่พบงาน ID: ${id}`);
    }

    return event;
  }

  // อัปเดต Event
  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    // ตรวจสอบวันที่ถ้ามีการเปลี่ยน
    if (updateEventDto.startDate || updateEventDto.endDate) {
      const startDate = new Date(updateEventDto.startDate || event.startDate);
      const endDate = new Date(updateEventDto.endDate || event.endDate);

      if (endDate < startDate) {
        throw new BadRequestException('วันที่สิ้นสุดต้องมากกว่าหรือเท่ากับวันที่เริ่มต้น');
      }
    }

    Object.assign(event, updateEventDto);
    const updated = await this.eventRepository.save(event);

    this.logger.log(`Event updated: ${id}`);
    return updated;
  }

  // ลบ Event (soft delete)
  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);

    // ตรวจสอบว่า event กำลังดำเนินการอยู่หรือไม่
    if (event.status === EventStatus.IN_PROGRESS) {
      throw new BadRequestException('ไม่สามารถลบงานที่กำลังดำเนินการอยู่ได้');
    }

    // ปลดล็อครถทั้งหมด
    await this.unlockVehicles(id);

    // ลบ Event
    await this.eventRepository.remove(event);
    this.logger.log(`Event deleted: ${id}`);
  }

  // Assign รถเข้า Event
  async assignVehicle(eventId: string, assignDto: AssignVehicleDto): Promise<EventVehicle> {
    const event = await this.findOne(eventId);
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: assignDto.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException(`ไม่พบรถ ID: ${assignDto.vehicleId}`);
    }

    // ตรวจสอบว่ารถถูก lock สำหรับ event อื่นอยู่หรือไม่
    if (vehicle.isLockedForEvent && vehicle.currentEventId !== eventId) {
      throw new ConflictException(`รถถูกล็อคสำหรับงานอื่นอยู่ (Event ID: ${vehicle.currentEventId})`);
    }

    // ตรวจสอบว่ารถถูก assign ไว้แล้วหรือไม่
    const existing = await this.eventVehicleRepository.findOne({
      where: { eventId, vehicleId: assignDto.vehicleId },
    });

    if (existing) {
      throw new ConflictException('รถถูก assign เข้างานนี้แล้ว');
    }

    // สร้าง assignment
    const eventVehicle = this.eventVehicleRepository.create({
      eventId,
      vehicleId: assignDto.vehicleId,
      assignedBy: assignDto.assignedBy,
      notes: assignDto.notes,
    });

    await this.eventVehicleRepository.save(eventVehicle);

    // อัปเดต vehicle status และ lock
    vehicle.isLockedForEvent = true;
    vehicle.currentEventId = eventId;
    vehicle.status = VehicleStatus.LOCKED_FOR_EVENT;
    vehicle.eventLockStartDate = event.startDate;
    vehicle.eventLockEndDate = event.endDate;
    await this.vehicleRepository.save(vehicle);

    // อัปเดต vehicleCount
    event.vehicleCount = await this.eventVehicleRepository.count({ where: { eventId } });
    await this.eventRepository.save(event);

    this.logger.log(`Vehicle ${assignDto.vehicleId} assigned to event ${eventId}`);
    return eventVehicle;
  }

  // Assign รถหลายคันเข้า Event พร้อมกัน
  async assignMultipleVehicles(
    eventId: string,
    assignDto: AssignMultipleVehiclesDto,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const event = await this.findOne(eventId);
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    for (const vehicleId of assignDto.vehicleIds) {
      try {
        await this.assignVehicle(eventId, {
          vehicleId,
          assignedBy: assignDto.assignedBy,
          notes: assignDto.notes,
        });
        success++;
      } catch (error) {
        failed++;
        errors.push(`Vehicle ${vehicleId}: ${error.message}`);
      }
    }

    this.logger.log(`Batch assign to event ${eventId}: ${success} success, ${failed} failed`);
    return { success, failed, errors };
  }

  // ลบรถออกจาก Event
  async unassignVehicle(eventId: string, vehicleId: number): Promise<void> {
    const eventVehicle = await this.eventVehicleRepository.findOne({
      where: { eventId, vehicleId },
    });

    if (!eventVehicle) {
      throw new NotFoundException('ไม่พบรถในงานนี้');
    }

    // ลบ assignment
    await this.eventVehicleRepository.remove(eventVehicle);

    // ปลดล็อครถ
    const vehicle = await this.vehicleRepository.findOne({ where: { id: vehicleId } });
    if (vehicle) {
      vehicle.isLockedForEvent = false;
      vehicle.currentEventId = null as any;
      vehicle.status = VehicleStatus.AVAILABLE;
      vehicle.eventLockStartDate = null as any;
      vehicle.eventLockEndDate = null as any;
      await this.vehicleRepository.save(vehicle);
    }

    // อัปเดต vehicleCount
    const event = await this.findOne(eventId);
    event.vehicleCount = await this.eventVehicleRepository.count({ where: { eventId } });
    await this.eventRepository.save(event);

    this.logger.log(`Vehicle ${vehicleId} unassigned from event ${eventId}`);
  }

  // ดึงรถทั้งหมดใน Event
  async getEventVehicles(eventId: string) {
    await this.findOne(eventId); // ตรวจสอบว่า event มีอยู่

    const eventVehicles = await this.eventVehicleRepository.find({
      where: { eventId },
      relations: ['vehicle'],
    });

    return eventVehicles.map((ev) => ({
      ...ev.vehicle,
      assignedAt: ev.assignedAt,
      notes: ev.notes,
      assignedBy: ev.assignedBy,
    }));
  }

  // เปลี่ยนสถานะ Event
  async updateStatus(id: string, updateStatusDto: UpdateEventStatusDto): Promise<Event> {
    const event = await this.findOne(id);
    event.status = updateStatusDto.status;

    // ถ้าเป็นสถานะ completed หรือ cancelled ให้ปลดล็อครถ
    if (
      updateStatusDto.status === EventStatus.COMPLETED ||
      updateStatusDto.status === EventStatus.CANCELLED
    ) {
      await this.unlockVehicles(id);
    }

    const updated = await this.eventRepository.save(event);
    this.logger.log(`Event ${id} status changed to ${updateStatusDto.status}`);
    return updated;
  }

  // ดึงข้อมูลสำหรับ Calendar view
  async getCalendarEvents(startDate: string, endDate: string) {
    const events = await this.eventRepository.find({
      where: {
        startDate: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['eventVehicles'],
      order: {
        startDate: 'ASC',
      },
    });

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      status: event.status,
      location: event.location,
      vehicleCount: event.vehicleCount,
    }));
  }

  // Helper: ปลดล็อครถทั้งหมดใน Event
  private async unlockVehicles(eventId: string): Promise<void> {
    const eventVehicles = await this.eventVehicleRepository.find({
      where: { eventId },
    });

    for (const ev of eventVehicles) {
      const vehicle = await this.vehicleRepository.findOne({ where: { id: ev.vehicleId } });
      if (vehicle && vehicle.currentEventId === eventId) {
        vehicle.isLockedForEvent = false;
        vehicle.currentEventId = null as any;
        vehicle.status = VehicleStatus.AVAILABLE;
        vehicle.eventLockStartDate = null as any;
        vehicle.eventLockEndDate = null as any;
        await this.vehicleRepository.save(vehicle);
      }
    }

    this.logger.log(`All vehicles unlocked for event ${eventId}`);
  }
}

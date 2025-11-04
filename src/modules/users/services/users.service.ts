import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { UserSettings } from '../../auth/entities/user-settings.entity';
import { UpdateProfileDto } from '../../auth/dto/update-profile.dto';
import { UpdateNotificationSettingsDto } from '../../auth/dto/update-notification-settings.dto';
import { UpdateSystemSettingsDto } from '../../auth/dto/update-system-settings.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSettings)
    private userSettingsRepository: Repository<UserSettings>,
  ) {}

  // Get user profile
  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'username',
        'email',
        'firstName',
        'lastName',
        'nickname',
        'phone',
        'position',
        'role',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    return user;
  }

  // Update user profile
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    // Check if email is being changed and if it's already taken
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateProfileDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    // Update user fields
    Object.assign(user, updateProfileDto);

    await this.userRepository.save(user);

    // Return without password
    delete (user as any).passwordHash;
    return user;
  }

  // Get or create user settings
  async getOrCreateSettings(userId: string): Promise<UserSettings> {
    let settings = await this.userSettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = this.userSettingsRepository.create({
        userId,
      });
      await this.userSettingsRepository.save(settings);
    }

    return settings;
  }

  // Update notification settings
  async updateNotificationSettings(
    userId: string,
    updateDto: UpdateNotificationSettingsDto,
  ): Promise<UserSettings> {
    const settings = await this.getOrCreateSettings(userId);

    // Map frontend field names to entity field names
    if (updateDto.email !== undefined) settings.notifyEmail = updateDto.email;
    if (updateDto.line !== undefined) settings.notifyLine = updateDto.line;
    if (updateDto.newQueue !== undefined) settings.notifyNewQueue = updateDto.newQueue;
    if (updateDto.queueStatus !== undefined)
      settings.notifyQueueStatus = updateDto.queueStatus;
    if (updateDto.events !== undefined) settings.notifyEvents = updateDto.events;

    return await this.userSettingsRepository.save(settings);
  }

  // Update system settings
  async updateSystemSettings(
    userId: string,
    updateDto: UpdateSystemSettingsDto,
  ): Promise<UserSettings> {
    const settings = await this.getOrCreateSettings(userId);

    if (updateDto.language !== undefined) settings.language = updateDto.language;
    if (updateDto.timezone !== undefined) settings.timezone = updateDto.timezone;
    if (updateDto.dateFormat !== undefined) settings.dateFormat = updateDto.dateFormat;
    if (updateDto.darkMode !== undefined) settings.darkMode = updateDto.darkMode;

    return await this.userSettingsRepository.save(settings);
  }

  // Get user settings
  async getSettings(userId: string): Promise<UserSettings> {
    return await this.getOrCreateSettings(userId);
  }
}

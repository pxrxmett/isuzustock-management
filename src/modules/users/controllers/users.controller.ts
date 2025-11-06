import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UsersService } from '../services/users.service';
import { UpdateProfileDto } from '../../auth/dto/update-profile.dto';
import { UpdateNotificationSettingsDto } from '../../auth/dto/update-notification-settings.dto';
import { UpdateSystemSettingsDto } from '../../auth/dto/update-system-settings.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@Request() req) {
    return await this.usersService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return await this.usersService.updateProfile(
      req.user.userId,
      updateProfileDto,
    );
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get user settings' })
  @ApiResponse({ status: 200, description: 'Returns user settings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSettings(@Request() req) {
    return await this.usersService.getSettings(req.user.userId);
  }

  @Patch('settings/notifications')
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({
    status: 200,
    description: 'Notification settings updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateNotificationSettings(
    @Request() req,
    @Body() updateDto: UpdateNotificationSettingsDto,
  ) {
    return await this.usersService.updateNotificationSettings(
      req.user.userId,
      updateDto,
    );
  }

  @Patch('settings/system')
  @ApiOperation({ summary: 'Update system settings' })
  @ApiResponse({
    status: 200,
    description: 'System settings updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateSystemSettings(
    @Request() req,
    @Body() updateDto: UpdateSystemSettingsDto,
  ) {
    return await this.usersService.updateSystemSettings(
      req.user.userId,
      updateDto,
    );
  }
}

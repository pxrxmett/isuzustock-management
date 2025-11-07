import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
  Get,
  Req,
  UseGuards,
  UnauthorizedException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

// เพิ่ม interface นี้เพื่อกำหนดประเภทของ Request ที่มี user property
interface RequestWithUser extends Request {
  user: any;
}

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'เข้าสู่ระบบ' })
  @ApiResponse({
    status: 200,
    description: 'เข้าสู่ระบบสำเร็จ'
  })
  @ApiResponse({
    status: 400,
    description: 'ข้อมูลไม่ถูกต้อง'
  })
  async login(
    @Body() loginDto: LoginDto
  ) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('line-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'เข้าสู่ระบบผ่าน LINE' })
  @ApiResponse({
    status: 200,
    description: 'เข้าสู่ระบบสำเร็จ'
  })
  @ApiResponse({
    status: 401,
    description: 'ไม่พบการเชื่อมโยงบัญชี LINE กับพนักงาน'
  })
  async lineLogin(@Body() lineData: { accessToken: string }) {
    try {
      return await this.authService.validateLineUser(lineData.accessToken);
    } catch (error) {
      throw new HttpException(
        error.message || 'เข้าสู่ระบบด้วย LINE ไม่สำเร็จ',
        error.status || HttpStatus.UNAUTHORIZED
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ดึงข้อมูลผู้ใช้ปัจจุบัน' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูลผู้ใช้สำเร็จ'
  })
  @ApiResponse({
    status: 401,
    description: 'ไม่ได้รับอนุญาตให้เข้าถึง'
  })
  async getProfile(@Req() req: RequestWithUser) { // เปลี่ยนประเภทจาก Request เป็น RequestWithUser
    console.log('📍 GET /api/auth/me called');
    console.log('👤 req.user:', req.user);

    if (!req.user) {
      console.error('❌ No user in request');
      throw new UnauthorizedException('Authentication failed');
    }

    console.log('✅ Returning user profile for:', req.user.id);

    // ✅ Return req.user โดยตรง - ไม่ต้อง query database อีก
    // JwtStrategy ได้ validate และเตรียมข้อมูลมาให้แล้ว
    return {
      success: true,
      user: req.user,
    };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'รีเฟรชโทเคน' })
  @ApiResponse({
    status: 200,
    description: 'รีเฟรชโทเคนสำเร็จ'
  })
  @ApiResponse({
    status: 401,
    description: 'โทเคนไม่ถูกต้องหรือหมดอายุ'
  })
  async refreshToken(@Body() tokenData: { accessToken: string }) {
    try {
      return await this.authService.refreshToken(tokenData.accessToken);
    } catch (error) {
      throw new HttpException(
        error.message || 'ไม่สามารถรีเฟรชโทเคนได้',
        error.status || HttpStatus.UNAUTHORIZED
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'เปลี่ยนรหัสผ่าน' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'เปลี่ยนรหัสผ่านสำเร็จ'
  })
  @ApiResponse({
    status: 400,
    description: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
  })
  @ApiResponse({
    status: 401,
    description: 'ไม่ได้รับอนุญาต'
  })
  @ApiResponse({
    status: 404,
    description: 'ไม่พบข้อมูลผู้ใช้'
  })
  async changePassword(
    @Req() req: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      return await this.authService.changePassword(
        req.user.id,
        changePasswordDto,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(private jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    if (loginDto.username === 'admin' && loginDto.password === 'admin123') {
      const payload = {
        id: 1,
        username: loginDto.username,
        role: 'admin'
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: payload,
      };
    }

    throw new UnauthorizedException('รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token ไม่ถูกต้องหรือหมดอายุ');
    }
  }

  // เพิ่มเมธอดสำหรับการตรวจสอบข้อมูลผู้ใช้ปัจจุบัน
  async getUserProfile(user: any) {
    try {
      // เนื่องจากเราไม่มีการเชื่อมต่อกับฐานข้อมูลจริงๆ ในตัวอย่างนี้
      // เราจะส่งคืนข้อมูลผู้ใช้จาก user payload ที่อยู่ใน JWT
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        // เพิ่มข้อมูลอื่นๆ ตามต้องการ
      };
    } catch (error) {
      this.logger.error(`เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้: ${error.message}`);
      throw new UnauthorizedException('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
    }
  }

  // เพิ่มเมธอดสำหรับการรีเฟรช token
  async refreshToken(accessToken: string) {
    try {
      // 1. ตรวจสอบ token เดิม
      const decodedToken = this.jwtService.verify(accessToken);
      
      // 2. เนื่องจากเราไม่มีการเชื่อมต่อกับฐานข้อมูลจริงๆ ในตัวอย่างนี้
      // เราจะใช้ข้อมูลจาก token เดิมเพื่อสร้าง token ใหม่
      const payload = {
        id: decodedToken.id,
        username: decodedToken.username,
        role: decodedToken.role,
      };

      // 3. สร้าง token ใหม่
      return {
        success: true,
        access_token: this.jwtService.sign(payload),
        user: {
          id: payload.id,
          username: payload.username,
          role: payload.role,
        },
      };
    } catch (error) {
      this.logger.error(`เกิดข้อผิดพลาดในการรีเฟรชโทเคน: ${error.message}`);
      throw new UnauthorizedException('Token ไม่ถูกต้องหรือหมดอายุ');
    }
  }

  // เพิ่มเมธอดสำหรับการตรวจสอบ user จาก LINE token
  async validateLineUser(lineAccessToken: string) {
    try {
      // ในตัวอย่างนี้เราจะจำลองการตรวจสอบ LINE token
      // ในการใช้งานจริงคุณจะต้องเรียก LINE API เพื่อตรวจสอบ token
      
      // สมมติว่าเราได้ข้อมูล LINE profile แล้ว
      const lineProfile = {
        userId: 'line-user-id',
        displayName: 'LINE User',
      };
      
      // สร้าง payload สำหรับ JWT
      const payload = {
        id: 2, // สมมติเป็น ID ของผู้ใช้ที่เชื่อมโยงกับ LINE
        username: lineProfile.displayName,
        role: 'user',
        lineUserId: lineProfile.userId,
      };
      
      return {
        success: true,
        access_token: this.jwtService.sign(payload),
        user: {
          id: payload.id,
          username: payload.username,
          role: payload.role,
        },
      };
    } catch (error) {
      this.logger.error(`เกิดข้อผิดพลาดในการตรวจสอบ LINE token: ${error.message}`);
      throw new UnauthorizedException('ไม่สามารถตรวจสอบบัญชี LINE ได้');
    }
  }
}

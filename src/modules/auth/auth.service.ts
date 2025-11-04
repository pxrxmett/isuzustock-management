import { Injectable, UnauthorizedException, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async login(loginDto: LoginDto) {
    // ค้นหา user จาก database
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
    });

    // ตรวจสอบว่ามี user และรหัสผ่านถูกต้อง
    if (!user) {
      this.logger.warn(`Failed login attempt for username: ${loginDto.username}`);
      throw new UnauthorizedException('รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    // ตรวจสอบสถานะ user
    if (user.status !== 'active') {
      this.logger.warn(`Inactive user login attempt: ${loginDto.username}`);
      throw new UnauthorizedException('บัญชีผู้ใช้ถูกระงับหรือไม่ได้ใช้งาน');
    }

    // เปรียบเทียบรหัสผ่านด้วย bcrypt
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for username: ${loginDto.username}`);
      throw new UnauthorizedException('รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    // อัปเดต lastLoginAt
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // สร้าง JWT payload
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    this.logger.log(`Successful login for user: ${user.username}`);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
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
      // ดึงข้อมูล user จาก database
      const userData = await this.userRepository.findOne({
        where: { id: user.id },
        select: ['id', 'username', 'email', 'firstName', 'lastName', 'role', 'status', 'lastLoginAt'],
      });

      if (!userData) {
        throw new UnauthorizedException('ไม่พบข้อมูลผู้ใช้');
      }

      return {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        status: userData.status,
        lastLoginAt: userData.lastLoginAt,
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

      // 2. ตรวจสอบว่า user ยังมีอยู่ในระบบและ active
      const user = await this.userRepository.findOne({
        where: { id: decodedToken.id },
      });

      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('บัญชีผู้ใช้ไม่พร้อมใช้งาน');
      }

      // 3. สร้าง token ใหม่
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      return {
        success: true,
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
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

  // เมธอดสำหรับการเปลี่ยนรหัสผ่าน
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    // ค้นหา user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('ไม่พบข้อมูลผู้ใช้');
    }

    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    }

    // Hash รหัสผ่านใหม่
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      saltRounds,
    );

    // อัปเดตรหัสผ่าน
    await this.userRepository.update(userId, {
      passwordHash: hashedPassword,
    });

    this.logger.log(`รหัสผ่านของผู้ใช้ ${user.username} ถูกเปลี่ยนแปลงเรียบร้อยแล้ว`);

    return {
      success: true,
      message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',
    };
  }
}

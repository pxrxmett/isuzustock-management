import { Injectable, UnauthorizedException, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from './entities/user.entity';
import { Staff } from '../staff/entities/staff.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 1. ค้นหาจาก User table ก่อน
    let user = await this.userRepository.findOne({
      where: { username },
    });

    let accountType = 'user';

    /*
     * ⏸️ TEMPORARILY DISABLED - Staff Username/Password Login
     * TODO: Enable when adding username/password columns to staffs table
     *
     * NOTE: Staff login now uses LINE Integration only
     * Use /api/line-integration/check endpoint for staff authentication
     */
    // 2. ถ้าไม่เจอ ค้นหาจาก Staff table
    // if (!user) {
    //   const staff = await this.staffRepository.findOne({
    //     where: { username },
    //   });
    //
    //   if (staff) {
    //     accountType = 'staff';
    //     // แปลง Staff เป็น User-like object
    //     user = {
    //       id: staff.id,
    //       username: staff.username,
    //       email: staff.email,
    //       passwordHash: staff.passwordHash,
    //       firstName: staff.firstName,
    //       lastName: staff.lastName,
    //       role: staff.role,
    //       status: staff.status,
    //     } as any;
    //   }
    // }

    // 3. ตรวจสอบว่ามี user หรือไม่ (Admin only)
    if (!user || !user.passwordHash) {
      this.logger.warn(`❌ Failed login attempt for username: ${username}`);
      throw new UnauthorizedException('รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    // 4. ตรวจสอบสถานะ user
    if (user.status !== 'active') {
      this.logger.warn(`❌ Inactive ${accountType} login attempt: ${username}`);
      throw new UnauthorizedException('บัญชีผู้ใช้ถูกระงับหรือไม่ได้ใช้งาน');
    }

    // 5. เปรียบเทียบรหัสผ่านด้วย bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      this.logger.warn(`❌ Invalid password for username: ${username}`);
      throw new UnauthorizedException('รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    // 6. อัปเดต lastLoginAt
    if (accountType === 'user') {
      await this.userRepository.update(user.id, {
        lastLoginAt: new Date(),
      });
    } else {
      await this.staffRepository.update(user.id, {
        lineLastLoginAt: new Date(),
      });
    }

    // 7. สร้าง JWT payload
    const payload = {
      sub: user.id,
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      accountType, // 'user' or 'staff'
    };

    this.logger.log(`✅ Successful ${accountType} login: ${user.username}`);

    return {
      accessToken: this.jwtService.sign(payload),
      token: this.jwtService.sign(payload), // alias for consistency
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accountType,
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
      const accountType = user.accountType || 'user';

      // ดึงข้อมูลจาก User หรือ Staff ตาม accountType
      if (accountType === 'staff') {
        /*
         * ⏸️ TEMPORARILY DISABLED - Staff Profile with Username
         * NOTE: Staff entity no longer has username field
         * Staff authentication is LINE-only via /api/line-integration/check
         */
        // const staffData = await this.staffRepository.findOne({
        //   where: { id: user.id },
        // });

        // if (!staffData) {
        //   throw new UnauthorizedException('ไม่พบข้อมูลพนักงาน');
        // }

        // return {
        //   id: staffData.id,
        //   username: staffData.username,  // ❌ doesn't exist
        //   email: staffData.email,
        //   firstName: staffData.firstName,
        //   lastName: staffData.lastName,
        //   staffCode: staffData.staffCode,
        //   department: staffData.department,
        //   position: staffData.position,
        //   role: staffData.role,
        //   status: staffData.status,
        //   lastLoginAt: staffData.lineLastLoginAt,
        //   accountType: 'staff',
        // };

        // Staff should use LINE integration endpoints instead
        throw new UnauthorizedException(
          'Staff accounts must authenticate via LINE integration',
        );
      }

      // Default: ดึงข้อมูล user จาก database
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
        accountType: 'user',
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
        accessToken: this.jwtService.sign(payload),
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
        accessToken: this.jwtService.sign(payload),
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
    const hashedPassword = await this.hashPassword(changePasswordDto.newPassword);

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

  /**
   * Hash password with bcrypt
   * @param password Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hashed password
   * @param password Plain text password
   * @param hashedPassword Hashed password from database
   * @returns True if password matches
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

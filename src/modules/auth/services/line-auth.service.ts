import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity';
import { LineProfile } from '../entities/line-profile.entity';
import { LineUser } from '../../line-integration/entities/line-user.entity';
import { LineLoginDto } from '../dto/line-login.dto';
import { AuthResponse } from '../interfaces/auth-response.interface';
import axios from 'axios';

@Injectable()
export class LineAuthService {
  private readonly logger = new Logger(LineAuthService.name);

  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(LineProfile)
    private lineProfileRepository: Repository<LineProfile>,
    @InjectRepository(LineUser)
    private lineUserRepository: Repository<LineUser>,
    private jwtService: JwtService,
  ) {}

  /**
   * เข้าสู่ระบบผ่าน LINE API
   * @param lineLoginDto ข้อมูลการเข้าสู่ระบบผ่าน LINE
   * @returns ข้อมูลการเข้าสู่ระบบและ token สำหรับใช้งานระบบ
   */
  async lineLogin(lineLoginDto: LineLoginDto): Promise<AuthResponse> {
    try {
      const { accessToken } = lineLoginDto;

      // ตรวจสอบ LINE token และดึงข้อมูลผู้ใช้จาก LINE
      const lineProfile = await this.verifyLineToken(accessToken);
      if (!lineProfile) {
        throw new HttpException('LINE Token ไม่ถูกต้อง', HttpStatus.UNAUTHORIZED);
      }

      // เพิ่ม: บันทึกหรืออัปเดตข้อมูลใน line_profiles
      await this.saveOrUpdateLineProfile(lineProfile);

      // เพิ่ม: บันทึกหรืออัปเดตข้อมูลใน line_users (ไม่ว่าจะเชื่อมโยงหรือไม่)
      // ตรวจสอบว่ามี line_users record หรือไม่
      let lineUser = await this.lineUserRepository.findOne({
        where: { lineUserId: lineProfile.userId },
      });

      if (!lineUser) {
        // สร้าง LINE User ใหม่ (ยังไม่ได้เชื่อมโยงกับพนักงาน)
        lineUser = new LineUser();
        lineUser.lineUserId = lineProfile.userId;
        lineUser.displayName = lineProfile.displayName;
        lineUser.pictureUrl = lineProfile.pictureUrl;
        lineUser.accessToken = accessToken;
        // กำหนดวันหมดอายุ token (ตัวอย่าง: 30 วัน)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        lineUser.tokenExpiresAt = expiryDate;
        await this.lineUserRepository.save(lineUser);
        this.logger.log(`สร้าง LINE User ใหม่: ${lineProfile.userId}`);
      }

      // ค้นหาพนักงานที่เชื่อมโยงกับ LINE User ID (ใช้ LineUser table)
      let staff: Staff | null = null;
      if (lineUser.staffId) {
        staff = await this.staffRepository.findOne({
          where: { id: lineUser.staffId },
          relations: ['brand'], // Include brand relation
        });
      }

      // ตรวจสอบว่ามีการเชื่อมโยงกับพนักงานหรือไม่
      if (!staff) {
        // ไม่พบการเชื่อมโยง - ส่ง response พิเศษกลับไป (ไม่ throw error)
        this.logger.warn(`LINE User ${lineProfile.userId} ยังไม่ได้เชื่อมโยงกับพนักงาน`);

        return {
          error: 'STAFF_NOT_LINKED',
          message: 'ยังไม่ได้เชื่อมโยงบัญชี LINE กับพนักงาน',
          lineUser: {
            userId: lineProfile.userId,
            displayName: lineProfile.displayName,
            pictureUrl: lineProfile.pictureUrl,
          },
        } as any;
      }

      // เพิ่ม: อัปเดตข้อมูลใน line_users เมื่อเชื่อมโยงแล้ว
      await this.saveOrUpdateLineUser(lineProfile.userId, staff.id, accessToken);

      // ตรวจสอบสถานะพนักงาน
      if (staff.status !== 'active') {
        throw new HttpException(
          'บัญชีพนักงานไม่อยู่ในสถานะที่ใช้งานได้',
          HttpStatus.FORBIDDEN,
        );
      }

      // สร้าง payload สำหรับ JWT token
      const payload = {
        sub: staff.id,
        employeeCode: staff.employeeCode,
        role: staff.role,
        brandId: staff.brandId,
        brandCode: staff.brand?.code,
        iat: Math.floor(Date.now() / 1000),
      };

      // สร้าง JWT token
      const token = this.jwtService.sign(payload, {
        expiresIn: '1d', // token หมดอายุใน 1 วัน
      });

      // อัปเดต lastLoginAt ใน LineProfile
      await this.updateLineProfileLastLogin(lineProfile.userId);

      this.logger.log(`ผู้ใช้ ${staff.employeeCode} เข้าสู่ระบบสำเร็จผ่าน LINE`);

      // ส่งข้อมูลการเข้าสู่ระบบกลับไป
      return {
        token,
        user: {
          id: staff.id,
          employeeCode: staff.employeeCode,
          fullName: staff.fullName,
          fullNameEn: staff.fullNameEn,
          brandId: staff.brandId,
          brandCode: staff.brand?.code,
          email: staff.email,
          phone: staff.phone,
          role: staff.role,
          status: staff.status,
          lineProfile: {
            userId: lineProfile.userId,
            displayName: lineProfile.displayName,
            pictureUrl: lineProfile.pictureUrl,
          },
        },
      };
    } catch (error) {
      this.logger.error(`การเข้าสู่ระบบผ่าน LINE ล้มเหลว: ${error.message}`, error.stack);

      // ส่งข้อความ error ที่เหมาะสมกลับไป
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'เกิดข้อผิดพลาดในการเข้าสู่ระบบผ่าน LINE',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * บันทึกหรืออัปเดตข้อมูล LINE Profile
   * @param lineProfileData ข้อมูล LINE Profile จาก LINE API
   */
  private async saveOrUpdateLineProfile(lineProfileData: any) {
    try {
      // ค้นหา LINE Profile ที่มีอยู่
      let profile = await this.lineProfileRepository.findOne({
        where: { lineUserId: lineProfileData.userId },
      });

      if (!profile) {
        // สร้าง LINE Profile ใหม่
        profile = new LineProfile();
        profile.lineUserId = lineProfileData.userId;
      }

      // อัปเดตข้อมูล
      profile.displayName = lineProfileData.displayName;
      profile.pictureUrl = lineProfileData.pictureUrl;
      profile.statusMessage = lineProfileData.statusMessage || '';
      profile.lastLoginAt = new Date();

      // บันทึกข้อมูล
      await this.lineProfileRepository.save(profile);
      this.logger.log(`บันทึกหรืออัปเดตข้อมูล LINE Profile สำหรับ userId: ${lineProfileData.userId}`);
    } catch (error) {
      this.logger.error(`การบันทึกข้อมูล LINE Profile ล้มเหลว: ${error.message}`);
      // ไม่ throw error เพื่อไม่ให้กระทบต่อการล็อกอิน
    }
  }

  /**
   * บันทึกหรืออัปเดตข้อมูล LINE User
   * @param lineUserId LINE User ID จาก LINE API
   * @param staffId ID ของพนักงานที่เชื่อมโยง (number type)
   * @param accessToken LINE Access Token
   */
  private async saveOrUpdateLineUser(lineUserId: string, staffId: number, accessToken: string) {
    try {
      // ค้นหา LINE User ที่มีอยู่
      let lineUser = await this.lineUserRepository.findOne({
        where: { lineUserId },
      });

      if (!lineUser) {
        // สร้าง LINE User ใหม่
        lineUser = new LineUser();
        lineUser.lineUserId = lineUserId;
      }

      // อัปเดตข้อมูล
      lineUser.staffId = staffId;
      lineUser.accessToken = accessToken;
      // กำหนดวันหมดอายุ token (ตัวอย่าง: 30 วัน)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      lineUser.tokenExpiresAt = expiryDate;

      // บันทึกข้อมูล
      await this.lineUserRepository.save(lineUser);
      this.logger.log(`บันทึกหรืออัปเดตข้อมูล LINE User สำหรับ userId: ${lineUserId}`);
    } catch (error) {
      this.logger.error(`การบันทึกข้อมูล LINE User ล้มเหลว: ${error.message}`);
      // ไม่ throw error เพื่อไม่ให้กระทบต่อการล็อกอิน
    }
  }

  /**
   * ตรวจสอบความถูกต้องของ LINE token และดึงข้อมูลผู้ใช้
   * @param accessToken LINE access token
   * @returns ข้อมูลผู้ใช้จาก LINE
   */
  private async verifyLineToken(accessToken: string) {
    try {
      const response = await axios.get('https://api.line.me/v2/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 5000, // กำหนด timeout 5 วินาที
      });

      return response.data;
    } catch (error) {
      this.logger.error(`การตรวจสอบ LINE token ล้มเหลว: ${error.message}`);

      // ระบุข้อผิดพลาดที่ชัดเจนตามสาเหตุ
      if (error.response) {
        // มีการตอบกลับจาก LINE API แต่เป็น error
        throw new HttpException(
          `ไม่สามารถตรวจสอบ LINE Token ได้: ${error.response.data?.message || error.response.statusText}`,
          error.response.status || HttpStatus.UNAUTHORIZED,
        );
      } else if (error.request) {
        // ไม่ได้รับการตอบกลับจาก LINE API
        throw new HttpException(
          'ไม่สามารถเชื่อมต่อกับ LINE API ได้',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw new HttpException(
        'เกิดข้อผิดพลาดในการตรวจสอบ LINE Token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * อัปเดตเวลาเข้าสู่ระบบล่าสุดใน LINE Profile
   * @param lineUserId LINE User ID
   */
  private async updateLineProfileLastLogin(lineUserId: string) {
    try {
      await this.lineProfileRepository.update(
        { lineUserId },
        { lastLoginAt: new Date() },
      );
      this.logger.log(`อัปเดตเวลาเข้าสู่ระบบล่าสุดสำหรับ LINE User: ${lineUserId}`);
    } catch (error) {
      this.logger.error(`การอัปเดตเวลาเข้าสู่ระบบล้มเหลว: ${error.message}`);
      // เราไม่ throw error ที่นี่เพื่อไม่ให้กระทบต่อการเข้าสู่ระบบ
    }
  }
}

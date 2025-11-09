import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Staff } from '../staff/entities/staff.entity';
import { CheckLineRegistrationDto } from './dto/check-line-registration.dto';
import { LinkStaffLineDto } from './dto/link-staff-line.dto';
import { SimpleLinkDto } from './dto/simple-link.dto';
import axios from 'axios';

@Injectable()
export class LineIntegrationService {
  private readonly logger = new Logger(LineIntegrationService.name);

  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    private jwtService: JwtService,
  ) {}

  /**
   * ตรวจสอบการลงทะเบียน LINE
   * @param checkLineDto ข้อมูลการตรวจสอบ
   * @returns ผลการตรวจสอบว่ามีการลงทะเบียนหรือไม่ พร้อม JWT token
   */
  async checkLineRegistration(checkLineDto: CheckLineRegistrationDto) {
    try {
      const { lineUserId } = checkLineDto;

      // ตรวจสอบว่า lineUserId มีการเชื่อมโยงกับพนักงานหรือไม่
      // ✅ ระบุ columns ที่ต้องการเพื่อหลีกเลี่ยง SELECT * ที่จะหา username
      const existingStaff = await this.staffRepository.findOne({
        where: { lineUserId },
        select: [
          'id',
          'staffCode',
          'firstName',
          'lastName',
          'position',
          'department',
          'phone',
          'email',
          'role',
          'status',
          'lineUserId',
          'lineDisplayName',
          'linePictureUrl',
          'lineLastLoginAt',
          'isLineLinked',
        ],
      });

      // ถ้าไม่พบการลงทะเบียน
      if (!existingStaff) {
        return {
          registered: false,
          staffInfo: null,
        };
      }

      // พบการลงทะเบียน - Generate JWT token
      const payload = {
        sub: existingStaff.id,
        id: existingStaff.id,
        staffCode: existingStaff.staffCode,
        lineUserId: existingStaff.lineUserId,
        role: existingStaff.role || 'staff',
        department: existingStaff.department,
      };

      const token = this.jwtService.sign(payload);

      // Log token creation for debugging
      console.log('🔑 Token created for staff:', existingStaff.staffCode);
      console.log('📦 Token payload:', JSON.stringify(payload, null, 2));

      // Verify token can be decoded (for debugging)
      try {
        const decoded = this.jwtService.decode(token);
        console.log('✅ Token decoded successfully, keys:', Object.keys(decoded));
      } catch (err) {
        console.error('❌ Token decode failed:', err.message);
      }

      // อัปเดต lastLoginAt
      await this.staffRepository.update(existingStaff.id, {
        lineLastLoginAt: new Date(),
      });

      this.logger.log(`✅ LINE login successful for staff: ${existingStaff.staffCode} (${existingStaff.lineUserId})`);

      return {
        registered: true,
        access_token: token, // ⭐ เปลี่ยนจาก "token" เป็น "access_token" เพื่อความสอดคล้อง
        user: {
          id: existingStaff.id,
          staffCode: existingStaff.staffCode,
          fullName: `${existingStaff.firstName} ${existingStaff.lastName}`,
          firstName: existingStaff.firstName,
          lastName: existingStaff.lastName,
          department: existingStaff.department,
          position: existingStaff.position,
          role: existingStaff.role || 'staff',
          lineUserId: existingStaff.lineUserId,
          lineDisplayName: existingStaff.lineDisplayName,
        },
      };
    } catch (error) {
      this.logger.error(`❌ การตรวจสอบการลงทะเบียน LINE ล้มเหลว: ${error.message}`);
      throw new HttpException(
        'เกิดข้อผิดพลาดในการตรวจสอบการลงทะเบียน LINE',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * เชื่อมโยง LINE กับพนักงาน
   * @param linkDto ข้อมูลการเชื่อมโยง
   * @returns ข้อมูลการเชื่อมโยงที่สำเร็จ
   */
  async linkLineToStaff(linkDto: LinkStaffLineDto) {
    try {
      const { staffCode, lineUserId, lineAccessToken } = linkDto;

      // 1. ตรวจสอบว่า line user id นี้เชื่อมโยงกับพนักงานอื่นไปแล้วหรือไม่
      // ✅ ระบุ columns ที่ต้องการ
      const existingLinkedStaff = await this.staffRepository.findOne({
        where: { lineUserId },
        select: ['id', 'staffCode', 'lineUserId'],
      });

      if (existingLinkedStaff) {
        throw new HttpException(
          'LINE นี้ได้เชื่อมโยงกับพนักงานอื่นแล้ว',
          HttpStatus.CONFLICT,
        );
      }

      // 2. ตรวจสอบว่ามีพนักงานที่มีรหัสตามที่ระบุหรือไม่
      // ✅ ระบุ columns ที่ต้องการ
      const staff = await this.staffRepository.findOne({
        where: { staffCode: staffCode },
        select: [
          'id',
          'staffCode',
          'firstName',
          'lastName',
          'position',
          'department',
          'phone',
          'email',
          'role',
          'status',
          'lineUserId',
          'lineDisplayName',
          'linePictureUrl',
          'lineLastLoginAt',
          'isLineLinked',
        ],
      });

      if (!staff) {
        throw new HttpException('ไม่พบข้อมูลพนักงาน', HttpStatus.NOT_FOUND);
      }

      if (staff.status !== 'active') {
        throw new HttpException(
          'พนักงานไม่อยู่ในสถานะที่สามารถเชื่อมโยงได้',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. ตรวจสอบ LINE Token และดึงข้อมูลผู้ใช้
      const lineProfile = await this.getLineProfile(lineAccessToken);

      // 4. ตรวจสอบว่า lineUserId ที่ได้จาก token ตรงกับที่ส่งมาหรือไม่
      if (lineProfile.userId !== lineUserId) {
        throw new HttpException(
          'LINE Token ไม่ตรงกับ LINE User ID ที่ระบุ',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 5. บันทึกข้อมูลการเชื่อมโยง
      staff.lineUserId = lineProfile.userId;
      staff.lineDisplayName = lineProfile.displayName;
      staff.linePictureUrl = lineProfile.pictureUrl;
      staff.lineLastLoginAt = new Date();

      await this.staffRepository.save(staff);

      this.logger.log(`เชื่อมโยง LINE สำเร็จ: Staff ${staffCode} กับ LINE User ${lineUserId}`);

      return {
        success: true,
        message: 'เชื่อมโยง LINE กับพนักงานสำเร็จ',
        staffInfo: {
          id: staff.id,
          staffCode: staff.staffCode, // แก้ไขจาก staff_code เป็น staffCode
          fullName: `${staff.firstName} ${staff.lastName}`, // แก้ไขจาก first_name, last_name เป็น firstName, lastName
        },
        lineInfo: {
          userId: lineProfile.userId,
          displayName: lineProfile.displayName,
        },
      };
    } catch (error) {
      this.logger.error(`การเชื่อมโยง LINE กับพนักงานล้มเหลว: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'เกิดข้อผิดพลาดในการเชื่อมโยง LINE กับพนักงาน',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * เชื่อมโยง LINE กับพนักงานแบบง่าย (สำหรับ LIFF App)
   * @param linkDto ข้อมูลการเชื่อมโยง
   * @returns ข้อมูลการเชื่อมโยงที่สำเร็จพร้อม JWT token
   */
  async linkStaffSimple(linkDto: SimpleLinkDto) {
    try {
      const { staffCode, lineUserId, lineDisplayName, linePictureUrl } = linkDto;

      console.log('📍 Simple Link Request:', {
        staffCode,
        lineUserId,
        hasDisplayName: !!lineDisplayName,
        hasPictureUrl: !!linePictureUrl,
      });

      // 1. ตรวจสอบว่า line user id นี้เชื่อมโยงกับพนักงานอื่นไปแล้วหรือไม่
      const existingLinkedStaff = await this.staffRepository.findOne({
        where: { lineUserId },
        select: ['id', 'staffCode', 'lineUserId', 'firstName', 'lastName'],
      });

      if (existingLinkedStaff) {
        console.log('❌ LINE already linked to:', existingLinkedStaff.staffCode);
        throw new HttpException(
          `LINE นี้ได้เชื่อมโยงกับพนักงาน ${existingLinkedStaff.staffCode} (${existingLinkedStaff.firstName} ${existingLinkedStaff.lastName}) แล้ว`,
          HttpStatus.CONFLICT,
        );
      }

      // 2. ตรวจสอบว่ามีพนักงานที่มีรหัสตามที่ระบุหรือไม่
      const staff = await this.staffRepository.findOne({
        where: { staffCode: staffCode },
        select: [
          'id',
          'staffCode',
          'firstName',
          'lastName',
          'position',
          'department',
          'phone',
          'email',
          'role',
          'status',
          'lineUserId',
          'lineDisplayName',
          'linePictureUrl',
          'lineLastLoginAt',
          'isLineLinked',
        ],
      });

      if (!staff) {
        console.log('❌ Staff not found:', staffCode);
        throw new HttpException(
          `ไม่พบข้อมูลพนักงานรหัส ${staffCode}`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (staff.status !== 'active') {
        console.log('❌ Staff inactive:', staffCode);
        throw new HttpException(
          'พนักงานไม่อยู่ในสถานะที่สามารถเชื่อมโยงได้',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. ตรวจสอบว่าพนักงานคนนี้เชื่อมโยง LINE อื่นอยู่หรือไม่
      if (staff.lineUserId && staff.lineUserId !== lineUserId) {
        console.log('❌ Staff already linked to another LINE:', staff.lineUserId);
        throw new HttpException(
          'พนักงานคนนี้ได้เชื่อมโยง LINE อื่นไว้แล้ว กรุณาติดต่อแอดมิน',
          HttpStatus.CONFLICT,
        );
      }

      // 4. บันทึกข้อมูลการเชื่อมโยง
      staff.lineUserId = lineUserId;
      if (lineDisplayName) staff.lineDisplayName = lineDisplayName;
      if (linePictureUrl) staff.linePictureUrl = linePictureUrl;
      staff.lineLastLoginAt = new Date();
      staff.isLineLinked = true;

      await this.staffRepository.save(staff);

      console.log('✅ Simple link successful:', staffCode, '<->', lineUserId);

      // 5. สร้าง JWT token
      const payload = {
        sub: staff.id,
        id: staff.id,
        staffCode: staff.staffCode,
        lineUserId: staff.lineUserId,
        role: staff.role || 'staff',
        department: staff.department,
      };

      const token = this.jwtService.sign(payload);

      this.logger.log(
        `✅ LINE linked successfully: Staff ${staffCode} <-> LINE User ${lineUserId}`,
      );

      return {
        success: true,
        message: 'เชื่อมโยง LINE กับพนักงานสำเร็จ',
        access_token: token,
        staff: {
          id: staff.id,
          staffCode: staff.staffCode,
          fullName: `${staff.firstName} ${staff.lastName}`,
          firstName: staff.firstName,
          lastName: staff.lastName,
          department: staff.department,
          position: staff.position,
          role: staff.role || 'staff',
          lineUserId: staff.lineUserId,
          lineDisplayName: staff.lineDisplayName,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Simple link failed: ${error.message}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'เกิดข้อผิดพลาดในการเชื่อมโยง LINE กับพนักงาน',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * ดึงข้อมูลพนักงานจาก ID
   * @param staffId ID ของพนักงาน
   * @returns ข้อมูลพนักงาน
   */
  async getStaffById(staffId: string) {
    try {
      // ✅ ระบุ columns ที่ต้องการ
      const staff = await this.staffRepository.findOne({
        where: { id: staffId },
        select: [
          'id',
          'staffCode',
          'firstName',
          'lastName',
          'position',
          'department',
          'phone',
          'email',
          'role',
          'status',
          'lineUserId',
          'lineDisplayName',
          'linePictureUrl',
          'lineLastLoginAt',
          'isLineLinked',
        ],
      });

      if (!staff) {
        throw new HttpException('ไม่พบข้อมูลพนักงาน', HttpStatus.NOT_FOUND);
      }

      return {
        id: staff.id,
        staffCode: staff.staffCode,
        firstName: staff.firstName,
        lastName: staff.lastName,
        position: staff.position,
        department: staff.department,
        status: staff.status,
        lineInfo: staff.lineUserId
          ? {
              userId: staff.lineUserId,
              displayName: staff.lineDisplayName,
              pictureUrl: staff.linePictureUrl,
              lastLoginAt: staff.lineLastLoginAt,
            }
          : null,
      };
    } catch (error) {
      this.logger.error(`การดึงข้อมูลพนักงานล้มเหลว: ${error.message}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * ดึงข้อมูล LINE Profile จาก LINE API
   * @param accessToken LINE Access Token
   * @returns ข้อมูล LINE Profile
   */
  private async getLineProfile(accessToken: string) {
    try {
      const response = await axios.get('https://api.line.me/v2/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 5000,
      });
      
      return response.data;
    } catch (error) {
      this.logger.error(`การดึงข้อมูล LINE Profile ล้มเหลว: ${error.message}`);
      
      if (error.response) {
        throw new HttpException(
          `ไม่สามารถดึงข้อมูล LINE Profile ได้: ${error.response.data?.message || error.response.statusText}`,
          error.response.status || HttpStatus.UNAUTHORIZED,
        );
      } else if (error.request) {
        throw new HttpException(
          'ไม่สามารถเชื่อมต่อกับ LINE API ได้',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      
      throw new HttpException(
        'เกิดข้อผิดพลาดในการดึงข้อมูล LINE Profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

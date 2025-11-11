import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository, DataSource, IsNull, Not } from 'typeorm';
import { Staff } from '../staff/entities/staff.entity';
import { LineUser } from './entities/line-user.entity';
import { LineProfile } from '../auth/entities/line-profile.entity';
import { CheckLineRegistrationDto } from './dto/check-line-registration.dto';
import { LinkStaffLineDto } from './dto/link-staff-line.dto';
import { SimpleLinkDto } from './dto/simple-link.dto';
import { AdminLinkDto } from './dto/admin-link.dto';
import axios from 'axios';

@Injectable()
export class LineIntegrationService {
  private readonly logger = new Logger(LineIntegrationService.name);

  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(LineUser)
    private lineUserRepository: Repository<LineUser>,
    @InjectRepository(LineProfile)
    private lineProfileRepository: Repository<LineProfile>,
    private jwtService: JwtService,
    private dataSource: DataSource,
  ) {}

  /**
   * ตรวจสอบการลงทะเบียน LINE
   * @param checkLineDto ข้อมูลการตรวจสอบ
   * @returns ผลการตรวจสอบว่ามีการลงทะเบียนหรือไม่ พร้อม JWT token
   */
  async checkLineRegistration(checkLineDto: CheckLineRegistrationDto) {
    try {
      const { lineUserId } = checkLineDto;

      // ตรวจสอบว่า lineUserId มีการเชื่อมโยงกับพนักงานหรือไม่ (ใช้ LineUser table)
      const lineUser = await this.lineUserRepository.findOne({
        where: { lineUserId },
        relations: ['staff', 'staff.brand'],
      });

      // ถ้าไม่พบการลงทะเบียน
      if (!lineUser || !lineUser.staffId) {
        return {
          registered: false,
          staffInfo: null,
        };
      }

      const staff = lineUser.staff;

      // พบการลงทะเบียน - Generate JWT token
      const payload = {
        sub: staff.id,
        id: staff.id,
        employeeCode: staff.employeeCode,
        lineUserId: lineUser.lineUserId,
        role: staff.role || 'staff',
        brandId: staff.brandId,
        brandCode: staff.brand?.code,
      };

      const token = this.jwtService.sign(payload);

      // Log token creation for debugging
      console.log('🔑 Token created for staff:', staff.employeeCode);
      console.log('📦 Token payload:', JSON.stringify(payload, null, 2));

      // Verify token can be decoded (for debugging)
      try {
        const decoded = this.jwtService.decode(token);
        console.log('✅ Token decoded successfully, keys:', Object.keys(decoded));
      } catch (err) {
        console.error('❌ Token decode failed:', err.message);
      }

      await this.lineUserRepository.update(lineUser.id, {
        
      });

      this.logger.log(`✅ LINE login successful for staff: ${staff.employeeCode} (${lineUser.lineUserId})`);

      return {
        registered: true,
        access_token: token,
        user: {
          id: staff.id,
          employeeCode: staff.employeeCode,
          fullName: staff.fullName,
          fullNameEn: staff.fullNameEn,
          brandId: staff.brandId,
          brandCode: staff.brand?.code,
          role: staff.role || 'staff',
          lineUserId: lineUser.lineUserId,
          lineDisplayName: lineUser.displayName,
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
      const { staffCode: employeeCode, lineUserId, lineAccessToken } = linkDto;

      // 1. ตรวจสอบว่า line user id นี้เชื่อมโยงกับพนักงานอื่นไปแล้วหรือไม่ (ใช้ LineUser table)
      const existingLineUser = await this.lineUserRepository.findOne({
        where: { lineUserId },
        relations: ['staff'],
      });

      if (existingLineUser && existingLineUser.staffId) {
        throw new HttpException(
          'LINE นี้ได้เชื่อมโยงกับพนักงานอื่นแล้ว',
          HttpStatus.CONFLICT,
        );
      }

      // 2. ตรวจสอบว่ามีพนักงานที่มีรหัสตามที่ระบุหรือไม่
      const staff = await this.staffRepository.findOne({
        where: { employeeCode },
        relations: ['brand'],
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

      // 5. บันทึกข้อมูลการเชื่อมโยงใน LineUser table
      if (existingLineUser) {
        // Update existing LineUser record
        existingLineUser.staffId = staff.id;
        existingLineUser.displayName = lineProfile.displayName;
        existingLineUser.pictureUrl = lineProfile.pictureUrl;
        await this.lineUserRepository.save(existingLineUser);
      } else {
        // Create new LineUser record
        const newLineUser = this.lineUserRepository.create({
          lineUserId: lineProfile.userId,
          staffId: staff.id,
          displayName: lineProfile.displayName,
          pictureUrl: lineProfile.pictureUrl,
          
        });
        await this.lineUserRepository.save(newLineUser);
      }

      this.logger.log(`เชื่อมโยง LINE สำเร็จ: Staff ${employeeCode} กับ LINE User ${lineUserId}`);

      return {
        success: true,
        message: 'เชื่อมโยง LINE กับพนักงานสำเร็จ',
        staffInfo: {
          id: staff.id,
          employeeCode: staff.employeeCode,
          fullName: staff.fullName,
          fullNameEn: staff.fullNameEn,
          brandId: staff.brandId,
          brandCode: staff.brand?.code,
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
      const { staffCode: employeeCode, lineUserId, lineDisplayName, linePictureUrl } = linkDto;

      console.log('📍 Simple Link Request:', {
        employeeCode,
        lineUserId,
        hasDisplayName: !!lineDisplayName,
        hasPictureUrl: !!linePictureUrl,
      });

      // 1. ตรวจสอบว่า line user id นี้เชื่อมโยงกับพนักงานอื่นไปแล้วหรือไม่ (ใช้ LineUser table)
      const existingLineUser = await this.lineUserRepository.findOne({
        where: { lineUserId },
        relations: ['staff'],
      });

      if (existingLineUser && existingLineUser.staffId) {
        const linkedStaff = existingLineUser.staff;
        console.log('❌ LINE already linked to:', linkedStaff.employeeCode);
        throw new HttpException(
          `LINE นี้ได้เชื่อมโยงกับพนักงาน ${linkedStaff.employeeCode} (${linkedStaff.fullName}) แล้ว`,
          HttpStatus.CONFLICT,
        );
      }

      // 2. ตรวจสอบว่ามีพนักงานที่มีรหัสตามที่ระบุหรือไม่
      const staff = await this.staffRepository.findOne({
        where: { employeeCode },
        relations: ['brand'],
      });

      if (!staff) {
        console.log('❌ Staff not found:', employeeCode);
        throw new HttpException(
          `ไม่พบข้อมูลพนักงานรหัส ${employeeCode}`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (staff.status !== 'active') {
        console.log('❌ Staff inactive:', employeeCode);
        throw new HttpException(
          'พนักงานไม่อยู่ในสถานะที่สามารถเชื่อมโยงได้',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. ตรวจสอบว่าพนักงานคนนี้เชื่อมโยง LINE อื่นอยู่หรือไม่
      const existingStaffLink = await this.lineUserRepository.findOne({
        where: { staffId: staff.id },
      });

      if (existingStaffLink && existingStaffLink.lineUserId !== lineUserId) {
        console.log('❌ Staff already linked to another LINE:', existingStaffLink.lineUserId);
        throw new HttpException(
          'พนักงานคนนี้ได้เชื่อมโยง LINE อื่นไว้แล้ว กรุณาติดต่อแอดมิน',
          HttpStatus.CONFLICT,
        );
      }

      // 4. บันทึกข้อมูลการเชื่อมโยงใน LineUser table
      if (existingLineUser) {
        // Update existing LineUser record
        existingLineUser.staffId = staff.id;
        if (lineDisplayName) existingLineUser.displayName = lineDisplayName;
        if (linePictureUrl) existingLineUser.pictureUrl = linePictureUrl;
        await this.lineUserRepository.save(existingLineUser);
      } else {
        // Create new LineUser record
        const newLineUser = this.lineUserRepository.create({
          lineUserId,
          staffId: staff.id,
          displayName: lineDisplayName || '',
          pictureUrl: linePictureUrl || '',
          
        });
        await this.lineUserRepository.save(newLineUser);
      }

      console.log('✅ Simple link successful:', employeeCode, '<->', lineUserId);

      // 5. สร้าง JWT token
      const payload = {
        sub: staff.id,
        id: staff.id,
        employeeCode: staff.employeeCode,
        lineUserId,
        role: staff.role || 'staff',
        brandId: staff.brandId,
        brandCode: staff.brand?.code,
      };

      const token = this.jwtService.sign(payload);

      this.logger.log(
        `✅ LINE linked successfully: Staff ${employeeCode} <-> LINE User ${lineUserId}`,
      );

      return {
        success: true,
        message: 'เชื่อมโยง LINE กับพนักงานสำเร็จ',
        access_token: token,
        staff: {
          id: staff.id,
          employeeCode: staff.employeeCode,
          fullName: staff.fullName,
          fullNameEn: staff.fullNameEn,
          brandId: staff.brandId,
          brandCode: staff.brand?.code,
          role: staff.role || 'staff',
          lineUserId,
          lineDisplayName: lineDisplayName || '',
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
  async getStaffById(staffId: number) {
    try {
      const staff = await this.staffRepository.findOne({
        where: { id: staffId },
        relations: ['brand'],
      });

      if (!staff) {
        throw new HttpException('ไม่พบข้อมูลพนักงาน', HttpStatus.NOT_FOUND);
      }

      // ดึงข้อมูล LINE จาก LineUser table
      const lineUser = await this.lineUserRepository.findOne({
        where: { staffId: staff.id },
      });

      return {
        id: staff.id,
        employeeCode: staff.employeeCode,
        fullName: staff.fullName,
        fullNameEn: staff.fullNameEn,
        brandId: staff.brandId,
        brandCode: staff.brand?.code,
        status: staff.status,
        lineInfo: lineUser
          ? {
              userId: lineUser.lineUserId,
              displayName: lineUser.displayName,
              pictureUrl: lineUser.pictureUrl,
              
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

  // ==================== ADMIN METHODS ====================

  /**
   * ดึงรายการ LINE users ที่ยังไม่ได้เชื่อมโยงกับพนักงาน (สำหรับแอดมิน)
   * @returns รายการ LINE users ที่ pending
   */
  async getPendingUsers() {
    try {
      console.log('📍 Admin: Getting pending LINE users');

      const pendingUsers = await this.lineUserRepository.find({
        where: { staffId: IsNull() },
        select: ['id', 'lineUserId', 'displayName', 'pictureUrl', 'createdAt'],
        order: { createdAt: 'DESC' },
      });

      console.log(`✅ Found ${pendingUsers.length} pending LINE users`);

      return {
        success: true,
        count: pendingUsers.length,
        users: pendingUsers.map((user) => ({
          line_user_id: user.lineUserId,
          display_name: user.displayName,
          picture_url: user.pictureUrl,
          created_at: user.createdAt,
        })),
      };
    } catch (error) {
      this.logger.error(`❌ Failed to get pending users: ${error.message}`);
      throw new HttpException(
        'เกิดข้อผิดพลาดในการดึงรายการ LINE users ที่รอเชื่อมโยง',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * ดึงรายการ LINE users ที่เชื่อมโยงกับพนักงานแล้ว (สำหรับแอดมิน)
   * @returns รายการ LINE users พร้อมข้อมูลพนักงาน
   */
  async getLinkedUsers() {
    try {
      console.log('📍 Admin: Getting linked LINE users');

      const linkedUsers = await this.lineUserRepository.find({
        where: { staffId: Not(IsNull()) },
        relations: ['staff'],
        select: {
          id: true,
          lineUserId: true,
          displayName: true,
          pictureUrl: true,
          createdAt: true,
          staffId: true,
        },
        order: { createdAt: 'DESC' },
      });

      console.log(`✅ Found ${linkedUsers.length} linked LINE users`);

      return {
        success: true,
        count: linkedUsers.length,
        users: linkedUsers.map((user) => ({
          line_user_id: user.lineUserId,
          display_name: user.displayName,
          picture_url: user.pictureUrl,
          created_at: user.createdAt,
          staff: user.staff
            ? {
                staff_id: user.staff.id,
                employee_code: user.staff.employeeCode,
                full_name: user.staff.fullName,
                full_name_en: user.staff.fullNameEn,
                brand_id: user.staff.brandId,
              }
            : null,
        })),
      };
    } catch (error) {
      this.logger.error(`❌ Failed to get linked users: ${error.message}`);
      throw new HttpException(
        'เกิดข้อผิดพลาดในการดึงรายการ LINE users ที่เชื่อมโยงแล้ว',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * เชื่อมโยง LINE user กับพนักงานโดยแอดมิน (ใช้ transaction)
   * @param adminLinkDto ข้อมูลการเชื่อมโยง
   * @returns ผลการเชื่อมโยง
   */
  async adminLinkUser(adminLinkDto: AdminLinkDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { lineUserId, staffId } = adminLinkDto;

      console.log('📍 Admin: Linking LINE user to staff');
      console.log(`🔍 LINE User ID: ${lineUserId}`);
      console.log(`🔍 Staff ID: ${staffId}`);

      // 1. ตรวจสอบว่า LINE user มีอยู่ในระบบ
      const lineUser = await queryRunner.manager.findOne(LineUser, {
        where: { lineUserId },
      });

      if (!lineUser) {
        throw new HttpException(
          `ไม่พบ LINE user: ${lineUserId}`,
          HttpStatus.NOT_FOUND,
        );
      }

      // 2. ตรวจสอบว่า LINE user ยังไม่ได้เชื่อมโยงกับพนักงานอื่น
      if (lineUser.staffId) {
        const existingStaff = await queryRunner.manager.findOne(Staff, {
          where: { id: lineUser.staffId },
        });
        if (existingStaff) {
          throw new HttpException(
            `LINE user นี้ได้เชื่อมโยงกับพนักงาน ${existingStaff.employeeCode} (${existingStaff.fullName}) แล้ว`,
            HttpStatus.CONFLICT,
          );
        }
      }

      // 3. ตรวจสอบว่าพนักงานมีอยู่จริง
      const staff = await queryRunner.manager.findOne(Staff, {
        where: { id: staffId },
        relations: ['brand'],
      });

      if (!staff) {
        throw new HttpException(
          `ไม่พบพนักงาน ID: ${staffId}`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (staff.status !== 'active') {
        throw new HttpException(
          'พนักงานไม่อยู่ในสถานะ active ไม่สามารถเชื่อมโยงได้',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 4. ตรวจสอบว่าพนักงานยังไม่ได้เชื่อมโยงกับ LINE อื่น
      const existingStaffLink = await queryRunner.manager.findOne(LineUser, {
        where: { staffId },
      });

      if (existingStaffLink && existingStaffLink.lineUserId !== lineUserId) {
        throw new HttpException(
          `พนักงาน ${staff.employeeCode} ได้เชื่อมโยงกับ LINE อื่นแล้ว (${existingStaffLink.lineUserId})`,
          HttpStatus.CONFLICT,
        );
      }

      // 5. อัปเดตตาราง line_users
      await queryRunner.manager.update(LineUser, { lineUserId }, {
        staffId,
        
      });

      // 7. สร้างหรืออัปเดตตาราง line_profiles
      const existingProfile = await queryRunner.manager.findOne(LineProfile, {
        where: { lineUserId },
      });

      if (existingProfile) {
        await queryRunner.manager.update(
          LineProfile,
          { lineUserId },
          {
            displayName: lineUser.displayName,
            pictureUrl: lineUser.pictureUrl,
            
          },
        );
      } else {
        const newProfile = queryRunner.manager.create(LineProfile, {
          lineUserId: lineUserId,
          displayName: lineUser.displayName,
          pictureUrl: lineUser.pictureUrl,
          
        });
        await queryRunner.manager.save(newProfile);
      }

      // 8. Commit transaction
      await queryRunner.commitTransaction();

      console.log(
        `✅ Admin link successful: ${staff.employeeCode} <-> ${lineUserId}`,
      );

      this.logger.log(
        `✅ Admin linked LINE user ${lineUserId} to staff ${staff.employeeCode}`,
      );

      return {
        success: true,
        message: 'เชื่อมโยง LINE กับพนักงานสำเร็จ',
        data: {
          line_user_id: lineUserId,
          staff: {
            staff_id: staff.id,
            employee_code: staff.employeeCode,
            full_name: staff.fullName,
            full_name_en: staff.fullNameEn,
            brand_id: staff.brandId,
            brand_code: staff.brand?.code,
          },
        },
      };
    } catch (error) {
      // Rollback transaction
      await queryRunner.rollbackTransaction();

      this.logger.error(`❌ Admin link failed: ${error.message}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'เกิดข้อผิดพลาดในการเชื่อมโยง LINE กับพนักงาน',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * ยกเลิกการเชื่อมโยง LINE user กับพนักงาน (สำหรับแอดมิน)
   * @param lineUserId LINE User ID ที่ต้องการยกเลิกการเชื่อมโยง
   * @returns ผลการยกเลิกการเชื่อมโยง
   */
  async unlinkUser(lineUserId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('📍 Admin: Unlinking LINE user from staff');
      console.log(`🔍 LINE User ID: ${lineUserId}`);

      // 1. ค้นหา LINE user
      const lineUser = await queryRunner.manager.findOne(LineUser, {
        where: { lineUserId },
      });

      if (!lineUser) {
        throw new HttpException(
          `ไม่พบ LINE user: ${lineUserId}`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (!lineUser.staffId) {
        throw new HttpException(
          'LINE user นี้ยังไม่ได้เชื่อมโยงกับพนักงาน',
          HttpStatus.BAD_REQUEST,
        );
      }

      const staffId = lineUser.staffId;

      // 2. ค้นหาข้อมูลพนักงานเพื่อ logging
      const staff = await queryRunner.manager.findOne(Staff, {
        where: { id: staffId },
      });

      // 3. ยกเลิกการเชื่อมโยงในตาราง line_users (set staffId เป็น null)
      await queryRunner.manager.update(
        LineUser,
        { lineUserId },
        { staffId: null as any },
      );

      // 4. ลบข้อมูลใน line_profiles (optional - ถ้าต้องการเก็บ history ไว้ให้ comment ออก)
      await queryRunner.manager.delete(LineProfile, { lineUserId });

      // 5. Commit transaction
      await queryRunner.commitTransaction();

      console.log(
        `✅ Admin unlink successful: ${staff?.employeeCode || staffId} <-> ${lineUserId}`,
      );

      this.logger.log(
        `✅ Admin unlinked LINE user ${lineUserId} from staff ${staff?.employeeCode || staffId}`,
      );

      return {
        success: true,
        message: 'ยกเลิกการเชื่อมโยง LINE กับพนักงานสำเร็จ',
        data: {
          line_user_id: lineUserId,
          staff: staff
            ? {
                staff_id: staff.id,
                employee_code: staff.employeeCode,
                full_name: staff.fullName,
                full_name_en: staff.fullNameEn,
              }
            : null,
        },
      };
    } catch (error) {
      // Rollback transaction
      await queryRunner.rollbackTransaction();

      this.logger.error(`❌ Admin unlink failed: ${error.message}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'เกิดข้อผิดพลาดในการยกเลิกการเชื่อมโยง',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}

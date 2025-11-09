import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LineAuthService } from '../services/line-auth.service';
import { LineLoginDto } from '../dto/line-login.dto';
import { AuthResponse } from '../interfaces/auth-response.interface';

@ApiTags('Authentication')
@Controller('/auth')
export class LineAuthController {
  constructor(private readonly lineAuthService: LineAuthService) {}

  @Post('line-login')
  @ApiOperation({ summary: 'เข้าสู่ระบบผ่าน LINE' })
  @ApiResponse({
    status: 200,
    description: 'เข้าสู่ระบบสำเร็จ หรือ LINE user ยังไม่ได้เชื่อมโยงกับพนักงาน (ส่ง error: STAFF_NOT_LINKED)',
  })
  @ApiResponse({
    status: 401,
    description: 'LINE Token ไม่ถูกต้อง',
  })
  @ApiResponse({
    status: 400,
    description: 'ข้อมูลไม่ถูกต้อง',
  })
  async lineLogin(@Body() lineLoginDto: LineLoginDto): Promise<AuthResponse> {
    try {
      console.log('📍 POST /auth/line-login');
      const result = await this.lineAuthService.lineLogin(lineLoginDto);

      // ตรวจสอบว่าเป็น STAFF_NOT_LINKED response หรือไม่
      if ((result as any).error === 'STAFF_NOT_LINKED') {
        console.log('⚠️ LINE user not linked to staff');
        return result; // ส่งกลับไปโดยไม่ throw error
      }

      console.log('✅ LINE login successful');
      return result;
    } catch (error) {
      console.error('❌ LINE login error:', error.message);

      if (error.status === HttpStatus.UNAUTHORIZED) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException(
        'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

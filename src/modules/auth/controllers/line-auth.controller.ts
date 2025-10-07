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
    description: 'เข้าสู่ระบบสำเร็จ'
  })
  @ApiResponse({
    status: 401,
    description: 'ไม่พบการเชื่อมโยงบัญชี LINE กับพนักงาน'
  })
  @ApiResponse({
    status: 400,
    description: 'ข้อมูลไม่ถูกต้อง'
  })
  async lineLogin(@Body() lineLoginDto: LineLoginDto): Promise<AuthResponse> {
    try {
      return await this.lineAuthService.lineLogin(lineLoginDto);
    } catch (error) {
      if (error.status === HttpStatus.UNAUTHORIZED) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException(
        'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

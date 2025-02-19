import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  HttpException  // เพิ่ม import นี้
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
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
    @Body() loginDto: { username: string; password: string }
  ) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      throw new HttpException(
        'รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}

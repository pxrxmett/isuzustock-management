import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
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
}

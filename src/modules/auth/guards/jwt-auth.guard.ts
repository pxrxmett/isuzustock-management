import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // เรียกใช้ AuthGuard เดิม
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // ถ้ามีข้อผิดพลาดหรือไม่พบผู้ใช้ จะโยนข้อผิดพลาด
    if (err || !user) {
      throw err || new UnauthorizedException('ไม่ได้รับอนุญาตให้เข้าถึง');
    }
    return user;
  }
}

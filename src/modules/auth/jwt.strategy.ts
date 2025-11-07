import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from './auth.interface';
import { Staff } from '../staff/entities/staff.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    console.log('🔍 JWT validate called');
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    console.log('🔑 Secret configured:', jwtSecret ? `${jwtSecret.substring(0, 10)}...` : 'NOT SET');

    // Support LINE authentication tokens (have sub/id but no username)
    const userId = payload.sub || payload.id;

    if (!userId) {
      console.error('❌ No user ID in payload');
      throw new UnauthorizedException('Invalid token: missing user ID');
    }

    // Look up staff from database with explicit column selection
    const staff = await this.staffRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'staffCode',
        'firstName',
        'lastName',
        'role',
        'status',
        'lineUserId',
        'department',
        'position',
        'email',
        'phone',
      ],
    });

    if (!staff) {
      console.error('❌ Staff not found with ID:', userId);
      throw new UnauthorizedException('User not found');
    }

    if (staff.status !== 'active') {
      console.error('❌ Staff inactive:', staff.staffCode);
      throw new UnauthorizedException('User is inactive');
    }

    console.log('✅ Staff validated:', staff.staffCode);

    // Return staff object that will be available as req.user
    return {
      id: staff.id,
      staffCode: staff.staffCode,
      firstName: staff.firstName,
      lastName: staff.lastName,
      role: staff.role,
      department: staff.department,
      position: staff.position,
      lineUserId: staff.lineUserId,
      email: staff.email,
      phone: staff.phone,
      status: staff.status,
    };
  }
}

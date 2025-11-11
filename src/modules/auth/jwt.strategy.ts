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
        'employeeCode',
        'fullName',
        'fullNameEn',
        'brandId',
        'role',
        'status',
        'email',
        'phone',
        'avatar',
      ],
      relations: ['brand'], // Include brand relation to get brand code
    });

    if (!staff) {
      console.error('❌ Staff not found with ID:', userId);
      throw new UnauthorizedException('User not found');
    }

    if (staff.status !== 'active') {
      console.error('❌ Staff inactive:', staff.employeeCode);
      throw new UnauthorizedException('User is inactive');
    }

    console.log('✅ Staff validated:', staff.employeeCode);

    // Return staff object that will be available as req.user
    return {
      id: staff.id,
      employeeCode: staff.employeeCode,
      fullName: staff.fullName,
      fullNameEn: staff.fullNameEn,
      brandId: staff.brandId,
      brandCode: staff.brand?.code, // Get brand code from relation
      role: staff.role,
      status: staff.status,
      email: staff.email,
      phone: staff.phone,
      avatar: staff.avatar,
    };
  }
}

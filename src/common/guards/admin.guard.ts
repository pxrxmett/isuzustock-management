import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * AdminGuard
 *
 * Purpose: Restrict access to admin-only endpoints
 *
 * How it works:
 * 1. Checks if user is authenticated (user object exists in request)
 * 2. Validates that user.role === 'admin'
 * 3. Throws ForbiddenException if user is not an admin
 * 4. Throws UnauthorizedException if user is not authenticated
 *
 * Usage:
 * @UseGuards(JwtAuthGuard, AdminGuard)  // Note: JwtAuthGuard must come first
 * @Controller('admin/staff')
 * export class AdminStaffController {
 *   // Only admin users can access these endpoints
 * }
 *
 * Important: This guard should ALWAYS be used with JwtAuthGuard
 * because it requires the user object to be populated by JWT authentication.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user is authenticated
    if (!user) {
      throw new UnauthorizedException(
        'Authentication required. Please login first.',
      );
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Access denied. This endpoint requires admin privileges.',
      );
    }

    return true;
  }
}
